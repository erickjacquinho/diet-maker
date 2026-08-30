import type { Patient as DomainPatient } from '@/lib/domain/patient';
import type { Patient as LegacyPatient } from './patientsStoreTypes';
import { formatWhatsappContact } from './whatsapp';

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
    age: patient.age,
    gender: patient.gender,
    heightCm: patient.heightCm,
    weightKg: patient.weightKg,
    maritalStatus: patient.maritalStatus ?? undefined,
    targetKcal: patient.defaultMacroTargets.kcal,
    targetProtein: patient.defaultMacroTargets.proteinG,
    targetCarbs: patient.defaultMacroTargets.carbsG,
    targetFats: patient.defaultMacroTargets.fatsG,
    objective: patient.currentObjective,
    phone: formatWhatsappContact(patient.phone ?? undefined) || undefined,
    whatsapp: formatWhatsappContact(patient.whatsapp ?? undefined) || undefined,
    nextEvent: null,
    lastConsultation: '',
    initials: getInitials(patient.name),
    lastActivity: null,
    ...overrides,
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
    age: patient.age,
    gender: patient.gender,
    heightCm: patient.heightCm,
    weightKg: patient.weightKg,
    maritalStatus: patient.maritalStatus ?? null,
    phone: patient.phone ?? null,
    whatsapp: patient.whatsapp ?? null,
    currentObjective: patient.objective,
    defaultMacroTargets: {
      proteinG: patient.targetProtein,
      carbsG: patient.targetCarbs,
      fatsG: patient.targetFats,
      kcal: patient.targetKcal,
    },
  };
}
