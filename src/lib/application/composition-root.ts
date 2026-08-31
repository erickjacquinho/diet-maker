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

export interface PatientApplicationDependencies {
  accountContext: AccountContext;
  patientRepository: PatientRepository;
  objectiveCatalogRepository: ObjectiveCatalogRepository;
  patientProfileReader: PatientProfileReader;
  transactionRunner: TransactionRunner;
  dietDraftStore?: DietDraftStore;
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
}

export function createPatientApplication(dependencies: PatientApplicationDependencies): PatientApplication {
  const patientDeps = { accountContext: dependencies.accountContext, patientRepository: dependencies.patientRepository };
  const objectiveDeps = { accountContext: dependencies.accountContext, objectiveCatalogRepository: dependencies.objectiveCatalogRepository };
  const readerDeps = { accountContext: dependencies.accountContext, patientProfileReader: dependencies.patientProfileReader };

  return {
    createPatient: (input) => dependencies.transactionRunner.run(() => createPatient(patientDeps, input)),
    listActivePatients: (query) => listActivePatients(readerDeps, query),
    getPatientProfile: (patientId) => getPatientProfile(readerDeps, patientId),
    updatePatient: (patientId, expectedVersion, input) => dependencies.transactionRunner.run(() => updatePatient(patientDeps, patientId, expectedVersion, input)),
    addObjectiveOption: (label) => dependencies.transactionRunner.run(() => addObjectiveOption(objectiveDeps, label)),
    archiveObjectiveOption: (objectiveId) => dependencies.transactionRunner.run(() => archiveObjectiveOption(objectiveDeps, objectiveId)),
    archivePatient: async (patientId, expectedVersion) => {
      const patient = await dependencies.transactionRunner.run(() => archivePatient(patientDeps, patientId, expectedVersion));
      if (!dependencies.dietDraftStore) return patient;
      await dependencies.dietDraftStore.invalidateByPatient(patient.accountId, patient.id);
      return patient;
    },
    archivePatientAndInvalidate: async (patientId, expectedVersion) => {
      const patient = await dependencies.transactionRunner.run(() => archivePatient(patientDeps, patientId, expectedVersion));
      if (!dependencies.dietDraftStore) return { patient, status: 'ARCHIVED_AND_DRAFTS_INVALIDATED', invalidatedDrafts: 0 };
      try {
        const invalidatedDrafts = await dependencies.dietDraftStore.invalidateByPatient(patient.accountId, patient.id);
        return { patient, status: 'ARCHIVED_AND_DRAFTS_INVALIDATED', invalidatedDrafts };
      } catch {
        return { patient, status: 'ARCHIVED_CLEANUP_PENDING', invalidatedDrafts: 0 };
      }
    },
    restorePatient: (patientId, expectedVersion) => dependencies.transactionRunner.run(() => restorePatient(patientDeps, patientId, expectedVersion)),
  };
}
