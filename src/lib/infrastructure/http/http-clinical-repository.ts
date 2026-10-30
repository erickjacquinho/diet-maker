import type { AssessmentDto, FollowUpDto } from '@/lib/contracts/clinical';
import { clinicalApi } from '@/lib/api-client/clinical';
import { patientsApi } from '@/lib/api-client/patients';
import {
  sortAssessments,
  type AssessmentInput,
  type AssessmentPersistenceInput,
  type BodyAssessment,
  type NextFollowUp,
  type NextFollowUpDateChange,
  type NextFollowUpDateMove,
  type NextFollowUpInput,
} from '@/lib/domain/clinical';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import { normalizePageRequest, type PageRequest, type PageResult } from '@/lib/persistence/page';
import { isApiStatus, toClinicalError } from './errors';

const MEASUREMENTS = [
  'weightKg', 'waistCm', 'scapulaCm', 'bustCm', 'abdomenCm', 'hipCm', 'leftProximalThighCm', 'rightProximalThighCm', 'neckCm',
  'leftArmCm', 'rightArmCm', 'leftDistalThighCm', 'rightDistalThighCm', 'leftCalfCm', 'rightCalfCm',
] as const;
const SUMMARY_BATCH = 25;

export const toAssessment = (dto: AssessmentDto, accountId: string): BodyAssessment => ({ ...dto, accountId });
export const toFollowUp = (dto: FollowUpDto, accountId: string): NextFollowUp => ({ ...dto, accountId });

/**
 * The domain builds the assessment (body composition, autofill) before persisting it, but the server recomputes the
 * same result from the raw input. So only what the professional typed is sent: autofilled fields are left out and the
 * server fills them again from the previous assessment.
 */
export function assessmentToInput(assessment: BodyAssessment | AssessmentPersistenceInput): AssessmentInput {
  const autofilled = new Set(assessment.autoFilledFields ?? []);
  const input: Record<string, unknown> = { clinicalDate: assessment.clinicalDate };
  if (assessment.assessmentType) input.assessmentType = assessment.assessmentType;
  for (const key of MEASUREMENTS) {
    const value = assessment[key];
    if (typeof value === 'number' && !autofilled.has(key)) input[key] = value;
  }
  const snapshot = assessment.calculationInputSnapshot as { heightCm?: number } | undefined;
  if (assessment.assessmentType === 'simplified' && typeof snapshot?.heightCm === 'number') input.heightCm = snapshot.heightCm;
  return input as AssessmentInput;
}

function chunk<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

export class HttpClinicalRepository implements ClinicalRepository {
  constructor(private readonly idFactory: () => string = () => crypto.randomUUID()) {}

  async getAssessment(accountId: string, patientId: string, assessmentId: string): Promise<BodyAssessment | null> {
    try {
      return toAssessment(await clinicalApi.getAssessment(patientId, assessmentId), accountId);
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toClinicalError(error, 'A avaliação não pôde ser lida.');
    }
  }

  async listAssessments(accountId: string, patientId: string): Promise<BodyAssessment[]> {
    try {
      return sortAssessments((await clinicalApi.listAssessments(patientId)).items.map((dto) => toAssessment(dto, accountId)));
    } catch (error) {
      throw toClinicalError(error, 'As avaliações não puderam ser lidas.');
    }
  }

  async listAssessmentsPage(accountId: string, patientId: string, request: PageRequest = {}): Promise<PageResult<BodyAssessment>> {
    const page = normalizePageRequest(request);
    const all = await this.listAssessments(accountId, patientId);
    return { ...page, total: all.length, items: all.slice(page.pageIndex * page.pageSize, (page.pageIndex + 1) * page.pageSize) };
  }

  async listAssessmentsByPatients(accountId: string, patientIds: readonly string[]): Promise<Record<string, BodyAssessment[]>> {
    const entries = await Promise.all(patientIds.map(async (id) => [id, await this.listAssessments(accountId, id)] as const));
    return Object.fromEntries(entries);
  }

  /** One batched request per 25 patients instead of one per patient. */
  async listAssessmentSummaries(accountId: string, patientIds: readonly string[]): Promise<Record<string, { assessments: BodyAssessment[]; count: number }>> {
    const result: Record<string, { assessments: BodyAssessment[]; count: number }> = Object.fromEntries(patientIds.map((id) => [id, { assessments: [], count: 0 }]));
    try {
      for (const ids of chunk(patientIds, SUMMARY_BATCH)) {
        for (const summary of (await patientsApi.summaries(ids)).items) {
          const assessments = [summary.latestAssessment, summary.previousAssessment]
            .filter((dto): dto is AssessmentDto => dto !== null).map((dto) => toAssessment(dto, accountId));
          result[summary.patientId] = { assessments, count: summary.assessmentCount };
        }
      }
    } catch (error) {
      throw toClinicalError(error, 'O resumo das avaliações não pôde ser lido.');
    }
    return result;
  }

  async createAssessment(accountId: string, patientId: string, assessment: BodyAssessment | AssessmentPersistenceInput): Promise<BodyAssessment> {
    try {
      return toAssessment(await clinicalApi.createAssessment(patientId, assessment.id ?? this.idFactory(), assessmentToInput(assessment)), accountId);
    } catch (error) {
      throw toClinicalError(error, 'A avaliação não pôde ser salva.');
    }
  }

  async updateAssessment(accountId: string, patientId: string, assessmentId: string, expectedVersion: number, assessment: BodyAssessment | AssessmentPersistenceInput): Promise<BodyAssessment> {
    try {
      return toAssessment(await clinicalApi.updateAssessment(patientId, assessmentId, expectedVersion, assessmentToInput(assessment)), accountId);
    } catch (error) {
      throw toClinicalError(error, 'A avaliação não pôde ser atualizada.');
    }
  }

  async getNextFollowUp(accountId: string, patientId: string): Promise<NextFollowUp | null> {
    try {
      const { followUp } = await clinicalApi.getFollowUp(patientId);
      return followUp ? toFollowUp(followUp, accountId) : null;
    } catch (error) {
      throw toClinicalError(error, 'O acompanhamento não pôde ser lido.');
    }
  }

  async listNextFollowUps(accountId: string, patientIds: readonly string[]): Promise<Record<string, NextFollowUp>> {
    const result: Record<string, NextFollowUp> = {};
    try {
      for (const ids of chunk(patientIds, SUMMARY_BATCH)) {
        for (const summary of (await patientsApi.summaries(ids)).items) {
          if (summary.nextFollowUp) result[summary.patientId] = toFollowUp(summary.nextFollowUp, accountId);
        }
      }
    } catch (error) {
      throw toClinicalError(error, 'Os acompanhamentos não puderam ser lidos.');
    }
    return result;
  }

  async moveNextFollowUps(accountId: string, changes: readonly NextFollowUpDateChange[]): Promise<NextFollowUpDateMove[]> {
    if (changes.length === 0) return [];
    try {
      const { moves } = await clinicalApi.moveFollowUps(changes.map((change) => ({
        patientId: change.patientId, types: [...change.types], expectedVersion: change.expectedVersion, dueDate: change.dueDate,
      })));
      return moves.map((move) => ({ before: toFollowUp(move.before, accountId), after: toFollowUp(move.after, accountId) }));
    } catch (error) {
      throw toClinicalError(error, 'Os acompanhamentos não puderam ser movidos; nada foi alterado.');
    }
  }

  async setNextFollowUp(accountId: string, patientId: string, expectedVersion: number | null, input: NextFollowUpInput): Promise<NextFollowUp> {
    try {
      return toFollowUp(await clinicalApi.setFollowUp(patientId, input, expectedVersion ?? undefined), accountId);
    } catch (error) {
      throw toClinicalError(error, 'O acompanhamento não pôde ser confirmado; o valor anterior foi preservado.');
    }
  }

  async clearNextFollowUp(_accountId: string, patientId: string, expectedVersion: number): Promise<void> {
    try {
      await clinicalApi.clearFollowUp(patientId, expectedVersion);
    } catch (error) {
      throw toClinicalError(error, 'O acompanhamento não pôde ser removido; o valor confirmado foi preservado.');
    }
  }
}
