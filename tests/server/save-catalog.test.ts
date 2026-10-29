import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ validateProfileRequestSession: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/auth/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/lib/server/auth/session')>()),
  validateProfileRequestSession: mocks.validateProfileRequestSession,
}));
import { GET as listSaves } from '../../src/app/api/saves/route';
import { encryptServerValue } from '../../src/lib/server/save-keys';

const localDatabaseUrl = process.env.LOCAL_SUPABASE_DB_URL;
const runtimeDatabaseUrl = process.env.ONLINE_DATABASE_URL;
const describeLocal = localDatabaseUrl && runtimeDatabaseUrl ? describe : describe.skip;
const owners = [randomUUID(), randomUUID(), randomUUID()];

describeLocal('private save catalog route', () => {
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
    ) throw new Error('Save catalog tests must use the local restricted Supabase runtime.');

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
         VALUES ($1, decode(repeat('ab', 32), 'hex'), decode(repeat('cd', 12), 'hex'), 'catalog-test')`,
        [ownerId],
      );
    }
  });

  beforeEach(() => {
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('SERVER_MASTER_KEY', Buffer.alloc(32, 0x35).toString('base64'));
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'catalog-test-v1');
    mocks.validateProfileRequestSession.mockImplementation(async (request: Request) => {
      const ownerId = request.headers.get('x-test-owner') ?? owners[0];
      return request.headers.get('x-test-unauth') === '1'
        ? { user: null, cookiesToSet: [], responseHeaders: {}, profileExists: false }
        : { user: { id: ownerId, email: `${ownerId}@example.invalid` }, cookiesToSet: [], responseHeaders: {}, profileExists: ownerId !== owners[2] };
    });
  });

  afterEach(async () => {
    for (const ownerId of owners) await admin.query('DELETE FROM private.saves WHERE owner_id = $1', [ownerId]);
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

  it('pages through every owner save with stable ordering and no cross-owner or clinical metadata', async () => {
    const own = await seedSaves(owners[0], 53, 'Consultório privado');
    await seedSaves(owners[1], 2, 'Outro proprietário');

    const firstResponse = await listSaves(getRequest(0));
    const first = await firstResponse.json();
    const secondResponse = await listSaves(getRequest(1));
    const second = await secondResponse.json();
    const ids = [...first.items, ...second.items].map((item: { saveId: string }) => item.saveId);

    expect(firstResponse.status).toBe(200);
    expect(first).toMatchObject({ totalRows: 53, pageIndex: 0, pageSize: 50 });
    expect(first.items).toHaveLength(50);
    expect(secondResponse.status).toBe(200);
    expect(second).toMatchObject({ totalRows: 53, pageIndex: 1, pageSize: 50 });
    expect(second.items).toHaveLength(3);
    expect(new Set(ids).size).toBe(53);
    expect(ids).toEqual([...own].sort((left, right) => right.localeCompare(left)));
    for (const item of [...first.items, ...second.items]) {
      expect(Object.keys(item).sort()).toEqual(['createdAt', 'label', 'saveId'].sort());
      expect(item.label).toBe('Consultório privado');
      expect(JSON.stringify(item)).not.toMatch(/owner|localAccount|patient|path|key|proof|checkpoint|progress/i);
    }
    expect(JSON.stringify(first)).not.toContain('Outro proprietário');
  });

  it('returns only the current owner records and denies anonymous or incomplete profiles', async () => {
    await seedSaves(owners[0], 1, 'Owner A');
    await seedSaves(owners[1], 2, 'Owner B');
    const ownerA = await (await listSaves(getRequest(0, owners[0]))).json();
    const ownerB = await (await listSaves(getRequest(0, owners[1]))).json();
    const anonymous = await listSaves(getRequest(0, owners[0], true));
    const noProfile = await listSaves(getRequest(0, owners[2]));

    expect(ownerA.totalRows).toBe(1);
    expect(ownerB.totalRows).toBe(2);
    expect(JSON.stringify(ownerA)).not.toContain('Owner B');
    expect(JSON.stringify(ownerB)).not.toContain('Owner A');
    expect(anonymous.status).toBe(401);
    expect(noProfile.status).toBe(403);
  });

  it('rejects invalid pagination and never accepts a client-selected page size', async () => {
    expect((await listSaves(getRequest(-1))).status).toBe(400);
    expect((await listSaves(getRequest(0, owners[0], false, 'pageSize=100'))).status).toBe(400);
    expect((await listSaves(getRequest(0, owners[0], false, 'page=1.2'))).status).toBe(400);
  });

  async function seedSaves(ownerId: string, count: number, label: string): Promise<string[]> {
    const ids: string[] = [];
    const batchId = randomUUID();
    for (let index = 0; index < count; index += 1) {
      const saveId = randomUUID();
      const localAccountId = `catalog-${ownerId}-${batchId}-${index}`;
      const keyId = randomUUID();
      const idempotencyKey = randomUUID();
      const labelBytes = Buffer.from(label, 'utf8');
      const encryptedLabel = encryptServerValue('save-label', [ownerId, saveId], labelBytes);
      labelBytes.fill(0);
      await admin.query(
        `INSERT INTO private.saves (
           id, owner_id, local_account_id, key_id, wrapped_key, wrap_iv, wrap_kek_id,
           binding_mac, binding_kek_id, label_cipher, label_iv, label_kek_id, idempotency_key, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, 'catalog-test-v1', $7, 'catalog-test-v1', $8, $9, 'catalog-test-v1', $10,
           '2026-10-10T12:00:00.000Z'::timestamptz
         )`,
        [saveId, ownerId, localAccountId, keyId, Buffer.alloc(48, 0x44), Buffer.alloc(12, 0x33), Buffer.alloc(32, 0x22), encryptedLabel.ciphertext, encryptedLabel.iv, idempotencyKey],
      );
      ids.push(saveId);
    }
    return ids;
  }
});

function getRequest(page: number, ownerId = owners[0], unauthenticated = false, extra = ''): Request {
  const query = new URLSearchParams({ page: String(page), pageSize: '50' });
  if (extra) new URLSearchParams(extra).forEach((value, key) => query.set(key, value));
  return new Request(`http://localhost:3000/api/saves?${query}`, {
    method: 'GET',
    headers: {
      'x-test-owner': ownerId,
      ...(unauthenticated ? { 'x-test-unauth': '1' } : {}),
    },
  });
}
