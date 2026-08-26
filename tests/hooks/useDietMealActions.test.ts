import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { DietMeal } from '@/lib/dietStore';
import { useDietMealActions } from '@/hooks/useDietMealActions';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
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
});
