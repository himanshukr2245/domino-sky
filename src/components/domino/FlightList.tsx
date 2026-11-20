import { Button, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { formatTime } from '@/lib/simulation/time';
import type { FlightProjection } from '@/types/contracts/generated';

export function FlightList({ flights, selectedId, query, onQuery, status, onStatus, airportFocus, onClear, onSelect }: {
  flights: FlightProjection[]; selectedId: string; query: string; onQuery: (value: string) => void;
  status: string; onStatus: (value: string) => void; airportFocus?: string; onClear: () => void;
  onSelect: (flightId: string) => void;
}) {
  const filtered = Boolean(query || airportFocus || status !== 'all');
  return (
    <section className="ds-panel ds-flights" aria-labelledby="flights-heading" id="flight-list">
      <div className="ds-list-header">
        <div><p className="ds-eyebrow">FLIGHT MANIFEST</p><h2 id="flights-heading" className="ds-section-title">Find the next consequence.</h2><p className="text-sm text-fg-muted">{flights.length} flights shown{airportFocus ? ` · ${airportFocus} focus` : ''} · selected {selectedId}</p></div>
        {filtered && <Button variant="quiet" sound="none" className="text-sm" onClick={onClear}>Clear filters</Button>}
      </div>
      <div className="ds-flight-toolbar">
        <label><span>Find a flight</span><Input type="search" aria-label="Search flights" placeholder="Flight, aircraft or airport" value={query} onChange={event => onQuery(event.target.value)} /></label>
        <label><span>Flight status</span><Select aria-label="Flight filter" value={status} onChange={event => onStatus(event.target.value)}><option value="all">All flights</option><option value="delayed">Delayed flights</option><option value="crew">Crew duty risk</option></Select></label>
      </div>
      <div className="ds-flight-list" tabIndex={0} role="region" aria-label="Flight results">
        {flights.length ? flights.map(flight => (
          <Button key={flight.id} variant="plain" size="none" sound="none" latencyMode="none" className={`ds-flight-row ${selectedId === flight.id ? 'ds-flight-selected' : ''}`} aria-pressed={selectedId === flight.id} aria-label={`Inspect ${flight.id}, ${flight.origin} to ${flight.destination}, ${flight.arrivalDelay ? `${flight.arrivalDelay} minutes delayed` : 'on time'}`} onClick={() => onSelect(flight.id)}>
            <span><strong className="font-mono">{flight.id}</strong><small>{flight.tailId}</small></span>
            <span className="ds-flight-route">{flight.origin}<span className="text-fg-muted"> / </span>{flight.destination}</span>
            <span className="font-mono">{formatTime(flight.actualDeparture)}<small>{formatTime(flight.actualArrival)} arrival</small></span>
            <span className={flight.arrivalDelay ? 'ds-flight-delay' : 'ds-flight-on-time'}>{flight.arrivalDelay ? `+${flight.arrivalDelay}m` : 'On time'}</span>
          </Button>
        )) : <div className="ds-empty-state"><strong>No flights match this view.</strong><p>Clear filters or try a different flight, aircraft or airport.</p><Button variant="secondary" sound="none" onClick={onClear}>Show all flights</Button></div>}
      </div>
    </section>
  );
}
