import 'server-only';
import { savedScenarioSchema, savedScenariosSchema } from '@/lib/recovery-boundary';
import type { AirportClosure } from '@/types/contracts/generated';
import { RequestError } from './request';

const columns = 'id,airport,start_minute,end_minute,candidate_id,created_at';
export function databaseConfigured(): boolean { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY); }
async function databaseRequest(path: string, ownerHash: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) throw new RequestError(503, 'Saved scenarios are not configured yet.');
  const response = await fetch(url.replace(/\/$/, '') + '/rest/v1/' + path, {
    ...init, cache: 'no-store', signal: AbortSignal.timeout(8000),
    headers: { apikey: key, 'x-domino-owner': ownerHash, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init.headers },
  });
  if (!response.ok) {
    if (response.status === 429) throw new RequestError(429, 'Please wait before saving again.');
    throw new RequestError(503, 'The database is temporarily unavailable. Your current simulation is still available.');
  }
  return response.json() as Promise<unknown>;
}
export async function listScenarios(ownerHash: string) {
  const result = savedScenariosSchema.safeParse(await databaseRequest('domino_scenarios?select=' + columns + '&order=created_at.desc&limit=12', ownerHash));
  if (!result.success) throw new RequestError(503, 'Saved scenarios could not be read.');
  return result.data;
}
export async function saveScenario(ownerHash: string, closure: AirportClosure, candidateId?: string) {
  const result = await databaseRequest('domino_scenarios?select=' + columns, ownerHash, { method: 'POST', body: JSON.stringify({ owner_hash: ownerHash, airport: closure.airport, start_minute: closure.start, end_minute: closure.end, candidate_id: candidateId ?? null }) });
  if (!Array.isArray(result)) throw new RequestError(503, 'The scenario could not be saved.');
  const parsed = savedScenarioSchema.safeParse(result[0]);
  if (!parsed.success) throw new RequestError(503, 'The scenario could not be saved.');
  return parsed.data;
}
export async function claimAiBudget(ownerHash: string): Promise<boolean> {
  try { return await databaseRequest('rpc/domino_claim_ai', ownerHash, { method: 'POST', body: '{}' }) === true; }
  catch { return false; } // No provider spend when the durable quota cannot be enforced.
}
