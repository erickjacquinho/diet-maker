import { beforeEach, describe, expect, it, vi } from 'vitest';

const dietsApi = vi.hoisted(() => ({
  list: vi.fn(), get: vi.fn(), confirm: vi.fn(), getDraft: vi.fn(), putDraft: vi.fn(), discardDraft: vi.fn(),
  listPatientDrafts: vi.fn(), listAccountDrafts: vi.fn(),
}));
const patientsApi = vi.hoisted(() => ({ summaries: vi.fn() }));
const libraryApi = vi.hoisted(() => ({
  getFood: vi.fn(), listFoods: vi.fn(), createFood: vi.fn(), updateFood: vi.fn(), duplicateFood: vi.fn(), archiveFood: vi.fn(),
  restoreFood: vi.fn(), listReadyDiets: vi.fn(), createReadyDiet: vi.fn(),
}));
const recipesApi = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), duplicate: vi.fn(), archive: vi.fn(), restore: vi.fn() }));
const readyMealsApi = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), duplicate: vi.fn(), archive: vi.fn(), restore: vi.fn() }));
vi.mock('@/lib/api-client/diets', () => ({ dietsApi }));
vi.mock('@/lib/api-client/patients', () => ({ patientsApi }));
vi.mock('@/lib/api-client/library', () => ({ libraryApi }));
vi.mock('@/lib/api-client/recipes', () => ({ recipesApi, readyMealsApi }));

import { ApiClientError } from '@/lib/api-client/client';
import { HttpDietRepository } from '@/lib/infrastructure/http/http-diet-repository';
import { HttpDietDraftStore } from '@/lib/infrastructure/http/http-diet-draft-store';
import {
  HttpFoodCatalogRepository,
  HttpReadyDietRepository,
  HttpReadyMealRepository,
  HttpRecipeRepository,
} from '@/lib/infrastructure/http/http-library-repositories';

const ACCOUNT = 'acc';
const PATIENT = 'p1';
const nutrients = { protein: '10', carbs: '20', fat: '5', fiber: '2', energyKcal: '185' };
const snapshot = (sourceId: string) => ({
  sourceType: 'SYSTEM_TACO', sourceId, sourceVersion: '1', displayName: 'Arroz', description: '', measurementBasis: 'PER_100G', foodState: 'COOKED',
  referenceQuantity: '100', referenceUnit: 'g', referenceNutrients: nutrients, prescribedQuantity: '100', prescribedUnit: 'g', prescribedNutrients: nutrients,
  energySource: 'REFERENCE', calculationVersion: 'v', conversionSnapshot: {}, compositionSnapshot: {},
});
const planDto = (id: string, status: 'ACTIVE' | 'SNAPSHOT', activatedAt: string, version = 1) => ({
  id, patientId: PATIENT, name: `Dieta ${id}`, mode: 'SIMPLE', status, version, createdAt: activatedAt, updatedAt: activatedAt, activatedAt, supersededAt: null,
  variations: [{
    id: 'v1', position: 0, kind: 'SIMPLE', name: 'Base', inputMode: 'GRAMS', assignedDays: [], targets: { protein: '120', carbs: '250', fat: '60', energyKcal: '2000' },
    meals: [{ id: 'm1', position: 0, name: 'Almoço', options: [{ id: 'o1', position: 0, label: 'A', countsTowardTotals: true, items: [{ id: 'i1', position: 0, role: 'PRIMARY', name: 'Arroz', snapshot: snapshot('taco-1') }] }] }],
  }],
});
const draftDto = (extra: Record<string, unknown> = {}) => ({
  draftId: 'd1', patientId: PATIENT, routeDietId: 'nova', payloadSchemaVersion: 1, draftRevision: 2, state: 'EDITABLE',
  payload: { name: 'Rascunho', mode: 'SIMPLE', variations: [] }, createdAt: 'a', updatedAt: 'b', ...extra,
});

beforeEach(() => vi.clearAllMocks());

describe('HttpDietRepository', () => {
  const repo = new HttpDietRepository();

  it('reads plans with the account label and maps 404 to null', async () => {
    dietsApi.get.mockResolvedValueOnce(planDto('d1', 'ACTIVE', '2026-03-01T00:00:00.000Z'));
    expect(await repo.getById(ACCOUNT, PATIENT, 'd1')).toMatchObject({ id: 'd1', accountId: ACCOUNT });
    dietsApi.get.mockRejectedValueOnce(new ApiClientError(404, 'NOT_FOUND'));
    expect(await repo.getById(ACCOUNT, PATIENT, 'x')).toBeNull();
    dietsApi.list.mockResolvedValue({ items: [planDto('a', 'ACTIVE', '2026-03-01T00:00:00.000Z'), planDto('b', 'SNAPSHOT', '2026-01-01T00:00:00.000Z')] });
    expect(await repo.countConfirmed(ACCOUNT, PATIENT)).toBe(2);
  });

  it('confirms a plan in one request and translates conflicts', async () => {
    const plan = { ...planDto('d2', 'ACTIVE', '2026-03-01T00:00:00.000Z'), accountId: ACCOUNT } as never;
    dietsApi.confirm.mockResolvedValue({ status: 'COMMITTED_UPDATE', planId: 'd2', version: 2 });
    const command = { accountId: ACCOUNT, patientId: PATIENT, targetDietId: 'd2', baseDietId: 'd2', baseDietVersion: 1, draftId: 'x', confirmedDraftRevision: 3, plan };
    expect(await repo.confirmActive(command)).toEqual({ status: 'COMMITTED_UPDATE', planId: 'd2', version: 2 });
    expect(dietsApi.confirm).toHaveBeenCalledWith(PATIENT, expect.objectContaining({ dietId: 'd2', baseDietId: 'd2', baseDietVersion: 1, document: expect.objectContaining({ name: 'Dieta d2' }) }));
    const document = dietsApi.confirm.mock.calls[0][1].document;
    expect(document).not.toHaveProperty('accountId');
    dietsApi.confirm.mockRejectedValueOnce(new ApiClientError(409, 'VERSION_CONFLICT'));
    await expect(repo.confirmActive(command)).rejects.toMatchObject({ name: 'DietDomainError', code: 'VERSION_CONFLICT' });
    dietsApi.confirm.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.confirmActive({ ...command, baseDietId: undefined })).rejects.toMatchObject({ code: 'INVALID_DIET' });
    dietsApi.confirm.mockRejectedValueOnce(new TypeError('network'));
    await expect(repo.confirmActive(command)).rejects.toMatchObject({ code: 'PERSISTENCE_UNAVAILABLE' });
    await expect(repo.confirmActive({ ...command, patientId: 'other' })).rejects.toMatchObject({ code: 'CONTEXT_MISSING' });
  });

  it('builds the history views and pages them locally', async () => {
    dietsApi.list.mockResolvedValue({ items: [planDto('a', 'ACTIVE', '2026-03-01T00:00:00.000Z'), planDto('b', 'SNAPSHOT', '2026-01-01T00:00:00.000Z'), planDto('c', 'SNAPSHOT', '2025-12-01T00:00:00.000Z')] });
    const views = await repo.listHistoryViews(ACCOUNT, PATIENT);
    expect(views.map((view) => [view.id, view.status])).toEqual([['a', 'Ativa'], ['b', 'Histórica'], ['c', 'Histórica']]);
    expect(views[0].proteinG).toBe(10);
    const page = await repo.listHistoryViewsPage(ACCOUNT, PATIENT, { pageIndex: 1, pageSize: 2 });
    expect(page).toMatchObject({ total: 3, pageIndex: 1 });
    expect(page.items.map((view) => view.id)).toEqual(['c']);
  });

  it('summarizes diet counts and diet activity in batches, defaulting missing patients', async () => {
    patientsApi.summaries.mockResolvedValue({ items: [
      { patientId: 'p1', dietCount: 2, assessmentCount: 5, lastActivity: { eventDate: '2026-03-01', confirmedAt: 'c', type: 'diet', sourceId: 'd1' }, latestAssessment: null, previousAssessment: null, nextFollowUp: null },
      { patientId: 'p2', dietCount: 0, assessmentCount: 1, lastActivity: { eventDate: '2026-03-02', confirmedAt: 'c', type: 'assessment', sourceId: 'a1' }, latestAssessment: null, previousAssessment: null, nextFollowUp: null },
    ] });
    const summaries = await repo.listPatientSummaries(ACCOUNT, ['p1', 'p2', 'p3']);
    expect(summaries.p1).toMatchObject({ dietCount: 2, lastActivity: { type: 'diet', sourceId: 'd1' } });
    expect(summaries.p2.lastActivity).toBeNull();
    expect(summaries.p3).toEqual({ dietCount: 0, assessmentCount: 0, lastActivity: null });
  });
});

describe('HttpDietDraftStore', () => {
  const context = { accountId: ACCOUNT, patientId: PATIENT, routeDietId: 'nova' };
  const draft = (extra: Record<string, unknown> = {}) => ({ ...draftDto(), accountId: ACCOUNT, contextKey: 'k', draftRevision: 1, ...extra }) as never;

  it('creates a draft once per context and refuses a second one', async () => {
    const store = new HttpDietDraftStore();
    dietsApi.getDraft.mockResolvedValueOnce({ draft: null }).mockResolvedValueOnce({ draft: draftDto({ draftRevision: 1 }) });
    dietsApi.putDraft.mockResolvedValue({ status: 'SAVED', revision: 1, updatedAt: 'now' });
    const created = await store.create(draft(), context);
    expect(created).toMatchObject({ draftId: 'd1', accountId: ACCOUNT, contextKey: `${ACCOUNT}|${PATIENT}|nova` });
    expect(dietsApi.putDraft).toHaveBeenCalledWith(PATIENT, 'nova', expect.objectContaining({ draftId: 'd1', draftRevision: 1 }));
    dietsApi.getDraft.mockResolvedValueOnce({ draft: draftDto() });
    await expect(store.create(draft(), context)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
  });

  it('addresses drafts by ID only after it has seen where they live', async () => {
    const store = new HttpDietDraftStore();
    expect(await store.get('d1')).toBeNull();
    expect(await store.putIfNewer(draft(), 1)).toEqual({ status: 'SUPERSEDED', currentRevision: 0 });
    dietsApi.getDraft.mockResolvedValue({ draft: draftDto() });
    expect(await store.getByContext(ACCOUNT, PATIENT, 'nova')).toMatchObject({ draftId: 'd1', accountId: ACCOUNT });
    expect(await store.get('d1')).toMatchObject({ draftRevision: 2 });
  });

  it('autosaves with previous revision + 1 and passes server verdicts through', async () => {
    const store = new HttpDietDraftStore();
    dietsApi.getDraft.mockResolvedValue({ draft: draftDto() });
    await store.getByContext(ACCOUNT, PATIENT, 'nova');
    dietsApi.putDraft.mockResolvedValueOnce({ status: 'SAVED', revision: 3, updatedAt: 'now' });
    expect(await store.putIfNewer(draft({ draftRevision: 3 }), 2)).toMatchObject({ status: 'SAVED', revision: 3 });
    expect(dietsApi.putDraft).toHaveBeenLastCalledWith(PATIENT, 'nova', expect.objectContaining({ draftRevision: 3 }));
    dietsApi.putDraft.mockResolvedValueOnce({ status: 'SUPERSEDED', currentRevision: 5 });
    expect(await store.putIfNewer(draft({ draftRevision: 3 }), 2)).toEqual({ status: 'SUPERSEDED', currentRevision: 5 });
    dietsApi.putDraft.mockResolvedValueOnce({ status: 'INVALIDATED' });
    expect(await store.putIfNewer(draft(), 2)).toEqual({ status: 'INVALIDATED' });
  });

  it('reserves the target ID, then removes only the expected revision', async () => {
    const store = new HttpDietDraftStore();
    dietsApi.getDraft.mockResolvedValue({ draft: draftDto() });
    await store.getByContext(ACCOUNT, PATIENT, 'nova');
    dietsApi.putDraft.mockResolvedValue({ status: 'SAVED', revision: 2, updatedAt: 'now' });
    expect(await store.reserveTargetId('d1', 2, 'diet-9')).toMatchObject({ targetDietId: 'diet-9' });
    expect(dietsApi.putDraft).toHaveBeenLastCalledWith(PATIENT, 'nova', expect.objectContaining({ targetDietId: 'diet-9', draftRevision: 2 }));
    await expect(store.reserveTargetId('d1', 1, 'diet-9')).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    dietsApi.getDraft.mockResolvedValue({ draft: draftDto({ targetDietId: 'diet-1' }) });
    await expect(store.reserveTargetId('d1', 2, 'diet-9')).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    dietsApi.getDraft.mockResolvedValue({ draft: draftDto({ state: 'INVALIDATED_BY_PATIENT_ARCHIVE' }) });
    await expect(store.reserveTargetId('d1', 2, 'diet-9')).rejects.toMatchObject({ code: 'ARCHIVED_PATIENT' });

    dietsApi.getDraft.mockResolvedValue({ draft: draftDto() });
    expect(await store.removeIfRevision('d1', 1)).toBe(false);
    expect(dietsApi.discardDraft).not.toHaveBeenCalled();
    expect(await store.removeIfRevision('d1', 2)).toBe(true);
    expect(dietsApi.discardDraft).toHaveBeenCalledWith(PATIENT, 'nova');
    expect(await store.get('d1')).toBeNull();
  });

  it('lists recoverable drafts and leaves invalidation to the server', async () => {
    const store = new HttpDietDraftStore();
    dietsApi.listPatientDrafts.mockResolvedValue({ drafts: [draftDto()] });
    dietsApi.listAccountDrafts.mockResolvedValue({ drafts: [draftDto(), draftDto({ draftId: 'd2', patientId: 'p2' })] });
    expect(await store.listRecoverableByPatient(ACCOUNT, PATIENT)).toHaveLength(1);
    expect(await store.listRecoverableByAccount(ACCOUNT)).toHaveLength(2);
    expect(await store.get('d2')).toBeNull(); // not found because the mocked server no longer has it under its route
    expect(await store.invalidateByPatient()).toBe(0);
  });
});

describe('library repositories', () => {
  const foodDto = (extra: Record<string, unknown> = {}) => ({
    id: 'f1', sourceType: 'ACCOUNT_CUSTOM', name: 'Whey', description: '', measurementBasis: 'PER_100G', foodState: 'AS_SOLD',
    referenceNutrients: { protein: '80', carbs: '5', fat: '4', fiber: '0' }, energySource: 'REFERENCE', calculationVersion: 'v', status: 'ACTIVE', version: 1,
    createdAt: 'a', updatedAt: 'b', archivedAt: null, ...extra,
  });

  it('creates foods with a UUID, maps errors and archives instead of deleting', async () => {
    const repo = new HttpFoodCatalogRepository(() => 'new-food');
    libraryApi.createFood.mockImplementation(async (id: string) => foodDto({ id }));
    expect(await repo.create(ACCOUNT, { name: 'Whey' } as never)).toMatchObject({ id: 'new-food', accountId: ACCOUNT });
    libraryApi.getFood.mockRejectedValueOnce(new ApiClientError(404, 'NOT_FOUND'));
    expect(await repo.getById(ACCOUNT, 'x')).toBeNull();
    libraryApi.updateFood.mockRejectedValueOnce(new ApiClientError(409, 'VERSION_CONFLICT'));
    await expect(repo.update(ACCOUNT, 'f1', 1, {} as never)).rejects.toMatchObject({ code: 'LIBRARY_VERSION_CONFLICT' });
    libraryApi.createFood.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.create(ACCOUNT, {} as never)).rejects.toMatchObject({ code: 'LIBRARY_VALIDATION_FAILED' });
    libraryApi.archiveFood.mockResolvedValue(foodDto({ status: 'ARCHIVED', version: 2 }));
    expect(await repo.deleteIfUnreferenced(ACCOUNT, 'f1', 1)).toBe(true);
    expect(libraryApi.archiveFood).toHaveBeenCalledWith('f1', 1);
    libraryApi.listFoods.mockResolvedValue({ items: [foodDto()] });
    expect(await repo.list(ACCOUNT, { search: 'w', includeArchived: true })).toHaveLength(1);
    expect(libraryApi.listFoods).toHaveBeenCalledWith({ search: 'w', includeArchived: true });
  });

  it('gives recipe ingredients and ready-meal items stable synthetic identities', async () => {
    const recipe = {
      id: 'r1', name: 'Arroz', category: 'Almoço', instructions: '', yieldPortions: '2', yieldUnit: 'PORTION', nutrition: { total: nutrients, perPortion: nutrients },
      status: 'ACTIVE', version: 1, createdAt: 'a', updatedAt: 'b', archivedAt: null,
      ingredients: [{ position: 0, sourceType: 'SYSTEM_TACO', sourceId: 'taco-1', sourceVersion: '1', quantity: '100', unit: 'g', ingredientSnapshot: snapshot('taco-1') }],
    };
    recipesApi.get.mockResolvedValue(recipe);
    expect((await new HttpRecipeRepository().getById(ACCOUNT, 'r1'))!.ingredients[0]).toMatchObject({ id: 'r1:0', recipeId: 'r1', accountId: ACCOUNT });
    recipesApi.archive.mockResolvedValue({ ...recipe, status: 'ARCHIVED' });
    expect(await new HttpRecipeRepository().deleteIfUnreferenced(ACCOUNT, 'r1', 1)).toBe(true);

    const meal = {
      id: 'm1', name: 'Almoço', description: '', status: 'ACTIVE', version: 1, createdAt: 'a', updatedAt: 'b', archivedAt: null,
      items: [{ position: 0, sourceType: 'FOOD', sourceId: 'taco-1', sourceVersion: '1', quantity: '100', unit: 'g', itemSnapshot: snapshot('taco-1') }],
    };
    readyMealsApi.list.mockResolvedValue({ items: [meal] });
    expect((await new HttpReadyMealRepository().list(ACCOUNT))[0].items[0]).toMatchObject({ id: 'm1:0', readyMealId: 'm1' });
    readyMealsApi.duplicate.mockRejectedValueOnce(new ApiClientError(404, 'NOT_FOUND'));
    await expect(new HttpReadyMealRepository().duplicate(ACCOUNT, 'x')).rejects.toMatchObject({ code: 'LIBRARY_NOT_FOUND' });
  });

  it('creates and lists ready diets', async () => {
    const repo = new HttpReadyDietRepository(() => 'rd-1');
    const document = { name: 'Pronta', mode: 'SIMPLE', variations: [] };
    libraryApi.createReadyDiet.mockImplementation(async (id: string, name: string) => ({ id, name, document, version: 1, createdAt: 'a', updatedAt: 'b' }));
    expect(await repo.create(ACCOUNT, { name: 'Pronta', document } as never)).toMatchObject({ id: 'rd-1', accountId: ACCOUNT });
    libraryApi.listReadyDiets.mockRejectedValueOnce(new TypeError('offline'));
    await expect(repo.list(ACCOUNT)).rejects.toMatchObject({ code: 'LIBRARY_TRANSACTION_FAILED' });
  });
});
