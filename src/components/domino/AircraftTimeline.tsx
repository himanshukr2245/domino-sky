'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { isOperated } from '@/lib/simulation/simulate';
import { timelineRange } from '@/lib/simulation/inspect';
import { formatTime } from '@/lib/simulation/time';
import type { SimulationResult } from '@/types/contracts/generated';

export function AircraftTimeline({ result, selectedId, onSelect }: {
  result: SimulationResult; selectedId: string; onSelect: (flightId: string) => void;
}) {
  const [allAircraft, setAllAircraft] = useState(false);
  const selected = result.flights.find(flight => flight.id === selectedId)!;
  const groups = [...new Set(result.flights.map(flight => flight.tailId))].map(tailId => ({
    tailId,
    flights: result.flights.filter(flight => flight.tailId === tailId),
    crew: result.crews.find(crew => crew.flightIds.includes(result.flights.find(flight => flight.tailId === tailId)!.id))!,
  }));
  const visible = groups.filter(group => allAircraft || group.tailId === selected.tailId || group.flights.some(flight => flight.arrivalDelay > 0 || flight.status === 'cancelled'));
  const range = timelineRange(result.flights);
  const position = (minute: number) => (minute - range.start) / (range.end - range.start) * 100;
  const ticks: number[] = [];
  for (let minute = range.start; minute <= range.end; minute += range.end - range.start > 1440 ? 240 : 120) ticks.push(minute);

  return (
    <section className="ds-panel ds-timeline" aria-labelledby="timeline-heading">
      <div className="ds-list-header">
        <div><p className="ds-eyebrow">AIRCRAFT ROTATIONS</p><h2 id="timeline-heading" className="ds-section-title">Watch the schedule shift.</h2><p className="text-sm text-fg-muted">{visible.length} aircraft shown. Select a projected leg to trace its cause.</p></div>
        <Select aria-label="Aircraft timeline scope" value={allAircraft ? 'all' : 'affected'} onChange={event => setAllAircraft(event.target.value === 'all')}>
          <option value="affected">Affected + selected</option><option value="all">All aircraft</option>
        </Select>
      </div>
      <div className="ds-timeline-legend"><span><i className="ds-scheduled-key" />Scheduled</span><span><i className="ds-projected-key" />Projected</span><span><i className="ds-delayed-key" />Delayed</span><span><i className="ds-selected-key" />Selected flight</span><span>All times IST · scroll to explore</span></div>
      <div className="ds-timeline-scroll" tabIndex={0} role="region" aria-label="Scrollable aircraft timeline">
        <div className="ds-timeline-canvas">
          <div className="ds-timeline-ruler"><span>Aircraft / crew</span><div>{ticks.map(tick => <span key={tick} style={{ left: `${position(tick)}%` }}>{formatTime(tick)}</span>)}</div></div>
          {visible.map(group => (
            <div className={`ds-timeline-row ${group.tailId === selected.tailId ? 'ds-timeline-row-selected' : ''}`} key={group.tailId}>
              <div className="ds-tail-label"><strong>{group.tailId}</strong><span className={group.crew.excessMinutes ? 'text-danger' : ''}>{group.crew.id} · {group.crew.excessMinutes ? `+${group.crew.excessMinutes}m duty` : `${group.crew.slackMinutes}m slack`}</span></div>
              <div className="ds-timeline-plot">
                {ticks.map(tick => <span key={tick} className="ds-timeline-gridline" style={{ left: `${position(tick)}%` }} />)}
                {result.closure && group.flights.some(flight => flight.origin === result.closure!.airport || flight.destination === result.closure!.airport) && <span className="ds-timeline-closure" title={`${result.closure.airport} closure window`} style={{ left: `${Math.max(0, position(result.closure.start))}%`, width: `${Math.max(0, Math.min(100, position(result.closure.end)) - Math.max(0, position(result.closure.start)))}%` }} />}
                {group.flights.map(flight => (
                  <span className={flight.status === 'cancelled' ? 'ds-scheduled-leg ds-cancelled-leg' : 'ds-scheduled-leg'} key={`scheduled-${flight.id}`} title={`${flight.id} scheduled ${formatTime(flight.scheduledDeparture)}–${formatTime(flight.scheduledArrival)}`} style={{ left: `${position(flight.scheduledDeparture)}%`, width: `${position(flight.scheduledArrival) - position(flight.scheduledDeparture)}%` }} />
                ))}
                {group.flights.filter(isOperated).map(flight => (
                  <Button variant="plain" size="none" sound="none" latencyMode="none" key={flight.id} data-flight={flight.id} aria-pressed={selectedId === flight.id} aria-label={`Timeline ${flight.id}, ${flight.origin} to ${flight.destination}, ${formatTime(flight.actualDeparture)} to ${formatTime(flight.actualArrival)}, ${flight.arrivalDelay} minutes delayed`} onClick={() => onSelect(flight.id)} className={`ds-projected-leg ${flight.arrivalDelay ? 'ds-projected-delayed' : ''} ${selectedId === flight.id ? 'ds-projected-selected' : ''}`} style={{ left: `${position(flight.actualDeparture)}%`, width: `${position(flight.actualArrival) - position(flight.actualDeparture)}%` }}>
                    <span>{flight.id.slice(2)}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
