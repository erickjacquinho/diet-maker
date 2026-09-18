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
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const profileCheckpointState = pgTable(
  'profile_checkpoint_state',
  {
    accountId: text('account_id').primaryKey().references(() => accounts.id, { onDelete: 'cascade' }),
    workspaceRevision: integer('workspace_revision').notNull().default(0),
    checkpointRevision: integer('checkpoint_revision').notNull().default(0),
  },
  (table) => [
    check('profile_checkpoint_state_revisions_non_negative', sql`${table.workspaceRevision} >= 0 and ${table.checkpointRevision} >= 0`),
    check('profile_checkpoint_state_checkpoint_not_ahead', sql`${table.checkpointRevision} <= ${table.workspaceRevision}`),
  ],
);

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
    age: integer('age'),
    gender: text('gender').notNull(),
    birthDate: text('birth_date'),
    isPregnant: boolean('is_pregnant').notNull().default(false),
    pregnancyDueDate: text('pregnancy_due_date'),
    heightCm: real('height_cm'),
    weightKg: real('weight_kg'),
    maritalStatus: text('marital_status'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    currentObjective: text('current_objective'),
    targetProtein: real('target_protein'),
    targetCarbs: real('target_carbs'),
    targetFats: real('target_fats'),
    targetKcal: real('target_kcal'),
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

export const bodyAssessments = pgTable(
  'body_assessments',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    patientId: text('patient_id').notNull(),
    clinicalDate: text('clinical_date').notNull(),
    weightKg: numeric('weight_kg').notNull(),
    bodyFatPercent: numeric('body_fat_percent'),
    fatMassKg: numeric('fat_mass_kg'),
    leanMassKg: numeric('lean_mass_kg'),
    waistCm: numeric('waist_cm'),
    scapulaCm: numeric('scapula_cm'),
    bustCm: numeric('bust_cm'),
    abdomenCm: numeric('abdomen_cm'),
    hipCm: numeric('hip_cm'),
    leftProximalThighCm: numeric('left_proximal_thigh_cm'),
    rightProximalThighCm: numeric('right_proximal_thigh_cm'),
    neckCm: numeric('neck_cm'),
    leftArmCm: numeric('left_arm_cm'),
    rightArmCm: numeric('right_arm_cm'),
    leftDistalThighCm: numeric('left_distal_thigh_cm'),
    rightDistalThighCm: numeric('right_distal_thigh_cm'),
    leftCalfCm: numeric('left_calf_cm'),
    rightCalfCm: numeric('right_calf_cm'),
    autoFilledFields: jsonb('auto_filled_fields').notNull(),
    calculationMethod: text('calculation_method').notNull(),
    calculationVersion: text('calculation_version').notNull(),
    calculationInputSnapshot: jsonb('calculation_input_snapshot').notNull(),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('body_assessments_scope_identity_idx').on(table.id, table.accountId, table.patientId),
    index('body_assessments_patient_date_idx').on(table.accountId, table.patientId, table.clinicalDate, table.createdAt, table.id),
    check('body_assessments_body_fat_range', sql`${table.calculationMethod} = 'NONE' or (${table.bodyFatPercent} >= 0 and ${table.bodyFatPercent} <= 100)`),
    check('body_assessments_results_non_negative', sql`${table.calculationMethod} = 'NONE' or (${table.fatMassKg} >= 0 and ${table.leanMassKg} >= 0)`),
    check('body_assessments_required_measurements_positive', sql`${table.calculationMethod} = 'NONE' or (${table.weightKg} > 0 and ${table.waistCm} > 0 and ${table.scapulaCm} > 0 and ${table.bustCm} > 0 and ${table.abdomenCm} > 0 and ${table.hipCm} > 0 and ${table.leftProximalThighCm} > 0 and ${table.rightProximalThighCm} > 0)`),
    check('body_assessments_optional_measurements_positive', sql`(${table.neckCm} IS NULL OR ${table.neckCm} > 0) and (${table.leftArmCm} IS NULL OR ${table.leftArmCm} > 0) and (${table.rightArmCm} IS NULL OR ${table.rightArmCm} > 0) and (${table.leftDistalThighCm} IS NULL OR ${table.leftDistalThighCm} > 0) and (${table.rightDistalThighCm} IS NULL OR ${table.rightDistalThighCm} > 0) and (${table.leftCalfCm} IS NULL OR ${table.leftCalfCm} > 0) and (${table.rightCalfCm} IS NULL OR ${table.rightCalfCm} > 0) and (${table.waistCm} IS NULL OR ${table.waistCm} > 0) and (${table.abdomenCm} IS NULL OR ${table.abdomenCm} > 0) and (${table.hipCm} IS NULL OR ${table.hipCm} > 0)`),
    check('body_assessments_version_positive', sql`${table.version} > 0`),
    check('body_assessments_calculation_method_check', sql`${table.calculationMethod} IN ('US_NAVY', 'NONE')`),
  ],
);

export const nextFollowUps = pgTable(
  'next_follow_ups',
  {
    accountId: text('account_id').notNull(),
    patientId: text('patient_id').notNull(),
    dueDate: text('due_date').notNull(),
    type: text('type').notNull(),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.accountId, table.patientId] }),
    index('next_follow_ups_due_date_idx').on(table.accountId, table.dueDate, table.patientId),
    check('next_follow_ups_type_check', sql`${table.type} in ('ASSESSMENT_UPDATE', 'DIET_UPDATE')`),
    check('next_follow_ups_version_positive', sql`${table.version} > 0`),
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

export const dietVariationHistorySummaries = pgTable(
  'diet_variation_history_summaries',
  {
    dietVariationId: text('diet_variation_id').primaryKey().references(() => dietVariations.id, { onDelete: 'cascade' }),
    prescribedProtein: numeric('prescribed_protein').notNull(),
    prescribedCarbs: numeric('prescribed_carbs').notNull(),
    prescribedFat: numeric('prescribed_fat').notNull(),
    prescribedEnergyKcal: numeric('prescribed_energy_kcal').notNull(),
  },
  (table) => [
    check('diet_variation_history_summaries_values_non_negative', sql`${table.prescribedProtein} >= 0 and ${table.prescribedCarbs} >= 0 and ${table.prescribedFat} >= 0 and ${table.prescribedEnergyKcal} >= 0`),
  ],
);

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

export const foodCatalogItems = pgTable(
  'food_catalog_items',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    brand: text('brand'),
    measurementBasis: text('measurement_basis').notNull(),
    foodState: text('food_state').notNull(),
    servingReference: numeric('serving_reference'),
    servingUnit: text('serving_unit'),
    referenceProtein: numeric('reference_protein').notNull(),
    referenceCarbs: numeric('reference_carbs').notNull(),
    referenceFat: numeric('reference_fat').notNull(),
    referenceFiber: numeric('reference_fiber').notNull(),
    referenceEnergyKcal: numeric('reference_energy_kcal'),
    energySource: text('energy_source').notNull(),
    calculationVersion: text('calculation_version').notNull(),
    status: text('status').notNull(),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    archivedAt: text('archived_at'),
  },
  (table) => [
    index('food_catalog_items_account_idx').on(table.accountId),
    index('food_catalog_items_account_status_idx').on(table.accountId, table.status),
    check('food_catalog_items_measurement_basis_check', sql.raw("measurement_basis in ('PER_100G', 'PER_100ML', 'PER_UNIT')")),
    check('food_catalog_items_food_state_check', sql.raw("food_state in ('RAW', 'COOKED', 'PREPARED', 'AS_SOLD')")),
    check('food_catalog_items_status_check', sql.raw("status in ('ACTIVE', 'ARCHIVED')")),
    check('food_catalog_items_version_positive', sql.raw('version > 0')),
    check('food_catalog_items_nutrients_non_negative', sql.raw('reference_protein >= 0 and reference_carbs >= 0 and reference_fat >= 0 and reference_fiber >= 0 and (reference_energy_kcal is null or reference_energy_kcal >= 0)')),
  ],
);

export const recipes = pgTable(
  'recipes',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category').notNull(),
    instructions: text('instructions').notNull(),
    prepTimeMinutes: integer('prep_time_minutes'),
    yieldPortions: numeric('yield_portions').notNull(),
    preparedWeightGrams: numeric('prepared_weight_grams'),
    totalProtein: numeric('total_protein').notNull(),
    totalCarbs: numeric('total_carbs').notNull(),
    totalFat: numeric('total_fat').notNull(),
    totalFiber: numeric('total_fiber').notNull(),
    totalEnergyKcal: numeric('total_energy_kcal'),
    perPortionProtein: numeric('per_portion_protein').notNull(),
    perPortionCarbs: numeric('per_portion_carbs').notNull(),
    perPortionFat: numeric('per_portion_fat').notNull(),
    perPortionFiber: numeric('per_portion_fiber').notNull(),
    perPortionEnergyKcal: numeric('per_portion_energy_kcal'),
    status: text('status').notNull(),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    archivedAt: text('archived_at'),
  },
  (table) => [
    uniqueIndex('recipes_id_account_idx').on(table.id, table.accountId),
    index('recipes_account_idx').on(table.accountId),
    index('recipes_account_status_idx').on(table.accountId, table.status),
    check('recipes_yield_positive', sql.raw('yield_portions > 0')),
    check('recipes_prepared_weight_positive', sql.raw('prepared_weight_grams is null or prepared_weight_grams > 0')),
    check('recipes_status_check', sql.raw("status in ('ACTIVE', 'ARCHIVED')")),
    check('recipes_version_positive', sql.raw('version > 0')),
  ],
);

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: text('id').primaryKey(),
    recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    position: integer('position').notNull(),
    sourceType: text('source_type').notNull(),
    sourceId: text('source_id').notNull(),
    sourceVersion: text('source_version').notNull(),
    quantity: numeric('quantity').notNull(),
    unit: text('unit').notNull(),
    ingredientSnapshot: jsonb('ingredient_snapshot').notNull(),
  },
  (table) => [
    uniqueIndex('recipe_ingredients_recipe_position_idx').on(table.recipeId, table.position),
    index('recipe_ingredients_account_source_idx').on(table.accountId, table.sourceType, table.sourceId),
    check('recipe_ingredients_position_non_negative', sql.raw('position >= 0')),
    check('recipe_ingredients_source_type_check', sql.raw("source_type in ('SYSTEM_TACO', 'ACCOUNT_CUSTOM')")),
    check('recipe_ingredients_quantity_positive', sql.raw('quantity > 0')),
    check('recipe_ingredients_unit_check', sql.raw("unit in ('g', 'ml', 'unit')")),
  ],
);

export const readyMeals = pgTable(
  'ready_meals',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    suggestedTime: text('suggested_time'),
    status: text('status').notNull(),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    archivedAt: text('archived_at'),
  },
  (table) => [
    uniqueIndex('ready_meals_id_account_idx').on(table.id, table.accountId),
    index('ready_meals_account_idx').on(table.accountId),
    index('ready_meals_account_status_idx').on(table.accountId, table.status),
    check('ready_meals_status_check', sql.raw("status in ('ACTIVE', 'ARCHIVED')")),
    check('ready_meals_version_positive', sql.raw('version > 0')),
  ],
);

export const readyMealItems = pgTable(
  'ready_meal_items',
  {
    id: text('id').primaryKey(),
    readyMealId: text('ready_meal_id').notNull().references(() => readyMeals.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    position: integer('position').notNull(),
    sourceType: text('source_type').notNull(),
    sourceId: text('source_id').notNull(),
    sourceVersion: text('source_version').notNull(),
    quantity: numeric('quantity'),
    unit: text('unit'),
    recipePortions: numeric('recipe_portions'),
    itemSnapshot: jsonb('item_snapshot').notNull(),
  },
  (table) => [
    uniqueIndex('ready_meal_items_meal_position_idx').on(table.readyMealId, table.position),
    index('ready_meal_items_account_source_idx').on(table.accountId, table.sourceType, table.sourceId),
    check('ready_meal_items_position_non_negative', sql.raw('position >= 0')),
    check('ready_meal_items_source_type_check', sql.raw("source_type in ('FOOD', 'RECIPE')")),
    check('ready_meal_items_quantity_or_portions_check', sql.raw("(source_type = 'FOOD' and quantity > 0 and unit in ('g', 'ml', 'unit') and recipe_portions is null) or (source_type = 'RECIPE' and recipe_portions > 0 and quantity is null and unit is null)")),
  ],
);

export const schema = {
  accounts,
  profileCheckpointState,
  objectiveOptions,
  patients,
  bodyAssessments,
  nextFollowUps,
  dietPlans,
  dietVariations,
  dietVariationHistorySummaries,
  dietVariationDays,
  dietMeals,
  dietMealOptions,
  dietMealItems,
  dietItemSnapshots,
  foodCatalogItems,
  recipes,
  recipeIngredients,
  readyMeals,
  readyMealItems,
};
export type LocalDbSchema = typeof schema;
