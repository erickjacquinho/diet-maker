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
import { createServerDietRepository } from '../../src/lib/server/diets/diet-repository';
import { createServerObjectiveRepository } from '../../src/lib/server/objectives/objective-repository';
import { summarizePatients } from '../../src/lib/server/patients/patient-summaries';
import { parseDietDocument } from '../../src/lib/contracts/diets';
import { parseAddObjectiveRequest, parseObjectiveListDto } from '../../src/lib/contracts/objectives';
import { parsePatientSummariesDto, parsePatientSummariesRequest } from '../../src/lib/contracts/clinical';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}`, 'utf8');
const accountA = randomUUID();
const accountB = randomUUID();
const keyring = () => ({ activeId: 'v1', keys: new Map([['v1', createSecretKey(Buffer.alloc(32, 9))]]) });
const keys = createAccountKeyService({ keyring, cache: new DekCache() });

let client: PGlite;
let db: ReturnType<typeof drizzle>;

async function asAccount<T>(accountId: string, run: (tx: never, sealer: ReturnType<typeof keys.createSealer>) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    return run(tx as never, keys.createSealer(tx as never, accountId));
  });
}

const complete = (clinicalDate: string) => ({
  clinicalDate, weightKg: 70, scapulaCm: 25, bustCm: 90, waistCm: 70, abdomenCm: 80, hipCm: 95, leftProximalThighCm: 55,
});
const patientInput = (name: string) => ({ name, gender: 'Feminino', birthDate: '1990-05-10', heightCm: 165, weightKg: 62 });
const dietDocument = (name: string) => parseDietDocument({
  name, mode: 'SIMPLE',
  variations: [{
    id: 'v1', position: 0, kind: 'SIMPLE', name: 'Base', inputMode: 'GRAMS', assignedDays: [],
    targets: { protein: '1', carbs: '1', fat: '1', energyKcal: '1' },
    meals: [{ id: 'm1', position: 0, name: 'Almoço', options: [{ id: 'o1', position: 0, label: 'A', countsTowardTotals: true, items: [{
      id: 'i1', position: 0, role: 'PRIMARY', name: 'Arroz', snapshot: {
        sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', sourceVersion: '1', displayName: 'Arroz', description: '', measurementBasis: 'PER_100G',
        foodState: 'COOKED', referenceQuantity: '100', referenceUnit: 'g', referenceNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' },
        prescribedQuantity: '100', prescribedUnit: 'g', prescribedNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' },
        energySource: 'CALCULATED_449', calculationVersion: 'v', conversionSnapshot: {}, compositionSnapshot: {},
      },
    }] }] }],
  }],
});

const maria = randomUUID();
const joao = randomUUID();
const semDados = randomUUID();
const foreign = randomUUID();

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
  for (const name of [
    '20261029120000_account_keys.sql', '20261029130000_patients.sql', '20261029140000_assessments_follow_ups.sql',
    '20261030120000_diets.sql', '20261030170000_objective_options.sql',
  ]) {
    await client.exec(migration(name));
  }
  await asAccount(accountA, async (tx, sealer) => {
    const patients = createServerPatientRepository(tx, sealer, accountA);
    for (const [id, name] of [[maria, 'Maria'], [joao, 'João'], [semDados, 'Sem dados']] as const) await patients.create(id, patientInput(name) as never);
    const clinical = createServerClinicalRepository(tx, sealer, accountA);
    await clinical.createAssessment(maria, randomUUID(), complete('2026-03-01') as never);
    await clinical.createAssessment(maria, randomUUID(), complete('2026-04-01') as never);
    await clinical.createAssessment(maria, randomUUID(), complete('2026-05-01') as never);
    await clinical.setFollowUp(maria, undefined, { dueDate: '2026-06-01', type: 'DIET_UPDATE', comments: 'retorno' });
    await clinical.createAssessment(joao, randomUUID(), complete('2026-02-01') as never);
    const diets = createServerDietRepository(tx, accountA);
    await diets.confirmActive(joao, { dietId: randomUUID(), document: dietDocument('Dieta 1') });
    await diets.confirmActive(joao, { dietId: randomUUID(), document: dietDocument('Dieta 2') });
  });
  await asAccount(accountB, (tx, sealer) => createServerPatientRepository(tx, sealer, accountB).create(foreign, patientInput('Estranho') as never));
}, 60_000);

afterAll(async () => client.close());

describe('objective catalog', () => {
  const repo = (accountId: string) => (tx: never) => createServerObjectiveRepository(tx, accountId);
  let customId = '';

  it('lists the built-in objectives first-class and adds custom ones idempotently', async () => {
    const initial = await asAccount(accountA, (tx) => repo(accountA)(tx).list());
    expect(initial.map((o) => o.label)).toEqual(['Bulking', 'Cutting', 'Manutenção', 'Recomposição Corporal']);
    expect(initial.every((o) => o.origin === 'SYSTEM' && o.archivedAt === null)).toBe(true);

    const added = await asAccount(accountA, (tx) => repo(accountA)(tx).addCustom('  Ganho   de força '));
    customId = added.id;
    expect(added).toMatchObject({ label: 'Ganho de força', normalizedLabel: 'ganho de força', origin: 'CUSTOM', archivedAt: null });
    const again = await asAccount(accountA, (tx) => repo(accountA)(tx).addCustom('ganho de FORÇA'));
    expect(again).toMatchObject({ id: customId, label: 'Ganho de força' });
    expect((await asAccount(accountA, (tx) => repo(accountA)(tx).addCustom('cutting'))).origin).toBe('SYSTEM');
    expect((await asAccount(accountA, (tx) => repo(accountA)(tx).list())).map((o) => o.label)).toContain('Ganho de força');
  });

  it('archives and restores by adding the same label again, never deleting', async () => {
    await asAccount(accountA, (tx) => repo(accountA)(tx).archiveCustom(customId));
    await asAccount(accountA, (tx) => repo(accountA)(tx).archiveCustom(customId));
    expect((await asAccount(accountA, (tx) => repo(accountA)(tx).list())).map((o) => o.label)).not.toContain('Ganho de força');
    const restored = await asAccount(accountA, (tx) => repo(accountA)(tx).addCustom('Ganho de força'));
    expect(restored).toMatchObject({ id: customId, archivedAt: null });
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.objective_options`);
    })).rejects.toThrow();
  });

  it('rejects built-in and foreign archives and invalid labels, and isolates accounts', async () => {
    await expect(asAccount(accountA, (tx) => repo(accountA)(tx).archiveCustom('system-cutting'))).rejects.toMatchObject({ status: 422 });
    await expect(asAccount(accountB, (tx) => repo(accountB)(tx).archiveCustom(customId))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountA, (tx) => repo(accountA)(tx).addCustom('   '))).rejects.toMatchObject({ status: 422 });
    expect((await asAccount(accountB, (tx) => repo(accountB)(tx).list())).map((o) => o.label)).not.toContain('Ganho de força');
  });

  it('keeps the contract strict', () => {
    expect(() => parseAddObjectiveRequest({ label: 'x', accountId: 'a' })).toThrow('Unknown field');
    expect(() => parseObjectiveListDto({ items: 'x' })).toThrow('Invalid list');
  });
});

describe('patient summaries', () => {
  it('aggregates counts, latest two assessments, follow-up and last activity in few queries', async () => {
    const items = await asAccount(accountA, (tx, sealer) => summarizePatients(tx, accountA, [maria, joao, semDados], sealer));
    const byId = new Map(items.map((item) => [item.patientId, item]));

    const mariaSummary = byId.get(maria)!;
    expect(mariaSummary).toMatchObject({ assessmentCount: 3, dietCount: 0 });
    expect(mariaSummary.latestAssessment?.clinicalDate).toBe('2026-05-01');
    expect(mariaSummary.previousAssessment?.clinicalDate).toBe('2026-04-01');
    expect(mariaSummary.nextFollowUp).toMatchObject({ dueDate: '2026-06-01', comments: 'retorno', type: ['DIET_UPDATE'] });
    expect(mariaSummary.lastActivity).toMatchObject({ type: 'assessment', eventDate: '2026-05-01' });

    const joaoSummary = byId.get(joao)!;
    expect(joaoSummary).toMatchObject({ assessmentCount: 1, dietCount: 2, previousAssessment: null, nextFollowUp: null });
    expect(joaoSummary.lastActivity?.type).toBe('diet');

    expect(byId.get(semDados)).toMatchObject({ assessmentCount: 0, dietCount: 0, latestAssessment: null, lastActivity: null });
  });

  it('leaves out unknown or foreign patients and validates the contract', async () => {
    const items = await asAccount(accountA, (tx, sealer) => summarizePatients(tx, accountA, [maria, foreign, randomUUID()], sealer));
    expect(items.map((item) => item.patientId)).toEqual([maria]);
    expect(() => parsePatientSummariesRequest({ patientIds: [] })).toThrow('Invalid ids');
    expect(() => parsePatientSummariesRequest({ patientIds: ['x'] })).toThrow('Invalid id');
    expect(() => parsePatientSummariesRequest({ patientIds: Array.from({ length: 26 }, () => randomUUID()) })).toThrow('Invalid ids');
    expect(parsePatientSummariesRequest({ patientIds: [maria.toUpperCase(), maria] }).patientIds).toEqual([maria]);
    expect(() => parsePatientSummariesDto({ items: items.map((item) => ({ ...item })) })).not.toThrow();
  });
});
