import { describe, expect, it, vi } from 'vitest';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import type { Patient } from '@/lib/domain/patient';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import { makeClinicalAssessment, makeClinicalFollowUp, CLINICAL_FIXTURE_NOW } from '../fixtures/clinical';

function patient(id: string, name: string): Patient {
  return {
    id,
    accountId: 'account-alpha',
    displayCode: id,
    name,
    age: 30,
    gender: 'Feminino',
    birthDate: null,
    isPregnant: false,
    pregnancyDueDate: null,
    heightCm: 165,
    weightKg: 62,
    maritalStatus: null,
    phone: null,
    whatsapp: null,
    currentObjective: 'Saúde',
    defaultMacroTargets: { proteinG: 100, carbsG: 180, fatsG: 55, kcal: 1700 },
    createdAt: CLINICAL_FIXTURE_NOW,
    updatedAt: CLINICAL_FIXTURE_NOW,
    version: 1,
    archivedAt: null,
  };
}

function repositoryFor(assessments: Record<string, ReturnType<typeof makeClinicalAssessment>[]>, followUps: Record<string, ReturnType<typeof makeClinicalFollowUp>>): ClinicalRepository {
  return {
    getAssessment: vi.fn(async () => null),
    listAssessments: vi.fn(async (_accountId, patientId) => assessments[patientId] ?? []),
    listAssessmentsPage: vi.fn(async (_accountId, patientId, request = {}) => ({ items: assessments[patientId] ?? [], total: assessments[patientId]?.length ?? 0, pageIndex: request.pageIndex ?? 0, pageSize: request.pageSize ?? 25 })),
    listAssessmentSummaries: vi.fn(async (_accountId: string, patientIds: readonly string[]) => Object.fromEntries(patientIds.map((id) => {
      const all = [...(assessments[id] ?? [])].sort((left, right) => right.clinicalDate.localeCompare(left.clinicalDate) || right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id));
      return [id, { assessments: all.slice(0, 2), count: all.length }];
    }))),
    listAssessmentsByPatients: vi.fn(async (_accountId: string, patientIds: readonly string[]) => Object.fromEntries(patientIds.map((id: string) => [id, assessments[id] ?? []]))),
    createAssessment: vi.fn(),
    updateAssessment: vi.fn(),
    getNextFollowUp: vi.fn(async (_accountId, patientId) => followUps[patientId] ?? null),
    listNextFollowUps: vi.fn(async (_accountId: string, patientIds: readonly string[]) => Object.fromEntries(patientIds.filter((id: string) => followUps[id]).map((id: string) => [id, followUps[id]]))),
    setNextFollowUp: vi.fn(),
    clearNextFollowUp: vi.fn(),
  };
}

describe('clinical read projections', () => {
  it('derives latest, previous, follow-up and last activity without persisting a projection', async () => {
    const first = patient('patient-a', 'Ana');
    const older = makeClinicalAssessment({ id: 'assessment-old', patientId: first.id, clinicalDate: '2026-08-01', createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z' });
    const latest = makeClinicalAssessment({ id: 'assessment-latest', patientId: first.id, clinicalDate: '2026-09-10', createdAt: '2026-09-10T10:00:00.000Z', updatedAt: '2026-09-10T10:00:00.000Z' });
    const followUp = makeClinicalFollowUp({ patientId: first.id, dueDate: '2026-09-11' });
    const repository = repositoryFor({ [first.id]: [older, latest] }, { [first.id]: followUp });
    const reader = createPatientProfileReader(
      { create: vi.fn(), getById: vi.fn(async () => first), listActive: vi.fn(async () => [first]), listActivePage: vi.fn(async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 })), update: vi.fn(), archive: vi.fn(), restore: vi.fn() },
      { list: vi.fn(async () => []), addCustom: vi.fn(), archiveCustom: vi.fn() },
      async () => ({ dietCount: 2, assessmentCount: 0, lastActivity: { eventDate: '2026-09-09', confirmedAt: '2026-09-09T12:00:00.000Z', type: 'diet', sourceId: 'diet-1' } }),
      { clinicalRepository: repository },
    );

    const profile = await reader.getProfile('account-alpha', first.id);
    expect(profile?.clinical?.latestAssessment?.id).toBe(latest.id);
    expect(profile?.clinical?.previousAssessment?.id).toBe(older.id);
    expect(profile?.clinical?.assessmentCount).toBe(2);
    expect(profile?.clinical?.nextFollowUp?.dueDate).toBe('2026-09-11');
    expect(profile?.clinical?.lastActivity?.type).toBe('assessment');
    expect((profile?.patient as Patient).name).toBe('Ana');
    expect(repository.listAssessments).not.toHaveBeenCalled();
  });

  it('uses one batch assessment read and one batch follow-up read for the active list', async () => {
    const first = patient('patient-a', 'Ana');
    const second = patient('patient-b', 'Bia');
    const repository = repositoryFor({ [first.id]: [makeClinicalAssessment({ patientId: first.id })], [second.id]: [] }, {});
    const reader = createPatientProfileReader(
      { create: vi.fn(), getById: vi.fn(), listActive: vi.fn(async () => [first, second]), listActivePage: vi.fn(async () => ({ items: [], total: 0, pageIndex: 0, pageSize: 25 })), update: vi.fn(), archive: vi.fn(), restore: vi.fn() },
      { list: vi.fn(async () => []), addCustom: vi.fn(), archiveCustom: vi.fn() },
      async () => ({ dietCount: 0, assessmentCount: 0 }),
      { clinicalRepository: repository },
    );

    const summaries = await reader.listActiveSummaries('account-alpha');
    expect(repository.listAssessmentsByPatients).toHaveBeenCalledTimes(1);
    expect(repository.listNextFollowUps).toHaveBeenCalledTimes(1);
    expect(repository.listAssessments).not.toHaveBeenCalled();
    expect(summaries.find((summary) => summary.patient.id === first.id)?.related.assessmentCount).toBe(1);
    expect(summaries.find((summary) => summary.patient.id === second.id)?.clinical?.latestAssessment).toBeNull();
  });
});
