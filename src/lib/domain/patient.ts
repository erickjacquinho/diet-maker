export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal: number;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  maritalStatus?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  currentObjective: string;
  defaultMacroTargets: MacroTargets;
}

export interface Patient extends PatientInput {
  id: string;
  accountId: string;
  displayCode: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  archivedAt: string | null;
}

export interface PatientFieldErrors {
  [field: string]: string;
}

export const DEFAULT_MARITAL_STATUS_LABELS = ['Solteiro(a)', 'Comprometido(a)'] as const;

export interface PatientValidationResult {
  valid: boolean;
  fieldErrors: PatientFieldErrors;
}

function normalizeOptionalPhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) return digits.slice(2);
  return digits || null;
}

export function normalizePatientInput(input: PatientInput): PatientInput {
  return {
    ...input,
    name: input.name.trim().replace(/\s+/g, ' '),
    gender: input.gender.trim(),
    phone: normalizeOptionalPhone(input.phone),
    whatsapp: normalizeOptionalPhone(input.whatsapp),
    currentObjective: input.currentObjective.trim().replace(/\s+/g, ' '),
    defaultMacroTargets: {
      proteinG: Number(input.defaultMacroTargets.proteinG),
      carbsG: Number(input.defaultMacroTargets.carbsG),
      fatsG: Number(input.defaultMacroTargets.fatsG),
      kcal: Number(input.defaultMacroTargets.kcal),
    },
  };
}

export function validatePatientInput(input: PatientInput): PatientValidationResult {
  const normalized = normalizePatientInput(input);
  const fieldErrors: PatientFieldErrors = {};
  const numbers: Array<[string, number, 'nonNegative' | 'positive']> = [
    ['age', normalized.age, 'nonNegative'],
    ['heightCm', normalized.heightCm, 'positive'],
    ['weightKg', normalized.weightKg, 'positive'],
    ['defaultMacroTargets.proteinG', normalized.defaultMacroTargets.proteinG, 'nonNegative'],
    ['defaultMacroTargets.carbsG', normalized.defaultMacroTargets.carbsG, 'nonNegative'],
    ['defaultMacroTargets.fatsG', normalized.defaultMacroTargets.fatsG, 'nonNegative'],
    ['defaultMacroTargets.kcal', normalized.defaultMacroTargets.kcal, 'nonNegative'],
  ];

  if (!normalized.name) fieldErrors.name = 'Informe o nome completo.';
  if (!normalized.gender) fieldErrors.gender = 'Selecione o gênero.';
  if (!normalized.currentObjective) fieldErrors.currentObjective = 'Selecione um objetivo.';

  for (const [field, value, rule] of numbers) {
    if (!Number.isFinite(value) || (rule === 'positive' ? value <= 0 : value < 0)) {
      fieldErrors[field] = rule === 'positive' ? 'Informe um valor maior que zero.' : 'Informe um valor não negativo.';
    }
  }

  if (normalized.phone && (normalized.phone.length < 10 || normalized.phone.length > 11)) {
    fieldErrors.phone = 'Informe um telefone válido.';
  }
  if (normalized.whatsapp && (normalized.whatsapp.length < 10 || normalized.whatsapp.length > 11)) {
    fieldErrors.whatsapp = 'Informe um WhatsApp válido.';
  }

  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

export function getPatientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function isPatientActive(patient: Pick<Patient, 'archivedAt'>): boolean {
  return patient.archivedAt === null;
}

export function assertPatientVersion(
  patient: Pick<Patient, 'version'>,
  expectedVersion: number,
): void {
  if (patient.version !== expectedVersion) {
    throw new Error(`Conflito de versão: esperado ${expectedVersion}, atual ${patient.version}.`);
  }
}
