'use client';
import { useMemo, useState, type FormEvent } from 'react';
import { Button, ButtonLink, Field, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { NETWORK } from '@/lib/simulation/network';
import { simulate, validateClosure } from '@/lib/simulation/simulate';
import { formatTime, parseTime } from '@/lib/simulation/time';
import type { AirportClosure } from '@/types/contracts/generated';
import { NetworkMap } from './NetworkMap';

const PRESETS = [
  { name: 'Mumbai afternoon', airport: 'BOM', start: '14:30', duration: 90 },
  { name: 'Delhi morning', airport: 'DEL', start: '08:00', duration: 60 },
  { name: 'Bengaluru evening', airport: 'BLR', start: '16:00', duration: 90 },
];
const number = (value: number) => value.toLocaleString('en-IN');

export function Cockpit({ home = false }: { home?: boolean }) {
  const [airport, setAirport] = useState('BOM'), [start, setStart] = useState('14:30'), [duration, setDuration] = useState('90');
  const [closure, setClosure] = useState<AirportClosure>();
  const [error, setError] = useState(''), [selectedId, setSelectedId] = useState('DS0302'), [filter, setFilter] = useState('all');
  const result = useMemo(() => simulate(NETWORK, closure), [closure]);
  const selected = result.flights.find(f => f.id === selectedId)!;
  const crew = result.crews.find(c => c.flightIds.includes(selectedId))!;
  const missed = result.connections.filter(c => c.missed), breaches = result.crews.filter(c => c.excessMinutes > 0);
  const flights = result.flights.filter(f => filter === 'all' || f.arrivalDelay > 0);
  const draftChanged = closure && (closure.airport !== airport || formatTime(closure.start) !== start || closure.end - closure.start !== Number(duration));
  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const minutes = Number(duration);
      if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 1440) throw new Error('Choose a duration from 1 to 1,440 minutes.');
      const begin = parseTime(start), next = validateClosure(NETWORK, { airport, start: begin, end: begin + minutes });
      setClosure(next); setError('');
      const firstDelayed = simulate(NETWORK, next).flights.find(f => f.arrivalDelay > 0);
      if (firstDelayed) setSelectedId(firstDelayed.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Check your closure settings.'); }
  }
  return <div className="ds-workspace">
    <section className="ds-intro" aria-labelledby="cockpit-title"><div><p className="ds-eyebrow">DOMINO SKY / OPERATIONS INTELLIGENCE</p><h1 id="cockpit-title" className="ds-title">{home ? 'Domino Sky' : 'Operations cockpit'}</h1><p className="ds-subtitle">One closure.<span> A network of consequences.</span></p><p className="ds-intro-copy">See how disruption travels. Trace every delay back to its cause.</p></div><div className="ds-intro-side"><span className="ds-network-count"><strong>{NETWORK.airports.length}</strong> airports <span>/</span> <strong>{NETWORK.flights.length}</strong> flights</span>{home ? <ButtonLink href="/app" variant="cyber-solid" font="sans" size="lg" sound="none">Open cockpit</ButtonLink> : <Button variant="secondary" font="sans" sound="none" onClick={() => { setClosure(undefined); setError(''); }}>Reset to baseline</Button>}</div></section>
    <div className="ds-main-grid">
      <section className="ds-panel ds-command" aria-labelledby="closure-heading"><div className="ds-panel-heading"><span className="ds-eyebrow">SCENARIO CONTROL</span><span className="ds-tag">IST</span></div><h2 id="closure-heading" className="ds-section-title">Close an airport.</h2><p className="text-sm text-fg-muted">Set the interruption. See what follows.</p>
        <form onSubmit={run} className="ds-form"><Field label="Airport"><Select value={airport} onChange={e => setAirport(e.target.value)}>{NETWORK.airports.map(a => <option key={a.id} value={a.id}>{a.id} · {a.city}</option>)}</Select></Field><div className="ds-time-fields"><Field label="Closure start"><Input type="time" value={start} required onChange={e => setStart(e.target.value)} /></Field><Field label="Duration (min)"><Input type="number" min="1" max="1440" step="1" required value={duration} onChange={e => setDuration(e.target.value)} /></Field></div><p className="text-sm text-danger" role="alert">{error}</p><Button type="submit" variant="cyber-solid" font="sans" size="lg" sound="none" className="w-full text-sm">Run disruption</Button></form>
        <div className="ds-presets"><h3 className="ds-eyebrow">QUICK SCENARIOS</h3>{PRESETS.map(p => <Button key={p.name} variant="plain" sound="none" latencyMode="none" className="ds-preset" onClick={() => { setAirport(p.airport); setStart(p.start); setDuration(String(p.duration)); setError(''); }}><span>{p.name}</span><span className="font-mono text-xs text-fg-muted">{p.duration}m</span></Button>)}</div><p className="ds-method-note">Fixed flight times. Ground holds. Real turnaround slack. Every result calculated from the supplied network.</p>
      </section>
      <section className="ds-panel ds-network-panel" aria-label="Network overview"><NetworkMap flights={result.flights} closure={closure} /><div className="ds-scenario-strip" role="status" aria-live="polite" data-testid="scenario-status"><span className={closure ? 'ds-state ds-state-disrupted' : 'ds-state'}>{closure ? 'Disruption projected' : 'Baseline schedule'}</span><span>{closure ? `${closure.airport} closed ${formatTime(closure.start)}–${formatTime(closure.end)} IST` : 'Choose a closure and run the simulation.'}</span>{draftChanged && <span className="text-warning">Inputs changed · run to update</span>}</div></section>
    </div>
    <section className="ds-metrics" aria-label="Calculated network impact">{[
      { label: 'Delayed flights', value: result.metrics.delayedFlights, unit: `of ${result.metrics.totalFlights}`, id: 'delayed-flights' },
      { label: 'Total arrival delay', value: result.metrics.totalArrivalDelay, unit: 'flight minutes', id: 'arrival-delay' },
      { label: 'Missed connections', value: result.metrics.missedConnectionPassengers, unit: `${result.metrics.missedConnections} passenger groups`, id: 'missed-passengers' },
      { label: 'Crew duty breaches', value: result.metrics.crewBreaches, unit: 'projected rosters', id: 'crew-breaches' },
    ].map(metric => <div className="ds-panel ds-metric" key={metric.id}><p>{metric.label}</p><div><strong data-testid={metric.id}>{number(metric.value)}</strong><span>{metric.unit}</span></div></div>)}</section>
    <div className="ds-detail-grid">
      <section className="ds-panel ds-flights" aria-labelledby="flights-heading"><div className="ds-list-header"><div><p className="ds-eyebrow">THE CASCADE</p><h2 id="flights-heading" className="ds-section-title">Every flight. Every consequence.</h2></div><div className="w-40"><Select aria-label="Flight filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All flights</option><option value="delayed">Delayed flights</option></Select></div></div><div className="ds-flight-list" tabIndex={0} role="region" aria-label="Flight results">{flights.length ? flights.map(f => <Button key={f.id} variant="plain" size="none" sound="none" latencyMode="none" className={`ds-flight-row ${selectedId === f.id ? 'ds-flight-selected' : ''}`} aria-pressed={selectedId === f.id} aria-label={`Inspect ${f.id}, ${f.origin} to ${f.destination}, ${f.arrivalDelay ? `${f.arrivalDelay} minutes delayed` : 'on time'}`} onClick={() => setSelectedId(f.id)}><span><strong className="font-mono">{f.id}</strong><small>{f.tailId}</small></span><span className="ds-flight-route">{f.origin}<span className="text-fg-muted"> / </span>{f.destination}</span><span className="font-mono">{formatTime(f.actualDeparture)}<small>departure</small></span><span className={f.arrivalDelay ? 'ds-flight-delay' : 'ds-flight-on-time'}>{f.arrivalDelay ? `+${f.arrivalDelay}m` : 'On time'}</span></Button>) : <p className="p-6 text-fg-muted">No delayed flights in this result.</p>}</div></section>
      <aside className="ds-panel ds-inspector" aria-labelledby="inspector-heading"><p className="ds-eyebrow">FLIGHT INSPECTOR</p><h2 id="inspector-heading" className="ds-inspector-id">{selected.id}<span>{selected.origin} / {selected.destination}</span></h2><div className="ds-time-comparison"><div><p>Scheduled</p><strong>{formatTime(selected.scheduledDeparture)}</strong><span>{formatTime(selected.scheduledArrival)} arrival</span></div><div><p>Projected</p><strong>{formatTime(selected.actualDeparture)}</strong><span>{formatTime(selected.actualArrival)} arrival</span></div></div><h3 className="ds-eyebrow mt-6 mb-3">WHY THIS FLIGHT MOVED</h3>{selected.causes.length ? <ol className="ds-causes">{selected.causes.map((cause, index) => <li key={index}><strong>+{cause.minutes} min</strong><span>{cause.kind === 'late-aircraft' ? `Aircraft arriving late from ${cause.relatedFlightId}; minimum turnaround still required.` : cause.kind === 'destination-closure' ? `${cause.airport} arrival held on the ground until reopening.` : `${cause.airport} departure held until reopening.`}</span></li>)}</ol> : <p className="text-sm text-fg-muted">No binding delay. The scheduled departure remains feasible.</p>}<div className="ds-crew-summary"><p>{crew.id} · {selected.tailId}</p><strong className={crew.excessMinutes ? 'text-danger' : 'text-fg'}>{crew.dutyMinutes} / {crew.limitMinutes} min duty</strong><span>{crew.excessMinutes ? `${crew.excessMinutes} min over limit · projected roster is infeasible` : `${crew.slackMinutes} min remaining duty slack`}</span></div></aside>
    </div>
    <section className="ds-panel ds-connection-summary" aria-labelledby="people-heading"><div><p className="ds-eyebrow">PEOPLE BEHIND THE SCHEDULE</p><h2 id="people-heading" className="ds-section-title">Passenger connections & crew</h2><p className="text-sm text-fg-muted">{number(result.metrics.delayedBoardings)} delayed flight boardings. Connection passenger counts are reported separately; these are not unique traveler totals.</p></div><div className="ds-people-grid"><div><h3 className="font-semibold mb-3">{missed.length ? 'Broken connection groups' : 'Connections intact'}</h3>{missed.length ? missed.map(c => <p key={c.id} className="ds-people-row"><strong>{c.id} · {c.airport}</strong><span>{c.fromFlight} / {c.toFlight}</span><span>{c.passengers} passengers · {c.shortfallMinutes} min short</span></p>) : <p className="text-sm text-fg-muted">All supplied connections have enough time in this result.</p>}</div><div><h3 className="font-semibold mb-3">{breaches.length ? 'Duty limits exceeded' : 'Crew within duty limits'}</h3>{breaches.length ? breaches.map(c => <p key={c.id} className="ds-people-row"><strong>{c.id} · {c.tailId}</strong><span>{c.dutyMinutes} / {c.limitMinutes} minutes</span><span className="text-danger">{c.excessMinutes} min over limit</span></p>) : <p className="text-sm text-fg-muted">No projected crew duty breaches.</p>}</div></div></section>
    <p className="ds-footnote">Simulation only · IST throughout · Airport capacity is informational; slot queues, diversions and reserve crews are not modeled. Recovery comparison and Gemini advice are planned for a later phase.</p>
  </div>;
}
