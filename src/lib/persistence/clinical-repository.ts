import type {
  AssessmentPersistenceInput,
  BodyAssessment,
  NextFollowUp,
  NextFollowUpInput,
} from '@/lib/domain/clinical';
import type { PageRequest, PageResult } from './page';

export interface ClinicalRepository {
  getAssessment(accountId: string, patientId: string, assessmentId: string): Promise<BodyAssessment | null>;
  listAssessments(accountId: string, patientId: string): Promise<BodyAssessment[]>;
  listAssessmentsPage(accountId: string, patientId: string, request?: PageRequest): Promise<PageResult<BodyAssessment>>;
  listAssessmentsByPatients(accountId: string, patientIds: readonly string[]): Promise<Record<string, BodyAssessment[]>>;
  listAssessmentSummaries?(accountId: string, patientIds: readonly string[]): Promise<Record<string, { assessments: BodyAssessment[]; count: number }>>;
  createAssessment(accountId: string, patientId: string, assessment: BodyAssessment | AssessmentPersistenceInput): Promise<BodyAssessment>;
  updateAssessment(accountId: string, patientId: string, assessmentId: string, expectedVersion: number, assessment: BodyAssessment | AssessmentPersistenceInput): Promise<BodyAssessment>;
  getNextFollowUp(accountId: string, patientId: string): Promise<NextFollowUp | null>;
  listNextFollowUps(accountId: string, patientIds: readonly string[]): Promise<Record<string, NextFollowUp>>;
  setNextFollowUp(accountId: string, patientId: string, expectedVersion: number | null, input: NextFollowUpInput): Promise<NextFollowUp>;
  clearNextFollowUp(accountId: string, patientId: string, expectedVersion: number): Promise<void>;
}
