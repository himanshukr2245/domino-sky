import * as z from '@/lib/zod';
import type { AirportClosure, DelayCause, FlightNetwork, FlightProjection, RecoveryAction, SimulationResult } from '@/types/contracts/generated';

export const RECOVERY_POLICY = { crewTransferMinutes: 15, engineVersion: 'domino-v2' } as const;
export const closureSchema = z.strictObject({
  airport: z.string().check(z.regex(/^[A-Z]{3}$/)),
  start: z.int().check(z.minimum(0), z.maximum(1439)),
  end: z.int().check(z.minimum(1), z.maximum(2879)),
});
const flightId = z.string().check(z.minLength(1), z.maxLength(20));
const actionSchema = z.union([
  z.strictObject({ kind: z.literal('cancel'), flightId }),
  z.strictObject({ kind: z.literal('hold'), flightId, holdUntilMinute: z.int().check(z.minimum(0), z.maximum(4320)) }),
  z.strictObject({ kind: z.literal('swap'), flightId, spareTailId: z.string().check(z.minLength(1), z.maxLength(20)) }),
]);

export function validateClosure(network: FlightNetwork, value: unknown): AirportClosure {
  const parsed = closureSchema.safeParse(value);
  if (!parsed.success) throw new Error('Choose a valid airport and closure time.');
  const closure = parsed.data;
  if (!network.airports.some(airport => airport.id === closure.airport)) throw new Error('Choose an airport in the supplied network.');
  if (closure.end <= closure.start || closure.end - closure.start > 1440) throw new Error('Closure must end after it starts and last no more than 24 hours.');
  return closure;
}

export function isOperated(flight: FlightProjection): flight is FlightProjection & { actualDeparture: number; actualArrival: number } {
  return flight.status === 'operated' && flight.actualDeparture !== undefined && flight.actualArrival !== undefined;
}

/** Pure deterministic projection. Cancellations never transport aircraft or crew. */
export function simulate(network: FlightNetwork, input?: AirportClosure, inputActions: RecoveryAction[] = []): SimulationResult {
  const closure = input ? validateClosure(network, input) : undefined;
  const parsed = z.array(actionSchema).check(z.maxLength(40)).safeParse(inputActions);
  if (!parsed.success) throw new Error('Invalid recovery actions.');
  const actions: RecoveryAction[] = parsed.data;
  const actionKeys = new Set<string>(), swappedRotations = new Set<string>(), usedSpares = new Set<string>();
  for (const action of actions) {
    const flight = network.flights.find(item => item.id === action.flightId);
    if (!flight) throw new Error('Recovery references an unknown flight.');
    const key = action.kind + ':' + action.flightId;
    if (actionKeys.has(key)) throw new Error('Duplicate recovery action.');
    actionKeys.add(key);
    if (action.kind === 'swap') {
      const spare = network.spares.find(item => item.tailId === action.spareTailId);
      if (!spare || spare.base !== flight.origin) throw new Error('Spare aircraft is not at the departure airport.');
      if (usedSpares.has(spare.tailId) || swappedRotations.has(flight.tailId)) throw new Error('A spare or rotation cannot be assigned twice.');
      usedSpares.add(spare.tailId); swappedRotations.add(flight.tailId);
    }
    if (action.kind === 'hold' && action.holdUntilMinute! < flight.departure) throw new Error('A recovery hold cannot depart early.');
  }
  const cancellations = new Set(actions.filter(action => action.kind === 'cancel').map(action => action.flightId));
  const holds = new Map(actions.filter(action => action.kind === 'hold').map(action => [action.flightId, action.holdUntilMinute!]));
  const swaps = new Map(actions.filter(action => action.kind === 'swap').map(action => [action.flightId, action.spareTailId!]));
  const inClosure = (airport: string, time: number) => closure && airport === closure.airport && time >= closure.start && time < closure.end;
  const projections: FlightProjection[] = [];

  for (const scheduledTail of [...new Set(network.flights.map(flight => flight.tailId))].sort()) {
    const rotation = network.flights.filter(flight => flight.tailId === scheduledTail).sort((a, b) => a.legOrder - b.legOrder);
    let activeTail = scheduledTail, aircraftLocation = rotation[0].origin, crewLocation = rotation[0].origin;
    let aircraftAvailable = 0, crewAvailable = 0, seats = network.seatsPerAircraft;
    let previousAircraft: FlightProjection | undefined, previousCrew: FlightProjection | undefined;
    for (const flight of rotation) {
      if (swaps.has(flight.id)) {
        const spare = network.spares.find(item => item.tailId === swaps.get(flight.id))!;
        activeTail = spare.tailId; aircraftLocation = spare.base; aircraftAvailable = spare.availableFrom; seats = spare.seats;
        previousAircraft = undefined;
      }
      const base = {
        id: flight.id, tailId: activeTail, scheduledTailId: scheduledTail, legOrder: flight.legOrder,
        origin: flight.origin, destination: flight.destination, scheduledDeparture: flight.departure,
        scheduledArrival: flight.arrival, pax: flight.pax,
        ...(previousCrew ? { previousFlightId: previousCrew.id } : {}),
      };
      const cancellationReason = cancellations.has(flight.id) ? 'requested' : aircraftLocation !== flight.origin ? 'aircraft-unavailable' : crewLocation !== flight.origin ? 'crew-unavailable' : undefined;
      if (cancellationReason) {
        projections.push({ ...base, status: 'cancelled', cancellationReason, departureDelay: 0, arrivalDelay: 0, causes: [] });
        continue;
      }
      if (flight.pax > seats) throw new Error('Assigned aircraft does not have enough seats.');
      let departure = flight.departure;
      const causes: DelayCause[] = [];
      if (aircraftAvailable > departure) {
        causes.push({ kind: previousAircraft ? 'late-aircraft' : 'spare-availability', minutes: aircraftAvailable - departure, ...(previousAircraft ? { relatedFlightId: previousAircraft.id } : {}) });
        departure = aircraftAvailable;
      }
      if (crewAvailable > departure) {
        causes.push({ kind: 'late-crew', minutes: crewAvailable - departure, ...(previousCrew ? { relatedFlightId: previousCrew.id } : {}) });
        departure = crewAvailable;
      }
      const hold = holds.get(flight.id);
      if (hold !== undefined && hold > departure) { causes.push({ kind: 'recovery-hold', minutes: hold - departure }); departure = hold; }
      while (closure) {
        if (inClosure(flight.origin, departure)) {
          causes.push({ kind: 'origin-closure', minutes: closure.end - departure, airport: flight.origin });
          departure = closure.end; continue;
        }
        const arrival = departure + flight.blockMinutes;
        if (inClosure(flight.destination, arrival)) {
          const shift = closure.end - arrival;
          causes.push({ kind: 'destination-closure', minutes: shift, airport: flight.destination });
          departure += shift; continue;
        }
        break;
      }
      const projected: FlightProjection = {
        ...base, status: 'operated', actualDeparture: departure, actualArrival: departure + flight.blockMinutes,
        departureDelay: departure - flight.departure, arrivalDelay: departure + flight.blockMinutes - flight.arrival, causes,
      };
      projections.push(projected); previousAircraft = projected; previousCrew = projected;
      aircraftLocation = flight.destination; crewLocation = flight.destination;
      aircraftAvailable = projected.actualArrival! + network.minTurnaroundMinutes;
      crewAvailable = projected.actualArrival! + RECOVERY_POLICY.crewTransferMinutes;
    }
  }
  const byId = new Map(projections.map(flight => [flight.id, flight]));
  const connections = network.connections.map(connection => {
    const inbound = byId.get(connection.fromFlight)!, outbound = byId.get(connection.toFlight)!;
    const availableMinutes = isOperated(inbound) && isOperated(outbound) ? outbound.actualDeparture - inbound.actualArrival : undefined;
    const cancelled = availableMinutes === undefined;
    const missed = cancelled || availableMinutes < connection.minConnectMinutes;
    return {
      id: connection.id, airport: connection.airport, fromFlight: connection.fromFlight, toFlight: connection.toFlight,
      passengers: connection.passengers, minimumMinutes: connection.minConnectMinutes,
      ...(availableMinutes === undefined ? {} : { availableMinutes }),
      shortfallMinutes: availableMinutes === undefined ? 0 : Math.max(0, connection.minConnectMinutes - availableMinutes),
      missed, reason: cancelled ? 'flight-cancelled' as const : missed ? 'short-transfer' as const : 'made' as const,
    };
  });
  const crews = network.crews.map(crew => {
    const operated = crew.flightIds.map(id => byId.get(id)!).filter(isOperated);
    const dutyEnd = Math.max(crew.dutyStart, ...operated.map(flight => flight.actualArrival));
    const dutyMinutes = dutyEnd - crew.dutyStart;
    return { id: crew.id, tailId: crew.tailId, dutyStart: crew.dutyStart, dutyEnd, dutyMinutes, limitMinutes: crew.maxDutyMinutes,
      excessMinutes: Math.max(0, dutyMinutes - crew.maxDutyMinutes), slackMinutes: Math.max(0, crew.maxDutyMinutes - dutyMinutes), flightIds: [...crew.flightIds] };
  });
  const operated = projections.filter(isOperated), cancelled = projections.filter(flight => flight.status === 'cancelled');
  const delayed = operated.filter(flight => flight.arrivalDelay > 0), missed = connections.filter(connection => connection.missed);
  return {
    ...(closure ? { closure: { ...closure } } : {}), actions: actions.map(action => ({ ...action })), policy: { ...RECOVERY_POLICY },
    flights: projections, connections, crews,
    metrics: {
      totalFlights: projections.length, operatedFlights: operated.length, cancelledFlights: cancelled.length,
      cancelledBoardings: cancelled.reduce((sum, flight) => sum + flight.pax, 0), delayedFlights: delayed.length,
      totalArrivalDelay: operated.reduce((sum, flight) => sum + flight.arrivalDelay, 0),
      maxArrivalDelay: Math.max(0, ...operated.map(flight => flight.arrivalDelay)),
      delayedBoardings: delayed.reduce((sum, flight) => sum + flight.pax, 0),
      passengerDelayMinutes: operated.reduce((sum, flight) => sum + flight.pax * flight.arrivalDelay, 0),
      missedConnections: missed.length, missedConnectionPassengers: missed.reduce((sum, connection) => sum + connection.passengers, 0),
      crewBreaches: crews.filter(crew => crew.excessMinutes > 0).length,
    },
  };
}
