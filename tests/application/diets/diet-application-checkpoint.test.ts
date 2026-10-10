import { describe, expect, it, vi } from 'vitest';
import { createConfirmedOperationCoordinator } from '@/lib/application/composition-root';
import { createDietApplication } from '@/lib/application/diets/diet-application';
import type { DietApplicationDependencies, DietDraftStore, DietRepository } from '@/lib/application/diets/diet-ports';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietDraft } from '@/lib/domain/diets/diet-model';
import { activeDietFixture, simpleDraftFixture } from '../../fixtures/diets';

function setup(options: {
  confirm?: DietRepository['confirmActive'];
  getById?: DietRepository['getById'];
  remove?: DietDraftStore['removeIfRevision'];
  checkpoint?: () => Promise<void>;
} = {}) {
  const draft = { ...structuredClone(simpleDraftFixture), routeDietId: 'nova', targetDietId: 'diet-stable' } as DietDraft;
  const store: DietDraftStore = {
    create: vi.fn(), getByContext: vi.fn(), get: vi.fn(async () => structuredClone(draft)),
    putIfNewer: vi.fn(), reserveTargetId: vi.fn(),
    removeIfRevision: (options.remove ?? vi.fn(async () => true)) as DietDraftStore['removeIfRevision'],
    invalidateByPatient: vi.fn(), listRecoverableByPatient: vi.fn(), listRecoverableByAccount: vi.fn(),
  };
  const repository: DietRepository = {
    getById: (options.getById ?? vi.fn(async (_accountId, _patientId, id) => ({ ...activeDietFixture, id }))) as DietRepository['getById'],
    listConfirmed: vi.fn(), countConfirmed: vi.fn(),
    confirmActive: (options.confirm ?? vi.fn(async () => ({ status: 'COMMITTED_NEW' as const, planId: 'diet-stable', version: 1 }))) as DietRepository['confirmActive'],
  };
  const checkpoint = vi.fn(options.checkpoint ?? (async () => undefined));
  const dependencies: DietApplicationDependencies = {
    accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: {} as never })), getActive: vi.fn() },
    patientReader: { getById: vi.fn(async () => ({ id: 'patient-a', accountId: 'account-a', name: 'Ana', weightKg: 64, archivedAt: null } as never)) },
    repository,
    draftStore: store,
    dietReader: {} as never,
    confirmedOperation: createConfirmedOperationCoordinator(checkpoint),
    now: () => '2026-08-30T12:00:00.000Z',
  };
  return { dependencies, repository, store, checkpoint, draft };
}

describe('diet application checkpoint boundary', () => {
  it('preserves a confirmed local save when the file checkpoint fails', async () => {
    const confirm = vi.fn(async () => ({ status: 'COMMITTED_NEW' as const, planId: 'diet-stable', version: 1 }));
    const { dependencies, repository, store, checkpoint, draft } = setup({
      confirm,
      checkpoint: async () => { throw new Error('falha no arquivo principal'); },
    });

    const outcome = await createDietApplication(dependencies).saveDietAsActive(draft.draftId, draft.draftRevision);

    expect(outcome).toMatchObject({
      status: 'CHECKPOINT_PENDING', draftId: draft.draftId,
      localOutcome: {
        status: 'COMMITTED', planId: 'diet-stable', version: 1,
        confirmedDraftRevision: draft.draftRevision,
      },
    });
    expect(repository.confirmActive).toHaveBeenCalledTimes(1);
    expect(store.removeIfRevision).toHaveBeenCalledWith(draft.draftId, draft.draftRevision);
    expect(checkpoint).toHaveBeenCalledTimes(1);
  });

  it('keeps cleanup pending inside a checkpoint-pending local result', async () => {
    const { dependencies, store, draft } = setup({
      remove: vi.fn(async () => false),
      checkpoint: async () => { throw new Error('falha no arquivo principal'); },
    });

    const outcome = await createDietApplication(dependencies).saveDietAsActive(draft.draftId, draft.draftRevision);

    expect(outcome).toMatchObject({
      status: 'CHECKPOINT_PENDING',
      localOutcome: {
        status: 'CLEANUP_PENDING', planId: 'diet-stable', version: 1,
        confirmedDraftRevision: draft.draftRevision,
      },
    });
    expect(store.removeIfRevision).toHaveBeenCalledWith(draft.draftId, draft.draftRevision);
  });

  it('does not checkpoint an uncertain save before reconciliation confirms it', async () => {
    const confirm = vi.fn(async () => { throw new DietDomainError('RESULT_UNKNOWN', 'resultado incerto'); });
    const { dependencies, repository, checkpoint, draft } = setup({ confirm });

    await expect(createDietApplication(dependencies).saveDietAsActive(draft.draftId, draft.draftRevision))
      .resolves.toMatchObject({ status: 'RESULT_UNKNOWN', confirmedDraftRevision: draft.draftRevision });
    expect(repository.confirmActive).toHaveBeenCalledTimes(1);
    expect(checkpoint).not.toHaveBeenCalled();
  });

  it('checkpoints a commit confirmed by reconciliation without resubmitting it', async () => {
    const confirm = vi.fn();
    const { dependencies, repository, checkpoint, draft } = setup({ confirm });

    const outcome = await createDietApplication(dependencies).reconcileUnknownSave(draft.draftId, draft.draftRevision);

    expect(outcome).toMatchObject({ status: 'COMMITTED', planId: 'diet-stable', confirmedDraftRevision: draft.draftRevision });
    expect(repository.getById).toHaveBeenCalledWith('account-a', 'patient-a', 'diet-stable');
    expect(repository.confirmActive).not.toHaveBeenCalled();
    expect(checkpoint).toHaveBeenCalledTimes(1);
  });
});
