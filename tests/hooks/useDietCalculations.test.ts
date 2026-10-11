import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDietCalculations } from '@/hooks/useDietCalculations';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { getMealVariationContextKey, getMealVariationOptions } from '@/lib/mealVariations';
import { carbCyclingDietWithIsolatedDays, legacyMeal, simpleDietWithVariation } from '../fixtures/meal-variations';
import { simpleDraftFixture } from '../fixtures/diets';
import type { DietEditableDocument } from '@/lib/domain/diets/diet-model';
import type { FullDietPlan } from '@/lib/dietStore';
import type { Patient } from '@/lib/patientsStore';

describe('useDietCalculations active meal projection', () => {
  it('uses only the selected meal variation in the visible meals and totals', () => {
    const meal = {
      ...legacyMeal,
      variations: [
        {
          id: 'variation-high-protein',
          items: [{ id: 'item-high-protein', name: 'Omelete', quantityGrams: 200, protein: 30, carbs: 2, fats: 8, kcal: 200 }],
        },
      ],
    };
    const plan: FullDietPlan = {
      id: 'diet-calculation',
      patientId: 'patient-calculation',
      name: 'Cálculo',
      createdAt: '28/08/2026',
      updatedAt: '28/08/2026',
      mode: 'simple',
      simpleTargetKcal: 2000,
      simpleTargetProtein: 140,
      simpleTargetCarbs: 220,
      simpleTargetFats: 60,
      simpleMeals: [meal],
      carbCyclingVariations: [],
    };
    const variationId = getMealVariationOptions(meal)[1].id;
    const contextKey = getMealVariationContextKey('simple', meal.id);

    const { result } = renderHook(() => useDietCalculations(plan, 'var-high', null, {
      [contextKey]: variationId,
    }));

    expect(result.current.mealGroups[0].items[0].name).toBe('Aveia');
    expect(result.current.currentMeals[0].items).toEqual(meal.variations?.[0].items);
    expect(result.current.currentTotals.proteinG).toBe(30);
    expect(result.current.currentTotals.carbsG).toBe(2);
    expect(result.current.currentTotals.fatsG).toBe(8);
  });

  it('defaults every context to the base option after a new calculation instance is created', () => {
    const plan: FullDietPlan = {
      id: 'diet-default',
      patientId: 'patient-default',
      name: 'Padrão',
      createdAt: '28/08/2026',
      updatedAt: '28/08/2026',
      mode: 'simple',
      simpleTargetKcal: 0,
      simpleTargetProtein: 0,
      simpleTargetCarbs: 0,
      simpleTargetFats: 0,
      simpleMeals: [{ ...legacyMeal, variations: [{ id: 'variation-2', items: [] }] }],
      carbCyclingVariations: [],
    };

    const { result } = renderHook(() => useDietCalculations(plan, 'var-high', null));

    expect(result.current.currentMeals[0].items).toEqual(legacyMeal.items);
  });

  it('keeps the active option isolated between carb-cycling days', () => {
    const mealId = 'meal-shared-across-days';
    const plan: FullDietPlan = {
      ...carbCyclingDietWithIsolatedDays,
      carbCyclingVariations: carbCyclingDietWithIsolatedDays.carbCyclingVariations.map((day, dayIndex) => ({
        ...day,
        meals: [{
          ...legacyMeal,
          id: mealId,
          items: [{ ...legacyMeal.items[0], name: `Base ${dayIndex}` }],
          variations: [{
            id: `variation-${day.id}`,
            items: [{ ...legacyMeal.items[1], id: `item-${day.id}`, name: `Opção ${dayIndex}` }],
          }],
        }],
      })),
    };
    const highDay = plan.carbCyclingVariations[0];
    const highKey = getMealVariationContextKey('carb_cycling', mealId, highDay.id);
    const highVariationId = getMealVariationOptions(highDay.meals[0])[1].id;

    const { result, rerender } = renderHook(
      ({ activeDayId, activeIds }: { activeDayId: string; activeIds: Record<string, string> }) =>
        useDietCalculations(plan, activeDayId, null, activeIds),
      {
        initialProps: {
          activeDayId: highDay.id,
          activeIds: { [highKey]: highVariationId },
        },
      },
    );

    expect(result.current.currentMeals[0].items[0].name).toBe('Opção 0');

    rerender({
      activeDayId: plan.carbCyclingVariations[1].id,
      activeIds: { [highKey]: highVariationId },
    });

    expect(result.current.currentMeals[0].items[0].name).toBe('Base 1');
  });

  it('uses the legacy plan reference weight instead of the current patient weight', () => {
    const plan: FullDietPlan = { ...simpleDietWithVariation, weightReferenceKg: createDecimalString('64') };
    const patient = { weightKg: 90 } as Patient;
    const { result } = renderHook(() => useDietCalculations(plan, 'var-high', patient));

    expect(result.current.macroMetrics[0].gPerKgMeta).toBe('2.2');
  });

  it('leaves g/kg unavailable when a legacy plan has no recoverable reference weight', () => {
    const patient = { weightKg: 90 } as Patient;
    const { result } = renderHook(() => useDietCalculations(simpleDietWithVariation, 'var-high', patient));

    expect(result.current.macroMetrics[0].gPerKgRatio).toBeUndefined();
    expect(result.current.macroMetrics[0].gPerKgMeta).toBeUndefined();
  });

  it('does not use current patient weight when a canonical plan has no reference', () => {
    const document = structuredClone(simpleDraftFixture.payload) as DietEditableDocument;
    delete document.weightReferenceKg;
    const patient = { weightKg: 90 } as Patient;
    const { result } = renderHook(() => useDietCalculations(document, 'variation-simple', patient));

    expect(result.current.macroMetrics[0].gPerKgRatio).toBeUndefined();
    expect(result.current.macroMetrics[0].gPerKgMeta).toBeUndefined();
  });
});
