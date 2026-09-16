import { describe, expect, it } from 'vitest';
import { toHistoricalDietView } from '@/lib/application/diets/diet-history-view';
import type { DietHistoryRow } from '@/lib/application/diets/diet-ports';
import type { DietPlan } from '@/lib/domain/diets/diet-model';
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
});
