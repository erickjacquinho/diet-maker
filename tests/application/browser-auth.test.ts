import { afterEach, describe, expect, it, vi } from 'vitest';
import { signOutBrowserAccount } from '@/lib/application/browser-composition';

describe('browser account auth actions', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('posts logout with the same-origin CSRF token', async () => {
    const csrfToken = 'a'.repeat(43);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ csrfToken }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await signOutBrowserAccount();

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/auth/csrf', expect.objectContaining({
      cache: 'no-store',
      credentials: 'same-origin',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/logout', expect.objectContaining({
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      body: JSON.stringify({ csrfToken }),
    }));
  });
});
