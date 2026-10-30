import { beforeEach, describe, expect, it, vi } from 'vitest';

const patientsApi = vi.hoisted(() => ({ create: vi.fn(), get: vi.fn(), search: vi.fn(), update: vi.fn(), archive: vi.fn(), restore: vi.fn(), summaries: vi.fn() }));
const objectivesApi = vi.hoisted(() => ({ list: vi.fn(), add: vi.fn(), archive: vi.fn() }));
const clinicalApi = vi.hoisted(() => ({
  listAssessments: vi.fn(), createAssessment: vi.fn(), getAssessment: vi.fn(), updateAssessment: vi.fn(),
  getFollowUp: vi.fn(), setFollowUp: vi.fn(), moveFollowUps: vi.fn(), clearFollowUp: vi.fn(),
}));
vi.mock('@/lib/api-client/patients', () => ({ patientsApi }));
vi.mock('@/lib/api-client/objectives', () => ({ objectivesApi }));
vi.mock('@/lib/api-client/clinical', () => ({ clinicalApi }));

import { ApiClientError } from '@/lib/api-client/client';
import { HttpPatientRepository } from '@/lib/infrastructure/http/http-patient-repository';
import { HttpObjectiveCatalogRepository } from '@/lib/infrastructure/http/http-objective-catalog-repository';
import { assessmentToInput, HttpClinicalRepository } from '@/lib/infrastructure/http/http-clinical-repository';

const ACCOUNT = 'account-1';
const patientDto = (id: string, extra: Record<string, unknown> = {}) => ({
  id, displayCode: 'P-0001', name: 'Maria', age: 35, gender: 'Feminino', birthDate: '1990-05-10', isPregnant: false, pregnancyDueDate: null,
  heightCm: 165, weightKg: 62, maritalStatus: null, phone: null, whatsapp: null, currentObjective: null,
  defaultMacroTargets: { proteinG: null, carbsG: null, fatsG: null, kcal: null }, createdAt: 'a', updatedAt: 'b', version: 1, archivedAt: null, ...extra,
});
const assessmentDto = (id: string, clinicalDate: string, extra: Record<string, unknown> = {}) => ({
  id, patientId: 'p1', clinicalDate, assessmentType: 'complete', weightKg: 70, autoFilledFields: [], calculationMethod: 'US_NAVY',
  calculationVersion: 'v', calculationInputSnapshot: {}, version: 1, createdAt: `${clinicalDate}T00:00:00Z`, updatedAt: 'u', ...extra,
});
const followUpDto = (extra: Record<string, unknown> = {}) => ({
  patientId: 'p1', dueDate: '2026-06-01', dueDates: { DIET_UPDATE: '2026-06-01' }, type: ['DIET_UPDATE'], comments: '', version: 1, createdAt: 'a', updatedAt: 'b', ...extra,
});

beforeEach(() => vi.clearAllMocks());

describe('HttpPatientRepository', () => {
  it('creates with a client-generated UUID and labels the patient with the local account', async () => {
    patientsApi.create.mockImplementation(async (id: string) => patientDto(id));
    const patient = await new HttpPatientRepository(() => 'new-uuid').create(ACCOUNT, { name: 'Maria' } as never);
    expect(patientsApi.create).toHaveBeenCalledWith('new-uuid', { name: 'Maria' });
    expect(patient).toMatchObject({ id: 'new-uuid', accountId: ACCOUNT, displayCode: 'P-0001' });
  });

  it('returns null for 404 and maps version conflicts and archived edits to application errors', async () => {
    const repo = new HttpPatientRepository();
    patientsApi.get.mockRejectedValue(new ApiClientError(404, 'NOT_FOUND'));
    expect(await repo.getById(ACCOUNT, 'p1')).toBeNull();
    patientsApi.update.mockRejectedValueOnce(new ApiClientError(409, 'VERSION_CONFLICT', 'r', 3));
    await expect(repo.update(ACCOUNT, 'p1', 1, {} as never)).rejects.toMatchObject({ name: 'PatientApplicationError', code: 'STALE_VERSION' });
    patientsApi.update.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.update(ACCOUNT, 'p1', 1, {} as never)).rejects.toMatchObject({ code: 'ARCHIVED_PATIENT' });
    patientsApi.archive.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.archive(ACCOUNT, 'p1', 1)).rejects.toMatchObject({ code: 'ALREADY_ARCHIVED' });
    patientsApi.restore.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.restore(ACCOUNT, 'p1', 1)).rejects.toMatchObject({ code: 'ALREADY_ACTIVE' });
    patientsApi.get.mockRejectedValueOnce(new ApiClientError(500, 'INTERNAL_ERROR'));
    await expect(repo.getById(ACCOUNT, 'p1')).rejects.toMatchObject({ code: 'PERSISTENCE_FAILURE' });
  });

  it('lists every active patient by walking the 25-item pages', async () => {
    const page = (start: number, count: number) => ({ items: Array.from({ length: count }, (_, i) => patientDto(`p${start + i}`)), total: 30, pageIndex: 0, pageSize: 25 });
    patientsApi.search.mockResolvedValueOnce(page(0, 25)).mockResolvedValueOnce(page(25, 5));
    const all = await new HttpPatientRepository().listActive(ACCOUNT);
    expect(all).toHaveLength(30);
    expect(patientsApi.search.mock.calls.map((call) => call.slice(1))).toEqual([[0, 25], [1, 25]]);
  });

  it('clamps the requested page size to the server limit', async () => {
    patientsApi.search.mockResolvedValue({ items: [], total: 0, pageIndex: 2, pageSize: 25 });
    await new HttpPatientRepository().listActivePage(ACCOUNT, { query: 'ma', today: '2026-01-01', pageIndex: 2, pageSize: 100 });
    expect(patientsApi.search).toHaveBeenCalledWith('ma', 2, 25);
  });
});

describe('HttpObjectiveCatalogRepository', () => {
  it('maps the catalog and translates API failures', async () => {
    const repo = new HttpObjectiveCatalogRepository();
    objectivesApi.list.mockResolvedValue({ items: [{ id: 'system-cutting', label: 'Cutting', normalizedLabel: 'cutting', origin: 'SYSTEM', archivedAt: null, createdAt: 'a', updatedAt: 'a' }] });
    expect((await repo.list(ACCOUNT))[0]).toMatchObject({ accountId: ACCOUNT, label: 'Cutting' });
    objectivesApi.add.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.addCustom(ACCOUNT, ' ')).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    objectivesApi.archive.mockRejectedValueOnce(new ApiClientError(422, 'UNPROCESSABLE'));
    await expect(repo.archiveCustom(ACCOUNT, 'system-cutting')).rejects.toMatchObject({ code: 'SCOPE_VIOLATION' });
    objectivesApi.archive.mockRejectedValueOnce(new ApiClientError(404, 'NOT_FOUND'));
    await expect(repo.archiveCustom(ACCOUNT, 'x')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('assessmentToInput', () => {
  const built = {
    id: 'a1', accountId: 'x', patientId: 'p1', clinicalDate: '2026-03-10', assessmentType: 'complete' as const, weightKg: 70, waistCm: 70,
    scapulaCm: 25, bustCm: 90, abdomenCm: 80, hipCm: 95, leftProximalThighCm: 55, rightProximalThighCm: 55, neckCm: 33,
    bodyFatPercent: 25, fatMassKg: 1, leanMassKg: 2, autoFilledFields: ['neckCm', 'rightProximalThighCm'], calculationMethod: 'US_NAVY' as const,
    calculationVersion: 'v', calculationInputSnapshot: { sex: 'female', heightCm: 165 }, version: 1, createdAt: 'c', updatedAt: 'u',
  };

  it('sends only what was typed: autofilled fields and computed results stay out', () => {
    const input = assessmentToInput(built as never) as Record<string, unknown>;
    expect(input).toMatchObject({ clinicalDate: '2026-03-10', assessmentType: 'complete', weightKg: 70, leftProximalThighCm: 55 });
    for (const key of ['neckCm', 'rightProximalThighCm', 'bodyFatPercent', 'fatMassKg', 'accountId', 'version', 'heightCm']) expect(input).not.toHaveProperty(key);
  });

  it('keeps the height for simplified assessments', () => {
    const input = assessmentToInput({ ...built, assessmentType: 'simplified', autoFilledFields: [], calculationInputSnapshot: { assessmentType: 'simplified', heightCm: 170 } } as never);
    expect(input).toMatchObject({ assessmentType: 'simplified', heightCm: 170 });
  });
});

describe('HttpClinicalRepository', () => {
  it('creates and updates through the API using the assessment ID and version', async () => {
    const repo = new HttpClinicalRepository(() => 'fallback-id');
    clinicalApi.createAssessment.mockResolvedValue(assessmentDto('a1', '2026-03-10'));
    const created = await repo.createAssessment(ACCOUNT, 'p1', { id: 'a1', clinicalDate: '2026-03-10', weightKg: 70, autoFilledFields: [] } as never);
    expect(clinicalApi.createAssessment).toHaveBeenCalledWith('p1', 'a1', expect.objectContaining({ weightKg: 70 }));
    expect(created.accountId).toBe(ACCOUNT);
    await repo.createAssessment(ACCOUNT, 'p1', { clinicalDate: '2026-03-10', weightKg: 70, autoFilledFields: [] } as never);
    expect(clinicalApi.createAssessment).toHaveBeenLastCalledWith('p1', 'fallback-id', expect.anything());
    clinicalApi.updateAssessment.mockRejectedValueOnce(new ApiClientError(409, 'VERSION_CONFLICT'));
    await expect(repo.updateAssessment(ACCOUNT, 'p1', 'a1', 1, { clinicalDate: '2026-03-10', weightKg: 70, autoFilledFields: [] } as never))
      .rejects.toMatchObject({ code: 'CLINICAL_VERSION_CONFLICT' });
  });

  it('returns null for a missing assessment, sorts the list newest first and pages it locally', async () => {
    const repo = new HttpClinicalRepository();
    clinicalApi.getAssessment.mockRejectedValueOnce(new ApiClientError(404, 'NOT_FOUND'));
    expect(await repo.getAssessment(ACCOUNT, 'p1', 'x')).toBeNull();
    clinicalApi.listAssessments.mockResolvedValue({ items: ['2026-01-01', '2026-03-01', '2026-02-01'].map((date, i) => assessmentDto(`a${i}`, date)) });
    expect((await repo.listAssessments(ACCOUNT, 'p1')).map((a) => a.clinicalDate)).toEqual(['2026-03-01', '2026-02-01', '2026-01-01']);
    const page = await repo.listAssessmentsPage(ACCOUNT, 'p1', { pageIndex: 1, pageSize: 2 });
    expect(page).toMatchObject({ total: 3, pageIndex: 1, pageSize: 2 });
    expect(page.items.map((a) => a.clinicalDate)).toEqual(['2026-01-01']);
  });

  it('summarizes assessments and follow-ups with batched requests, defaulting patients the server omits', async () => {
    const repo = new HttpClinicalRepository();
    patientsApi.summaries.mockResolvedValue({ items: [{
      patientId: 'p1', dietCount: 0, assessmentCount: 3, latestAssessment: assessmentDto('a2', '2026-03-01'), previousAssessment: assessmentDto('a1', '2026-02-01'),
      nextFollowUp: followUpDto(), lastActivity: null,
    }] });
    const summaries = await repo.listAssessmentSummaries(ACCOUNT, ['p1', 'p2']);
    expect(summaries.p1).toMatchObject({ count: 3 });
    expect(summaries.p1.assessments.map((a) => a.id)).toEqual(['a2', 'a1']);
    expect(summaries.p2).toEqual({ assessments: [], count: 0 });
    expect(Object.keys(await repo.listNextFollowUps(ACCOUNT, ['p1', 'p2']))).toEqual(['p1']);
    const many = Array.from({ length: 30 }, (_, i) => `p${i}`);
    patientsApi.summaries.mockClear();
    patientsApi.summaries.mockResolvedValue({ items: [] });
    await repo.listAssessmentSummaries(ACCOUNT, many);
    expect(patientsApi.summaries.mock.calls.map((call) => call[0].length)).toEqual([25, 5]);
  });

  it('handles follow-ups: read, create vs replace, move and clear', async () => {
    const repo = new HttpClinicalRepository();
    clinicalApi.getFollowUp.mockResolvedValue({ followUp: null });
    expect(await repo.getNextFollowUp(ACCOUNT, 'p1')).toBeNull();
    clinicalApi.setFollowUp.mockResolvedValue(followUpDto());
    await repo.setNextFollowUp(ACCOUNT, 'p1', null, { dueDate: '2026-06-01', type: 'DIET_UPDATE' });
    expect(clinicalApi.setFollowUp).toHaveBeenLastCalledWith('p1', { dueDate: '2026-06-01', type: 'DIET_UPDATE' }, undefined);
    await repo.setNextFollowUp(ACCOUNT, 'p1', 4, { dueDate: '2026-06-01', type: 'DIET_UPDATE' });
    expect(clinicalApi.setFollowUp).toHaveBeenLastCalledWith('p1', expect.anything(), 4);

    expect(await repo.moveNextFollowUps(ACCOUNT, [])).toEqual([]);
    expect(clinicalApi.moveFollowUps).not.toHaveBeenCalled();
    clinicalApi.moveFollowUps.mockResolvedValue({ moves: [{ before: followUpDto(), after: followUpDto({ version: 2 }) }] });
    const moves = await repo.moveNextFollowUps(ACCOUNT, [{ patientId: 'p1', types: ['DIET_UPDATE'], expectedVersion: 1, dueDate: '2026-07-01' }]);
    expect(moves[0]).toMatchObject({ before: { accountId: ACCOUNT, version: 1 }, after: { version: 2 } });
    clinicalApi.moveFollowUps.mockRejectedValueOnce(new ApiClientError(409, 'VERSION_CONFLICT'));
    await expect(repo.moveNextFollowUps(ACCOUNT, [{ patientId: 'p1', types: ['DIET_UPDATE'], expectedVersion: 1, dueDate: '2026-07-01' }]))
      .rejects.toMatchObject({ code: 'CLINICAL_VERSION_CONFLICT' });

    clinicalApi.clearFollowUp.mockResolvedValue({});
    await repo.clearNextFollowUp(ACCOUNT, 'p1', 2);
    expect(clinicalApi.clearFollowUp).toHaveBeenCalledWith('p1', 2);
  });
});
