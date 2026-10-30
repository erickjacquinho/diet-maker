import type { AssessmentInput, NextFollowUpInput } from '@/lib/domain/clinical';
import type { AssessmentDto, FollowUpDto } from '@/lib/contracts/clinical';
import { apiRequest } from './client';

const patientPath = (patientId: string) => `/api/v1/patients/${encodeURIComponent(patientId)}`;

/** Client for assessments and next follow-up. Not yet wired to the screens (F3 switch happens last). */
export const clinicalApi = {
  listAssessments: (patientId: string) =>
    apiRequest<{ items: AssessmentDto[] }>(`${patientPath(patientId)}/assessments`),
  createAssessment: (patientId: string, id: string, assessment: AssessmentInput) =>
    apiRequest<AssessmentDto>(`${patientPath(patientId)}/assessments`, { method: 'POST', body: { id, assessment } }),
  getAssessment: (patientId: string, id: string) =>
    apiRequest<AssessmentDto>(`${patientPath(patientId)}/assessments/${encodeURIComponent(id)}`),
  updateAssessment: (patientId: string, id: string, version: number, assessment: AssessmentInput) =>
    apiRequest<AssessmentDto>(`${patientPath(patientId)}/assessments/${encodeURIComponent(id)}`, {
      method: 'PATCH', version, body: { assessment },
    }),
  getFollowUp: (patientId: string) =>
    apiRequest<{ followUp: FollowUpDto | null }>(`${patientPath(patientId)}/follow-up`),
  setFollowUp: (patientId: string, followUp: NextFollowUpInput, version?: number) =>
    apiRequest<FollowUpDto>(`${patientPath(patientId)}/follow-up`, { method: 'PUT', version, body: { followUp } }),
  clearFollowUp: (patientId: string, version: number) =>
    apiRequest<Record<string, never>>(`${patientPath(patientId)}/follow-up`, { method: 'DELETE', version }),
};
