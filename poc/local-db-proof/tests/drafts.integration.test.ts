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
  it.each([false, true])('keeps the newest autosave across connections (concurrent=%s)', async (concurrent) => {
    const namespace = `drafts-test-order-${concurrent}`;
    const firstStore = createDraftStore(namespace);
    const secondStore = createDraftStore(namespace);
    stores.push(firstStore, secondStore);
    const newest = { ...draft, payload: { title: 'Versão mais recente' }, updatedAt: '2026-08-30T10:02:00.000Z' };
    const stale = { ...draft, payload: { title: 'Callback atrasado' }, updatedAt: '2026-08-30T10:01:00.000Z' };
    // Open both connections first; the assertion must hold regardless of transaction order.
    await Promise.all([firstStore.list(), secondStore.list()]);

    if (concurrent) {
      await Promise.all([firstStore.save(newest), secondStore.save(stale)]);
    } else {
      await firstStore.save(newest);
      await secondStore.save(stale);
    }
    expect(await firstStore.get(draft.draftId)).toEqual(newest);
  });

  it('compares timestamp instants rather than timezone spelling and rejects invalid timestamps', async () => {
    const store = createDraftStore('drafts-test-timestamps');
    stores.push(store);
    const newest = { ...draft, updatedAt: '2026-08-30T08:02:00-03:00' };
    await store.save(newest);
    await store.save({ ...draft, updatedAt: '2026-08-30T10:59:00Z' });
    expect(await store.get(draft.draftId)).toEqual(newest);
    await expect(store.save({ ...draft, updatedAt: 'invalid' })).rejects.toMatchObject({ code: 'DRAFT_FAILED' });
    expect(await store.get(draft.draftId)).toEqual(newest);
  });

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
