import type { PatientInput } from '@/lib/domain/patient';
import type { PatientDto, PatientPageDto } from '@/lib/contracts/patients';
import { apiRequest } from './client';

/** Client for `/api/v1/patients`. Not yet wired to the screens: that happens when the last clinical module moves (F3). */
export const patientsApi = {
  create: (id: string, patient: PatientInput) =>
    apiRequest<PatientDto>('/api/v1/patients', { method: 'POST', body: { id, patient } }),
  search: (query: string, pageIndex: number, pageSize: number) =>
    apiRequest<PatientPageDto>('/api/v1/patients/search', { method: 'POST', body: { query, pageIndex, pageSize } }),
  get: (id: string) => apiRequest<PatientDto>(`/api/v1/patients/${encodeURIComponent(id)}`),
  update: (id: string, version: number, patient: PatientInput) =>
    apiRequest<PatientDto>(`/api/v1/patients/${encodeURIComponent(id)}`, { method: 'PATCH', version, body: { patient } }),
  archive: (id: string, version: number) =>
    apiRequest<PatientDto>(`/api/v1/patients/${encodeURIComponent(id)}/archive`, { method: 'POST', version }),
  restore: (id: string, version: number) =>
    apiRequest<PatientDto>(`/api/v1/patients/${encodeURIComponent(id)}/restore`, { method: 'POST', version }),
};

