import 'server-only';
import { NETWORK } from '@/lib/simulation/network';
import { validateClosure } from '@/lib/simulation/simulate';

export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function closureInput(value: unknown) {
  try { return validateClosure(NETWORK, value); }
  catch { throw new RequestError(400, 'Choose a valid supplied airport and closure window.'); }
}
export function requireSameOrigin(request: Request): void {
  const target = new URL(request.url);
  const incomingHost = request.headers.get('host');
  if (incomingHost) target.host = incomingHost;
  if (request.headers.get('origin') !== target.origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new RequestError(403, 'Use this action from the Domino Sky app.');
}
export async function boundedJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new RequestError(415, 'Send JSON for this action.');
  if (Number(request.headers.get('content-length')) > 4096) throw new RequestError(413, 'This request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'A request body is required.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > 4096) { await reader.cancel(); throw new RequestError(413, 'This request is too large.'); }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400, 'The request could not be read.');
  }
}
export async function session(request: Request) {
  const secure = new URL(request.url).protocol === 'https:';
  const name = secure ? '__Host-ds_session' : 'ds_session';
  const existing = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(name + '='))?.slice(name.length + 1);
  const token = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : [...crypto.getRandomValues(new Uint8Array(32))].map(value => value.toString(16).padStart(2, '0')).join('');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const ownerHash = [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('');
  return { ownerHash, cookie: name + '=' + token + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000' + (secure ? '; Secure' : '') };
}
export function errorResponse(error: unknown): Response {
  return Response.json({ message: error instanceof RequestError ? error.message : 'This action is temporarily unavailable.' }, { status: error instanceof RequestError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
}
