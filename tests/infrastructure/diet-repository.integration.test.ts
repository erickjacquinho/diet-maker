// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { PGliteDietRepository, type DietRepositoryOptions } from '@/lib/infrastructure/local-db/diets/pglite-diet-repository';
import { dietItemSnapshots, dietMealItems, dietMealOptions, dietMeals, dietPlans, dietVariations, patients, accounts } from '@/lib/infrastructure/local-db/schema';
import { createDecimalString } from '@/lib/domain/diets/diet-model';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function createRepository(options?: DietRepositoryOptions): Promise<PGliteDietRepository> {
  handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://diet-repository-${Date.now()}-${Math.random()}` });
  await handle.db.insert(accounts).values({ id: 'account-a', displayName: 'Conta', createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z' });
  await handle.db.insert(patients).values({ id: 'patient-a', accountId: 'account-a', displayCode: 'P-0001', name: 'Ana', age: 32, gender: 'Feminino', heightCm: 165, weightKg: 64, maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção', targetProtein: 120, targetCarbs: 180, targetFats: 55, targetKcal: 1655, createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z', version: 1, archivedAt: null });
  return new PGliteDietRepository(handle, options);
}

describe('diet relational repository', () => {
  it('reads a confirmed aggregate with its one-to-one snapshot and enforces account/patient scope', async () => {
    const repository = await createRepository();
    await handle!.db.insert(dietPlans).values({ id: 'diet-a', accountId: 'account-a', patientId: 'patient-a', name: 'Plano', mode: 'SIMPLE', status: 'ACTIVE', weightReferenceKg: '64', version: 1, createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z', activatedAt: '2026-08-30T10:00:00.000Z', supersededAt: null });
    await handle!.db.insert(dietVariations).values({ id: 'variation-a', dietPlanId: 'diet-a', accountId: 'account-a', patientId: 'patient-a', position: 0, kind: 'SIMPLE', name: 'Diário', inputMode: 'GRAMS', targetProtein: '120', targetCarbs: '180', targetFat: '55', targetKcal: '1655', gPerKgProtein: null, gPerKgCarbs: null, gPerKgFat: null });
    await handle!.db.insert(dietMeals).values({ id: 'meal-a', dietPlanId: 'diet-a', variationId: 'variation-a', accountId: 'account-a', patientId: 'patient-a', position: 0, name: 'Café', time: '08:00' });
    await handle!.db.insert(dietMealOptions).values({ id: 'option-a', dietMealId: 'meal-a', position: 0, label: 'Base', countsTowardTotals: true });
    await handle!.db.insert(dietMealItems).values({ id: 'item-a', dietMealOptionId: 'option-a', position: 0, role: 'PRIMARY', parentItemId: null, name: 'Arroz' });
    await handle!.db.insert(dietItemSnapshots).values({
      dietMealItemId: 'item-a', sourceType: 'SYSTEM_TACO', sourceId: 'taco-3', sourceVersion: 'TACO-4.0', displayName: 'Arroz', description: 'Arroz cozido', measurementBasis: 'PER_100G', foodState: 'COOKED', referenceQuantity: '100', referenceUnit: 'g', referenceProtein: '2.5', referenceCarbs: '28.1', referenceFat: '0.2', referenceFiber: '1.6', referenceEnergyKcal: '128', prescribedQuantity: '100', prescribedUnit: 'g', prescribedProtein: '2.5', prescribedCarbs: '28.1', prescribedFat: '0.2', prescribedFiber: '1.6', prescribedEnergyKcal: '128', energySource: 'REFERENCE', calculationVersion: 'taco-decimal-v1', conversionSnapshot: { schemaVersion: 1, conversions: [] }, compositionSnapshot: { schemaVersion: 1, source: 'TACO' },
    });

    await expect(repository.getById('account-a', 'patient-a', 'diet-a')).resolves.toMatchObject({ id: 'diet-a', version: 1, variations: [{ meals: [{ options: [{ items: [{ snapshot: { prescribedQuantity: createDecimalString('100') } }] }] }] }] });
    await expect(repository.getById('account-b', 'patient-a', 'diet-a')).resolves.toBeNull();
    await expect(repository.getById('account-a', 'patient-b', 'diet-a')).resolves.toBeNull();
    await expect(repository.countConfirmed('account-a', 'patient-a')).resolves.toBe(1);
  });

  it('commits a new plan atomically, is idempotent by stable identity and versions an active edit', async () => {
    const repository = await createRepository();
    const plan = {
      id: 'diet-commit', accountId: 'account-a', patientId: 'patient-a', name: 'Plano confirmado', mode: 'SIMPLE' as const, status: 'ACTIVE' as const,
      version: 1, weightReferenceKg: createDecimalString('64'), createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z', activatedAt: '2026-08-30T10:00:00.000Z', supersededAt: null,
      variations: [{ id: 'variation-commit', position: 0, kind: 'SIMPLE' as const, name: 'Diário', inputMode: 'GRAMS' as const, assignedDays: [], targets: { protein: createDecimalString('120'), carbs: createDecimalString('180'), fat: createDecimalString('55'), energyKcal: createDecimalString('1655') }, meals: [{ id: 'meal-commit', position: 0, name: 'Café', options: [{ id: 'option-commit', position: 0, label: 'Base', countsTowardTotals: true, items: [{ id: 'item-commit', position: 0, role: 'PRIMARY' as const, name: 'Arroz', snapshot: { sourceType: 'SYSTEM_TACO' as const, sourceId: 'taco-3', sourceVersion: 'TACO-4.0', displayName: 'Arroz', description: 'Arroz cozido', measurementBasis: 'PER_100G' as const, foodState: 'COOKED' as const, referenceQuantity: createDecimalString('100'), referenceUnit: 'g' as const, referenceNutrients: { protein: createDecimalString('2.5'), carbs: createDecimalString('28.1'), fat: createDecimalString('0.2'), fiber: createDecimalString('1.6'), energyKcal: createDecimalString('128') }, prescribedQuantity: createDecimalString('100'), prescribedUnit: 'g' as const, prescribedNutrients: { protein: createDecimalString('2.5'), carbs: createDecimalString('28.1'), fat: createDecimalString('0.2'), fiber: createDecimalString('1.6'), energyKcal: createDecimalString('128') }, energySource: 'REFERENCE' as const, calculationVersion: 'taco-decimal-v1', conversionSnapshot: { schemaVersion: 1 }, compositionSnapshot: { source: 'TACO' } } }] }] }] }],
    };
    const command = { accountId: 'account-a', patientId: 'patient-a', targetDietId: plan.id, draftId: 'draft-commit', confirmedDraftRevision: 4, plan };

    await expect(repository.confirmActive(command)).resolves.toMatchObject({ status: 'COMMITTED_NEW', planId: plan.id, version: 1 });
    await expect(repository.confirmActive(command)).resolves.toMatchObject({ status: 'ALREADY_COMMITTED', planId: plan.id, version: 1 });
    await expect(repository.getById('account-a', 'patient-a', plan.id)).resolves.toMatchObject({ name: 'Plano confirmado', variations: [{ meals: [{ options: [{ items: [{ snapshot: { sourceId: 'taco-3' } }] }] }] }] });

    const updated = { ...plan, name: 'Plano revisado', version: 2, updatedAt: '2026-08-30T11:00:00.000Z', activatedAt: '2026-08-30T11:00:00.000Z' };
    await expect(repository.confirmActive({ ...command, baseDietId: plan.id, baseDietVersion: 1, plan: updated })).resolves.toMatchObject({ status: 'COMMITTED_UPDATE', version: 2 });
    await expect(repository.getById('account-a', 'patient-a', plan.id)).resolves.toMatchObject({ name: 'Plano revisado', version: 2 });

    const failedRepository = await createRepository({ failAt: 'meal' });
    await expect(failedRepository.confirmActive({ ...command, targetDietId: 'diet-failed', plan: { ...plan, id: 'diet-failed' } })).rejects.toThrow('Falha injetada em meal');
    await expect(failedRepository.countConfirmed('account-a', 'patient-a')).resolves.toBe(0);
  });
});
