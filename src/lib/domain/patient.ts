import { getAgeFromBirthDate } from '@/lib/date-only';

export interface MacroTargets {
  proteinG: number | null;
  carbsG: number | null;
  fatsG: number | null;
  kcal: number | null;
}

export interface PatientInput {
  name: string;
  age?: number | null;
  gender?: string | null;
  birthDate?: string | null;
  isPregnant?: boolean;
  pregnancyDueDate?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  maritalStatus?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  currentObjective?: string | null;
  defaultMacroTargets?: Partial<MacroTargets> | null;
}

export interface Patient extends PatientInput {
  id: string;
  accountId: string;
  displayCode: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  archivedAt: string | null;
  age: number | null;
  gender: string;
  birthDate: string | null;
  isPregnant: boolean;
  pregnancyDueDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  currentObjective: string | null;
  defaultMacroTargets: MacroTargets;
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

function normalizeOptionalDate(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function normalizePatientInput(input: PatientInput): PatientInput {
  const gender = input.gender?.trim() ?? '';
  const isPregnant = gender === 'Feminino' && input.isPregnant === true;
  const birthDate = normalizeOptionalDate(input.birthDate);
  return {
    ...input,
    name: input.name.trim().replace(/\s+/g, ' '),
    age: getAgeFromBirthDate(birthDate),
    gender,
    birthDate,
    isPregnant,
    pregnancyDueDate: isPregnant ? normalizeOptionalDate(input.pregnancyDueDate) : null,
    heightCm: input.heightCm ?? null,
    phone: normalizeOptionalPhone(input.phone),
    whatsapp: normalizeOptionalPhone(input.whatsapp),
    currentObjective: input.currentObjective?.trim().replace(/\s+/g, ' ') || null,
    weightKg: input.weightKg ?? null,
    defaultMacroTargets: {
      proteinG: input.defaultMacroTargets?.proteinG ?? null,
      carbsG: input.defaultMacroTargets?.carbsG ?? null,
      fatsG: input.defaultMacroTargets?.fatsG ?? null,
      kcal: input.defaultMacroTargets?.kcal ?? null,
    },
  };
}

export function validatePatientInput(
  input: PatientInput,
  options: { requireProfileFields?: boolean } = {},
): PatientValidationResult {
  const normalized = normalizePatientInput(input);
  const fieldErrors: PatientFieldErrors = {};
  const numbers: Array<[string, number | null | undefined, 'nonNegative' | 'positive']> = [
    ['age', normalized.age, 'nonNegative'],
    ['heightCm', normalized.heightCm, 'positive'],
    ['weightKg', normalized.weightKg, 'positive'],
    ['defaultMacroTargets.proteinG', normalized.defaultMacroTargets?.proteinG, 'nonNegative'],
    ['defaultMacroTargets.carbsG', normalized.defaultMacroTargets?.carbsG, 'nonNegative'],
    ['defaultMacroTargets.fatsG', normalized.defaultMacroTargets?.fatsG, 'nonNegative'],
    ['defaultMacroTargets.kcal', normalized.defaultMacroTargets?.kcal, 'nonNegative'],
  ];

  if (!normalized.name) fieldErrors.name = 'Informe o nome completo.';
  if (options.requireProfileFields) {
    if (!normalized.whatsapp) fieldErrors.whatsapp = 'Informe o telefone/WhatsApp.';
    if (!normalized.gender) fieldErrors.gender = 'Selecione o gênero.';
    if (!normalized.birthDate) fieldErrors.birthDate = 'Informe a data de nascimento.';
  }
  if (normalized.birthDate && getAgeFromBirthDate(normalized.birthDate) === null) {
    fieldErrors.birthDate = 'Informe uma data de nascimento válida.';
  }

  for (const [field, value, rule] of numbers) {
    if (value === null || value === undefined) continue;
    if (!Number.isFinite(value) || (rule === 'positive' ? value <= 0 : value < 0)) {
      fieldErrors[field] = rule === 'positive' ? 'Informe um valor maior que zero.' : 'Informe um valor não negativo.';
    }
  }

  if (normalized.isPregnant && !normalized.pregnancyDueDate) {
    fieldErrors.pregnancyDueDate = 'Informe a data prevista do parto.';
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
