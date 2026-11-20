import * as z from '@/lib/zod';
import source from '@/data/flight-network.json';
import type { FlightNetwork } from '@/types/contracts/generated';
import { parseTime } from './time';

const text = z.string().check(z.minLength(1));
const integer = z.int().check(z.minimum(0));
const positive = z.int().check(z.minimum(1));
const clock = z.string().check(z.regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/));
const sourceSchema = z.strictObject({
  meta: z.strictObject({ dataset: text, operating_day: text, min_turnaround_minutes: positive, seats_per_aircraft: positive, notes: z.array(text) }),
  airports: z.array(z.strictObject({ id: text, name: text, city: text, lat: z.number().check(z.minimum(-90), z.maximum(90)), lng: z.number().check(z.minimum(-180), z.maximum(180)), tier: text, capacity_per_hour: positive })),
  flights: z.array(z.strictObject({ flight_id: text, tail_id: text, leg_order: positive, origin: text, destination: text, dep: clock, arr: clock, block_minutes: positive, pax: integer, turnaround_before_min: z.nullable(integer) })),
  connections: z.array(z.strictObject({ connection_id: text, airport: text, from_flight: text, to_flight: text, passengers: positive, min_connect_minutes: positive })),
  crews: z.array(z.strictObject({ crew_id: text, tail_id: text, base: text, duty_start: clock, max_duty_mins: positive, flight_ids: z.array(text) })),
  spare_aircraft: z.array(z.strictObject({ tail_id: text, base: text, available_from: clock, seats: positive })),
});

function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid flight network: ${message}`);
}

export function readNetwork(value: unknown): FlightNetwork {
  const parsed = sourceSchema.safeParse(value);
  if (!parsed.success) throw new Error('Invalid flight network: source shape or value.');
  const raw = parsed.data;
  const network: FlightNetwork = {
    minTurnaroundMinutes: raw.meta.min_turnaround_minutes,
    seatsPerAircraft: raw.meta.seats_per_aircraft,
    airports: raw.airports.map(a => ({ id: a.id, name: a.name, city: a.city, lat: a.lat, lng: a.lng, tier: a.tier, capacityPerHour: a.capacity_per_hour })),
    flights: raw.flights.map(f => ({ id: f.flight_id, tailId: f.tail_id, legOrder: f.leg_order, origin: f.origin, destination: f.destination, departure: parseTime(f.dep), arrival: parseTime(f.arr), blockMinutes: f.block_minutes, pax: f.pax, ...(f.turnaround_before_min === null ? {} : { scheduledTurnaround: f.turnaround_before_min }) })),
    connections: raw.connections.map(c => ({ id: c.connection_id, airport: c.airport, fromFlight: c.from_flight, toFlight: c.to_flight, passengers: c.passengers, minConnectMinutes: c.min_connect_minutes })),
    crews: raw.crews.map(c => ({ id: c.crew_id, tailId: c.tail_id, base: c.base, dutyStart: parseTime(c.duty_start), maxDutyMinutes: c.max_duty_mins, flightIds: [...c.flight_ids] })),
    spares: raw.spare_aircraft.map(s => ({ tailId: s.tail_id, base: s.base, availableFrom: parseTime(s.available_from), seats: s.seats })),
  };
  validateNetwork(network);
  return network;
}

export function validateNetwork(network: FlightNetwork): void {
  const unique = (values: string[], name: string) => requireValid(new Set(values).size === values.length, `duplicate ${name}.`);
  requireValid(network.airports.length && network.flights.length, 'empty airports or flights.');
  unique(network.airports.map(a => a.id), 'airport');
  unique(network.flights.map(f => f.id), 'flight');
  unique(network.connections.map(c => c.id), 'connection');
  unique(network.crews.map(c => c.id), 'crew');
  unique(network.crews.map(c => c.tailId), 'crew tail');
  unique(network.spares.map(s => s.tailId), 'spare');
  const airports = new Set(network.airports.map(a => a.id));
  const flights = new Map(network.flights.map(f => [f.id, f]));
  const tails = [...new Set(network.flights.map(f => f.tailId))];
  for (const flight of network.flights) {
    requireValid(airports.has(flight.origin) && airports.has(flight.destination) && flight.origin !== flight.destination, `${flight.id} airport references.`);
    requireValid(flight.arrival - flight.departure === flight.blockMinutes, `${flight.id} block time.`);
    requireValid(flight.pax <= network.seatsPerAircraft, `${flight.id} seat capacity.`);
  }
  for (const tail of tails) {
    const rotation = network.flights.filter(f => f.tailId === tail).sort((a, b) => a.legOrder - b.legOrder);
    rotation.forEach((flight, index) => {
      requireValid(flight.legOrder === index + 1, `${tail} leg order.`);
      const previous = rotation[index - 1];
      if (!previous) { requireValid(flight.scheduledTurnaround === undefined, `${flight.id} first-leg turnaround.`); return; }
      const gap = flight.departure - previous.arrival;
      requireValid(previous.destination === flight.origin, `${flight.id} aircraft location.`);
      requireValid(gap >= network.minTurnaroundMinutes, `${flight.id} minimum turnaround.`);
      requireValid(gap === flight.scheduledTurnaround, `${flight.id} scheduled turnaround gap.`);
    });
    const crew = network.crews.find(c => c.tailId === tail);
    requireValid(crew && crew.flightIds.join(',') === rotation.map(f => f.id).join(','), `${tail} crew coverage.`);
    requireValid(crew.base === rotation[0].origin && crew.dutyStart <= rotation[0].departure, `${tail} crew availability.`);
    requireValid(rotation.at(-1)!.arrival - crew.dutyStart <= crew.maxDutyMinutes, `${tail} baseline duty.`);
  }
  requireValid(network.crews.length === tails.length, 'crew references an unknown tail.');
  for (const spare of network.spares) requireValid(airports.has(spare.base) && !tails.includes(spare.tailId), `${spare.tailId} spare identity/location.`);
  const inboundCounts = new Map<string, number>(), outboundCounts = new Map<string, number>();
  for (const connection of network.connections) {
    const from = flights.get(connection.fromFlight), to = flights.get(connection.toFlight);
    requireValid(from && to && from.destination === connection.airport && to.origin === connection.airport, `${connection.id} connection references.`);
    requireValid(to.departure - from.arrival >= connection.minConnectMinutes, `${connection.id} baseline connection.`);
    inboundCounts.set(from.id, (inboundCounts.get(from.id) ?? 0) + connection.passengers);
    outboundCounts.set(to.id, (outboundCounts.get(to.id) ?? 0) + connection.passengers);
  }
  for (const [id, count] of [...inboundCounts, ...outboundCounts]) requireValid(count <= flights.get(id)!.pax, `${id} connection passenger counts.`);
}

export const NETWORK = readNetwork(source);
