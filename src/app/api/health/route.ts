import { NETWORK } from '@/lib/simulation/network';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get('deep') === '1';
  return Response.json({ status: 'ok', release: process.env.NEXT_PUBLIC_RELEASE ?? 'local', environment: process.env.NODE_ENV, at: new Date().toISOString(), ...(deep ? { checks: { network: 'ok', flights: NETWORK.flights.length, recovery: 'not-implemented' } } : {}) }, { headers });
}
export function HEAD() { return new Response(null, { status: 200, headers }); }
