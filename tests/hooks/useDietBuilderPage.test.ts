import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDietBuilderPage } from '@/hooks/useDietBuilderPage';
import * as dietStore from '@/lib/dietStore';
import * as patientsStore from '@/lib/patientsStore';
import { getBaseMealVariationId, getMealVariationContextKey, getMealVariationOptions } from '@/lib/mealVariations';
import type { DietMeal, FullDietPlan } from '@/lib/dietStore';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient-variations', dietaId: 'diet-variations' }),
  useRouter: () => ({ push: mockPush }),
}));

const patient = {
  id: 'patient-variations',
  name: 'Paciente Teste',
  initials: 'PT',
  weightKg: 70,
  targetKcal: 2000,
  targetProtein: 140,
  targetCarbs: 220,
  targetFats: 60,
} as patientsStore.Patient;

const createMeal = (id: string, suffix: string): DietMeal => ({
  id,
  name: 'Café da manhã',
  time: '08:00',
  items: [{ id: `${id}-base`, name: `Base ${suffix}`, quantityGrams: 50, protein: 7, carbs: 33, fats: 4, kcal: 196 }],
  variations: [{
    id: `${id}-variation-2`,
    items: [{ id: `${id}-extra`, name: `Opção ${suffix}`, quantityGrams: 170, protein: 9, carbs: 10, fats: 5, kcal: 121 }],
  }],
});

const dietPlan: FullDietPlan = {
  id: 'diet-variations',
  patientId: patient.id,
  name: 'Dieta de teste',
  createdAt: '28/08/2026',
  updatedAt: '28/08/2026',
  mode: 'carb_cycling',
  simpleTargetKcal: 0,
  simpleTargetProtein: 0,
  simpleTargetCarbs: 0,
  simpleTargetFats: 0,
  simpleMeals: [],
  carbCyclingVariations: [
    {
      id: 'day-high',
      name: 'Dia alto',
      type: 'high',
      targetKcal: 2000,
      targetProtein: 140,
      targetCarbs: 240,
      targetFats: 60,
      meals: [createMeal('meal-shared', 'alto')],
    },
    {
      id: 'day-low',
      name: 'Dia baixo',
      type: 'low',
      targetKcal: 1600,
      targetProtein: 140,
      targetCarbs: 120,
      targetFats: 60,
      meals: [createMeal('meal-shared', 'baixo')],
    },
  ],
};

describe('useDietBuilderPage meal variation context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(patientsStore, 'getPatientById').mockReturnValue(patient);
    vi.spyOn(dietStore, 'getDietFromStorage').mockReturnValue(dietPlan);
  });

  it('scopes active meal options by mode, day, and meal and resets to base on a new load', async () => {
    const { result } = renderHook(() => useDietBuilderPage());

    await waitFor(() => expect(result.current.dietPlan?.id).toBe('diet-variations'));

    const mealId = 'meal-shared';
    const highDay = dietPlan.carbCyclingVariations[0];
    const lowDay = dietPlan.carbCyclingVariations[1];
    const highVariationId = getMealVariationOptions(highDay.meals[0])[1].id;
    const lowVariationId = getMealVariationOptions(lowDay.meals[0])[1].id;
    const highKey = getMealVariationContextKey('carb_cycling', mealId, highDay.id);
    const lowKey = getMealVariationContextKey('carb_cycling', mealId, lowDay.id);

    act(() => {
      result.current.setActiveVariationId(highDay.id);
      result.current.handleSelectMealVariation(mealId, highVariationId);
    });

    expect(result.current.activeMealVariationIds[highKey]).toBe(highVariationId);
    expect(result.current.currentMeals[0].items[0].name).toBe('Opção alto');

    act(() => {
      result.current.setActiveVariationId(lowDay.id);
    });

    expect(result.current.currentMeals[0].items[0].name).toBe('Base baixo');
    expect(result.current.getActiveMealVariationId(mealId)).toBe(getBaseMealVariationId(mealId));

    act(() => {
      result.current.handleSelectMealVariation(mealId, lowVariationId);
    });

    expect(result.current.activeMealVariationIds).toMatchObject({
      [highKey]: highVariationId,
      [lowKey]: lowVariationId,
    });
    expect(result.current.currentMeals[0].items[0].name).toBe('Opção baixo');
  });
});
