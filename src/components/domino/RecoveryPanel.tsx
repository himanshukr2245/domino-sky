import { Button } from '@/components/ui';
import { formatTime } from '@/lib/simulation/time';
import type { RecoveryResponse, SimulationResult } from '@/types/contracts/generated';

export function RecoveryPanel({ response, disrupted, previewId, appliedId, onPreview, onApply, onUndo, onAdvice, busy, notice }: {
  response: RecoveryResponse; disrupted: SimulationResult; previewId?: string; appliedId?: string;
  onPreview: (id: string) => void; onApply: (id: string) => void; onUndo: () => void; onAdvice: () => void;
  busy: boolean; notice: string;
}) {
  const selected = response.candidates.find(candidate => candidate.id === (previewId ?? appliedId ?? response.recommendedId))!;
  const before = disrupted.metrics, after = selected.result.metrics;
  const rows = [
    { label: 'Arrival delay', before: before.totalArrivalDelay, after: after.totalArrivalDelay, unit: 'flight min' },
    { label: 'Passengers missing connections', before: before.missedConnectionPassengers, after: after.missedConnectionPassengers, unit: 'group passengers' },
    { label: 'Crew duty breaches', before: before.crewBreaches, after: after.crewBreaches, unit: 'rosters' },
    { label: 'Canceled boardings', before: before.cancelledBoardings, after: after.cancelledBoardings, unit: 'flight boardings' },
  ];
  return (
    <section className="ds-panel ds-recovery" aria-labelledby="recovery-heading" id="recovery">
      <div className="ds-list-header"><div><p className="ds-eyebrow">REWIND TO RECOVER</p><h2 id="recovery-heading" className="ds-section-title">Change the outcome. Keep the evidence.</h2><p className="text-sm text-fg-muted">Every plan is recalculated against aircraft location, crew availability and the closure.</p></div><span className="ds-tag">{response.adviserMode === 'gemini' ? 'GEMINI · VERIFIED FACTS' : 'RULES-BASED RECOMMENDATION'}</span></div>
      <div className="ds-recovery-layout">
        <div className="ds-candidates" aria-label="Evaluated recovery plans">
          {response.candidates.map(candidate => (
            <Button key={candidate.id} variant="plain" size="none" sound="none" latencyMode="none" className="ds-candidate" aria-pressed={selected.id === candidate.id} aria-label={'Preview plan: ' + candidate.title} onClick={() => onPreview(candidate.id)}>
              <span className="ds-candidate-top"><strong>{candidate.title}</strong><span>{candidate.feasible ? 'Feasible' : 'Crew limits unresolved'}</span></span>
              <span>{candidate.result.metrics.cancelledBoardings} canceled boardings · {candidate.result.metrics.missedConnectionPassengers} missed-connection passengers · {candidate.result.metrics.totalArrivalDelay} delay min</span>
              {candidate.id === response.recommendedId && <small>Recommended among evaluated plans</small>}
            </Button>
          ))}
          <Button variant="secondary" sound="none" disabled={busy} onClick={onAdvice}>{busy ? 'Checking with Gemini…' : 'Ask Gemini to review'}</Button>
          <p role="status" aria-live="polite" className="ds-advice-note">{notice || (response.adviserMode === 'gemini' ? 'Gemini selected a verified candidate. All displayed quantities are computed by the simulator.' : 'The current recommendation uses deterministic rules. Gemini is requested only when you choose to review.')}</p>
        </div>
        <div className="ds-recovery-detail">
          <div className="ds-recovery-selected"><div><p className="ds-eyebrow">{previewId ? 'PREVIEWING' : appliedId ? 'APPLIED PLAN' : 'RECOMMENDED PLAN'}</p><h3>{selected.title}</h3></div><span className={selected.feasible ? 'text-cyan-fg' : 'text-danger'}>{selected.feasible ? 'Constraints satisfied' : 'Unresolved constraints'}</span></div>
          <div className="ds-comparison-scroll" role="region" aria-label="Recovery impact comparison" tabIndex={0}><table className="ds-comparison"><caption className="sr-only">Disrupted schedule compared with the selected recovery</caption><thead><tr><th scope="col">Impact</th><th scope="col">Disrupted</th><th scope="col">Recovery</th><th scope="col">Change</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}<small>{row.unit}</small></th><td>{row.before}</td><td>{row.after}</td><td className={row.after < row.before ? 'text-cyan-fg' : row.after > row.before ? 'text-danger' : ''}>{row.after - row.before > 0 ? '+' : ''}{row.after - row.before}</td></tr>)}</tbody></table></div>
          <ol className="ds-recovery-actions">{selected.actions.length ? selected.actions.map((action, index) => <li key={index}>{action.kind === 'swap' ? 'Assign spare ' + action.spareTailId + ' from ' + action.flightId + ' through the remaining rotation.' : action.kind === 'hold' ? 'Hold ' + action.flightId + ' until ' + formatTime(action.holdUntilMinute!) + ' IST.' : 'Cancel ' + action.flightId + '; account for its passengers and aircraft location.'}</li>) : <li>Keep the existing schedule without intervention.</li>}</ol>
          <div className="ds-adviser-reasons"><h4 className="ds-eyebrow">WHY THIS PLAN</h4><ul>{response.reasonCodes.map(code => <li key={code}>{code === 'PROTECT_CREW' ? 'The selected plan leaves ' + after.crewBreaches + ' crew rosters over their duty limit.' : code === 'LIMIT_CANCELLATIONS' ? 'It cancels ' + after.cancelledFlights + ' flights, affecting ' + after.cancelledBoardings + ' boardings.' : code === 'PROTECT_CONNECTIONS' ? 'It leaves ' + after.missedConnectionPassengers + ' passengers in failed connection groups.' : code === 'REDUCE_DELAY' ? 'Arrival delay changes from ' + before.totalArrivalDelay + ' to ' + after.totalArrivalDelay + ' flight minutes.' : 'The comparison uses the same operating day and closure.'}</li>)}</ul></div>
          {selected.issues.length > 0 && <ul className="ds-recovery-issues">{selected.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
          <div className="ds-recovery-buttons"><Button variant="cyber-solid" font="sans" sound="none" disabled={!selected.feasible || appliedId === selected.id && !previewId} onClick={() => onApply(selected.id)}>Apply recovery</Button>{(previewId || appliedId) && <Button variant="secondary" sound="none" onClick={onUndo}>{appliedId ? 'Undo recovery' : 'Discard preview'}</Button>}</div>
          <p className="ds-inspection-note">Changing aircraft requires a {selected.result.policy.crewTransferMinutes}-minute crew transfer buffer, an explicit model assumption. Aircraft retain the supplied 30-minute turnaround. No reserve crew or ferry is invented.</p>
          <details className="ds-receipt"><summary>Calculation details</summary><p>Plan {selected.id} · {response.scenarioKey}</p><p>Priority: feasibility, canceled boardings, failed-connection passengers, passenger delay, then intervention count. This compares the evaluated plans, without claiming a global optimum.</p><p>{selected.result.metrics.operatedFlights} operated flights · {selected.result.metrics.cancelledFlights} canceled flights. Passenger boardings and connection counts are separate measures.</p></details>
        </div>
      </div>
    </section>
  );
}
