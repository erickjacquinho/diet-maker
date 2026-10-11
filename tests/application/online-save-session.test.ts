// @vitest-environment node

import { randomBytes, randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { encodeBindingProof, type ProtectedSaveGrant } from '@/lib/domain/protected-save';
import {
  createOnlineSaveSession,
  guardOnlineSaveApplication,
  isSaveOpenableAtLocation,
  OnlineSaveSessionError,
  type OnlineSaveRevocationMarker,
} from '@/lib/application/online-save-session';

const eightHours = 8 * 60 * 60 * 1000;
const baseTime = 1_800_000_000_000;

async function createGrant(overrides: Partial<ProtectedSaveGrant> = {}): Promise<ProtectedSaveGrant> {
  const rawKey = randomBytes(32);
  const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  rawKey.fill(0);
  return {
    ownerId: randomUUID(),
    saveId: randomUUID(),
    localAccountId: 'local-account-nanoid-16',
    keyId: randomUUID(),
    bindingProof: encodeBindingProof('session-test-v1', Buffer.alloc(32, 0x41).toString('base64url')),
    authorizedAt: baseTime,
    expiresAt: baseTime + eightHours,
    key,
    ...overrides,
  };
}

function createClock() {
  return { wall: baseTime, monotonic: 1_000 };
}

function createMarker(): OnlineSaveRevocationMarker & { pending: boolean } {
  const marker = { pending: false };
  return {
    get pending() { return marker.pending; },
    isPending: () => marker.pending,
    markPending: () => { marker.pending = true; },
    clear: () => { marker.pending = false; },
  };
}

describe('online save session', () => {
  it('rejects captured reads and mutations before dispatch after logout or expiry', async () => {
    const clock = createClock();
    const grant = await createGrant();
    const session = createOnlineSaveSession({ now: () => clock.wall, monotonicNow: () => clock.monotonic, isOnline: () => true });
    await session.authorize(grant);
    let mutations = 0;
    const application = guardOnlineSaveApplication({
      read: async () => 'clinical data',
      mutate: async () => { mutations += 1; },
    }, session, grant);
    const captured = application.mutate;
    await captured();
    session.lock();
    await expect(captured()).rejects.toMatchObject({ code: 'SAVE_LOCKED' });
    await expect(application.read()).rejects.toMatchObject({ code: 'SAVE_LOCKED' });
    expect(mutations).toBe(1);
    await session.authorize(grant);
    clock.wall = grant.expiresAt;
    await expect(captured()).rejects.toMatchObject({ code: 'SAVE_LOCKED' });
    expect(mutations).toBe(1);
  });
  it('starts locked, accepts only a non-extractable grant, and never includes the key in snapshots', async () => {
    const clock = createClock();
    const grant = await createGrant();
    const session = createOnlineSaveSession({
      now: () => clock.wall,
      monotonicNow: () => clock.monotonic,
      isOnline: () => true,
    });

    expect(session.getSnapshot()).toMatchObject({ status: 'locked', expiresAt: null, revocationPending: false });
    await session.authorize(grant);
    expect(session.getSnapshot()).toMatchObject({ status: 'active', expiresAt: grant.expiresAt });
    expect(session.getSnapshot()).not.toHaveProperty('key');
    expect(JSON.stringify(session.getSnapshot())).not.toContain('local-account-nanoid-16');
    await expect(session.withOperation(grant, async (activeGrant) => activeGrant.key.type)).resolves.toBe('secret');
    expect(grant.key.extractable).toBe(false);
  });

  it('requires an online authorization and the exact owner/save/clinical-account/key tuple', async () => {
    const clock = createClock();
    const grant = await createGrant();
    let online = false;
    const session = createOnlineSaveSession({ now: () => clock.wall, monotonicNow: () => clock.monotonic, isOnline: () => online });

    await expect(session.authorize(grant)).rejects.toMatchObject({ code: 'ONLINE_REQUIRED' });
    online = true;
    await session.authorize(grant);
    await expect(session.withOperation({ ...grant, localAccountId: 'other-account' }, async () => undefined))
      .rejects.toMatchObject({ code: 'SAVE_LOCKED' });
    await expect(session.withOperation({ ...grant, ownerId: randomUUID() }, async () => undefined))
      .rejects.toMatchObject({ code: 'SAVE_LOCKED' });
  });

  it('treats file location as a hint and never lets it create or renew a grant', async () => {
    const clock = createClock();
    const grant = await createGrant();
    const session = createOnlineSaveSession({ now: () => clock.wall, monotonicNow: () => clock.monotonic, isOnline: () => true });

    expect(isSaveOpenableAtLocation(session, grant, true)).toBe(false);
    expect(session.getSnapshot().expiresAt).toBeNull();
    await session.authorize(grant);
    const deadline = session.getSnapshot().expiresAt;
    expect(isSaveOpenableAtLocation(session, grant, true)).toBe(true);
    expect(isSaveOpenableAtLocation(session, grant, false)).toBe(false);
    expect(session.getSnapshot().expiresAt).toBe(deadline);
  });

  it('expires at the fixed eight-hour deadline after suspension and activity does not renew it', async () => {
    const clock = createClock();
    const grant = await createGrant();
    const session = createOnlineSaveSession({ now: () => clock.wall, monotonicNow: () => clock.monotonic, isOnline: () => true });
    await session.authorize(grant);

    clock.wall += 30 * 60 * 1000;
    clock.monotonic += 30 * 60 * 1000;
    expect(session.isAuthorizedFor(grant)).toBe(true);
    const originalDeadline = session.getSnapshot().expiresAt;
    expect(session.getSnapshot().expiresAt).toBe(originalDeadline);

    clock.wall = grant.expiresAt;
    clock.monotonic += eightHours;
    session.onResume();
    expect(session.getSnapshot()).toMatchObject({ status: 'locked', expiresAt: null });
    await expect(session.withOperation(grant, async () => undefined)).rejects.toMatchObject({ code: 'SAVE_LOCKED' });
  });

  it('keeps only a non-secret revocation marker across reload and blocks reauthorization until acknowledged', async () => {
    const clock = createClock();
    const marker = createMarker();
    const grant = await createGrant();
    const session = createOnlineSaveSession({
      now: () => clock.wall,
      monotonicNow: () => clock.monotonic,
      isOnline: () => true,
      revocationMarker: marker,
    });
    await session.authorize(grant);
    session.lock({ revocationPending: true });

    const afterReload = createOnlineSaveSession({
      now: () => clock.wall,
      monotonicNow: () => clock.monotonic,
      isOnline: () => true,
      revocationMarker: marker,
    });
    expect(marker.pending).toBe(true);
    expect(afterReload.getSnapshot()).toMatchObject({ status: 'locked', revocationPending: true, expiresAt: null });
    await expect(afterReload.authorize(grant)).rejects.toMatchObject({ code: 'REVOCATION_PENDING' });
    afterReload.acknowledgeRemoteRevocation();
    await afterReload.authorize(grant);
    expect(marker.pending).toBe(false);
  });

  it('lets an operation accepted before logout finish, rejects new/captured work, then drops the grant', async () => {
    const clock = createClock();
    const grant = await createGrant();
    const session = createOnlineSaveSession({ now: () => clock.wall, monotonicNow: () => clock.monotonic, isOnline: () => true });
    await session.authorize(grant);
    let finish!: () => void;
    const accepted = session.withOperation(grant, async (activeGrant) => {
      await new Promise<void>((resolve) => { finish = resolve; });
      return activeGrant.saveId;
    });
    session.lock({ revocationPending: true });
    await expect(session.withOperation(grant, async () => 'too late')).rejects.toMatchObject({ code: 'SAVE_LOCKED' });
    let idle = false;
    const waitForIdle = session.waitForIdle().then(() => { idle = true; });
    await Promise.resolve();
    expect(idle).toBe(false);

    finish();
    await expect(accepted).resolves.toBe(grant.saveId);
    await waitForIdle;
    expect(idle).toBe(true);
    expect(session.getSnapshot()).toMatchObject({ status: 'locked', expiresAt: null, revocationPending: true });
  });

  it('rejects malformed, expired, overlong, and exportable grants', async () => {
    const clock = createClock();
    const session = createOnlineSaveSession({ now: () => clock.wall, monotonicNow: () => clock.monotonic, isOnline: () => true });
    const valid = await createGrant();

    await expect(session.authorize({ ...valid, expiresAt: clock.wall } )).rejects.toBeInstanceOf(OnlineSaveSessionError);
    await expect(session.authorize({ ...valid, expiresAt: valid.authorizedAt + eightHours + 1 } )).rejects.toMatchObject({ code: 'INVALID_GRANT' });
    const rawKey = randomBytes(32);
    const exportable = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    rawKey.fill(0);
    await expect(session.authorize({ ...valid, key: exportable })).rejects.toMatchObject({ code: 'INVALID_GRANT' });
  });
});
