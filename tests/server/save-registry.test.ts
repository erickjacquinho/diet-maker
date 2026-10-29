import { randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ validateProfileRequestSession: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/auth/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/auth/session')>()),
  validateProfileRequestSession: mocks.validateProfileRequestSession,
}));
import { POST as registerSave } from '../../src/app/api/saves/route';
import { POST as authorizeSave } from '../../src/app/api/saves/[id]/authorize/route';
import { unwrapSaveKey } from '../../src/lib/server/save-keys';
import { encodeBindingProof } from '../../src/lib/domain/protected-save';

const localDatabaseUrl = process.env.LOCAL_SUPABASE_DB_URL;
const runtimeDatabaseUrl = process.env.ONLINE_DATABASE_URL;
const describeLocal = localDatabaseUrl && runtimeDatabaseUrl ? describe : describe.skip;
const owners = [randomUUID(), randomUUID(), randomUUID()];
const csrfToken = randomBytes(32).toString('base64url');

describeLocal('private save registration and authorization routes', () => {
  let admin: Pool;

  beforeAll(async () => {
    const adminUrl = new URL(localDatabaseUrl!);
    const runtimeUrl = new URL(runtimeDatabaseUrl!);
    if (
      !['127.0.0.1', 'localhost', '::1'].includes(adminUrl.hostname)
      || adminUrl.port !== '54322'
      || !['127.0.0.1', 'localhost', '::1'].includes(runtimeUrl.hostname)
      || runtimeUrl.port !== '54322'
      || runtimeUrl.username !== 'app_runtime'
    ) throw new Error('Save registry tests must use the local restricted Supabase runtime.');

    admin = new Pool({ connectionString: localDatabaseUrl!, max: 2 });
    for (const ownerId of owners) {
      await admin.query(
        `INSERT INTO auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
         VALUES ($1, 'authenticated', 'authenticated', $2, '{}'::jsonb, '{}'::jsonb, now(), now())`,
        [ownerId, `${ownerId}@example.invalid`],
      );
    }
    for (const ownerId of owners.slice(0, 2)) {
      await admin.query(
        `INSERT INTO private.professional_profiles (owner_id, profile_cipher, profile_iv, profile_kek_id)
         VALUES ($1, decode(repeat('ab', 32), 'hex'), decode(repeat('cd', 12), 'hex'), 'registry-test')`,
        [ownerId],
      );
    }
  });

  beforeEach(async () => {
    await admin.query('DELETE FROM private.saves WHERE owner_id = ANY($1::uuid[])', [owners]);
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('SERVER_MASTER_KEY', Buffer.alloc(32, 0x35).toString('base64'));
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'registry-test-v1');
    mocks.validateProfileRequestSession.mockImplementation(async (request: Request) => {
      const ownerId = request.headers.get('x-test-owner') ?? owners[0];
      return request.headers.get('x-test-unauth') === '1'
        ? { user: null, cookiesToSet: [], responseHeaders: {}, profileExists: false }
        : { user: { id: ownerId, email: `${ownerId}@example.invalid` }, cookiesToSet: [], responseHeaders: {}, profileExists: ownerId !== owners[2] };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    if (!admin) return;
    for (const ownerId of owners) {
      await admin.query('DELETE FROM private.saves WHERE owner_id = $1', [ownerId]);
      await admin.query('DELETE FROM private.professional_profiles WHERE owner_id = $1', [ownerId]);
      await admin.query('DELETE FROM auth.users WHERE id = $1', [ownerId]);
    }
    const { closeOnlineDatabase } = await import('../../src/lib/server/online-db/client');
    await closeOnlineDatabase();
    await admin.end();
  });

  it('creates one opaque owner-bound record and returns no wrapped or plaintext key', async () => {
    const input = createInput({ localAccountId: 'clinical-account-nanoid-16', label: 'Nome clínico privado' });
    const response = await registerSave(postRequest('/api/saves', input));
    const responseText = await response.clone().text();
    const body = JSON.parse(responseText);
    const { rows: [stored] } = await admin.query<{
      id: string; owner_id: string; local_account_id: string; key_id: string; wrapped_key: Buffer;
      wrap_iv: Buffer; wrap_kek_id: string; binding_mac: Buffer; binding_kek_id: string;
      label_cipher: Buffer; label_iv: Buffer; label_kek_id: string; idempotency_key: string;
    }>('SELECT * FROM private.saves WHERE id = $1', [body.saveId]);

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      saveId: stored.id,
      localAccountId: input.localAccountId,
      keyId: stored.key_id,
      bindingProof: encodeBindingProof(stored.binding_kek_id, stored.binding_mac.toString('base64url')),
      label: 'Nome clínico privado',
    });
    expect(JSON.stringify(body)).not.toMatch(/ownerId|wrappedKey|wrapKekId|patients|snapshot|drafts/);
    expect(stored.owner_id).toBe(owners[0]);
    expect(stored.local_account_id).toBe(input.localAccountId);
    expect(stored.label_cipher.toString('utf8')).not.toContain('Nome clínico privado');
    const dek = unwrapSaveKey({ wrappedKey: stored.wrapped_key, wrapIv: stored.wrap_iv, wrapKekId: stored.wrap_kek_id }, {
      ownerId: stored.owner_id,
      saveId: stored.id,
      localAccountId: stored.local_account_id,
      keyId: stored.key_id,
    });
    expect(dek).toHaveLength(32);
    dek.fill(0);
  });

  it('retries with the same identity, proof and stored DEK; conflicting payload gets 409', async () => {
    const input = createInput({ label: 'Stable label' });
    const firstResponse = await registerSave(postRequest('/api/saves', input));
    const firstText = await firstResponse.clone().text();
    const first = JSON.parse(firstText);
    const firstRecord = await readStored(first.saveId);
    const retryResponse = await registerSave(postRequest('/api/saves', input));
    const retry = await retryResponse.json();
    const retryRecord = await readStored(first.saveId);
    const conflict = await registerSave(postRequest('/api/saves', { ...input, label: 'Different label' }));
    const sameOwnerReopen = await registerSave(postRequest('/api/saves', {
      ...input,
      idempotencyKey: randomUUID(),
      label: 'Ignored retry label',
    }));

    expect(firstResponse.status).toBe(201);
    expect(retryResponse.status).toBe(200);
    expect(retry).toEqual(first);
    expect(retryRecord).toEqual(firstRecord);
    expect(conflict.status).toBe(409);
    expect(await conflict.text()).not.toContain('Stable label');
    const reopened = await sameOwnerReopen.json();
    expect(sameOwnerReopen.status).toBe(200);
    expect(reopened).toMatchObject({ saveId: first.saveId, keyId: first.keyId, bindingProof: first.bindingProof, label: 'Stable label' });
  });

  it('rejects a second save for the same owner even when registrations overlap', async () => {
    const responses = await Promise.all([
      registerSave(postRequest('/api/saves', createInput())),
      registerSave(postRequest('/api/saves', createInput())),
    ]);
    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
    const { rows } = await admin.query('SELECT id FROM private.saves WHERE owner_id = $1', [owners[0]]);
    expect(rows).toHaveLength(1);
  });

  it('allows only one concurrent owner to claim a clinical account identity', async () => {
    const localAccountId = `concurrent-${randomUUID()}`;
    const [first, second] = await Promise.all([
      registerSave(postRequest('/api/saves', createInput({ localAccountId }), owners[0])),
      registerSave(postRequest('/api/saves', createInput({ localAccountId }), owners[1])),
    ]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
    const { rows } = await admin.query<{ owner_id: string }>(
      'SELECT owner_id FROM private.saves WHERE local_account_id = $1',
      [localAccountId],
    );
    expect(rows).toHaveLength(1);
    expect(owners.slice(0, 2)).toContain(rows[0].owner_id);
  });

  it('releases the DEK only through authorize to the owner with the stored proof', async () => {
    const input = createInput();
    const registered = await registerSave(postRequest('/api/saves', input));
    const record = await registered.json();
    const authorized = await authorizeSaveRequest(record.saveId, {
      bindingProof: record.bindingProof,
      csrfToken,
    });
    const authorizedText = await authorized.clone().text();
    const grant = JSON.parse(authorizedText);
    const wrongProof = await authorizeSaveRequest(record.saveId, {
      bindingProof: encodeBindingProof('registry-test-v1', Buffer.alloc(32, 0x77).toString('base64url')),
      csrfToken,
    });
    const otherOwner = await authorizeSaveRequest(record.saveId, {
      bindingProof: record.bindingProof,
      csrfToken,
    }, owners[1]);
    const wrongBody = await wrongProof.text();
    const otherBody = await otherOwner.text();
    const { rows: [stored] } = await admin.query<{ wrapped_key: Buffer; wrap_iv: Buffer; wrap_kek_id: string }>(
      'SELECT wrapped_key, wrap_iv, wrap_kek_id FROM private.saves WHERE id = $1',
      [record.saveId],
    );

    expect(authorized.status, authorizedText).toBe(200);
    expect(grant).toMatchObject({
      saveId: record.saveId,
      localAccountId: input.localAccountId,
      keyId: record.keyId,
      bindingProof: record.bindingProof,
    });
    const authorizedKey = unwrapSaveKey({
      wrappedKey: stored.wrapped_key,
      wrapIv: stored.wrap_iv,
      wrapKekId: stored.wrap_kek_id,
    }, { ownerId: owners[0], saveId: record.saveId, localAccountId: input.localAccountId, keyId: record.keyId });
    expect(Buffer.from(grant.key, 'base64url')).toEqual(authorizedKey);
    authorizedKey.fill(0);
    expect(JSON.stringify(grant)).not.toContain('wrappedKey');
    expect(wrongProof.status).toBe(404);
    const wrongError = JSON.parse(wrongBody) as { code: string; message: string };
    const otherOwnerError = JSON.parse(otherBody) as { code: string; message: string };
    expect(otherOwnerError.code).toBe(wrongError.code);
    expect(otherOwnerError.message).toBe(wrongError.message);
    expect(otherOwner.status).toBe(404);
    expect(otherBody).not.toContain(grant.key);
  });

  it('rejects an invalid session, missing profile, unknown save, and extra clinical payload', async () => {
    const anonymous = await registerSave(postRequest('/api/saves', createInput(), owners[0], true));
    const unknownId = randomUUID();
    const unknown = await authorizeSaveRequest(unknownId, {
      bindingProof: encodeBindingProof('registry-test-v1', Buffer.alloc(32).toString('base64url')), csrfToken,
    });
    const missingProfile = await registerSave(postRequest('/api/saves', createInput(), owners[2]));
    const extra = await registerSave(postRequest('/api/saves', { ...createInput(), patients: [{ name: 'private' }] }));

    expect(anonymous.status).toBe(401);
    expect(missingProfile.status).toBe(403);
    expect(unknown.status).toBe(404);
    expect(extra.status).toBe(400);
    expect(await extra.text()).not.toContain('private');
  });

  it('does not create a claim if key wrapping configuration is unavailable', async () => {
    const input = createInput();
    const localAccountId = input.localAccountId;
    vi.stubEnv('SERVER_MASTER_KEY', '');
    const response = await registerSave(postRequest('/api/saves', input));

    expect(response.status).toBe(503);
    const { rows } = await admin.query('SELECT id FROM private.saves WHERE local_account_id = $1', [localAccountId]);
    expect(rows).toEqual([]);
  });

  async function readStored(saveId: string) {
    const { rows: [row] } = await admin.query('SELECT * FROM private.saves WHERE id = $1', [saveId]);
    return row;
  }
});

function createInput(overrides: Record<string, unknown> = {}) {
  return {
    idempotencyKey: randomUUID(),
    localAccountId: `clinical-${randomUUID()}`,
    csrfToken,
    ...overrides,
  };
}

function postRequest(
  path: string,
  body: Record<string, unknown>,
  ownerId = owners[0],
  unauthenticated = false,
): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: {
      origin: 'http://localhost:3000',
      cookie: `dietmaker_csrf=${csrfToken}`,
      'content-type': 'application/json',
      'x-test-owner': ownerId,
      ...(unauthenticated ? { 'x-test-unauth': '1' } : {}),
    },
    body: JSON.stringify(body),
  });
}

function authorizeSaveRequest(
  saveId: string,
  body: Record<string, unknown>,
  ownerId = owners[0],
): Promise<Response> {
  return authorizeSave(postRequest(`/api/saves/${saveId}/authorize`, body, ownerId), {
    params: Promise.resolve({ id: saveId }),
  });
}
