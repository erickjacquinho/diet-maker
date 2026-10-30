import { randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const adminUrl = process.env.LOCAL_SUPABASE_DB_URL;
const runtimeUrl = process.env.ONLINE_DATABASE_URL;
const describeLocal = adminUrl && runtimeUrl ? describe : describe.skip;

// Test-only key material; the account keyring reads it lazily on first use.
process.env.ACCOUNT_KEK_ACTIVE_ID = 'v1';
process.env.ACCOUNT_KEK_V1 = randomBytes(32).toString('base64');

const CHILD_TABLES = [
  'import_runs', 'agenda_reminders', 'favorite_foods', 'objective_options', 'ready_diets', 'ready_meals', 'recipes',
  'food_catalog_items', 'diet_drafts', 'diet_plans', 'next_follow_ups', 'body_assessments', 'patients',
];

const nutrients = { protein: '10', carbs: '20', fat: '5', fiber: '2', energyKcal: '185' };
const dietDocument = (name: string, foodId: string) => ({
  name, mode: 'SIMPLE' as const,
  variations: [{
    id: 'v1', position: 0, kind: 'SIMPLE' as const, name: 'Base', inputMode: 'GRAMS' as const, assignedDays: [] as never[],
    targets: { protein: '120', carbs: '250', fat: '60', energyKcal: '2000' },
    meals: [{ id: 'm1', position: 0, name: 'Almoço', options: [{ id: 'o1', position: 0, label: 'A', countsTowardTotals: true, items: [{
      id: 'i1', position: 0, role: 'PRIMARY' as const, name: 'Whey', snapshot: {
        sourceType: 'ACCOUNT_CUSTOM' as const, sourceId: foodId, sourceVersion: '1', displayName: 'Whey', description: '', measurementBasis: 'PER_100G' as const,
        foodState: 'AS_SOLD' as const, referenceQuantity: '100', referenceUnit: 'g' as const, referenceNutrients: nutrients, prescribedQuantity: '30',
        prescribedUnit: 'g' as const, prescribedNutrients: nutrients, energySource: 'REFERENCE' as const, calculationVersion: 'v',
        conversionSnapshot: {}, compositionSnapshot: {},
      },
    }] }] }],
  }],
});

describeLocal('domain modules on a real Supabase Postgres (app_runtime, RLS, pg driver)', () => {
  let admin: Pool;
  const userA = randomUUID();
  const userB = randomUUID();
  let accountA = '';
  let accountB = '';
  const patient = randomUUID();
  const food = randomUUID();

  beforeAll(async () => {
    admin = new Pool({ connectionString: adminUrl!, max: 2 });
    for (const id of [userA, userB]) {
      await admin.query(
        `INSERT INTO auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
         VALUES ($1, 'authenticated', 'authenticated', $2, '{}'::jsonb, '{}'::jsonb, now(), now())`,
        [id, `${id}@example.invalid`],
      );
    }
    const { resolveOrCreateAccount } = await import('../../src/lib/server/online-db/accounts');
    accountA = (await resolveOrCreateAccount(userA)).id;
    accountB = (await resolveOrCreateAccount(userB)).id;
  }, 30_000);

  afterAll(async () => {
    const { closeOnlineDatabase } = await import('../../src/lib/server/online-db/client');
    await closeOnlineDatabase();
    for (const accountId of [accountA, accountB]) {
      for (const table of CHILD_TABLES) await admin.query(`DELETE FROM app.${table} WHERE account_id = $1`, [accountId]);
      await admin.query('DELETE FROM private.account_keys WHERE account_id = $1', [accountId]);
    }
    await admin.query('DELETE FROM app.accounts WHERE owner_user_id = ANY($1::uuid[])', [[userA, userB]]);
    await admin.query('DELETE FROM auth.users WHERE id = ANY($1::uuid[])', [[userA, userB]]);
    await admin.end();
  });

  async function inAccount<T>(accountId: string, run: (modules: Awaited<ReturnType<typeof load>>, tx: never) => Promise<T>): Promise<T> {
    const { withAccountTransaction } = await import('../../src/lib/server/online-db/accounts');
    const modules = await load();
    return withAccountTransaction(accountId, (tx) => run(modules, tx as never));
  }

  async function load() {
    const [{ accountKeys }, patients, clinical, diets, library, recipes, agenda, objectives, summaries] = await Promise.all([
      import('../../src/lib/server/crypto/account-keys'),
      import('../../src/lib/server/patients/patient-repository'),
      import('../../src/lib/server/clinical/clinical-repository'),
      import('../../src/lib/server/diets/diet-repository'),
      import('../../src/lib/server/library/library-repository'),
      import('../../src/lib/server/library/recipe-repository'),
      import('../../src/lib/server/agenda/agenda-repository'),
      import('../../src/lib/server/objectives/objective-repository'),
      import('../../src/lib/server/patients/patient-summaries'),
    ]);
    return { accountKeys, patients, clinical, diets, library, recipes, agenda, objectives, summaries };
  }

  it('runs the whole clinical flow for account A through the real driver and policies', async () => {
    await inAccount(accountA, async (m, tx) => {
      const sealer = m.accountKeys.createSealer(tx, accountA);
      const patients = m.patients.createServerPatientRepository(tx, sealer, accountA);
      const created = await patients.create(patient, { name: 'Maria Souza', gender: 'Feminino', birthDate: '1990-05-10', heightCm: 165, weightKg: 62, phone: '11987654321', whatsapp: '11987654321' } as never);
      expect(created.patient).toMatchObject({ name: 'Maria Souza', displayCode: 'P-0001', version: 1, heightCm: 165 });

      const clinical = m.clinical.createServerClinicalRepository(tx, sealer, accountA);
      const assessment = await clinical.createAssessment(patient, randomUUID(), {
        clinicalDate: '2026-03-10', weightKg: 62, scapulaCm: 25, bustCm: 90, waistCm: 70, abdomenCm: 80, hipCm: 95, leftProximalThighCm: 55,
      } as never);
      expect(assessment.assessment).toMatchObject({ clinicalDate: '2026-03-10', assessmentType: 'complete', rightProximalThighCm: 55 });
      expect(assessment.assessment.bodyFatPercent).toBeGreaterThan(0);
      const followUp = await clinical.setFollowUp(patient, undefined, { dueDates: { DIET_UPDATE: '2026-06-01' }, comments: 'retorno em junho' });
      expect(followUp).toMatchObject({ dueDate: '2026-06-01', comments: 'retorno em junho', version: 1 });
      const [moved] = await clinical.moveFollowUps([{ patientId: patient, types: ['DIET_UPDATE'], expectedVersion: 1, dueDate: '2026-07-01' }]);
      expect(moved.after).toMatchObject({ dueDate: '2026-07-01', comments: 'retorno em junho', version: 2 });

      const library = m.library.createServerLibraryRepository(tx, accountA);
      const created2 = await library.createFood(food, { name: 'Whey', measurementBasis: 'PER_100G', foodState: 'AS_SOLD', referenceNutrients: { protein: '80', carbs: '5', fat: '4', fiber: '0' } });
      expect(created2.food.referenceNutrients).toMatchObject({ protein: '80', energyKcal: '376' });

      const diets = m.diets.createServerDietRepository(tx, accountA);
      const dietId = randomUUID();
      expect(await diets.confirmActive(patient, { dietId, document: dietDocument('Dieta 1', food) as never })).toEqual({ status: 'COMMITTED_NEW', planId: dietId, version: 1 });
      await diets.confirmActive(patient, { dietId: randomUUID(), document: dietDocument('Dieta 2', food) as never });
      expect((await diets.listPlans(patient)).map((plan) => plan.status)).toEqual(['ACTIVE', 'SNAPSHOT']);
      await diets.putDraft(patient, 'nova', { draftId: 'd1', draftRevision: 1, payloadSchemaVersion: 1, payload: dietDocument('Rascunho', food) as never });

      const recipes = m.recipes.createServerRecipeRepository(tx, accountA);
      const recipe = await recipes.createRecipe(randomUUID(), {
        name: 'Arroz com whey', category: 'Almoço', yieldPortions: '2',
        ingredients: [{ sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', quantity: '200', unit: 'g' }, { sourceType: 'ACCOUNT_CUSTOM', sourceId: food, quantity: '50', unit: 'g' }],
      });
      expect(recipe.nutrition.total.protein).toBe('45.2');
      const meal = await recipes.createReadyMeal(randomUUID(), { name: 'Almoço pronto', items: [{ sourceType: 'RECIPE', sourceId: recipe.id, recipePortions: '1' }, { sourceType: 'FOOD', sourceId: food, quantity: '30', unit: 'g' }] });
      expect(meal.items).toHaveLength(2);
      await library.createReadyDiet(randomUUID(), 'Low carb', dietDocument('Pronta', food) as never);

      const objectives = m.objectives.createServerObjectiveRepository(tx, accountA);
      expect((await objectives.addCustom('Ganho de força')).origin).toBe('CUSTOM');
      const agenda = m.agenda.createServerAgendaRepository(tx, accountA);
      await agenda.putReminder({ id: 'rem1', date: '2026-04-01', time: '09:30', task: 'diet-update' });
      await agenda.setFavorite('taco-1', true);
      expect(await agenda.listFavorites()).toEqual(['taco-1']);

      const [summary] = await m.summaries.summarizePatients(tx, accountA, [patient], sealer);
      expect(summary).toMatchObject({ dietCount: 2, assessmentCount: 1, lastActivity: { type: 'diet' }, nextFollowUp: { dueDate: '2026-07-01' } });
      expect(summary.latestAssessment?.clinicalDate).toBe('2026-03-10');

      await patients.archive(patient, 1);
      expect(await diets.invalidateDrafts(patient)).toBe(1);
    });
  }, 60_000);

  it('stores the identification and follow-up comments encrypted, and measures in clear', async () => {
    const raw = await admin.query<{ sensitive: Buffer; weight_kg: string }>('SELECT sensitive, weight_kg FROM app.patients WHERE id = $1', [patient]);
    expect(raw.rows[0].sensitive.toString('latin1')).not.toContain('Maria');
    expect(raw.rows[0].sensitive.toString('latin1')).not.toContain('11987654321');
    expect(raw.rows[0].weight_kg).toBe('62');
    const comments = await admin.query<{ comments: Buffer }>('SELECT comments FROM app.next_follow_ups WHERE patient_id = $1', [patient]);
    expect(comments.rows[0].comments.toString('latin1')).not.toContain('junho');
  });

  it('keeps account B blind to every module of account A', async () => {
    await inAccount(accountB, async (m, tx) => {
      const sealer = m.accountKeys.createSealer(tx, accountB);
      expect(await m.patients.createServerPatientRepository(tx, sealer, accountB).getById(patient)).toBeNull();
      await expect(m.clinical.createServerClinicalRepository(tx, sealer, accountB).listAssessments(patient)).rejects.toMatchObject({ status: 404 });
      await expect(m.diets.createServerDietRepository(tx, accountB).listPlans(patient)).rejects.toMatchObject({ status: 404 });
      await expect(m.library.createServerLibraryRepository(tx, accountB).getFood(food)).rejects.toMatchObject({ status: 404 });
      expect(await m.library.createServerLibraryRepository(tx, accountB).listReadyDiets()).toEqual([]);
      expect(await m.recipes.createServerRecipeRepository(tx, accountB).listRecipes({ includeArchived: true })).toEqual([]);
      expect(await m.agenda.createServerAgendaRepository(tx, accountB).listReminders()).toEqual([]);
      expect(await m.agenda.createServerAgendaRepository(tx, accountB).listFavorites()).toEqual([]);
      expect(await m.summaries.summarizePatients(tx, accountB, [patient], sealer)).toEqual([]);
    });
  });

  it('refuses cross-account writes and any DELETE at the database level', async () => {
    const { withAccountTransaction } = await import('../../src/lib/server/online-db/accounts');
    const { sql } = await import('drizzle-orm');
    await expect(withAccountTransaction(accountB, (tx) => tx.execute(sql`
      INSERT INTO app.body_assessments (account_id, id, patient_id, clinical_date, assessment_type, weight_kg, calculation_method, calculation_version, calculation_input, version)
      VALUES (${accountB}, ${randomUUID()}, ${patient}, '2026-01-01', 'simplified', 70, 'NONE', 'x', '{}'::jsonb, 1)`))).rejects.toThrow();
    for (const table of ['patients', 'diet_plans', 'diet_drafts', 'recipes', 'next_follow_ups', 'import_runs']) {
      await expect(withAccountTransaction(accountA, (tx) => tx.execute(sql.raw(`DELETE FROM app.${table}`)))).rejects.toThrow();
    }
  });
});
