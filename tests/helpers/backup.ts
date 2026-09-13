import { accounts, bodyAssessments, dietItemSnapshots, dietMealItems, dietMealOptions, dietMeals, dietPlans, dietVariationDays, dietVariations, foodCatalogItems, nextFollowUps, objectiveOptions, patients, readyMealItems, readyMeals, recipeIngredients, recipes } from '@/lib/infrastructure/local-db/schema';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';

export async function createBackupTestDatabase(label = 'backup-test'): Promise<LocalDatabaseHandle> {
  return openLocalDatabase({
    mode: 'test-memory',
    dataDir: `memory://${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
}

export async function seedBackupEnvelope(handle: LocalDatabaseHandle, envelope: BackupEnvelope): Promise<void> {
  await handle.db.transaction(async (tx) => {
    if (envelope.account.length) await tx.insert(accounts).values(envelope.account);
    if (envelope.objectiveOptions.length) await tx.insert(objectiveOptions).values(envelope.objectiveOptions);
    if (envelope.patients.length) await tx.insert(patients).values(envelope.patients);
    if (envelope.bodyAssessments.length) await tx.insert(bodyAssessments).values(envelope.bodyAssessments);
    if (envelope.nextFollowUps.length) await tx.insert(nextFollowUps).values(envelope.nextFollowUps);
    if (envelope.dietPlans.length) await tx.insert(dietPlans).values(envelope.dietPlans);
    if (envelope.dietVariations.length) await tx.insert(dietVariations).values(envelope.dietVariations);
    if (envelope.dietVariationDays.length) await tx.insert(dietVariationDays).values(envelope.dietVariationDays);
    if (envelope.dietMeals.length) await tx.insert(dietMeals).values(envelope.dietMeals);
    if (envelope.dietMealOptions.length) await tx.insert(dietMealOptions).values(envelope.dietMealOptions);
    if (envelope.dietMealItems.length) await tx.insert(dietMealItems).values(envelope.dietMealItems);
    if (envelope.dietItemSnapshots.length) await tx.insert(dietItemSnapshots).values(envelope.dietItemSnapshots);
    if (envelope.foodCatalogItems.length) await tx.insert(foodCatalogItems).values(envelope.foodCatalogItems);
    if (envelope.recipes.length) await tx.insert(recipes).values(envelope.recipes);
    if (envelope.recipeIngredients.length) await tx.insert(recipeIngredients).values(envelope.recipeIngredients);
    if (envelope.readyMeals.length) await tx.insert(readyMeals).values(envelope.readyMeals);
    if (envelope.readyMealItems.length) await tx.insert(readyMealItems).values(envelope.readyMealItems);
  });
}

