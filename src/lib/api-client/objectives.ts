import type { ObjectiveDto } from '@/lib/contracts/objectives';
import { apiRequest } from './client';

/** Client for the patient objective catalog. Not yet wired to the screens. */
export const objectivesApi = {
  list: () => apiRequest<{ items: ObjectiveDto[] }>('/api/v1/objectives'),
  add: (label: string) => apiRequest<ObjectiveDto>('/api/v1/objectives', { method: 'POST', body: { label } }),
  archive: (id: string) => apiRequest<Record<string, never>>(`/api/v1/objectives/${encodeURIComponent(id)}/archive`, { method: 'POST' }),
};
