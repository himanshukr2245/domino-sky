import { afterEach, describe, expect, it, vi } from 'vitest';
import { NETWORK } from '@/lib/simulation/network';
import { buildRecovery } from '@/lib/simulation/recover';
import { adviseWithGemini } from './gemini';

afterEach(() => vi.unstubAllEnvs());
const recovery = buildRecovery(NETWORK, { airport: 'BOM', start: 870, end: 960 });
const envelope = (value: unknown) => Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] });

describe('Gemini fact boundary', () => {
  it('uses a private header and binds the response to a computed candidate', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-provider-value');
    const provider = vi.fn(async () => envelope({ candidateId: recovery.recommendedId, reasonCodes: ['PROTECT_CREW'] }));
    const result = await adviseWithGemini(recovery, provider);
    expect(result.adviserMode).toBe('gemini');
    expect(result.candidates).toEqual(recovery.candidates);
    expect(result.recommendedId).toBe(recovery.recommendedId);
    const call = provider.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).not.toContain('test-provider-value');
    expect(call[1].headers).toMatchObject({ 'x-goog-api-key': 'test-provider-value' });
  });
  it.each([
    { candidateId: 'invented', reasonCodes: [] },
    { candidateId: recovery.recommendedId, reasonCodes: [], savedPassengers: 999999 },
    { candidateId: recovery.recommendedId, reasonCodes: ['<script>bad</script>'] },
  ])('rejects invented or unbound model content', async value => {
    vi.stubEnv('GEMINI_API_KEY', 'test-provider-value');
    const result = await adviseWithGemini(recovery, async () => envelope(value));
    expect(result).toMatchObject({ adviserMode: 'rules', providerStatus: 'invalid-output' });
    expect(result.candidates).toEqual(recovery.candidates);
  });
  it('keeps the rules recommendation on provider errors and malformed responses', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-provider-value');
    expect(await adviseWithGemini(recovery, async () => new Response('private provider diagnostics', { status: 429 }))).toMatchObject({ adviserMode: 'rules', providerStatus: 'unavailable' });
    expect(await adviseWithGemini(recovery, async () => { throw new Error('private provider diagnostics'); })).toMatchObject({ adviserMode: 'rules', providerStatus: 'unavailable' });
    expect(await adviseWithGemini(recovery, async () => Response.json({ bad: 'response' }))).toMatchObject({ adviserMode: 'rules', providerStatus: 'invalid-output' });
  });
  it('does not call a provider when no key is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const provider = vi.fn();
    expect(await adviseWithGemini(recovery, provider)).toMatchObject({ adviserMode: 'rules', providerStatus: 'not-configured' });
    expect(provider).not.toHaveBeenCalled();
  });
});
