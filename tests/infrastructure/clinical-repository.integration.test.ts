import { afterEach, describe, expect, it } from 'vitest';
import { createClinicalTestDatabase } from '../helpers/clinical-test-db';
import { makeClinicalAssessment, makeClinicalFollowUp } from '../fixtures/clinical';
import type { LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { accounts, patients } from '@/lib/infrastructure/local-db/schema';
import { PGliteClinicalRepository } from '@/lib/infrastructure/local-db/clinical-repository';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function seedDatabase() {
  handle = await createClinicalTestDatabase('clinical-repository');
  await handle.db.insert(accounts).values([
    { id: 'account-alpha', displayName: 'Alpha', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
    { id: 'account-beta', displayName: 'Beta', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
  ]);
  await handle.db.insert(patients).values([
    { id: 'patient-alpha-active', accountId: 'account-alpha', displayCode: 'P-0001', name: 'Ana', age: 32, gender: 'Feminino', heightCm: 165, weightKg: 62, maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção', targetProtein: 110, targetCarbs: 200, targetFats: 55, targetKcal: 1755, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z', version: 1, archivedAt: null },
    { id: 'patient-alpha-archived', accountId: 'account-alpha', displayCode: 'P-0002', name: 'Carlos', age: 40, gender: 'Masculino', heightCm: 178, weightKg: 84, maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Cutting', targetProtein: 170, targetCarbs: 180, targetFats: 70, targetKcal: 2030, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z', version: 2, archivedAt: '2026-09-02T00:00:00.000Z' },
    { id: 'patient-beta-active', accountId: 'account-beta', displayCode: 'P-0001', name: 'Beatriz', age: 29, gender: 'Feminino', heightCm: 170, weightKg: 68, maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção', targetProtein: 120, targetCarbs: 210, targetFats: 60, targetKcal: 1860, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z', version: 1, archivedAt: null },
  ]);
  return new PGliteClinicalRepository(handle, {
    now: () => '2026-09-11T12:00:00.000Z',
    idFactory: () => 'assessment-generated',
  });
}

describe('PGlite clinical repository', () => {
  it('creates, lists and reopens independent assessments in deterministic order', async () => {
    const repository = await seedDatabase();
    const first = makeClinicalAssessment({ id: 'assessment-b', clinicalDate: '2026-09-10', createdAt: '2026-09-11T12:00:02.000Z', updatedAt: '2026-09-11T12:00:02.000Z' });
    const second = makeClinicalAssessment({ id: 'assessment-a', clinicalDate: '2026-09-10', createdAt: '2026-09-11T12:00:02.000Z', updatedAt: '2026-09-11T12:00:02.000Z', weightKg: 63 });

    await repository.createAssessment('account-alpha', 'patient-alpha-active', first);
    await repository.createAssessment('account-alpha', 'patient-alpha-active', second);

    expect((await repository.listAssessments('account-alpha', 'patient-alpha-active')).map((item) => item.id)).toEqual(['assessment-a', 'assessment-b']);
    await expect(repository.getAssessment('account-beta', 'patient-beta-active', 'assessment-a')).resolves.toBeNull();
    await expect(repository.getAssessment('account-alpha', 'patient-alpha-active', 'assessment-a')).resolves.toMatchObject({ weightKg: 63 });
  });

  it('paginates scoped assessments with stable order while keeping the latest summary global', async () => {
    const repository = await seedDatabase();
    const patientId = 'patient-alpha-active';
    for (let index = 0; index < 27; index += 1) {
      const id = `assessment-${String(index).padStart(2, '0')}`;
      await repository.createAssessment('account-alpha', patientId, makeClinicalAssessment({
        id,
        patientId,
        clinicalDate: '2026-09-10',
        createdAt: '2026-09-11T12:00:00.000Z',
        updatedAt: '2026-09-11T12:00:00.000Z',
      }));
    }

    const first = await repository.listAssessmentsPage('account-alpha', patientId, { pageIndex: 0, pageSize: 25 });
    const second = await repository.listAssessmentsPage('account-alpha', patientId, { pageIndex: 1, pageSize: 25 });
    const latest = await repository.listAssessmentSummaries('account-alpha', [patientId]);

    expect(first.items).toHaveLength(25);
    expect(first.items.map(({ id }) => id)).toEqual(Array.from({ length: 25 }, (_, index) => `assessment-${String(index).padStart(2, '0')}`));
    expect(first).toMatchObject({ total: 27, pageIndex: 0, pageSize: 25 });
    expect(second.items.map(({ id }) => id)).toEqual(['assessment-25', 'assessment-26']);
    expect(second).toMatchObject({ total: 27, pageIndex: 1, pageSize: 25 });
    expect((await repository.listAssessmentsPage('account-beta', patientId)).total).toBe(0);
    expect((await repository.listAssessmentsPage('account-alpha', 'patient-beta-active')).total).toBe(0);
    expect(latest[patientId]).toMatchObject({ count: 27, assessments: [{ id: 'assessment-00' }, { id: 'assessment-01' }] });
  });

  it('updates only the selected assessment and rejects stale versions', async () => {
    const repository = await seedDatabase();
    const assessment = makeClinicalAssessment({ id: 'assessment-selected' });
    const other = makeClinicalAssessment({ id: 'assessment-other', weightKg: 64 });
    await repository.createAssessment('account-alpha', 'patient-alpha-active', assessment);
    await repository.createAssessment('account-alpha', 'patient-alpha-active', other);

    const updated = await repository.updateAssessment('account-alpha', 'patient-alpha-active', assessment.id, 1, { ...assessment, weightKg: 61 });
    expect(updated).toMatchObject({ id: assessment.id, weightKg: 61, version: 2 });
    await expect(repository.updateAssessment('account-alpha', 'patient-alpha-active', assessment.id, 1, { ...assessment, weightKg: 59 })).rejects.toMatchObject({ code: 'CLINICAL_VERSION_CONFLICT' });
    await expect(repository.getAssessment('account-alpha', 'patient-alpha-active', other.id)).resolves.toMatchObject({ weightKg: 64, version: 1 });
  });

  it('sets, replaces and clears one follow-up without creating a projection row', async () => {
    const repository = await seedDatabase();
    const input = makeClinicalFollowUp();
    const created = await repository.setNextFollowUp('account-alpha', 'patient-alpha-active', null, input);
    expect(created).toMatchObject({ dueDate: input.dueDate, type: input.type, version: 1 });
    const replaced = await repository.setNextFollowUp('account-alpha', 'patient-alpha-active', 1, { ...input, dueDate: '2026-09-20', type: 'DIET_UPDATE' });
    expect(replaced).toMatchObject({ dueDate: '2026-09-20', type: 'DIET_UPDATE', version: 2 });
    await expect(repository.setNextFollowUp('account-alpha', 'patient-alpha-active', 1, input)).rejects.toMatchObject({ code: 'CLINICAL_VERSION_CONFLICT' });
    await repository.clearNextFollowUp('account-alpha', 'patient-alpha-active', 2);
    await expect(repository.getNextFollowUp('account-alpha', 'patient-alpha-active')).resolves.toBeNull();
  });

  it('blocks archived patients and rolls back injected failures', async () => {
    const repository = await seedDatabase();
    await expect(repository.createAssessment('account-alpha', 'patient-alpha-archived', makeClinicalAssessment({ id: 'archived-assessment', patientId: 'patient-alpha-archived' }))).rejects.toMatchObject({ code: 'CLINICAL_PATIENT_ARCHIVED' });

    const failing = new PGliteClinicalRepository(handle!, { failAt: 'assessment-after-write', now: () => '2026-09-11T12:00:00.000Z' });
    await expect(failing.createAssessment('account-alpha', 'patient-alpha-active', makeClinicalAssessment({ id: 'rolled-back' }))).rejects.toMatchObject({ code: 'CLINICAL_TRANSACTION_FAILED' });
    await expect(repository.getAssessment('account-alpha', 'patient-alpha-active', 'rolled-back')).resolves.toBeNull();
  });
});
