import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { DietMeal } from '@/lib/dietStore';
import { useDietMealActions } from '@/hooks/useDietMealActions';
import { getBaseMealVariationId } from '@/lib/mealVariations';

vi.mock('sonner', () => ({
      toast: {
        success: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      },
}));

const mealsFixture: DietMeal[] = [
  {
    id: 'meal-1',
    name: 'Almoço',
    time: '12:00',
    items: [
      { id: 'item-1', name: 'Arroz', quantityGrams: 100, protein: 2, carbs: 28, fats: 0, kcal: 130 },
      { id: 'item-2', name: 'Feijão', quantityGrams: 120, protein: 5, carbs: 14, fats: 1, kcal: 90 },
      { id: 'item-3', name: 'Frango', quantityGrams: 150, protein: 45, carbs: 0, fats: 4, kcal: 240 },
    ],
  },
];

describe('useDietMealActions item deletion undo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restores the deleted item at its original position from the toast action', () => {
    const { result } = renderHook(() => {
      const [meals, setMeals] = useState(mealsFixture);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
      });

      return { meals, actions };
    });

    act(() => {
      result.current.actions.handleRemoveItem('meal-1', 'item-2');
    });

    expect(result.current.meals[0].items.map((item) => item.id)).toEqual(['item-1', 'item-3']);

    const successToast = vi.mocked(toast.success);
    const toastOptions = successToast.mock.calls[0]?.[1] as {
      duration: number;
      action: { label: string; onClick: () => void };
    };

    expect(toastOptions.duration).toBe(6000);
    expect(toastOptions.action.label).toBe('Desfazer');

    act(() => {
      toastOptions.action.onClick();
    });

    expect(result.current.meals[0].items.map((item) => item.id)).toEqual(['item-1', 'item-2', 'item-3']);
    expect(result.current.meals[0].items[1].quantityGrams).toBe(120);
  });

  it('restores the deleted meal at its original position from the toast action', () => {
    const beforeMeal: DietMeal = {
      id: 'meal-before',
      name: 'Café da manhã',
      time: '08:00',
      items: [{ id: 'before-item', name: 'Banana', quantityGrams: 100, protein: 1, carbs: 23, fats: 0, kcal: 90 }],
    };
    const afterMeal: DietMeal = {
      id: 'meal-after',
      name: 'Jantar',
      time: '20:00',
      items: [{ id: 'after-item', name: 'Sopa', quantityGrams: 300, protein: 8, carbs: 18, fats: 4, kcal: 140 }],
    };
    const mealToDelete: DietMeal = {
      ...mealsFixture[0],
      variations: [{
        id: 'variation-2',
        items: [{ ...mealsFixture[0].items[0], id: 'variation-item-1' }],
      }],
    };

    const { result } = renderHook(() => {
      const [meals, setMeals] = useState([beforeMeal, mealToDelete, afterMeal]);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
      });

      return { meals, actions };
    });

    act(() => {
      result.current.actions.handleRemoveMeal('meal-1');
    });

    expect(result.current.meals.map((meal) => meal.id)).toEqual(['meal-before', 'meal-after']);

    const successToast = vi.mocked(toast.success);
    const toastOptions = successToast.mock.calls[0]?.[1] as {
      duration: number;
      action: { label: string; onClick: () => void };
    };

    expect(successToast.mock.calls[0]?.[0]).toBe('Refeição "Almoço" removida.');
    expect(toastOptions.duration).toBe(6000);
    expect(toastOptions.action.label).toBe('Desfazer');

    act(() => {
      toastOptions.action.onClick();
    });

    expect(result.current.meals.map((meal) => meal.id)).toEqual(['meal-before', 'meal-1', 'meal-after']);
    expect(result.current.meals[1].items[0].id).toBe('item-1');
    expect(result.current.meals[1].variations?.[0].items[0].id).toBe('variation-item-1');
  });

  it('reorders items within a meal correctly', () => {
    const { result } = renderHook(() => {
      const [meals, setMeals] = useState(mealsFixture);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
      });

      return { meals, actions };
    });

    act(() => {
      // Move 'Frango' (index 2) to first position (index 0)
      result.current.actions.handleReorderItems('meal-1', 2, 0);
    });

    expect(result.current.meals[0].items.map((item) => item.id)).toEqual(['item-3', 'item-1', 'item-2']);
  });

  it('adds a variation from the active option and selects the appended copy', () => {
    const sourceMeal: DietMeal = {
      ...mealsFixture[0],
      variations: [{ id: 'variation-2', items: [{ ...mealsFixture[0].items[0], id: 'variation-item-2' }] }],
    };

    const { result } = renderHook(() => {
      const [meals, setMeals] = useState([sourceMeal]);
      const [activeVariationId, setActiveVariationId] = useState('variation-2');
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => activeVariationId,
        onSelectMealVariation: (_mealId, variationId) => setActiveVariationId(variationId),
      });

      return { meals, activeVariationId, actions };
    });

    act(() => {
      result.current.actions.handleAddMealVariation('meal-1');
    });

    expect(result.current.meals[0].variations).toHaveLength(2);
    expect(result.current.activeVariationId).toBe(result.current.meals[0].variations?.[1].id);
    expect(result.current.meals[0].variations?.[1].items[0].name).toBe('Arroz');
    expect(result.current.meals[0].variations?.[1].items[0].id).not.toBe('variation-item-2');
    expect(result.current.meals[0].items[0].id).toBe('item-1');
  });

  it('changes quantity only in the selected variation', () => {
    const sourceMeal: DietMeal = {
      ...mealsFixture[0],
      variations: [{ id: 'variation-2', items: [{ ...mealsFixture[0].items[0], id: 'variation-item-2' }] }],
    };

    const { result } = renderHook(() => {
      const [meals, setMeals] = useState([sourceMeal]);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => 'variation-2',
      });

      return { meals, actions };
    });

    act(() => {
      result.current.actions.handleUpdateItemGram('meal-1', 'variation-item-2', 200);
    });

    expect(result.current.meals[0].items[0].quantityGrams).toBe(100);
    expect(result.current.meals[0].variations?.[0].items[0].quantityGrams).toBe(200);
  });

  it('returns the base variation id for a legacy meal when no selection is supplied', () => {
    expect(getBaseMealVariationId('meal-1')).toBe('meal-1::variation-1');
  });

  it('replaces the active variation after a quick confirmation when pasting', () => {
    const sourceMeal = mealsFixture[0];
    const targetMeal: DietMeal = {
      id: 'meal-2',
      name: 'Jantar',
      time: '20:00',
      items: [{ id: 'target-item', name: 'Sopa', quantityGrams: 300, protein: 8, carbs: 18, fats: 4, kcal: 140 }],
    };
    const { result } = renderHook(() => {
      const [meals, setMeals] = useState([sourceMeal, targetMeal]);
      const actions = useDietMealActions({
        foodSearchMealIndex: null,
        currentMeals: meals,
        updateActiveMeals: (updater) => setMeals(updater),
      });

      return { meals, actions };
    });

    act(() => {
      result.current.actions.handleCopyMeal('meal-1');
    });
    act(() => {
      result.current.actions.handlePasteMealAndReplace('meal-2');
    });

    expect(result.current.meals[1].items.map((item) => item.name)).toEqual(['Arroz', 'Feijão', 'Frango']);
    expect(result.current.meals[1].items.map((item) => item.id)).not.toEqual(sourceMeal.items.map((item) => item.id));
  });
});
