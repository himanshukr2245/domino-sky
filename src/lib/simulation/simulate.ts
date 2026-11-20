import * as z from '@/lib/zod';
import type { AirportClosure, DelayCause, FlightNetwork, FlightProjection, SimulationResult } from '@/types/contracts/generated';

export const closureSchema = z.strictObject({
  airport: z.string().check(z.regex(/^[A-Z]{3}$/)),
  start: z.int().check(z.minimum(0), z.maximum(1439)),
  end: z.int().check(z.minimum(1), z.maximum(2879)),
});

export function validateClosure(network: FlightNetwork, value: unknown): AirportClosure {
  const parsed = closureSchema.safeParse(value);
  if (!parsed.success) throw new Error('Choose a valid airport and closure time.');
  const closure = parsed.data;
  if (!network.airports.some(a => a.id === closure.airport)) throw new Error('Choose an airport in the supplied network.');
  if (closure.end <= closure.start || closure.end - closure.start > 1440) throw new Error('Closure must end after it starts and last no more than 24 hours.');
  return closure;
}

/** Fixed block times and ground holding; projected crew breaches remain explicit. */
export function simulate(network: FlightNetwork, input?: AirportClosure): SimulationResult {
  const closure = input ? validateClosure(network, input) : undefined;
  const inClosure = (airport: string, time: number) => closure && airport === closure.airport && time >= closure.start && time < closure.end;
  const projections: FlightProjection[] = [];
  const tailPrevious = new Map<string, FlightProjection>();
  const ordered = [...network.flights].sort((a, b) => a.tailId.localeCompare(b.tailId) || a.legOrder - b.legOrder);
  for (const flight of ordered) {
    const previous = tailPrevious.get(flight.tailId);
    let departure = Math.max(flight.departure, previous ? previous.actualArrival + network.minTurnaroundMinutes : flight.departure);
    const causes: DelayCause[] = [];
    if (departure > flight.departure) causes.push({ kind: 'late-aircraft', minutes: departure - flight.departure, relatedFlightId: previous!.id });
    // Each change is monotonic. Recheck both movements after adjusting either one.
    while (closure) {
      if (inClosure(flight.origin, departure)) {
        causes.push({ kind: 'origin-closure', minutes: closure.end - departure, airport: flight.origin });
        departure = closure.end;
        continue;
      }
      const arrival = departure + flight.blockMinutes;
      if (inClosure(flight.destination, arrival)) {
        const shift = closure.end - arrival;
        causes.push({ kind: 'destination-closure', minutes: shift, airport: flight.destination });
        departure += shift;
        continue;
      }
      break;
    }
    const projected: FlightProjection = {
      id: flight.id, tailId: flight.tailId, legOrder: flight.legOrder, origin: flight.origin, destination: flight.destination,
      scheduledDeparture: flight.departure, scheduledArrival: flight.arrival,
      actualDeparture: departure, actualArrival: departure + flight.blockMinutes,
      departureDelay: departure - flight.departure, arrivalDelay: departure + flight.blockMinutes - flight.arrival,
      pax: flight.pax, ...(previous ? { previousFlightId: previous.id } : {}), causes,
    };
    projections.push(projected);
    tailPrevious.set(flight.tailId, projected);
  }
  const byId = new Map(projections.map(f => [f.id, f]));
  const connections = network.connections.map(connection => {
    const availableMinutes = byId.get(connection.toFlight)!.actualDeparture - byId.get(connection.fromFlight)!.actualArrival;
    return { id: connection.id, airport: connection.airport, fromFlight: connection.fromFlight, toFlight: connection.toFlight, passengers: connection.passengers,
      minimumMinutes: connection.minConnectMinutes, availableMinutes, shortfallMinutes: Math.max(0, connection.minConnectMinutes - availableMinutes), missed: availableMinutes < connection.minConnectMinutes };
  });
  const crews = network.crews.map(crew => {
    const dutyEnd = Math.max(...crew.flightIds.map(id => byId.get(id)!.actualArrival));
    const dutyMinutes = dutyEnd - crew.dutyStart;
    return { id: crew.id, tailId: crew.tailId, dutyStart: crew.dutyStart, dutyEnd, dutyMinutes, limitMinutes: crew.maxDutyMinutes,
      excessMinutes: Math.max(0, dutyMinutes - crew.maxDutyMinutes), slackMinutes: Math.max(0, crew.maxDutyMinutes - dutyMinutes), flightIds: [...crew.flightIds] };
  });
  const delayed = projections.filter(f => f.arrivalDelay > 0), missed = connections.filter(c => c.missed);
  return {
    ...(closure ? { closure: { ...closure } } : {}), flights: projections, connections, crews,
    metrics: {
      totalFlights: projections.length, delayedFlights: delayed.length,
      totalArrivalDelay: projections.reduce((sum, f) => sum + f.arrivalDelay, 0),
      maxArrivalDelay: Math.max(0, ...projections.map(f => f.arrivalDelay)),
      delayedBoardings: delayed.reduce((sum, f) => sum + f.pax, 0),
      passengerDelayMinutes: projections.reduce((sum, f) => sum + f.pax * f.arrivalDelay, 0),
      missedConnections: missed.length, missedConnectionPassengers: missed.reduce((sum, c) => sum + c.passengers, 0),
      crewBreaches: crews.filter(c => c.excessMinutes > 0).length,
    },
  };
}
