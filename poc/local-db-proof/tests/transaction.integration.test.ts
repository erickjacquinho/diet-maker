// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { cloneFixture } from '../src/fixture';
import { closeDatabase, openDatabase, type DatabaseHandle } from '../src/db/client';
import { createDatabaseRepository, type DatabaseRepository } from '../src/db/repositories';
import { assertConfirmedFixtureEqual } from './support/fixture-assertions';

const handles: DatabaseHandle[] = [];

afterEach(async () => {
  for (const handle of handles.splice(0)) {
    await closeDatabase(handle);
  }
});

async function seededRepository(): Promise<DatabaseRepository> {
  const handle = await openDatabase({ mode: 'test-memory' });
  handles.push(handle);
  const repository = createDatabaseRepository(handle);
  await repository.seedFixture(cloneFixture());
  return repository;
}

const replacementPlan = {
  id: 'diet-ana-v3',
  accountId: 'account-alpha',
  patientId: 'patient-ana',
  status: 'ACTIVE' as const,
  version: 3,
  createdAt: '2026-08-30T09:15:00.000Z',
  updatedAt: '2026-08-30T09:15:00.000Z',
};

const replacementMeals = [{
  id: 'meal-ana-v3-breakfast',
  dietPlanId: replacementPlan.id,
  position: 0,
  name: 'Café da manhã',
  items: [{
    id: 'item-ana-v3-oats',
    mealId: 'meal-ana-v3-breakfast',
    sourceKind: 'TACO' as const,
    sourceId: 'taco-oats',
    quantityG: 80,
    energyKcal: 311,
    proteinG: 13.5,
    carbsG: 52.7,
    fatG: 5.6,
  }],
}];

describe('confirmed diet transaction seam', () => {
  it.each(['plan', 'meal', 'item'] as const)('rolls back the entire aggregate after failure at %s', async (failAfter) => {
    const repository = await seededRepository();
    const before = await repository.readConfirmed('account-alpha');

    await expect(repository.saveDiet({ plan: replacementPlan, meals: replacementMeals, failAfter })).rejects.toMatchObject({
      code: 'INTEGRITY_VIOLATION',
    });

    const after = await repository.readConfirmed('account-alpha');
    assertConfirmedFixtureEqual(after, before);
  });

  it.each(['patients', 'recipes', 'dietPlans'] as const)('rejects nonexistent account ownership in %s during seed', async (collection) => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    const invalid = cloneFixture();
    invalid[collection][0].accountId = 'missing-account';

    await expect(repository.seedFixture(invalid)).rejects.toMatchObject({ code: 'INTEGRITY_VIOLATION' });
    await expect(repository.readConfirmed('account-alpha')).rejects.toMatchObject({ code: 'SCOPE_VIOLATION' });
  });

  it('rejects a cross-account patient relation during seed and rolls back every account', async () => {
    const handle = await openDatabase({ mode: 'test-memory' });
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    const invalid = cloneFixture();
    invalid.dietPlans[0].accountId = 'account-beta';

    await expect(repository.seedFixture(invalid)).rejects.toMatchObject({ code: 'INTEGRITY_VIOLATION' });
    for (const account of invalid.accounts) {
      await expect(repository.readConfirmed(account.id)).rejects.toMatchObject({ code: 'SCOPE_VIOLATION' });
    }
  });

  it('rejects a diet whose patient belongs to another account', async () => {
    const repository = await seededRepository();

    await expect(repository.saveDiet({
      plan: { ...replacementPlan, id: 'diet-invalid-cross-account', accountId: 'account-beta' },
      meals: [],
    })).rejects.toMatchObject({ code: 'SCOPE_VIOLATION' });
  });

  it('rejects a child relation that points outside the composed aggregate', async () => {
    const repository = await seededRepository();

    await expect(repository.saveDiet({
      plan: replacementPlan,
      meals: [{ ...replacementMeals[0], dietPlanId: 'diet-ana-v2' }],
    })).rejects.toMatchObject({ code: 'SCOPE_VIOLATION' });
  });

  it('keeps only one ACTIVE diet while snapshotting the previous version', async () => {
    const repository = await seededRepository();

    await repository.saveDiet({ plan: replacementPlan, meals: replacementMeals });
    const current = await repository.readConfirmed('account-alpha');
    const anaPlans = current.dietPlans.filter((plan) => plan.patientId === 'patient-ana');

    expect(anaPlans.filter((plan) => plan.status === 'ACTIVE').map((plan) => plan.id)).toEqual(['diet-ana-v3']);
    expect(anaPlans.find((plan) => plan.id === 'diet-ana-v2')?.status).toBe('SNAPSHOT');
  });
});
