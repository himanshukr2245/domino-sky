'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui';
import { NETWORK } from '@/lib/simulation/network';
import { simulate, validateClosure } from '@/lib/simulation/simulate';
import { buildRecovery } from '@/lib/simulation/recover';
import { adviserDecisionSchema, type SavedScenario } from '@/lib/recovery-boundary';
import { formatTime, parseTime } from '@/lib/simulation/time';
import type { AirportClosure, RecoveryResponse } from '@/types/contracts/generated';
import { NetworkMap } from './NetworkMap';
import { ScenarioControls, type ScenarioDraft } from './ScenarioControls';
import { ImpactSummary } from './ImpactSummary';
import { FlightInspector } from './FlightInspector';
import { AircraftTimeline } from './AircraftTimeline';
import { FlightList } from './FlightList';
import { PeoplePanel } from './PeoplePanel';
import { RecoveryPanel } from './RecoveryPanel';
import { SavedScenarios } from './SavedScenarios';

export function Cockpit({ home = false }: { home?: boolean }) {
  const [draft, setDraft] = useState<ScenarioDraft>({ airport: 'BOM', start: '14:30', duration: '90' });
  const [closure, setClosure] = useState<AirportClosure>();
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('DS0302');
  const [airportFocus, setAirportFocus] = useState<string>();
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [previewId, setPreviewId] = useState<string>();
  const [appliedId, setAppliedId] = useState<string>();
  const [decision, setDecision] = useState<Omit<RecoveryResponse, 'candidates'>>();
  const [adviceBusy, setAdviceBusy] = useState(false), [adviceNotice, setAdviceNotice] = useState('');
  const revision = useRef(0), adviceAbort = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => adviceAbort.current?.abort(), []);
  const disrupted = useMemo(() => simulate(NETWORK, closure), [closure]);
  const localRecovery = useMemo(() => closure ? buildRecovery(NETWORK, closure) : undefined, [closure]);
  const recovery = localRecovery ? { ...localRecovery, ...(decision?.scenarioKey === localRecovery.scenarioKey ? decision : {}) } : undefined;
  const chosen = recovery?.candidates.find(candidate => candidate.id === (previewId ?? appliedId));
  const result = chosen?.result ?? disrupted;
  const selected = result.flights.find(flight => flight.id === selectedId)!;
  const dutyRisk = new Set(result.crews.filter(crew => crew.excessMinutes > 0).flatMap(crew => crew.flightIds));
  const draftChanged = closure && (closure.airport !== draft.airport || formatTime(closure.start) !== draft.start || closure.end - closure.start !== Number(draft.duration));
  const search = query.trim().toUpperCase();
  const flights = result.flights.filter(flight =>
    (!airportFocus || flight.origin === airportFocus || flight.destination === airportFocus) &&
    (status === 'all' || status === 'delayed' && flight.arrivalDelay > 0 || status === 'crew' && dutyRisk.has(flight.id) || status === 'cancelled' && flight.status === 'cancelled') &&
    (!search || `${flight.id} ${flight.tailId} ${flight.origin} ${flight.destination}`.includes(search))
  );

  function clearFilters() { setAirportFocus(undefined); setStatus('all'); setQuery(''); }

  function invalidateAdvice() { revision.current++; adviceAbort.current?.abort(); setAdviceBusy(false); setDecision(undefined); setAdviceNotice(''); }
  function clearRecovery() { invalidateAdvice(); setPreviewId(undefined); setAppliedId(undefined); }

  async function askAdvice() {
    if (!closure || !localRecovery || adviceBusy) return;
    const requestRevision = ++revision.current;
    adviceAbort.current?.abort(); const controller = new AbortController(); adviceAbort.current = controller;
    setAdviceBusy(true); setAdviceNotice('Reviewing the verified candidate facts with Gemini.');
    try {
      const response = await fetch('/api/recovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ closure }), signal: controller.signal });
      if (!response.ok) throw new Error();
      const parsed = adviserDecisionSchema.safeParse(await response.json());
      if (!parsed.success || parsed.data.scenarioKey !== localRecovery.scenarioKey || !localRecovery.candidates.some(candidate => candidate.id === parsed.data.recommendedId && candidate.feasible)) throw new Error();
      if (requestRevision !== revision.current) return;
      setDecision(parsed.data);
      setAdviceNotice(parsed.data.adviserMode === 'gemini' ? 'Gemini reviewed the candidates. The selected plan and every displayed quantity are verified against the simulator.' : parsed.data.providerStatus === 'not-configured' ? 'Gemini is not configured. The recommendation remains explicitly rules-based.' : 'Gemini is unavailable or its quota is not ready. The verified rules-based recommendation remains available.');
    } catch { if (requestRevision === revision.current) setAdviceNotice('The AI review could not be completed. The verified rules-based plans remain available.'); }
    finally { if (requestRevision === revision.current) setAdviceBusy(false); }
  }

  function applyRecovery(id: string) {
    if (!recovery?.candidates.some(candidate => candidate.id === id && candidate.feasible)) return;
    revision.current++; adviceAbort.current?.abort(); setAdviceBusy(false);
    setAppliedId(id); setPreviewId(undefined); clearFilters(); setAdviceNotice('Recovery applied. The comparison preserves the original disruption.');
  }

  function loadSaved(saved: SavedScenario) {
    const restored = validateClosure(NETWORK, { airport: saved.airport, start: saved.start_minute, end: saved.end_minute });
    clearRecovery(); clearFilters(); setClosure(restored); setDraft({ airport: restored.airport, start: formatTime(restored.start), duration: String(restored.end - restored.start) });
    if (saved.candidate_id && buildRecovery(NETWORK, restored).candidates.some(candidate => candidate.id === saved.candidate_id && candidate.feasible)) setAppliedId(saved.candidate_id);
  }

  function selectFlight(flightId: string) {
    const flight = result.flights.find(item => item.id === flightId);
    if (!flight) return;
    setSelectedId(flightId);
    if (airportFocus && flight.origin !== airportFocus && flight.destination !== airportFocus) setAirportFocus(undefined);
    if (status === 'delayed' && !flight.arrivalDelay || status === 'crew' && !dutyRisk.has(flightId)) setStatus('all');
    if (search && !`${flight.id} ${flight.tailId} ${flight.origin} ${flight.destination}`.includes(search)) setQuery('');
  }

  function focusAirport(airport?: string) {
    setAirportFocus(airport);
    if (airport && selected.origin !== airport && selected.destination !== airport) {
      const matching = result.flights.filter(flight => flight.origin === airport || flight.destination === airport);
      const next = matching.find(flight => flight.arrivalDelay > 0) ?? matching[0];
      if (next) setSelectedId(next.id);
    }
    setStatus('all'); setQuery('');
  }

  function run() {
    try {
      const duration = Number(draft.duration);
      if (!Number.isSafeInteger(duration) || duration < 1 || duration > 1440) throw new Error('Choose a duration from 1 to 1,440 minutes.');
      const start = parseTime(draft.start);
      const next = validateClosure(NETWORK, { airport: draft.airport, start, end: start + duration });
      const projected = simulate(NETWORK, next);
      const firstAffected = projected.flights.find(flight => flight.arrivalDelay > 0);
      clearRecovery(); setClosure(next); setSelectedId(firstAffected?.id ?? selectedId); setError(''); clearFilters();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Check your closure settings.'); }
  }

  function reset() { clearRecovery(); setClosure(undefined); setError(''); setSelectedId('DS0302'); clearFilters(); }

  return (
    <div className={`ds-workspace ${home ? 'ds-home' : 'ds-operations'}`}>
      <section className="ds-intro" aria-labelledby="cockpit-title">
        <div><p className="ds-eyebrow"><span className="ds-intro-mark" />DOMINO SKY / NETWORK OPERATIONS</p><h1 id="cockpit-title" className="ds-title">{home ? 'Domino Sky' : 'Operations cockpit'}</h1><p className="ds-subtitle">One closure.<span> A network of consequences.</span></p><p className="ds-intro-copy">See how disruption travels. Trace every delay back to its cause.</p></div>
        <div className="ds-intro-side"><span className="ds-network-count"><strong>{NETWORK.airports.length}</strong> airports <span>/</span> <strong>{NETWORK.flights.length}</strong> flights <span>/</span> <strong>{NETWORK.crews.length}</strong> crews</span>{home ? <ButtonLink href="/app" variant="cyber-solid" font="sans" size="lg" sound="none">Open cockpit</ButtonLink> : <Button variant="secondary" font="sans" sound="none" onClick={reset}>Reset to baseline</Button>}</div>
      </section>
      <div className="ds-operating-state" role="status" aria-live="polite" data-testid="scenario-status">
        <span className={closure ? 'ds-state ds-state-disrupted' : 'ds-state'}><span aria-hidden="true" />{previewId ? 'Recovery preview' : appliedId ? 'Recovery applied' : closure ? 'Disruption projected' : 'Baseline schedule'}</span>
        <span>{closure ? `${closure.airport} closed ${formatTime(closure.start)}–${formatTime(closure.end)} IST` : 'Choose an airport and a closure window to begin.'}</span>
        {draftChanged && <strong>Inputs changed · run to update</strong>}
        <span className="ds-state-provenance">SUPPLIED SIMULATION DATA</span>
      </div>
      <ImpactSummary metrics={result.metrics} />
      <div className="ds-workbench-grid">
        <div className="ds-left-stack">
          <div className="ds-main-grid">
            <ScenarioControls draft={draft} onChange={next => { setDraft(next); setError(''); invalidateAdvice(); }} onRun={run} error={error} />
            <NetworkMap flights={result.flights} closure={closure} selected={selected} airportFocus={airportFocus} onAirportFocus={focusAirport} onSelect={selectFlight} />
          </div>
          <AircraftTimeline result={result} selectedId={selectedId} onSelect={selectFlight} />
        </div>
        <FlightInspector result={result} selected={selected} onSelect={selectFlight} />
      </div>
      {recovery && <RecoveryPanel response={recovery} disrupted={disrupted} previewId={previewId} appliedId={appliedId} onPreview={setPreviewId} onApply={applyRecovery} onUndo={() => { setPreviewId(undefined); setAppliedId(undefined); clearFilters(); }} onAdvice={askAdvice} busy={adviceBusy} notice={adviceNotice} />}
      <SavedScenarios closure={closure} candidateId={appliedId} onLoad={loadSaved} />
      <FlightList flights={flights} selectedId={selectedId} query={query} onQuery={setQuery} status={status} onStatus={setStatus} airportFocus={airportFocus} onClear={clearFilters} onSelect={selectFlight} />
      <PeoplePanel result={result} onSelect={selectFlight} />
      <p className="ds-footnote">Simulation only · IST throughout · Recovery respects supplied aircraft and original crew availability, with an explicit 15-minute crew transfer assumption when changing aircraft. Airport slot queues, diversions, reserve crews and rebooking are outside this model.</p>
    </div>
  );
}
