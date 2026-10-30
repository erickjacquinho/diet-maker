// @vitest-environment node
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createServerRecipeRepository } from '../../src/lib/server/library/recipe-repository';
import { createServerLibraryRepository } from '../../src/lib/server/library/library-repository';
import { parseCustomFoodInput } from '../../src/lib/contracts/library';
import { parseCreateReadyMealRequest, parseCreateRecipeRequest, parseReadyMealDto, parseRecipeDto, parseRecipeInput } from '../../src/lib/contracts/recipes';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}`, 'utf8');
const accountA = randomUUID();
const accountB = randomUUID();

let client: PGlite;
let db: ReturnType<typeof drizzle>;

async function asAccount<T>(
  accountId: string,
  run: (recipes: ReturnType<typeof createServerRecipeRepository>, library: ReturnType<typeof createServerLibraryRepository>) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    return run(createServerRecipeRepository(tx as never, accountId), createServerLibraryRepository(tx as never, accountId));
  });
}

const customFoodId = randomUUID();
const recipeInput = (name: string, extra: Record<string, unknown> = {}) => parseRecipeInput({
  name, category: 'Almoço', yieldPortions: '2',
  ingredients: [
    { sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', quantity: '200', unit: 'g' },
    { sourceType: 'ACCOUNT_CUSTOM', sourceId: customFoodId, quantity: '50', unit: 'g' },
  ],
  ...extra,
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
  for (const name of [
    '20261029120000_account_keys.sql', '20261029130000_patients.sql', '20261030120000_diets.sql',
    '20261030130000_library_foods_ready_diets.sql', '20261030140000_library_recipes_ready_meals.sql',
  ]) {
    await client.exec(migration(name));
  }
  await asAccount(accountA, (_r, l) => l.createFood(customFoodId, parseCustomFoodInput({
    name: 'Whey', measurementBasis: 'PER_100G', foodState: 'AS_SOLD',
    referenceNutrients: { protein: '80', carbs: '5', fat: '4', fiber: '0' },
  })));
}, 60_000);

afterAll(async () => client.close());

describe('server recipe repository (recipes, RLS)', () => {
  const recipeId = randomUUID();

  it('creates a recipe with TACO and custom ingredients, computing nutrition idempotently', async () => {
    const created = await asAccount(accountA, (r) => r.createRecipe(recipeId, recipeInput('Arroz com whey')));
    expect(created).toMatchObject({ id: recipeId, status: 'ACTIVE', version: 1, yieldPortions: '2', yieldUnit: 'PORTION' });
    expect(created.ingredients.map((i) => [i.position, i.sourceType, i.sourceVersion !== ''])).toEqual([[0, 'SYSTEM_TACO', true], [1, 'ACCOUNT_CUSTOM', true]]);
    // 200 g of taco-1 (2.6 g protein/100 g) + 50 g whey (80 g protein/100 g) = 5.2 + 40 = 45.2
    expect(created.nutrition.total.protein).toBe('45.2');
    expect(created.nutrition.perPortion.protein).toBe('22.6');
    expect(() => parseRecipeDto(created)).not.toThrow();

    const again = await asAccount(accountA, (r) => r.createRecipe(recipeId, recipeInput('Outro nome')));
    expect(again.name).toBe('Arroz com whey');
  });

  it('rejects invalid recipes with 422 naming only the field', async () => {
    await expect(asAccount(accountA, (r) => r.createRecipe(randomUUID(), recipeInput('X', { yieldPortions: '0' }))))
      .rejects.toMatchObject({ status: 422, extra: { field: 'yieldPortions' } });
    await expect(asAccount(accountA, (r) => r.createRecipe(randomUUID(), recipeInput('X', {
      ingredients: [{ sourceType: 'SYSTEM_TACO', sourceId: 'taco-inexistente', quantity: '10', unit: 'g' }],
    })))).rejects.toMatchObject({ status: 422, extra: { field: 'ingredients' } });
    await expect(asAccount(accountA, (r) => r.createRecipe(randomUUID(), recipeInput('X', {
      ingredients: [{ sourceType: 'ACCOUNT_CUSTOM', sourceId: 'not-a-uuid', quantity: '10', unit: 'g' }],
    })))).rejects.toMatchObject({ status: 422, extra: { field: 'ingredients' } });
  });

  it("does not let an account use another account's custom food, nor an archived one", async () => {
    await expect(asAccount(accountB, (r) => r.createRecipe(randomUUID(), recipeInput('Roubo')))).rejects.toMatchObject({ status: 422, extra: { field: 'ingredients' } });
    const archivedFood = randomUUID();
    await asAccount(accountA, async (_r, l) => {
      await l.createFood(archivedFood, parseCustomFoodInput({ name: 'Velho', measurementBasis: 'PER_100G', foodState: 'RAW', referenceNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '1' } }));
      await l.archiveFood(archivedFood, 1);
    });
    await expect(asAccount(accountA, (r) => r.createRecipe(randomUUID(), recipeInput('Velho', {
      ingredients: [{ sourceType: 'ACCOUNT_CUSTOM', sourceId: archivedFood, quantity: '10', unit: 'g' }],
    })))).rejects.toMatchObject({ status: 422 });
  });

  it('updates with optimistic versions, archives, restores and duplicates', async () => {
    await expect(asAccount(accountA, (r) => r.updateRecipe(recipeId, 9, recipeInput('X')))).rejects.toMatchObject({ code: 'VERSION_CONFLICT', extra: { currentVersion: 1 } });
    const updated = await asAccount(accountA, (r) => r.updateRecipe(recipeId, 1, recipeInput('Arroz com whey 2', { yieldPortions: '4' })));
    expect(updated).toMatchObject({ name: 'Arroz com whey 2', version: 2, yieldPortions: '4' });
    expect(updated.nutrition.perPortion.protein).toBe('11.3');
    const archived = await asAccount(accountA, (r) => r.archiveRecipe(recipeId, 2));
    expect(archived).toMatchObject({ status: 'ARCHIVED', version: 3 });
    expect((await asAccount(accountA, (r) => r.listRecipes())).length).toBe(0);
    expect((await asAccount(accountA, (r) => r.listRecipes({ includeArchived: true }))).length).toBe(1);
    expect(await asAccount(accountA, (r) => r.restoreRecipe(recipeId, 3))).toMatchObject({ status: 'ACTIVE', version: 4 });
    const copyId = randomUUID();
    const copy = await asAccount(accountA, (r) => r.duplicateRecipe(recipeId, copyId));
    expect(copy).toMatchObject({ id: copyId, name: 'Arroz com whey 2 (cópia)', version: 1 });
  });

  it('hides recipes from other accounts and grants no DELETE', async () => {
    await expect(asAccount(accountB, (r) => r.getRecipe(recipeId))).rejects.toMatchObject({ status: 404 });
    await expect(asAccount(accountB, (r) => r.archiveRecipe(recipeId, 4))).rejects.toMatchObject({ status: 404 });
    expect(await asAccount(accountB, (r) => r.listRecipes({ includeArchived: true }))).toEqual([]);
    for (const table of ['recipes', 'ready_meals']) {
      await expect(db.transaction(async (tx) => {
        await tx.execute(sql`SET LOCAL ROLE app_runtime`);
        await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
        await tx.execute(sql.raw(`DELETE FROM app.${table}`));
      })).rejects.toThrow();
    }
  });
});

describe('server recipe repository (ready meals)', () => {
  const mealId = randomUUID();
  const recipeId = randomUUID();
  const meal = (name: string, items: unknown[]) => parseCreateReadyMealRequest({ id: mealId, readyMeal: { name, items } }).readyMeal;

  it('builds snapshots for TACO foods, custom foods and recipes', async () => {
    await asAccount(accountA, (r) => r.createRecipe(recipeId, recipeInput('Base')));
    const created = await asAccount(accountA, (r) => r.createReadyMeal(mealId, meal('Almoço pronto', [
      { sourceType: 'FOOD', sourceId: 'taco-1', quantity: '100', unit: 'g' },
      { sourceType: 'FOOD', sourceId: customFoodId, quantity: '30', unit: 'g' },
      { sourceType: 'RECIPE', sourceId: recipeId, recipePortions: '1', recipeUnit: 'PORTION' },
    ])));
    expect(created).toMatchObject({ id: mealId, status: 'ACTIVE', version: 1 });
    expect(created.items.map((i) => [i.sourceType, i.itemSnapshot.sourceType])).toEqual([
      ['FOOD', 'SYSTEM_TACO'], ['FOOD', 'ACCOUNT_CUSTOM'], ['RECIPE', 'RECIPE'],
    ]);
    expect(created.items[2].itemSnapshot.prescribedNutrients.protein).toBe('22.6');
    expect(() => parseReadyMealDto(created)).not.toThrow();
    const again = await asAccount(accountA, (r) => r.createReadyMeal(mealId, meal('Outro', [{ sourceType: 'FOOD', sourceId: 'taco-1', quantity: '1', unit: 'g' }])));
    expect(again.name).toBe('Almoço pronto');
  });

  it('keeps the snapshot when the recipe later changes', async () => {
    await asAccount(accountA, (r) => r.updateRecipe(recipeId, 1, recipeInput('Base', { yieldPortions: '10' })));
    const stored = await asAccount(accountA, (r) => r.getReadyMeal(mealId));
    expect(stored.items[2].itemSnapshot.prescribedNutrients.protein).toBe('22.6');
  });

  it('rejects wrong recipe units, archived or foreign recipes and invalid items', async () => {
    const item = (extra: Record<string, unknown>) => meal('X', [{ sourceType: 'RECIPE', sourceId: recipeId, recipePortions: '1', ...extra }]);
    await expect(asAccount(accountA, (r) => r.createReadyMeal(randomUUID(), item({ recipeUnit: 'g' })))).rejects.toMatchObject({ status: 422, extra: { field: 'items' } });
    await expect(asAccount(accountB, (r) => r.createReadyMeal(randomUUID(), item({})))).rejects.toMatchObject({ status: 422, extra: { field: 'items' } });
    await expect(asAccount(accountA, (r) => r.createReadyMeal(randomUUID(), meal('X', [{ sourceType: 'FOOD', sourceId: 'taco-1', unit: 'g' }]))))
      .rejects.toMatchObject({ status: 422 });
  });

  it('updates, archives, restores, duplicates and isolates by account', async () => {
    const updated = await asAccount(accountA, (r) => r.updateReadyMeal(mealId, 1, meal('Almoço 2', [{ sourceType: 'FOOD', sourceId: 'taco-1', quantity: '50', unit: 'g' }])));
    expect(updated).toMatchObject({ name: 'Almoço 2', version: 2 });
    expect(updated.items).toHaveLength(1);
    await expect(asAccount(accountA, (r) => r.updateReadyMeal(mealId, 1, meal('X', [{ sourceType: 'FOOD', sourceId: 'taco-1', quantity: '1', unit: 'g' }])))).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    expect(await asAccount(accountA, (r) => r.archiveReadyMeal(mealId, 2))).toMatchObject({ status: 'ARCHIVED', version: 3 });
    expect(await asAccount(accountA, (r) => r.restoreReadyMeal(mealId, 3))).toMatchObject({ status: 'ACTIVE', version: 4 });
    const copy = await asAccount(accountA, (r) => r.duplicateReadyMeal(mealId, randomUUID()));
    expect(copy.name).toBe('Almoço 2 (cópia)');
    await expect(asAccount(accountB, (r) => r.getReadyMeal(mealId))).rejects.toMatchObject({ status: 404 });
    expect(await asAccount(accountB, (r) => r.listReadyMeals({ includeArchived: true }))).toEqual([]);
  });
});

describe('recipe contracts', () => {
  it('rejects server-owned fields and malformed values', () => {
    for (const field of ['status', 'version', 'nutrition', 'accountId']) {
      expect(() => parseRecipeInput({ name: 'x', category: 'y', yieldPortions: '1', ingredients: [], [field]: 1 })).toThrow('Unknown field');
    }
    expect(() => parseRecipeInput({ name: 'x', category: 'y', yieldPortions: '-1', ingredients: [] })).toThrow('Invalid decimal');
    expect(() => parseCreateRecipeRequest({ id: 'x', recipe: {} })).toThrow('Invalid id');
    expect(() => parseCreateReadyMealRequest({ id: randomUUID(), readyMeal: { name: 'x', items: [{ sourceType: 'DRINK', sourceId: 'a' }] } })).toThrow('Invalid option');
  });
});
