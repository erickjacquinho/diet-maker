import { describe, it, expect } from 'vitest';
import { calculatePresetCalories, calculateMacroGrams, resolvePresetForPatient } from '../presetUtils';

describe('calculatePresetCalories', () => {
  it('calculates calories correctly for standard macronutrient breakdown', () => {
    // 160g protein * 4 = 640
    // 200g carbs * 4 = 800
    // 60g fats * 9 = 540
    // Total = 1980
    expect(calculatePresetCalories(160, 200, 60)).toBe(1980);
  });

  it('handles zero macronutrient values', () => {
    expect(calculatePresetCalories(0, 0, 0)).toBe(0);
  });

  it('handles negative or NaN values safely by returning 0 for negative components', () => {
    expect(calculatePresetCalories(-10, 100, 20)).toBe(580);
    expect(calculatePresetCalories(NaN, 50, 10)).toBe(290);
  });

  it('rounds to nearest integer correctly', () => {
    expect(calculatePresetCalories(150.5, 200.2, 50.8)).toBe(1860);
  });
});

describe('calculateMacroGrams', () => {
  it('returns exact value when mode is absoluto', () => {
    expect(calculateMacroGrams({ mode: 'absoluto', value: 160 }, 70)).toBe(160);
  });

  it('multiplies value by weight when mode is multiplicativo', () => {
    // 2.0 g/kg * 70 kg = 140g
    expect(calculateMacroGrams({ mode: 'multiplicativo', value: 2.0 }, 70)).toBe(140);
    // 2.2 g/kg * 80 kg = 176g
    expect(calculateMacroGrams({ mode: 'multiplicativo', value: 2.2 }, 80)).toBe(176);
  });

  it('handles zero weight or value gracefully', () => {
    expect(calculateMacroGrams({ mode: 'multiplicativo', value: 0 }, 70)).toBe(0);
    expect(calculateMacroGrams({ mode: 'multiplicativo', value: 2.0 }, 0)).toBe(0);
  });

  it('handles negative values safely', () => {
    expect(calculateMacroGrams({ mode: 'multiplicativo', value: -1 }, 70)).toBe(0);
    expect(calculateMacroGrams({ mode: 'absoluto', value: -50 }, 70)).toBe(0);
  });
});

describe('resolvePresetForPatient', () => {
  it('resolves multiplicative preset macros based on patient weight', () => {
    const preset = {
      proteinMode: 'multiplicativo' as const,
      proteinValue: 2.0,
      carbsMode: 'multiplicativo' as const,
      carbsValue: 3.0,
      fatsMode: 'multiplicativo' as const,
      fatsValue: 1.0,
    };

    // Patient 80kg:
    // Protein: 2.0 * 80 = 160g
    // Carbs: 3.0 * 80 = 240g
    // Fats: 1.0 * 80 = 80g
    // Calories: 160*4 + 240*4 + 80*9 = 640 + 960 + 720 = 2320 kcal
    const resolved = resolvePresetForPatient(preset, 80);
    expect(resolved.proteinG).toBe(160);
    expect(resolved.carbsG).toBe(240);
    expect(resolved.fatsG).toBe(80);
    expect(resolved.targetKcal).toBe(2320);
  });

  it('handles mixed absolute and multiplicative modes', () => {
    const preset = {
      proteinMode: 'multiplicativo' as const,
      proteinValue: 2.5,
      carbsMode: 'absoluto' as const,
      carbsG: 200,
      fatsMode: 'absoluto' as const,
      fatsG: 50,
    };

    // Patient 70kg:
    // Protein: 2.5 * 70 = 175g
    // Carbs: 200g
    // Fats: 50g
    // Calories: 175*4 + 200*4 + 50*9 = 700 + 800 + 450 = 1950 kcal
    const resolved = resolvePresetForPatient(preset, 70);
    expect(resolved.proteinG).toBe(175);
    expect(resolved.carbsG).toBe(200);
    expect(resolved.fatsG).toBe(50);
    expect(resolved.targetKcal).toBe(1950);
  });
});

