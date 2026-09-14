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
  it.each(['no-diets', 'account-only'])('round-trips %s without changing another account', async (shape) => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    await repository.seedFixture(cloneFixture());
    const alphaBefore = await repository.readConfirmed('account-alpha');
    const betaBefore = await repository.readConfirmed('account-beta');
    const sample = createPortableSample(betaBefore, 'account-beta');
    if (shape === 'account-only') {
      sample.records = {
        accounts: betaBefore.accounts, patients: [], recipes: [], recipeIngredients: [],
        dietPlans: [], dietMeals: [], dietMealItems: [],
      };
    }

    await importSample(repository, serializeSample(sample));
    const firstRead = await repository.readConfirmed('account-beta');
    assertConfirmedFixtureEqual(firstRead, sample.records);
    await importSample(repository, serializeSample(createPortableSample(firstRead, 'account-beta')));
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-beta'), sample.records);
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-alpha'), alphaBefore);
  });

  it.each(['formatVersion', 'schemaVersion'] as const)('rejects unsupported %s without changing either account', async (field) => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    await repository.seedFixture(cloneFixture());
    const alphaBefore = await repository.readConfirmed('account-alpha');
    const betaBefore = await repository.readConfirmed('account-beta');
    const invalid = { ...createPortableSample(alphaBefore, 'account-alpha'), [field]: 'unsupported' };

    await expect(importSample(repository, JSON.stringify(invalid))).rejects.toMatchObject({ code: 'IMPORT_REJECTED' });
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-alpha'), alphaBefore);
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-beta'), betaBefore);
  });

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
