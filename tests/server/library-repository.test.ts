// @vitest-environment node
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createServerLibraryRepository } from '../../src/lib/server/library/library-repository';
import { parseCreateFoodRequest, parseCustomFoodInput, parseFoodDto, parseFoodListRequest } from '../../src/lib/contracts/library';
import { parseDietDocument } from '../../src/lib/contracts/diets';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}`, 'utf8');
const accountA = randomUUID();
const accountB = randomUUID();

let client: PGlite;
let db: ReturnType<typeof drizzle>;

async function asAccount<T>(accountId: string, run: (library: ReturnType<typeof createServerLibraryRepository>) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    return run(createServerLibraryRepository(tx as never, accountId));
  });
}

const food = (name: string, extra: Record<string, unknown> = {}) => parseCustomFoodInput({
  name, measurementBasis: 'PER_100G', foodState: 'COOKED',
  referenceNutrients: { protein: '10.50', carbs: '20', fat: '5', fiber: '2' }, ...extra,
});

const dietUsing = (foodId: string) => parseDietDocument({
  name: 'Dieta', mode: 'SIMPLE',
  variations: [{
    id: 'v1', position: 0, kind: 'SIMPLE', name: 'Base', inputMode: 'GRAMS', assignedDays: [],
    targets: { protein: '1', carbs: '1', fat: '1', energyKcal: '1' },
    meals: [{ id: 'm1', position: 0, name: 'Almoço', options: [{ id: 'o1', position: 0, label: 'A', countsTowardTotals: true, items: [{
      id: 'i1', position: 0, role: 'PRIMARY', name: 'Item', snapshot: {
        sourceType: 'ACCOUNT_CUSTOM', sourceId: foodId, sourceVersion: '1', displayName: 'Item', description: '',
        measurementBasis: 'PER_100G', foodState: 'COOKED', referenceQuantity: '100', referenceUnit: 'g',
        referenceNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' }, prescribedQuantity: '100', prescribedUnit: 'g',
        prescribedNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' }, energySource: 'CALCULATED_449',
        calculationVersion: 'v', conversionSnapshot: {}, compositionSnapshot: {},
      },
    }] }] }],
  }],
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
  for (const name of ['20261029120000_account_keys.sql', '20261029130000_patients.sql', '20261030120000_diets.sql', '20261030130000_library_foods_ready_diets.sql']) {
    await client.exec(migration(name));
  }
}, 60_000);

afterAll(async () => client.close());

describe('server library repository (foods + ready diets, RLS)', () => {
  const foodId = randomUUID();

  it('creates a food idempotently, normalizing decimals and computing energy', async () => {
    const created = await asAccount(accountA, (l) => l.createFood(foodId, food('Frango')));
    expect(created.created).toBe(true);
    expect(created.food).toMatchObject({
      id: foodId, status: 'ACTIVE', version: 1, energySource: 'CALCULATED_449',
      referenceNutrients: { protein: '10.5', carbs: '20', fat: '5', fiber: '2', energyKcal: '167' },
    });
    const again = await asAccount(accountA, (l) => l.createFood(foodId, food('Outro')));
    expect(again.created).toBe(false);
    expect(again.food.name).toBe('Frango');
  });

  it('rejects invalid foods with 422 naming only the field', async () => {
    await expect(asAccount(accountA, (l) => l.createFood(randomUUID(), food('  '))))
      .rejects.toMatchObject({ status: 422, extra: { field: 'name' } });
  });

  it('lists active foods by name, filters by search and includes archived on request', async () => {
    await asAccount(accountA, (l) => l.createFood(randomUUID(), food('Arroz')));
    const all = await asAccount(accountA, (l) => l.listFoods());
    expect(all.map((f) => f.name)).toEqual(['Arroz', 'Frango']);
    expect((await asAccount(accountA, (l) => l.listFoods({ search: 'FRA' }))).map((f) => f.name)).toEqual(['Frango']);
  });

  it('updates, archives and restores with optimistic versions', async () => {
    await expect(asAccount(accountA, (l) => l.updateFood(foodId, 9, food('X')))).rejects.toMatchObject({ code: 'VERSION_CONFLICT', extra: { currentVersion: 1 } });
    const updated = await asAccount(accountA, (l) => l.updateFood(foodId, 1, food('Frango grelhado')));
    expect(updated).toMatchObject({ name: 'Frango grelhado', version: 2 });
    const archived = await asAccount(accountA, (l) => l.archiveFood(foodId, 2));
    expect(archived).toMatchObject({ status: 'ARCHIVED', version: 3 });
    expect((await asAccount(accountA, (l) => l.listFoods())).map((f) => f.name)).toEqual(['Arroz']);
    expect((await asAccount(accountA, (l) => l.listFoods({ includeArchived: true }))).length).toBe(2);
    const restored = await asAccount(accountA, (l) => l.restoreFood(foodId, 3));
    expect(restored).toMatchObject({ status: 'ACTIVE', archivedAt: null, version: 4 });
  });

  it('duplicates a food as a new entity', async () => {
    const copyId = randomUUID();
    const { food: copy } = await asAccount(accountA, (l) => l.duplicateFood(foodId, copyId));
    expect(copy).toMatchObject({ id: copyId, name: 'Frango grelhado (cópia)', version: 1 });
  });

  it('hides foods from other accounts', async () => {
    await expect(asAccount(accountB, (l) => l.getFood(foodId))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountB, (l) => l.archiveFood(foodId, 4))).rejects.toMatchObject({ status: 404 });
    expect(await asAccount(accountB, (l) => l.listFoods({ includeArchived: true }))).toEqual([]);
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountB}, true)`);
      await tx.execute(sql`INSERT INTO app.food_catalog_items (account_id, id, name, measurement_basis, food_state, reference_protein,
        reference_carbs, reference_fat, reference_fiber, energy_source, calculation_version, status, version)
        VALUES (${accountA}, ${randomUUID()}, 'x', 'PER_100G', 'RAW', 0, 0, 0, 0, 'REFERENCE', 'v', 'ACTIVE', 1)`);
    })).rejects.toThrow();
  });

  it('deletes only unreferenced foods', async () => {
    const used = randomUUID();
    await asAccount(accountA, (l) => l.createFood(used, food('Usado')));
    await asAccount(accountA, (l) => l.createReadyDiet(randomUUID(), 'Pronta', dietUsing(used)));
    await expect(asAccount(accountA, (l) => l.deleteFoodIfUnreferenced(used, 1))).rejects.toMatchObject({ status: 409, extra: { reason: 'IN_USE' } });

    const free = randomUUID();
    await asAccount(accountA, (l) => l.createFood(free, food('Livre')));
    await expect(asAccount(accountA, (l) => l.deleteFoodIfUnreferenced(free, 7))).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    await asAccount(accountA, (l) => l.deleteFoodIfUnreferenced(free, 1));
    await expect(asAccount(accountA, (l) => l.getFood(free))).rejects.toMatchObject({ status: 404 });
  });

  it('also treats a food in a confirmed diet as referenced', async () => {
    const used = randomUUID();
    const patient = randomUUID();
    await asAccount(accountA, (l) => l.createFood(used, food('NaDieta')));
    await client.exec(`SET ROLE postgres`).catch(() => undefined);
    await client.query(
      `INSERT INTO app.patients (account_id, id, display_code, sensitive, sensitive_key_version, gender, version)
       VALUES ($1, $2, 'P-0001', decode(repeat('00', 64), 'hex'), 1, 'x', 1)`, [accountA, patient]);
    await client.query(
      `INSERT INTO app.diet_plans (account_id, id, patient_id, name, mode, status, variations, version)
       VALUES ($1, $2, $3, 'D', 'SIMPLE', 'ACTIVE', $4::jsonb, 1)`,
      [accountA, randomUUID(), patient, JSON.stringify(dietUsing(used).variations)]);
    await expect(asAccount(accountA, (l) => l.deleteFoodIfUnreferenced(used, 1))).rejects.toMatchObject({ status: 409 });
  });

  it('creates and lists ready diets, idempotently and per account', async () => {
    const id = randomUUID();
    const created = await asAccount(accountA, (l) => l.createReadyDiet(id, ' Low carb ', dietUsing(randomUUID())));
    expect(created).toMatchObject({ id, name: 'Low carb', version: 1 });
    expect((await asAccount(accountA, (l) => l.createReadyDiet(id, 'Outro', dietUsing(randomUUID())))).name).toBe('Low carb');
    expect((await asAccount(accountA, (l) => l.listReadyDiets())).length).toBeGreaterThanOrEqual(1);
    expect(await asAccount(accountB, (l) => l.listReadyDiets())).toEqual([]);
  });

  it('keeps DELETE off ready diets', async () => {
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
      await tx.execute(sql`DELETE FROM app.ready_diets`);
    })).rejects.toThrow();
  });
});

describe('library contracts', () => {
  it('rejects server-owned fields and malformed decimals', () => {
    for (const field of ['accountId', 'version', 'status', 'calculationVersion']) {
      expect(() => parseCustomFoodInput({ name: 'x', measurementBasis: 'PER_100G', foodState: 'RAW', referenceNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' }, [field]: 1 })).toThrow('Unknown field');
    }
    expect(() => food('x', { referenceNutrients: { protein: '-1', carbs: '1', fat: '1', fiber: '1' } })).toThrow('Invalid decimal');
    expect(() => parseCreateFoodRequest({ id: 'x', food: {} })).toThrow('Invalid id');
  });

  it('validates the list query and drops private fields on output', () => {
    expect(parseFoodListRequest(new URLSearchParams('search=a&includeArchived=true'))).toEqual({ search: 'a', includeArchived: true });
    expect(() => parseFoodListRequest(new URLSearchParams('includeArchived=maybe'))).toThrow('Invalid flag');
    const dto = parseFoodDto({
      id: 'a', accountId: 'secret', name: 'N', description: '', measurementBasis: 'PER_100G', foodState: 'RAW',
      referenceNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' }, energySource: 'REFERENCE',
      calculationVersion: 'v', status: 'ACTIVE', version: 1, createdAt: 'a', updatedAt: 'b', archivedAt: null,
    });
    expect(dto).not.toHaveProperty('accountId');
  });
});
