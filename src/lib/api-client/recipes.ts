import type { ReadyMealDto, ReadyMealInputDto, RecipeDto, RecipeInputDto } from '@/lib/contracts/recipes';
import { apiRequest } from './client';

type Filter = { search?: string; includeArchived?: boolean };

function listPath(base: string, filter: Filter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.includeArchived) params.set('includeArchived', 'true');
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

const recipePath = (id: string) => `/api/v1/library/recipes/${encodeURIComponent(id)}`;
const mealPath = (id: string) => `/api/v1/library/ready-meals/${encodeURIComponent(id)}`;

/** Client for recipes and ready meals. Not yet wired to the screens. */
export const recipesApi = {
  list: (filter: Filter = {}) => apiRequest<{ items: RecipeDto[] }>(listPath('/api/v1/library/recipes', filter)),
  get: (id: string) => apiRequest<RecipeDto>(recipePath(id)),
  create: (id: string, recipe: RecipeInputDto) =>
    apiRequest<RecipeDto>('/api/v1/library/recipes', { method: 'POST', body: { id, recipe } }),
  update: (id: string, version: number, recipe: RecipeInputDto) =>
    apiRequest<RecipeDto>(recipePath(id), { method: 'PATCH', version, body: { recipe } }),
  duplicate: (id: string, newId: string) =>
    apiRequest<RecipeDto>(`${recipePath(id)}/duplicate`, { method: 'POST', body: { id: newId } }),
  archive: (id: string, version: number) => apiRequest<RecipeDto>(`${recipePath(id)}/archive`, { method: 'POST', version }),
  restore: (id: string, version: number) => apiRequest<RecipeDto>(`${recipePath(id)}/restore`, { method: 'POST', version }),
};

export const readyMealsApi = {
  list: (filter: Filter = {}) => apiRequest<{ items: ReadyMealDto[] }>(listPath('/api/v1/library/ready-meals', filter)),
  get: (id: string) => apiRequest<ReadyMealDto>(mealPath(id)),
  create: (id: string, readyMeal: ReadyMealInputDto) =>
    apiRequest<ReadyMealDto>('/api/v1/library/ready-meals', { method: 'POST', body: { id, readyMeal } }),
  update: (id: string, version: number, readyMeal: ReadyMealInputDto) =>
    apiRequest<ReadyMealDto>(mealPath(id), { method: 'PATCH', version, body: { readyMeal } }),
  duplicate: (id: string, newId: string) =>
    apiRequest<ReadyMealDto>(`${mealPath(id)}/duplicate`, { method: 'POST', body: { id: newId } }),
  archive: (id: string, version: number) => apiRequest<ReadyMealDto>(`${mealPath(id)}/archive`, { method: 'POST', version }),
  restore: (id: string, version: number) => apiRequest<ReadyMealDto>(`${mealPath(id)}/restore`, { method: 'POST', version }),
};
