import { describe, expect, it, vi } from 'vitest';
import { saveDietAsActive } from '@/lib/application/diets/save-diet-as-active';
import type { DietDraftStore, DietRepository } from '@/lib/application/diets/diet-ports';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietDraft } from '@/lib/domain/diets/diet-model';
import { activeDietFixture, simpleDraftFixture } from '../../fixtures/diets';

function setup(overrides: Partial<{ draft: DietDraft; confirm: DietRepository['confirmActive']; remove: DietDraftStore['removeIfRevision']; reserve: DietDraftStore['reserveTargetId'] }> = {}) {
  let draft: DietDraft = structuredClone(overrides.draft ?? ({ ...simpleDraftFixture, routeDietId: 'nova', targetDietId: undefined } as DietDraft));
  const store: DietDraftStore = {
    create: vi.fn(), getByContext: vi.fn(), get: vi.fn(async () => structuredClone(draft)),
    putIfNewer: vi.fn(), reserveTargetId: (overrides.reserve ?? vi.fn(async (_id, _revision, targetDietId) => { draft = { ...draft, targetDietId }; return structuredClone(draft); })) as DietDraftStore['reserveTargetId'],
    removeIfRevision: (overrides.remove ?? vi.fn(async () => true)) as DietDraftStore['removeIfRevision'], invalidateByPatient: vi.fn(), listRecoverableByPatient: vi.fn(), listRecoverableByAccount: vi.fn(),
  };
  const repository: DietRepository = {
    getById: vi.fn(async (_accountId, _patientId, id) => id === draft.targetDietId ? { ...activeDietFixture, id } : null),
    listConfirmed: vi.fn(), countConfirmed: vi.fn(), confirmActive: (overrides.confirm ?? vi.fn(async () => ({ status: 'COMMITTED_NEW' as const, planId: draft.targetDietId!, version: 1 }))) as DietRepository['confirmActive'],
  };
  const dependencies = {
    accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: {} as never })), getActive: vi.fn() },
    patientReader: { getById: vi.fn(async () => ({ id: 'patient-a', accountId: 'account-a', name: 'Ana', weightKg: 64, archivedAt: null } as never)) },
    repository, draftStore: store, dietReader: {} as never, now: () => '2026-08-30T12:00:00.000Z', idFactory: () => 'diet-stable',
  };
  return { dependencies, store, repository };
}

describe('saveDietAsActive protocol', () => {
  it('flushes the acknowledged revision, reserves one stable target, confirms and cleans only that revision', async () => {
    const { dependencies, repository, store } = setup();
    const result = await saveDietAsActive(dependencies, simpleDraftFixture.draftId, simpleDraftFixture.draftRevision);
    expect(result.status).toBe('COMMITTED');
    expect(store.reserveTargetId).toHaveBeenCalledWith(simpleDraftFixture.draftId, simpleDraftFixture.draftRevision, 'diet-stable');
    expect(repository.confirmActive).toHaveBeenCalledWith(expect.objectContaining({ targetDietId: 'diet-stable', confirmedDraftRevision: 3 }));
    expect(store.removeIfRevision).toHaveBeenCalledWith(simpleDraftFixture.draftId, simpleDraftFixture.draftRevision);
  });

  it('preserves the draft on validation, version conflict and cleanup failure', async () => {
    const invalid = setup({ draft: { ...simpleDraftFixture, payload: { ...simpleDraftFixture.payload, variations: [{ ...simpleDraftFixture.payload.variations[0], meals: [] }] } } as DietDraft });
    await expect(saveDietAsActive(invalid.dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'ROLLED_BACK' });
    expect(invalid.repository.confirmActive).not.toHaveBeenCalled();

    const conflict = setup({ confirm: vi.fn(async () => { throw new DietDomainError('VERSION_CONFLICT', 'conflito'); }) });
    await expect(saveDietAsActive(conflict.dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'VERSION_CONFLICT' });

    const cleanup = setup({ remove: vi.fn(async () => false) });
    await expect(saveDietAsActive(cleanup.dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'CLEANUP_PENDING' });
  });

  it('reconciles without resubmitting an uncertain operation', async () => {
    const { dependencies, repository } = setup({ draft: { ...simpleDraftFixture, targetDietId: 'diet-not-committed' } as DietDraft });
    vi.mocked(repository.getById).mockResolvedValue(null);
    await expect((await import('@/lib/application/diets/save-diet-as-active')).reconcileUnknownSave(dependencies, simpleDraftFixture.draftId)).resolves.toMatchObject({ status: 'NOT_COMMITTED' });
    expect(repository.confirmActive).not.toHaveBeenCalled();
  });
});
