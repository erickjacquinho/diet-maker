import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  findAuthSessionOwner: vi.fn(),
  getProfessionalProfile: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@supabase/ssr', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@supabase/ssr')>()),
  createServerClient: mocks.createServerClient,
}));
vi.mock('../../src/lib/server/online-db/repository', () => ({
  findAuthSessionOwner: mocks.findAuthSessionOwner,
  getProfessionalProfile: mocks.getProfessionalProfile,
}));

import { createRequestSupabaseClient } from '../../src/lib/server/auth/supabase';
import { applyAuthResponseState, validateProfileRequestSession, validateRequestSession } from '../../src/lib/server/auth/session';
import { GET as getSessionRoute } from '../../src/app/api/auth/session/route';

const ownerId = randomUUID();
const sessionId = randomUUID();

describe('request-scoped Supabase Auth session', () => {
  beforeEach(() => {
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'local-publishable-key');
    mocks.findAuthSessionOwner.mockResolvedValue(ownerId);
    mocks.getProfessionalProfile.mockResolvedValue({ ownerId });
    mocks.createServerClient.mockReturnValue({ auth: createAuthClient() });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('creates a fresh SSR client with request cookies and HttpOnly refresh cookies', () => {
    const request = new Request('http://localhost:3000/api/auth/session', {
      headers: { cookie: 'first=one; second=two' },
    });
    const context = createRequestSupabaseClient(request);
    const options = mocks.createServerClient.mock.calls[0][2];

    expect(options.cookies.getAll()).toEqual([
      { name: 'first', value: 'one' },
      { name: 'second', value: 'two' },
    ]);
    expect(options.cookieOptions).toMatchObject({ httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
    options.cookies.setAll([
      { name: 'sb-refreshed', value: 'opaque-refresh', options: { httpOnly: true, path: '/' } },
    ], { 'cache-control': 'private, no-store' });
    expect(context.getCookiesToSet()).toEqual([
      { name: 'sb-refreshed', value: 'opaque-refresh', options: { httpOnly: true, path: '/' } },
    ]);
    expect(context.getResponseHeaders()).toEqual({ 'cache-control': 'private, no-store' });
  });

  it('accepts only a confirmed non-anonymous user with a valid session row', async () => {
    const result = await validateRequestSession(new Request('http://localhost:3000/api/private'));

    expect(result.user).toEqual({ id: ownerId, email: 'professional@example.invalid' });
    expect(mocks.findAuthSessionOwner).toHaveBeenCalledWith(sessionId);
    expect(result).not.toHaveProperty('sessionId');
    expect(JSON.stringify(result)).not.toMatch(/access_token|refresh_token|opaque/);
  });

  it('requires an existing professional profile before a private account operation', async () => {
    const request = new Request('http://localhost:3000/api/saves');
    const complete = await validateProfileRequestSession(request);
    expect(complete).toMatchObject({ user: { id: ownerId }, profileExists: true });
    expect(mocks.getProfessionalProfile).toHaveBeenCalledWith(ownerId);

    mocks.getProfessionalProfile.mockResolvedValueOnce(null);
    const incomplete = await validateProfileRequestSession(request);
    expect(incomplete).toMatchObject({ user: { id: ownerId }, profileExists: false });
  });

  it('returns dashboard as the complete-account destination and keeps profile completion gated', async () => {
    const complete = await getSessionRoute(new Request('http://localhost:3000/api/auth/session'));
    expect(await complete.json()).toMatchObject({
      user: { id: ownerId },
      profileComplete: true,
      destination: '/dashboard',
    });

    mocks.getProfessionalProfile.mockResolvedValueOnce(null);
    const incomplete = await getSessionRoute(new Request('http://localhost:3000/api/auth/session'));
    expect(await incomplete.json()).toMatchObject({
      user: { id: ownerId },
      profileComplete: false,
      destination: '/criar-conta?completar=1',
    });
  });

  it('rejects anonymous and unverified users before checking the session owner', async () => {
    mocks.createServerClient.mockReturnValueOnce({ auth: createAuthClient({ is_anonymous: true }) });
    expect((await validateRequestSession(new Request('http://localhost:3000/api/private'))).user).toBeNull();
    expect(mocks.findAuthSessionOwner).not.toHaveBeenCalled();

    mocks.findAuthSessionOwner.mockClear();
    mocks.createServerClient.mockReturnValue({ auth: createAuthClient({ email_confirmed_at: undefined }) });
    expect((await validateRequestSession(new Request('http://localhost:3000/api/private'))).user).toBeNull();
    expect(mocks.findAuthSessionOwner).not.toHaveBeenCalled();
  });

  it('rejects revoked JWTs and missing, mismatched, or wrong-owner auth.sessions rows', async () => {
    const revokedAuth = createAuthClient();
    revokedAuth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('revoked-token-secret') });
    mocks.createServerClient.mockReturnValueOnce({ auth: revokedAuth });
    expect((await validateRequestSession(new Request('http://localhost:3000/api/private'))).user).toBeNull();
    expect(revokedAuth.getClaims).not.toHaveBeenCalled();

    mocks.createServerClient.mockReturnValue({ auth: createAuthClient() });
    mocks.findAuthSessionOwner.mockResolvedValueOnce(null);
    expect((await validateRequestSession(new Request('http://localhost:3000/api/private'))).user).toBeNull();

    mocks.findAuthSessionOwner.mockClear();
    mocks.createServerClient.mockReturnValue({ auth: createAuthClient({ id: randomUUID() }) });
    expect((await validateRequestSession(new Request('http://localhost:3000/api/private'))).user).toBeNull();
    expect(mocks.findAuthSessionOwner).not.toHaveBeenCalledWith(sessionId);
  });

  it('ignores a submitted owner and never calls getSession as the identity authority', async () => {
    const auth = createAuthClient();
    mocks.createServerClient.mockReturnValue({ auth });
    const request = new Request('http://localhost:3000/api/private', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ownerId: randomUUID() }),
    });

    const result = await validateRequestSession(request);
    expect(result.user?.id).toBe(ownerId);
    expect(auth.getSession).not.toHaveBeenCalled();
  });

  it('copies refresh cookies and cache headers onto the final private response', () => {
    const response = NextResponse.json({ ok: true });
    applyAuthResponseState(response, {
      cookiesToSet: [{
        name: 'sb-session',
        value: 'rotated-cookie',
        options: { httpOnly: true, secure: true, sameSite: 'lax', path: '/' },
      }],
      responseHeaders: { 'expires': '0', pragma: 'no-cache' },
    });

    expect(response.cookies.get('sb-session')).toMatchObject({ value: 'rotated-cookie', httpOnly: true, secure: true });
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
  });
});

function createAuthClient(overrides: Record<string, unknown> = {}) {
  return {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: ownerId,
          email: 'professional@example.invalid',
          email_confirmed_at: '2026-10-10T12:00:00.000Z',
          is_anonymous: false,
          user_metadata: { ownerId: randomUUID() },
          ...overrides,
        },
      },
      error: null,
    }),
    getClaims: vi.fn().mockResolvedValue({
      data: { claims: { sub: ownerId, session_id: sessionId, is_anonymous: false } },
      error: null,
    }),
    getSession: vi.fn(),
  };
}
