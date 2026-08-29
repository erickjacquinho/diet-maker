import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { useDietMealActions } from '@/hooks/useDietMealActions';
import {
  appendMealVariation,
  getActiveMealVariationId,
  getBaseMealVariationId,
  getMealVariationOptions,
} from '@/lib/mealVariations';
import { fiveOptionMeal, legacyMeal } from '../fixtures/meal-variations';
import type { DietMeal } from '@/lib/dietStore';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDietMealActions variation lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates the first option from a legacy meal and selects the new copy', () => {
    const { result } = renderHook(() => {
      const [meals, setMeals] = useState<DietMeal[]>([legacyMeal]);
      const [activeId, setActiveId] = useState(getBaseMealVariationId(legacyMeal.id));
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => activeId,
        onSelectMealVariation: (_mealId, variationId) => setActiveId(variationId),
      });

      return { meals, activeId, actions };
    });

    act(() => result.current.actions.handleAddMealVariation(legacyMeal.id));

    const created = result.current.meals[0];
    expect(created.variations).toHaveLength(1);
    expect(created.variations?.[0].items.map(({ id: _id, ...item }) => item)).toEqual(
      legacyMeal.items.map(({ id: _id, ...item }) => item),
    );
    expect(created.variations?.[0].items[0].id).not.toBe(legacyMeal.items[0].id);
    expect(result.current.activeId).toBe(created.variations?.[0].id);
  });

  it('blocks the sixth option and keeps the complete meal untouched', () => {
    const { result } = renderHook(() => {
      const [meals, setMeals] = useState<DietMeal[]>([fiveOptionMeal]);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => 'variation-5',
      });

      return { meals, actions };
    });

    act(() => result.current.actions.handleAddMealVariation(fiveOptionMeal.id));

    expect(result.current.meals[0]).toEqual(fiveOptionMeal);
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(expect.stringContaining('limite de 5'));
  });

  it('removes an option, compacts labels, and selects the last remaining option', () => {
    const second = appendMealVariation(legacyMeal).meal;
    const third = appendMealVariation(second, second.variations?.[0].id).meal;
    const middleId = getMealVariationOptions(third)[1].id;

    const { result } = renderHook(() => {
      const [meals, setMeals] = useState<DietMeal[]>([third]);
      const [activeId, setActiveId] = useState(middleId);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => activeId,
        onSelectMealVariation: (_mealId, variationId) => setActiveId(variationId),
      });

      return { meals, activeId, actions };
    });

    act(() => result.current.actions.handleRemoveMealVariation(legacyMeal.id));

    expect(getMealVariationOptions(result.current.meals[0])).toHaveLength(2);
    expect(getMealVariationOptions(result.current.meals[0]).map((option) => option.label)).toEqual([
      'Variação 1',
      'Variação 2',
    ]);
    expect(result.current.activeId).toBe(getMealVariationOptions(result.current.meals[0])[1].id);
  });

  it('duplicates the complete group and keeps later edits independent', () => {
    const source = appendMealVariation(legacyMeal).meal;
    const { result } = renderHook(() => {
      const [meals, setMeals] = useState<DietMeal[]>([source]);
      const [activeId, setActiveId] = useState(getBaseMealVariationId(source.id));
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => activeId,
        onSelectMealVariation: (_mealId, variationId) => setActiveId(variationId),
      });

      return { meals, activeId, actions };
    });

    act(() => result.current.actions.handleDuplicateMeal(source.id));

    const clone = result.current.meals[1];
    expect(clone.variations).toHaveLength(1);
    expect(result.current.activeId).toBe(getBaseMealVariationId(clone.id));
    expect(clone.items[0].id).not.toBe(source.items[0].id);
    expect(clone.variations?.[0].items[0].id).not.toBe(source.variations?.[0].items[0].id);

    act(() => result.current.actions.handleUpdateItemGram(clone.id, clone.items[0].id!, 100));

    expect(result.current.meals[0].items[0].quantityGrams).toBe(50);
    expect(result.current.meals[1].items[0].quantityGrams).toBe(100);
  });

  it('reorders only the active option', () => {
    const source: DietMeal = {
      ...legacyMeal,
      variations: [{
        id: 'variation-2',
        items: [
          { ...legacyMeal.items[0], id: 'extra-1', name: 'Primeiro' },
          { ...legacyMeal.items[1], id: 'extra-2', name: 'Segundo' },
        ],
      }],
    };

    const { result } = renderHook(() => {
      const [meals, setMeals] = useState<DietMeal[]>([source]);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => 'variation-2',
      });

      return { meals, actions };
    });

    act(() => result.current.actions.handleReorderItems(source.id, 1, 0));

    expect(result.current.meals[0].items[0].id).toBe(legacyMeal.items[0].id);
    expect(result.current.meals[0].variations?.[0].items.map((item) => item.id)).toEqual(['extra-2', 'extra-1']);
  });
});
