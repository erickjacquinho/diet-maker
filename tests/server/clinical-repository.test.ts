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
import { createServerClinicalRepository } from '../../src/lib/server/clinical/clinical-repository';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}`, 'utf8');
const accountA = randomUUID();
const accountB = randomUUID();
const keyring = () => ({ activeId: 'v1', keys: new Map([['v1', createSecretKey(Buffer.alloc(32, 9))]]) });

let client: PGlite;
let db: ReturnType<typeof drizzle>;
const keys = createAccountKeyService({ keyring, cache: new DekCache() });

async function asAccount<T>(
  accountId: string,
  run: (clinical: ReturnType<typeof createServerClinicalRepository>, patients: ReturnType<typeof createServerPatientRepository>) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    const executor = tx as never;
    const sealer = keys.createSealer(executor, accountId);
    return run(createServerClinicalRepository(executor, sealer, accountId), createServerPatientRepository(executor, sealer, accountId));
  });
}

const complete = (extra: Record<string, unknown> = {}) => ({
  clinicalDate: '2026-03-10', weightKg: 70, scapulaCm: 25, bustCm: 90, waistCm: 70, abdomenCm: 80, hipCm: 95,
  leftProximalThighCm: 55, ...extra,
});

const patientInput = (name: string, extra: Record<string, unknown> = {}) => ({
  name, gender: 'Feminino', birthDate: '1990-05-10', heightCm: 165, weightKg: 62, ...extra,
});

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
  for (const name of ['20261029120000_account_keys.sql', '20261029130000_patients.sql', '20261029140000_assessments_follow_ups.sql']) {
    await client.exec(migration(name));
  }
  await asAccount(accountA, (_c, patients) => patients.create(patientA, patientInput('Maria') as never));
  await asAccount(accountA, async (_c, patients) => {
    await patients.create(archivedPatient, patientInput('Arquivada') as never);
    await patients.archive(archivedPatient, 1);
  });
  await asAccount(accountB, (_c, patients) => patients.create(patientB, patientInput('Bruno', { gender: 'Masculino' }) as never));
});

afterAll(async () => client.close());

describe('server clinical repository (RLS + composite FK)', () => {
  const assessmentId = randomUUID();

  it('creates a complete assessment with computed body composition, idempotently', async () => {
    const created = await asAccount(accountA, (c) => c.createAssessment(patientA, assessmentId, complete() as never));
    expect(created.created).toBe(true);
    expect(created.assessment).toMatchObject({
      id: assessmentId, patientId: patientA, clinicalDate: '2026-03-10', assessmentType: 'complete', version: 1, calculationMethod: 'US_NAVY',
    });
    expect(created.assessment.bodyFatPercent).toBeGreaterThan(0);
    expect(created.assessment.rightProximalThighCm).toBe(55);

    const again = await asAccount(accountA, (c) => c.createAssessment(patientA, assessmentId, complete({ weightKg: 99 }) as never));
    expect(again.created).toBe(false);
    expect(again.assessment.weightKg).toBe(70);
  });

  it('rejects an assessment ID reused for another patient', async () => {
    await asAccount(accountA, (_c, p) => p.create(randomUUID(), patientInput('Outra') as never));
    const other = (await asAccount(accountA, (_c, p) => p.searchActive('Outra', 0, 5))).items[0].id;
    await expect(asAccount(accountA, (c) => c.createAssessment(other, assessmentId, complete() as never)))
      .rejects.toMatchObject({ status: 409 });
  });

  it('autofills assistable fields from the previous assessment', async () => {
    const first = randomUUID();
    await asAccount(accountA, (c) => c.createAssessment(patientA, first, complete({ clinicalDate: '2026-04-01', neckCm: 33, leftArmCm: 28 }) as never));
    const second = randomUUID();
    const { assessment } = await asAccount(accountA, (c) => c.createAssessment(patientA, second, complete({ clinicalDate: '2026-05-01' }) as never));
    expect(assessment.neckCm).toBe(33);
    expect(assessment.rightArmCm).toBe(28);
    expect(assessment.autoFilledFields).toEqual(expect.arrayContaining(['neckCm', 'leftArmCm', 'rightArmCm']));
    const list = await asAccount(accountA, (c) => c.listAssessments(patientA));
    expect(list.map((a) => a.clinicalDate)).toEqual(['2026-05-01', '2026-04-01', '2026-03-10']);
  });

  it('rejects invalid input with 422 and archived patients', async () => {
    await expect(asAccount(accountA, (c) => c.createAssessment(patientA, randomUUID(), { clinicalDate: '2026-03-10' } as never)))
      .rejects.toMatchObject({ status: 422, code: 'UNPROCESSABLE' });
    await expect(asAccount(accountA, (c) => c.createAssessment(archivedPatient, randomUUID(), complete() as never)))
      .rejects.toMatchObject({ status: 422 });
  });

  it('enforces optimistic versions on update', async () => {
    await expect(asAccount(accountA, (c) => c.updateAssessment(patientA, assessmentId, 5, complete() as never)))
      .rejects.toMatchObject({ code: 'VERSION_CONFLICT', extra: { currentVersion: 1 } });
    const updated = await asAccount(accountA, (c) => c.updateAssessment(patientA, assessmentId, 1, complete({ weightKg: 68 }) as never));
    expect(updated).toMatchObject({ weightKg: 68, version: 2, createdAt: expect.any(String) });
  });

  it('hides data from another account and blocks cross-account references', async () => {
    await expect(asAccount(accountB, (c) => c.getAssessment(patientA, assessmentId))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountB, (c) => c.listAssessments(patientA))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountB, (c) => c.createAssessment(patientA, randomUUID(), complete() as never))).rejects.toMatchObject({ status: 404 });
    // Composite FK: an assessment of account B cannot point at account A's patient, even bypassing the repository.
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountB}, true)`);
      await tx.execute(sql`INSERT INTO app.body_assessments (account_id, id, patient_id, clinical_date, assessment_type, weight_kg,
        calculation_method, calculation_version, calculation_input, version)
        VALUES (${accountB}, ${randomUUID()}, ${patientA}, '2026-01-01', 'simplified', 70, 'NONE', 'x', '{}'::jsonb, 1)`);
    })).rejects.toThrow();
    const count = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM app.body_assessments WHERE account_id = $1', [accountB]);
    expect(count.rows[0].n).toBe(0);
  });

  it('grants no DELETE on assessments or follow-ups', async () => {
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.body_assessments`);
    })).rejects.toThrow();
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.next_follow_ups`);
    })).rejects.toThrow();
  });

  describe('next follow-up', () => {
    it('is null until confirmed, then stores comments encrypted', async () => {
      expect(await asAccount(accountA, (c) => c.getFollowUp(patientA))).toBeNull();
      const created = await asAccount(accountA, (c) => c.setFollowUp(patientA, undefined, {
        dueDates: { ASSESSMENT_UPDATE: '2026-06-01', DIET_UPDATE: '2026-05-20' }, comments: 'Paciente com hipertensão',
      }));
      expect(created).toMatchObject({
        dueDate: '2026-05-20', type: ['ASSESSMENT_UPDATE', 'DIET_UPDATE'], comments: 'Paciente com hipertensão', version: 1,
      });
      const raw = await client.query<{ comments: Uint8Array }>('SELECT comments FROM app.next_follow_ups WHERE patient_id = $1', [patientA]);
      expect(Buffer.from(raw.rows[0].comments).toString('latin1')).not.toContain('hipertensão');
      expect((await asAccount(accountA, (c) => c.getFollowUp(patientA)))?.comments).toBe('Paciente com hipertensão');
    });

    it('rejects a second create and stale versions, and replaces with the right version', async () => {
      await expect(asAccount(accountA, (c) => c.setFollowUp(patientA, undefined, { dueDate: '2026-07-01', type: 'DIET_UPDATE' })))
        .rejects.toMatchObject({ code: 'VERSION_CONFLICT', extra: { currentVersion: 1 } });
      await expect(asAccount(accountA, (c) => c.setFollowUp(patientA, 9, { dueDate: '2026-07-01', type: 'DIET_UPDATE' })))
        .rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
      const replaced = await asAccount(accountA, (c) => c.setFollowUp(patientA, 1, { dueDate: '2026-07-01', type: 'DIET_UPDATE', comments: '' }));
      expect(replaced).toMatchObject({ dueDate: '2026-07-01', type: ['DIET_UPDATE'], comments: '', version: 2 });
    });

    it('validates input, blocks archived patients and other accounts', async () => {
      await expect(asAccount(accountA, (c) => c.setFollowUp(patientA, 2, { dueDate: 'not-a-date', type: 'DIET_UPDATE' })))
        .rejects.toMatchObject({ status: 422 });
      await expect(asAccount(accountA, (c) => c.setFollowUp(archivedPatient, undefined, { dueDate: '2026-07-01', type: 'DIET_UPDATE' })))
        .rejects.toMatchObject({ status: 422 });
      await expect(asAccount(accountB, (c) => c.getFollowUp(patientA))).rejects.toMatchObject({ status: 404 });
      await expect(asAccount(accountB, (c) => c.clearFollowUp(patientA, 2))).rejects.toMatchObject({ status: 404 });
    });

    it('clears with the right version only', async () => {
      await expect(asAccount(accountA, (c) => c.clearFollowUp(patientA, 1))).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
      await asAccount(accountA, (c) => c.clearFollowUp(patientA, 2));
      expect(await asAccount(accountA, (c) => c.getFollowUp(patientA))).toBeNull();
      const kept = await client.query<{ version: number; cancelled_at: unknown }>('SELECT version, cancelled_at FROM app.next_follow_ups WHERE patient_id = $1', [patientA]);
      expect(kept.rows[0]).toMatchObject({ version: 3 });
      expect(kept.rows[0].cancelled_at).not.toBeNull();
      await expect(asAccount(accountA, (c) => c.clearFollowUp(patientA, 3))).rejects.toMatchObject({ status: 404 });
    });

    it('fails closed when a comments ciphertext is moved to another patient', async () => {
      const other = (await asAccount(accountA, (_c, p) => p.searchActive('Outra', 0, 5))).items[0].id;
      const reactivated = await asAccount(accountA, (c) => c.setFollowUp(patientA, undefined, { dueDate: '2026-08-01', type: 'DIET_UPDATE', comments: 'a' }));
      expect(reactivated.version).toBe(4);
      await asAccount(accountA, (c) => c.setFollowUp(other, undefined, { dueDate: '2026-08-01', type: 'DIET_UPDATE', comments: 'b' }));
      await client.query(
        `UPDATE app.next_follow_ups SET comments = (SELECT comments FROM app.next_follow_ups WHERE patient_id = $1) WHERE patient_id = $2`,
        [patientA, other],
      );
      await expect(asAccount(accountA, (c) => c.getFollowUp(other))).rejects.toThrow('could not be opened');
    });
  });
});
