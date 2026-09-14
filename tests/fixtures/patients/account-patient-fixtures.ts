export interface AccountPatientFixtureAccount {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPatientFixtureObjective {
  id: string;
  accountId: string;
  label: string;
  normalizedLabel: string;
  origin: 'SYSTEM' | 'CUSTOM';
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPatientFixturePatient {
  id: string;
  accountId: string;
  displayCode: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  phone: string | null;
  whatsapp: string | null;
  currentObjective: string;
  defaultMacroTargets: {
    proteinG: number;
    carbsG: number;
    fatsG: number;
    kcal: number;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
  archivedAt: string | null;
}

export interface RelatedRecordFixture {
  id: string;
  accountId: string;
  patientId: string;
  kind: 'diet' | 'assessment';
  payload: Record<string, unknown>;
}

export interface AccountPatientFixture {
  accounts: AccountPatientFixtureAccount[];
  objectives: AccountPatientFixtureObjective[];
  patients: AccountPatientFixturePatient[];
  relatedRecords: RelatedRecordFixture[];
}

const NOW = '2026-08-30T12:00:00.000Z';

export const ACCOUNT_PATIENT_FIXTURE: AccountPatientFixture = {
  accounts: [
    { id: 'account-alpha', displayName: 'Consultório Alpha', createdAt: NOW, updatedAt: NOW },
    { id: 'account-beta', displayName: 'Consultório Beta', createdAt: NOW, updatedAt: NOW },
  ],
  objectives: [
    {
      id: 'objective-alpha-cutting',
      accountId: 'account-alpha',
      label: 'Cutting',
      normalizedLabel: 'cutting',
      origin: 'SYSTEM',
      archivedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'objective-alpha-marathon',
      accountId: 'account-alpha',
      label: 'Preparação para Maratona',
      normalizedLabel: 'preparação para maratona',
      origin: 'CUSTOM',
      archivedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'objective-beta-maintenance',
      accountId: 'account-beta',
      label: 'Manutenção',
      normalizedLabel: 'manutenção',
      origin: 'SYSTEM',
      archivedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  patients: [
    {
      id: 'patient-alpha-active',
      accountId: 'account-alpha',
      displayCode: 'P-0001',
      name: 'Ana Lima',
      age: 32,
      gender: 'Feminino',
      heightCm: 165,
      weightKg: 62,
      phone: null,
      whatsapp: '5511999990000',
      currentObjective: 'Manutenção',
      defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
      createdAt: NOW,
      updatedAt: NOW,
      version: 1,
      archivedAt: null,
    },
    {
      id: 'patient-alpha-archived',
      accountId: 'account-alpha',
      displayCode: 'P-0002',
      name: 'Carlos Santos',
      age: 40,
      gender: 'Masculino',
      heightCm: 178,
      weightKg: 84,
      phone: '5511988880000',
      whatsapp: null,
      currentObjective: 'Cutting',
      defaultMacroTargets: { proteinG: 170, carbsG: 180, fatsG: 70, kcal: 2030 },
      createdAt: NOW,
      updatedAt: NOW,
      version: 3,
      archivedAt: '2026-08-20T09:00:00.000Z',
    },
    {
      id: 'patient-beta-active',
      accountId: 'account-beta',
      displayCode: 'P-0001',
      name: 'Beatriz Souza',
      age: 29,
      gender: 'Feminino',
      heightCm: 170,
      weightKg: 68,
      phone: null,
      whatsapp: null,
      currentObjective: 'Manutenção',
      defaultMacroTargets: { proteinG: 120, carbsG: 210, fatsG: 60, kcal: 1860 },
      createdAt: NOW,
      updatedAt: NOW,
      version: 1,
      archivedAt: null,
    },
  ],
  relatedRecords: [
    { id: 'diet-alpha-1', accountId: 'account-alpha', patientId: 'patient-alpha-archived', kind: 'diet', payload: { status: 'Histórica' } },
    { id: 'assessment-alpha-1', accountId: 'account-alpha', patientId: 'patient-alpha-archived', kind: 'assessment', payload: { weightKg: 84 } },
  ],
};

export function cloneAccountPatientFixture(): AccountPatientFixture {
  return structuredClone(ACCOUNT_PATIENT_FIXTURE);
}

export const EMPTY_ACCOUNT_PATIENT_FIXTURE: AccountPatientFixture = {
  accounts: [],
  objectives: [],
  patients: [],
  relatedRecords: [],
};
