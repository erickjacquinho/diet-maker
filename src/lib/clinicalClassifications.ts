import { normalizeBodyFatSex } from './bodyFat';

export interface ClinicalBadge {
  label: string;
  tone: 'emerald' | 'amber' | 'rose' | 'blue' | 'neutral';
  description?: string;
}

export function classifyBodyFat(
  bfPercent: number | null | undefined,
  gender: string | null | undefined
): ClinicalBadge | null {
  if (bfPercent === null || bfPercent === undefined || !Number.isFinite(bfPercent) || bfPercent <= 0) {
    return null;
  }

  const sex = gender ? normalizeBodyFatSex(gender) : null;
  if (!sex) return null;

  if (sex === 'male') {
    if (bfPercent < 6) {
      return { label: 'Essencial', tone: 'amber', description: 'Gordura essencial mínima' };
    }
    if (bfPercent <= 13.99) {
      return { label: 'Atlético', tone: 'emerald', description: 'Nível atlético' };
    }
    if (bfPercent <= 17.99) {
      return { label: 'Bom / Fitness', tone: 'emerald', description: 'Boa aptidão física' };
    }
    if (bfPercent <= 24.99) {
      return { label: 'Normal', tone: 'blue', description: 'Faixa média aceitável' };
    }
    return { label: 'Elevado', tone: 'rose', description: 'Acima da faixa recomendada' };
  }

  // female
  if (bfPercent < 14) {
    return { label: 'Essencial', tone: 'amber', description: 'Gordura essencial mínima' };
  }
  if (bfPercent <= 20.99) {
    return { label: 'Atlético', tone: 'emerald', description: 'Nível atlético' };
  }
  if (bfPercent <= 24.99) {
    return { label: 'Bom / Fitness', tone: 'emerald', description: 'Boa aptidão física' };
  }
  if (bfPercent <= 31.99) {
    return { label: 'Normal', tone: 'blue', description: 'Faixa média aceitável' };
  }
  return { label: 'Elevado', tone: 'rose', description: 'Acima da faixa recomendada' };
}

export function classifyBmi(bmi: number | null | undefined): ClinicalBadge | null {
  if (bmi === null || bmi === undefined || !Number.isFinite(bmi) || bmi <= 0) {
    return null;
  }

  if (bmi < 18.5) {
    return { label: 'Abaixo do peso', tone: 'amber', description: 'IMC abaixo de 18.5 kg/m²' };
  }
  if (bmi < 25.0) {
    return { label: 'Eutrofia', tone: 'emerald', description: 'Peso adequado (18.5 a 24.9 kg/m²)' };
  }
  if (bmi < 30.0) {
    return { label: 'Sobrepeso', tone: 'amber', description: 'Sobrepeso (25.0 a 29.9 kg/m²)' };
  }
  if (bmi < 35.0) {
    return { label: 'Obesidade I', tone: 'rose', description: 'Obesidade Grau I (30.0 a 34.9 kg/m²)' };
  }
  if (bmi < 40.0) {
    return { label: 'Obesidade II', tone: 'rose', description: 'Obesidade Grau II (35.0 a 39.9 kg/m²)' };
  }
  return { label: 'Obesidade III', tone: 'rose', description: 'Obesidade Grau III (≥ 40.0 kg/m²)' };
}

export function classifyWaistToHipRatio(
  whr: number | null | undefined,
  gender: string | null | undefined
): ClinicalBadge | null {
  if (whr === null || whr === undefined || !Number.isFinite(whr) || whr <= 0) {
    return null;
  }

  const sex = gender ? normalizeBodyFatSex(gender) : null;
  if (!sex) return null;

  if (sex === 'male') {
    if (whr <= 0.90) {
      return { label: 'Baixo Risco', tone: 'emerald', description: 'Baixo risco cardiovascular (RCQ ≤ 0.90)' };
    }
    if (whr <= 0.99) {
      return { label: 'Risco Moderado', tone: 'amber', description: 'Risco cardiovascular moderado (0.91 a 0.99)' };
    }
    return { label: 'Alto Risco', tone: 'rose', description: 'Risco cardiovascular elevado (RCQ ≥ 1.00)' };
  }

  // female
  if (whr <= 0.80) {
    return { label: 'Baixo Risco', tone: 'emerald', description: 'Baixo risco cardiovascular (RCQ ≤ 0.80)' };
  }
  if (whr <= 0.85) {
    return { label: 'Risco Moderado', tone: 'amber', description: 'Risco cardiovascular moderado (0.81 a 0.85)' };
  }
  return { label: 'Alto Risco', tone: 'rose', description: 'Risco cardiovascular elevado (RCQ ≥ 0.86)' };
}
