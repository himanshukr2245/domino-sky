import { describe, expect, it } from 'vitest';
import { NETWORK } from './network';
import { buildRecovery, bindRecommendation, compareCandidates } from './recover';
import { isOperated, simulate } from './simulate';

const closure = { airport: 'BOM', start: 870, end: 960 };
describe('physical recovery constraints', () => {
  it('cancelling an outbound leg leaves aircraft at its origin until a valid rejoin', () => {
    const result = simulate(NETWORK, undefined, [{ kind: 'cancel', flightId: 'DS0101' }]);
    expect(result.flights.find(flight => flight.id === 'DS0101')).toMatchObject({ status: 'cancelled', cancellationReason: 'requested' });
    expect(result.flights.find(flight => flight.id === 'DS0101')!.actualArrival).toBeUndefined();
    expect(result.flights.find(flight => flight.id === 'DS0102')).toMatchObject({ status: 'cancelled', cancellationReason: 'aircraft-unavailable' });
    expect(result.flights.find(flight => flight.id === 'DS0103')).toMatchObject({ status: 'operated', actualDeparture: 650 });
  });
  it('cannot teleport a stranded crew onto a spare', () => {
    const result = simulate(NETWORK, undefined, [{ kind: 'cancel', flightId: 'DS0102' }, { kind: 'swap', flightId: 'DS0103', spareTailId: 'VT-DS18' }]);
    expect(result.flights.find(flight => flight.id === 'DS0103')).toMatchObject({ status: 'cancelled', cancellationReason: 'crew-unavailable' });
  });
  it('a DEL spare can recover the final DEL leg after the original crew arrives', () => {
    const result = simulate(NETWORK, closure, [{ kind: 'swap', flightId: 'DS0304', spareTailId: 'VT-DS18' }]);
    expect(result.flights.find(flight => flight.id === 'DS0304')).toMatchObject({ tailId: 'VT-DS18', scheduledTailId: 'VT-DS03', actualDeparture: 1135, actualArrival: 1280 });
    expect(result.crews.find(crew => crew.id === 'CR03')).toMatchObject({ dutyMinutes: 590, excessMinutes: 0 });
  });
  it('rejects a spare at the wrong airport and double assignment', () => {
    expect(() => simulate(NETWORK, closure, [{ kind: 'swap', flightId: 'DS0303', spareTailId: 'VT-DS18' }])).toThrow(/not at/);
    expect(() => simulate(NETWORK, closure, [{ kind: 'swap', flightId: 'DS0304', spareTailId: 'VT-DS18' }, { kind: 'swap', flightId: 'DS0103', spareTailId: 'VT-DS18' }])).toThrow(/twice/);
  });
  it('respects spare availability and capacity', () => {
    const network = structuredClone(NETWORK);
    network.spares.find(spare => spare.tailId === 'VT-DS18')!.availableFrom = 1200;
    const result = simulate(network, closure, [{ kind: 'swap', flightId: 'DS0304', spareTailId: 'VT-DS18' }]);
    expect(result.flights.find(flight => flight.id === 'DS0304')!.actualDeparture).toBe(1200);
    network.spares.find(spare => spare.tailId === 'VT-DS18')!.seats = 1;
    expect(() => simulate(network, closure, [{ kind: 'swap', flightId: 'DS0304', spareTailId: 'VT-DS18' }])).toThrow(/seats/);
  });
  it('accounts for cancelled boardings and failed connections without inventing arrival times', () => {
    const result = simulate(NETWORK, undefined, [{ kind: 'cancel', flightId: 'DS0105' }]);
    expect(result.metrics.cancelledBoardings).toBe(NETWORK.flights.find(flight => flight.id === 'DS0105')!.pax);
    expect(result.connections.find(connection => connection.id === 'CX14')).toMatchObject({ missed: true, reason: 'flight-cancelled' });
    expect(result.connections.find(connection => connection.id === 'CX14')!.availableMinutes).toBeUndefined();
    expect(result.metrics.operatedFlights + result.metrics.cancelledFlights).toBe(70);
  });
  it('holds a connection explicitly and propagates its aircraft effects', () => {
    const disruption = { airport: 'CCU', start: 720, end: 780 };
    const result = simulate(NETWORK, disruption, [{ kind: 'hold', flightId: 'DS0105', holdUntilMinute: 970 }]);
    expect(result.connections.find(connection => connection.id === 'CX14')).toMatchObject({ missed: false, availableMinutes: 45 });
    expect(result.flights.find(flight => flight.id === 'DS0105')!.causes.some(cause => cause.kind === 'recovery-hold')).toBe(true);
  });
});
describe('candidate receipts and ranking', () => {
  it('finds a crew-feasible combined spare/cancellation plan for Mumbai', () => {
    const response = buildRecovery(NETWORK, closure);
    const best = response.candidates.find(candidate => candidate.id === response.recommendedId)!;
    expect(best.feasible).toBe(true);
    expect(best.result.metrics.crewBreaches).toBe(0);
    expect(best.result.metrics.cancelledFlights).toBe(1);
    expect(best.actions.some(action => action.kind === 'swap' && action.flightId === 'DS0304')).toBe(true);
    for (const candidate of response.candidates) expect(simulate(NETWORK, closure, candidate.actions)).toEqual(candidate.result);
    expect(response.candidates.every(candidate => compareCandidates(best, candidate) <= 0)).toBe(true);
  });
  it('is reproducible and never ranks cancel-all as an unpenalized delay improvement', () => {
    expect(buildRecovery(NETWORK, closure)).toEqual(buildRecovery(NETWORK, closure));
    const best = buildRecovery(NETWORK, closure).candidates[0];
    expect(best.result.metrics.cancelledBoardings).toBeLessThan(NETWORK.flights.reduce((sum, flight) => sum + flight.pax, 0));
    expect(best.result.flights.filter(isOperated).every(flight => flight.actualDeparture >= flight.scheduledDeparture)).toBe(true);
  });
  it('binds model output only to verified IDs and whitelisted reasons', () => {
    const response = buildRecovery(NETWORK, closure);
    expect(bindRecommendation(response, { candidateId: response.recommendedId, reasonCodes: ['PROTECT_CREW'] })).toBeDefined();
    expect(bindRecommendation(response, { candidateId: 'invented', reasonCodes: [] })).toBeUndefined();
    expect(bindRecommendation(response, { candidateId: response.recommendedId, reasonCodes: ['CANCEL_EVERYTHING'] })).toBeUndefined();
    expect(bindRecommendation(response, { candidateId: response.recommendedId, reasonCodes: [], savedPassengers: 999999 })).toBeUndefined();
  });
});
