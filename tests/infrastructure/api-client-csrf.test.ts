import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('api client CSRF handling', () => {
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('shares one token request between concurrent first calls', async () => {
    const csrf = vi.fn(async () => json({ csrfToken: 'token-1' }));
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (url === '/api/auth/csrf' ? csrf() : json({ ok: true }))));
    const { apiRequest } = await import('@/lib/api-client/client');

    await Promise.all([
      apiRequest('/api/v1/patients/search', { method: 'POST', body: {} }),
      apiRequest('/api/v1/patients/summaries', { method: 'POST', body: {} }),
    ]);

    expect(csrf).toHaveBeenCalledTimes(1);
  });

  it('retries a rejected token once with a fresh one', async () => {
    let tokens = 0;
    const seen: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/auth/csrf') return json({ csrfToken: `token-${++tokens}` });
      const token = (init?.headers as Record<string, string>)['x-csrf-token'];
      seen.push(token);
      return token === 'token-1' ? json({ error: { code: 'CSRF_INVALID' } }, 403) : json({ ok: true });
    }));
    const { apiRequest } = await import('@/lib/api-client/client');

    await expect(apiRequest('/api/v1/patients', { method: 'POST', body: {} })).resolves.toEqual({ ok: true });
    expect(seen).toEqual(['token-1', 'token-2']);
  });
});
