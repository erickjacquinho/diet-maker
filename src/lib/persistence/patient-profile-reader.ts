import type { Patient } from '@/lib/domain/patient';

export interface PatientProfile {
  patient: Patient;
  initials: string;
  availableObjectives: string[];
  related: {
    dietCount: number;
    assessmentCount: number;
  };
}

export interface PatientListSummary {
  patient: Patient;
  initials: string;
  related: {
    dietCount: number;
    assessmentCount: number;
  };
}

export interface PatientProfileReader {
  getProfile(accountId: string, patientId: string): Promise<PatientProfile | null>;
  listActiveSummaries(accountId: string): Promise<PatientListSummary[]>;
}
