import { describe, expect, it, vi } from 'vitest';
import { createPatientApplication } from '@/lib/application/composition-root';
import type { DietDraftStore } from '@/lib/application/diets/diet-ports';

const patient = { id: 'patient-a', accountId: 'account-a', displayCode: 'P-0001', name: 'Ana', age: 30, gender: 'F', heightCm: 165, weightKg: 64, currentObjective: 'Manutenção', defaultMacroTargets: { proteinG: 120, carbsG: 180, fatsG: 55, kcal: 1655 }, createdAt: '', updatedAt: '', version: 2, archivedAt: '2026-08-30T12:00:00.000Z' };

function createApp(invalidate: DietDraftStore['invalidateByPatient']) {
  const store: DietDraftStore = { create: vi.fn(), getByContext: vi.fn(), get: vi.fn(), putIfNewer: vi.fn(), reserveTargetId: vi.fn(), removeIfRevision: vi.fn(), invalidateByPatient: invalidate, listRecoverableByPatient: vi.fn() };
  const patientRepository = { archive: vi.fn(async () => patient), getById: vi.fn(), create: vi.fn(), listActive: vi.fn(), update: vi.fn(), restore: vi.fn() };
  return createPatientApplication({
    accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: {} as never })), getActive: vi.fn() },
    patientRepository, objectiveCatalogRepository: {} as never, patientProfileReader: {} as never, transactionRunner: { run: <T>(operation: () => Promise<T>) => operation() }, dietDraftStore: store,
  });
}

describe('archive and diet draft lifecycle', () => {
  it('archives first and invalidates drafts', async () => {
    const app = createApp(vi.fn(async () => 2));
    await expect(app.archivePatientAndInvalidate('patient-a', 1)).resolves.toMatchObject({ status: 'ARCHIVED_AND_DRAFTS_INVALIDATED', invalidatedDrafts: 2 });
  });

  it('keeps the patient archived when local draft cleanup is pending', async () => {
    const app = createApp(vi.fn(async () => { throw new Error('quota'); }));
    await expect(app.archivePatientAndInvalidate('patient-a', 1)).resolves.toMatchObject({ status: 'ARCHIVED_CLEANUP_PENDING', patient: { archivedAt: expect.any(String) } });
  });
});
