import type { Patient } from '@/lib/domain/patient';
import type { BodyAssessment, NextFollowUp } from '@/lib/domain/clinical';

export interface PatientActivity {
  eventDate: string;
  confirmedAt: string;
  type: 'assessment' | 'diet';
  sourceId: string;
}

export interface PatientClinicalSummary {
  assessmentCount: number;
  latestAssessment: BodyAssessment | null;
  previousAssessment: BodyAssessment | null;
  nextFollowUp: NextFollowUp | null;
  lastActivity: PatientActivity | null;
  hasDiet: boolean;
  dietCount: number;
}

export interface PatientClinicalProfile extends PatientClinicalSummary {
  assessments: BodyAssessment[];
}

export interface PatientProfile {
  patient: Patient;
  initials: string;
  availableObjectives: string[];
  related: {
    dietCount: number;
    assessmentCount: number;
  };
  clinical?: PatientClinicalProfile;
}

export interface PatientListSummary {
  patient: Patient;
  initials: string;
  related: {
    dietCount: number;
    assessmentCount: number;
  };
  clinical?: PatientClinicalSummary;
}

export interface PatientProfileReader {
  getProfile(accountId: string, patientId: string): Promise<PatientProfile | null>;
  listActiveSummaries(accountId: string): Promise<PatientListSummary[]>;
}
