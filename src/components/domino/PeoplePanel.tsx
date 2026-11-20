'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import type { SimulationResult } from '@/types/contracts/generated';

export function PeoplePanel({ result, onSelect }: { result: SimulationResult; onSelect: (flightId: string) => void }) {
  const [allConnections, setAllConnections] = useState(false);
  const [allCrews, setAllCrews] = useState(false);
  const missed = result.connections.filter(connection => connection.missed);
  const breaches = result.crews.filter(crew => crew.excessMinutes > 0);
  const connections = allConnections ? result.connections : missed;
  const crews = allCrews ? result.crews : breaches;
  return (
    <section className="ds-panel ds-connection-summary" aria-labelledby="people-heading" id="passenger-impact">
      <div className="ds-list-header ds-people-header"><div><p className="ds-eyebrow">PEOPLE BEHIND THE SCHEDULE</p><h2 id="people-heading" className="ds-section-title">Every minute belongs to someone.</h2><p className="text-sm text-fg-muted">{result.metrics.delayedBoardings.toLocaleString('en-IN')} delayed flight boardings. Connection groups are reported separately, without claiming unique traveler totals.</p></div><span className="ds-tag">NETWORK TOTALS</span></div>
      <div className="ds-people-grid">
        <section aria-labelledby="connections-heading">
          <div className="ds-people-title"><h3 id="connections-heading">Passenger connections <span>{missed.length} missed</span></h3><Button variant="quiet" sound="none" size="none" className="ds-text-control" aria-pressed={allConnections} onClick={() => setAllConnections(!allConnections)}>{allConnections ? 'Show missed only' : `Show all ${result.connections.length}`}</Button></div>
          {connections.length ? connections.map(connection => (
            <div key={connection.id} className="ds-connection-row">
              <div><strong>{connection.id} <span>· {connection.airport}</span></strong><span>{connection.passengers} passengers</span></div>
              <p><strong className={connection.missed ? 'text-danger' : 'text-cyan-fg'}>{connection.reason === 'flight-cancelled' ? 'Connection lost to cancellation' : connection.missed ? `Missed · ${connection.shortfallMinutes} min short` : 'Connection intact'}</strong><span>{connection.availableMinutes === undefined ? 'A required flight is canceled' : connection.availableMinutes + ' min available / ' + connection.minimumMinutes + ' min required'}</span></p>
              <div className="ds-connection-flights"><Button variant="plain" size="none" sound="none" latencyMode="none" onClick={() => onSelect(connection.fromFlight)} className="ds-text-control">Inbound {connection.fromFlight}</Button><Button variant="plain" size="none" sound="none" latencyMode="none" onClick={() => onSelect(connection.toFlight)} className="ds-text-control">Outbound {connection.toFlight}</Button></div>
            </div>
          )) : <p className="ds-empty-note">All {result.connections.length} supplied connection groups have enough transfer time in this result.</p>}
        </section>
        <section aria-labelledby="crews-heading">
          <div className="ds-people-title"><h3 id="crews-heading">Crew duty <span>{breaches.length} over limit</span></h3><Button variant="quiet" size="none" sound="none" className="ds-text-control" aria-pressed={allCrews} onClick={() => setAllCrews(!allCrews)}>{allCrews ? 'Show breaches only' : `Show all ${result.crews.length}`}</Button></div>
          {crews.length ? crews.map(crew => (
            <Button key={crew.id} variant="plain" size="none" sound="none" latencyMode="none" className="ds-crew-row" aria-label={`Inspect crew ${crew.id} on ${crew.tailId}`} onClick={() => {
              const flight = result.flights.find(item => crew.flightIds.includes(item.id) && item.arrivalDelay > 0);
              onSelect(flight?.id ?? crew.flightIds[0]);
            }}>
              <span><strong>{crew.id} · {crew.tailId}</strong><small>{crew.dutyMinutes} / {crew.limitMinutes} minutes</small></span><span className={crew.excessMinutes ? 'text-danger' : 'text-cyan-fg'}>{crew.excessMinutes ? `+${crew.excessMinutes}m over` : `${crew.slackMinutes}m slack`}</span>
            </Button>
          )) : <p className="ds-empty-note">All supplied crew rosters remain within their duty limits.</p>}
        </section>
      </div>
    </section>
  );
}
