// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { PGliteBackupRepository } from '@/lib/infrastructure/local-db/backup-repository';
import { createBackupEnvelope, createEmptyBackupFixture } from '../fixtures/backup';
import { createBackupTestDatabase, seedBackupEnvelope } from '../helpers/backup';
import type { LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('PGlite backup repository', () => {
  it('reads one consistent snapshot containing all 17 tables and historical/archived rows', async () => {
    handle = await createBackupTestDatabase('repository-read');
    const source = createBackupEnvelope({ favorites: ['taco-arroz-cozido', 'food-custom'] });
    await seedBackupEnvelope(handle, source);
    const repository = new PGliteBackupRepository(handle, { now: () => source.exportedAt, readFavorites: () => source.favorites });

    const snapshot = await repository.readAccountSnapshot('local-account');

    expect(snapshot).toMatchObject({ appId: 'nutridiet-local-pro', formatVersion: 1, schemaVersion: '5', exportedAt: source.exportedAt });
    for (const table of ['account', 'objectiveOptions', 'patients', 'bodyAssessments', 'nextFollowUps', 'dietPlans', 'dietVariations', 'dietVariationDays', 'dietMeals', 'dietMealOptions', 'dietMealItems', 'dietItemSnapshots', 'foodCatalogItems', 'recipes', 'recipeIngredients', 'readyMeals', 'readyMealItems'] as const) {
      const sourceRows: readonly unknown[] = source[table];
      const snapshotRows: readonly unknown[] = snapshot[table];
      const expectedRows = table === 'account'
        ? sourceRows.map((row) => ({ ...(row as Record<string, unknown>), phone: null }))
        : sourceRows;
      expect(snapshotRows).toHaveLength(sourceRows.length);
      expect([...snapshotRows]).toEqual(expect.arrayContaining([...expectedRows]));
    }
    expect(snapshot.patients.some((patient) => patient.archivedAt)).toBe(true);
    expect(snapshot.dietPlans.some((plan) => plan.status === 'SNAPSHOT')).toBe(true);
    expect(snapshot.foodCatalogItems.some((food) => food.status === 'ARCHIVED')).toBe(true);
    expect(snapshot.readyMeals.some((meal) => meal.status === 'ARCHIVED')).toBe(true);
    expect(snapshot.favorites).toEqual(source.favorites);
  });

  it('returns empty collections without inventing records', async () => {
    handle = await createBackupTestDatabase('repository-empty');
    const source = createBackupEnvelope(createEmptyBackupFixture());
    await seedBackupEnvelope(handle, source);
    const repository = new PGliteBackupRepository(handle, { now: () => source.exportedAt });

    const snapshot = await repository.readAccountSnapshot('local-account');

    expect(snapshot.account).toEqual(source.account.map((account) => ({ ...account, phone: null })));
    expect(snapshot.patients).toEqual([]);
    expect(snapshot.bodyAssessments).toEqual([]);
    expect(snapshot.dietPlans).toEqual([]);
    expect(snapshot.recipes).toEqual([]);
    expect(snapshot.readyMeals).toEqual([]);
  });

  it('replaces the complete account snapshot and preserves the supplied rows', async () => {
    handle = await createBackupTestDatabase('repository-replace');
    const original = createBackupEnvelope();
    await seedBackupEnvelope(handle, original);
    const replacement = createBackupEnvelope({
      favorites: ['food-restored'],
      patients: [{ ...original.patients[0], name: 'Ana Restaurada', version: 3 }],
      bodyAssessments: [],
      nextFollowUps: [],
    });
    let restoredFavorites: string[] = [];
    const repository = new PGliteBackupRepository(handle, { writeFavorites: (favorites) => { restoredFavorites = favorites; } });

    await repository.replaceAccountSnapshot('local-account', replacement);
    const snapshot = await repository.readAccountSnapshot('local-account');

    expect(snapshot.patients).toEqual(replacement.patients);
    expect(snapshot.bodyAssessments).toEqual([]);
    expect(snapshot.nextFollowUps).toEqual([]);
    expect(snapshot.dietPlans).toEqual(replacement.dietPlans);
    expect(snapshot.recipes).toEqual(replacement.recipes);
    expect(restoredFavorites).toEqual(replacement.favorites);
  });

  it.each(['after-delete', 'after-insert'] as const)('rolls back the full base when failure occurs at %s', async (failAt) => {
    handle = await createBackupTestDatabase(`repository-rollback-${failAt}`);
    const original = createBackupEnvelope();
    await seedBackupEnvelope(handle, original);
    const replacement = createBackupEnvelope({ patients: [{ ...original.patients[0], name: 'Não deve persistir', version: 9 }] });
    const repository = new PGliteBackupRepository(handle, { failAt });

    await expect(repository.replaceAccountSnapshot('local-account', replacement)).rejects.toMatchObject({ code: 'BACKUP_RESTORE_FAILED' });
    const snapshot = await new PGliteBackupRepository(handle).readAccountSnapshot('local-account');

    expect(snapshot.patients).toEqual(original.patients);
    expect(snapshot.dietPlans).toEqual(original.dietPlans);
    expect(snapshot.recipes).toEqual(original.recipes);
  });
});
