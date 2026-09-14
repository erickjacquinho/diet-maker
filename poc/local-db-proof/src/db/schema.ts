import { sql } from 'drizzle-orm';
import {
  check,
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  real,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const patients = pgTable(
  'patients',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    archived: boolean('archived').notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    unique('patients_account_id_id').on(table.accountId, table.id),
    index('patients_account_id_idx').on(table.accountId),
  ],
);

export const recipes = pgTable('recipes', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  yieldPortions: integer('yield_portions').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  check('recipes_yield_portions_positive', sql`${table.yieldPortions} > 0`),
]);

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  sourceKind: text('source_kind').notNull(),
  sourceId: text('source_id').notNull(),
  quantityG: integer('quantity_g').notNull(),
}, (table) => [
  check('recipe_ingredients_source_kind_check', sql`${table.sourceKind} in ('TACO', 'CUSTOM')`),
  check('recipe_ingredients_quantity_positive', sql`${table.quantityG} > 0`),
]);

export const dietPlans = pgTable(
  'diet_plans',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
    patientId: text('patient_id').notNull(),
    status: text('status').notNull(),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    fixtureMetadata: text('fixture_metadata').notNull().default('{}'),
  },
  (table) => [
    foreignKey({
      name: 'diet_plans_account_patient_fk',
      columns: [table.accountId, table.patientId],
      foreignColumns: [patients.accountId, patients.id],
    }).onDelete('restrict'),
    uniqueIndex('diet_plans_one_active_per_patient').on(table.patientId).where(sql`${table.status} = 'ACTIVE'`),
    check('diet_plans_status_check', sql`${table.status} in ('ACTIVE', 'SNAPSHOT')`),
    check('diet_plans_version_positive', sql`${table.version} > 0`),
  ],
);

export const dietMeals = pgTable('diet_meals', {
  id: text('id').primaryKey(),
  dietPlanId: text('diet_plan_id').notNull().references(() => dietPlans.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  name: text('name').notNull(),
}, (table) => [
  unique('diet_meals_plan_position').on(table.dietPlanId, table.position),
  check('diet_meals_position_non_negative', sql`${table.position} >= 0`),
]);

export const dietMealItems = pgTable('diet_meal_items', {
  id: text('id').primaryKey(),
  mealId: text('meal_id').notNull().references(() => dietMeals.id, { onDelete: 'cascade' }),
  sourceKind: text('source_kind').notNull(),
  sourceId: text('source_id').notNull(),
  quantityG: integer('quantity_g').notNull(),
  energyKcal: real('energy_kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
}, (table) => [
  check('diet_meal_items_source_kind_check', sql`${table.sourceKind} in ('TACO', 'CUSTOM')`),
  check('diet_meal_items_quantity_positive', sql`${table.quantityG} > 0`),
  check('diet_meal_items_nutrition_non_negative', sql`${table.energyKcal} >= 0 and ${table.proteinG} >= 0 and ${table.carbsG} >= 0 and ${table.fatG} >= 0`),
]);

export const schema = {
  accounts,
  patients,
  recipes,
  recipeIngredients,
  dietPlans,
  dietMeals,
  dietMealItems,
};

export type Schema = typeof schema;
