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

describe('IndexedDB backup draft guard', () => {
  it('lists only editable drafts belonging to the requested account', async () => {
    const databaseName = `backup-drafts-${databaseNames.length + 1}`;
    databaseNames.push(databaseName);
    const store = new IndexedDbDietDraftStore({ databaseName });

    await store.create(newDraft({ draftId: 'draft-patient-one' }), { accountId: 'account-a', patientId: 'patient-one', routeDietId: 'diet-one' });
    await store.create(newDraft({ draftId: 'draft-patient-two' }), { accountId: 'account-a', patientId: 'patient-two', routeDietId: 'diet-two' });
    await store.create(newDraft({ draftId: 'draft-other-account' }), { accountId: 'account-b', patientId: 'patient-three', routeDietId: 'diet-three' });
    await store.invalidateByPatient('account-a', 'patient-one');

    await expect(store.listRecoverableByAccount('account-a')).resolves.toEqual([
      expect.objectContaining({ draftId: 'draft-patient-two', accountId: 'account-a', state: 'EDITABLE' }),
    ]);
    await expect(store.listRecoverableByAccount('account-b')).resolves.toEqual([
      expect.objectContaining({ draftId: 'draft-other-account', accountId: 'account-b', state: 'EDITABLE' }),
    ]);
  });
});

