import { describe, expect, it } from 'vitest';
import { boundedJson, errorResponse, requireSameOrigin, RequestError, session } from './request';

describe('public server boundaries', () => {
  it('rejects cross-origin and missing-origin writes', () => {
    expect(() => requireSameOrigin(new Request('https://domino.example/api', { headers: { Origin: 'https://other.example' } }))).toThrow();
    expect(() => requireSameOrigin(new Request('https://domino.example/api'))).toThrow();
    expect(() => requireSameOrigin(new Request('https://domino.example/api', { headers: { Origin: 'https://domino.example' } }))).not.toThrow();
    expect(() => requireSameOrigin(new Request('http://localhost:3100/api', { headers: { Host: '127.0.0.1:3100', Origin: 'http://127.0.0.1:3100' } }))).not.toThrow();
  });
  it('bounds actual streamed bytes, even without Content-Length', async () => {
    const request = new Request('https://domino.example/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'x'.repeat(5000) }) });
    await expect(boundedJson(request)).rejects.toMatchObject({ status: 413 });
  });
  it('rejects malformed JSON and unsupported media types', async () => {
    await expect(boundedJson(new Request('https://domino.example/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' }))).rejects.toMatchObject({ status: 400 });
    await expect(boundedJson(new Request('https://domino.example/api', { method: 'POST', body: '{}' }))).rejects.toMatchObject({ status: 415 });
  });
  it('preserves an HttpOnly secure capability and isolates independent browsers', async () => {
    const first = await session(new Request('https://domino.example/api'));
    const restored = await session(new Request('https://domino.example/api', { headers: { Cookie: first.cookie.split(';')[0] } }));
    const other = await session(new Request('https://domino.example/api'));
    expect(restored.ownerHash).toBe(first.ownerHash);
    expect(other.ownerHash).not.toBe(first.ownerHash);
    expect(first.cookie).toContain('HttpOnly'); expect(first.cookie).toContain('SameSite=Strict'); expect(first.cookie).toContain('; Secure');
    expect(first.ownerHash).toMatch(/^[a-f0-9]{64}$/);
  });
  it('never returns internal diagnostics in generic failures', async () => {
    const response = errorResponse(new Error('test-private-diagnostic'));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('test-private-diagnostic');
    expect(errorResponse(new RequestError(400, 'Check the scenario.')).status).toBe(400);
  });
});
