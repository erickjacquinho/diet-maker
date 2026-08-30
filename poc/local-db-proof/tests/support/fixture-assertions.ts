import { strict as assert } from 'node:assert';
import type { ConfirmedFixture } from '../../src/contracts';

function sortRecords<T extends { id: string }>(records: T[]): T[] {
  return [...records].sort((left, right) => String(left.id).localeCompare(String(right.id)));
}

export function normalizeConfirmedFixture(fixture: ConfirmedFixture): ConfirmedFixture {
  return {
    accounts: sortRecords(fixture.accounts),
    patients: sortRecords(fixture.patients),
    recipes: sortRecords(fixture.recipes),
    recipeIngredients: sortRecords(fixture.recipeIngredients),
    dietPlans: sortRecords(fixture.dietPlans),
    dietMeals: sortRecords(fixture.dietMeals),
    dietMealItems: sortRecords(fixture.dietMealItems),
  };
}

export function assertConfirmedFixtureEqual(actual: ConfirmedFixture, expected: ConfirmedFixture): void {
  assert.deepEqual(normalizeConfirmedFixture(actual), normalizeConfirmedFixture(expected));
}

export function assertFixtureContainsRequiredCoverage(fixture: ConfirmedFixture): void {
  assert.ok(fixture.accounts.length >= 2, 'fixture must contain multiple account scopes');
  assert.ok(fixture.patients.some((patient) => patient.archived), 'fixture must contain an archived patient');
  assert.ok(fixture.dietPlans.some((plan) => plan.status === 'ACTIVE'), 'fixture must contain an ACTIVE plan');
  assert.ok(fixture.dietPlans.some((plan) => plan.status === 'SNAPSHOT'), 'fixture must contain a SNAPSHOT plan');
  assert.ok(fixture.dietMeals.length > 1, 'fixture must contain multiple meals');
  assert.ok(fixture.dietMealItems.some((item) => item.energyKcal > 0), 'fixture must contain nutritional snapshots');
}
