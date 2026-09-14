// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { createLibraryTestDatabase } from '../helpers/library-test-db';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { PGliteRecipeRepository } from '@/lib/infrastructure/local-db/library/recipe-repository';
import { PGliteReadyMealRepository } from '@/lib/infrastructure/local-db/library/ready-meal-repository';
import { dietItemSnapshots, dietMealItems, dietMealOptions, dietMeals, dietPlans, dietVariations, patients } from '@/lib/infrastructure/local-db/schema';

let handle: Awaited<ReturnType<typeof createLibraryTestDatabase>> | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function seedConfirmedPlan(): Promise<void> {
  await handle!.db.insert(patients).values({
    id: 'patient-clinical', accountId: 'local-account', displayCode: 'P-CLINICAL', name: 'Paciente de teste', age: 30,
    gender: 'Feminino', heightCm: 165, weightKg: 65, maritalStatus: null, phone: null, whatsapp: null,
    currentObjective: 'Manutenção', targetProtein: 120, targetCarbs: 180, targetFats: 55, targetKcal: 1655,
    createdAt: '2026-09-13T10:00:00.000Z', updatedAt: '2026-09-13T10:00:00.000Z', version: 1, archivedAt: null,
  });
  await handle!.db.insert(dietPlans).values({
    id: 'diet-clinical', accountId: 'local-account', patientId: 'patient-clinical', name: 'Plano confirmado', mode: 'SIMPLE',
    status: 'SNAPSHOT', weightReferenceKg: '65', version: 1, createdAt: '2026-09-13T10:00:00.000Z',
    updatedAt: '2026-09-13T10:00:00.000Z', activatedAt: '2026-09-13T10:00:00.000Z', supersededAt: null,
  });
  await handle!.db.insert(dietVariations).values({
    id: 'variation-clinical', dietPlanId: 'diet-clinical', accountId: 'local-account', patientId: 'patient-clinical',
    position: 0, kind: 'SIMPLE', name: 'Diário', inputMode: 'GRAMS', targetProtein: '120', targetCarbs: '180',
    targetFat: '55', targetKcal: '1655', gPerKgProtein: null, gPerKgCarbs: null, gPerKgFat: null,
  });
  await handle!.db.insert(dietMeals).values({
    id: 'meal-clinical', dietPlanId: 'diet-clinical', variationId: 'variation-clinical', accountId: 'local-account',
    patientId: 'patient-clinical', position: 0, name: 'Café da manhã', time: '08:00',
  });
  await handle!.db.insert(dietMealOptions).values([
    { id: 'option-food', dietMealId: 'meal-clinical', position: 0, label: 'Alimento', countsTowardTotals: true },
    { id: 'option-recipe', dietMealId: 'meal-clinical', position: 1, label: 'Receita', countsTowardTotals: true },
    { id: 'option-ready-meal', dietMealId: 'meal-clinical', position: 2, label: 'Refeição pronta', countsTowardTotals: true },
  ]);
  await handle!.db.insert(dietMealItems).values([
    { id: 'item-food', dietMealOptionId: 'option-food', position: 0, role: 'PRIMARY', parentItemId: null, name: 'Alimento customizado' },
    { id: 'item-recipe', dietMealOptionId: 'option-recipe', position: 0, role: 'PRIMARY', parentItemId: null, name: 'Receita' },
    { id: 'item-ready-meal', dietMealOptionId: 'option-ready-meal', position: 0, role: 'PRIMARY', parentItemId: null, name: 'Refeição pronta' },
  ]);
}

function clinicalSnapshot(dietMealItemId: string, sourceType: 'SYSTEM_TACO' | 'ACCOUNT_CUSTOM' | 'RECIPE' | 'READY_MEAL', sourceId: string, compositionSnapshot: Record<string, unknown> = { schemaVersion: 1 }) {
  return {
    dietMealItemId, sourceType, sourceId, sourceVersion: '1', displayName: 'Snapshot clínico', description: '',
    measurementBasis: 'PER_100G', foodState: 'AS_SOLD', referenceQuantity: '100', referenceUnit: 'g',
    referenceProtein: '1', referenceCarbs: '1', referenceFat: '1', referenceFiber: '0', referenceEnergyKcal: '13',
    prescribedQuantity: '100', prescribedUnit: 'g', prescribedProtein: '1', prescribedCarbs: '1', prescribedFat: '1',
    prescribedFiber: '0', prescribedEnergyKcal: '13', energySource: 'REFERENCE', calculationVersion: 'test-v1',
    conversionSnapshot: { schemaVersion: 1, conversions: [] }, compositionSnapshot,
  };
}

describe('library clinical dependency guards', () => {
  it('blocks physical deletion of every library source used by a confirmed diet', async () => {
    handle = await createLibraryTestDatabase('library-clinical-dependencies');
    await new LocalAccountContextRepository(handle).getActiveOrCreate();

    const foodRepository = new PGliteFoodCatalogRepository(handle, { idFactory: () => 'food-clinical' });
    const food = await foodRepository.create('local-account', {
      name: 'Alimento clínico', measurementBasis: 'PER_100G', foodState: 'AS_SOLD',
      referenceNutrients: { protein: '1', carbs: '1', fat: '1', fiber: '0' },
    });
    let recipeId = 0;
    const recipeRepository = new PGliteRecipeRepository(handle, { foodRepository, idFactory: () => `recipe-clinical-${recipeId++}` });
    const recipe = await recipeRepository.create('local-account', {
      name: 'Receita clínica', category: 'Teste', yieldPortions: '1',
      ingredients: [{ sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', quantity: '100', unit: 'g' }],
    });
    let readyMealId = 0;
    const readyMealRepository = new PGliteReadyMealRepository(handle, {
      foodRepository, recipeRepository, idFactory: () => `ready-meal-clinical-${readyMealId++}`,
    });
    const readyMeal = await readyMealRepository.create('local-account', {
      name: 'Refeição clínica', items: [{ sourceType: 'FOOD', sourceId: 'taco-1', quantity: '100', unit: 'g' }],
    });

    await seedConfirmedPlan();
    await handle!.db.insert(dietItemSnapshots).values([
      clinicalSnapshot('item-food', 'ACCOUNT_CUSTOM', food.id),
      clinicalSnapshot('item-recipe', 'RECIPE', recipe.id),
      clinicalSnapshot('item-ready-meal', 'SYSTEM_TACO', 'taco-1', {
        schemaVersion: 1,
        readyMealSource: { sourceType: 'READY_MEAL', sourceId: readyMeal.id, sourceVersion: readyMeal.version },
      }),
    ]);

    const archivedFood = await foodRepository.archive('local-account', food.id, food.version);
    await expect(foodRepository.deleteIfUnreferenced('local-account', food.id, archivedFood.version)).rejects.toMatchObject({ code: 'LIBRARY_DEPENDENCY_EXISTS' });
    await expect(foodRepository.getById('local-account', food.id)).resolves.toMatchObject({ status: 'ARCHIVED' });

    const archivedRecipe = await recipeRepository.archive('local-account', recipe.id, recipe.version);
    await expect(recipeRepository.deleteIfUnreferenced('local-account', recipe.id, archivedRecipe.version)).rejects.toMatchObject({ code: 'LIBRARY_DEPENDENCY_EXISTS' });
    await expect(recipeRepository.getById('local-account', recipe.id)).resolves.toMatchObject({ status: 'ARCHIVED' });

    const archivedReadyMeal = await readyMealRepository.archive('local-account', readyMeal.id, readyMeal.version);
    await expect(readyMealRepository.deleteIfUnreferenced('local-account', readyMeal.id, archivedReadyMeal.version)).rejects.toMatchObject({ code: 'LIBRARY_DEPENDENCY_EXISTS' });
    await expect(readyMealRepository.getById('local-account', readyMeal.id)).resolves.toMatchObject({ status: 'ARCHIVED' });
  });
});
