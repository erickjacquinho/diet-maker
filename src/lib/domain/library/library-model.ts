import type {
  DecimalString,
  DietUnit,
  EnergySource,
  FoodState,
  JsonValue,
  MeasurementBasis,
  NutritionSnapshot,
  NutritionValues,
} from '@/lib/domain/diets/diet-model';

export type LibraryStatus = 'ACTIVE' | 'ARCHIVED';
export type LibraryFoodSourceType = 'SYSTEM_TACO' | 'ACCOUNT_CUSTOM';
export type ReadyMealItemSourceType = 'FOOD' | 'RECIPE';

export interface NutritionValuesInput {
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  energyKcal?: string;
}

export interface ServingReferenceInput {
  quantity: string;
  unit: DietUnit;
}

export interface CustomFoodInput {
  name: string;
  description?: string;
  brand?: string;
  measurementBasis: MeasurementBasis;
  foodState: FoodState;
  servingReference?: ServingReferenceInput;
  referenceNutrients: NutritionValuesInput;
  energySource?: EnergySource;
  calculationVersion?: string;
}

export interface FoodCatalogItem {
  id: string;
  accountId: string;
  sourceType: 'ACCOUNT_CUSTOM';
  name: string;
  description: string;
  brand?: string;
  measurementBasis: MeasurementBasis;
  foodState: FoodState;
  servingReference?: { quantity: DecimalString; unit: DietUnit };
  referenceNutrients: NutritionValues;
  energySource: EnergySource;
  calculationVersion: string;
  status: LibraryStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface RecipeIngredientInput {
  sourceType: LibraryFoodSourceType;
  sourceId: string;
  quantity: string;
  unit: DietUnit;
}

export interface RecipeInput {
  name: string;
  category: string;
  instructions?: string;
  prepTimeMinutes?: number;
  yieldPortions: string;
  preparedWeightGrams?: string;
  ingredients: RecipeIngredientInput[];
}

export interface RecipeNutritionSummary {
  total: NutritionValues;
  perPortion: NutritionValues;
  perPrepared100g?: NutritionValues;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  accountId: string;
  position: number;
  sourceType: LibraryFoodSourceType;
  sourceId: string;
  sourceVersion: string;
  quantity: DecimalString;
  unit: DietUnit;
  ingredientSnapshot: NutritionSnapshot;
}

export interface Recipe {
  id: string;
  accountId: string;
  name: string;
  category: string;
  instructions: string;
  prepTimeMinutes?: number;
  yieldPortions: DecimalString;
  preparedWeightGrams?: DecimalString;
  nutrition: RecipeNutritionSummary;
  status: LibraryStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  ingredients: RecipeIngredient[];
}

export interface ReadyMealItemInput {
  sourceType: ReadyMealItemSourceType;
  sourceId: string;
  quantity?: string;
  unit?: DietUnit;
  recipePortions?: string;
}

export interface ReadyMealInput {
  name: string;
  description?: string;
  suggestedTime?: string;
  items: ReadyMealItemInput[];
}

export interface ReadyMealItem {
  id: string;
  readyMealId: string;
  accountId: string;
  position: number;
  sourceType: ReadyMealItemSourceType;
  sourceId: string;
  sourceVersion: string;
  quantity?: DecimalString;
  unit?: DietUnit;
  recipePortions?: DecimalString;
  itemSnapshot: NutritionSnapshot;
}

export interface ReadyMeal {
  id: string;
  accountId: string;
  name: string;
  description: string;
  suggestedTime?: string;
  status: LibraryStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  items: ReadyMealItem[];
}

export type LibrarySnapshot = NutritionSnapshot;

export interface LibraryListFilter {
  search?: string;
  includeArchived?: boolean;
}

export interface LibraryEntityMutationResult {
  status: 'SAVED' | 'ARCHIVED' | 'RESTORED' | 'DELETED';
}

export type JsonComposition = JsonValue;
