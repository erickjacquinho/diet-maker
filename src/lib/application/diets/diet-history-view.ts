import Decimal from 'decimal.js';
import type { DietHistoryRow } from './diet-ports';
import type { DietPlan, DietVariation } from '@/lib/domain/diets/diet-model';
import type { HistoricalDiet, HistoricalDietVariation } from '@/lib/patientsStoreTypes';

const DAY_LABELS: Record<string, string> = {
  MON: 'Seg',
  TUE: 'Ter',
  WED: 'Qua',
  THU: 'Qui',
  FRI: 'Sex',
  SAT: 'Sáb',
  SUN: 'Dom',
};

function number(value: string): number {
  return new Decimal(value).toNumber();
}

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
}

function variationType(variation: DietVariation): HistoricalDietVariation['type'] {
  switch (variation.kind) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    case 'LOW': return 'low';
    case 'ZERO': return 'zero';
    default: return 'custom';
  }
}

function mapVariation(variation: DietVariation): HistoricalDietVariation {
  return {
    id: variation.id,
    name: variation.name,
    type: variationType(variation),
    assignedDays: variation.assignedDays.map((day) => DAY_LABELS[day] ?? day),
    targetKcal: number(variation.targets.energyKcal),
    proteinG: number(variation.targets.protein),
    carbsG: number(variation.targets.carbs),
    fatsG: number(variation.targets.fat),
    mealsCount: variation.meals.length,
  };
}

function summaryTargets(plan: DietPlan): { targetKcal: number; proteinG: number; carbsG: number; fatsG: number } {
  const variations = plan.variations;
  if (variations.length === 0) return { targetKcal: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
  if (plan.mode === 'SIMPLE') {
    const [variation] = variations;
    return {
      targetKcal: number(variation.targets.energyKcal),
      proteinG: number(variation.targets.protein),
      carbsG: number(variation.targets.carbs),
      fatsG: number(variation.targets.fat),
    };
  }

  const assigned = variations.reduce((sum, variation) => sum + variation.assignedDays.length, 0);
  const divisor = assigned > 0 ? new Decimal(assigned) : new Decimal(variations.length);
  const weighted = variations.reduce((totals, variation) => {
    const weight = assigned > 0 ? variation.assignedDays.length : 1;
    return {
      targetKcal: totals.targetKcal.plus(new Decimal(variation.targets.energyKcal).times(weight)),
      proteinG: totals.proteinG.plus(new Decimal(variation.targets.protein).times(weight)),
      carbsG: totals.carbsG.plus(new Decimal(variation.targets.carbs).times(weight)),
      fatsG: totals.fatsG.plus(new Decimal(variation.targets.fat).times(weight)),
    };
  }, { targetKcal: new Decimal(0), proteinG: new Decimal(0), carbsG: new Decimal(0), fatsG: new Decimal(0) });

  return {
    targetKcal: weighted.targetKcal.div(divisor).toNumber(),
    proteinG: weighted.proteinG.div(divisor).toNumber(),
    carbsG: weighted.carbsG.div(divisor).toNumber(),
    fatsG: weighted.fatsG.div(divisor).toNumber(),
  };
}

export function toHistoricalDietView(row: DietHistoryRow): HistoricalDiet {
  const targets = summaryTargets(row.plan);
  return {
    id: row.id,
    name: row.name,
    date: dateLabel(row.activatedAt),
    ...targets,
    status: row.status === 'ACTIVE' ? 'Ativa' : 'Histórica',
    mode: row.mode === 'CARB_CYCLING' ? 'carb_cycling' : 'simple',
    carbCyclingVariations: row.mode === 'CARB_CYCLING' ? row.plan.variations.map(mapVariation) : undefined,
  };
}

export function toDietHistoryViews(summary: { current: DietHistoryRow | null; history: DietHistoryRow[] }): HistoricalDiet[] {
  return [summary.current, ...summary.history].filter((row): row is DietHistoryRow => Boolean(row)).map(toHistoricalDietView);
}

