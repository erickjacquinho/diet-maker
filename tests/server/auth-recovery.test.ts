import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRequestSupabaseClient: vi.fn(),
  enforceIdentityRateLimits: vi.fn(),
  getTrustedClientIp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  verifyOtp: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  cookiesToSet: [] as Array<{ name: string; value: string; options: Record<string, unknown> }>,
}));

vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/auth/supabase', () => ({
  createRequestSupabaseClient: mocks.createRequestSupabaseClient,
}));
vi.mock('../../src/lib/server/request-security', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/request-security')>()),
  enforceIdentityRateLimits: mocks.enforceIdentityRateLimits,
  getTrustedClientIp: mocks.getTrustedClientIp,
}));

import { POST as requestRecovery } from '../../src/app/api/auth/recovery/route';
import { POST as resetPassword } from '../../src/app/api/auth/reset-password/route';
import { GET as openRecoveryLink } from '../../src/app/auth/recovery/route';
import { recoveryCookieName, recoveryCookiePath, openAuthLinkToken, sealAuthLinkToken } from '../../src/lib/server/auth/link-token';

const csrfToken = randomBytes(32).toString('base64url');
const authCookie = {
  name: 'sb-local-auth-token',
  value: 'recovery-session-must-stay-server-side',
  options: { path: '/', httpOnly: true },
};

describe('Supabase password recovery endpoints', () => {
  beforeEach(() => {
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'local-publishable-key');
    vi.stubEnv('SERVER_MASTER_KEY', Buffer.alloc(32, 0x35).toString('base64'));
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'test-v1');

    mocks.cookiesToSet = [];
    mocks.enforceIdentityRateLimits.mockResolvedValue(undefined);
    mocks.getTrustedClientIp.mockReturnValue('203.0.113.9');
    mocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    mocks.verifyOtp.mockImplementation(async () => {
      mocks.cookiesToSet.push(authCookie);
      return { data: { user: { id: 'owner' }, session: { access_token: 'private-recovery-access-token' } }, error: null };
    });
    mocks.updateUser.mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
    mocks.signOut.mockImplementation(async () => {
      mocks.cookiesToSet.push({
        name: authCookie.name,
        value: '',
        options: { ...authCookie.options, maxAge: 0 },
      });
      return { error: null };
    });
    mocks.createRequestSupabaseClient.mockImplementation(() => ({
      supabase: {
        auth: {
          resetPasswordForEmail: mocks.resetPasswordForEmail,
          verifyOtp: mocks.verifyOtp,
          updateUser: mocks.updateUser,
          signOut: mocks.signOut,
        },
      },
      getCookiesToSet: () => [...mocks.cookiesToSet],
      getResponseHeaders: () => ({}),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns the same generic response for valid requests regardless of the address', async () => {
    mocks.resetPasswordForEmail
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({ data: {}, error: { message: 'provider-level result' } });
    const existing = await requestRecovery(jsonRequest('/api/auth/recovery', { email: ' Person@Example.invalid ', csrfToken }));
    const unknown = await requestRecovery(jsonRequest('/api/auth/recovery', { email: 'nobody@example.invalid', csrfToken }));

    expect(existing.status).toBe(202);
    expect(await existing.text()).toBe(await unknown.text());
    expect(existing.headers.get('cache-control')).toContain('no-store');
    expect(mocks.resetPasswordForEmail).toHaveBeenNthCalledWith(1, 'person@example.invalid', {
      redirectTo: 'http://localhost:3000/auth/recovery',
    });
    expect(mocks.enforceIdentityRateLimits).toHaveBeenNthCalledWith(1, 'recovery', 'person@example.invalid', '203.0.113.9');
    expect(mocks.enforceIdentityRateLimits).toHaveBeenNthCalledWith(2, 'recovery', 'nobody@example.invalid', '203.0.113.9');
  });

  it('rejects invalid email and CSRF before requesting a link', async () => {
    const invalid = await requestRecovery(jsonRequest('/api/auth/recovery', { email: 'nope', csrfToken }));
    const csrf = await requestRecovery(jsonRequest('/api/auth/recovery', {
      email: 'person@example.invalid',
      csrfToken: randomBytes(32).toString('base64url'),
    }));

    expect(invalid.status).toBe(400);
    expect(csrf.status).toBe(403);
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
    expect(mocks.enforceIdentityRateLimits).not.toHaveBeenCalled();
  });

  it('cleans the recovery URL, binds a short HttpOnly cookie, and never consumes OTP on GET', () => {
    const response = openRecoveryLink(new Request(
      'http://localhost:3000/auth/recovery?token_hash=synthetic-recovery-hash&type=recovery',
    ));
    const cookieHeader = response.headers.get('set-cookie') ?? '';
    const cookieValue = new RegExp(`${recoveryCookieName}=([^;]+)`).exec(cookieHeader)?.[1];

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/redefinir-senha');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(cookieHeader).toContain(`Path=${recoveryCookiePath}`);
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('Max-Age=900');
    expect(cookieValue).toBeTruthy();
    expect(decodeURIComponent(cookieValue!)).not.toContain('synthetic-recovery-hash');
    expect(openAuthLinkToken(decodeURIComponent(cookieValue!), 'recovery')).toMatchObject({
      purpose: 'recovery',
      tokenHash: 'synthetic-recovery-hash',
    });
    expect(openAuthLinkToken(decodeURIComponent(cookieValue!), 'email')).toBeNull();
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it('does not seal tokens for another OTP purpose', () => {
    const response = openRecoveryLink(new Request(
      'http://localhost:3000/auth/recovery?token_hash=synthetic-email-hash&type=email',
    ));

    expect(response.headers.get('location')).toBe('http://localhost:3000/redefinir-senha');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it('consumes the fixed recovery OTP only on POST, resets, globally signs out, and never returns the temporary session', async () => {
    const response = await resetPassword(jsonRequest('/api/auth/reset-password', {
      password: 'new-password-1234',
      passwordConfirmation: 'new-password-1234',
      csrfToken,
    }, { cookie: recoveryCookie(sealAuthLinkToken('synthetic-recovery-hash', 'recovery')) }));
    const responseText = await response.text();
    const cookieHeader = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(mocks.verifyOtp).toHaveBeenCalledWith({ token_hash: 'synthetic-recovery-hash', type: 'recovery' });
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'new-password-1234' });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'global' });
    expect(responseText).not.toMatch(/access_token|refresh_token|owner/);
    expect(cookieHeader).not.toContain(`${authCookie.name}=${authCookie.value}`);
    expect(cookieHeader).toContain(`${authCookie.name}=`);
    expect(cookieHeader).toContain('Max-Age=0');
    expect(cookieHeader).toContain(`${recoveryCookieName}=`);
  });

  it('rejects password mismatch before consuming the link', async () => {
    const response = await resetPassword(jsonRequest('/api/auth/reset-password', {
      password: 'new-password-1234',
      passwordConfirmation: 'different-password-1234',
      csrfToken,
    }, { cookie: recoveryCookie(sealAuthLinkToken('synthetic-recovery-hash', 'recovery')) }));

    expect(response.status).toBe(400);
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it('refuses expired or wrong-purpose cookies without consuming OTP', async () => {
    const expired = sealAuthLinkToken('synthetic-recovery-hash', 'recovery', Date.now() - 16 * 60 * 1000);
    const wrongPurpose = sealAuthLinkToken('synthetic-email-hash', 'email');
    const expiredResponse = await resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), {
      cookie: recoveryCookie(expired),
    }));
    const wrongPurposeResponse = await resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), {
      cookie: recoveryCookie(wrongPurpose),
    }));

    expect(expiredResponse.status).toBe(400);
    expect(wrongPurposeResponse.status).toBe(400);
    expect((await expiredResponse.text())).toContain('Solicite um novo link');
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it('rejects replayed OTP and asks for a new link', async () => {
    mocks.verifyOtp.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'expired or consumed' } });
    const response = await resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), {
      cookie: recoveryCookie(sealAuthLinkToken('already-used-hash', 'recovery')),
    }));

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('Solicite um novo link');
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it('allows only one of two concurrent requests to consume the same OTP', async () => {
    let consumed = false;
    mocks.verifyOtp.mockImplementation(async () => {
      await Promise.resolve();
      if (consumed) return { data: { user: null, session: null }, error: { message: 'expired or consumed' } };
      consumed = true;
      mocks.cookiesToSet.push(authCookie);
      return { data: { user: { id: 'owner' }, session: { access_token: 'private-recovery-access-token' } }, error: null };
    });
    const cookie = recoveryCookie(sealAuthLinkToken('concurrent-hash', 'recovery'));
    const [first, second] = await Promise.all([
      resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), { cookie })),
      resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), { cookie })),
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 400]);
    expect(mocks.verifyOtp).toHaveBeenCalledTimes(2);
    expect(mocks.updateUser).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect((await first.text()) + (await second.text())).not.toContain('private-recovery-access-token');
  });

  it('does not report success after OTP consumption if password update fails', async () => {
    mocks.updateUser.mockResolvedValue({ data: { user: null }, error: { message: 'update failed' } });
    const response = await resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), {
      cookie: recoveryCookie(sealAuthLinkToken('consumed-then-failed-hash', 'recovery')),
    }));

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('Solicite um novo link');
    expect(mocks.signOut).not.toHaveBeenCalledWith({ scope: 'global' });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('does not report reset success if global sign-out fails', async () => {
    mocks.signOut.mockImplementation(async ({ scope }: { scope: 'local' | 'global' }) => ({
      error: scope === 'global' ? { message: 'revocation failed' } : null,
    }));
    const response = await resetPassword(jsonRequest('/api/auth/reset-password', resetBody(), {
      cookie: recoveryCookie(sealAuthLinkToken('sign-out-failure-hash', 'recovery')),
    }));

    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('Senha alterada.');
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'global' });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});

function resetBody() {
  return { password: 'new-password-1234', passwordConfirmation: 'new-password-1234', csrfToken };
}

function recoveryCookie(token: string): string {
  return `dietmaker_csrf=${csrfToken}; ${recoveryCookieName}=${encodeURIComponent(token)}`;
}

function jsonRequest(
  path: string,
  body: Record<string, unknown>,
  options: { origin?: string; cookie?: string } = {},
): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: {
      origin: options.origin ?? 'http://localhost:3000',
      cookie: options.cookie ?? `dietmaker_csrf=${csrfToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
