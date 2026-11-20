import * as z from '@/lib/zod';

export const adviserDecisionSchema = z.strictObject({
  scenarioKey: z.string().check(z.maxLength(80)), recommendedId: z.string().check(z.regex(/^plan-[a-f0-9]{1,8}$/)),
  adviserMode: z.enum(['gemini', 'rules']), reasonCodes: z.array(z.enum(['LIMIT_CANCELLATIONS', 'PROTECT_CREW', 'PROTECT_CONNECTIONS', 'REDUCE_DELAY', 'NO_IMPROVEMENT'])).check(z.maxLength(4)),
  providerStatus: z.enum(['ready', 'not-configured', 'unavailable', 'invalid-output', 'quota-limited']),
});
export const savedScenarioSchema = z.strictObject({
  id: z.string().check(z.regex(/^[a-f0-9-]{36}$/)), airport: z.string().check(z.regex(/^[A-Z]{3}$/)),
  start_minute: z.int().check(z.minimum(0), z.maximum(1439)), end_minute: z.int().check(z.minimum(1), z.maximum(2879)),
  candidate_id: z.nullable(z.string().check(z.regex(/^plan-[a-f0-9]{1,8}$/))), created_at: z.string().check(z.maxLength(50)),
});
export const savedScenariosSchema = z.array(savedScenarioSchema).check(z.maxLength(12));
export type SavedScenario = z.infer<typeof savedScenarioSchema>;
