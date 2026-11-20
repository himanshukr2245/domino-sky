import * as z from '@/lib/zod';
import { NETWORK } from '@/lib/simulation/network';
import { buildRecovery } from '@/lib/simulation/recover';
import { closureSchema } from '@/lib/simulation/simulate';
import { listScenarios, saveScenario } from '@/lib/server/database';
import { boundedJson, closureInput, errorResponse, requireSameOrigin, RequestError, session } from '@/lib/server/request';

export const dynamic = 'force-dynamic';
const schema = z.strictObject({ closure: closureSchema, candidateId: z.optional(z.string().check(z.regex(/^plan-[a-f0-9]{1,8}$/))) });
export async function GET(request: Request) {
  try {
    const owner = await session(request);
    return Response.json(await listScenarios(owner.ownerHash), { headers: { 'Cache-Control': 'no-store', 'Set-Cookie': owner.cookie } });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const parsed = schema.safeParse(await boundedJson(request));
    if (!parsed.success) throw new RequestError(400, 'Choose a valid scenario.');
    const closure = closureInput(parsed.data.closure);
    if (parsed.data.candidateId && !buildRecovery(NETWORK, closure).candidates.some(candidate => candidate.id === parsed.data.candidateId && candidate.feasible)) throw new RequestError(400, 'Choose a validated recovery candidate.');
    const owner = await session(request);
    const result = await saveScenario(owner.ownerHash, closure, parsed.data.candidateId);
    return Response.json(result, { status: 201, headers: { 'Cache-Control': 'no-store', 'Set-Cookie': owner.cookie } });
  } catch (error) { return errorResponse(error); }
}
