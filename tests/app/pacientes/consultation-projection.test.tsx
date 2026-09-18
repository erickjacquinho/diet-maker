import { describe, expect, it, vi } from 'vitest';
import { createPatientApplication, type PatientApplicationDependencies } from '@/lib/application/composition-root';
import { makeClinicalAssessment } from '../../fixtures/clinical';
import type { Patient } from '@/lib/domain/patient';
import type { DietPlan } from '@/lib/domain/diets/diet-model';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';

const patient: Patient = {
  id: 'patient-consultation',
  accountId: 'account-consultation',
  displayCode: 'P-0001',
  name: 'Ana Consulta',
  age: 31,
  gender: 'Feminino',
  birthDate: null,
  isPregnant: false,
  pregnancyDueDate: null,
  heightCm: 165,
  weightKg: 62,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: 'Saúde',
  defaultMacroTargets: { proteinG: 100, carbsG: 180, fatsG: 55, kcal: 1700 },
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};

const diet = {
  id: 'diet-consultation',
  accountId: patient.accountId,
  patientId: patient.id,
  name: 'Plano confirmado',
  mode: 'SIMPLE',
  status: 'ACTIVE',
  version: 1,
  createdAt: '2026-09-10T00:00:00.000Z',
  updatedAt: '2026-09-10T00:00:00.000Z',
  activatedAt: '2026-09-10T10:00:00.000Z',
  supersededAt: null,
  variations: [],
} as unknown as DietPlan;

function makeRepository(assessment: ReturnType<typeof makeClinicalAssessment>): ClinicalRepository {
  return {
    getAssessment: vi.fn(async () => assessment),
    listAssessments: vi.fn(async () => [assessment]),
    listAssessmentsPage: vi.fn(async () => ({ items: [assessment], total: 1, pageIndex: 0, pageSize: 25 })),
    listAssessmentsByPatients: vi.fn(async () => ({ [patient.id]: [assessment] })),
    createAssessment: vi.fn(), updateAssessment: vi.fn(),
    getNextFollowUp: vi.fn(async () => null), listNextFollowUps: vi.fn(async () => ({})),
    setNextFollowUp: vi.fn(), clearNextFollowUp: vi.fn(),
  };
}

function makeDependencies(clinicalRepository: ClinicalRepository): PatientApplicationDependencies {
  return {
    accountContext: { getActive: async () => ({ accountId: patient.accountId, account: { id: patient.accountId, displayName: 'Teste', createdAt: patient.createdAt, updatedAt: patient.updatedAt } }), requireActive: async () => ({ accountId: patient.accountId, account: { id: patient.accountId, displayName: 'Teste', createdAt: patient.createdAt, updatedAt: patient.updatedAt } }) },
    patientRepository: { create: vi.fn(), getById: vi.fn(async () => patient), listActive: vi.fn(async () => [patient]), listActivePage: vi.fn(async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 })), update: vi.fn(), archive: vi.fn(), restore: vi.fn() },
    objectiveCatalogRepository: { list: vi.fn(async () => []), addCustom: vi.fn(), archiveCustom: vi.fn() },
    patientProfileReader: { getProfile: vi.fn(async () => null), listActiveSummaries: vi.fn(async () => []), listActiveSummaryPage: vi.fn(async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 })) },
    transactionRunner: { run: async function run<T>(operation: () => Promise<T>) { return operation(); } },
    clinicalRepository,
    patientDietReader: {
      getPatientDietSummary: vi.fn(), listHistory: vi.fn(), listPreviousSources: vi.fn(async () => [{ plan: diet, activeVariation: null }]), getSnapshot: vi.fn(), countConfirmed: vi.fn(),
    },
  };
}

describe('consultation projection', () => {
  it('combines confirmed assessments and diets without ConsultationRecord persistence', async () => {
    const assessment = makeClinicalAssessment({ accountId: patient.accountId, patientId: patient.id, clinicalDate: '2026-09-10' });
    const application = createPatientApplication(makeDependencies(makeRepository(assessment)));

    const view = await application.getConsultationView(patient.id, '10/09/2026');

    expect(view.date).toBe('2026-09-10');
    expect(view.assessments.map((item) => item.id)).toEqual([assessment.id]);
    expect(view.diets.map((item) => item.id)).toEqual([diet.id]);
    expect(view.notesState).toBe('EMPTY_NOT_PERSISTED');
    expect(view.prescribedSupplements).toEqual([]);
    expect(view).not.toHaveProperty('consultationRecord');
  });
});
