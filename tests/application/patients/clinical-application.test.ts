import { describe, expect, it, vi } from 'vitest';
import { createPatientApplication, type PatientApplicationDependencies } from '@/lib/application/composition-root';
import { ClinicalApplicationError, type AssessmentInput, type BodyAssessment } from '@/lib/domain/clinical';
import type { Patient } from '@/lib/domain/patient';
import type { AccountContextSnapshot } from '@/lib/persistence/account-context';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import { CLINICAL_ASSESSMENT_INPUT, CLINICAL_FIXTURE_NOW, makeClinicalAssessment, makeClinicalFollowUp } from '../../fixtures/clinical';

const account: AccountContextSnapshot = {
  accountId: 'account-alpha',
  account: { id: 'account-alpha', displayName: 'Consultório de Teste', createdAt: CLINICAL_FIXTURE_NOW, updatedAt: CLINICAL_FIXTURE_NOW },
};

function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'patient-alpha-active',
    accountId: account.accountId,
    displayCode: 'P-0001',
    name: 'Ana Silva',
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
    createdAt: CLINICAL_FIXTURE_NOW,
    updatedAt: CLINICAL_FIXTURE_NOW,
    version: 1,
    archivedAt: null,
    ...overrides,
  };
}

function makeClinicalRepository(overrides: Partial<ClinicalRepository> = {}): ClinicalRepository {
  const assessment = makeClinicalAssessment();
  return {
    getAssessment: vi.fn(async () => assessment),
    listAssessments: vi.fn(async () => [assessment]),
    listAssessmentsPage: vi.fn(async () => ({ items: [assessment], total: 1, pageIndex: 0, pageSize: 25 })),
    listAssessmentsByPatients: vi.fn(async () => ({ [assessment.patientId]: [assessment] })),
    createAssessment: vi.fn(async (_accountId, _patientId, value) => value as BodyAssessment),
    updateAssessment: vi.fn(async (_accountId, _patientId, _assessmentId, _expectedVersion, value) => value as BodyAssessment),
    getNextFollowUp: vi.fn(async () => makeClinicalFollowUp()),
    listNextFollowUps: vi.fn(async () => ({ [assessment.patientId]: makeClinicalFollowUp() })),
    setNextFollowUp: vi.fn(async () => makeClinicalFollowUp()),
    clearNextFollowUp: vi.fn(async () => undefined),
    ...overrides,
  };
}

function makeDependencies(overrides: Partial<PatientApplicationDependencies> = {}): PatientApplicationDependencies {
  const patient = makePatient();
  const repository = makeClinicalRepository();
  return {
    accountContext: {
      getActive: async () => account,
      requireActive: async () => account,
    },
    patientRepository: {
      create: async () => patient,
      getById: async (_accountId, patientId) => patientId === patient.id ? patient : null,
      listActive: async () => [patient],
      listActivePage: async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 }),
      update: async () => patient,
      archive: async () => ({ ...patient, archivedAt: CLINICAL_FIXTURE_NOW, version: 2 }),
      restore: async () => ({ ...patient, archivedAt: null, version: 2 }),
    },
    objectiveCatalogRepository: { list: async () => [], addCustom: async () => { throw new Error('unused'); }, archiveCustom: async () => undefined },
    patientProfileReader: {
      getProfile: async () => ({
        patient,
        initials: 'AS',
        availableObjectives: ['Saúde'],
        related: { dietCount: 0, assessmentCount: 1 },
        clinical: {
          assessments: [makeClinicalAssessment()],
          assessmentCount: 1,
          latestAssessment: makeClinicalAssessment(),
          previousAssessment: null,
          nextFollowUp: makeClinicalFollowUp(),
          lastActivity: { eventDate: '2026-09-10', confirmedAt: CLINICAL_FIXTURE_NOW, type: 'assessment', sourceId: 'assessment-alpha-1' },
          hasDiet: false,
          dietCount: 0,
        },
      }),
      listActiveSummaries: async () => [],
      listActiveSummaryPage: async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 }),
    },
    transactionRunner: { run: async <T>(operation: () => Promise<T>) => operation() },
    clinicalRepository: repository,
    ...overrides,
  };
}

describe('PatientApplication clinical boundary', () => {
  it('does not accept calculated results from the form as persistence authority', async () => {
    const repository = makeClinicalRepository();
    const application = createPatientApplication(makeDependencies({ clinicalRepository: repository }));
    const input = {
      ...CLINICAL_ASSESSMENT_INPUT,
      bodyFatPercent: 99,
      fatMassKg: 0,
      leanMassKg: 0,
    } as unknown as AssessmentInput;

    const result = await application.createAssessment('patient-alpha-active', input);
    expect(result.bodyFatPercent).not.toBe(99);
    expect(result.leanMassKg).toBeGreaterThan(0);
    expect(repository.createAssessment).toHaveBeenCalledWith('account-alpha', 'patient-alpha-active', expect.objectContaining({ calculationMethod: 'US_NAVY', version: 1 }));
  });

  it('maps an unavailable account to a typed clinical context error', async () => {
    const application = createPatientApplication(makeDependencies({
      accountContext: {
        getActive: async () => null,
        requireActive: async () => { throw new Error('Conta ausente'); },
      },
    }));

    await expect(application.listAssessments('patient-alpha-active')).rejects.toMatchObject({ code: 'CLINICAL_CONTEXT_MISSING' });
  });

  it('rejects missing and archived patients without writing clinical records', async () => {
    const repository = makeClinicalRepository();
    const patientRepository = {
      ...makeDependencies().patientRepository,
      getById: async (_accountId: string, patientId: string) => patientId === 'archived'
        ? makePatient({ id: 'archived', archivedAt: CLINICAL_FIXTURE_NOW })
        : patientId === 'patient-alpha-active' ? makePatient() : null,
    };
    const application = createPatientApplication(makeDependencies({ patientRepository, clinicalRepository: repository }));

    await expect(application.createAssessment('missing', CLINICAL_ASSESSMENT_INPUT)).rejects.toMatchObject({ code: 'CLINICAL_PATIENT_NOT_FOUND' });
    await expect(application.createAssessment('archived', CLINICAL_ASSESSMENT_INPUT)).rejects.toMatchObject({ code: 'CLINICAL_PATIENT_ARCHIVED' });
    expect(repository.createAssessment).not.toHaveBeenCalled();
  });

  it('exposes confirmed clinical projections through the existing patient profile', async () => {
    const application = createPatientApplication(makeDependencies());
    const profile = await application.getPatientProfile('patient-alpha-active');

    expect(profile.clinical?.assessmentCount).toBe(1);
    expect(profile.clinical?.latestAssessment?.id).toBe('assessment-alpha-1');
    expect(profile.clinical?.nextFollowUp?.type).toBe('ASSESSMENT_UPDATE');
  });

  it('loads list clinical summaries in batch and keeps deterministic latest/previous records', async () => {
    const first = makePatient();
    const second = makePatient({ id: 'patient-alpha-second', name: 'Beatriz Lima' });
    const firstAssessment = makeClinicalAssessment({ id: 'assessment-first', patientId: first.id, clinicalDate: '2026-09-10' });
    const secondAssessment = makeClinicalAssessment({ id: 'assessment-second', patientId: second.id, clinicalDate: '2026-09-09' });
    const clinicalRepository = makeClinicalRepository({
      listAssessments: vi.fn(async () => { throw new Error('listAssessments must not be called per patient'); }),
      listAssessmentsByPatients: vi.fn(async () => ({ [first.id]: [firstAssessment], [second.id]: [secondAssessment] })),
      listNextFollowUps: vi.fn(async () => ({ [first.id]: makeClinicalFollowUp({ patientId: first.id }) })),
    });
    const reader = createPatientProfileReader(
      {
        create: async () => first,
        getById: async (_accountId, patientId) => patientId === first.id ? first : patientId === second.id ? second : null,
        listActive: async () => [first, second],
        listActivePage: async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 }),
        update: async () => first,
        archive: async () => first,
        restore: async () => first,
      },
      { list: async () => [], addCustom: async () => { throw new Error('unused'); }, archiveCustom: async () => undefined },
      async () => ({ dietCount: 0, assessmentCount: 0 }),
      { clinicalRepository },
    );

    const summaries = await reader.listActiveSummaries(account.accountId);
    expect(clinicalRepository.listAssessmentsByPatients).toHaveBeenCalledTimes(1);
    expect(clinicalRepository.listNextFollowUps).toHaveBeenCalledTimes(1);
    expect(summaries[0]?.clinical?.latestAssessment?.id).toBe('assessment-first');
    expect(summaries[0]?.clinical?.nextFollowUp?.patientId).toBe(first.id);
    expect(summaries[1]?.clinical?.nextFollowUp).toBeNull();
  });
});
