import { describe, expect, it, vi } from 'vitest';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { insertReadyMealIntoDietDraft, insertRecipeIntoDietDraft } from '@/lib/application/diets/library-insertion';
import type { DietDraft } from '@/lib/domain/diets/diet-model';
import type { DietDraftStore } from '@/lib/application/diets/diet-ports';

const nutrition = { protein: createDecimalString('10'), carbs: createDecimalString('20'), fat: createDecimalString('5'), fiber: createDecimalString('2'), energyKcal: createDecimalString('165') };
const snapshot = { sourceType: 'SYSTEM_TACO' as const, sourceId: 'taco-1', sourceVersion: 'TACO-4.0', displayName: 'Arroz', description: 'Arroz', measurementBasis: 'PER_100G' as const, foodState: 'COOKED' as const, referenceQuantity: createDecimalString('100'), referenceUnit: 'g' as const, referenceNutrients: nutrition, prescribedQuantity: createDecimalString('100'), prescribedUnit: 'g' as const, prescribedNutrients: nutrition, energySource: 'REFERENCE' as const, calculationVersion: 'taco-decimal-v1', conversionSnapshot: { schemaVersion: 1 }, compositionSnapshot: { source: 'TACO' } };

function draftFixture(): DietDraft {
  return { draftId: 'draft-a', contextKey: 'account-a|patient-a|nova', accountId: 'account-a', patientId: 'patient-a', routeDietId: 'nova', payloadSchemaVersion: 1, draftRevision: 3, state: 'EDITABLE', payload: { name: 'Dieta', mode: 'SIMPLE', variations: [{ id: 'variation-a', position: 0, kind: 'SIMPLE', name: 'Diário', inputMode: 'GRAMS', assignedDays: [], targets: { protein: createDecimalString('0'), carbs: createDecimalString('0'), fat: createDecimalString('0'), energyKcal: createDecimalString('0') }, meals: [{ id: 'meal-a', position: 0, name: 'Café', options: [] }] }] }, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' };
}

function storeFor(initial: DietDraft): DietDraftStore {
  let current = structuredClone(initial);
  return {
    get: vi.fn(async () => structuredClone(current)),
    putIfNewer: vi.fn(async (next: DietDraft) => { current = structuredClone(next); return { status: 'SAVED' as const, revision: current.draftRevision, updatedAt: current.updatedAt }; }),
  } as unknown as DietDraftStore;
}

describe('library insertion into diet drafts', () => {
  it('inserts a recipe with fresh option/item IDs and only increments the draft revision', async () => {
    const draft = draftFixture();
    const store = storeFor(draft);
    const result = await insertRecipeIntoDietDraft({
      accountContext: { requireActive: vi.fn().mockResolvedValue({ accountId: 'account-a', account: {} }), getActive: vi.fn() },
      draftStore: store,
      sourceReader: { getRecipe: vi.fn().mockResolvedValue({ id: 'recipe-a', accountId: 'account-a', name: 'Receita', category: 'Café', instructions: '', yieldPortions: '2', nutrition: { total: nutrition, perPortion: nutrition }, status: 'ACTIVE', version: 4, createdAt: '', updatedAt: '', archivedAt: null, ingredients: [] }), getReadyMeal: vi.fn() },
      idFactory: (() => { let index = 0; return () => `new-${index++}`; })(),
      now: () => '2026-09-01T01:00:00.000Z',
    }, { draftId: 'draft-a', expectedRevision: 3, recipeId: 'recipe-a', variationId: 'variation-a', mealId: 'meal-a' });
    expect(result.draftRevision).toBe(4);
    expect(result.payload.variations[0].meals[0].options[0].id).toBe('new-0');
    expect(result.payload.variations[0].meals[0].options[0].items[0].id).toBe('new-1');
    expect(result.payload.variations[0].meals[0].options[0].items[0].snapshot.sourceType).toBe('RECIPE');
  });

  it('copies every ready-meal item, rejects archived sources and leaves the source untouched', async () => {
    const draft = draftFixture();
    const store = storeFor(draft);
    await expect(insertReadyMealIntoDietDraft({
      accountContext: { requireActive: vi.fn().mockResolvedValue({ accountId: 'account-a', account: {} }), getActive: vi.fn() },
      draftStore: store,
      sourceReader: { getRecipe: vi.fn(), getReadyMeal: vi.fn().mockResolvedValue({ id: 'meal-template', accountId: 'account-a', name: 'Template', description: '', status: 'ARCHIVED', version: 1, createdAt: '', updatedAt: '', archivedAt: '2026-09-01', items: [] }) },
    }, { draftId: 'draft-a', expectedRevision: 3, readyMealId: 'meal-template', variationId: 'variation-a', mealId: 'meal-a', optionId: 'option-a' })).rejects.toMatchObject({ code: 'CONTEXT_MISSING' });
    expect(draft.payload.variations[0].meals[0].options).toHaveLength(0);
  });

  it('loads ready-meal name/time and appends items to the existing option', async () => {
    const draft = draftFixture();
    draft.payload.variations[0].meals[0].options = [{ id: 'option-a', position: 0, label: 'Principal', countsTowardTotals: true, items: [{ id: 'existing', position: 0, role: 'PRIMARY', name: 'Arroz existente', snapshot }] }];
    const result = await insertReadyMealIntoDietDraft({
      accountContext: { requireActive: vi.fn().mockResolvedValue({ accountId: 'account-a', account: {} }), getActive: vi.fn() },
      draftStore: storeFor(draft),
      sourceReader: {
        getRecipe: vi.fn(),
        getReadyMeal: vi.fn().mockResolvedValue({
          id: 'meal-template', accountId: 'account-a', name: 'Almoço pronto', description: '', suggestedTime: '12:30', status: 'ACTIVE', version: 3,
          createdAt: '', updatedAt: '', archivedAt: null,
          items: [{ id: 'meal-item', readyMealId: 'meal-template', accountId: 'account-a', position: 0, sourceType: 'FOOD', sourceId: 'taco-1', sourceVersion: 'TACO-4.0', quantity: '100', unit: 'g', itemSnapshot: snapshot }],
        }),
      },
      idFactory: (() => { let index = 0; return () => `new-${index++}`; })(),
    }, { draftId: 'draft-a', expectedRevision: 3, readyMealId: 'meal-template', variationId: 'variation-a', mealId: 'meal-a', optionId: 'option-a' });

    const options = result.payload.variations[0].meals[0].options;
    expect(options).toHaveLength(1);
    expect(result.payload.variations[0].meals[0]).toMatchObject({ name: 'Almoço pronto', time: '12:30' });
    expect(options[0].items.map((item) => item.name)).toEqual(['Arroz existente', 'Arroz']);
    expect(options[0].items[1].snapshot).toMatchObject({
      sourceType: 'SYSTEM_TACO',
      compositionSnapshot: { readyMealSource: { sourceType: 'READY_MEAL', sourceId: 'meal-template', sourceVersion: 3 } },
    });
  });
});
