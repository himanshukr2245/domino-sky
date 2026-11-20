import { describe, expect, it } from 'vitest';
import { NETWORK } from './network';
import { simulate } from './simulate';
import { causeChain, routeGroups, routeKey, timelineRange, turnaroundDetail } from './inspect';

const disrupted = simulate(NETWORK, { airport: 'BOM', start: 870, end: 960 });

describe('operational inspection', () => {
  it('traces the actual Mumbai delay chain without including an unrelated earlier leg', () => {
    expect(causeChain(disrupted, 'DS0304').map(flight => flight.id)).toEqual(['DS0302', 'DS0303', 'DS0304']);
    expect(causeChain(disrupted, 'DS0302').map(flight => flight.id)).toEqual(['DS0302']);
  });
  it('does not claim earlier flights caused an on-time flight', () => {
    expect(causeChain(simulate(NETWORK), 'DS0304').map(flight => flight.id)).toEqual(['DS0304']);
    expect(causeChain(disrupted, 'UNKNOWN')).toEqual([]);
  });
  it('accounts for five minutes of slack absorbing part of the inbound delay', () => {
    expect(turnaroundDetail(NETWORK, disrupted, 'DS0303')).toMatchObject({ scheduledSlack: 5, absorbedMinutes: 5, inheritedMinutes: 20, availableMinutes: 30 });
    expect(turnaroundDetail(NETWORK, disrupted, 'DS0304')).toMatchObject({ scheduledSlack: 5, absorbedMinutes: 5, inheritedMinutes: 15, availableMinutes: 30 });
  });
  it('has no invented inbound turnaround on the first leg', () => expect(turnaroundDetail(NETWORK, disrupted, 'DS0301')).toBeUndefined());
  it('combines both route directions while retaining every flight exactly once', () => {
    const groups = routeGroups(disrupted.flights);
    expect(routeKey('BOM', 'DEL')).toBe(routeKey('DEL', 'BOM'));
    expect(groups.flatMap(group => group.flights)).toHaveLength(70);
    expect(new Set(groups.flatMap(group => group.flights).map(flight => flight.id)).size).toBe(70);
    const route = groups.find(group => group.key === routeKey('BOM', 'DEL'))!;
    expect(route.delayed).toBe(true);
    expect(route.flights[0].arrivalDelay).toBe(Math.max(...route.flights.map(flight => flight.arrivalDelay)));
  });
  it('contains both scheduled and projected legs in the common timeline extent', () => {
    const result = simulate(NETWORK, { airport: 'DEL', start: 360, end: 1800 });
    const range = timelineRange(result.flights);
    expect(range.start).toBeLessThanOrEqual(Math.min(...result.flights.map(flight => flight.scheduledDeparture)));
    expect(range.end).toBeGreaterThanOrEqual(Math.max(...result.flights.map(flight => flight.actualArrival!)));
    expect(range.end).toBeGreaterThan(1440);
  });
  it('exposes the connection squeeze preset from actual projected times', () => {
    const result = simulate(NETWORK, { airport: 'CCU', start: 720, end: 780 });
    expect(result.connections.find(connection => connection.id === 'CX14')).toMatchObject({ missed: true, availableMinutes: -10, shortfallMinutes: 55, passengers: 20 });
  });
  it('keeps presentation derivations pure', () => {
    const before = JSON.stringify(disrupted);
    routeGroups(disrupted.flights);
    causeChain(disrupted, 'DS0304');
    turnaroundDetail(NETWORK, disrupted, 'DS0303');
    expect(JSON.stringify(disrupted)).toBe(before);
  });
});
