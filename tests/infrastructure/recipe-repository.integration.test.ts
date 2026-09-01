// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { createLibraryTestDatabase } from '../helpers/library-test-db';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { PGliteRecipeRepository } from '@/lib/infrastructure/local-db/library/recipe-repository';

let handle: Awaited<ReturnType<typeof createLibraryTestDatabase>> | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('recipe repository', () => {
  it('persists an atomic aggregate, preserves snapshots on duplication and enforces source scope', async () => {
    handle = await createLibraryTestDatabase('recipe-repository');
    await new LocalAccountContextRepository(handle).getActiveOrCreate();
    const foodRepository = new PGliteFoodCatalogRepository(handle, { idFactory: () => 'food-recipe-source' });
    const customFood = await foodRepository.create('local-account', {
      name: 'Leite customizado', measurementBasis: 'PER_100ML', foodState: 'AS_SOLD',
      referenceNutrients: { protein: '3', carbs: '4', fat: '2', fiber: '0' },
    });
    let nextId = 0;
    const repository = new PGliteRecipeRepository(handle, { foodRepository, idFactory: () => `recipe-id-${nextId++}` });
    const input = {
      name: 'Vitamina', category: 'Café', instructions: 'Bater.', yieldPortions: '2',
      ingredients: [
        { sourceType: 'SYSTEM_TACO' as const, sourceId: 'taco-1', quantity: '100', unit: 'g' as const },
        { sourceType: 'ACCOUNT_CUSTOM' as const, sourceId: customFood.id, quantity: '100', unit: 'ml' as const },
      ],
    };
    const created = await repository.create('local-account', input);
    expect(created.ingredients).toHaveLength(2);
    expect(created.ingredients[1].ingredientSnapshot.sourceVersion).toBe(String(customFood.version));
    expect(created.nutrition.perPortion.protein).toBeDefined();
    const copy = await repository.duplicate('local-account', created.id);
    expect(copy.id).not.toBe(created.id);
    expect(copy.ingredients.map((item) => item.id)).not.toEqual(created.ingredients.map((item) => item.id));
    await expect(repository.getById('another-account', created.id)).resolves.toBeNull();
  });
});
