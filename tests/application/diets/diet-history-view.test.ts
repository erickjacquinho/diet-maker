import { describe, expect, it } from 'vitest';
import { toHistoricalDietView } from '@/lib/application/diets/diet-history-view';
import type { DietHistoryRow } from '@/lib/application/diets/diet-ports';
import { createDecimalString, type DietPlan } from '@/lib/domain/diets/diet-model';
import { activeDietFixture } from '../../fixtures/diets';

function historyRow(plan: DietPlan): DietHistoryRow {
  return {
    id: plan.id,
    version: plan.version,
    name: plan.name,
    mode: plan.mode,
    status: plan.status,
    activatedAt: plan.activatedAt,
    mealCount: plan.variations.reduce((total, variation) => total + variation.meals.length, 0),
    canEdit: plan.status === 'ACTIVE',
    canOpenReadOnly: true,
    canUseAsSource: true,
    canDelete: false,
    plan,
  };
}

describe('diet history view', () => {
  it('uses prescribed snapshot totals instead of configured targets', () => {
    const view = toHistoricalDietView(historyRow(activeDietFixture as DietPlan));

    expect(view).toMatchObject({
      targetKcal: 128,
      proteinG: 2.5,
      carbsG: 28.1,
      fatsG: 0.2,
      dietTargets: {
        targetKcal: 1655,
        proteinG: 120,
        carbsG: 180,
        fatsG: 55,
      },
    });
  });

  it('rounds weighted carb cycling summaries to one decimal', () => {
    const lowMeal = structuredClone(activeDietFixture.variations[0].meals[0]);
    lowMeal.options[0].items[0].snapshot.prescribedNutrients = {
      ...lowMeal.options[0].items[0].snapshot.prescribedNutrients,
      protein: createDecimalString('1'),
      carbs: createDecimalString('20.2'),
      fat: createDecimalString('0.1'),
      energyKcal: createDecimalString('90'),
    };
    const baseVariation = activeDietFixture.variations[0];
    const cyclePlan: DietPlan = {
      ...activeDietFixture,
      id: 'diet-cycle-rounding',
      mode: 'CARB_CYCLING',
      variations: [
        { ...baseVariation, id: 'high', kind: 'HIGH', assignedDays: ['MON', 'WED', 'FRI'] },
        { ...baseVariation, id: 'low', position: 1, kind: 'LOW', assignedDays: ['TUE', 'THU', 'SAT', 'SUN'], meals: [lowMeal] },
      ],
    };

    expect(toHistoricalDietView(historyRow(cyclePlan))).toMatchObject({
      targetKcal: 106,
      proteinG: 1.6,
      carbsG: 23.6,
      fatsG: 0.1,
    });
  });
});
