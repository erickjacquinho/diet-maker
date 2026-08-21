import { describe, expect, it } from 'vitest';
import {
  classifyBodyFat,
  classifyBmi,
  classifyFfmi,
  classifyWaistToHipRatio,
} from '@/lib/clinicalClassifications';

describe('classifyBodyFat (Athletic & Performance)', () => {
  it('classifies male athletic body fat stages correctly', () => {
    expect(classifyBodyFat(6.5, 'Masculino')?.label).toBe('Competição');
    expect(classifyBodyFat(8.5, 'Masculino')?.label).toBe('Shredded');
    expect(classifyBodyFat(12.5, 'Masculino')?.label).toBe('Atlético');
    expect(classifyBodyFat(16.5, 'Masculino')?.label).toBe('Bulking / Off');
    expect(classifyBodyFat(22.0, 'Masculino')?.label).toBe('Definição');
  });

  it('classifies female athletic body fat stages correctly', () => {
    expect(classifyBodyFat(12.0, 'Feminino')?.label).toBe('Competição');
    expect(classifyBodyFat(15.5, 'Feminino')?.label).toBe('Shredded');
    expect(classifyBodyFat(19.5, 'Feminino')?.label).toBe('Atlética');
    expect(classifyBodyFat(24.5, 'Feminino')?.label).toBe('Manutenção / Off');
    expect(classifyBodyFat(30.0, 'Feminino')?.label).toBe('Definição');
  });

  it('returns null for invalid inputs', () => {
    expect(classifyBodyFat(null, 'Masculino')).toBeNull();
    expect(classifyBodyFat(20, null)).toBeNull();
  });
});

describe('classifyFfmi (Fat-Free Mass Index)', () => {
  it('classifies male FFMI levels accurately', () => {
    expect(classifyFfmi(18.2, 'Masculino')?.label).toBe('Iniciante');
    expect(classifyFfmi(20.5, 'Masculino')?.label).toBe('Intermediário');
    expect(classifyFfmi(22.4, 'Masculino')?.label).toBe('Avançado');
    expect(classifyFfmi(24.2, 'Masculino')?.label).toBe('Elite Natural');
    expect(classifyFfmi(26.0, 'Masculino')?.label).toBe('Nível Pro');
  });

  it('classifies female FFMI levels accurately', () => {
    expect(classifyFfmi(14.5, 'Feminino')?.label).toBe('Iniciante');
    expect(classifyFfmi(16.5, 'Feminino')?.label).toBe('Intermediária');
    expect(classifyFfmi(18.5, 'Feminino')?.label).toBe('Avançada');
    expect(classifyFfmi(20.5, 'Feminino')?.label).toBe('Elite Natural');
    expect(classifyFfmi(23.0, 'Feminino')?.label).toBe('Nível Pro');
  });

  it('returns null for invalid FFMI', () => {
    expect(classifyFfmi(null, 'Masculino')).toBeNull();
    expect(classifyFfmi(22, null)).toBeNull();
  });
});

describe('classifyBmi', () => {
  it('classifies WHO BMI ranges correctly', () => {
    expect(classifyBmi(17.5)?.label).toBe('Abaixo do peso');
    expect(classifyBmi(22.4)?.label).toBe('Eutrofia');
    expect(classifyBmi(27.8)?.label).toBe('Sobrepeso');
    expect(classifyBmi(32.1)?.label).toBe('Obesidade I');
  });
});

describe('classifyWaistToHipRatio', () => {
  it('classifies male cardiovascular risk correctly', () => {
    expect(classifyWaistToHipRatio(0.85, 'Masculino')?.label).toBe('Baixo Risco');
  });
});
