// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createSecretKey, randomBytes, randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createAccountKeyService, DekCache } from '../../src/lib/server/crypto/account-keys';
import { createServerPatientRepository } from '../../src/lib/server/patients/patient-repository';
import { ApiError } from '../../src/lib/server/api/api-errors';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}`, 'utf8');
const accountA = randomUUID();
const accountB = randomUUID();
const keyring = () => ({ activeId: 'v1', keys: new Map([['v1', createSecretKey(Buffer.alloc(32, 9))]]) });

let client: PGlite;
let db: ReturnType<typeof drizzle>;
const keys = createAccountKeyService({ keyring, cache: new DekCache() });

async function asAccount<T>(accountId: string | null, run: (repo: ReturnType<typeof createServerPatientRepository>, tx: never) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    if (accountId) await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    const executor = tx as never;
    const repo = createServerPatientRepository(tx as never, keys.createSealer(executor, accountId ?? randomUUID()), accountId ?? randomUUID());
    return run(repo, tx as never);
  });
}

const input = (name: string, extra: Record<string, unknown> = {}) => ({
  name, gender: 'Feminino', birthDate: '1990-05-10', phone: '11987654321', whatsapp: '11987654321',
  heightCm: 165, weightKg: 62, currentObjective: 'Hipertrofia',
  defaultMacroTargets: { proteinG: 120, carbsG: 250, fatsG: 60, kcal: 2000 }, ...extra,
});

beforeAll(async () => {
  client = new PGlite();
  db = drizzle({ client });
  await client.exec(`
    CREATE ROLE app_runtime NOLOGIN; CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE SCHEMA auth; CREATE SCHEMA app; CREATE SCHEMA private;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE TABLE app.accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id uuid UNIQUE REFERENCES auth.users (id));
    CREATE FUNCTION app.current_account_id() RETURNS uuid LANGUAGE sql STABLE SET search_path = ''
      AS $$ SELECT NULLIF(current_setting('app.account_id', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA app, private TO app_runtime;
    GRANT EXECUTE ON FUNCTION app.current_account_id() TO app_runtime;
    GRANT SELECT ON app.accounts TO app_runtime;
  `);
  for (const id of [accountA, accountB]) {
    const user = randomUUID();
    await client.query('INSERT INTO auth.users VALUES ($1)', [user]);
    await client.query('INSERT INTO app.accounts (id, owner_user_id) VALUES ($1, $2)', [id, user]);
  }
  await client.exec(migration('20261029120000_account_keys.sql'));
  await client.exec(migration('20261029130000_patients.sql'));
});

afterAll(async () => client.close());

describe('server patient repository (RLS + sealed S1)', () => {
  const idA = randomUUID();

  it('stores identification encrypted and measures in clear, and reads back', async () => {
    const created = await asAccount(accountA, (repo) => repo.create(idA, input('Maria da Silva') as never));
    expect(created.created).toBe(true);
    expect(created.patient).toMatchObject({ name: 'Maria da Silva', displayCode: 'P-0001', version: 1, weightKg: 62, phone: '11987654321' });

    const raw = await client.query<{ sensitive: Uint8Array; weight_kg: string }>('SELECT sensitive, weight_kg FROM app.patients WHERE id = $1', [idA]);
    expect(Buffer.from(raw.rows[0].sensitive).toString('utf8')).not.toContain('Maria');
    expect(Buffer.from(raw.rows[0].sensitive).toString('latin1')).not.toContain('11987654321');
    expect(raw.rows[0].weight_kg).toBe('62');

    const read = await asAccount(accountA, (repo) => repo.getById(idA));
    expect(read?.name).toBe('Maria da Silva');
  });

  it('is idempotent for a repeated create with the same ID', async () => {
    const again = await asAccount(accountA, (repo) => repo.create(idA, input('Outro Nome') as never));
    expect(again.created).toBe(false);
    expect(again.patient.name).toBe('Maria da Silva');
    const count = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM app.patients WHERE account_id = $1', [accountA]);
    expect(count.rows[0].n).toBe(1);
  });

  it('hides the patient from another account and denies cross-account writes', async () => {
    expect(await asAccount(accountB, (repo) => repo.getById(idA))).toBeNull();
    await expect(asAccount(accountB, (repo) => repo.update(idA, 1, input('Invasor') as never))).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    await expect(asAccount(accountB, (repo) => repo.archive(idA, 1))).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect((await asAccount(accountB, (repo) => repo.searchActive('', 0, 25))).total).toBe(0);
    const stored = await client.query<{ version: number; archived_at: unknown }>('SELECT version, archived_at FROM app.patients WHERE id = $1', [idA]);
    expect(stored.rows[0]).toEqual({ version: 1, archived_at: null });
  });

  it('rejects an insert whose account differs from the transaction context (RLS WITH CHECK)', async () => {
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountB}, true)`);
      await tx.execute(sql`INSERT INTO app.patients (account_id, id, display_code, sensitive, sensitive_key_version, gender, version)
        VALUES (${accountA}, ${randomUUID()}, 'P-0009', ${Buffer.alloc(64)}, 1, 'x', 1)`);
    })).rejects.toThrow();
  });

  it('reads zero rows without an account context and grants no DELETE', async () => {
    const rows = await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      return (await tx.execute(sql`SELECT id FROM app.patients`)).rows;
    });
    expect(rows).toHaveLength(0);
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.patients`);
    })).rejects.toThrow();
  });

  it('enforces optimistic versions and bumps them on update, archive and restore', async () => {
    await expect(asAccount(accountA, (repo) => repo.update(idA, 7, input('Maria') as never))).rejects.toMatchObject({ code: 'VERSION_CONFLICT', extra: { currentVersion: 1 } });
    const updated = await asAccount(accountA, (repo) => repo.update(idA, 1, input('Maria Souza') as never));
    expect(updated).toMatchObject({ name: 'Maria Souza', version: 2 });
    const archived = await asAccount(accountA, (repo) => repo.archive(idA, 2));
    expect(archived.archivedAt).not.toBeNull();
    expect(archived.version).toBe(3);
    await expect(asAccount(accountA, (repo) => repo.update(idA, 3, input('X') as never))).rejects.toBeInstanceOf(ApiError);
    await expect(asAccount(accountA, (repo) => repo.archive(idA, 3))).rejects.toMatchObject({ status: 422 });
    const restored = await asAccount(accountA, (repo) => repo.restore(idA, 3));
    expect(restored).toMatchObject({ archivedAt: null, version: 4 });
  });

  it('searches the decrypted names in memory, sorted and paged, allocating sequential codes', async () => {
    for (const name of ['Ana Lima', 'Zeca Prado', 'Bruno Alves']) {
      await asAccount(accountA, (repo) => repo.create(randomUUID(), input(name) as never));
    }
    const all = await asAccount(accountA, (repo) => repo.searchActive('', 0, 25));
    expect(all.items.map((p) => p.name)).toEqual(['Ana Lima', 'Bruno Alves', 'Maria Souza', 'Zeca Prado']);
    expect(all.items.map((p) => p.displayCode).sort()).toEqual(['P-0001', 'P-0002', 'P-0003', 'P-0004']);
    const filtered = await asAccount(accountA, (repo) => repo.searchActive('ALVES', 0, 25));
    expect(filtered.items.map((p) => p.name)).toEqual(['Bruno Alves']);
    const page = await asAccount(accountA, (repo) => repo.searchActive('', 1, 3));
    expect(page).toMatchObject({ total: 4, pageIndex: 1, items: [{ name: 'Zeca Prado' }] });
  });

  it('fails closed when a ciphertext is moved to another row', async () => {
    const other = randomUUID();
    await asAccount(accountA, (repo) => repo.create(other, input('Carla Dias') as never));
    await client.query(
      `UPDATE app.patients SET sensitive = (SELECT sensitive FROM app.patients WHERE id = $1) WHERE id = $2`,
      [idA, other],
    );
    await expect(asAccount(accountA, (repo) => repo.getById(other))).rejects.toThrow('could not be opened');
  });
});
