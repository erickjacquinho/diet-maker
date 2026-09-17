import type { Patient as DomainPatient } from '@/lib/domain/patient';
import type { Patient as LegacyPatient } from './patientsStoreTypes';
import { formatWhatsappContact } from './whatsapp';
import { getAgeFromBirthDate } from './date-only';

export type PatientViewModel = LegacyPatient & {
  accountId?: string;
  version?: number;
  archivedAt?: string | null;
};

export function toPatientViewModel(
  patient: DomainPatient,
  overrides: Partial<LegacyPatient> = {},
): PatientViewModel {
  return {
    id: patient.id,
    accountId: patient.accountId,
    version: patient.version,
    archivedAt: patient.archivedAt,
    code: patient.displayCode,
    name: patient.name,
    gender: patient.gender,
    birthDate: patient.birthDate ?? undefined,
    isPregnant: patient.isPregnant,
    pregnancyDueDate: patient.pregnancyDueDate ?? undefined,
    heightCm: patient.heightCm ?? 0,
    weightKg: patient.weightKg ?? 0,
    maritalStatus: patient.maritalStatus ?? undefined,
    targetKcal: patient.defaultMacroTargets.kcal ?? 0,
    targetProtein: patient.defaultMacroTargets.proteinG ?? 0,
    targetCarbs: patient.defaultMacroTargets.carbsG ?? 0,
    targetFats: patient.defaultMacroTargets.fatsG ?? 0,
    objective: patient.currentObjective ?? '',
    phone: formatWhatsappContact(patient.phone ?? undefined) || undefined,
    whatsapp: formatWhatsappContact(patient.whatsapp ?? undefined) || undefined,
    nextEvent: null,
    lastConsultation: '',
    initials: getInitials(patient.name),
    lastActivity: null,
    ...overrides,
    age: getAgeFromBirthDate(patient.birthDate) ?? 0,
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function toPatientInput(patient: PatientViewModel) {
  return {
    name: patient.name,
    age: null,
    gender: patient.gender,
    birthDate: patient.birthDate ?? null,
    isPregnant: patient.isPregnant ?? false,
    pregnancyDueDate: patient.pregnancyDueDate ?? null,
    heightCm: patient.heightCm || null,
    weightKg: patient.weightKg || null,
    maritalStatus: patient.maritalStatus ?? null,
    phone: patient.phone ?? null,
    whatsapp: patient.whatsapp ?? null,
    currentObjective: patient.objective || null,
    defaultMacroTargets: {
      proteinG: patient.targetProtein || null,
      carbsG: patient.targetCarbs || null,
      fatsG: patient.targetFats || null,
      kcal: patient.targetKcal || null,
    },
  };
}
