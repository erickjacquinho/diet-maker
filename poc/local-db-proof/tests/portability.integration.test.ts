// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { closeDatabase, openDatabase, type DatabaseHandle } from '../src/db/client';
import { cloneFixture } from '../src/fixture';
import { createDatabaseRepository } from '../src/db/repositories';
import { assertConfirmedFixtureEqual } from './support/fixture-assertions';
import {
  createPortableSample,
  importSample,
  serializeSample,
  deserializeSample,
} from '../src/portability/sample-transfer';

const handles: DatabaseHandle[] = [];

afterEach(async () => {
  for (const handle of handles.splice(0)) {
    await closeDatabase(handle);
  }
});

describe('logical portability seam', () => {
  it('round-trips confirmed IDs, relations and nutrition snapshots without drafts', async () => {
    const sourceHandle = await openDatabase({ mode: 'test-memory' });
    handles.push(sourceHandle);
    const sourceRepository = createDatabaseRepository(sourceHandle);
    await sourceRepository.seedFixture(cloneFixture());
    const source = await sourceRepository.readConfirmed('account-alpha');
    const serialized = serializeSample(createPortableSample(source, 'account-alpha'));

    expect(serialized).not.toContain('draft-ana-v3');

    const targetHandle = await openDatabase({ mode: 'test-memory' });
    handles.push(targetHandle);
    const targetRepository = createDatabaseRepository(targetHandle);
    await targetRepository.seedFixture(cloneFixture());
    await importSample(targetRepository, serialized);

    assertConfirmedFixtureEqual(await targetRepository.readConfirmed('account-alpha'), source);
    expect((await targetRepository.readConfirmed('account-beta')).accounts.map((account) => account.id)).toEqual(['account-beta']);
  });

  it('rejects invalid JSON and inconsistent relations without mutating the target', async () => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    await repository.seedFixture(cloneFixture());
    const before = await repository.readConfirmed('account-alpha');

    let thrown: unknown;
    try {
      deserializeSample('{invalid');
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toMatchObject({ code: 'IMPORT_REJECTED' });
    const valid = createPortableSample(before, 'account-alpha');
    valid.records.dietMeals[0].dietPlanId = 'unknown-diet';

    await expect(importSample(repository, JSON.stringify(valid))).rejects.toMatchObject({ code: 'IMPORT_REJECTED' });
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-alpha'), before);
  });
});
