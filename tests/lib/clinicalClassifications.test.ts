import { describe, expect, it } from 'vitest';
import {
  classifyBodyFat,
  classifyBmi,
  classifyWaistToHipRatio,
} from '@/lib/clinicalClassifications';

describe('classifyBodyFat', () => {
  it('classifies male body fat correctly', () => {
    expect(classifyBodyFat(10, 'Masculino')?.label).toBe('Atlético');
    expect(classifyBodyFat(15, 'Masculino')?.label).toBe('Bom / Fitness');
    expect(classifyBodyFat(20, 'Masculino')?.label).toBe('Normal');
    expect(classifyBodyFat(28, 'Masculino')?.label).toBe('Elevado');
  });

  it('classifies female body fat correctly', () => {
    expect(classifyBodyFat(18, 'Feminino')?.label).toBe('Atlético');
    expect(classifyBodyFat(22, 'Feminino')?.label).toBe('Bom / Fitness');
    expect(classifyBodyFat(28, 'Feminino')?.label).toBe('Normal');
    expect(classifyBodyFat(35, 'Feminino')?.label).toBe('Elevado');
  });

  it('returns null for invalid inputs', () => {
    expect(classifyBodyFat(null, 'Masculino')).toBeNull();
    expect(classifyBodyFat(20, null)).toBeNull();
  });
});

describe('classifyBmi', () => {
  it('classifies WHO BMI ranges correctly', () => {
    expect(classifyBmi(17.5)?.label).toBe('Abaixo do peso');
    expect(classifyBmi(22.4)?.label).toBe('Eutrofia');
    expect(classifyBmi(27.8)?.label).toBe('Sobrepeso');
    expect(classifyBmi(32.1)?.label).toBe('Obesidade I');
    expect(classifyBmi(37.0)?.label).toBe('Obesidade II');
    expect(classifyBmi(42.5)?.label).toBe('Obesidade III');
  });

  it('returns null for invalid BMI', () => {
    expect(classifyBmi(null)).toBeNull();
    expect(classifyBmi(0)).toBeNull();
  });
});

describe('classifyWaistToHipRatio', () => {
  it('classifies male cardiovascular risk correctly', () => {
    expect(classifyWaistToHipRatio(0.85, 'Masculino')?.label).toBe('Baixo Risco');
    expect(classifyWaistToHipRatio(0.95, 'Masculino')?.label).toBe('Risco Moderado');
    expect(classifyWaistToHipRatio(1.05, 'Masculino')?.label).toBe('Alto Risco');
  });

  it('classifies female cardiovascular risk correctly', () => {
    expect(classifyWaistToHipRatio(0.75, 'Feminino')?.label).toBe('Baixo Risco');
    expect(classifyWaistToHipRatio(0.83, 'Feminino')?.label).toBe('Risco Moderado');
    expect(classifyWaistToHipRatio(0.90, 'Feminino')?.label).toBe('Alto Risco');
  });

  it('returns null for invalid WHR', () => {
    expect(classifyWaistToHipRatio(null, 'Masculino')).toBeNull();
    expect(classifyWaistToHipRatio(0.85, null)).toBeNull();
  });
});
