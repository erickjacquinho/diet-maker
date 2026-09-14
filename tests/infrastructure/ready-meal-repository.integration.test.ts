// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { createLibraryTestDatabase } from '../helpers/library-test-db';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { PGliteRecipeRepository } from '@/lib/infrastructure/local-db/library/recipe-repository';
import { PGliteReadyMealRepository } from '@/lib/infrastructure/local-db/library/ready-meal-repository';

let handle: Awaited<ReturnType<typeof createLibraryTestDatabase>> | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});
describe('ready meal repository', () => {
  it('persists food and recipe snapshots without accepting nested ready meals', async () => {
    handle = await createLibraryTestDatabase('ready-meal-repository');
    await new LocalAccountContextRepository(handle).getActiveOrCreate();
    const foodRepository = new PGliteFoodCatalogRepository(handle, { idFactory: () => 'ready-food' });
    const recipeRepository = new PGliteRecipeRepository(handle, { foodRepository, idFactory: (() => { let i = 0; return () => `ready-recipe-${i++}`; })() });
    const recipe = await recipeRepository.create('local-account', { name: 'Receita pronta', category: 'Teste', yieldPortions: '2', ingredients: [{ sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', quantity: '100', unit: 'g' }] });
    const repository = new PGliteReadyMealRepository(handle, { foodRepository, recipeRepository, idFactory: (() => { let i = 0; return () => `ready-meal-${i++}`; })() });
    const meal = await repository.create('local-account', { name: 'Combo', items: [{ sourceType: 'FOOD', sourceId: 'taco-1', quantity: '100', unit: 'g' }, { sourceType: 'RECIPE', sourceId: recipe.id, recipePortions: '1' }] });
    expect(meal.items).toHaveLength(2);
    expect(meal.items[1].itemSnapshot.sourceType).toBe('RECIPE');
    expect(meal.items[1].recipePortions).toBe('1');
  });
});
