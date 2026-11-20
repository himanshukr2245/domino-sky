'use client';

import { useId, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { isOperated } from '@/lib/simulation/simulate';
import { NETWORK } from '@/lib/simulation/network';
import { routeGroups, routeKey } from '@/lib/simulation/inspect';
import { formatTime } from '@/lib/simulation/time';
import type { AirportClosure, FlightProjection } from '@/types/contracts/generated';

const point = (lat: number, lng: number) => ({ x: 75 + (lng - 71) * 30, y: 455 - (lat - 8) * 16 });

export function NetworkMap({ flights, closure, selected, airportFocus, onAirportFocus, onSelect }: {
  flights: FlightProjection[]; closure?: AirportClosure; selected: FlightProjection;
  airportFocus?: string; onAirportFocus: (airport?: string) => void; onSelect: (flightId: string) => void;
}) {
  const gridId = useId().replace(/:/g, '');
  const airports = new Map(NETWORK.airports.map(airport => [airport.id, { ...airport, ...point(airport.lat, airport.lng) }]));
  const routes = routeGroups(flights);
  const selectedRoute = routeKey(selected.origin, selected.destination);
  const sameRoute = flights.filter(flight => routeKey(flight.origin, flight.destination) === selectedRoute);
  const activate = (event: KeyboardEvent<SVGGElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); }
  };

  return (
    <section className="ds-panel ds-network-panel" aria-labelledby="network-heading">
      <div className="ds-map-label"><div><p className="ds-eyebrow">THE OPERATING NETWORK</p><h2 id="network-heading" className="ds-map-heading">A single interruption.<br /><span>A connected sky.</span></h2></div><span className="ds-tag">SIMULATION / IST</span></div>
      <div className="ds-map-scroll" tabIndex={0} role="region" aria-label="Interactive geographic network; scroll horizontally on smaller screens">
        <div className="ds-map-canvas">
          <svg viewBox="0 0 800 520" className="ds-map" role="group" aria-label="Selectable airport routes">
            <title>Domino Sky airport network</title><desc>Select a route to inspect a flight. Use airport focus to narrow the view. Amber routes contain delayed flights; the selected flight route is highlighted.</desc>
            <defs><pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" /></pattern></defs>
            <rect width="800" height="520" fill={`url(#${gridId})`} opacity="0.65" />
            <ellipse cx="345" cy="280" rx="260" ry="215" className="ds-map-orbit" /><ellipse cx="345" cy="280" rx="170" ry="215" className="ds-map-orbit" />
            {[...routes].sort((a, b) => Number(a.key === selectedRoute) - Number(b.key === selectedRoute)).map(route => {
              const from = airports.get(route.flights[0].origin)!, to = airports.get(route.flights[0].destination)!;
              const focused = !airportFocus || from.id === airportFocus || to.id === airportFocus;
              const chosen = route.key === selectedRoute;
              const curve = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2 + 18} ${(from.y + to.y) / 2 - 36} ${to.x} ${to.y}`;
              return (
                <g key={route.key} role="button" tabIndex={0} aria-pressed={chosen} aria-label={`Inspect route ${route.key}, ${route.flights.length} flights${route.delayed ? ', delayed flights' : ''}`} onClick={() => onSelect(route.flights[0].id)} onKeyDown={event => activate(event, () => onSelect(route.flights[0].id))} className={`ds-route-control ${focused ? '' : 'ds-route-unfocused'} ${chosen ? 'ds-route-chosen' : ''}`}>
                  <path d={curve} className="ds-route-hit" fill="none" />
                  <path d={curve} fill="none" className={`ds-route ${route.delayed ? 'ds-route-delayed' : ''} ${chosen ? 'ds-route-selected' : ''}`} />
                </g>
              );
            })}
            {[...airports.values()].map(airport => <g key={airport.id} aria-hidden="true">
              {closure?.airport === airport.id && <circle cx={airport.x} cy={airport.y} r="23" className="ds-closed-ring" />}
              {selected.origin === airport.id || selected.destination === airport.id ? <circle cx={airport.x} cy={airport.y} r="15" className="ds-selected-airport-ring" /> : null}
              <circle cx={airport.x} cy={airport.y} r={airport.tier === 'mega_hub' ? 6 : 4} className={closure?.airport === airport.id ? 'ds-node ds-node-closed' : 'ds-node'} />
            </g>)}
          </svg>
          {NETWORK.airports.map(airport => {
            const location = airports.get(airport.id)!;
            return <Button key={airport.id} variant="plain" size="none" sound="none" latencyMode="none" className={`ds-airport-button ${airportFocus === airport.id ? 'ds-airport-focused' : ''}`} style={{ left: `${location.x / 8}%`, top: `${location.y / 5.2}%` }} aria-pressed={airportFocus === airport.id} aria-label={`Focus ${airport.city} airport ${airport.id}`} onClick={() => onAirportFocus(airportFocus === airport.id ? undefined : airport.id)}><span className={`ds-airport-label ds-airport-label-${airport.id}`}>{airport.id}</span></Button>;
          })}
        </div>
      </div>
      <div className="ds-map-legend"><span><i className="ds-legend-line" />On time</span><span><i className="ds-legend-line ds-legend-delayed" />Delayed</span><span><i className="ds-legend-line ds-legend-selected" />Selected route</span><span className="ds-map-scroll-hint">Scroll map to explore</span></div>
      <div className="ds-map-selection">
        <div><span className="ds-eyebrow">SELECTED FLIGHT</span><strong>{selected.id} <span>{selected.origin} / {selected.destination}</span></strong><p>{isOperated(selected) ? formatTime(selected.actualDeparture) + '–' + formatTime(selected.actualArrival) + ' IST' : 'Cancelled'} · {selected.tailId}</p><a href="#inspector-heading" className="ds-view-details">View flight details</a></div>
        <div className="ds-route-flights" aria-label="Flights on selected route">{sameRoute.map(flight => <Button key={flight.id} variant="plain" size="none" sound="none" latencyMode="none" className="ds-route-flight" aria-pressed={flight.id === selected.id} aria-label={`Route flight ${flight.id}`} onClick={() => onSelect(flight.id)}>{flight.id}</Button>)}</div>
      </div>
      <div className="ds-map-focus"><label htmlFor="network-focus">Airport focus</label><Select id="network-focus" value={airportFocus ?? 'all'} onChange={event => onAirportFocus(event.target.value === 'all' ? undefined : event.target.value)}><option value="all">Entire network</option>{NETWORK.airports.map(airport => <option key={airport.id} value={airport.id}>{airport.id} · {airport.city}</option>)}</Select>{airportFocus && <Button variant="quiet" sound="none" className="text-sm" onClick={() => onAirportFocus(undefined)}>Clear focus</Button>}</div>
    </section>
  );
}
