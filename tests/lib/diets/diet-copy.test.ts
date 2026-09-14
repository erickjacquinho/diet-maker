import { describe, expect, it, vi } from 'vitest';
import { createDietCopyCommands } from '@/lib/application/diets/diet-copy-commands';
import type { DietApplicationDependencies, DietDraftStore, DietRepository } from '@/lib/application/diets/diet-ports';
import { simpleDraftFixture, activeDietFixture } from '../../fixtures/diets';

function setup(): { dependencies: DietApplicationDependencies; store: DietDraftStore } {
  let draft = structuredClone(simpleDraftFixture);
  const store: DietDraftStore = {
    create: vi.fn(), getByContext: vi.fn(), get: vi.fn(async () => structuredClone(draft)),
    putIfNewer: vi.fn(async (next) => { draft = structuredClone(next); return { status: 'SAVED' as const, revision: next.draftRevision, updatedAt: next.updatedAt }; }),
    reserveTargetId: vi.fn(), removeIfRevision: vi.fn(), invalidateByPatient: vi.fn(), listRecoverableByPatient: vi.fn(), listRecoverableByAccount: vi.fn(),
  };
  const repository: DietRepository = { getById: vi.fn(async () => structuredClone(activeDietFixture)), listConfirmed: vi.fn(), countConfirmed: vi.fn(), confirmActive: vi.fn() };
  return {
    store,
    dependencies: {
      accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: {} as never })), getActive: vi.fn() },
      patientReader: { getById: vi.fn(async () => ({ id: 'patient-a', accountId: 'account-a', name: 'Ana', weightKg: 64, archivedAt: null } as never)) },
      repository, draftStore: store, dietReader: { listPreviousSources: vi.fn(async () => [{ plan: structuredClone(activeDietFixture), activeVariation: activeDietFixture.variations[0] }]) } as never,
      now: () => '2026-08-30T12:00:00.000Z', idFactory: (() => { let next = 0; return () => `copy-${++next}`; })(),
    },
  };
}

describe('previous diet copy commands', () => {
  it('copies only targets from the selected variation and persists before returning', async () => {
    const { dependencies, store } = setup();
    const result = await createDietCopyCommands(dependencies).pullTargets(simpleDraftFixture.draftId, activeDietFixture.id, activeDietFixture.variations[0].id, simpleDraftFixture.payload.variations[0].id);
    expect(result.payload.variations[0].targets).toEqual(activeDietFixture.variations[0].targets);
    expect(store.putIfNewer).toHaveBeenCalledWith(expect.objectContaining({ draftRevision: 4 }), 3);
  });

  it('copies the complete source deeply with fresh editable identities and source weight', async () => {
    const { dependencies } = setup();
    const result = await createDietCopyCommands(dependencies).pullCompleteDiet(simpleDraftFixture.draftId, activeDietFixture.id);
    expect(result.payload.weightReferenceKg).toBe(activeDietFixture.weightReferenceKg);
    expect(result.payload.variations[0].id).not.toBe(activeDietFixture.variations[0].id);
    expect(result.payload.variations[0].meals[0].id).not.toBe(activeDietFixture.variations[0].meals[0].id);
    result.payload.name = 'Destino';
    expect(activeDietFixture.name).toBe('Prescrição vigente');
  });
});
