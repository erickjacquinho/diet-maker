import type { Patient, PatientInput } from '@/lib/domain/patient';
import type { PageRequest, PageResult } from './page';

export interface PatientPageQuery extends PageRequest {
  query: string;
  today: string;
}

export interface PatientRepository {
  create(accountId: string, input: PatientInput): Promise<Patient>;
  getById(accountId: string, patientId: string): Promise<Patient | null>;
  listActive(accountId: string): Promise<Patient[]>;
  listActivePage(accountId: string, query: PatientPageQuery): Promise<PageResult<Patient>>;
  update(accountId: string, patientId: string, expectedVersion: number, input: PatientInput): Promise<Patient>;
  archive(accountId: string, patientId: string, expectedVersion: number): Promise<Patient>;
  restore(accountId: string, patientId: string, expectedVersion: number): Promise<Patient>;
}
