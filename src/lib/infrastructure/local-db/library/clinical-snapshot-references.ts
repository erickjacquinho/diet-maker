import { and, eq, or, sql } from 'drizzle-orm';
import type { LocalDatabaseHandle } from '../client';
import { dietItemSnapshots, dietMealItems, dietMealOptions, dietMeals, dietPlans } from '../schema';

export type LibrarySnapshotSourceType = 'ACCOUNT_CUSTOM' | 'RECIPE' | 'READY_MEAL';

/**
 * Finds persisted clinical snapshots for a library source within one Account.
 * Drafts are not stored in these tables, so every matching persisted row is a
 * confirmed diet origin that must keep the catalog entity available for audit.
 */
export async function findClinicalSnapshotReferences(
  handle: LocalDatabaseHandle,
  accountId: string,
  sourceType: LibrarySnapshotSourceType,
  sourceId: string,
): Promise<Array<{ id: string }>> {
  const directReference = and(
    eq(dietItemSnapshots.sourceType, sourceType),
    eq(dietItemSnapshots.sourceId, sourceId),
  );
  const sourceReference = sourceType === 'READY_MEAL'
    ? or(
      directReference,
      sql`${dietItemSnapshots.compositionSnapshot}->'readyMealSource'->>'sourceId' = ${sourceId}`,
    )
    : directReference;

  return handle.db
    .select({ id: dietItemSnapshots.dietMealItemId })
    .from(dietItemSnapshots)
    .innerJoin(dietMealItems, eq(dietMealItems.id, dietItemSnapshots.dietMealItemId))
    .innerJoin(dietMealOptions, eq(dietMealOptions.id, dietMealItems.dietMealOptionId))
    .innerJoin(dietMeals, eq(dietMeals.id, dietMealOptions.dietMealId))
    .innerJoin(dietPlans, eq(dietPlans.id, dietMeals.dietPlanId))
    .where(
      and(
        eq(dietPlans.accountId, accountId),
        sourceReference,
      ),
    );
}
