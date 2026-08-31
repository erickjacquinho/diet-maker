import { describe, expect, it, vi } from 'vitest';
import { createDietDraftCommands } from '@/lib/application/diets/diet-draft-commands';
import { createDecimalString, type DietDraft } from '@/lib/domain/diets/diet-model';
import type { DietDraftStore, DietRepository } from '@/lib/application/diets/diet-ports';
import { simpleDraftFixture, activeDietFixture } from '../../fixtures/diets';

function createStore(initial: DietDraft | null = null): DietDraftStore {
  let current = initial ? structuredClone(initial) : null;
  return {
    create: vi.fn(async (draft) => { current = structuredClone(draft); return structuredClone(draft); }),
    getByContext: vi.fn(async () => current ? structuredClone(current) : null),
    get: vi.fn(async () => current ? structuredClone(current) : null),
    putIfNewer: vi.fn(async (draft) => { current = structuredClone(draft); return { status: 'SAVED' as const, revision: draft.draftRevision, updatedAt: draft.updatedAt }; }),
    reserveTargetId: vi.fn(),
    removeIfRevision: vi.fn(),
    invalidateByPatient: vi.fn(),
    listRecoverableByPatient: vi.fn(async () => current ? [structuredClone(current)] : []),
  };
}

function dependencies(store: DietDraftStore, patient: { id: string; accountId: string; name: string; weightKg: number; archivedAt: string | null } = { id: 'patient-a', accountId: 'account-a', name: 'Ana', weightKg: 64, archivedAt: null }) {
  const repository: DietRepository = {
    getById: vi.fn(async () => structuredClone(activeDietFixture)),
    listConfirmed: vi.fn(),
    countConfirmed: vi.fn(),
    confirmActive: vi.fn(),
  };
  return {
    accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: { id: 'account-a' } as never })), getActive: vi.fn() },
    patientReader: { getById: vi.fn(async () => patient as never) },
    repository,
    draftStore: store,
    now: () => '2026-08-30T10:00:00.000Z',
    idFactory: () => 'draft-generated',
  };
}

describe('diet draft application commands', () => {
  it('opens a new active-patient draft with current weight and zero targets without confirming a diet', async () => {
    const store = createStore();
    const deps = dependencies(store);
    const commands = createDietDraftCommands(deps);

    const result = await commands.openEditor('patient-a', 'nova');

    expect(result.isNew).toBe(true);
    expect(result.draft.payload.weightReferenceKg).toBe(createDecimalString('64'));
    expect(result.draft.payload.variations[0].targets).toEqual({ protein: '0', carbs: '0', fat: '0', energyKcal: '0' });
    expect(deps.repository.confirmActive).not.toHaveBeenCalled();
  });

  it('rejects archived patients and preserves the active plan base when editing', async () => {
    const archived = dependencies(createStore(), { id: 'patient-a', accountId: 'account-a', name: 'Ana', weightKg: 64, archivedAt: '2026-08-30T10:00:00.000Z' });
    await expect(createDietDraftCommands(archived).openEditor('patient-a', 'nova')).rejects.toMatchObject({ code: 'ARCHIVED_PATIENT' });

    const store = createStore();
    const deps = dependencies(store);
    const result = await createDietDraftCommands(deps).openEditor('patient-a', activeDietFixture.id);
    expect(result.draft.baseDietId).toBe(activeDietFixture.id);
    expect(result.draft.baseDietVersion).toBe(activeDietFixture.version);
    expect(result.draft.payload.weightReferenceKg).toBe(activeDietFixture.weightReferenceKg);
  });

  it('autosaves and flushes the complete visible document through the draft port', async () => {
    const store = createStore(simpleDraftFixture);
    const deps = dependencies(store);
    const commands = createDietDraftCommands(deps);
    const document = structuredClone(simpleDraftFixture.payload);
    document.name = 'Último valor visível';

    await expect(commands.autosaveDraft(simpleDraftFixture.draftId, 3, document)).resolves.toMatchObject({ status: 'SAVED', revision: 4 });
    await expect(commands.flushDraft(simpleDraftFixture.draftId, document)).resolves.toMatchObject({ status: 'SAVED' });
    expect(store.putIfNewer).toHaveBeenCalled();
  });
});
