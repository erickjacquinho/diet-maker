// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createSecretKey, randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createAccountKeyService, DekCache } from '../../src/lib/server/crypto/account-keys';
import { createServerPatientRepository } from '../../src/lib/server/patients/patient-repository';
import { createServerDietRepository } from '../../src/lib/server/diets/diet-repository';
import { parseConfirmDietRequest, parseDietDocument, parseDietPlanDto, parsePutDietDraftRequest } from '../../src/lib/contracts/diets';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}`, 'utf8');
const accountA = randomUUID();
const accountB = randomUUID();
const keyring = () => ({ activeId: 'v1', keys: new Map([['v1', createSecretKey(Buffer.alloc(32, 9))]]) });

let client: PGlite;
let db: ReturnType<typeof drizzle>;
const keys = createAccountKeyService({ keyring, cache: new DekCache() });

async function asAccount<T>(
  accountId: string,
  run: (diets: ReturnType<typeof createServerDietRepository>, patients: ReturnType<typeof createServerPatientRepository>) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    const executor = tx as never;
    return run(
      createServerDietRepository(executor, accountId),
      createServerPatientRepository(executor, keys.createSealer(executor, accountId), accountId),
    );
  });
}

const nutrients = { protein: '10', carbs: '20', fat: '5', fiber: '2', energyKcal: '185' };
const documentFor = (name: string, extra: Record<string, unknown> = {}) => ({
  name, mode: 'SIMPLE',
  variations: [{
    id: 'var1', position: 0, kind: 'SIMPLE', name: 'Base', inputMode: 'GRAMS', assignedDays: ['MON', 'TUE'],
    targets: { protein: '120', carbs: '250', fat: '60', energyKcal: '2000' },
    meals: [{
      id: 'meal1', position: 0, name: 'Café da manhã', time: '07:00',
      options: [{
        id: 'opt1', position: 0, label: 'Opção 1', countsTowardTotals: true,
        items: [{
          id: 'item1', position: 0, role: 'PRIMARY', name: 'Arroz',
          snapshot: {
            sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', sourceVersion: '1', displayName: 'Arroz', description: 'Arroz cozido',
            measurementBasis: 'PER_100G', foodState: 'COOKED', referenceQuantity: '100', referenceUnit: 'g',
            referenceNutrients: nutrients, prescribedQuantity: '100', prescribedUnit: 'g', prescribedNutrients: nutrients,
            energySource: 'REFERENCE', calculationVersion: 'v1', conversionSnapshot: {}, compositionSnapshot: {},
          },
        }],
      }],
    }],
  }],
  ...extra,
});
const doc = (name: string, extra: Record<string, unknown> = {}) => parseDietDocument(documentFor(name, extra));

const patientA = randomUUID();
const patientB = randomUUID();
const archivedPatient = randomUUID();

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
  for (const name of ['20261029120000_account_keys.sql', '20261029130000_patients.sql', '20261030120000_diets.sql']) {
    await client.exec(migration(name));
  }
  const input = (name: string) => ({ name, gender: 'Feminino', birthDate: '1990-05-10', heightCm: 165, weightKg: 62 });
  await asAccount(accountA, (_d, p) => p.create(patientA, input('Maria') as never));
  await asAccount(accountA, async (_d, p) => {
    await p.create(archivedPatient, input('Arquivada') as never);
    await p.archive(archivedPatient, 1);
  });
  await asAccount(accountB, (_d, p) => p.create(patientB, input('Bruno') as never));
});

afterAll(async () => client.close());

describe('server diet repository (RLS + composite FK)', () => {
  const first = randomUUID();
  const second = randomUUID();

  it('confirms a new diet idempotently', async () => {
    const created = await asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: first, document: doc('Dieta 1') }));
    expect(created).toEqual({ status: 'COMMITTED_NEW', planId: first, version: 1 });
    const again = await asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: first, document: doc('Outro nome') }));
    expect(again).toEqual({ status: 'ALREADY_COMMITTED', planId: first, version: 1 });
    const plan = await asAccount(accountA, (d) => d.getPlan(patientA, first));
    expect(plan).toMatchObject({ name: 'Dieta 1', status: 'ACTIVE', version: 1 });
    expect(plan.variations[0].meals[0].options[0].items[0].snapshot.prescribedNutrients.protein).toBe('10');
  });

  it('supersedes the active diet when a new one is confirmed, keeping one active', async () => {
    await asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: second, document: doc('Dieta 2') }));
    const plans = await asAccount(accountA, (d) => d.listPlans(patientA));
    expect(plans.map((p) => [p.name, p.status])).toEqual([['Dieta 2', 'ACTIVE'], ['Dieta 1', 'SNAPSHOT']]);
    expect(plans[1].supersededAt).not.toBeNull();
    await expect(client.query(
      `INSERT INTO app.diet_plans (account_id, id, patient_id, name, mode, status, variations, version)
       VALUES ($1, $2, $3, 'x', 'SIMPLE', 'ACTIVE', '[]'::jsonb, 1)`, [accountA, randomUUID(), patientA],
    )).rejects.toThrow();
  });

  it('updates the active diet only with the matching base version', async () => {
    await expect(asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: second, baseDietId: second, baseDietVersion: 9, document: doc('X') })))
      .rejects.toMatchObject({ code: 'VERSION_CONFLICT', extra: { currentVersion: 1 } });
    await expect(asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: first, baseDietId: first, baseDietVersion: 1, document: doc('X') })))
      .rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    const updated = await asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: second, baseDietId: second, baseDietVersion: 1, document: doc('Dieta 2b') }));
    expect(updated).toEqual({ status: 'COMMITTED_UPDATE', planId: second, version: 2 });
  });

  it('rejects invalid prescriptions and archived patients with 422', async () => {
    const noMeals = doc('Vazia');
    noMeals.variations[0].meals = [];
    await expect(asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: randomUUID(), document: noMeals })))
      .rejects.toMatchObject({ status: 422, extra: { reason: 'INVALID_MINIMUM' } });
    await expect(asAccount(accountA, (d) => d.confirmActive(archivedPatient, { dietId: randomUUID(), document: doc('Z') })))
      .rejects.toMatchObject({ status: 422 });
  });

  it('hides diets from other accounts and blocks cross-account references', async () => {
    await expect(asAccount(accountB, (d) => d.getPlan(patientA, first))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountB, (d) => d.listPlans(patientA))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountB, (d) => d.confirmActive(patientA, { dietId: randomUUID(), document: doc('Invasor') })))
      .rejects.toMatchObject({ status: 404 });
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountB}, true)`);
      await tx.execute(sql`INSERT INTO app.diet_plans (account_id, id, patient_id, name, mode, status, variations, version)
        VALUES (${accountB}, ${randomUUID()}, ${patientA}, 'x', 'SIMPLE', 'SNAPSHOT', '[]'::jsonb, 1)`);
    })).rejects.toThrow();
  });

  it('grants no DELETE on diet plans', async () => {
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.diet_plans`);
    })).rejects.toThrow();
  });

  describe('drafts', () => {
    const request = (revision: number, name = 'Rascunho') => parsePutDietDraftRequest({
      draftId: 'draft-1', draftRevision: revision, payloadSchemaVersion: 1, payload: documentFor(name),
    });

    it('autosaves by revision and supersedes stale writes', async () => {
      expect(await asAccount(accountA, (d) => d.getDraft(patientA, 'nova'))).toBeNull();
      const saved = await asAccount(accountA, (d) => d.putDraft(patientA, 'nova', request(2)));
      expect(saved).toMatchObject({ status: 'SAVED', revision: 2 });
      expect(await asAccount(accountA, (d) => d.putDraft(patientA, 'nova', request(1, 'Antigo'))))
        .toEqual({ status: 'SUPERSEDED', currentRevision: 2 });
      expect(await asAccount(accountA, (d) => d.putDraft(patientA, 'nova', request(2)))).toMatchObject({ status: 'SAVED' });
      const draft = await asAccount(accountA, (d) => d.getDraft(patientA, 'nova'));
      expect(draft).toMatchObject({ draftRevision: 2, state: 'EDITABLE', routeDietId: 'nova' });
      expect(draft?.payload.name).toBe('Rascunho');
    });

    it('keeps drafts per account and discards idempotently, also when a diet is confirmed', async () => {
      await expect(asAccount(accountB, (d) => d.getDraft(patientA, 'nova'))).rejects.toMatchObject({ status: 404 });
      await expect(asAccount(accountB, (d) => d.putDraft(patientA, 'nova', request(5)))).rejects.toMatchObject({ status: 404 });
      await asAccount(accountA, (d) => d.confirmActive(patientA, { dietId: randomUUID(), draftRouteId: 'nova', document: doc('Dieta 3') }));
      expect(await asAccount(accountA, (d) => d.getDraft(patientA, 'nova'))).toBeNull();
      await asAccount(accountA, (d) => d.discardDraft(patientA, 'nova'));
    });

    it('does not accept drafts for archived patients', async () => {
      await expect(asAccount(accountA, (d) => d.putDraft(archivedPatient, 'nova', request(1)))).rejects.toMatchObject({ status: 422 });
    });
  });
});

describe('diet contracts', () => {
  it('rejects unknown fields at any depth and malformed decimals', () => {
    const extra = documentFor('X');
    (extra.variations[0] as Record<string, unknown>).accountId = 'a';
    expect(() => parseDietDocument(extra)).toThrow('Unknown field');
    const bad = documentFor('X');
    bad.variations[0].targets.protein = '-1';
    expect(() => parseDietDocument(bad)).toThrow('Invalid decimal');
  });

  it('requires UUIDs and a consistent base on confirm', () => {
    const dietId = randomUUID();
    expect(() => parseConfirmDietRequest({ dietId: 'x', document: documentFor('X') })).toThrow('Invalid id');
    expect(() => parseConfirmDietRequest({ dietId, baseDietId: dietId, document: documentFor('X') })).toThrow('Base requires');
    expect(parseConfirmDietRequest({ dietId, baseDietId: dietId, baseDietVersion: 2, document: documentFor('X') }).baseDietVersion).toBe(2);
  });

  it('output allowlist drops account fields', () => {
    const dto = parseDietPlanDto({
      id: 'a', accountId: 'secret', patientId: 'p', name: 'X', mode: 'SIMPLE', status: 'ACTIVE', version: 1,
      createdAt: 'a', updatedAt: 'b', activatedAt: 'c', supersededAt: null, variations: [],
    });
    expect(dto).not.toHaveProperty('accountId');
  });
});
