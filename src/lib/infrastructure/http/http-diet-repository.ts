import { ApiClientError } from '@/lib/api-client/client';
import { dietsApi } from '@/lib/api-client/diets';
import { patientsApi } from '@/lib/api-client/patients';
import type { DietPlanDto } from '@/lib/contracts/diets';
import { toHistoricalDietView } from '@/lib/application/diets/diet-history-view';
import type { ConfirmActiveCommand, DietHistoryViewReader, DietRepository } from '@/lib/application/diets/diet-ports';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { ConfirmActiveResult, DietPlan } from '@/lib/domain/diets/diet-model';
import { normalizePageRequest, type PageRequest, type PageResult } from '@/lib/persistence/page';
import type { PatientActivity } from '@/lib/persistence/patient-profile-reader';
import type { HistoricalDiet } from '@/lib/patientsStoreTypes';
import { isApiStatus } from './errors';

const SUMMARY_BATCH = 25;

export const toDietPlan = (dto: DietPlanDto, accountId: string): DietPlan => ({ ...dto, accountId });

export function toDietError(error: unknown, fallback = 'A prescrição não pôde ser lida ou salva.'): DietDomainError {
  if (error instanceof DietDomainError) return error;
  if (error instanceof ApiClientError) {
    if (error.status === 404) return new DietDomainError('PATIENT_NOT_FOUND', 'Paciente ou prescrição não encontrado nesta Conta.', { cause: error.code });
    if (error.status === 409) return new DietDomainError('VERSION_CONFLICT', 'A prescrição vigente foi alterada antes da confirmação.', { cause: error.code });
    if (error.status === 422) return new DietDomainError('INVALID_DIET', 'A prescrição não pôde ser confirmada; revise o conteúdo ou o estado do paciente.', { cause: error.code });
  }
  return new DietDomainError('PERSISTENCE_UNAVAILABLE', fallback, { cause: error instanceof Error ? error.message : String(error) });
}

/**
 * Browser-side {@link DietRepository} over `/api/v1/patients/:id/diets`. Confirmation is one request: the server
 * validates the prescription, demotes the previous active diet and records the new one in a single transaction.
 */
export class HttpDietRepository implements DietRepository, DietHistoryViewReader {
  async getById(accountId: string, patientId: string, dietId: string): Promise<DietPlan | null> {
    try {
      return toDietPlan(await dietsApi.get(patientId, dietId), accountId);
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toDietError(error);
    }
  }

  /** Active diet first, then the newest activation (the server already orders them). */
  async listConfirmed(accountId: string, patientId: string): Promise<DietPlan[]> {
    try {
      return (await dietsApi.list(patientId)).items.map((dto) => toDietPlan(dto, accountId));
    } catch (error) {
      throw toDietError(error);
    }
  }

  async countConfirmed(accountId: string, patientId: string): Promise<number> {
    return (await this.listConfirmed(accountId, patientId)).length;
  }

  async confirmActive(command: ConfirmActiveCommand): Promise<ConfirmActiveResult> {
    if (command.plan.accountId !== command.accountId || command.plan.patientId !== command.patientId || command.plan.id !== command.targetDietId) {
      throw new DietDomainError('CONTEXT_MISSING', 'A prescrição não pertence ao contexto ativo.');
    }
    const { plan } = command;
    try {
      return await dietsApi.confirm(command.patientId, {
        dietId: command.targetDietId,
        ...(command.baseDietId ? { baseDietId: command.baseDietId, baseDietVersion: command.baseDietVersion } : {}),
        document: { name: plan.name, mode: plan.mode, weightReferenceKg: plan.weightReferenceKg, variations: plan.variations },
      } as Parameters<typeof dietsApi.confirm>[1]);
    } catch (error) {
      throw toDietError(error);
    }
  }

  /** Counts and last activity for several patients with one batched request per 25 patients. */
  async listPatientSummaries(_accountId: string, patientIds: readonly string[]): Promise<Record<string, { dietCount: number; assessmentCount: number; lastActivity: PatientActivity | null }>> {
    const result: Record<string, { dietCount: number; assessmentCount: number; lastActivity: PatientActivity | null }> =
      Object.fromEntries(patientIds.map((id) => [id, { dietCount: 0, assessmentCount: 0, lastActivity: null }]));
    for (let index = 0; index < patientIds.length; index += SUMMARY_BATCH) {
      try {
        for (const summary of (await patientsApi.summaries(patientIds.slice(index, index + SUMMARY_BATCH))).items) {
          // Mirrors the local reader: only a diet counts as "related activity"; assessments come from the clinical side.
          const diet = summary.lastActivity?.type === 'diet' ? summary.lastActivity : null;
          result[summary.patientId] = { dietCount: summary.dietCount, assessmentCount: 0, lastActivity: diet };
        }
      } catch (error) {
        throw toDietError(error);
      }
    }
    return result;
  }

  async listHistoryViews(accountId: string, patientId: string): Promise<HistoricalDiet[]> {
    return (await this.listConfirmed(accountId, patientId)).map((plan) => toHistoricalDietView({
      id: plan.id, version: plan.version, name: plan.name, mode: plan.mode, status: plan.status, activatedAt: plan.activatedAt,
      mealCount: plan.variations.reduce((total, variation) => total + variation.meals.length, 0),
      canEdit: plan.status === 'ACTIVE', canOpenReadOnly: true, canUseAsSource: true, canDelete: false, plan,
    }));
  }

  async listHistoryViewsPage(accountId: string, patientId: string, request: PageRequest = {}): Promise<PageResult<HistoricalDiet>> {
    const page = normalizePageRequest(request);
    const all = await this.listHistoryViews(accountId, patientId);
    return { ...page, total: all.length, items: all.slice(page.pageIndex * page.pageSize, (page.pageIndex + 1) * page.pageSize) };
  }
}
