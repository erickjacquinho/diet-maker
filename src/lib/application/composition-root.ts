import type { AccountContext } from '@/lib/persistence/account-context';
import type { ObjectiveCatalogRepository } from '@/lib/persistence/objective-catalog-repository';
import type { PatientProfile, PatientProfileReader, PatientListSummary } from '@/lib/persistence/patient-profile-reader';
import type { PatientRepository } from '@/lib/persistence/patient-repository';
import type { TransactionRunner } from '@/lib/persistence/transaction-runner';
import type { ObjectiveOption } from '@/lib/domain/objective-option';
import type { Patient, PatientInput } from '@/lib/domain/patient';
import { addObjectiveOption } from './patients/add-objective-option';
import { archiveObjectiveOption } from './patients/archive-objective-option';
import { archivePatient } from './patients/archive-patient';
import { createPatient } from './patients/create-patient';
import { getPatientProfile } from './patients/get-patient-profile';
import { listActivePatients } from './patients/list-active-patients';
import { restorePatient } from './patients/restore-patient';
import { updatePatient } from './patients/update-patient';
import type { DietDraftStore } from './diets/diet-ports';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import type { AssessmentInput, BodyAssessment, ConsultationView, NextFollowUp, NextFollowUpInput } from '@/lib/domain/clinical';
import { createClinicalCommands } from './patients/clinical-commands';

export interface PatientApplicationDependencies {
  accountContext: AccountContext;
  patientRepository: PatientRepository;
  objectiveCatalogRepository: ObjectiveCatalogRepository;
  patientProfileReader: PatientProfileReader;
  transactionRunner: TransactionRunner;
  dietDraftStore?: DietDraftStore;
  clinicalRepository?: ClinicalRepository;
  patientDietReader?: import('./diets/diet-ports').PatientDietReader;
  confirmedOperation?: ConfirmedOperationCoordinator;
  now?: () => string;
  idFactory?: () => string;
}

/** Coordinates an explicit domain mutation with the durable profile save. */
export interface ConfirmedOperationCoordinator {
  run<T>(operation: () => Promise<T>): Promise<T>;
}

export function createConfirmedOperationCoordinator(sync: () => Promise<void>): ConfirmedOperationCoordinator {
  return {
    async run<T>(operation: () => Promise<T>) {
      const result = await operation();
      await sync();
      return result;
    },
  };
}

export interface ArchivePatientResult {
  patient: Patient;
  status: 'ARCHIVED_AND_DRAFTS_INVALIDATED' | 'ARCHIVED_CLEANUP_PENDING';
  invalidatedDrafts: number;
}

export interface PatientApplication {
  createPatient(input: PatientInput): Promise<Patient>;
  listActivePatients(query?: string): Promise<PatientListSummary[]>;
  getPatientProfile(patientId: string): Promise<PatientProfile>;
  updatePatient(patientId: string, expectedVersion: number, input: PatientInput): Promise<Patient>;
  addObjectiveOption(label: string): Promise<ObjectiveOption>;
  archiveObjectiveOption(objectiveId: string): Promise<void>;
  archivePatient(patientId: string, expectedVersion: number): Promise<Patient>;
  restorePatient(patientId: string, expectedVersion: number): Promise<Patient>;
  archivePatientAndInvalidate(patientId: string, expectedVersion: number): Promise<ArchivePatientResult>;
  createAssessment(patientId: string, input: AssessmentInput): Promise<BodyAssessment>;
  updateAssessment(patientId: string, assessmentId: string, expectedVersion: number, input: AssessmentInput): Promise<BodyAssessment>;
  getAssessment(patientId: string, assessmentId: string): Promise<BodyAssessment>;
  listAssessments(patientId: string): Promise<BodyAssessment[]>;
  getNextFollowUp(patientId: string): Promise<NextFollowUp | null>;
  setNextFollowUp(patientId: string, expectedVersion: number | null, input: NextFollowUpInput): Promise<NextFollowUp>;
  clearNextFollowUp(patientId: string, expectedVersion: number): Promise<void>;
  getConsultationView(patientId: string, date: string): Promise<ConsultationView>;
}

export function createPatientApplication(dependencies: PatientApplicationDependencies): PatientApplication {
  const runConfirmed = <T>(operation: () => Promise<T>): Promise<T> => (
    dependencies.confirmedOperation ? dependencies.confirmedOperation.run(operation) : operation()
  );
  const patientDeps = { accountContext: dependencies.accountContext, patientRepository: dependencies.patientRepository };
  const objectiveDeps = { accountContext: dependencies.accountContext, objectiveCatalogRepository: dependencies.objectiveCatalogRepository };
  const readerDeps = { accountContext: dependencies.accountContext, patientProfileReader: dependencies.patientProfileReader };
  const clinicalCommands = createClinicalCommands({
    accountContext: dependencies.accountContext,
    patientRepository: dependencies.patientRepository,
    clinicalRepository: dependencies.clinicalRepository!,
    transactionRunner: dependencies.transactionRunner,
    patientDietReader: dependencies.patientDietReader,
    now: dependencies.now,
    idFactory: dependencies.idFactory,
  });

  return {
    createPatient: (input) => runConfirmed(() => dependencies.transactionRunner.run(() => createPatient(patientDeps, input))),
    listActivePatients: (query) => listActivePatients(readerDeps, query),
    getPatientProfile: (patientId) => getPatientProfile(readerDeps, patientId),
    updatePatient: (patientId, expectedVersion, input) => runConfirmed(() => dependencies.transactionRunner.run(() => updatePatient(patientDeps, patientId, expectedVersion, input))),
    addObjectiveOption: (label) => runConfirmed(() => dependencies.transactionRunner.run(() => addObjectiveOption(objectiveDeps, label))),
    archiveObjectiveOption: (objectiveId) => runConfirmed(() => dependencies.transactionRunner.run(() => archiveObjectiveOption(objectiveDeps, objectiveId))),
    archivePatient: (patientId, expectedVersion) => runConfirmed(async () => {
      const patient = await dependencies.transactionRunner.run(() => archivePatient(patientDeps, patientId, expectedVersion));
      if (!dependencies.dietDraftStore) return patient;
      await dependencies.dietDraftStore.invalidateByPatient(patient.accountId, patient.id);
      return patient;
    }),
    archivePatientAndInvalidate: (patientId, expectedVersion) => runConfirmed(async () => {
      const patient = await dependencies.transactionRunner.run(() => archivePatient(patientDeps, patientId, expectedVersion));
      if (!dependencies.dietDraftStore) return { patient, status: 'ARCHIVED_AND_DRAFTS_INVALIDATED', invalidatedDrafts: 0 as const };
      try {
        const invalidatedDrafts = await dependencies.dietDraftStore.invalidateByPatient(patient.accountId, patient.id);
        return { patient, status: 'ARCHIVED_AND_DRAFTS_INVALIDATED' as const, invalidatedDrafts };
      } catch {
        return { patient, status: 'ARCHIVED_CLEANUP_PENDING' as const, invalidatedDrafts: 0 };
      }
    }),
    restorePatient: (patientId, expectedVersion) => runConfirmed(() => dependencies.transactionRunner.run(() => restorePatient(patientDeps, patientId, expectedVersion))),
    createAssessment: (patientId, input) => runConfirmed(() => clinicalCommands.createAssessment(patientId, input)),
    updateAssessment: (patientId, assessmentId, expectedVersion, input) => runConfirmed(() => clinicalCommands.updateAssessment(patientId, assessmentId, expectedVersion, input)),
    getAssessment: clinicalCommands.getAssessment,
    listAssessments: clinicalCommands.listAssessments,
    getNextFollowUp: clinicalCommands.getNextFollowUp,
    setNextFollowUp: (patientId, expectedVersion, input) => runConfirmed(() => clinicalCommands.setNextFollowUp(patientId, expectedVersion, input)),
    clearNextFollowUp: (patientId, expectedVersion) => runConfirmed(() => clinicalCommands.clearNextFollowUp(patientId, expectedVersion)),
    getConsultationView: clinicalCommands.getConsultationView,
  };
}
