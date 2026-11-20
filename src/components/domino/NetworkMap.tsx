import type { AirportClosure, FlightProjection } from '@/types/contracts/generated';
import { NETWORK } from '@/lib/simulation/network';

const point = (lat: number, lng: number) => ({ x: 75 + (lng - 71) * 30, y: 455 - (lat - 8) * 16 });

export function NetworkMap({ flights, closure }: { flights: FlightProjection[]; closure?: AirportClosure }) {
  const airports = new Map(NETWORK.airports.map(a => [a.id, { ...a, ...point(a.lat, a.lng) }]));
  const routes = new Map<string, { origin: string; destination: string; delayed: boolean }>();
  flights.forEach(f => { const key = [f.origin, f.destination].sort().join('-'); routes.set(key, { origin: f.origin, destination: f.destination, delayed: f.arrivalDelay > 0 || (routes.get(key)?.delayed ?? false) }); });
  return <figure className="ds-map-frame">
    <div className="ds-map-label"><span className="ds-eyebrow">THE OPERATING NETWORK</span><span className="font-mono text-xs text-fg-muted">IST / UTC+05:30</span></div>
    <svg viewBox="0 0 800 520" className="ds-map" role="img" aria-label={`Geographic network of ${NETWORK.airports.length} airports. ${closure ? `${closure.airport} is the selected closure.` : 'Baseline schedule.'}`}>
      <title>Domino Sky airport network</title><desc>Routes join supplied airport coordinates. Amber routes contain delayed flights; cyan routes remain on time. Use the airport selector and flight list for details.</desc>
      <defs><pattern id="airspace-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" /></pattern></defs>
      <rect width="800" height="520" fill="url(#airspace-grid)" opacity="0.6" />
      <ellipse cx="345" cy="280" rx="260" ry="215" className="ds-map-orbit" /><ellipse cx="345" cy="280" rx="170" ry="215" className="ds-map-orbit" />
      {[...routes.entries()].map(([key, route]) => { const from = airports.get(route.origin)!, to = airports.get(route.destination)!; return <path key={key} d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2 + 18} ${(from.y + to.y) / 2 - 36} ${to.x} ${to.y}`} fill="none" className={route.delayed ? 'ds-route ds-route-delayed' : 'ds-route'} />; })}
      {[...airports.values()].map(a => <g key={a.id}>{closure?.airport === a.id && <circle cx={a.x} cy={a.y} r="21" className="ds-closed-ring" />}<circle cx={a.x} cy={a.y} r={a.tier === 'mega_hub' ? 6 : 4} className={closure?.airport === a.id ? 'ds-node ds-node-closed' : 'ds-node'} /><text x={a.x + (a.id === 'PNQ' ? 13 : -12)} y={a.y + (a.id === 'PNQ' ? 13 : -13)} className="ds-node-label">{a.id}</text></g>)}
      <text x="600" y="452" className="ds-coordinate-label">08°–31° N</text><text x="600" y="473" className="ds-coordinate-label">072°–092° E</text>
    </svg>
    <figcaption className="ds-map-legend"><span><i className="ds-legend-line" />On time</span><span><i className="ds-legend-line ds-legend-delayed" />Contains delayed flights</span><span>Supplied simulation network</span></figcaption>
  </figure>;
}
