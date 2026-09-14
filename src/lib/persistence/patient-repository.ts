import type { Patient, PatientInput } from '@/lib/domain/patient';

export interface PatientRepository {
  create(accountId: string, input: PatientInput): Promise<Patient>;
  getById(accountId: string, patientId: string): Promise<Patient | null>;
  listActive(accountId: string): Promise<Patient[]>;
  update(accountId: string, patientId: string, expectedVersion: number, input: PatientInput): Promise<Patient>;
  archive(accountId: string, patientId: string, expectedVersion: number): Promise<Patient>;
  restore(accountId: string, patientId: string, expectedVersion: number): Promise<Patient>;
}
