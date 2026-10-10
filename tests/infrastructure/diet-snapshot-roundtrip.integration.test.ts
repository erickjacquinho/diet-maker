// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { createTacoSnapshot } from '@/lib/application/diets/taco-food-adapter';
import { calculateDocumentSnapshotTotals } from '@/lib/application/diets/diet-snapshot-consumers';
import { fromCanonicalPlan, fromEditableDocument, toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';
import { createDecimalString, type DietPlan, type NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { scaleNutrition } from '@/lib/domain/diets/nutrition';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { PGliteDietRepository } from '@/lib/infrastructure/local-db/diets/pglite-diet-repository';
import { accounts, patients } from '@/lib/infrastructure/local-db/schema';
import { activeDietFixture, simpleDraftFixture, tacoSnapshotFixture } from '../fixtures/diets';

let database: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await database?.close();
  database = undefined;
});

describe('diet snapshot round-trip', () => {
  it('keeps reference energy and decimal quantities through scaling and reading', () => {
    const snapshot = createTacoSnapshot('taco-3', '64');
    expect(snapshot.referenceNutrients.energyKcal).toBe(createDecimalString('128'));
    expect(snapshot.prescribedNutrients.energyKcal).toBe(createDecimalString('81.92'));
    expect(calculateDocumentSnapshotTotals(simpleDraftFixture.payload, 'variation-simple')).toMatchObject({ energyKcal: '128' });
  });

  it('uses frozen weight and snapshot values, never live patient data', () => {
    const document = structuredClone(simpleDraftFixture.payload);
    document.weightReferenceKg = createDecimalString('64');
    const result = calculateDocumentSnapshotTotals(document, 'variation-simple');
    expect(result.weightReferenceKg).toBe('64');
    expect(result.protein).toBe('2.5');
    expect(result.energyKcal).toBe('128');
  });

  it('preserves prescription weight through both legacy editor conversions', () => {
    const legacy = fromEditableDocument(simpleDraftFixture.payload, 'patient-a', 'diet-weight', '2026-08-30T10:00:00.000Z', '2026-08-30T10:00:00.000Z');
    expect(legacy.weightReferenceKg).toBe('64');
    expect(toEditableDocument(legacy).weightReferenceKg).toBe('64');
  });

  it('persists and reopens an edited quantity from the frozen nutrition reference', async () => {
    database = await openLocalDatabase({ mode: 'test-memory', dataDir: 'memory://diet-snapshot-roundtrip' });
    await database.db.insert(accounts).values({ id: 'account-a', displayName: 'Conta', createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z' });
    await database.db.insert(patients).values({ id: 'patient-a', accountId: 'account-a', displayCode: 'P-0001', name: 'Ana', age: 32, gender: 'Feminino', heightCm: 165, weightKg: 64, maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção', targetProtein: 120, targetCarbs: 180, targetFats: 55, targetKcal: 1655, createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z', version: 1, archivedAt: null });

    const expectedSnapshot: NutritionSnapshot = {
      ...structuredClone(tacoSnapshotFixture),
      prescribedQuantity: createDecimalString('50'),
      prescribedNutrients: {
        ...scaleNutrition({
          referenceQuantity: tacoSnapshotFixture.referenceQuantity,
          ...tacoSnapshotFixture.referenceNutrients,
        }, createDecimalString('50')),
        energyKcal: createDecimalString('64'),
      },
    };
    const plan = structuredClone(activeDietFixture) as DietPlan;
    plan.id = 'diet-snapshot-roundtrip';
    plan.variations[0].meals[0].options[0].items[0].snapshot = expectedSnapshot;

    const repository = new PGliteDietRepository(database);
    await expect(repository.confirmActive({
      accountId: 'account-a',
      patientId: 'patient-a',
      targetDietId: plan.id,
      draftId: 'draft-snapshot-roundtrip',
      confirmedDraftRevision: 4,
      plan,
    })).resolves.toMatchObject({ status: 'COMMITTED_NEW', planId: plan.id });

    const reopened = await repository.getById('account-a', 'patient-a', plan.id);
    expect(reopened).not.toBeNull();
    const reopenedDocument = toEditableDocument(fromCanonicalPlan(reopened!));
    expect(reopenedDocument.weightReferenceKg).toBe('64');
    const reopenedSnapshot = reopenedDocument.variations[0].meals[0].options[0].items[0].snapshot;
    expect(reopenedSnapshot).toEqual(expectedSnapshot);
    expect(reopenedSnapshot.referenceNutrients).toEqual(tacoSnapshotFixture.referenceNutrients);
    expect(reopenedSnapshot.prescribedQuantity).toBe('50');
    expect(reopenedSnapshot.prescribedNutrients).toEqual({ protein: '1.25', carbs: '14.05', fat: '0.1', fiber: '0.8', energyKcal: '64' });
  });

  it('persists and reopens snapshots from every modeled source with provenance and composition intact', async () => {
    database = await openLocalDatabase({ mode: 'test-memory', dataDir: 'memory://diet-source-roundtrip' });
    await database.db.insert(accounts).values({ id: 'account-a', displayName: 'Conta', createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z' });
    await database.db.insert(patients).values({ id: 'patient-a', accountId: 'account-a', displayCode: 'P-0001', name: 'Ana', age: 32, gender: 'Feminino', heightCm: 165, weightKg: 64, maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção', targetProtein: 120, targetCarbs: 180, targetFats: 55, targetKcal: 1655, createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z', version: 1, archivedAt: null });

    const sourceSnapshots: NutritionSnapshot[] = [
      {
        ...structuredClone(tacoSnapshotFixture),
        sourceType: 'SYSTEM_TACO', sourceId: 'taco-3', sourceVersion: 'TACO-4.0',
        compositionSnapshot: { source: 'TACO', catalogVersion: '4.0' },
      },
      {
        ...structuredClone(tacoSnapshotFixture),
        sourceType: 'ACCOUNT_CUSTOM', sourceId: 'custom-food-1', sourceVersion: '3',
        compositionSnapshot: { source: 'ACCOUNT_CUSTOM', libraryVersion: 3 },
      },
      {
        ...structuredClone(tacoSnapshotFixture),
        sourceType: 'RECIPE', sourceId: 'recipe-1', sourceVersion: '2',
        compositionSnapshot: { source: 'RECIPE', recipeVersion: 2, ingredients: [{ sourceId: 'custom-food-1', quantity: '100' }] },
      },
      {
        ...structuredClone(tacoSnapshotFixture),
        sourceType: 'READY_MEAL', sourceId: 'ready-meal-1', sourceVersion: '5',
        compositionSnapshot: { source: 'READY_MEAL', readyMealVersion: 5, items: [{ sourceType: 'RECIPE', sourceId: 'recipe-1', sourceVersion: 2 }] },
      },
    ];
    const plan = structuredClone(activeDietFixture) as DietPlan;
    plan.id = 'diet-source-roundtrip';
    plan.variations[0].meals[0].options[0].items = sourceSnapshots.map((snapshot, position) => ({
      id: `source-item-${position}`,
      position,
      role: 'PRIMARY' as const,
      name: snapshot.displayName,
      snapshot,
    }));

    const repository = new PGliteDietRepository(database);
    await expect(repository.confirmActive({
      accountId: 'account-a',
      patientId: 'patient-a',
      targetDietId: plan.id,
      draftId: 'draft-source-roundtrip',
      confirmedDraftRevision: 4,
      plan,
    })).resolves.toMatchObject({ status: 'COMMITTED_NEW', planId: plan.id });

    const reopened = await repository.getById('account-a', 'patient-a', plan.id);
    expect(reopened).not.toBeNull();
    const reopenedItems = toEditableDocument(fromCanonicalPlan(reopened!)).variations[0].meals[0].options[0].items;
    expect(reopenedItems.map((item) => item.snapshot)).toEqual(sourceSnapshots);
  });
});
