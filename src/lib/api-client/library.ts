import type { CustomFoodInput } from '@/lib/domain/library/library-model';
import type { DietEditableDocument } from '@/lib/domain/diets/diet-model';
import type { FoodDto, ReadyDietDto } from '@/lib/contracts/library';
import { apiRequest } from './client';

const foodPath = (id: string) => `/api/v1/library/foods/${encodeURIComponent(id)}`;

/** Client for the account library (custom foods, ready diets). Not yet wired to the screens. */
export const libraryApi = {
  listFoods: (filter: { search?: string; includeArchived?: boolean } = {}) => {
    const params = new URLSearchParams();
    if (filter.search) params.set('search', filter.search);
    if (filter.includeArchived) params.set('includeArchived', 'true');
    const query = params.toString();
    return apiRequest<{ items: FoodDto[] }>(`/api/v1/library/foods${query ? `?${query}` : ''}`);
  },
  getFood: (id: string) => apiRequest<FoodDto>(foodPath(id)),
  createFood: (id: string, food: CustomFoodInput) =>
    apiRequest<FoodDto>('/api/v1/library/foods', { method: 'POST', body: { id, food } }),
  updateFood: (id: string, version: number, food: CustomFoodInput) =>
    apiRequest<FoodDto>(foodPath(id), { method: 'PATCH', version, body: { food } }),
  duplicateFood: (id: string, newId: string) =>
    apiRequest<FoodDto>(`${foodPath(id)}/duplicate`, { method: 'POST', body: { id: newId } }),
  archiveFood: (id: string, version: number) => apiRequest<FoodDto>(`${foodPath(id)}/archive`, { method: 'POST', version }),
  restoreFood: (id: string, version: number) => apiRequest<FoodDto>(`${foodPath(id)}/restore`, { method: 'POST', version }),
  deleteFood: (id: string, version: number) => apiRequest<{ deleted: true }>(foodPath(id), { method: 'DELETE', version }),
  listReadyDiets: () => apiRequest<{ items: ReadyDietDto[] }>('/api/v1/library/ready-diets'),
  createReadyDiet: (id: string, name: string, document: DietEditableDocument) =>
    apiRequest<ReadyDietDto>('/api/v1/library/ready-diets', { method: 'POST', body: { id, name, document } }),
};
