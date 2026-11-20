'use client';

import { Button, Field, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { NETWORK } from '@/lib/simulation/network';

export interface ScenarioDraft { airport: string; start: string; duration: string }
const PRESETS = [
  { name: 'Mumbai afternoon', detail: 'Aircraft & crew', airport: 'BOM', start: '14:30', duration: '90' },
  { name: 'Kolkata connection squeeze', detail: 'Passenger transfers', airport: 'CCU', start: '12:00', duration: '60' },
  { name: 'Delhi morning', detail: 'Hub departure wave', airport: 'DEL', start: '08:00', duration: '60' },
];

export function ScenarioControls({ draft, onChange, onRun, error }: {
  draft: ScenarioDraft; onChange: (draft: ScenarioDraft) => void; onRun: () => void; error: string;
}) {
  return (
    <section className="ds-panel ds-command" aria-labelledby="closure-heading">
      <div className="ds-panel-heading"><span className="ds-eyebrow">SCENARIO CONTROL</span><span className="ds-tag">IST</span></div>
      <h2 id="closure-heading" className="ds-section-title">Where does it begin?</h2>
      <p className="text-sm text-fg-muted">Close an airport. Follow the ripple.</p>
      <form onSubmit={event => { event.preventDefault(); onRun(); }} className="ds-form">
        <Field label="Airport">
          <Select value={draft.airport} onChange={event => onChange({ ...draft, airport: event.target.value })}>
            {NETWORK.airports.map(airport => <option key={airport.id} value={airport.id}>{airport.id} · {airport.city}</option>)}
          </Select>
        </Field>
        <div className="ds-time-fields">
          <Field label="Closure start"><Input type="time" required value={draft.start} onChange={event => onChange({ ...draft, start: event.target.value })} /></Field>
          <Field label="Duration (min)"><Input type="number" min="1" max="1440" step="1" required value={draft.duration} onChange={event => onChange({ ...draft, duration: event.target.value })} /></Field>
        </div>
        <p className="text-sm text-danger" role="alert">{error}</p>
        <Button type="submit" variant="cyber-solid" font="sans" size="lg" sound="none" className="w-full text-sm">Run disruption</Button>
      </form>
      <div className="ds-presets">
        <h3 className="ds-eyebrow">EXPLORE A SCENARIO</h3>
        {PRESETS.map(preset => (
          <Button key={preset.name} variant="plain" size="none" sound="none" latencyMode="none" className="ds-preset" onClick={() => onChange({ airport: preset.airport, start: preset.start, duration: preset.duration })}>
            <span>{preset.name}<small>{preset.detail}</small></span><span className="font-mono text-xs text-fg-muted">{preset.duration}m</span>
          </Button>
        ))}
      </div>
      <p className="ds-method-note">Ground holds · Fixed flight durations<br />Turnaround slack included · Supplied simulation data</p>
    </section>
  );
}
