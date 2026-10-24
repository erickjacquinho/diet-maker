// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/online-db/client', () => ({ getOnlineDatabase: database.get }));
import { registerSaveRecord, type SaveRegistryInsert } from '../../src/lib/server/online-db/repository';

const pg = new PGlite();
const ownerId = randomUUID();
const otherOwnerId = randomUUID();
function input(owner = ownerId): SaveRegistryInsert {
  return {
    id: randomUUID(), ownerId: owner, localAccountId: randomUUID(), keyId: randomUUID(),
    wrappedKey: Buffer.alloc(48), wrapIv: Buffer.alloc(12), wrapKekId: 'test',
    bindingMac: Buffer.alloc(32), bindingKekId: 'test', idempotencyKey: randomUUID(),
  };
}

describe('single-save registration policy in PostgreSQL', () => {
  beforeAll(async () => {
    await pg.exec(`CREATE SCHEMA private;
      CREATE TABLE private.professional_profiles (owner_id uuid PRIMARY KEY);
      CREATE TABLE private.saves (
        id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES private.professional_profiles,
        local_account_id text UNIQUE NOT NULL, key_id uuid UNIQUE NOT NULL,
        wrapped_key bytea NOT NULL, wrap_iv bytea NOT NULL, wrap_kek_id text NOT NULL,
        binding_mac bytea NOT NULL, binding_kek_id text NOT NULL, label_cipher bytea,
        label_iv bytea, label_kek_id text, idempotency_key uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(owner_id, idempotency_key)
      );`);
    await pg.query('INSERT INTO private.professional_profiles VALUES ($1), ($2)', [ownerId, otherOwnerId]);
    database.get.mockReturnValue(drizzle(pg));
  });
  afterAll(async () => { await pg.close(); });

  it('preserves retries and existing saves while refusing another registration for that owner', async () => {
    const first = input();
    expect(await registerSaveRecord(first)).toMatchObject({ created: true, record: { id: first.id } });
    expect(await registerSaveRecord(first)).toMatchObject({ created: false, record: { id: first.id } });
    expect(await registerSaveRecord({ ...first, id: randomUUID(), idempotencyKey: randomUUID() }))
      .toMatchObject({ created: false, record: { id: first.id } });
    expect(await registerSaveRecord(input())).toBeNull();
    expect(await registerSaveRecord(input(otherOwnerId))).toMatchObject({ created: true });
    const stored = await pg.query('SELECT id FROM private.saves WHERE owner_id = $1', [ownerId]);
    expect(stored.rows).toEqual([{ id: first.id }]);
  });
});
