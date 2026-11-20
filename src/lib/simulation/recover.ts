import type { AirportClosure, FlightNetwork, RecoveryAction, RecoveryCandidate, RecoveryResponse } from '@/types/contracts/generated';
import { isOperated, RECOVERY_POLICY, simulate } from './simulate';

export function scenarioKey(closure: AirportClosure): string {
  return [RECOVERY_POLICY.engineVersion, closure.airport, closure.start, closure.end].join(':');
}

function canonical(actions: RecoveryAction[]): string {
  return JSON.stringify([...actions].sort((a, b) => (a.kind + a.flightId).localeCompare(b.kind + b.flightId)));
}

function identifier(actions: RecoveryAction[]): string {
  let hash = 2166136261;
  for (const character of canonical(actions)) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return 'plan-' + (hash >>> 0).toString(16);
}

function mergeActions(current: RecoveryAction[], additions: RecoveryAction[]): RecoveryAction[] {
  const merged = new Map(current.map(action => [action.kind + ':' + action.flightId, action]));
  additions.forEach(action => merged.set(action.kind + ':' + action.flightId, action));
  return [...merged.values()];
}

export function compareCandidates(a: RecoveryCandidate, b: RecoveryCandidate): number {
  const score = (candidate: RecoveryCandidate) => [candidate.feasible ? 0 : 1, candidate.result.metrics.cancelledBoardings,
    candidate.result.metrics.missedConnectionPassengers, candidate.result.metrics.passengerDelayMinutes, candidate.actions.length];
  const left = score(a), right = score(b);
  for (let index = 0; index < left.length; index++) if (left[index] !== right[index]) return left[index] - right[index];
  return a.id.localeCompare(b.id);
}

function evaluate(network: FlightNetwork, closure: AirportClosure, actions: RecoveryAction[], title: string): RecoveryCandidate | undefined {
  try {
    const result = simulate(network, closure, actions);
    const issues = result.crews.filter(crew => crew.excessMinutes > 0).map(crew => crew.id + ' exceeds duty by ' + crew.excessMinutes + ' minutes.');
    return { id: identifier(actions), title, actions, result, feasible: !issues.length, issues };
  } catch { return undefined; } // An impossible action is excluded, never presented as feasible.
}

/** Bounded repair search. Every trial is independently simulated and physically validated. */
function repair(network: FlightNetwork, closure: AirportClosure, seed: RecoveryAction[], allowSpares: boolean): RecoveryCandidate {
  let current = evaluate(network, closure, seed, 'Preserve crew limits')!;
  for (let iteration = 0; iteration < network.crews.length && !current.feasible; iteration++) {
    const breach = current.result.crews.find(crew => crew.excessMinutes > 0)!;
    const rotation = network.flights.filter(flight => flight.tailId === breach.tailId).sort((a, b) => a.legOrder - b.legOrder);
    const options: RecoveryCandidate[] = [];
    for (let index = rotation.length - 1; index >= 0; index--) {
      const additions: RecoveryAction[] = rotation.slice(index).map(flight => ({ kind: 'cancel', flightId: flight.id }));
      const trial = evaluate(network, closure, mergeActions(current.actions, additions), 'Cancel the required final legs');
      if (trial && trial.result.metrics.crewBreaches < current.result.metrics.crewBreaches) options.push(trial);
    }
    if (allowSpares && !current.actions.some(action => action.kind === 'swap' && rotation.some(flight => flight.id === action.flightId))) {
      for (const flight of rotation) for (const spare of network.spares) {
        if (spare.base !== flight.origin || current.actions.some(action => action.spareTailId === spare.tailId)) continue;
        const trial = evaluate(network, closure, mergeActions(current.actions, [{ kind: 'swap', flightId: flight.id, spareTailId: spare.tailId }]), 'Use an available spare and preserve crew limits');
        if (trial && trial.result.metrics.crewBreaches < current.result.metrics.crewBreaches) options.push(trial);
      }
    }
    options.sort(compareCandidates);
    if (!options.length) break;
    current = options[0];
  }
  return current;
}

export function buildRecovery(network: FlightNetwork, closure: AirportClosure): RecoveryResponse {
  const baseline = evaluate(network, closure, [], 'Keep the disrupted schedule')!;
  const candidates: RecoveryCandidate[] = [baseline];
  const repaired = repair(network, closure, [], true);
  repaired.title = repaired.actions.some(action => action.kind === 'swap') ? 'Recover with a spare and targeted cancellations' : repaired.actions.length ? 'Protect crew limits with targeted cancellations' : 'Keep the current schedule';
  candidates.push(repaired);
  const cancellation = repair(network, closure, [], false);
  cancellation.title = 'Protect crew limits without a spare';
  candidates.push(cancellation);
  // Holds are bounded to the first three disrupted groups, then checked against crew constraints.
  for (const connection of baseline.result.connections.filter(item => item.reason === 'short-transfer').slice(0, 3)) {
    const inbound = baseline.result.flights.find(flight => flight.id === connection.fromFlight)!;
    if (!isOperated(inbound)) continue;
    const until = inbound.actualArrival + connection.minimumMinutes;
    if (until > 4320) continue;
    const held = repair(network, closure, [{ kind: 'hold', flightId: connection.toFlight, holdUntilMinute: until }], true);
    held.title = 'Protect connection ' + connection.id + ' and repair crew limits';
    candidates.push(held);
  }
  const unique = [...new Map(candidates.map(candidate => [canonical(candidate.actions), candidate])).values()].sort(compareCandidates);
  const recommended = unique.find(candidate => candidate.feasible) ?? unique[0];
  return { scenarioKey: scenarioKey(closure), candidates: unique, recommendedId: recommended.id, adviserMode: 'rules',
    reasonCodes: ['LIMIT_CANCELLATIONS', 'PROTECT_CREW'], providerStatus: 'not-configured' };
}

export function bindRecommendation(response: RecoveryResponse, value: unknown): { candidateId: string; reasonCodes: string[] } | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;
  const allowed = new Set(['LIMIT_CANCELLATIONS', 'PROTECT_CREW', 'PROTECT_CONNECTIONS', 'REDUCE_DELAY', 'NO_IMPROVEMENT']);
  if (Object.keys(candidate).some(key => key !== 'candidateId' && key !== 'reasonCodes') || typeof candidate.candidateId !== 'string' || !Array.isArray(candidate.reasonCodes) || candidate.reasonCodes.length > 4 || !candidate.reasonCodes.every(code => typeof code === 'string' && allowed.has(code))) return undefined;
  const selected = response.candidates.find(item => item.id === candidate.candidateId && item.feasible);
  if (!selected) return undefined;
  // The model cannot promote a candidate that violates the declared ranking policy.
  const best = response.candidates.find(item => item.id === response.recommendedId)!;
  if (compareCandidates(selected, best) > 0) return undefined;
  return { candidateId: selected.id, reasonCodes: candidate.reasonCodes as string[] };
}
