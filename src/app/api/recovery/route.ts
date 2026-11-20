import * as z from '@/lib/zod';
import { NETWORK } from '@/lib/simulation/network';
import { buildRecovery } from '@/lib/simulation/recover';
import { closureSchema } from '@/lib/simulation/simulate';
import { boundedJson, closureInput, errorResponse, requireSameOrigin, RequestError, session } from '@/lib/server/request';
import { claimAiBudget } from '@/lib/server/database';
import { adviseWithGemini } from '@/lib/server/gemini';

export const dynamic = 'force-dynamic';
const schema = z.strictObject({ closure: closureSchema });
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const parsed = schema.safeParse(await boundedJson(request));
    if (!parsed.success) throw new RequestError(400, 'Choose a valid closure.');
    const closure = closureInput(parsed.data.closure);
    const owner = await session(request);
    let result = buildRecovery(NETWORK, closure);
    if (process.env.GEMINI_API_KEY) result = await claimAiBudget(owner.ownerHash) ? await adviseWithGemini(result) : { ...result, providerStatus: 'quota-limited' };
    const decision = { scenarioKey: result.scenarioKey, recommendedId: result.recommendedId, adviserMode: result.adviserMode, reasonCodes: result.reasonCodes, providerStatus: result.providerStatus };
    return Response.json(decision, { headers: { 'Cache-Control': 'no-store', 'Set-Cookie': owner.cookie } });
  } catch (error) { return errorResponse(error); }
}
