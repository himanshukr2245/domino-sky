import { describe, expect, it } from 'vitest';
import source from '@/data/flight-network.json';
import type { FlightNetwork } from '@/types/contracts/generated';
import { NETWORK, readNetwork } from './network';
import { isOperated, simulate } from './simulate';
import { formatTime, parseTime } from './time';

const at = parseTime;
function fixture(): FlightNetwork {
  return {
    minTurnaroundMinutes: 30, seatsPerAircraft: 180, airports: NETWORK.airports.slice(0, 3), spares: [],
    flights: [
      { id: 'A', tailId: 'T1', legOrder: 1, origin: 'DEL', destination: 'BOM', departure: 360, arrival: 420, blockMinutes: 60, pax: 100 },
      { id: 'B', tailId: 'T2', legOrder: 1, origin: 'BOM', destination: 'BLR', departure: 480, arrival: 540, blockMinutes: 60, pax: 100 },
    ],
    connections: [{ id: 'C', airport: 'BOM', fromFlight: 'A', toFlight: 'B', passengers: 20, minConnectMinutes: 45 }],
    crews: [
      { id: 'C1', tailId: 'T1', base: 'DEL', dutyStart: 300, maxDutyMinutes: 600, flightIds: ['A'] },
      { id: 'C2', tailId: 'T2', base: 'BOM', dutyStart: 420, maxDutyMinutes: 600, flightIds: ['B'] },
    ],
  };
}

describe('input and time contract', () => {
  it('preserves the supplied network quantities and passenger accounting', () => {
    expect([NETWORK.airports.length, NETWORK.flights.length, NETWORK.crews.length, NETWORK.connections.length, NETWORK.spares.length]).toEqual([16, 70, 16, 21, 2]);
    expect(NETWORK.flights.reduce((sum, f) => sum + f.pax, 0)).toBe(10394);
    expect(NETWORK.connections.reduce((sum, c) => sum + c.passengers, 0)).toBe(659);
  });
  it.each(['24:00', '9:30', '12:60', '-1:00', '12:30Z'])('rejects invalid operating-day time %s', time => expect(() => at(time)).toThrow());
  it('formats crossing midnight without wrapping away the day', () => {
    expect(formatTime(1440 + 65)).toBe('01:05 +1d');
    expect(formatTime(2880)).toBe('00:00 +2d');
    expect(() => formatTime(-1)).toThrow();
  });
  it('rejects broken source references and duplicates', () => {
    const broken = structuredClone(source);
    broken.flights[0].origin = 'XXX';
    expect(() => readNetwork(broken)).toThrow(/airport references/);
    const duplicate = structuredClone(source);
    duplicate.flights.push(duplicate.flights[0]);
    expect(() => readNetwork(duplicate)).toThrow(/duplicate flight/);
  });
  it('rejects invalid shape, aircraft continuity, turnaround, and crew rosters', () => {
    expect(() => readNetwork({})).toThrow(/source shape/);
    const broken = structuredClone(source);
    broken.flights[1].origin = 'BLR';
    expect(() => readNetwork(broken)).toThrow(/aircraft location/);
    const gap = structuredClone(source);
    gap.flights[1].turnaround_before_min = 31;
    expect(() => readNetwork(gap)).toThrow(/scheduled turnaround gap/);
    const crew = structuredClone(source);
    crew.crews[0].flight_ids.pop();
    expect(() => readNetwork(crew)).toThrow(/crew coverage/);
  });
  it.each([
    { airport: 'XXX', start: 360, end: 420 }, { airport: 'DEL', start: 360, end: 360 },
    { airport: 'DEL', start: 420, end: 360 }, { airport: 'DEL', start: 360.5, end: 420 },
    { airport: 'DEL', start: 360, end: 2000 },
  ])('rejects invalid closure %j', closure => expect(() => simulate(NETWORK, closure)).toThrow());
});

describe('flight cascade', () => {
  it('keeps the complete baseline on time with no connection failures or duty breaches', () => {
    const result = simulate(NETWORK);
    expect(result.metrics).toEqual({ totalFlights: 70, operatedFlights: 70, cancelledFlights: 0, cancelledBoardings: 0, delayedFlights: 0, totalArrivalDelay: 0, maxArrivalDelay: 0, delayedBoardings: 0, passengerDelayMinutes: 0, missedConnections: 0, missedConnectionPassengers: 0, crewBreaches: 0 });
    expect(result.flights.every(f => f.actualDeparture === f.scheduledDeparture && f.actualArrival === f.scheduledArrival && f.causes.length === 0)).toBe(true);
  });
  it('blocks departure at closure start and allows departure exactly at reopening', () => {
    expect(simulate(fixture(), { airport: 'DEL', start: 360, end: 375 }).flights[0].actualDeparture).toBe(375);
    expect(simulate(fixture(), { airport: 'DEL', start: 340, end: 360 }).flights[0].actualDeparture).toBe(360);
  });
  it('ground-holds an arrival at closure start, preserving block time', () => {
    const flight = simulate(fixture(), { airport: 'BOM', start: 420, end: 450 }).flights[0];
    expect([flight.actualDeparture, flight.actualArrival]).toEqual([390, 450]);
    expect(flight.causes).toEqual([{ kind: 'destination-closure', minutes: 30, airport: 'BOM' }]);
  });
  it('permits arrival exactly at reopening', () => expect(simulate(fixture(), { airport: 'BOM', start: 400, end: 420 }).flights[0].arrivalDelay).toBe(0));
  it('matches the independently calculated Mumbai cascade and crew breach', () => {
    const result = simulate(NETWORK, { airport: 'BOM', start: at('14:30'), end: at('16:00') });
    const tail = result.flights.filter(isOperated).filter(f => f.tailId === 'VT-DS03');
    expect(tail.map(f => [f.id, formatTime(f.actualDeparture), formatTime(f.actualArrival), f.arrivalDelay])).toEqual([
      ['DS0301', '12:15', '13:50', 0], ['DS0302', '14:50', '16:00', 25],
      ['DS0303', '16:30', '18:40', 20], ['DS0304', '19:10', '21:35', 15],
    ]);
    expect(result.crews.find(c => c.id === 'CR03')).toMatchObject({ dutyMinutes: 605, excessMinutes: 5 });
    expect(tail[2].causes).toEqual([{ kind: 'late-aircraft', minutes: 20, relatedFlightId: 'DS0302' }]);
  });
  it('uses minimum turnaround, absorbing scheduled slack', () => {
    const network = fixture();
    network.connections = [];
    network.flights[1] = { ...network.flights[1], tailId: 'T1', legOrder: 2 };
    network.crews = [{ ...network.crews[0], flightIds: ['A', 'B'] }];
    const result = simulate(network, { airport: 'DEL', start: 360, end: 380 });
    expect(result.flights.map(f => f.arrivalDelay)).toEqual([20, 0]);
    expect(result.flights[1].actualDeparture).toBe(480);
  });
  it('does not mutate inputs or introduce randomness', () => {
    const before = JSON.stringify(NETWORK), closure = { airport: 'BOM', start: 870, end: 960 };
    const result = simulate(NETWORK, closure);
    expect(simulate(NETWORK, closure)).toEqual(result);
    expect(JSON.stringify(NETWORK)).toBe(before);
    result.closure!.start = 0;
    expect(closure.start).toBe(870);
  });
});

describe('passengers and crew', () => {
  it('makes a connection with exactly the minimum time, misses by one minute below', () => {
    expect(simulate(fixture(), { airport: 'DEL', start: 360, end: 375 }).connections[0]).toMatchObject({ missed: false, availableMinutes: 45, shortfallMinutes: 0 });
    const result = simulate(fixture(), { airport: 'DEL', start: 360, end: 376 });
    expect(result.connections[0]).toMatchObject({ missed: true, availableMinutes: 44, shortfallMinutes: 1 });
    expect(result.metrics.missedConnectionPassengers).toBe(20);
    expect(result.metrics.delayedBoardings).toBe(100);
    expect(result.flights[1].actualDeparture).toBe(480); // no implicit connection hold
  });
  it('allows exact crew duty limit and flags one minute over it', () => {
    const network = fixture();
    network.crews[0].maxDutyMinutes = 135;
    expect(simulate(network, { airport: 'DEL', start: 360, end: 375 }).crews[0]).toMatchObject({ dutyMinutes: 135, excessMinutes: 0, slackMinutes: 0 });
    expect(simulate(network, { airport: 'DEL', start: 360, end: 376 }).crews[0]).toMatchObject({ dutyMinutes: 136, excessMinutes: 1 });
  });
});

describe('network-wide scenario invariants', () => {
  for (const airport of NETWORK.airports) {
    it.each([[360, 450], [870, 960], [1380, 1560]])(`${airport.id} closure %i–%i preserves physical schedule constraints`, (start, end) => {
      const result = simulate(NETWORK, { airport: airport.id, start, end });
      expect(result.flights).toHaveLength(70);
      expect(new Set(result.flights.map(f => f.id)).size).toBe(70);
      const byId = new Map(result.flights.map(f => [f.id, f]));
      for (const f of result.flights) {
        expect(isOperated(f)).toBe(true);
        if (!isOperated(f)) throw new Error('A disruption-only projection must operate every flight.');
        expect(f.actualDeparture).toBeGreaterThanOrEqual(f.scheduledDeparture);
        expect(f.actualArrival - f.actualDeparture).toBe(f.scheduledArrival - f.scheduledDeparture);
        expect(f.causes.reduce((sum, c) => sum + c.minutes, 0)).toBe(f.departureDelay);
        for (const [place, time] of [[f.origin, f.actualDeparture], [f.destination, f.actualArrival]] as const) expect(place === airport.id && time >= start && time < end).toBe(false);
        if (f.previousFlightId) expect(f.actualDeparture).toBeGreaterThanOrEqual(byId.get(f.previousFlightId)!.actualArrival! + 30);
      }
    });
  }
});
