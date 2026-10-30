// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createCipheriv, createSecretKey, randomBytes, randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('../../src/lib/server/online-db/repository', () => ({ getSaveRecord: vi.fn() }));
const dek = randomBytes(32);
vi.mock('../../src/lib/server/save-keys', () => ({
  verifyBindingProof: vi.fn(() => true),
  unwrapSaveKey: vi.fn(() => Buffer.from(dek)),
}));

import { createAccountKeyService, DekCache } from '../../src/lib/server/crypto/account-keys';
import { createServerPatientRepository } from '../../src/lib/server/patients/patient-repository';
import { createServerClinicalRepository } from '../../src/lib/server/clinical/clinical-repository';
import { createServerDietRepository } from '../../src/lib/server/diets/diet-repository';
import { createServerLibraryRepository } from '../../src/lib/server/library/library-repository';
import { createServerRecipeRepository } from '../../src/lib/server/library/recipe-repository';
import { createServerAgendaRepository } from '../../src/lib/server/agenda/agenda-repository';
import { createServerObjectiveRepository } from '../../src/lib/server/objectives/objective-repository';
import { importNutridietEnvelope, importedUuid } from '../../src/lib/server/imports/nutridiet-importer';
import { readNutridiet } from '../../src/lib/server/imports/nutridiet-reader';
import { encodeBase64Url, encodeBindingProof, protectedSaveAdditionalData } from '../../src/lib/domain/protected-save';
import { parseImportResultDto } from '../../src/lib/contracts/imports';

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

const T = '2026-03-01T10:00:00.000Z';
const nutrients = (p: string) => ({ protein: p, carbs: '20', fat: '5', fiber: '2', energyKcal: '185' });
const snapshot = (sourceType: string, sourceId: string, quantity = '100') => ({
  sourceType, sourceId, sourceVersion: '1', displayName: 'Item', description: 'd', measurementBasis: 'PER_100G', foodState: 'COOKED',
  referenceQuantity: '100', referenceUnit: 'g', referenceNutrients: nutrients('10'), prescribedQuantity: quantity, prescribedUnit: 'g',
  prescribedNutrients: nutrients('10'), energySource: 'REFERENCE', calculationVersion: 'v', conversionSnapshot: {}, compositionSnapshot: {},
});

/** A small but complete logical envelope, with nanoid-style local IDs like the real PGlite save. */
function envelope(overrides: Record<string, unknown> = {}) {
  const document = {
    name: 'Pronta', mode: 'SIMPLE',
    variations: [{
      id: 'v/ready', position: 0, kind: 'SIMPLE', name: 'Base', inputMode: 'GRAMS', assignedDays: [],
      targets: { protein: '1', carbs: '1', fat: '1', energyKcal: '1' },
      meals: [{ id: 'm1', position: 0, name: 'Almoço', options: [{ id: 'o1', position: 0, label: 'A', countsTowardTotals: true, items: [
        { id: 'i1', position: 0, role: 'PRIMARY', name: 'Whey', snapshot: snapshot('ACCOUNT_CUSTOM', 'food1') },
      ] }] }],
    }],
  };
  return {
    appId: 'nutridiet-local-pro', formatVersion: 1, schemaVersion: '11', exportedAt: T,
    favorites: ['taco-1', 'food1'],
    agendaReminders: [{ id: 'rem1', date: '2026-04-01', time: '09:30', task: 'diet-update' }],
    account: [{ id: 'acc', displayName: 'Dra. Ana', phone: null, createdAt: T, updatedAt: T }],
    objectiveOptions: [
      { id: 'obj', accountId: 'acc', label: 'Cutting', normalizedLabel: 'cutting', origin: 'SYSTEM', archivedAt: null, createdAt: T, updatedAt: T },
      { id: 'obj2', accountId: 'acc', label: 'Hipertrofia', normalizedLabel: 'hipertrofia', origin: 'CUSTOM', archivedAt: null, createdAt: T, updatedAt: T },
    ],
    patients: [{
      id: 'pat1', accountId: 'acc', displayCode: 'P-0001', name: 'Maria Souza', age: 35, gender: 'Feminino', birthDate: '1990-05-10',
      isPregnant: false, pregnancyDueDate: null, heightCm: 165, weightKg: 62, maritalStatus: null, phone: '11987654321', whatsapp: null,
      currentObjective: 'Hipertrofia', targetProtein: 120, targetCarbs: 250, targetFats: 60, targetKcal: 2000,
      createdAt: T, updatedAt: T, version: 1, archivedAt: null,
    }],
    bodyAssessments: [{
      id: 'as1', accountId: 'acc', patientId: 'pat1', clinicalDate: '2026-03-10', weightKg: '62', bodyFatPercent: '25', fatMassKg: '15.5',
      leanMassKg: '46.5', waistCm: '70', scapulaCm: '25', bustCm: '90', abdomenCm: '80', hipCm: '95', leftProximalThighCm: '55',
      rightProximalThighCm: '55', neckCm: '33', leftArmCm: null, rightArmCm: null, leftDistalThighCm: null, rightDistalThighCm: null,
      leftCalfCm: null, rightCalfCm: null, autoFilledFields: ['neckCm'], calculationMethod: 'US_NAVY', calculationVersion: 'us-navy-v1',
      calculationInputSnapshot: { sex: 'female', heightCm: 165, neckCm: 33, waistCm: 70, abdomenCm: 80, hipCm: 95, weightKg: 62 },
      version: 1, createdAt: T, updatedAt: T,
    }],
    nextFollowUps: [{
      accountId: 'acc', patientId: 'pat1', dueDate: '2026-05-01', assessmentDueDate: null, dietDueDate: null, type: 'BOTH',
      comments: 'Paciente com hipertensão', version: 2, createdAt: T, updatedAt: T,
    }],
    dietPlans: [{ id: 'plan1', accountId: 'acc', patientId: 'pat1', name: 'Dieta 1', mode: 'SIMPLE', status: 'ACTIVE', weightReferenceKg: null, version: 3, createdAt: T, updatedAt: T, activatedAt: T, supersededAt: null }],
    dietVariations: [{ id: 'var/1', dietPlanId: 'plan1', accountId: 'acc', patientId: 'pat1', position: 0, kind: 'SIMPLE', name: 'Base', inputMode: 'GRAMS', targetProtein: '120', targetCarbs: '250', targetFat: '60', targetKcal: '2000', gPerKgProtein: null, gPerKgCarbs: null, gPerKgFat: null }],
    dietVariationDays: [{ variationId: 'var/1', dietPlanId: 'plan1', accountId: 'acc', patientId: 'pat1', dayCode: 'MON', position: 0 }],
    dietMeals: [{ id: 'meal1', dietPlanId: 'plan1', variationId: 'var/1', accountId: 'acc', patientId: 'pat1', position: 0, name: 'Café', time: '07:00' }],
    dietMealOptions: [{ id: 'opt1', dietMealId: 'meal1', position: 0, label: 'Opção 1', countsTowardTotals: true }],
    dietMealItems: [{ id: 'item1', dietMealOptionId: 'opt1', position: 0, role: 'PRIMARY', parentItemId: null, name: 'Whey' }],
    dietItemSnapshots: [{
      dietMealItemId: 'item1', sourceType: 'ACCOUNT_CUSTOM', sourceId: 'food1', sourceVersion: '2', displayName: 'Whey', description: 'd',
      measurementBasis: 'PER_100G', foodState: 'AS_SOLD', referenceQuantity: '100', referenceUnit: 'g', referenceProtein: '80', referenceCarbs: '5',
      referenceFat: '4', referenceFiber: '0', referenceEnergyKcal: '376', prescribedQuantity: '30', prescribedUnit: 'g', prescribedProtein: '24',
      prescribedCarbs: '1.5', prescribedFat: '1.2', prescribedFiber: '0', prescribedEnergyKcal: '112.8', energySource: 'REFERENCE',
      calculationVersion: 'v', conversionSnapshot: {}, compositionSnapshot: {},
    }],
    foodCatalogItems: [{
      id: 'food1', accountId: 'acc', name: 'Whey', description: 'Proteína', brand: null, measurementBasis: 'PER_100G', foodState: 'AS_SOLD',
      servingReference: null, servingUnit: null, referenceProtein: '80', referenceCarbs: '5', referenceFat: '4', referenceFiber: '0',
      referenceEnergyKcal: '376', energySource: 'REFERENCE', calculationVersion: 'v', status: 'ACTIVE', version: 2, createdAt: T, updatedAt: T, archivedAt: null,
    }],
    recipes: [{
      id: 'rec1', accountId: 'acc', name: 'Arroz com whey', category: 'Almoço', instructions: '', prepTimeMinutes: null, yieldPortions: '2',
      yieldUnit: 'PORTION', preparedWeightGrams: null, totalProtein: '40', totalCarbs: '60', totalFat: '10', totalFiber: '4', totalEnergyKcal: '490',
      perPortionProtein: '20', perPortionCarbs: '30', perPortionFat: '5', perPortionFiber: '2', perPortionEnergyKcal: '245',
      status: 'ACTIVE', version: 1, createdAt: T, updatedAt: T, archivedAt: null,
    }],
    recipeIngredients: [
      { id: 'ing1', recipeId: 'rec1', accountId: 'acc', position: 0, sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', sourceVersion: '1', quantity: '200', unit: 'g', ingredientSnapshot: snapshot('SYSTEM_TACO', 'taco-1', '200') },
      { id: 'ing2', recipeId: 'rec1', accountId: 'acc', position: 1, sourceType: 'ACCOUNT_CUSTOM', sourceId: 'food1', sourceVersion: '2', quantity: '50', unit: 'g', ingredientSnapshot: snapshot('ACCOUNT_CUSTOM', 'food1', '50') },
    ],
    readyMeals: [{ id: 'rm1', accountId: 'acc', name: 'Almoço pronto', description: '', suggestedTime: null, status: 'ACTIVE', version: 1, createdAt: T, updatedAt: T, archivedAt: null }],
    readyMealItems: [
      { id: 'rmi1', readyMealId: 'rm1', accountId: 'acc', position: 0, sourceType: 'FOOD', sourceId: 'food1', sourceVersion: '2', quantity: '30', unit: 'g', recipePortions: null, itemSnapshot: snapshot('ACCOUNT_CUSTOM', 'food1', '30') },
      { id: 'rmi2', readyMealId: 'rm1', accountId: 'acc', position: 1, sourceType: 'RECIPE', sourceId: 'rec1', sourceVersion: '1', quantity: null, unit: null, recipePortions: '1', itemSnapshot: snapshot('RECIPE', 'rec1', '1') },
    ],
    readyDiets: [{ id: 'rd1', accountId: 'acc', name: 'Pronta', document, version: 1, createdAt: T, updatedAt: T }],
    ...overrides,
  };
}

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
    '20261030120000_diets.sql', '20261030130000_library_foods_ready_diets.sql', '20261030140000_library_recipes_ready_meals.sql',
    '20261030150000_agenda_favorites.sql', '20261030160000_imports.sql', '20261030170000_objective_options.sql',
  ]) {
    await client.exec(migration(name));
  }
}, 60_000);

afterAll(async () => client.close());

describe('readNutridiet', () => {
  const owner = randomUUID();

  it('requires explicit confirmation for the legacy plaintext format', async () => {
    const text = JSON.stringify(envelope());
    await expect(readNutridiet(text, { ownerId: owner, confirmPlaintext: false })).rejects.toMatchObject({ status: 422, extra: { reason: 'CONFIRMATION_REQUIRED' } });
    const read = await readNutridiet(text, { ownerId: owner, confirmPlaintext: true });
    expect(read.format).toBe('nutridiet-v1-plaintext');
    expect(read.envelope.patients).toHaveLength(1);
  });

  it('rejects malformed JSON and invalid logical files without touching anything', async () => {
    await expect(readNutridiet('{nope', { ownerId: owner, confirmPlaintext: true })).rejects.toMatchObject({ status: 400 });
    await expect(readNutridiet(JSON.stringify({ ...envelope(), appId: 'other' }), { ownerId: owner, confirmPlaintext: true }))
      .rejects.toMatchObject({ status: 422, extra: { reason: 'BACKUP_APP_MISMATCH' } });
    await expect(readNutridiet(JSON.stringify(envelope({ extraTable: [] })), { ownerId: owner, confirmPlaintext: true }))
      .rejects.toMatchObject({ status: 422 });
  });

  describe('protected v2', () => {
    const saveId = randomUUID();
    const verifierId = 'kek-1';
    const mac = randomBytes(32);

    function protectedFile(plain: unknown, tamper = false): string {
      const header = {
        appId: 'nutridiet-local-pro' as const, formatVersion: 2 as const, saveId, algorithm: 'AES-256-GCM' as const,
        bindingProof: encodeBindingProof(verifierId, encodeBase64Url(mac)),
      };
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', dek, iv);
      cipher.setAAD(Buffer.from(protectedSaveAdditionalData(header)));
      const body = Buffer.concat([cipher.update(JSON.stringify(plain), 'utf8'), cipher.final(), cipher.getAuthTag()]);
      if (tamper) body[0] ^= 1;
      return JSON.stringify({ ...header, iv: encodeBase64Url(iv), ciphertext: encodeBase64Url(body) });
    }

    const record = {
      id: saveId, localAccountId: 'acc', keyId: randomUUID(), bindingKekId: verifierId, bindingMac: mac,
      wrappedKey: Buffer.alloc(48), wrapIv: Buffer.alloc(12), wrapKekId: 'k',
    };

    it('decrypts on the server with the save key and validates the content', async () => {
      const loadSave = vi.fn(async () => record as never);
      const read = await readNutridiet(protectedFile(envelope()), { ownerId: owner, confirmPlaintext: false, loadSave });
      expect(read.format).toBe('nutridiet-v2-protected');
      expect(read.envelope.patients[0].name).toBe('Maria Souza');
      expect(loadSave).toHaveBeenCalledWith(owner, saveId);
    });

    it('answers 404 for a save that is missing or belongs to someone else, and 422 for tampering', async () => {
      await expect(readNutridiet(protectedFile(envelope()), { ownerId: owner, confirmPlaintext: false, loadSave: async () => null }))
        .rejects.toMatchObject({ status: 404 });
      await expect(readNutridiet(protectedFile(envelope()), { ownerId: owner, confirmPlaintext: false, loadSave: async () => ({ ...record, bindingMac: randomBytes(32) }) as never }))
        .rejects.toMatchObject({ status: 404 });
      await expect(readNutridiet(protectedFile(envelope(), true), { ownerId: owner, confirmPlaintext: false, loadSave: async () => record as never }))
        .rejects.toMatchObject({ status: 422, extra: { reason: 'DECRYPTION_FAILED' } });
    });
  });
});

describe('importNutridietEnvelope', () => {
  const parsed = async (overrides: Record<string, unknown> = {}) =>
    (await readNutridiet(JSON.stringify(envelope(overrides)), { ownerId: randomUUID(), confirmPlaintext: true })).envelope;

  it('imports every entity into an empty account, remapping local IDs to stable UUIDs', async () => {
    const summary = await asAccount(accountA, async (tx, sealer) => importNutridietEnvelope(tx, sealer, accountA, await parsed()));
    expect(summary).toMatchObject({
      patients: 1, bodyAssessments: 1, nextFollowUps: 1, dietPlans: 1, foodCatalogItems: 1, recipes: 1, readyMeals: 1, readyDiets: 1,
      favorites: 2, agendaReminders: 1, objectiveOptions: 1, skipped: { account: 1, objectiveOptions: 1 },
    });
    expect(() => parseImportResultDto({ replayed: false, format: 'nutridiet-v1-plaintext', summary })).not.toThrow();

    const patientId = importedUuid(accountA, 'patient', 'pat1');
    const foodId = importedUuid(accountA, 'food', 'food1');
    await asAccount(accountA, async (tx, sealer) => {
      const patient = await createServerPatientRepository(tx, sealer, accountA).getById(patientId);
      expect(patient).toMatchObject({ name: 'Maria Souza', displayCode: 'P-0001', phone: '11987654321', currentObjective: 'Hipertrofia', version: 1 });

      const clinical = createServerClinicalRepository(tx, sealer, accountA);
      const [assessment] = await clinical.listAssessments(patientId);
      expect(assessment).toMatchObject({ clinicalDate: '2026-03-10', assessmentType: 'complete', bodyFatPercent: 25, neckCm: 33 });
      expect(await clinical.getFollowUp(patientId)).toMatchObject({
        dueDates: { ASSESSMENT_UPDATE: '2026-05-01', DIET_UPDATE: '2026-05-01' }, comments: 'Paciente com hipertensão', version: 2,
      });

      const [plan] = await createServerDietRepository(tx, accountA).listPlans(patientId);
      expect(plan).toMatchObject({ name: 'Dieta 1', status: 'ACTIVE', version: 3 });
      const item = plan.variations[0].meals[0].options[0].items[0];
      expect(item.id).toBe('item1');
      // IDs that are not safe inside documents get a stable hashed replacement; safe ones are kept.
      expect(plan.variations[0].id).toMatch(/^i[A-Za-z0-9_-]{22}$/);
      expect(item.snapshot.sourceId).toBe(foodId);

      const library = createServerLibraryRepository(tx, accountA);
      expect(await library.getFood(foodId)).toMatchObject({ name: 'Whey', version: 2 });
      expect((await library.listReadyDiets())[0].document.variations[0].meals[0].options[0].items[0].snapshot.sourceId).toBe(foodId);

      const recipes = createServerRecipeRepository(tx, accountA);
      const recipe = await recipes.getRecipe(importedUuid(accountA, 'recipe', 'rec1'));
      expect(recipe.ingredients.map((i) => i.sourceId)).toEqual(['taco-1', foodId]);
      const meal = await recipes.getReadyMeal(importedUuid(accountA, 'ready-meal', 'rm1'));
      expect(meal.items.map((i) => i.sourceId)).toEqual([foodId, recipe.id]);
      expect(meal.items[1].itemSnapshot.sourceId).toBe(recipe.id);

      const agenda = createServerAgendaRepository(tx, accountA);
      expect(await agenda.listFavorites()).toEqual([foodId, 'taco-1'].sort());
      expect(await agenda.listReminders()).toEqual([{ id: 'rem1', date: '2026-04-01', time: '09:30', task: 'diet-update' }]);
      const objectives = await createServerObjectiveRepository(tx, accountA).list();
      expect(objectives.find((option) => option.label === 'Hipertrofia')).toMatchObject({ origin: 'CUSTOM', id: importedUuid(accountA, 'objective', 'obj2') });
    });

    const raw = await client.query<{ sensitive: Uint8Array }>('SELECT sensitive FROM app.patients WHERE id = $1', [patientId]);
    expect(Buffer.from(raw.rows[0].sensitive).toString('latin1')).not.toContain('Maria');
  });

  it('refuses to merge into an account that already has data, writing nothing', async () => {
    await expect(asAccount(accountA, async (tx, sealer) => importNutridietEnvelope(tx, sealer, accountA, await parsed())))
      .rejects.toMatchObject({ status: 409, extra: { reason: 'ACCOUNT_NOT_EMPTY' } });
    const count = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM app.patients WHERE account_id = $1', [accountA]);
    expect(count.rows[0].n).toBe(1);
  });

  it('rolls the whole import back when any row is invalid', async () => {
    const bad = await parsed({ bodyAssessments: [{ ...envelope().bodyAssessments[0], clinicalDate: 'not-a-date' }] });
    await expect(asAccount(accountB, (tx, sealer) => importNutridietEnvelope(tx, sealer, accountB, bad)))
      .rejects.toMatchObject({ status: 422, extra: { reason: 'INVALID_CLINICAL_DATE' } });
    for (const table of ['patients', 'food_catalog_items', 'recipes', 'ready_meals', 'ready_diets', 'diet_plans']) {
      const count = await client.query<{ n: number }>(`SELECT count(*)::int AS n FROM app.${table} WHERE account_id = $1`, [accountB]);
      expect(count.rows[0].n).toBe(0);
    }
  });

  it('keeps imported rows isolated from other accounts and records the run without DELETE', async () => {
    const patientId = importedUuid(accountA, 'patient', 'pat1');
    await asAccount(accountB, async (tx, sealer) => {
      expect(await createServerPatientRepository(tx, sealer, accountB).getById(patientId)).toBeNull();
    });
    await asAccount(accountA, async (tx) => {
      await (tx as unknown as { execute(q: unknown): Promise<unknown> }).execute(sql`
        INSERT INTO app.import_runs (account_id, idempotency_key, source_format, summary)
        VALUES (${accountA}, ${'a'.repeat(64)}, 'nutridiet-v1-plaintext', '{}'::jsonb)`);
    });
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.import_runs`);
    })).rejects.toThrow();
  });

  it('derives the same IDs on every run', () => {
    expect(importedUuid(accountA, 'patient', 'pat1')).toBe(importedUuid(accountA, 'patient', 'pat1'));
    expect(importedUuid(accountA, 'patient', 'pat1')).not.toBe(importedUuid(accountB, 'patient', 'pat1'));
    expect(importedUuid(accountA, 'patient', 'pat1')).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/);
  });
});
