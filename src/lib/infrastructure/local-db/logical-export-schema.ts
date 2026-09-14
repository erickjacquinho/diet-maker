import type {
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

export const BACKUP_APP_ID = 'nutridiet-local-pro' as const;
export const BACKUP_FORMAT_VERSION = 1 as const;
export const BACKUP_SCHEMA_VERSION = '5' as const;
export const LEGACY_BACKUP_SCHEMA_VERSION = '4' as const;

export const BACKUP_TABLE_NAMES = [
  'account',
  'objectiveOptions',
  'patients',
  'bodyAssessments',
  'nextFollowUps',
  'dietPlans',
  'dietVariations',
  'dietVariationDays',
  'dietMeals',
  'dietMealOptions',
  'dietMealItems',
  'dietItemSnapshots',
  'foodCatalogItems',
  'recipes',
  'recipeIngredients',
  'readyMeals',
  'readyMealItems',
] as const;

export type BackupTableName = (typeof BACKUP_TABLE_NAMES)[number];

/** Account rows from schema 4 may omit phone; normalized/current rows contain null when absent. */
export type AccountRow = Omit<typeof accounts.$inferSelect, 'phone'> & { phone?: string | null };
export type ObjectiveOptionRow = typeof objectiveOptions.$inferSelect;
export type PatientRow = typeof patients.$inferSelect;
export type BodyAssessmentRow = typeof bodyAssessments.$inferSelect;
export type NextFollowUpRow = typeof nextFollowUps.$inferSelect;
export type DietPlanRow = typeof dietPlans.$inferSelect;
export type DietVariationRow = typeof dietVariations.$inferSelect;
export type DietVariationDayRow = typeof dietVariationDays.$inferSelect;
export type DietMealRow = typeof dietMeals.$inferSelect;
export type DietMealOptionRow = typeof dietMealOptions.$inferSelect;
export type DietMealItemRow = typeof dietMealItems.$inferSelect;
export type DietItemSnapshotRow = typeof dietItemSnapshots.$inferSelect;
export type FoodCatalogItemRow = typeof foodCatalogItems.$inferSelect;
export type RecipeRow = typeof recipes.$inferSelect;
export type RecipeIngredientRow = typeof recipeIngredients.$inferSelect;
export type ReadyMealRow = typeof readyMeals.$inferSelect;
export type ReadyMealItemRow = typeof readyMealItems.$inferSelect;

export interface BackupEnvelope {
  appId: typeof BACKUP_APP_ID;
  formatVersion: typeof BACKUP_FORMAT_VERSION;
  schemaVersion: typeof BACKUP_SCHEMA_VERSION | typeof LEGACY_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  favorites: string[];
  account: AccountRow[];
  objectiveOptions: ObjectiveOptionRow[];
  patients: PatientRow[];
  bodyAssessments: BodyAssessmentRow[];
  nextFollowUps: NextFollowUpRow[];
  dietPlans: DietPlanRow[];
  dietVariations: DietVariationRow[];
  dietVariationDays: DietVariationDayRow[];
  dietMeals: DietMealRow[];
  dietMealOptions: DietMealOptionRow[];
  dietMealItems: DietMealItemRow[];
  dietItemSnapshots: DietItemSnapshotRow[];
  foodCatalogItems: FoodCatalogItemRow[];
  recipes: RecipeRow[];
  recipeIngredients: RecipeIngredientRow[];
  readyMeals: ReadyMealRow[];
  readyMealItems: ReadyMealItemRow[];
}

/** Runtime field names for strict format-one validation. */
export const BACKUP_ROW_KEYS: { readonly [K in BackupTableName]: readonly string[] } = {
  account: ['id', 'displayName', 'phone', 'createdAt', 'updatedAt'],
  objectiveOptions: ['id', 'accountId', 'label', 'normalizedLabel', 'origin', 'archivedAt', 'createdAt', 'updatedAt'],
  patients: ['id', 'accountId', 'displayCode', 'name', 'age', 'gender', 'heightCm', 'weightKg', 'maritalStatus', 'phone', 'whatsapp', 'currentObjective', 'targetProtein', 'targetCarbs', 'targetFats', 'targetKcal', 'createdAt', 'updatedAt', 'version', 'archivedAt'],
  bodyAssessments: ['id', 'accountId', 'patientId', 'clinicalDate', 'weightKg', 'bodyFatPercent', 'fatMassKg', 'leanMassKg', 'waistCm', 'scapulaCm', 'bustCm', 'abdomenCm', 'hipCm', 'leftProximalThighCm', 'rightProximalThighCm', 'neckCm', 'leftArmCm', 'rightArmCm', 'leftDistalThighCm', 'rightDistalThighCm', 'leftCalfCm', 'rightCalfCm', 'autoFilledFields', 'calculationMethod', 'calculationVersion', 'calculationInputSnapshot', 'version', 'createdAt', 'updatedAt'],
  nextFollowUps: ['accountId', 'patientId', 'dueDate', 'type', 'version', 'createdAt', 'updatedAt'],
  dietPlans: ['id', 'accountId', 'patientId', 'name', 'mode', 'status', 'weightReferenceKg', 'version', 'createdAt', 'updatedAt', 'activatedAt', 'supersededAt'],
  dietVariations: ['id', 'dietPlanId', 'accountId', 'patientId', 'position', 'kind', 'name', 'inputMode', 'targetProtein', 'targetCarbs', 'targetFat', 'targetKcal', 'gPerKgProtein', 'gPerKgCarbs', 'gPerKgFat'],
  dietVariationDays: ['variationId', 'dietPlanId', 'accountId', 'patientId', 'dayCode', 'position'],
  dietMeals: ['id', 'dietPlanId', 'variationId', 'accountId', 'patientId', 'position', 'name', 'time'],
  dietMealOptions: ['id', 'dietMealId', 'position', 'label', 'countsTowardTotals'],
  dietMealItems: ['id', 'dietMealOptionId', 'position', 'role', 'parentItemId', 'name'],
  dietItemSnapshots: ['dietMealItemId', 'sourceType', 'sourceId', 'sourceVersion', 'displayName', 'description', 'measurementBasis', 'foodState', 'referenceQuantity', 'referenceUnit', 'referenceProtein', 'referenceCarbs', 'referenceFat', 'referenceFiber', 'referenceEnergyKcal', 'prescribedQuantity', 'prescribedUnit', 'prescribedProtein', 'prescribedCarbs', 'prescribedFat', 'prescribedFiber', 'prescribedEnergyKcal', 'energySource', 'calculationVersion', 'conversionSnapshot', 'compositionSnapshot'],
  foodCatalogItems: ['id', 'accountId', 'name', 'description', 'brand', 'measurementBasis', 'foodState', 'servingReference', 'servingUnit', 'referenceProtein', 'referenceCarbs', 'referenceFat', 'referenceFiber', 'referenceEnergyKcal', 'energySource', 'calculationVersion', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt'],
  recipes: ['id', 'accountId', 'name', 'category', 'instructions', 'prepTimeMinutes', 'yieldPortions', 'preparedWeightGrams', 'totalProtein', 'totalCarbs', 'totalFat', 'totalFiber', 'totalEnergyKcal', 'perPortionProtein', 'perPortionCarbs', 'perPortionFat', 'perPortionFiber', 'perPortionEnergyKcal', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt'],
  recipeIngredients: ['id', 'recipeId', 'accountId', 'position', 'sourceType', 'sourceId', 'sourceVersion', 'quantity', 'unit', 'ingredientSnapshot'],
  readyMeals: ['id', 'accountId', 'name', 'description', 'suggestedTime', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt'],
  readyMealItems: ['id', 'readyMealId', 'accountId', 'position', 'sourceType', 'sourceId', 'sourceVersion', 'quantity', 'unit', 'recipePortions', 'itemSnapshot'],
};

export const BACKUP_ENVELOPE_KEYS = [
  'appId',
  'formatVersion',
  'schemaVersion',
  'exportedAt',
  'favorites',
  ...BACKUP_TABLE_NAMES,
] as const;
