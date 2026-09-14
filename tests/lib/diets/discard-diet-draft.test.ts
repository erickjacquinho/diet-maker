import { describe, expect, it, vi } from 'vitest';
import { discardDietDraft } from '@/lib/application/diets/discard-diet-draft';
import type { DietDraftStore, DietRepository } from '@/lib/application/diets/diet-ports';
import { simpleDraftFixture } from '../../fixtures/diets';

function setup(remove: DietDraftStore['removeIfRevision'] = vi.fn(async () => true)) {
  const store: DietDraftStore = { create: vi.fn(), getByContext: vi.fn(), get: vi.fn(async () => structuredClone(simpleDraftFixture)), putIfNewer: vi.fn(), reserveTargetId: vi.fn(), removeIfRevision: remove, invalidateByPatient: vi.fn(), listRecoverableByPatient: vi.fn(), listRecoverableByAccount: vi.fn() };
  return { store, dependencies: { accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: {} as never })), getActive: vi.fn() }, patientReader: { getById: vi.fn(async () => ({ ...simpleDraftFixture, archivedAt: null } as never)) }, repository: {} as DietRepository, draftStore: store, dietReader: {} as never } };
}

describe('discard diet draft', () => {
  it('removes exactly the acknowledged revision and cancels delayed writes', async () => {
    const { dependencies, store } = setup();
    await expect(discardDietDraft(dependencies, simpleDraftFixture.draftId, 3)).resolves.toBe('REMOVED');
    expect(store.removeIfRevision).toHaveBeenCalledWith(simpleDraftFixture.draftId, 3);
  });

  it('distinguishes a superseded or already removed draft', async () => {
    const superseded = setup(vi.fn(async () => false));
    await expect(discardDietDraft(superseded.dependencies, simpleDraftFixture.draftId, 3)).resolves.toBe('SUPERSEDED_REVISION');
    const missing = setup();
    vi.mocked(missing.store.get).mockResolvedValue(null);
    await expect(discardDietDraft(missing.dependencies, simpleDraftFixture.draftId, 3)).resolves.toBe('ALREADY_REMOVED');
  });
});
