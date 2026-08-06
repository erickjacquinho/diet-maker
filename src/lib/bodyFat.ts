export type BodyFatSex = 'male' | 'female';

export interface NavyBodyFatInput {
  sex: BodyFatSex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  abdomenCm: number;
  hipCm: number;
  weightKg: number;
}

export interface BodyCompositionResult {
  bodyFatPercent: number | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
  isValid: boolean;
  error?: string;
}

const CM_PER_INCH = 2.54;

const NAVY_FORMULAS = {
  male: {
    circumference: (abdomenIn: number, neckIn: number) => abdomenIn - neckIn,
    bodyFat: (circumferenceIn: number, heightIn: number) =>
      86.01 * Math.log10(circumferenceIn) -
      70.041 * Math.log10(heightIn) +
      36.76,
  },
  female: {
    circumference: (waistIn: number, neckIn: number, hipIn: number) =>
      waistIn + hipIn - neckIn,
    bodyFat: (circumferenceIn: number, heightIn: number) =>
      163.205 * Math.log10(circumferenceIn) -
      97.684 * Math.log10(heightIn) -
      78.387,
  },
} as const;

const INVALID_MEASUREMENTS = 'As medidas informadas não permitem calcular o percentual de gordura.';
const INVALID_SEX = 'O gênero do paciente deve ser Masculino ou Feminino.';
const INVALID_RESULT = 'O resultado calculado está fora de um intervalo válido.';

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toInches(valueCm: number): number {
  return valueCm / CM_PER_INCH;
}

function invalidResult(error: string): BodyCompositionResult {
  return {
    bodyFatPercent: null,
    fatMassKg: null,
    leanMassKg: null,
    isValid: false,
    error,
  };
}

export function normalizeBodyFatSex(gender: string): BodyFatSex | null {
  const normalized = gender.trim().toLocaleLowerCase('pt-BR');

  if (normalized === 'masculino' || normalized === 'male') return 'male';
  if (normalized === 'feminino' || normalized === 'female') return 'female';

  return null;
}

export function calculateBodyComposition(input: NavyBodyFatInput): BodyCompositionResult {
  if (input.sex !== 'male' && input.sex !== 'female') {
    return invalidResult(INVALID_SEX);
  }

  const measurements = [
    input.heightCm,
    input.neckCm,
    input.waistCm,
    input.abdomenCm,
    input.hipCm,
    input.weightKg,
  ];

  if (measurements.some((value) => !Number.isFinite(value) || value <= 0)) {
    return invalidResult(INVALID_MEASUREMENTS);
  }

  const heightIn = toInches(input.heightCm);
  const neckIn = toInches(input.neckCm);
  const waistIn = toInches(input.waistCm);
  const abdomenIn = toInches(input.abdomenCm);
  const hipIn = toInches(input.hipCm);
  const circumferenceIn = input.sex === 'male'
    ? NAVY_FORMULAS.male.circumference(abdomenIn, neckIn)
    : NAVY_FORMULAS.female.circumference(waistIn, neckIn, hipIn);

  if (!Number.isFinite(circumferenceIn) || circumferenceIn <= 0) {
    return invalidResult(INVALID_MEASUREMENTS);
  }

  const rawBodyFatPercent = input.sex === 'male'
    ? NAVY_FORMULAS.male.bodyFat(circumferenceIn, heightIn)
    : NAVY_FORMULAS.female.bodyFat(circumferenceIn, heightIn);

  if (!Number.isFinite(rawBodyFatPercent) || rawBodyFatPercent < 0 || rawBodyFatPercent > 100) {
    return invalidResult(INVALID_RESULT);
  }

  const bodyFatPercent = roundToTwo(rawBodyFatPercent);
  const fatMassKg = roundToTwo(input.weightKg * bodyFatPercent / 100);
  const leanMassKg = roundToTwo(input.weightKg - fatMassKg);

  return {
    bodyFatPercent,
    fatMassKg,
    leanMassKg,
    isValid: true,
  };
}
