import { randomUUID } from 'node:crypto';
import { clinicLogo } from '../fixtures/clinic-logo';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  validateRequestSession: vi.fn(),
  validateProfileRequestSession: vi.fn(),
  getProfessionalProfile: vi.fn(),
  updateProfessionalProfile: vi.fn(),
  updateSaveLabel: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/auth/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/auth/session')>()),
  validateRequestSession: mocks.validateRequestSession,
  validateProfileRequestSession: mocks.validateProfileRequestSession,
}));
vi.mock('../../src/lib/server/online-db/repository', () => ({
  getProfessionalProfile: mocks.getProfessionalProfile,
  updateProfessionalProfile: mocks.updateProfessionalProfile,
}));

import { GET as getProfile, PUT as putProfile } from '../../src/app/api/profile/route';
import { decryptServerValue, encryptProfessionalProfile } from '../../src/lib/server/save-keys';

const ownerId = randomUUID();
const csrfToken = Buffer.alloc(32, 0x41).toString('base64url');
const signupProfile = {
  firstName: 'Ana',
  lastName: 'Souza',
  averagePatientsPerMonth: 40,
  experience: { kind: 'months_6_12' },
};

function storeProfile(profile: object) {
  const encrypted = encryptProfessionalProfile(ownerId, profile);
  mocks.getProfessionalProfile.mockResolvedValue({
    ownerId,
    profileCipher: encrypted.ciphertext,
    profileIv: encrypted.iv,
    profileKekId: encrypted.kekId,
    createdAt: new Date(),
  });
}

function jsonRequest(url: string, method: string, body: unknown): Request {
  return new Request(url, {
    method,
    headers: {
      origin: 'http://localhost:3000',
      'content-type': 'application/json',
      cookie: `dietmaker_csrf=${csrfToken}`,
    },
    body: JSON.stringify(body),
  });
}

describe('professional profile routes', () => {
  beforeEach(() => {
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('SERVER_MASTER_KEY', Buffer.alloc(32, 0x24).toString('base64'));
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'profile-test-v1');
    const session = { user: { id: ownerId, email: 'ana@example.invalid' }, cookiesToSet: [], responseHeaders: {} };
    mocks.validateRequestSession.mockResolvedValue(session);
    mocks.validateProfileRequestSession.mockResolvedValue({ ...session, profileExists: true });
    storeProfile(signupProfile);
    mocks.updateProfessionalProfile.mockImplementation(async (input) => {
      mocks.getProfessionalProfile.mockResolvedValue({
        ownerId,
        profileCipher: input.profileCipher,
        profileIv: input.profileIv,
        profileKekId: input.profileKekId,
        createdAt: new Date(),
      });
      return true;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns the decrypted signup profile with defaults and the login e-mail', async () => {
    const response = await getProfile(new Request('http://localhost:3000/api/profile'));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    await expect(response.json()).resolves.toMatchObject({
      accountEmail: 'ana@example.invalid',
      profile: { ...signupProfile, crn: null, showOnDocuments: true },
    });
  });

  it('requires a session and a completed profile', async () => {
    mocks.validateRequestSession.mockResolvedValueOnce({ user: null, cookiesToSet: [], responseHeaders: {} });
    expect((await getProfile(new Request('http://localhost:3000/api/profile'))).status).toBe(401);

    mocks.getProfessionalProfile.mockResolvedValueOnce(null);
    expect((await getProfile(new Request('http://localhost:3000/api/profile'))).status).toBe(403);
  });

  it('re-encrypts the complete profile and returns the stored version', async () => {
    const response = await putProfile(jsonRequest('http://localhost:3000/api/profile', 'PUT', {
      ...signupProfile,
      crn: 'CRN-3 12345',
      instagram: 'ana.nutri',
      showOnDocuments: false,
      documentLogo: clinicLogo,
      agendaRemindersEnabled: false,
      csrfToken,
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      profile: { crn: 'CRN-3 12345', instagram: '@ana.nutri', showOnDocuments: false, documentLogo: clinicLogo, agendaRemindersEnabled: false },
    });
    const stored = mocks.updateProfessionalProfile.mock.calls[0][0];
    expect(stored.ownerId).toBe(ownerId);
    expect(stored.profileCipher.toString('utf8')).not.toContain('CRN-3');
    expect(stored.profileCipher.toString('utf8')).not.toContain('data:image/png');
  });

  it('rejects invalid fields, unknown keys and a missing CSRF token without writing', async () => {
    for (const body of [
      { ...signupProfile, contactEmail: 'ana@', csrfToken },
      { ...signupProfile, documentLogo: 'https://example.invalid/logo.png', csrfToken },
      { ...signupProfile, ownerId: randomUUID(), csrfToken },
      { ...signupProfile },
    ]) {
      const response = await putProfile(jsonRequest('http://localhost:3000/api/profile', 'PUT', body));
      expect(response.status).toBe(400);
    }
    const crossSite = jsonRequest('http://localhost:3000/api/profile', 'PUT', { ...signupProfile, csrfToken });
    crossSite.headers.set('origin', 'https://attacker.example');
    expect((await putProfile(crossSite)).status).toBe(403);
    expect(mocks.updateProfessionalProfile).not.toHaveBeenCalled();
  });

  it('accepts a valid PNG larger than the old body limit and rejects requests above the new bound', async () => {
    const bytes = Buffer.alloc(20 * 1024);
    Buffer.from(clinicLogo.slice(22), 'base64').copy(bytes);
    const response = await putProfile(jsonRequest('http://localhost:3000/api/profile', 'PUT', {
      ...signupProfile, documentLogo: `data:image/png;base64,${bytes.toString('base64')}`, csrfToken,
    }));
    expect(response.status).toBe(200);
    const tooLarge = await putProfile(jsonRequest('http://localhost:3000/api/profile', 'PUT', {
      ...signupProfile, documentLogo: 'A'.repeat(200 * 1024), csrfToken,
    }));
    expect(tooLarge.status).toBe(413);
    expect(mocks.updateProfessionalProfile).toHaveBeenCalledOnce();
  });
});
