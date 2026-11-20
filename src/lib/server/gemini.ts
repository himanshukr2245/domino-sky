import 'server-only';
import * as z from '@/lib/zod';
import { bindRecommendation } from '@/lib/simulation/recover';
import type { RecoveryResponse } from '@/types/contracts/generated';

const reasonCodes = ['LIMIT_CANCELLATIONS', 'PROTECT_CREW', 'PROTECT_CONNECTIONS', 'REDUCE_DELAY', 'NO_IMPROVEMENT'] as const;
const decisionSchema = z.strictObject({ candidateId: z.string().check(z.maxLength(32)), reasonCodes: z.array(z.enum(reasonCodes)).check(z.maxLength(4)) });
const envelopeSchema = z.object({ candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.optional(z.string().check(z.maxLength(8192))) })) }) })).check(z.maxLength(4)) });

export async function adviseWithGemini(response: RecoveryResponse, fetcher: typeof fetch = fetch): Promise<RecoveryResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ...response, adviserMode: 'rules', providerStatus: 'not-configured' };
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  if (!/^[a-z0-9.-]{1,80}$/.test(model)) return { ...response, adviserMode: 'rules', providerStatus: 'unavailable' };
  const candidates = response.candidates.map(candidate => ({ id: candidate.id, title: candidate.title, actions: candidate.actions, feasible: candidate.feasible, metrics: candidate.result.metrics }));
  try {
    const result = await fetcher('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'Choose a verified feasible airline recovery candidate. Facts and metrics are authoritative. Follow lexicographic priority: feasibility, fewer canceled boardings, fewer failed-connection passengers, lower passenger delay, fewer actions. Do not invent actions, quantities or candidate IDs. Return only the requested candidateId and allowed reasonCodes.' }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ scenarioKey: response.scenarioKey, candidates }) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json', responseJsonSchema: { type: 'object', properties: { candidateId: { type: 'string', enum: response.candidates.filter(candidate => candidate.feasible).map(candidate => candidate.id) }, reasonCodes: { type: 'array', items: { type: 'string', enum: [...reasonCodes] }, maxItems: 4 } }, required: ['candidateId', 'reasonCodes'], additionalProperties: false } },
      }),
    });
    if (!result.ok) return { ...response, adviserMode: 'rules', providerStatus: 'unavailable' };
    const envelope = envelopeSchema.safeParse(await result.json());
    if (!envelope.success) return { ...response, adviserMode: 'rules', providerStatus: 'invalid-output' };
    const text = envelope.data.candidates[0]?.content.parts.map(part => part.text ?? '').join('');
    const parsed = decisionSchema.safeParse(JSON.parse(text || '{}'));
    const bound = parsed.success ? bindRecommendation(response, parsed.data) : undefined;
    if (!bound) return { ...response, adviserMode: 'rules', providerStatus: 'invalid-output' };
    return { ...response, recommendedId: bound.candidateId, reasonCodes: bound.reasonCodes, adviserMode: 'gemini', providerStatus: 'ready' };
  } catch { return { ...response, adviserMode: 'rules', providerStatus: 'unavailable' }; }
}
