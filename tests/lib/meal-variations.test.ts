import { describe, expect, it } from 'vitest';
import {
  MAX_MEAL_VARIATIONS,
  appendMealVariation,
  cloneMealGroupWithFreshIds,
  getActiveMealVariation,
  getBaseMealVariationId,
  getMealVariationOptions,
  normalizeMealVariations,
  removeMealVariation,
} from '@/lib/mealVariations';
import { fiveOptionMeal, legacyMeal } from '../fixtures/meal-variations';

describe('meal variation domain helpers', () => {
  it('normalizes a legacy meal as one option without changing its compatible shape', () => {
    const normalized = normalizeMealVariations(legacyMeal);

    expect(normalized.items).toEqual(legacyMeal.items);
    expect(normalized.variations).toBeUndefined();
    expect(getMealVariationOptions(normalized)).toEqual([
      {
        id: getBaseMealVariationId(legacyMeal.id),
        label: 'Variação 1',
        items: legacyMeal.items,
      },
    ]);
  });

  it('appends a deep copy of the active option and opens the new last option', () => {
    const first = appendMealVariation(legacyMeal);
    const second = appendMealVariation(first.meal, first.variationId);

    expect(first.changed).toBe(true);
    expect(first.meal.variations).toHaveLength(1);
    expect(first.variationId).toBe(first.meal.variations?.[0].id);
    expect(first.meal.variations?.[0].items.map(({ id: _id, ...item }) => item)).toEqual(
      legacyMeal.items.map(({ id: _id, ...item }) => item),
    );
    expect(first.meal.variations?.[0].items).not.toBe(legacyMeal.items);

    expect(second.meal.variations).toHaveLength(2);
    expect(second.meal.variations?.[1].items.map(({ id: _id, ...item }) => item)).toEqual(
      first.meal.variations?.[0].items.map(({ id: _id, ...item }) => item),
    );
    expect(second.meal.variations?.[1].items).not.toBe(first.meal.variations?.[0].items);
    expect(second.variationId).toBe(second.meal.variations?.[1].id);
  });

  it('enforces the five-option limit without mutating the meal', () => {
    const result = appendMealVariation(fiveOptionMeal, 'variation-5');

    expect(MAX_MEAL_VARIATIONS).toBe(5);
    expect(result.changed).toBe(false);
    expect(result.meal).toEqual(fiveOptionMeal);
    expect(result.meal.variations).toHaveLength(4);
  });

  it('removes the active option, compacts the base representation, and selects the last remaining option', () => {
    const first = appendMealVariation(legacyMeal).meal;
    const second = appendMealVariation(first, first.variations?.[0].id).meal;
    const activeId = second.variations?.[0].id;
    const result = removeMealVariation(second, activeId);

    expect(result.removed).toBe(true);
    expect(getMealVariationOptions(result.meal)).toHaveLength(2);
    expect(getMealVariationOptions(result.meal).map((option) => option.label)).toEqual([
      'Variação 1',
      'Variação 2',
    ]);
    expect(result.activeVariationId).toBe(getMealVariationOptions(result.meal)[1].id);
  });

  it('collapses a two-option group back to one option after deletion', () => {
    const created = appendMealVariation(legacyMeal);
    const result = removeMealVariation(created.meal, created.variationId);

    expect(result.meal.items).toEqual(legacyMeal.items);
    expect(result.meal.variations).toBeUndefined();
    expect(result.activeVariationId).toBe(getBaseMealVariationId(legacyMeal.id));
  });

  it('resolves a requested option and falls back to the first option when its id is stale', () => {
    const created = appendMealVariation(legacyMeal);
    const options = getMealVariationOptions(created.meal);

    expect(getActiveMealVariation(created.meal, created.variationId)).toEqual(options[1]);
    expect(getActiveMealVariation(created.meal, 'removed-option')).toEqual(options[0]);
  });

  it('deeply clones a complete meal group with fresh meal, variation, and item ids', () => {
    const source = appendMealVariation(legacyMeal).meal;
    const cloned = cloneMealGroupWithFreshIds(source);

    expect(cloned.id).not.toBe(source.id);
    expect(cloned.items[0].id).not.toBe(source.items[0].id);
    expect(cloned.variations?.[0].id).not.toBe(source.variations?.[0].id);
    expect(cloned.variations?.[0].items[0].id).not.toBe(source.variations?.[0].items[0].id);

    cloned.items[0].quantityGrams = 999;
    expect(source.items[0].quantityGrams).toBe(50);
  });
});
