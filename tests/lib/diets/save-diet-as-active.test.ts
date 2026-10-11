import { describe, expect, it, vi } from 'vitest';
import { reconcileUnknownSave, saveDietAsActive } from '@/lib/application/diets/save-diet-as-active';
import type { DietDraftStore, DietRepository } from '@/lib/application/diets/diet-ports';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietDraft } from '@/lib/domain/diets/diet-model';
import { activeDietFixture, simpleDraftFixture } from '../../fixtures/diets';

function setup(overrides: Partial<{ draft: DietDraft; confirm: DietRepository['confirmActive']; getById: DietRepository['getById']; remove: DietDraftStore['removeIfRevision']; reserve: DietDraftStore['reserveTargetId'] }> = {}) {
  let draft: DietDraft = structuredClone(overrides.draft ?? ({ ...simpleDraftFixture, routeDietId: 'nova', targetDietId: undefined } as DietDraft));
  const store: DietDraftStore = {
    create: vi.fn(), getByContext: vi.fn(), get: vi.fn(async () => structuredClone(draft)),
    putIfNewer: vi.fn(), reserveTargetId: (overrides.reserve ?? vi.fn(async (_id, _revision, targetDietId) => { draft = { ...draft, targetDietId }; return structuredClone(draft); })) as DietDraftStore['reserveTargetId'],
    removeIfRevision: (overrides.remove ?? vi.fn(async () => true)) as DietDraftStore['removeIfRevision'], invalidateByPatient: vi.fn(), listRecoverableByPatient: vi.fn(), listRecoverableByAccount: vi.fn(),
  };
  const repository: DietRepository = {
    getById: (overrides.getById ?? vi.fn(async (_accountId, _patientId, id) => id === draft.targetDietId ? { ...activeDietFixture, id } : null)) as DietRepository['getById'],
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
    await expect(saveDietAsActive(cleanup.dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'CLEANUP_PENDING', confirmedDraftRevision: 3 });
  });

  it('reuses the reserved diet ID when an uncertain commit is retried explicitly', async () => {
    const confirm = vi.fn()
      .mockRejectedValueOnce(new DietDomainError('RESULT_UNKNOWN', 'resultado incerto'))
      .mockResolvedValueOnce({ status: 'COMMITTED_NEW' as const, planId: 'diet-stable', version: 1 });
    const { dependencies, repository, store } = setup({ confirm });

    await expect(saveDietAsActive(dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'RESULT_UNKNOWN', confirmedDraftRevision: 3 });
    await expect(saveDietAsActive(dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'COMMITTED', planId: 'diet-stable' });

    expect(vi.mocked(repository.confirmActive).mock.calls.map(([command]) => command.targetDietId)).toEqual(['diet-stable', 'diet-stable']);
    expect(store.reserveTargetId).toHaveBeenCalledTimes(1);
  });

  it('reports cleanup pending when revision removal throws after local commit', async () => {
    const confirm = vi.fn(async () => ({ status: 'COMMITTED_NEW' as const, planId: 'diet-stable', version: 1 }));
    const remove = vi.fn(async () => { throw new Error('draft storage unavailable'); });
    const { dependencies, repository } = setup({ confirm, remove });

    await expect(saveDietAsActive(dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({
      status: 'CLEANUP_PENDING', planId: 'diet-stable', confirmedDraftRevision: 3,
    });
    expect(repository.confirmActive).toHaveBeenCalledTimes(1);
  });

  it('reconciles a commit by its stable ID and cleans only the confirmed revision', async () => {
    const draft = { ...simpleDraftFixture, routeDietId: 'nova', targetDietId: 'diet-stable', draftRevision: 4 } as DietDraft;
    const { dependencies, repository, store } = setup({ draft });

    await expect(reconcileUnknownSave(dependencies, draft.draftId, 3)).resolves.toMatchObject({
      status: 'COMMITTED', planId: 'diet-stable', version: activeDietFixture.version, confirmedDraftRevision: 3,
    });
    expect(repository.getById).toHaveBeenCalledWith('account-a', 'patient-a', 'diet-stable');
    expect(store.removeIfRevision).toHaveBeenCalledWith(draft.draftId, 3);
    expect(repository.confirmActive).not.toHaveBeenCalled();
  });

  it('keeps a newer draft revision when cleanup of a confirmed revision fails', async () => {
    const draft = { ...simpleDraftFixture, routeDietId: 'nova', targetDietId: 'diet-stable', draftRevision: 4 } as DietDraft;
    const remove = vi.fn(async () => false);
    const { dependencies, repository, store } = setup({ draft, remove });

    await expect(reconcileUnknownSave(dependencies, draft.draftId, 3)).resolves.toMatchObject({
      status: 'CLEANUP_PENDING', planId: 'diet-stable', confirmedDraftRevision: 3,
    });
    expect(store.removeIfRevision).toHaveBeenCalledWith(draft.draftId, 3);
    expect(remove).not.toHaveBeenCalledWith(draft.draftId, 4);
    expect(repository.confirmActive).not.toHaveBeenCalled();
  });

  it('requires review and preserves the draft when the stable-ID lookup fails', async () => {
    const draft = { ...simpleDraftFixture, routeDietId: 'nova', targetDietId: 'diet-stable' } as DietDraft;
    const getById = vi.fn(async () => { throw new Error('repository unavailable'); });
    const { dependencies, repository, store } = setup({ draft, getById });

    await expect(reconcileUnknownSave(dependencies, draft.draftId, 3)).resolves.toMatchObject({
      status: 'REVIEW_REQUIRED', planId: 'diet-stable', confirmedDraftRevision: 3,
    });
    expect(repository.confirmActive).not.toHaveBeenCalled();
    expect(store.removeIfRevision).not.toHaveBeenCalled();
  });

  it('reconciles without resubmitting an uncertain operation', async () => {
    const { dependencies, repository } = setup({ draft: { ...simpleDraftFixture, targetDietId: 'diet-not-committed' } as DietDraft });
    vi.mocked(repository.getById).mockResolvedValue(null);
    await expect(reconcileUnknownSave(dependencies, simpleDraftFixture.draftId, 3)).resolves.toMatchObject({ status: 'NOT_COMMITTED', confirmedDraftRevision: 3 });
    expect(repository.confirmActive).not.toHaveBeenCalled();
  });
});
