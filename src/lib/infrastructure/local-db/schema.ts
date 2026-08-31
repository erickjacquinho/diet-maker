import { sql } from 'drizzle-orm';
import {
  check,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  numeric,
  primaryKey,
  real,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const objectiveOptions = pgTable(
  'objective_options',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    normalizedLabel: text('normalized_label').notNull(),
    origin: text('origin').notNull(),
    archivedAt: text('archived_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('objective_options_active_label_idx')
      .on(table.accountId, table.normalizedLabel)
      .where(sql`${table.archivedAt} IS NULL`),
    index('objective_options_account_idx').on(table.accountId),
    check('objective_options_origin_check', sql`${table.origin} in ('SYSTEM', 'CUSTOM')`),
  ],
);

export const patients = pgTable(
  'patients',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    displayCode: text('display_code').notNull(),
    name: text('name').notNull(),
    age: integer('age').notNull(),
    gender: text('gender').notNull(),
    heightCm: real('height_cm').notNull(),
    weightKg: real('weight_kg').notNull(),
    maritalStatus: text('marital_status'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    currentObjective: text('current_objective').notNull(),
    targetProtein: real('target_protein').notNull(),
    targetCarbs: real('target_carbs').notNull(),
    targetFats: real('target_fats').notNull(),
    targetKcal: real('target_kcal').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    version: integer('version').notNull(),
    archivedAt: text('archived_at'),
  },
  (table) => [
    index('patients_account_idx').on(table.accountId),
    uniqueIndex('patients_account_display_code_idx').on(table.accountId, table.displayCode),
    uniqueIndex('patients_account_id_id_idx').on(table.accountId, table.id),
    check('patients_age_non_negative', sql`${table.age} >= 0`),
    check('patients_height_positive', sql`${table.heightCm} > 0`),
    check('patients_weight_positive', sql`${table.weightKg} > 0`),
    check('patients_macros_non_negative', sql`${table.targetProtein} >= 0 and ${table.targetCarbs} >= 0 and ${table.targetFats} >= 0 and ${table.targetKcal} >= 0`),
    check('patients_version_positive', sql`${table.version} > 0`),
  ],
);

export const dietPlans = pgTable(
  'diet_plans',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    patientId: text('patient_id').notNull(),
    name: text('name').notNull(),
    mode: text('mode').notNull(),
    status: text('status').notNull(),
    weightReferenceKg: numeric('weight_reference_kg'),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    activatedAt: text('activated_at').notNull(),
    supersededAt: text('superseded_at'),
  },
  (table) => [
    uniqueIndex('diet_plans_one_active_idx').on(table.accountId, table.patientId).where(sql`${table.status} = 'ACTIVE'`),
    uniqueIndex('diet_plans_scope_identity_idx').on(table.id, table.accountId, table.patientId),
  ],
);

export const dietVariations = pgTable('diet_variations', {
  id: text('id').primaryKey(), dietPlanId: text('diet_plan_id').notNull(), accountId: text('account_id').notNull(), patientId: text('patient_id').notNull(),
  position: integer('position').notNull(), kind: text('kind').notNull(), name: text('name').notNull(), inputMode: text('input_mode').notNull(),
  targetProtein: numeric('target_protein').notNull(), targetCarbs: numeric('target_carbs').notNull(), targetFat: numeric('target_fat').notNull(), targetKcal: numeric('target_kcal').notNull(),
  gPerKgProtein: numeric('g_per_kg_protein'), gPerKgCarbs: numeric('g_per_kg_carbs'), gPerKgFat: numeric('g_per_kg_fat'),
});

export const dietVariationDays = pgTable('diet_variation_days', {
  variationId: text('variation_id').notNull(), dietPlanId: text('diet_plan_id').notNull(), accountId: text('account_id').notNull(), patientId: text('patient_id').notNull(), dayCode: text('day_code').notNull(), position: integer('position').notNull(),
}, (table) => [primaryKey({ columns: [table.variationId, table.dayCode] })]);

export const dietMeals = pgTable('diet_meals', {
  id: text('id').primaryKey(), dietPlanId: text('diet_plan_id').notNull(), variationId: text('variation_id').notNull(), accountId: text('account_id').notNull(), patientId: text('patient_id').notNull(), position: integer('position').notNull(), name: text('name').notNull(), time: text('time'),
});

export const dietMealOptions = pgTable('diet_meal_options', {
  id: text('id').primaryKey(), dietMealId: text('diet_meal_id').notNull(), position: integer('position').notNull(), label: text('label').notNull(), countsTowardTotals: boolean('counts_toward_totals').notNull(),
});

export const dietMealItems = pgTable('diet_meal_items', {
  id: text('id').primaryKey(), dietMealOptionId: text('diet_meal_option_id').notNull(), position: integer('position').notNull(), role: text('role').notNull(), parentItemId: text('parent_item_id'), name: text('name').notNull(),
});

export const dietItemSnapshots = pgTable('diet_item_snapshots', {
  dietMealItemId: text('diet_meal_item_id').primaryKey(), sourceType: text('source_type').notNull(), sourceId: text('source_id').notNull(), sourceVersion: text('source_version').notNull(), displayName: text('display_name').notNull(), description: text('description').notNull(), measurementBasis: text('measurement_basis').notNull(), foodState: text('food_state').notNull(), referenceQuantity: numeric('reference_quantity').notNull(), referenceUnit: text('reference_unit').notNull(), referenceProtein: numeric('reference_protein').notNull(), referenceCarbs: numeric('reference_carbs').notNull(), referenceFat: numeric('reference_fat').notNull(), referenceFiber: numeric('reference_fiber').notNull(), referenceEnergyKcal: numeric('reference_energy_kcal'), prescribedQuantity: numeric('prescribed_quantity').notNull(), prescribedUnit: text('prescribed_unit').notNull(), prescribedProtein: numeric('prescribed_protein').notNull(), prescribedCarbs: numeric('prescribed_carbs').notNull(), prescribedFat: numeric('prescribed_fat').notNull(), prescribedFiber: numeric('prescribed_fiber').notNull(), prescribedEnergyKcal: numeric('prescribed_energy_kcal'), energySource: text('energy_source').notNull(), calculationVersion: text('calculation_version').notNull(), conversionSnapshot: jsonb('conversion_snapshot').notNull(), compositionSnapshot: jsonb('composition_snapshot').notNull(),
});

export const schema = { accounts, objectiveOptions, patients, dietPlans, dietVariations, dietVariationDays, dietMeals, dietMealOptions, dietMealItems, dietItemSnapshots };
export type LocalDbSchema = typeof schema;
