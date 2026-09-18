import { nanoid } from 'nanoid';
import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientRepository } from '@/lib/persistence/patient-repository';
import type { TransactionRunner } from '@/lib/persistence/transaction-runner';
import type { PatientDietReader } from '@/lib/application/diets/diet-ports';
import type {
  AssessmentInput,
  BodyAssessment,
  ConsultationView,
  NextFollowUp,
  NextFollowUpInput,
} from '@/lib/domain/clinical';
import {
  buildBodyAssessment,
  ClinicalApplicationError,
  latestAssessments,
  normalizeClinicalDate,
  normalizeNextFollowUpInput,
} from '@/lib/domain/clinical';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import type { PageRequest, PageResult } from '@/lib/persistence/page';

export interface ClinicalCommandDependencies {
  accountContext: AccountContext;
  patientRepository: PatientRepository;
  clinicalRepository: ClinicalRepository;
  transactionRunner: TransactionRunner;
  patientDietReader?: PatientDietReader;
  now?: () => string;
  idFactory?: () => string;
}

async function requireAccount(dependencies: ClinicalCommandDependencies) {
  try {
    return await dependencies.accountContext.requireActive();
  } catch (cause) {
    if (cause instanceof ClinicalApplicationError) throw cause;
    throw new ClinicalApplicationError('CLINICAL_CONTEXT_MISSING', 'Nenhuma Conta ativa está disponível.', { cause });
  }
}

async function getPatient(dependencies: ClinicalCommandDependencies, patientId: string) {
  const account = await requireAccount(dependencies);
  const patient = await dependencies.patientRepository.getById(account.accountId, patientId);
  if (!patient) throw new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
  return { account, patient };
}

function requireRepository(dependencies: ClinicalCommandDependencies): ClinicalRepository {
  if (!dependencies.clinicalRepository) {
    throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'A persistência clínica não está disponível neste runtime.');
  }
  return dependencies.clinicalRepository;
}

function toClinicalContext(patient: Awaited<ReturnType<typeof getPatient>>['patient']) {
  return {
    id: patient.id,
    accountId: patient.accountId,
    gender: patient.gender,
    heightCm: patient.heightCm,
    archivedAt: patient.archivedAt,
  };
}

function assertMutable(patient: Awaited<ReturnType<typeof getPatient>>['patient']): void {
  if (patient.archivedAt !== null) {
    throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
  }
}

async function buildConfirmedAssessment(
  dependencies: ClinicalCommandDependencies,
  patientId: string,
  input: AssessmentInput,
  existing?: BodyAssessment,
): Promise<BodyAssessment> {
  const { account, patient } = await getPatient(dependencies, patientId);
  assertMutable(patient);
  const repository = requireRepository(dependencies);
  const assessments = await repository.listAssessments(account.accountId, patientId);
  const requestedDate = normalizeClinicalDate(input.clinicalDate ?? input.date);
  const previous = latestAssessments(assessments.filter((assessment) =>
    assessment.id !== existing?.id && (!requestedDate || assessment.clinicalDate <= requestedDate),
  )).latestAssessment;
  const timestamp = dependencies.now ?? (() => new Date().toISOString());
  return buildBodyAssessment(input, {
    accountId: account.accountId,
    patientId,
    patient: toClinicalContext(patient),
    previousAssessment: previous,
    id: existing?.id ?? (dependencies.idFactory ?? (() => nanoid(16)))(),
    version: existing ? existing.version + 1 : 1,
    createdAt: existing?.createdAt,
    updatedAt: undefined,
    now: timestamp,
  });
}

export function createClinicalCommands(dependencies: ClinicalCommandDependencies) {
  const repository = () => requireRepository(dependencies);

  return {
    createAssessment: (patientId: string, input: AssessmentInput) => dependencies.transactionRunner.run(async () => {
      const assessment = await buildConfirmedAssessment(dependencies, patientId, input);
      const { account } = await getPatient(dependencies, patientId);
      return repository().createAssessment(account.accountId, patientId, assessment);
    }),

    updateAssessment: (patientId: string, assessmentId: string, expectedVersion: number, input: AssessmentInput) => dependencies.transactionRunner.run(async () => {
      const { account } = await getPatient(dependencies, patientId);
      const current = await repository().getAssessment(account.accountId, patientId, assessmentId);
      if (!current) throw new ClinicalApplicationError('CLINICAL_ASSESSMENT_NOT_FOUND', 'Avaliação não encontrada neste paciente.');
      if (current.accountId !== account.accountId || current.patientId !== patientId) {
        throw new ClinicalApplicationError('CLINICAL_SCOPE_VIOLATION', 'A avaliação não pertence ao escopo clínico informado.');
      }
      if (current.version !== expectedVersion) {
        throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'A avaliação foi alterada por outra operação. Recarregue antes de salvar.');
      }
      const assessment = await buildConfirmedAssessment(dependencies, patientId, input, current);
      return repository().updateAssessment(account.accountId, patientId, assessmentId, expectedVersion, assessment);
    }),

    getAssessment: async (patientId: string, assessmentId: string) => {
      const { account } = await getPatient(dependencies, patientId);
      const assessment = await repository().getAssessment(account.accountId, patientId, assessmentId);
      if (!assessment) throw new ClinicalApplicationError('CLINICAL_ASSESSMENT_NOT_FOUND', 'Avaliação não encontrada neste paciente.');
      return assessment;
    },

    listAssessments: async (patientId: string) => {
      const { account } = await getPatient(dependencies, patientId);
      return repository().listAssessments(account.accountId, patientId);
    },

    listAssessmentsPage: async (patientId: string, request: PageRequest = {}): Promise<PageResult<BodyAssessment>> => {
      const { account } = await getPatient(dependencies, patientId);
      return repository().listAssessmentsPage(account.accountId, patientId, request);
    },

    getNextFollowUp: async (patientId: string) => {
      const { account } = await getPatient(dependencies, patientId);
      return repository().getNextFollowUp(account.accountId, patientId);
    },

    setNextFollowUp: (patientId: string, expectedVersion: number | null, input: NextFollowUpInput) => dependencies.transactionRunner.run(async () => {
      const { account, patient } = await getPatient(dependencies, patientId);
      assertMutable(patient);
      const normalized = normalizeNextFollowUpInput(input);
      return repository().setNextFollowUp(account.accountId, patientId, expectedVersion, normalized);
    }),

    clearNextFollowUp: (patientId: string, expectedVersion: number) => dependencies.transactionRunner.run(async () => {
      const { account, patient } = await getPatient(dependencies, patientId);
      assertMutable(patient);
      return repository().clearNextFollowUp(account.accountId, patientId, expectedVersion);
    }),

    getConsultationView: async (patientId: string, date: string): Promise<ConsultationView> => {
      const normalizedDate = normalizeClinicalDate(date);
      if (!normalizedDate) throw new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', 'A data da consulta é inválida.');
      const { account, patient } = await getPatient(dependencies, patientId);
      const assessments = (await repository().listAssessments(account.accountId, patientId)).filter((assessment) => assessment.clinicalDate === normalizedDate);
      const diets = dependencies.patientDietReader
        ? (await dependencies.patientDietReader.listPreviousSources(account.accountId, patientId))
          .map(({ plan }) => plan)
          .filter((plan) => plan.activatedAt.slice(0, 10) === normalizedDate)
        : [];
      return {
        patient,
        date: normalizedDate,
        assessments,
        diets,
        notesState: 'EMPTY_NOT_PERSISTED',
        prescribedSupplements: [],
      };
    },
  };
}
