// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { cloneFixture } from '../src/fixture';
import type { DietDraft } from '../src/contracts';
import { closeDatabase, openDatabase, type DatabaseHandle } from '../src/db/client';
import { createDatabaseRepository } from '../src/db/repositories';
import { createDraftStore, type DraftStore } from '../src/drafts/draft-store';
import { assertConfirmedFixtureEqual } from './support/fixture-assertions';

const handles: DatabaseHandle[] = [];
const stores: DraftStore[] = [];

afterEach(async () => {
  for (const store of stores.splice(0)) {
    await store.clear();
  }
  for (const handle of handles.splice(0)) {
    await closeDatabase(handle);
  }
});

const draft: DietDraft = {
  draftId: 'draft-test-ana',
  accountId: 'account-alpha',
  patientId: 'patient-ana',
  targetDietId: 'diet-ana-v2',
  expectedVersion: 2,
  payload: { title: 'Edição inicial' },
  updatedAt: '2026-08-30T09:20:00.000Z',
};

describe('separate draft storage seam', () => {
  it('autosaves, updates and discards a draft without changing confirmed data', async () => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    await repository.seedFixture(cloneFixture());
    const before = await repository.readConfirmed('account-alpha');
    const store = createDraftStore('drafts-test-isolation');
    stores.push(store);

    await store.save(draft);
    expect(await store.get(draft.draftId)).toEqual(draft);

    const updated = { ...draft, payload: { title: 'Edição atualizada' }, updatedAt: '2026-08-30T09:21:00.000Z' };
    await store.save(updated);
    expect(await store.get(draft.draftId)).toEqual(updated);

    await store.remove(draft.draftId);
    expect(await store.get(draft.draftId)).toBeUndefined();
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-alpha'), before);
  });

  it('rejects malformed draft state without creating a confirmed row', async () => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    await repository.seedFixture(cloneFixture());
    const before = await repository.readConfirmed('account-alpha');
    const store = createDraftStore('drafts-test-failure');
    stores.push(store);

    await expect(store.save({ ...draft, draftId: '' })).rejects.toMatchObject({ code: 'DRAFT_FAILED' });
    expect(await store.list()).toEqual([]);
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-alpha'), before);
  });
});
