import { isOperated } from './simulate';
import type { FlightNetwork, FlightProjection, SimulationResult } from '@/types/contracts/generated';

export function routeKey(origin: string, destination: string): string {
  return [origin, destination].sort().join('-');
}

/** Only follow a dependency that the engine recorded as a binding delay cause. */
export function causeChain(result: SimulationResult, flightId: string): FlightProjection[] {
  const byId = new Map(result.flights.map(flight => [flight.id, flight]));
  const chain: FlightProjection[] = [];
  const visited = new Set<string>();
  let flight = byId.get(flightId);
  while (flight && !visited.has(flight.id)) {
    visited.add(flight.id);
    chain.unshift(flight);
    const dependency = flight.causes.find(cause => (cause.kind === 'late-aircraft' || cause.kind === 'late-crew'));
    flight = dependency?.relatedFlightId ? byId.get(dependency.relatedFlightId) : undefined;
  }
  return chain;
}

export function turnaroundDetail(network: FlightNetwork, result: SimulationResult, flightId: string) {
  const flight = result.flights.find(item => item.id === flightId);
  const inbound = result.flights.find(item => item.id === flight?.previousFlightId);
  if (!flight || !inbound || !isOperated(flight) || !isOperated(inbound) || flight.tailId !== inbound.tailId) return undefined;
  const scheduledSlack = Math.max(0, flight.scheduledDeparture - inbound.scheduledArrival - network.minTurnaroundMinutes);
  return {
    inbound,
    scheduledSlack,
    absorbedMinutes: Math.min(scheduledSlack, inbound.arrivalDelay),
    inheritedMinutes: Math.max(0, inbound.arrivalDelay - scheduledSlack),
    availableMinutes: flight.actualDeparture - inbound.actualArrival,
  };
}

export function routeGroups(flights: readonly FlightProjection[]) {
  const routes = new Map<string, FlightProjection[]>();
  for (const flight of flights) {
    const key = routeKey(flight.origin, flight.destination);
    routes.set(key, [...(routes.get(key) ?? []), flight]);
  }
  return [...routes.entries()].map(([key, grouped]) => ({
    key,
    flights: grouped.sort((a, b) => b.arrivalDelay - a.arrivalDelay || (a.actualDeparture ?? a.scheduledDeparture) - (b.actualDeparture ?? b.scheduledDeparture) || a.id.localeCompare(b.id)),
    delayed: grouped.some(flight => flight.arrivalDelay > 0),
  }));
}

export function timelineRange(flights: readonly FlightProjection[]) {
  if (!flights.length) return { start: 360, end: 1320 };
  return {
    start: Math.floor((Math.min(...flights.map(flight => flight.scheduledDeparture)) - 30) / 60) * 60,
    end: Math.ceil((Math.max(...flights.map(flight => Math.max(flight.actualArrival ?? flight.scheduledArrival, flight.scheduledArrival))) + 30) / 60) * 60,
  };
}
