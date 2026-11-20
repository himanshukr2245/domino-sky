import { Button } from '@/components/ui';
import { isOperated } from '@/lib/simulation/simulate';
import { NETWORK } from '@/lib/simulation/network';
import { causeChain, turnaroundDetail } from '@/lib/simulation/inspect';
import { formatTime } from '@/lib/simulation/time';
import type { FlightProjection, SimulationResult } from '@/types/contracts/generated';

export function FlightInspector({ result, selected, onSelect }: {
  result: SimulationResult; selected: FlightProjection; onSelect: (flightId: string) => void;
}) {
  const crew = result.crews.find(item => item.flightIds.includes(selected.id))!;
  const chain = causeChain(result, selected.id);
  const turn = turnaroundDetail(NETWORK, result, selected.id);
  const connections = result.connections.filter(item => item.fromFlight === selected.id || item.toFlight === selected.id);

  return (
    <aside className="ds-panel ds-inspector" aria-labelledby="inspector-heading" data-testid="flight-inspector">
      <div className="ds-panel-heading"><p className="ds-eyebrow">FLIGHT INSPECTOR</p><span className={selected.arrivalDelay ? 'ds-inspection-status ds-inspection-delayed' : 'ds-inspection-status'}>{selected.status === 'cancelled' ? 'Cancelled' : selected.arrivalDelay ? `+${selected.arrivalDelay} min` : 'On time'}</span></div>
      <h2 id="inspector-heading" tabIndex={-1} className="ds-inspector-id">{selected.id}<span>{selected.origin} / {selected.destination}</span></h2>
      <p className="ds-inspector-tail">{selected.tailId} <span>·</span> Leg {selected.legOrder} <span>·</span> {selected.pax} boardings</p>
      <div className="ds-time-comparison">
        <div><p>Scheduled</p><strong>{formatTime(selected.scheduledDeparture)}</strong><span>{formatTime(selected.scheduledArrival)} arrival</span></div>
        <div><p>Projected</p><strong>{isOperated(selected) ? formatTime(selected.actualDeparture) : 'Cancelled'}</strong><span>{isOperated(selected) ? formatTime(selected.actualArrival) + ' arrival' : 'No operated arrival'}</span></div>
      </div>
      <section className="ds-inspector-section" aria-label="Recorded delay causes">
        <h3 className="ds-eyebrow">WHY THIS FLIGHT MOVED</h3>
        {selected.causes.length ? (
          <ol className="ds-causes">
            {selected.causes.map((cause, index) => (
              <li key={index}>
                <strong>+{cause.minutes} min</strong>
                <span>{cause.kind === 'recovery-hold' ? 'Departure deliberately held for passenger recovery.' : cause.kind === 'late-crew' ? 'Waiting for the original crew after its inbound flight.' : cause.kind === 'spare-availability' ? 'Waiting until the supplied spare becomes available.' : cause.kind === 'late-aircraft' ? `Aircraft arriving late from ${cause.relatedFlightId}; minimum turnaround still required.` : cause.kind === 'destination-closure' ? `${cause.airport} arrival held on the ground until reopening.` : `${cause.airport} departure held until reopening.`}</span>
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-fg-muted">{selected.status === 'cancelled' ? 'This leg is canceled; aircraft and crew remain at their last operated airport.' : 'The scheduled departure remains feasible.'}</p>}
      </section>
      {chain.length > 1 && (
        <section className="ds-inspector-section" aria-label="Delay cause chain">
          <h3 className="ds-eyebrow">FOLLOW THE RIPPLE</h3>
          <ol className="ds-cause-chain">
            {chain.map((flight, index) => (
              <li key={flight.id}>
                <Button variant="plain" size="none" sound="none" latencyMode="none" className={`ds-chain-flight ${flight.id === selected.id ? 'ds-chain-selected' : ''}`} onClick={() => onSelect(flight.id)} aria-label={`Trace ${flight.id} delay cause`}>
                  <span className="font-mono">{flight.id}</span><span>+{flight.arrivalDelay}m</span>
                </Button>
                {index < chain.length - 1 && <span className="ds-chain-connector" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </section>
      )}
      {turn && (
        <section className="ds-inspector-section" aria-label="Turnaround slack accounting">
          <h3 className="ds-eyebrow">THE BUFFER BETWEEN FLIGHTS</h3>
          <dl className="ds-accounting">
            <div><dt>Scheduled spare ground time</dt><dd>{turn.scheduledSlack} min</dd></div>
            <div><dt>Inbound delay absorbed</dt><dd>{turn.absorbedMinutes} min</dd></div>
            <div><dt>Delay inherited from aircraft</dt><dd>{turn.inheritedMinutes} min</dd></div>
            <div><dt>Projected ground time</dt><dd>{turn.availableMinutes} min</dd></div>
          </dl>
          <p className="ds-inspection-note">The required {NETWORK.minTurnaroundMinutes}-minute turnaround is always preserved.</p>
        </section>
      )}
      <details className="ds-inspector-connections">
        <summary>Passenger connections <span>{connections.length}</span></summary>
        {connections.length ? connections.map(connection => (
          <div key={connection.id} className="ds-inspector-connection">
            <strong>{connection.id} · {connection.passengers} passengers</strong>
            <span>{connection.fromFlight} / {connection.toFlight}</span>
            <span>{connection.availableMinutes === undefined ? 'A required flight is canceled' : connection.availableMinutes + ' min available / ' + connection.minimumMinutes + ' min required'}</span>
            <span className={connection.missed ? 'text-danger' : 'text-cyan-fg'}>{connection.reason === 'flight-cancelled' ? 'Connection lost to cancellation' : connection.missed ? `Missed · ${connection.shortfallMinutes} min short` : 'Connection intact'}</span>
          </div>
        )) : <p className="text-sm text-fg-muted">No supplied connection groups use this flight.</p>}
      </details>
      <div className="ds-crew-summary">
        <p>{crew.id} · {selected.tailId}</p>
        <strong className={crew.excessMinutes ? 'text-danger' : 'text-fg'}>{crew.dutyMinutes} / {crew.limitMinutes} min duty</strong>
        <div className="ds-duty-track" role="img" aria-label={`${crew.id} duty ${crew.dutyMinutes} minutes, limit ${crew.limitMinutes} minutes`}><span className={crew.excessMinutes ? 'ds-duty-over' : ''} style={{ width: `${Math.min(100, crew.dutyMinutes / crew.limitMinutes * 100)}%` }} /></div>
        <span>{crew.excessMinutes ? `${crew.excessMinutes} min over limit · projected roster is infeasible` : `${crew.slackMinutes} min remaining duty slack`}</span>
        <span className="ds-inspection-note">Duty {formatTime(crew.dutyStart)}–{formatTime(crew.dutyEnd)} IST</span>
      </div>
    </aside>
  );
}
