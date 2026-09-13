import { asc, eq, sql } from 'drizzle-orm';
import type { BackupEnvelope, BackupRepository } from '@/lib/persistence/backup-repository';
import { BackupRepositoryError } from '@/lib/persistence/backup-repository';
import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  BACKUP_SCHEMA_VERSION,
} from './logical-export-schema';
import type { LocalDatabaseHandle } from './client';
import {
  accounts,
  bodyAssessments,
  dietItemSnapshots,
  dietMealItems,
  dietMealOptions,
  dietMeals,
  dietPlans,
  dietVariationDays,
  dietVariations,
  foodCatalogItems,
  nextFollowUps,
  objectiveOptions,
  patients,
  readyMealItems,
  readyMeals,
  recipeIngredients,
  recipes,
} from './schema';

export type BackupRepositoryFailurePoint = 'after-delete' | 'after-insert';

export interface PGliteBackupRepositoryOptions {
  now?: () => string;
  failAt?: BackupRepositoryFailurePoint;
}

function repositoryFailure(message: string, cause?: unknown): BackupRepositoryError {
  return new BackupRepositoryError('BACKUP_RESTORE_FAILED', message, { cause });
}

export class PGliteBackupRepository implements BackupRepository {
  private readonly now: () => string;
  private readonly failAt?: BackupRepositoryFailurePoint;

  constructor(private readonly handle: LocalDatabaseHandle, options: PGliteBackupRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.failAt = options.failAt;
  }

  async readAccountSnapshot(accountId: string): Promise<BackupEnvelope> {
    try {
      return await this.handle.db.transaction(async (tx) => {
        const accountRows = await tx.select().from(accounts).where(eq(accounts.id, accountId));
        if (accountRows.length !== 1) throw new BackupRepositoryError('BACKUP_EXPORT_FAILED', 'A Conta local não pôde ser capturada.');

        const objectiveRows = await tx.select().from(objectiveOptions).where(eq(objectiveOptions.accountId, accountId)).orderBy(asc(objectiveOptions.id));
        const patientRows = await tx.select().from(patients).where(eq(patients.accountId, accountId)).orderBy(asc(patients.id));
        const assessmentRows = await tx.select().from(bodyAssessments).where(eq(bodyAssessments.accountId, accountId)).orderBy(asc(bodyAssessments.id));
        const followUpRows = await tx.select().from(nextFollowUps).where(eq(nextFollowUps.accountId, accountId)).orderBy(asc(nextFollowUps.patientId));
        const planRows = await tx.select().from(dietPlans).where(eq(dietPlans.accountId, accountId)).orderBy(asc(dietPlans.id));
        const variationRows = await tx.select().from(dietVariations).where(eq(dietVariations.accountId, accountId)).orderBy(asc(dietVariations.id));
        const variationDayRows = await tx.select().from(dietVariationDays).where(eq(dietVariationDays.accountId, accountId)).orderBy(asc(dietVariationDays.variationId), asc(dietVariationDays.dayCode));
        const mealRows = await tx.select().from(dietMeals).where(eq(dietMeals.accountId, accountId)).orderBy(asc(dietMeals.id));
        const optionRows = await tx.select({ row: dietMealOptions }).from(dietMealOptions).innerJoin(dietMeals, eq(dietMeals.id, dietMealOptions.dietMealId)).where(eq(dietMeals.accountId, accountId)).orderBy(asc(dietMealOptions.id));
        const itemRows = await tx.select({ row: dietMealItems }).from(dietMealItems).innerJoin(dietMealOptions, eq(dietMealOptions.id, dietMealItems.dietMealOptionId)).innerJoin(dietMeals, eq(dietMeals.id, dietMealOptions.dietMealId)).where(eq(dietMeals.accountId, accountId)).orderBy(asc(dietMealItems.id));
        const snapshotRows = await tx.select({ row: dietItemSnapshots }).from(dietItemSnapshots).innerJoin(dietMealItems, eq(dietMealItems.id, dietItemSnapshots.dietMealItemId)).innerJoin(dietMealOptions, eq(dietMealOptions.id, dietMealItems.dietMealOptionId)).innerJoin(dietMeals, eq(dietMeals.id, dietMealOptions.dietMealId)).where(eq(dietMeals.accountId, accountId)).orderBy(asc(dietItemSnapshots.dietMealItemId));
        const foodRows = await tx.select().from(foodCatalogItems).where(eq(foodCatalogItems.accountId, accountId)).orderBy(asc(foodCatalogItems.id));
        const recipeRows = await tx.select().from(recipes).where(eq(recipes.accountId, accountId)).orderBy(asc(recipes.id));
        const ingredientRows = await tx.select().from(recipeIngredients).where(eq(recipeIngredients.accountId, accountId)).orderBy(asc(recipeIngredients.id));
        const readyMealRows = await tx.select().from(readyMeals).where(eq(readyMeals.accountId, accountId)).orderBy(asc(readyMeals.id));
        const readyMealItemRows = await tx.select().from(readyMealItems).where(eq(readyMealItems.accountId, accountId)).orderBy(asc(readyMealItems.id));

        return {
          appId: BACKUP_APP_ID,
          formatVersion: BACKUP_FORMAT_VERSION,
          schemaVersion: BACKUP_SCHEMA_VERSION,
          exportedAt: this.now(),
          account: accountRows,
          objectiveOptions: objectiveRows,
          patients: patientRows,
          bodyAssessments: assessmentRows,
          nextFollowUps: followUpRows,
          dietPlans: planRows,
          dietVariations: variationRows,
          dietVariationDays: variationDayRows,
          dietMeals: mealRows,
          dietMealOptions: optionRows.map(({ row }) => row),
          dietMealItems: itemRows.map(({ row }) => row),
          dietItemSnapshots: snapshotRows.map(({ row }) => row),
          foodCatalogItems: foodRows,
          recipes: recipeRows,
          recipeIngredients: ingredientRows,
          readyMeals: readyMealRows,
          readyMealItems: readyMealItemRows,
        };
      });
    } catch (cause) {
      if (cause instanceof BackupRepositoryError) throw cause;
      throw new BackupRepositoryError('BACKUP_EXPORT_FAILED', 'O backup não pôde ser capturado da base local.', { cause });
    }
  }

  async replaceAccountSnapshot(accountId: string, snapshot: BackupEnvelope): Promise<void> {
    if (snapshot.account.length !== 1 || snapshot.account[0].id !== accountId) {
      throw repositoryFailure('A substituição não corresponde à Conta local ativa.');
    }

    try {
      await this.handle.db.transaction(async (tx) => {
        await tx.execute(sql`DELETE FROM diet_item_snapshots WHERE diet_meal_item_id IN (
          SELECT i.id FROM diet_meal_items i
          JOIN diet_meal_options o ON o.id = i.diet_meal_option_id
          JOIN diet_meals m ON m.id = o.diet_meal_id
          WHERE m.account_id = ${accountId}
        )`);
        await tx.execute(sql`DELETE FROM diet_meal_items WHERE diet_meal_option_id IN (
          SELECT o.id FROM diet_meal_options o
          JOIN diet_meals m ON m.id = o.diet_meal_id
          WHERE m.account_id = ${accountId}
        )`);
        await tx.execute(sql`DELETE FROM diet_meal_options WHERE diet_meal_id IN (
          SELECT id FROM diet_meals WHERE account_id = ${accountId}
        )`);
        await tx.delete(dietMeals).where(eq(dietMeals.accountId, accountId));
        await tx.delete(dietVariationDays).where(eq(dietVariationDays.accountId, accountId));
        await tx.delete(dietVariations).where(eq(dietVariations.accountId, accountId));
        await tx.delete(dietPlans).where(eq(dietPlans.accountId, accountId));
        await tx.delete(readyMealItems).where(eq(readyMealItems.accountId, accountId));
        await tx.delete(recipeIngredients).where(eq(recipeIngredients.accountId, accountId));
        await tx.delete(bodyAssessments).where(eq(bodyAssessments.accountId, accountId));
        await tx.delete(nextFollowUps).where(eq(nextFollowUps.accountId, accountId));
        await tx.delete(foodCatalogItems).where(eq(foodCatalogItems.accountId, accountId));
        await tx.delete(readyMeals).where(eq(readyMeals.accountId, accountId));
        await tx.delete(recipes).where(eq(recipes.accountId, accountId));
        await tx.delete(objectiveOptions).where(eq(objectiveOptions.accountId, accountId));
        await tx.delete(patients).where(eq(patients.accountId, accountId));
        await tx.delete(accounts).where(eq(accounts.id, accountId));

        if (this.failAt === 'after-delete') throw repositoryFailure('Falha simulada durante a substituição do backup.');

        if (snapshot.account.length) await tx.insert(accounts).values(snapshot.account);
        if (snapshot.objectiveOptions.length) await tx.insert(objectiveOptions).values(snapshot.objectiveOptions);
        if (snapshot.patients.length) await tx.insert(patients).values(snapshot.patients);
        if (snapshot.bodyAssessments.length) await tx.insert(bodyAssessments).values(snapshot.bodyAssessments);
        if (snapshot.nextFollowUps.length) await tx.insert(nextFollowUps).values(snapshot.nextFollowUps);
        if (snapshot.dietPlans.length) await tx.insert(dietPlans).values(snapshot.dietPlans);
        if (snapshot.dietVariations.length) await tx.insert(dietVariations).values(snapshot.dietVariations);
        if (snapshot.dietVariationDays.length) await tx.insert(dietVariationDays).values(snapshot.dietVariationDays);
        if (snapshot.dietMeals.length) await tx.insert(dietMeals).values(snapshot.dietMeals);
        if (snapshot.dietMealOptions.length) await tx.insert(dietMealOptions).values(snapshot.dietMealOptions);
        if (snapshot.dietMealItems.length) await tx.insert(dietMealItems).values(snapshot.dietMealItems);
        if (snapshot.dietItemSnapshots.length) await tx.insert(dietItemSnapshots).values(snapshot.dietItemSnapshots);
        if (snapshot.foodCatalogItems.length) await tx.insert(foodCatalogItems).values(snapshot.foodCatalogItems);
        if (snapshot.recipes.length) await tx.insert(recipes).values(snapshot.recipes);
        if (snapshot.recipeIngredients.length) await tx.insert(recipeIngredients).values(snapshot.recipeIngredients);
        if (snapshot.readyMeals.length) await tx.insert(readyMeals).values(snapshot.readyMeals);
        if (snapshot.readyMealItems.length) await tx.insert(readyMealItems).values(snapshot.readyMealItems);

        if (this.failAt === 'after-insert') throw repositoryFailure('Falha simulada após inserir o backup.');
      });
    } catch (cause) {
      if (cause instanceof BackupRepositoryError) throw cause;
      throw repositoryFailure('A base local não pôde ser substituída e foi preservada.', cause);
    }
  }
}

