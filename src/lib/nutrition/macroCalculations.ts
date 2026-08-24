import { MacroMetricCardProps } from '@/components/molecules/MacroMetricCard';
import { BadgeProps } from '@/components/atoms';

export const ATWATER_FACTORS = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const;

export const DEFAULT_MACRO_TOLERANCE_PCT = 0.05; // 5% de tolerância para considerar "Na meta"
export const FAT_ABSOLUTE_TOLERANCE_GRAMS = 2; // tolerância de ±2g para gorduras

export type MacroProgressStatus = 'no_target' | 'empty' | 'deficit' | 'on_target' | 'surplus';

export interface MacroProgressResult {
  percentage: number;
  diff: number;
  status: MacroProgressStatus;
  badgeText: string;
  badgeTone: NonNullable<BadgeProps['variant']>;
  hasTarget: boolean;
}

/**
 * Calcula calorias totais com base nos fatores de Atwater (4-4-9).
 */
export function calculateKcalFromMacros(proteinG: number, carbsG: number, fatsG: number): number {
  const p = Math.max(0, Number(proteinG) || 0);
  const c = Math.max(0, Number(carbsG) || 0);
  const f = Math.max(0, Number(fatsG) || 0);
  return Math.round(
    p * ATWATER_FACTORS.protein +
    c * ATWATER_FACTORS.carbs +
    f * ATWATER_FACTORS.fats
  );
}

/**
 * Calcula a proporção gramas por quilo de peso corporal (g/kg).
 */
export function calculateGPerKg(grams: number, weightKg: number | undefined | null): { value: number; formatted: string } | null {
  const safeGrams = Math.max(0, Number(grams) || 0);
  const safeWeight = Number(weightKg);

  if (!safeWeight || safeWeight <= 0 || isNaN(safeWeight)) {
    return null;
  }

  const ratio = safeGrams / safeWeight;
  return {
    value: ratio,
    formatted: ratio.toFixed(2),
  };
}

/**
 * Calcula o progresso, diferença e status de uma meta nutricional.
 */
export function calculateMacroProgress(
  current: number,
  target: number,
  unit: 'g' | 'kcal' = 'g',
  isFat = false
): MacroProgressResult {
  const safeCurrent = Math.max(0, Number(current) || 0);
  const safeTarget = Math.max(0, Number(target) || 0);

  if (safeTarget <= 0) {
    return {
      percentage: 0,
      diff: 0,
      status: 'no_target',
      badgeText: 'Sem meta',
      badgeTone: 'default',
      hasTarget: false,
    };
  }

  const diff = safeCurrent - safeTarget;
  const percentage = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));

  // Verificação de atingimento da meta com tolerância
  const isMet = isFat
    ? Math.abs(diff) <= FAT_ABSOLUTE_TOLERANCE_GRAMS
    : Math.abs(diff) <= safeTarget * DEFAULT_MACRO_TOLERANCE_PCT;

  if (isMet && safeCurrent > 0) {
    return {
      percentage,
      diff,
      status: 'on_target',
      badgeText: 'Na meta ✓',
      badgeTone: 'emerald',
      hasTarget: true,
    };
  }

  if (safeCurrent === 0) {
    const formattedTarget = unit === 'kcal' ? `${Math.round(safeTarget)} kcal` : `${Math.round(safeTarget)}g`;
    return {
      percentage: 0,
      diff: -safeTarget,
      status: 'empty',
      badgeText: `Faltam ${formattedTarget}`,
      badgeTone: 'warning',
      hasTarget: true,
    };
  }

  if (diff < 0) {
    const remaining = Math.abs(diff);
    const formattedRemaining = unit === 'kcal' ? `${Math.round(remaining)} kcal` : `${Math.round(remaining)}g`;
    return {
      percentage,
      diff,
      status: 'deficit',
      badgeText: `Faltam ${formattedRemaining}`,
      badgeTone: 'warning',
      hasTarget: true,
    };
  }

  const surplus = diff;
  const formattedSurplus = unit === 'kcal' ? `+${Math.round(surplus)} kcal` : `+${Math.round(surplus)}g`;
  return {
    percentage: 100,
    diff,
    status: 'surplus',
    badgeText: formattedSurplus,
    badgeTone: 'rose',
    hasTarget: true,
  };
}

export interface BuildMetricCardParams {
  label: string;
  current: number;
  target: number;
  unit: 'g' | 'kcal';
  macroColor: MacroMetricCardProps['macroColor'];
  weightKg?: number | null;
  targetGPerKgRatio?: number;
  isFat?: boolean;
}

/**
 * Constrói as propriedades formatadas para o MacroMetricCard.
 */
export function buildMacroMetricCardProps({
  label,
  current,
  target,
  unit,
  macroColor,
  weightKg,
  targetGPerKgRatio,
  isFat = false,
}: BuildMetricCardParams): MacroMetricCardProps {
  const safeCurrent = Math.max(0, Number(current) || 0);
  const safeTarget = Math.max(0, Number(target) || 0);
  const progress = calculateMacroProgress(safeCurrent, safeTarget, unit, isFat);

  const currentValueStr = unit === 'kcal'
    ? `${Math.round(safeCurrent)}`
    : `${Math.round(safeCurrent * 10) / 10}g`;

  const targetValueStr = safeTarget > 0
    ? (unit === 'kcal' ? `${Math.round(safeTarget)} kcal` : `${Math.round(safeTarget * 10) / 10}g`)
    : '';

  let gPerKgRatioStr: string | undefined;
  let gPerKgMetaStr: string | undefined;

  if (unit === 'g' && weightKg && weightKg > 0) {
    const currentGPerKg = calculateGPerKg(safeCurrent, weightKg);
    const targetGPerKg = targetGPerKgRatio ?? (safeTarget > 0 ? Number((safeTarget / weightKg).toFixed(1)) : undefined);

    if (currentGPerKg) {
      gPerKgRatioStr = `${currentGPerKg.formatted} g/kg`;
    }
    if (targetGPerKg !== undefined) {
      gPerKgMetaStr = typeof targetGPerKg === 'number' ? targetGPerKg.toFixed(1) : String(targetGPerKg);
    }
  }

  return {
    label,
    currentValue: currentValueStr,
    targetValue: targetValueStr,
    statusBadgeText: progress.badgeText,
    statusBadgeVariant: progress.badgeTone,
    percentage: progress.percentage,
    gPerKgRatio: gPerKgRatioStr,
    gPerKgMeta: gPerKgMetaStr,
    macroColor,
    hasTarget: progress.hasTarget,
  };
}

/**
 * Calcula a distribuição percentual calórica (% VET) de cada macronutriente.
 */
export function calculateMacroDistributionPct(proteinG: number, carbsG: number, fatsG: number): {
  proteinPct: number;
  carbsPct: number;
  fatsPct: number;
  proteinKcal: number;
  carbsKcal: number;
  fatsKcal: number;
  totalKcal: number;
} {
  const pKcal = Math.max(0, Number(proteinG) || 0) * ATWATER_FACTORS.protein;
  const cKcal = Math.max(0, Number(carbsG) || 0) * ATWATER_FACTORS.carbs;
  const fKcal = Math.max(0, Number(fatsG) || 0) * ATWATER_FACTORS.fats;
  const totalKcal = Math.round(pKcal + cKcal + fKcal);

  if (totalKcal <= 0) {
    return {
      proteinPct: 0,
      carbsPct: 0,
      fatsPct: 0,
      proteinKcal: 0,
      carbsKcal: 0,
      fatsKcal: 0,
      totalKcal: 0,
    };
  }

  return {
    proteinPct: Math.round((pKcal / totalKcal) * 100),
    carbsPct: Math.round((cKcal / totalKcal) * 100),
    fatsPct: Math.round((fKcal / totalKcal) * 100),
    proteinKcal: Math.round(pKcal),
    carbsKcal: Math.round(cKcal),
    fatsKcal: Math.round(fKcal),
    totalKcal,
  };
}

