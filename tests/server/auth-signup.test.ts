import { randomBytes, randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRequestSupabaseClient: vi.fn(),
  validateRequestSession: vi.fn(),
  validateSupabaseIdentity: vi.fn(),
  bootstrapProfessionalProfile: vi.fn(),
  getProfessionalProfile: vi.fn(),
  encryptProfessionalProfile: vi.fn(),
  enforceIdentityRateLimits: vi.fn(),
  getTrustedClientIp: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  cookiesToSet: [] as Array<{ name: string; value: string; options: Record<string, unknown> }>,
  responseHeaders: {} as Record<string, string>,
}));

vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/auth/supabase', () => ({
  createRequestSupabaseClient: mocks.createRequestSupabaseClient,
}));
vi.mock('../../src/lib/server/auth/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/auth/session')>()),
  validateRequestSession: mocks.validateRequestSession,
  validateSupabaseIdentity: mocks.validateSupabaseIdentity,
}));
vi.mock('../../src/lib/server/online-db/repository', () => ({
  bootstrapProfessionalProfile: mocks.bootstrapProfessionalProfile,
  getProfessionalProfile: mocks.getProfessionalProfile,
  findAuthSessionOwner: vi.fn(),
}));
vi.mock('../../src/lib/server/save-keys', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/save-keys')>()),
  encryptProfessionalProfile: mocks.encryptProfessionalProfile,
}));
vi.mock('../../src/lib/server/request-security', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/request-security')>()),
  enforceIdentityRateLimits: mocks.enforceIdentityRateLimits,
  getTrustedClientIp: mocks.getTrustedClientIp,
}));

import { parseSignupInput } from '../../src/lib/server/auth/registration';
import { POST as signup } from '../../src/app/api/auth/signup/route';
import { POST as login } from '../../src/app/api/auth/login/route';
import { POST as logout } from '../../src/app/api/auth/logout/route';
import { GET as session } from '../../src/app/api/auth/session/route';
import { POST as confirmEmail } from '../../src/app/api/auth/confirm-email/route';
import { POST as completeProfile } from '../../src/app/api/auth/complete-profile/route';
import { GET as openConfirmationLink } from '../../src/app/auth/confirm/route';
import { emailConfirmationCookieName, openAuthLinkToken, sealAuthLinkToken } from '../../src/lib/server/auth/link-token';

const ownerId = randomUUID();
const csrfToken = randomBytes(32).toString('base64url');
const verifiedUser = { id: ownerId, email: 'professional@example.invalid' };
const authUser = {
  id: ownerId,
  email: 'professional@example.invalid',
  email_confirmed_at: '2026-10-10T12:00:00.000Z',
  is_anonymous: false,
  identities: [{ identity_id: ownerId }],
};

describe('Supabase registration and login endpoints', () => {
  beforeEach(() => {
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'local-publishable-key');
    vi.stubEnv('SERVER_MASTER_KEY', Buffer.alloc(32, 0x35).toString('base64'));
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'test-v1');

    mocks.cookiesToSet = [];
    mocks.responseHeaders = {};
    mocks.signUp.mockResolvedValue({ data: { user: authUser, session: null }, error: null });
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: authUser, session: { access_token: 'server-only-access-token' } },
      error: null,
    });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.verifyOtp.mockResolvedValue({ data: { user: authUser, session: { access_token: 'otp-session' } }, error: null });
    mocks.createRequestSupabaseClient.mockReturnValue(createSupabaseContext());
    mocks.validateSupabaseIdentity.mockResolvedValue(verifiedUser);
    mocks.validateRequestSession.mockResolvedValue({ user: verifiedUser, cookiesToSet: [], responseHeaders: {} });
    mocks.bootstrapProfessionalProfile.mockResolvedValue(true);
    mocks.getProfessionalProfile.mockResolvedValue({ ownerId });
    mocks.encryptProfessionalProfile.mockReturnValue({
      ciphertext: Buffer.alloc(32, 0x21),
      iv: Buffer.alloc(12, 0x22),
      kekId: 'test-v1',
    });
    mocks.enforceIdentityRateLimits.mockResolvedValue(undefined);
    mocks.getTrustedClientIp.mockReturnValue('203.0.113.9');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('accepts both month ranges and zero/fractional metrics, normalizes only the intended fields', () => {
    const firstRange = parseSignupInput(signupBody({
      email: ' Professional@Example.Invalid ',
      emailConfirmation: 'professional@example.invalid',
      averagePatientsPerMonth: 0,
      experience: { kind: 'months_1_6' },
    }));
    const secondRange = parseSignupInput(signupBody({ experience: { kind: 'months_6_12' } }));
    const years = parseSignupInput(signupBody({
      averagePatientsPerMonth: 2.5,
      experience: { kind: 'years', value: 0.5 },
    }));

    expect(firstRange).toMatchObject({ email: 'professional@example.invalid', averagePatientsPerMonth: 0 });
    expect(secondRange.experience).toEqual({ kind: 'months_6_12' });
    expect(years.experience).toEqual({ kind: 'years', value: 0.5 });
    expect(years.password).toBe(signupBody().password);
  });

  it('rejects mismatch, invalid numeric ranges, unsupported experience and extra clinical fields', () => {
    expect(() => parseSignupInput(signupBody({ passwordConfirmation: 'not-the-same' }))).toThrow();
    expect(() => parseSignupInput(signupBody({ emailConfirmation: 'other@example.invalid' }))).toThrow();
    expect(() => parseSignupInput(signupBody({ averagePatientsPerMonth: -1 }))).toThrow();
    expect(() => parseSignupInput(signupBody({ averagePatientsPerMonth: Infinity }))).toThrow();
    expect(() => parseSignupInput(signupBody({ experience: { kind: 'months_6_12', value: 7 } }))).toThrow();
    expect(() => parseSignupInput(signupBody({ experience: { kind: 'years', value: -0.1 } }))).toThrow();
    expect(() => parseSignupInput({ ...signupBody(), patients: [{ name: 'clinical data' }] })).toThrow();
    expect(() => parseSignupInput(signupBody({ password: 'short' }))).toThrow();
    expect(() => parseSignupInput(signupBody({ password: 'é'.repeat(37) }))).toThrow();
  });

  it('signs up without user_metadata, stores a new profile encrypted, and responds generically', async () => {
    const response = await signup(jsonRequest('/api/auth/signup', signupBody()));
    const body = await response.text();

    expect(response.status).toBe(202);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body).not.toContain(ownerId);
    expect(body).not.toContain('access_token');
    expect(mocks.enforceIdentityRateLimits).toHaveBeenCalledWith('signup', 'professional@example.invalid', '203.0.113.9');
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'professional@example.invalid',
      password: signupBody().password,
      options: { emailRedirectTo: 'http://localhost:3000/auth/confirm' },
    });
    expect(mocks.encryptProfessionalProfile).toHaveBeenCalledWith(ownerId, {
      firstName: 'Nome',
      lastName: 'Sobrenome',
      averagePatientsPerMonth: 3.5,
      experience: { kind: 'months_1_6' },
    });
    expect(mocks.bootstrapProfessionalProfile).toHaveBeenCalledWith({
      ownerId,
      profileCipher: Buffer.alloc(32, 0x21),
      profileIv: Buffer.alloc(12, 0x22),
      profileKekId: 'test-v1',
    });
  });

  it('does not modify a duplicate account profile and keeps signup responses indistinguishable', async () => {
    const first = await signup(jsonRequest('/api/auth/signup', signupBody()));
    const firstBody = await first.text();
    mocks.bootstrapProfessionalProfile.mockClear();
    mocks.encryptProfessionalProfile.mockClear();
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { ...authUser, identities: [] }, session: null },
      error: null,
    });
    const duplicate = await signup(jsonRequest('/api/auth/signup', signupBody()));
    const duplicateBody = await duplicate.text();

    expect(first.status).toBe(202);
    expect(duplicate.status).toBe(202);
    expect(duplicateBody).toBe(firstBody);
    expect(mocks.bootstrapProfessionalProfile).not.toHaveBeenCalled();
    expect(mocks.encryptProfessionalProfile).not.toHaveBeenCalled();
  });

  it('logs in without returning tokens and sends profile-incomplete accounts to completion', async () => {
    mocks.getProfessionalProfile.mockResolvedValueOnce(null);
    mocks.cookiesToSet = [{ name: 'sb-session', value: 'opaque-cookie', options: { httpOnly: true, path: '/' } }];
    const response = await login(jsonRequest('/api/auth/login', {
      email: 'professional@example.invalid',
      password: signupBody().password,
      csrfToken,
    }));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('/criar-conta?completar=1');
    expect(body).not.toContain('server-only-access-token');
    expect(body).not.toContain('access_token');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'professional@example.invalid', password: signupBody().password });
    expect(mocks.validateSupabaseIdentity).toHaveBeenCalledWith(expect.any(Object), 'server-only-access-token');
  });

  it('sends a complete account to the dashboard after login', async () => {
    const response = await login(jsonRequest('/api/auth/login', {
      email: 'professional@example.invalid',
      password: signupBody().password,
      csrfToken,
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ user: verifiedUser, destination: '/dashboard' });
  });

  it('requires verified identity before inserting a missing profile and does not create saves', async () => {
    mocks.validateRequestSession.mockResolvedValueOnce({ user: null, cookiesToSet: [], responseHeaders: {} });
    const response = await completeProfile(jsonRequest('/api/auth/complete-profile', completeProfileBody()));

    expect(response.status).toBe(401);
    expect(mocks.bootstrapProfessionalProfile).not.toHaveBeenCalled();
  });

  it('creates a missing profile only after a verified session and remains insert-only', async () => {
    mocks.getProfessionalProfile.mockResolvedValueOnce(null);
    const response = await completeProfile(jsonRequest('/api/auth/complete-profile', completeProfileBody()));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('/dashboard');
    expect(body).not.toContain('/saves');
    expect(mocks.encryptProfessionalProfile).toHaveBeenCalledWith(ownerId, {
      firstName: 'Nome',
      lastName: 'Sobrenome',
      averagePatientsPerMonth: 3.5,
      experience: { kind: 'years', value: 0.5 },
    });
    expect(mocks.bootstrapProfessionalProfile).toHaveBeenCalledTimes(1);
    expect(mocks.bootstrapProfessionalProfile).toHaveBeenCalledWith(expect.objectContaining({ ownerId }));
  });

  it('login and signup POST handlers reject invalid Origin and CSRF before calling Auth', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        origin: 'https://attacker.example',
        cookie: `dietmaker_csrf=${csrfToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(signupBody()),
    });
    const response = await signup(request);

    expect(response.status).toBe(403);
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.enforceIdentityRateLimits).not.toHaveBeenCalled();
  });

  it('confirmation GET redirects to a clean URL and seals the token into a purpose-bound cookie', async () => {
    const response = openConfirmationLink(new Request(
      'http://localhost:3000/auth/confirm?token_hash=synthetic-token-hash&type=recovery',
    ));
    const location = response.headers.get('location') ?? '';
    const setCookie = response.headers.get('set-cookie') ?? '';
    const cookieValue = new RegExp(`${emailConfirmationCookieName}=([^;]+)`).exec(setCookie)?.[1];

    expect(response.status).toBe(307);
    expect(location).toBe('http://localhost:3000/criar-conta?confirmar=1');
    expect(location).not.toContain('token_hash');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Max-Age=900');
    expect(cookieValue).toBeTruthy();
    expect(decodeURIComponent(cookieValue!)).not.toContain('synthetic-token-hash');
    expect(openAuthLinkToken(decodeURIComponent(cookieValue!), 'email')).toMatchObject({
      purpose: 'email',
      tokenHash: 'synthetic-token-hash',
    });
    expect(openAuthLinkToken(decodeURIComponent(cookieValue!), 'recovery')).toBeNull();
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it('consumes confirmation only through POST with the fixed email OTP type and then signs out locally', async () => {
    const sealedToken = sealAuthLinkToken('synthetic-token-hash', 'email');
    const response = await confirmEmail(jsonRequest('/api/auth/confirm-email', { csrfToken }, {
      cookie: `dietmaker_csrf=${csrfToken}; ${emailConfirmationCookieName}=${encodeURIComponent(sealedToken)}`,
    }));

    expect(response.status).toBe(200);
    expect(mocks.verifyOtp).toHaveBeenCalledWith({ token_hash: 'synthetic-token-hash', type: 'email' });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect((await response.text())).not.toContain('access_token');
  });

  it('logout revokes only the current session after CSRF validation', async () => {
    const response = await logout(jsonRequest('/api/auth/logout', { csrfToken }));

    expect(response.status).toBe(204);
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('session endpoint never returns Auth token fields', async () => {
    const response = await session(new Request('http://localhost:3000/api/auth/session'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).not.toMatch(/access_token|refresh_token/);
    expect(body).toContain(ownerId);
    expect(body).toContain('/dashboard');
  });
});

function signupBody(overrides: Record<string, unknown> = {}) {
  return {
    firstName: '  Nome ',
    lastName: ' Sobrenome  ',
    email: 'Professional@example.invalid',
    emailConfirmation: 'professional@example.invalid',
    password: 'strong-password-123',
    passwordConfirmation: 'strong-password-123',
    averagePatientsPerMonth: 3.5,
    experience: { kind: 'months_1_6' },
    csrfToken,
    ...overrides,
  };
}

function completeProfileBody() {
  return {
    firstName: 'Nome',
    lastName: 'Sobrenome',
    averagePatientsPerMonth: 3.5,
    experience: { kind: 'years', value: 0.5 },
    csrfToken,
  };
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

function createSupabaseContext() {
  const supabase = {
    auth: {
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
      verifyOtp: mocks.verifyOtp,
    },
  };
  return {
    supabase,
    getCookiesToSet: () => [...mocks.cookiesToSet],
    getResponseHeaders: () => ({ ...mocks.responseHeaders }),
  };
}
