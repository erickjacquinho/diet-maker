import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { useDietBuilderModals } from '@/hooks/useDietBuilderModals';
import { getBaseMealVariationId } from '@/lib/mealVariations';
import { legacyMeal } from '../fixtures/meal-variations';
import type { DietMeal, FullDietPlan } from '@/lib/dietStore';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const plan: FullDietPlan = {
  id: 'diet-modal-variations',
  patientId: 'patient-modal-variations',
  name: 'Dieta modal',
  createdAt: '28/08/2026',
  updatedAt: '28/08/2026',
  mode: 'simple',
  simpleTargetKcal: 2000,
  simpleTargetProtein: 140,
  simpleTargetCarbs: 220,
  simpleTargetFats: 60,
  simpleMeals: [],
  carbCyclingVariations: [],
};

describe('useDietBuilderModals active meal variation mutations', () => {
  it('scales only the selected meal option while preserving the base option', () => {
    const sourceMeal: DietMeal = {
      ...legacyMeal,
      variations: [{
        id: 'variation-2',
        items: [{ ...legacyMeal.items[0], id: 'extra-item', quantityGrams: 170 }],
      }],
    };

    const { result } = renderHook(() => {
      const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(plan);
      const [meals, setMeals] = useState<DietMeal[]>([sourceMeal]);
      const modals = useDietBuilderModals({
        patient: null,
        dietPlan,
        currentMeals: meals,
        currentTotals: { kcal: 0, proteinG: 0, carbsG: 0, fatsG: 0 },
        targetProt: 140,
        targetCarb: 220,
        targetFat: 60,
        activeVariationId: 'var-high',
        setDietPlan,
        updateActiveMeals: (updater) => setMeals(updater),
        getActiveMealVariationId: () => 'variation-2',
      });

      return { meals, modals };
    });

    act(() => result.current.modals.handleApplyScale(100));

    expect(result.current.meals[0].items[0].quantityGrams).toBe(50);
    expect(result.current.meals[0].variations?.[0].items[0].quantityGrams).toBe(340);
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Dieta ajustada em +100%');
    expect(getBaseMealVariationId(legacyMeal.id)).toBe(`${legacyMeal.id}::variation-1`);
  });
});
