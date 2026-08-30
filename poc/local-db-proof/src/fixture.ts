import type {
  Account,
  ConfirmedFixture,
  DietDraft,
  DietMeal,
  DietMealItem,
  DietPlan,
  Fixture,
  Patient,
  Recipe,
  RecipeIngredient,
} from './contracts';

const timestamps = {
  first: '2026-08-30T09:00:00.000Z',
  second: '2026-08-30T09:05:00.000Z',
  third: '2026-08-30T09:10:00.000Z',
};

export const fixtureAccounts: Account[] = [
  {
    id: 'account-alpha',
    displayName: 'Consultório Alpha',
    createdAt: timestamps.first,
    updatedAt: timestamps.third,
  },
  {
    id: 'account-beta',
    displayName: 'Consultório Beta',
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
];

export const fixturePatients: Patient[] = [
  {
    id: 'patient-ana',
    accountId: 'account-alpha',
    name: 'Ana Sintética',
    archived: false,
    createdAt: timestamps.first,
    updatedAt: timestamps.third,
  },
  {
    id: 'patient-bruno',
    accountId: 'account-alpha',
    name: 'Bruno Arquivado',
    archived: true,
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
  {
    id: 'patient-carla',
    accountId: 'account-beta',
    name: 'Carla Isolada',
    archived: false,
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
];

export const fixtureRecipes: Recipe[] = [
  {
    id: 'recipe-alpha-oats',
    accountId: 'account-alpha',
    name: 'Aveia sintética com banana',
    yieldPortions: 2,
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
  {
    id: 'recipe-beta-salad',
    accountId: 'account-beta',
    name: 'Salada sintética',
    yieldPortions: 1,
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
];

export const fixtureRecipeIngredients: RecipeIngredient[] = [
  {
    id: 'recipe-ingredient-oats',
    recipeId: 'recipe-alpha-oats',
    sourceKind: 'TACO',
    sourceId: 'taco-oats',
    quantityG: 60,
  },
  {
    id: 'recipe-ingredient-banana',
    recipeId: 'recipe-alpha-oats',
    sourceKind: 'CUSTOM',
    sourceId: 'custom-banana-alpha',
    quantityG: 90,
  },
  {
    id: 'recipe-ingredient-lettuce',
    recipeId: 'recipe-beta-salad',
    sourceKind: 'TACO',
    sourceId: 'taco-lettuce',
    quantityG: 100,
  },
];

export const fixtureDietPlans: DietPlan[] = [
  {
    id: 'diet-ana-v1',
    accountId: 'account-alpha',
    patientId: 'patient-ana',
    status: 'SNAPSHOT',
    version: 1,
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
  {
    id: 'diet-ana-v2',
    accountId: 'account-alpha',
    patientId: 'patient-ana',
    status: 'ACTIVE',
    version: 2,
    createdAt: timestamps.second,
    updatedAt: timestamps.third,
  },
  {
    id: 'diet-bruno-v1',
    accountId: 'account-alpha',
    patientId: 'patient-bruno',
    status: 'ACTIVE',
    version: 1,
    createdAt: timestamps.first,
    updatedAt: timestamps.second,
  },
];

export const fixtureDietMeals: DietMeal[] = [
  { id: 'meal-ana-v1-breakfast', dietPlanId: 'diet-ana-v1', position: 0, name: 'Café da manhã' },
  { id: 'meal-ana-v2-breakfast', dietPlanId: 'diet-ana-v2', position: 0, name: 'Café da manhã' },
  { id: 'meal-ana-v2-lunch', dietPlanId: 'diet-ana-v2', position: 1, name: 'Almoço' },
  { id: 'meal-bruno-breakfast', dietPlanId: 'diet-bruno-v1', position: 0, name: 'Café da manhã' },
];

export const fixtureDietMealItems: DietMealItem[] = [
  {
    id: 'item-ana-v1-oats',
    mealId: 'meal-ana-v1-breakfast',
    sourceKind: 'TACO',
    sourceId: 'taco-oats',
    quantityG: 60,
    energyKcal: 233,
    proteinG: 10.1,
    carbsG: 39.5,
    fatG: 4.2,
  },
  {
    id: 'item-ana-v2-oats',
    mealId: 'meal-ana-v2-breakfast',
    sourceKind: 'TACO',
    sourceId: 'taco-oats',
    quantityG: 70,
    energyKcal: 272,
    proteinG: 11.8,
    carbsG: 46.1,
    fatG: 4.9,
  },
  {
    id: 'item-ana-v2-chicken',
    mealId: 'meal-ana-v2-lunch',
    sourceKind: 'CUSTOM',
    sourceId: 'custom-chicken-alpha',
    quantityG: 120,
    energyKcal: 198,
    proteinG: 37.2,
    carbsG: 0,
    fatG: 4.3,
  },
  {
    id: 'item-bruno-oats',
    mealId: 'meal-bruno-breakfast',
    sourceKind: 'TACO',
    sourceId: 'taco-oats',
    quantityG: 40,
    energyKcal: 155,
    proteinG: 6.7,
    carbsG: 26.3,
    fatG: 2.8,
  },
];

export const fixtureDrafts: DietDraft[] = [
  {
    draftId: 'draft-ana-v3',
    accountId: 'account-alpha',
    patientId: 'patient-ana',
    targetDietId: 'diet-ana-v2',
    expectedVersion: 2,
    payload: {
      title: 'Rascunho sintético',
      meals: [{ name: 'Café da manhã', itemCount: 1 }],
    },
    updatedAt: timestamps.third,
  },
];

export const fixture: Fixture = {
  version: 'fixture-v1',
  accounts: fixtureAccounts,
  patients: fixturePatients,
  recipes: fixtureRecipes,
  recipeIngredients: fixtureRecipeIngredients,
  dietPlans: fixtureDietPlans,
  dietMeals: fixtureDietMeals,
  dietMealItems: fixtureDietMealItems,
  drafts: fixtureDrafts,
};

export const confirmedFixture: ConfirmedFixture = {
  accounts: fixtureAccounts,
  patients: fixturePatients,
  recipes: fixtureRecipes,
  recipeIngredients: fixtureRecipeIngredients,
  dietPlans: fixtureDietPlans,
  dietMeals: fixtureDietMeals,
  dietMealItems: fixtureDietMealItems,
};

export function cloneFixture(): Fixture {
  return structuredClone(fixture);
}

export function cloneConfirmedFixture(): ConfirmedFixture {
  return structuredClone(confirmedFixture);
}
