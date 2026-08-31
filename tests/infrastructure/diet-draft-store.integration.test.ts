import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { IndexedDbDietDraftStore } from '@/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store';
import { simpleDraftFixture } from '../fixtures/diets';
import type { DietDraft } from '@/lib/domain/diets/diet-model';

const databaseNames: string[] = [];

afterEach(() => {
  for (const name of databaseNames.splice(0)) indexedDB.deleteDatabase(name);
});

function newDraft(overrides: Partial<DietDraft> = {}): DietDraft {
  return { ...simpleDraftFixture, ...overrides, payload: structuredClone(simpleDraftFixture.payload) };
}

function newStore(): IndexedDbDietDraftStore {
  const databaseName = `diet-drafts-${databaseNames.length + 1}`;
  databaseNames.push(databaseName);
  return new IndexedDbDietDraftStore({ databaseName });
}

describe('IndexedDB diet draft store', () => {
  it('stores one context, returns structured clones and reopens the same record', async () => {
    const store = newStore();
    const draft = await store.create(newDraft(), { accountId: 'account-a', patientId: 'patient-a', routeDietId: 'nova' });
    const read = await store.getByContext('account-a', 'patient-a', 'nova');
    expect(read).toMatchObject({ draftId: draft.draftId, payloadSchemaVersion: 1 });
    read!.payload.name = 'alteração fora do store';
    await expect(store.get(draft.draftId)).resolves.toMatchObject({ payload: { name: 'Plano simples' } });
    const reopened = new IndexedDbDietDraftStore({ databaseName: databaseNames[0] });
    await expect(reopened.get(draft.draftId)).resolves.toMatchObject({ draftId: draft.draftId });
  });

  it('rejects stale revisions and reserves a stable target identity once', async () => {
    const store = newStore();
    await store.create(newDraft({ draftRevision: 1 }), { accountId: 'account-a', patientId: 'patient-a', routeDietId: 'nova' });
    const saved = await store.putIfNewer(newDraft({ draftRevision: 2 }), 1);
    expect(saved).toMatchObject({ status: 'SAVED', revision: 2 });
    await expect(store.putIfNewer(newDraft({ draftRevision: 1 }), 0)).resolves.toMatchObject({ status: 'SUPERSEDED', currentRevision: 2 });
    await expect(store.reserveTargetId('draft-simple-a', 2, 'diet-target-a')).resolves.toMatchObject({ targetDietId: 'diet-target-a' });
    await expect(store.reserveTargetId('draft-simple-a', 2, 'diet-target-a')).resolves.toMatchObject({ targetDietId: 'diet-target-a' });
    await expect(store.reserveTargetId('draft-simple-a', 2, 'diet-target-b')).rejects.toThrow();
  });

  it('removes only the exact revision and invalidated drafts are never recoverable', async () => {
    const store = newStore();
    await store.create(newDraft(), { accountId: 'account-a', patientId: 'patient-a', routeDietId: 'nova' });
    await expect(store.removeIfRevision('draft-simple-a', 2)).resolves.toBe(false);
    await expect(store.removeIfRevision('draft-simple-a', 3)).resolves.toBe(true);
    await store.create(newDraft({ draftId: 'draft-simple-b' }), { accountId: 'account-a', patientId: 'patient-a', routeDietId: 'active-a' });
    await expect(store.invalidateByPatient('account-a', 'patient-a')).resolves.toBe(1);
    await expect(store.listRecoverableByPatient('account-a', 'patient-a')).resolves.toEqual([]);
  });
});
