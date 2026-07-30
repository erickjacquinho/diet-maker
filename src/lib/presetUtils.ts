export type MacroMode = 'absoluto' | 'multiplicativo';

export interface MacroConfig {
  mode: MacroMode;
  value: number;
}

export function calculateMacroGrams(config: MacroConfig, referenceWeight: number): number {
  const val = Math.max(0, Number(config.value) || 0);
  if (config.mode === 'multiplicativo') {
    const weight = Math.max(0, Number(referenceWeight) || 0);
    return Math.round(val * weight * 10) / 10;
  }
  return Math.round(val);
}

export function calculatePresetCalories(proteinG: number, carbsG: number, fatsG: number): number {
  const p = Math.max(0, proteinG || 0);
  const c = Math.max(0, carbsG || 0);
  const f = Math.max(0, fatsG || 0);
  return Math.round(p * 4 + c * 4 + f * 9);
}

export interface PresetNutrients {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  targetKcal: number;
}

export function resolvePresetForPatient(
  preset: {
    proteinMode?: MacroMode;
    proteinValue?: number;
    proteinG?: number;
    carbsMode?: MacroMode;
    carbsValue?: number;
    carbsG?: number;
    fatsMode?: MacroMode;
    fatsValue?: number;
    fatsG?: number;
    referenceWeight?: number;
    targetKcal?: number;
  },
  patientWeightKg: number
): PresetNutrients {
  const weight = Math.max(0, Number(patientWeightKg) || 0);

  const proteinG = calculateMacroGrams(
    {
      mode: preset.proteinMode || 'absoluto',
      value: preset.proteinMode === 'multiplicativo' ? (preset.proteinValue ?? 0) : (preset.proteinG ?? 0),
    },
    weight
  );

  const carbsG = calculateMacroGrams(
    {
      mode: preset.carbsMode || 'absoluto',
      value: preset.carbsMode === 'multiplicativo' ? (preset.carbsValue ?? 0) : (preset.carbsG ?? 0),
    },
    weight
  );

  const fatsG = calculateMacroGrams(
    {
      mode: preset.fatsMode || 'absoluto',
      value: preset.fatsMode === 'multiplicativo' ? (preset.fatsValue ?? 0) : (preset.fatsG ?? 0),
    },
    weight
  );

  const targetKcal = calculatePresetCalories(proteinG, carbsG, fatsG);

  return {
    proteinG,
    carbsG,
    fatsG,
    targetKcal,
  };
}

