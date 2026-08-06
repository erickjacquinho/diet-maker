import { describe, expect, it } from 'vitest';
import { calculateBodyComposition } from '@/lib/bodyFat';

const baseInput = {
  heightCm: 180,
  neckCm: 40,
  waistCm: 85,
  abdomenCm: 90,
  hipCm: 95,
  weightKg: 80,
};

describe('calculateBodyComposition', () => {
  it('calculates male body fat from abdomen and neck', () => {
    const result = calculateBodyComposition({ ...baseInput, sex: 'male' });

    expect(result).toEqual({
      bodyFatPercent: 18.46,
      fatMassKg: 14.77,
      leanMassKg: 65.23,
      isValid: true,
    });
  });

  it('calculates female body fat from waist, hip and neck', () => {
    const result = calculateBodyComposition({
      ...baseInput,
      sex: 'female',
      heightCm: 165,
      neckCm: 32,
      waistCm: 75,
      abdomenCm: 90,
      hipCm: 100,
      weightKg: 65,
    });

    expect(result).toEqual({
      bodyFatPercent: 30.24,
      fatMassKg: 19.66,
      leanMassKg: 45.34,
      isValid: true,
    });
  });

  it('returns a stable validation error for missing or non-positive values', () => {
    const result = calculateBodyComposition({
      ...baseInput,
      sex: 'male',
      abdomenCm: baseInput.neckCm,
    });

    expect(result.isValid).toBe(false);
    expect(result.bodyFatPercent).toBeNull();
    expect(result.fatMassKg).toBeNull();
    expect(result.leanMassKg).toBeNull();
    expect(result.error).toBe('As medidas informadas não permitem calcular o percentual de gordura.');
  });

  it('rejects unknown sex instead of silently selecting an equation', () => {
    const result = calculateBodyComposition({
      ...baseInput,
      sex: 'unknown' as 'male',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('O gênero do paciente deve ser Masculino ou Feminino.');
  });
});
