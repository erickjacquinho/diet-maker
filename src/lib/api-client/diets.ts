import type { ConfirmActiveResult, DietDraft } from '@/lib/domain/diets/diet-model';
import type { AutosaveResultDto, ConfirmDietRequest, DietDraftDto, DietPlanDto, PutDietDraftRequest } from '@/lib/contracts/diets';
import { apiRequest } from './client';

const base = (patientId: string) => `/api/v1/patients/${encodeURIComponent(patientId)}`;

/** Client for diets and drafts. Not yet wired to the screens (F3 switch happens last). */
export const dietsApi = {
  list: (patientId: string) => apiRequest<{ items: DietPlanDto[] }>(`${base(patientId)}/diets`),
  get: (patientId: string, dietId: string) =>
    apiRequest<DietPlanDto>(`${base(patientId)}/diets/${encodeURIComponent(dietId)}`),
  confirm: (patientId: string, request: ConfirmDietRequest) =>
    apiRequest<ConfirmActiveResult>(`${base(patientId)}/diets/confirm`, { method: 'POST', body: request }),
  getDraft: (patientId: string, routeId: string) =>
    apiRequest<{ draft: DietDraftDto | null }>(`${base(patientId)}/diet-drafts/${encodeURIComponent(routeId)}`),
  putDraft: (patientId: string, routeId: string, request: PutDietDraftRequest) =>
    apiRequest<AutosaveResultDto>(`${base(patientId)}/diet-drafts/${encodeURIComponent(routeId)}`, { method: 'PUT', body: request }),
  discardDraft: (patientId: string, routeId: string) =>
    apiRequest<Record<string, never>>(`${base(patientId)}/diet-drafts/${encodeURIComponent(routeId)}`, { method: 'DELETE' }),
};

export type { DietDraft };
