import { useMemo } from 'react';
import { Patient } from '@/lib/patientsStore';
import { FullDietPlan, calculateMealTotals } from '@/lib/dietStore';
import { MacroMetricCardProps } from '@/components/molecules';

export function useDietCalculations(
  dietPlan: FullDietPlan | null,
  activeVariationId: string,
  patient: Patient | null
) {
  const { currentMeals, targetKcal, targetProt, targetCarb, targetFat } = useMemo(() => {
    if (!dietPlan) {
      return { currentMeals: [], targetKcal: 2000, targetProt: 140, targetCarb: 220, targetFat: 60 };
    }

    if (dietPlan.mode === 'simple') {
      return {
        currentMeals: dietPlan.simpleMeals || [],
        targetKcal: dietPlan.simpleTargetKcal,
        targetProt: dietPlan.simpleTargetProtein,
        targetCarb: dietPlan.simpleTargetCarbs,
        targetFat: dietPlan.simpleTargetFats,
      };
    } else {
      const activeVar = dietPlan.carbCyclingVariations.find((v) => v.id === activeVariationId) || dietPlan.carbCyclingVariations[0];
      return {
        currentMeals: activeVar ? activeVar.meals : [],
        targetKcal: activeVar ? activeVar.targetKcal : 2000,
        targetProt: activeVar ? activeVar.targetProtein : 140,
        targetCarb: activeVar ? activeVar.targetCarbs : 220,
        targetFat: activeVar ? activeVar.targetFats : 60,
      };
    }
  }, [dietPlan, activeVariationId]);

  const currentTotals = useMemo(() => calculateMealTotals(currentMeals.flatMap(m => m.items)), [currentMeals]);

  const macroMetrics: MacroMetricCardProps[] = useMemo(() => {
    const weight = patient?.weightKg || 70;

    const kcalDiff = currentTotals.kcal - targetKcal;
    const kcalBadgeText = kcalDiff === 0 ? 'Na meta ✓' : kcalDiff > 0 ? `+${kcalDiff} kcal` : `${kcalDiff} kcal`;
    const kcalBadgeVariant = Math.abs(kcalDiff) <= targetKcal * 0.05 ? 'emerald' : kcalDiff > 0 ? 'rose' : 'amber';
    const kcalPct = targetKcal > 0 ? Math.min(100, Math.round((currentTotals.kcal / targetKcal) * 100)) : 0;

    const protDiff = Math.round((currentTotals.proteinG - targetProt) * 10) / 10;
    const protBadgeText = Math.abs(protDiff) <= 2 ? 'Na meta ✓' : protDiff > 0 ? `+${protDiff}g` : `${protDiff}g`;
    const protBadgeVariant = Math.abs(protDiff) <= targetProt * 0.05 ? 'emerald' : protDiff > 0 ? 'rose' : 'amber';
    const protPct = targetProt > 0 ? Math.min(100, Math.round((currentTotals.proteinG / targetProt) * 100)) : 0;
    const protGPerKg = (currentTotals.proteinG / weight).toFixed(2);
    const protMetaGPerKg = (targetProt / weight).toFixed(1);

    const carbDiff = Math.round((currentTotals.carbsG - targetCarb) * 10) / 10;
    const carbBadgeText = Math.abs(carbDiff) <= 2 ? 'Na meta ✓' : carbDiff > 0 ? `+${carbDiff}g` : `${carbDiff}g`;
    const carbBadgeVariant = Math.abs(carbDiff) <= targetCarb * 0.05 ? 'emerald' : carbDiff > 0 ? 'rose' : 'amber';
    const carbPct = targetCarb > 0 ? Math.min(100, Math.round((currentTotals.carbsG / targetCarb) * 100)) : 0;
    const carbGPerKg = (currentTotals.carbsG / weight).toFixed(2);
    const carbMetaGPerKg = (targetCarb / weight).toFixed(1);

    const fatsVal = currentTotals.fatsG;
    const fatDiff = Math.round((fatsVal - targetFat) * 10) / 10;
    const fatBadgeText = Math.abs(fatDiff) <= 2 ? 'Na meta ✓' : fatDiff > 0 ? `+${fatDiff}g` : `${fatDiff}g`;
    const fatBadgeVariant = Math.abs(fatDiff) <= targetFat * 0.05 ? 'emerald' : fatDiff > 0 ? 'rose' : 'amber';
    const fatPct = targetFat > 0 ? Math.min(100, Math.round((fatsVal / targetFat) * 100)) : 0;
    const fatGPerKg = (fatsVal / weight).toFixed(2);
    const fatMetaGPerKg = (targetFat / weight).toFixed(1);

    return [
      {
        label: 'Calorias',
        currentValue: `${currentTotals.kcal}`,
        targetValue: `${targetKcal} kcal`,
        statusBadgeText: kcalBadgeText,
        statusBadgeVariant: kcalBadgeVariant as any,
        percentage: kcalPct,
        macroColor: 'blue',
      },
      {
        label: 'Proteínas',
        currentValue: `${Math.round(currentTotals.proteinG)}g`,
        targetValue: `${targetProt}g`,
        statusBadgeText: protBadgeText,
        statusBadgeVariant: protBadgeVariant as any,
        percentage: protPct,
        gPerKgRatio: `${protGPerKg} g/kg`,
        gPerKgMeta: protMetaGPerKg,
        macroColor: 'emerald',
      },
      {
        label: 'Carboidratos',
        currentValue: `${Math.round(currentTotals.carbsG)}g`,
        targetValue: `${targetCarb}g`,
        statusBadgeText: carbBadgeText,
        statusBadgeVariant: carbBadgeVariant as any,
        percentage: carbPct,
        gPerKgRatio: `${carbGPerKg} g/kg`,
        gPerKgMeta: carbMetaGPerKg,
        macroColor: 'amber',
      },
      {
        label: 'Gorduras',
        currentValue: `${Math.round(fatsVal)}g`,
        targetValue: `${targetFat}g`,
        statusBadgeText: fatBadgeText,
        statusBadgeVariant: fatBadgeVariant as any,
        percentage: fatPct,
        gPerKgRatio: `${fatGPerKg} g/kg`,
        gPerKgMeta: fatMetaGPerKg,
        macroColor: 'rose',
      },
    ];
  }, [patient, currentTotals, targetKcal, targetProt, targetCarb, targetFat]);

  return {
    currentMeals,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
    currentTotals,
    macroMetrics,
  };
}
