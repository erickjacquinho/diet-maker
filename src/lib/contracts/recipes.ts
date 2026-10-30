import type { DecimalString, DietUnit, NutritionSnapshot, NutritionValues } from '@/lib/domain/diets/diet-model';
import type { LibraryStatus, RecipeYieldUnit } from '@/lib/domain/library/library-model';
import { parseNutritionSnapshot, parseNutritionValues } from './diets';

/** Wire contracts for `/api/v1/library/recipes` and `/ready-meals`. Shared by browser and server. */

export interface RecipeIngredientInputDto {
  sourceType: 'SYSTEM_TACO' | 'ACCOUNT_CUSTOM';
  sourceId: string;
  quantity: string;
  unit: DietUnit;
}

export interface RecipeInputDto {
  name: string;
  category: string;
  instructions?: string;
  prepTimeMinutes?: number;
  yieldPortions: string;
  yieldUnit?: RecipeYieldUnit;
  preparedWeightGrams?: string;
  ingredients: RecipeIngredientInputDto[];
}

export interface RecipeDto {
  id: string;
  name: string;
  category: string;
  instructions: string;
  prepTimeMinutes?: number;
  yieldPortions: DecimalString;
  yieldUnit: RecipeYieldUnit;
  preparedWeightGrams?: DecimalString;
  nutrition: { total: NutritionValues; perPortion: NutritionValues; perPrepared100g?: NutritionValues };
  status: LibraryStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  ingredients: Array<{
    position: number;
    sourceType: 'SYSTEM_TACO' | 'ACCOUNT_CUSTOM';
    sourceId: string;
    sourceVersion: string;
    quantity: DecimalString;
    unit: DietUnit;
    ingredientSnapshot: NutritionSnapshot;
  }>;
}

export interface ReadyMealItemInputDto {
  sourceType: 'FOOD' | 'RECIPE';
  sourceId: string;
  quantity?: string;
  unit?: DietUnit;
  recipePortions?: string;
  recipeUnit?: RecipeYieldUnit;
}

export interface ReadyMealInputDto {
  name: string;
  description?: string;
  suggestedTime?: string;
  items: ReadyMealItemInputDto[];
}

export interface ReadyMealDto {
  id: string;
  name: string;
  description: string;
  suggestedTime?: string;
  status: LibraryStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  items: Array<{
    position: number;
    sourceType: 'FOOD' | 'RECIPE';
    sourceId: string;
    sourceVersion: string;
    quantity?: DecimalString;
    unit?: DietUnit;
    recipePortions?: DecimalString;
    itemSnapshot: NutritionSnapshot;
  }>;
}

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const sourceIdPattern = /^[A-Za-z0-9_.:-]{1,100}$/;
const decimalPattern = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const units: readonly DietUnit[] = ['g', 'ml', 'unit'];
const yieldUnits: readonly RecipeYieldUnit[] = ['PORTION', 'g', 'ml', 'unit'];

function record(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object.');
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) if (!allowed.includes(key)) throw new TypeError('Unknown field.');
  return source;
}

const present = (value: unknown) => value !== undefined && value !== null;

function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || value.length > max) throw new TypeError('Invalid text.');
  return value;
}

function decimal(value: unknown): string {
  if (typeof value !== 'string' || value.length > 40 || !decimalPattern.test(value)) throw new TypeError('Invalid decimal.');
  return value;
}

function oneOf<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== 'string' || !options.includes(value as T)) throw new TypeError('Invalid option.');
  return value as T;
}

function uuid(value: unknown): string {
  if (typeof value !== 'string' || !uuidPattern.test(value)) throw new TypeError('Invalid id.');
  return value.toLowerCase();
}

function sourceId(value: unknown): string {
  if (typeof value !== 'string' || !sourceIdPattern.test(value)) throw new TypeError('Invalid source id.');
  return value;
}

function list<T>(value: unknown, parse: (item: unknown) => T, max: number): T[] {
  if (!Array.isArray(value) || value.length > max) throw new TypeError('Invalid list.');
  return value.map(parse);
}

/** Strict parser: status, version, snapshots and totals are computed by the server. */
export function parseRecipeInput(value: unknown): RecipeInputDto {
  const v = record(value, ['name', 'category', 'instructions', 'prepTimeMinutes', 'yieldPortions', 'yieldUnit', 'preparedWeightGrams', 'ingredients']);
  if (present(v.prepTimeMinutes) && (!Number.isSafeInteger(v.prepTimeMinutes) || (v.prepTimeMinutes as number) < 0 || (v.prepTimeMinutes as number) > 100_000)) {
    throw new TypeError('Invalid minutes.');
  }
  return {
    name: text(v.name, 200), category: text(v.category, 100),
    ...(present(v.instructions) ? { instructions: text(v.instructions, 10_000) } : {}),
    ...(present(v.prepTimeMinutes) ? { prepTimeMinutes: v.prepTimeMinutes as number } : {}),
    yieldPortions: decimal(v.yieldPortions),
    ...(present(v.yieldUnit) ? { yieldUnit: oneOf(v.yieldUnit, yieldUnits) } : {}),
    ...(present(v.preparedWeightGrams) ? { preparedWeightGrams: decimal(v.preparedWeightGrams) } : {}),
    ingredients: list(v.ingredients, (entry) => {
      const i = record(entry, ['sourceType', 'sourceId', 'quantity', 'unit']);
      return { sourceType: oneOf(i.sourceType, ['SYSTEM_TACO', 'ACCOUNT_CUSTOM'] as const), sourceId: sourceId(i.sourceId), quantity: decimal(i.quantity), unit: oneOf(i.unit, units) };
    }, 100),
  };
}

export function parseReadyMealInput(value: unknown): ReadyMealInputDto {
  const v = record(value, ['name', 'description', 'suggestedTime', 'items']);
  return {
    name: text(v.name, 200),
    ...(present(v.description) ? { description: text(v.description, 2000) } : {}),
    ...(present(v.suggestedTime) ? { suggestedTime: text(v.suggestedTime, 20) } : {}),
    items: list(v.items, (entry) => {
      const i = record(entry, ['sourceType', 'sourceId', 'quantity', 'unit', 'recipePortions', 'recipeUnit']);
      return {
        sourceType: oneOf(i.sourceType, ['FOOD', 'RECIPE'] as const), sourceId: sourceId(i.sourceId),
        ...(present(i.quantity) ? { quantity: decimal(i.quantity) } : {}),
        ...(present(i.unit) ? { unit: oneOf(i.unit, units) } : {}),
        ...(present(i.recipePortions) ? { recipePortions: decimal(i.recipePortions) } : {}),
        ...(present(i.recipeUnit) ? { recipeUnit: oneOf(i.recipeUnit, yieldUnits) } : {}),
      };
    }, 100),
  };
}

export function parseCreateRecipeRequest(value: unknown): { id: string; recipe: RecipeInputDto } {
  const v = record(value, ['id', 'recipe']);
  return { id: uuid(v.id), recipe: parseRecipeInput(v.recipe) };
}

export function parseUpdateRecipeRequest(value: unknown): RecipeInputDto {
  return parseRecipeInput(record(value, ['recipe']).recipe);
}

export function parseCreateReadyMealRequest(value: unknown): { id: string; readyMeal: ReadyMealInputDto } {
  const v = record(value, ['id', 'readyMeal']);
  return { id: uuid(v.id), readyMeal: parseReadyMealInput(v.readyMeal) };
}

export function parseUpdateReadyMealRequest(value: unknown): ReadyMealInputDto {
  return parseReadyMealInput(record(value, ['readyMeal']).readyMeal);
}

export function parseLibraryListQuery(search: URLSearchParams): { search?: string; includeArchived: boolean } {
  const term = search.get('search');
  if (term !== null && term.length > 200) throw new TypeError('Invalid search.');
  const archived = search.get('includeArchived');
  if (archived !== null && archived !== 'true' && archived !== 'false') throw new TypeError('Invalid flag.');
  return { ...(term ? { search: term } : {}), includeArchived: archived === 'true' };
}

function status(value: unknown): LibraryStatus {
  return value === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE';
}

const nullable = (value: unknown) => (present(value) ? String(value) : null);

/** Output allowlist: rebuilds the recipe from public fields only. */
export function parseRecipeDto(value: unknown): RecipeDto {
  const r = record(value, ['id', 'name', 'category', 'instructions', 'prepTimeMinutes', 'yieldPortions', 'yieldUnit', 'preparedWeightGrams', 'nutrition', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt', 'ingredients', 'accountId']);
  const n = record(r.nutrition, ['total', 'perPortion', 'perPrepared100g']);
  return {
    id: String(r.id), name: String(r.name), category: String(r.category), instructions: String(r.instructions ?? ''),
    ...(present(r.prepTimeMinutes) ? { prepTimeMinutes: Number(r.prepTimeMinutes) } : {}),
    yieldPortions: decimal(r.yieldPortions) as DecimalString, yieldUnit: oneOf(r.yieldUnit, yieldUnits),
    ...(present(r.preparedWeightGrams) ? { preparedWeightGrams: decimal(r.preparedWeightGrams) as DecimalString } : {}),
    nutrition: {
      total: parseNutritionValues(n.total), perPortion: parseNutritionValues(n.perPortion),
      ...(present(n.perPrepared100g) ? { perPrepared100g: parseNutritionValues(n.perPrepared100g) } : {}),
    },
    status: status(r.status), version: Number(r.version), createdAt: String(r.createdAt), updatedAt: String(r.updatedAt),
    archivedAt: nullable(r.archivedAt),
    ingredients: list(r.ingredients, (entry) => {
      const i = record(entry, ['position', 'sourceType', 'sourceId', 'sourceVersion', 'quantity', 'unit', 'ingredientSnapshot']);
      return {
        position: Number(i.position), sourceType: oneOf(i.sourceType, ['SYSTEM_TACO', 'ACCOUNT_CUSTOM'] as const), sourceId: String(i.sourceId),
        sourceVersion: String(i.sourceVersion), quantity: decimal(i.quantity) as DecimalString, unit: oneOf(i.unit, units),
        ingredientSnapshot: parseNutritionSnapshot(i.ingredientSnapshot),
      };
    }, 100),
  };
}

export function parseRecipeListDto(value: unknown): { items: RecipeDto[] } {
  return { items: list(record(value, ['items']).items, parseRecipeDto, 1000) };
}

export function parseReadyMealDto(value: unknown): ReadyMealDto {
  const m = record(value, ['id', 'name', 'description', 'suggestedTime', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt', 'items', 'accountId']);
  return {
    id: String(m.id), name: String(m.name), description: String(m.description ?? ''),
    ...(present(m.suggestedTime) ? { suggestedTime: String(m.suggestedTime) } : {}),
    status: status(m.status), version: Number(m.version), createdAt: String(m.createdAt), updatedAt: String(m.updatedAt),
    archivedAt: nullable(m.archivedAt),
    items: list(m.items, (entry) => {
      const i = record(entry, ['position', 'sourceType', 'sourceId', 'sourceVersion', 'quantity', 'unit', 'recipePortions', 'itemSnapshot']);
      return {
        position: Number(i.position), sourceType: oneOf(i.sourceType, ['FOOD', 'RECIPE'] as const), sourceId: String(i.sourceId),
        sourceVersion: String(i.sourceVersion),
        ...(present(i.quantity) ? { quantity: decimal(i.quantity) as DecimalString } : {}),
        ...(present(i.unit) ? { unit: oneOf(i.unit, units) } : {}),
        ...(present(i.recipePortions) ? { recipePortions: decimal(i.recipePortions) as DecimalString } : {}),
        itemSnapshot: parseNutritionSnapshot(i.itemSnapshot),
      };
    }, 100),
  };
}

export function parseReadyMealListDto(value: unknown): { items: ReadyMealDto[] } {
  return { items: list(record(value, ['items']).items, parseReadyMealDto, 1000) };
}
