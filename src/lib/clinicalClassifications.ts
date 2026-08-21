import { normalizeBodyFatSex } from './bodyFat';

export interface ClinicalBadge {
  label: string;
  tone: 'emerald' | 'amber' | 'rose' | 'blue' | 'neutral';
  description?: string;
}

/**
 * Classificação de Body Fat (BF%) voltada para praticantes de musculação e performance.
 */
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
    if (bfPercent < 7.0) {
      return { label: 'Competição', tone: 'emerald', description: 'Nível de palco / contest (< 7%)' };
    }
    if (bfPercent <= 10.99) {
      return { label: 'Shredded', tone: 'emerald', description: 'Definição muscular máxima (7% - 10%)' };
    }
    if (bfPercent <= 14.99) {
      return { label: 'Atlético', tone: 'blue', description: 'Físico atlético sustentável (11% - 14%)' };
    }
    if (bfPercent <= 18.99) {
      return { label: 'Bulking / Off', tone: 'amber', description: 'Fase de ganho de massa / off-season (15% - 18%)' };
    }
    return { label: 'Definição', tone: 'rose', description: 'Cutting / redução de gordura recomendado (≥ 19%)' };
  }

  // female
  if (bfPercent < 13.0) {
    return { label: 'Competição', tone: 'emerald', description: 'Nível de palco / contest (< 13%)' };
  }
  if (bfPercent <= 17.99) {
    return { label: 'Shredded', tone: 'emerald', description: 'Alta definição estética (13% - 17%)' };
  }
  if (bfPercent <= 21.99) {
    return { label: 'Atlética', tone: 'blue', description: 'Físico atlético e saudável (18% - 21%)' };
  }
  if (bfPercent <= 26.99) {
    return { label: 'Manutenção / Off', tone: 'amber', description: 'Manutenção / ganho de massa (22% - 26%)' };
  }
  return { label: 'Definição', tone: 'rose', description: 'Cutting / redução de gordura recomendado (≥ 27%)' };
}

/**
 * Classificação do Fat-Free Mass Index (FFMI) - Índice de Massa Livre de Gordura.
 * Baseado no modelo científico de Kouri et al. para mensurar hipertrofia real.
 */
export function classifyFfmi(
  ffmi: number | null | undefined,
  gender: string | null | undefined
): ClinicalBadge | null {
  if (ffmi === null || ffmi === undefined || !Number.isFinite(ffmi) || ffmi <= 0) {
    return null;
  }

  const sex = gender ? normalizeBodyFatSex(gender) : null;
  if (!sex) return null;

  if (sex === 'male') {
    if (ffmi < 19.0) {
      return { label: 'Iniciante', tone: 'amber', description: 'Desenvolvimento muscular inicial (< 19.0)' };
    }
    if (ffmi <= 21.49) {
      return { label: 'Intermediário', tone: 'blue', description: 'Bom nível de massa muscular (19.0 - 21.4)' };
    }
    if (ffmi <= 23.49) {
      return { label: 'Avançado', tone: 'emerald', description: 'Excelente volume muscular (21.5 - 23.4)' };
    }
    if (ffmi <= 24.99) {
      return { label: 'Elite Natural', tone: 'emerald', description: 'Próximo ao limite genético natural (23.5 - 24.9)' };
    }
    return { label: 'Nível Pro', tone: 'emerald', description: 'Densidade muscular de nível competitivo (≥ 25.0)' };
  }

  // female
  if (ffmi < 15.0) {
    return { label: 'Iniciante', tone: 'amber', description: 'Desenvolvimento muscular inicial (< 15.0)' };
  }
  if (ffmi <= 17.49) {
    return { label: 'Intermediária', tone: 'blue', description: 'Bom nível de massa muscular (15.0 - 17.4)' };
  }
  if (ffmi <= 19.49) {
    return { label: 'Avançada', tone: 'emerald', description: 'Excelente volume muscular (17.5 - 19.4)' };
  }
  if (ffmi <= 21.99) {
    return { label: 'Elite Natural', tone: 'emerald', description: 'Próximo ao limite genético natural (19.5 - 21.9)' };
  }
  return { label: 'Nível Pro', tone: 'emerald', description: 'Densidade muscular de nível competitivo (≥ 22.0)' };
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
