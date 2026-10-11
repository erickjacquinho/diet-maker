import { afterEach, describe, expect, it, vi } from 'vitest';
import { revokePendingBrowserSession, signOutBrowserAccount } from '@/lib/application/browser-composition';

describe('browser account auth actions', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

  it('posts logout with the same-origin CSRF token', async () => {
    const csrfToken = 'a'.repeat(43);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ csrfToken }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('nutridiet.online-save-revocation-pending', '1');

    await signOutBrowserAccount();
    expect(localStorage.getItem('nutridiet.online-save-revocation-pending')).toBeNull();

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

  it('keeps the failure visible when logout is rejected', async () => {
    localStorage.setItem('nutridiet.online-save-revocation-pending', '1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ csrfToken: 'a'.repeat(43) }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(signOutBrowserAccount()).rejects.toThrow('Não foi possível encerrar a sessão da conta.');
    expect(localStorage.getItem('nutridiet.online-save-revocation-pending')).toBe('1');
  });

  it('revokes a failed logout before preparing another login', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ csrfToken: 'a'.repeat(43) }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('nutridiet.online-save-revocation-pending', '1');
    await revokePendingBrowserSession();
    expect(localStorage.getItem('nutridiet.online-save-revocation-pending')).toBeNull();
    await revokePendingBrowserSession();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shares pending revocation across concurrent login preparations', async () => {
    const fetchMock = vi.fn(async (url: string) => url === '/api/auth/csrf'
      ? Response.json({ csrfToken: 'a'.repeat(43) })
      : new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('nutridiet.online-save-revocation-pending', '1');
    await Promise.all([revokePendingBrowserSession(), revokePendingBrowserSession()]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
