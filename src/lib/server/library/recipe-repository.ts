import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import { createTacoSnapshot, listTacoFoods } from '@/lib/application/diets/taco-food-adapter';
import {
  createDecimalString,
  type DecimalString,
  type DietUnit,
  type NutritionSnapshot,
  type NutritionValues,
} from '@/lib/domain/diets/diet-model';
import { LibraryValidationError } from '@/lib/domain/library/library-errors';
import type { FoodCatalogItem, LibraryListFilter, LibraryStatus, RecipeYieldUnit } from '@/lib/domain/library/library-model';
import {
  calculateEnergyFromNutrition,
  divideNutrition,
  normalizeDecimal,
  scaleNutrition,
  sumNutrition,
} from '@/lib/domain/library/library-nutrition';
import { validatePositiveDecimal, validateReadyMealInput, validateRecipeInput } from '@/lib/domain/library/library-validation';
import type { ReadyMealDto, ReadyMealInputDto, RecipeDto, RecipeInputDto } from '@/lib/contracts/recipes';
import { ApiError, NotFoundError, VersionConflictError } from '../api/api-errors';
import type { SqlExecutor } from '../patients/patient-repository';
import { createServerLibraryRepository } from './library-repository';

type Timestamp = Date | string;
type Nutrition = RecipeDto['nutrition'];
type StoredIngredient = RecipeDto['ingredients'][number];
type StoredItem = ReadyMealDto['items'][number];

type RecipeRow = {
  id: string; name: string; category: string; instructions: string; prep_time_minutes: number | null;
  yield_portions: string; yield_unit: RecipeYieldUnit; prepared_weight_grams: string | null; nutrition: Nutrition;
  ingredients: StoredIngredient[]; status: LibraryStatus; version: number;
  created_at: Timestamp; updated_at: Timestamp; archived_at: Timestamp | null;
};

type ReadyMealRow = {
  id: string; name: string; description: string; suggested_time: string | null; items: StoredItem[];
  status: LibraryStatus; version: number; created_at: Timestamp; updated_at: Timestamp; archived_at: Timestamp | null;
};

const RECIPE_COLUMNS = sql`id, name, category, instructions, prep_time_minutes, yield_portions, yield_unit,
  prepared_weight_grams, nutrition, ingredients, status, version, created_at, updated_at, archived_at`;
const MEAL_COLUMNS = sql`id, name, description, suggested_time, items, status, version, created_at, updated_at, archived_at`;

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const iso = (value: Timestamp): string => new Date(value).toISOString();
const json = (value: unknown) => sql`${JSON.stringify(value)}::jsonb`;

function invalid(field: string): never {
  throw new ApiError(422, 'UNPROCESSABLE', { field });
}

/** The domain's decimal check accepts zero; quantities, yields and weights must be strictly positive. */
function positive(value: string | undefined, field: string): void {
  if (value !== undefined && !(Number(value) > 0)) invalid(field);
}

function domain<T>(run: () => T): T {
  try {
    return run();
  } catch (error) {
    if (error instanceof LibraryValidationError) invalid(error.field);
    throw error;
  }
}

function referenceForFood(food: FoodCatalogItem): { quantity: string; unit: DietUnit } {
  if (food.servingReference) return food.servingReference;
  if (food.measurementBasis === 'PER_100ML') return { quantity: '100', unit: 'ml' };
  if (food.measurementBasis === 'PER_UNIT') return { quantity: '1', unit: 'unit' };
  return { quantity: '100', unit: 'g' };
}

/** Same snapshot the local library builds; copied because the local module is removed in F5. */
function customFoodSnapshot(food: FoodCatalogItem, quantity: string, unit: DietUnit, field: string): NutritionSnapshot {
  const reference = referenceForFood(food);
  if (reference.unit !== unit) invalid(field);
  const energy = calculateEnergyFromNutrition(food.referenceNutrients);
  const referenceNutrients = { ...food.referenceNutrients, energyKcal: energy.value };
  return {
    sourceType: 'ACCOUNT_CUSTOM', sourceId: food.id, sourceVersion: String(food.version), displayName: food.name,
    description: food.description, measurementBasis: food.measurementBasis, foodState: food.foodState,
    referenceQuantity: createDecimalString(reference.quantity), referenceUnit: reference.unit, referenceNutrients,
    prescribedQuantity: createDecimalString(normalizeDecimal(quantity)), prescribedUnit: unit,
    prescribedNutrients: scaleNutrition(referenceNutrients, quantity, reference.quantity), energySource: food.energySource,
    calculationVersion: food.calculationVersion, conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'ACCOUNT_CUSTOM', sourceVersion: food.version },
  };
}

function recipeSnapshot(recipe: RecipeDto, portions: string): NutritionSnapshot {
  const measured = recipe.yieldUnit === 'g' || recipe.yieldUnit === 'ml';
  const unit: DietUnit = recipe.yieldUnit === 'PORTION' ? 'unit' : recipe.yieldUnit;
  const referenceQuantity = measured ? '100' : '1';
  const perReference = scaleNutrition(recipe.nutrition.perPortion, referenceQuantity, '1');
  const energy = calculateEnergyFromNutrition(perReference);
  const referenceNutrients = { ...perReference, energyKcal: energy.value };
  return {
    sourceType: 'RECIPE', sourceId: recipe.id, sourceVersion: String(recipe.version), displayName: recipe.name,
    description: recipe.instructions,
    measurementBasis: recipe.yieldUnit === 'g' ? 'PER_100G' : recipe.yieldUnit === 'ml' ? 'PER_100ML' : 'PER_UNIT',
    foodState: 'PREPARED', referenceQuantity: createDecimalString(referenceQuantity), referenceUnit: unit, referenceNutrients,
    prescribedQuantity: createDecimalString(normalizeDecimal(portions)), prescribedUnit: unit,
    prescribedNutrients: scaleNutrition(referenceNutrients, portions, referenceQuantity),
    energySource: energy.source, calculationVersion: 'recipe-decimal-v1', conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'RECIPE', sourceVersion: recipe.version, ingredientCount: recipe.ingredients.length, yieldUnit: recipe.yieldUnit },
  };
}

export function createServerRecipeRepository(tx: SqlExecutor, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });
  const library = createServerLibraryRepository(tx, accountId);

  /** Looks up an active custom food; a missing or archived food is a 422 on the field, not a 404 on the route. */
  async function activeFood(id: string, field: string): Promise<FoodCatalogItem> {
    if (!uuidPattern.test(id)) invalid(field);
    try {
      const food = await library.getFood(id.toLowerCase());
      if (food.status !== 'ACTIVE') invalid(field);
      return food;
    } catch (error) {
      if (error instanceof NotFoundError) invalid(field);
      throw error;
    }
  }

  async function foodSnapshot(sourceType: 'SYSTEM_TACO' | 'ACCOUNT_CUSTOM', sourceId: string, quantity: string, unit: DietUnit, field: string) {
    if (sourceType === 'SYSTEM_TACO') {
      try {
        return createTacoSnapshot(sourceId, quantity, unit);
      } catch {
        return invalid(field);
      }
    }
    return customFoodSnapshot(await activeFood(sourceId, field), quantity, unit, field);
  }

  // ---- recipes ----

  function toRecipe(row: RecipeRow): RecipeDto {
    return {
      id: row.id, name: row.name, category: row.category, instructions: row.instructions,
      ...(row.prep_time_minutes === null ? {} : { prepTimeMinutes: row.prep_time_minutes }),
      yieldPortions: row.yield_portions as DecimalString, yieldUnit: row.yield_unit,
      ...(row.prepared_weight_grams === null ? {} : { preparedWeightGrams: row.prepared_weight_grams as DecimalString }),
      nutrition: row.nutrition, status: row.status, version: row.version,
      createdAt: iso(row.created_at), updatedAt: iso(row.updated_at),
      archivedAt: row.archived_at === null ? null : iso(row.archived_at), ingredients: row.ingredients,
    };
  }

  async function selectRecipe(id: string): Promise<RecipeRow | undefined> {
    const { rows } = await run<RecipeRow>(sql`SELECT ${RECIPE_COLUMNS} FROM app.recipes WHERE account_id = ${accountId} AND id = ${id}`);
    return rows[0];
  }

  async function getRecipe(id: string): Promise<RecipeDto> {
    const row = await selectRecipe(id);
    if (!row) throw new NotFoundError();
    return toRecipe(row);
  }

  async function listRecipes(filter: LibraryListFilter = {}): Promise<RecipeDto[]> {
    const search = filter.search?.trim();
    const { rows } = await run<RecipeRow>(sql`
      SELECT ${RECIPE_COLUMNS} FROM app.recipes
      WHERE account_id = ${accountId}
        ${filter.includeArchived ? sql`` : sql`AND status = 'ACTIVE'`}
        ${search ? sql`AND position(lower(${search}) in lower(name)) > 0` : sql``}
      ORDER BY updated_at DESC, id LIMIT 1000`);
    return rows.map(toRecipe);
  }

  async function buildRecipe(input: RecipeInputDto) {
    domain(() => validateRecipeInput(input));
    positive(input.yieldPortions, 'yieldPortions');
    positive(input.preparedWeightGrams, 'preparedWeightGrams');
    input.ingredients.forEach((ingredient) => positive(ingredient.quantity, 'ingredients'));
    const ingredients: StoredIngredient[] = [];
    for (const [position, ingredient] of input.ingredients.entries()) {
      const snapshot = await foodSnapshot(ingredient.sourceType, ingredient.sourceId, ingredient.quantity, ingredient.unit, 'ingredients');
      ingredients.push({
        position, sourceType: ingredient.sourceType, sourceId: ingredient.sourceId, sourceVersion: snapshot.sourceVersion,
        quantity: createDecimalString(normalizeDecimal(ingredient.quantity)), unit: ingredient.unit, ingredientSnapshot: snapshot,
      });
    }
    const yieldUnit = input.yieldUnit ?? 'PORTION';
    const nutrition: Nutrition = domain(() => {
      validatePositiveDecimal(input.yieldPortions, 'yieldPortions');
      const total: NutritionValues = sumNutrition(ingredients.map((i) => i.ingredientSnapshot.prescribedNutrients));
      const preparedWeight = yieldUnit === 'g' ? input.yieldPortions : input.preparedWeightGrams;
      return {
        total,
        perPortion: divideNutrition(total, input.yieldPortions),
        ...(preparedWeight === undefined ? {} : { perPrepared100g: scaleNutrition(total, '100', preparedWeight) }),
      };
    });
    const prepared = yieldUnit === 'g' ? normalizeDecimal(input.yieldPortions) : input.preparedWeightGrams === undefined ? null : normalizeDecimal(input.preparedWeightGrams);
    return { ingredients, nutrition, yieldUnit, prepared };
  }

  /** Idempotent: repeating a create with the same ID returns the stored recipe unchanged. */
  async function createRecipe(id: string, input: RecipeInputDto): Promise<RecipeDto> {
    const existing = await selectRecipe(id);
    if (existing) return toRecipe(existing);
    const built = await buildRecipe(input);
    const { rows } = await run<RecipeRow>(sql`
      INSERT INTO app.recipes (account_id, id, name, category, instructions, prep_time_minutes, yield_portions, yield_unit,
        prepared_weight_grams, nutrition, ingredients, status, version)
      VALUES (${accountId}, ${id}, ${input.name.trim()}, ${input.category.trim()}, ${input.instructions?.trim() ?? ''},
        ${input.prepTimeMinutes ?? null}, ${normalizeDecimal(input.yieldPortions)}, ${built.yieldUnit}, ${built.prepared},
        ${json(built.nutrition)}, ${json(built.ingredients)}, 'ACTIVE', 1)
      RETURNING ${RECIPE_COLUMNS}`);
    return toRecipe(rows[0]);
  }

  async function requireRecipeVersion(id: string, expectedVersion: number): Promise<RecipeRow> {
    const row = await selectRecipe(id);
    if (!row) throw new NotFoundError();
    if (row.version !== expectedVersion) throw new VersionConflictError(row.version);
    return row;
  }

  async function updateRecipe(id: string, expectedVersion: number, input: RecipeInputDto): Promise<RecipeDto> {
    await requireRecipeVersion(id, expectedVersion);
    const built = await buildRecipe(input);
    const { rows } = await run<RecipeRow>(sql`
      UPDATE app.recipes SET name = ${input.name.trim()}, category = ${input.category.trim()},
        instructions = ${input.instructions?.trim() ?? ''}, prep_time_minutes = ${input.prepTimeMinutes ?? null},
        yield_portions = ${normalizeDecimal(input.yieldPortions)}, yield_unit = ${built.yieldUnit},
        prepared_weight_grams = ${built.prepared}, nutrition = ${json(built.nutrition)}, ingredients = ${json(built.ingredients)},
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${RECIPE_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toRecipe(rows[0]);
  }

  async function duplicateRecipe(sourceId: string, newId: string): Promise<RecipeDto> {
    const source = await getRecipe(sourceId);
    return createRecipe(newId, {
      name: `${source.name} (cópia)`, category: source.category, instructions: source.instructions,
      prepTimeMinutes: source.prepTimeMinutes, yieldPortions: source.yieldPortions, yieldUnit: source.yieldUnit,
      preparedWeightGrams: source.preparedWeightGrams,
      ingredients: source.ingredients.map((i) => ({ sourceType: i.sourceType, sourceId: i.sourceId, quantity: i.quantity, unit: i.unit })),
    });
  }

  async function setRecipeStatus(id: string, expectedVersion: number, status: LibraryStatus): Promise<RecipeDto> {
    await requireRecipeVersion(id, expectedVersion);
    const { rows } = await run<RecipeRow>(sql`
      UPDATE app.recipes SET status = ${status}, archived_at = ${status === 'ARCHIVED' ? sql`now()` : sql`NULL`},
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${RECIPE_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toRecipe(rows[0]);
  }

  // ---- ready meals ----

  function toMeal(row: ReadyMealRow): ReadyMealDto {
    return {
      id: row.id, name: row.name, description: row.description,
      ...(row.suggested_time === null ? {} : { suggestedTime: row.suggested_time }),
      status: row.status, version: row.version, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at),
      archivedAt: row.archived_at === null ? null : iso(row.archived_at), items: row.items,
    };
  }

  async function selectMeal(id: string): Promise<ReadyMealRow | undefined> {
    const { rows } = await run<ReadyMealRow>(sql`SELECT ${MEAL_COLUMNS} FROM app.ready_meals WHERE account_id = ${accountId} AND id = ${id}`);
    return rows[0];
  }

  async function getReadyMeal(id: string): Promise<ReadyMealDto> {
    const row = await selectMeal(id);
    if (!row) throw new NotFoundError();
    return toMeal(row);
  }

  async function listReadyMeals(filter: LibraryListFilter = {}): Promise<ReadyMealDto[]> {
    const search = filter.search?.trim();
    const { rows } = await run<ReadyMealRow>(sql`
      SELECT ${MEAL_COLUMNS} FROM app.ready_meals
      WHERE account_id = ${accountId}
        ${filter.includeArchived ? sql`` : sql`AND status = 'ACTIVE'`}
        ${search ? sql`AND position(lower(${search}) in lower(name)) > 0` : sql``}
      ORDER BY updated_at DESC, id LIMIT 1000`);
    return rows.map(toMeal);
  }

  async function buildMealItems(input: ReadyMealInputDto): Promise<StoredItem[]> {
    domain(() => validateReadyMealInput(input));
    input.items.forEach((item) => {
      positive(item.quantity, 'items');
      positive(item.recipePortions, 'items');
    });
    const tacoIds = new Set(listTacoFoods().map((food) => food.id));
    const items: StoredItem[] = [];
    for (const [position, item] of input.items.entries()) {
      if (item.sourceType === 'FOOD') {
        const sourceType = tacoIds.has(item.sourceId) ? 'SYSTEM_TACO' : 'ACCOUNT_CUSTOM';
        const snapshot = await foodSnapshot(sourceType, item.sourceId, item.quantity!, item.unit!, 'items');
        items.push({
          position, sourceType: 'FOOD', sourceId: item.sourceId, sourceVersion: snapshot.sourceVersion,
          quantity: createDecimalString(normalizeDecimal(item.quantity!)), unit: item.unit!, itemSnapshot: snapshot,
        });
        continue;
      }
      const recipeRow = uuidPattern.test(item.sourceId) ? await selectRecipe(item.sourceId.toLowerCase()) : undefined;
      if (!recipeRow || recipeRow.status !== 'ACTIVE') invalid('items');
      const recipe = toRecipe(recipeRow);
      if (item.recipeUnit !== undefined && item.recipeUnit !== recipe.yieldUnit) invalid('items');
      items.push({
        position, sourceType: 'RECIPE', sourceId: recipe.id, sourceVersion: String(recipe.version),
        recipePortions: createDecimalString(normalizeDecimal(item.recipePortions!)),
        itemSnapshot: domain(() => recipeSnapshot(recipe, item.recipePortions!)),
      });
    }
    return items;
  }

  async function createReadyMeal(id: string, input: ReadyMealInputDto): Promise<ReadyMealDto> {
    const existing = await selectMeal(id);
    if (existing) return toMeal(existing);
    const items = await buildMealItems(input);
    const { rows } = await run<ReadyMealRow>(sql`
      INSERT INTO app.ready_meals (account_id, id, name, description, suggested_time, items, status, version)
      VALUES (${accountId}, ${id}, ${input.name.trim()}, ${input.description?.trim() ?? ''}, ${input.suggestedTime?.trim() || null},
        ${json(items)}, 'ACTIVE', 1)
      RETURNING ${MEAL_COLUMNS}`);
    return toMeal(rows[0]);
  }

  async function requireMealVersion(id: string, expectedVersion: number): Promise<ReadyMealRow> {
    const row = await selectMeal(id);
    if (!row) throw new NotFoundError();
    if (row.version !== expectedVersion) throw new VersionConflictError(row.version);
    return row;
  }

  async function updateReadyMeal(id: string, expectedVersion: number, input: ReadyMealInputDto): Promise<ReadyMealDto> {
    await requireMealVersion(id, expectedVersion);
    const items = await buildMealItems(input);
    const { rows } = await run<ReadyMealRow>(sql`
      UPDATE app.ready_meals SET name = ${input.name.trim()}, description = ${input.description?.trim() ?? ''},
        suggested_time = ${input.suggestedTime?.trim() || null}, items = ${json(items)}, version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${MEAL_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toMeal(rows[0]);
  }

  async function duplicateReadyMeal(sourceId: string, newId: string): Promise<ReadyMealDto> {
    const source = await getReadyMeal(sourceId);
    return createReadyMeal(newId, {
      name: `${source.name} (cópia)`, description: source.description, suggestedTime: source.suggestedTime,
      items: source.items.map((item) => item.sourceType === 'FOOD'
        ? { sourceType: 'FOOD' as const, sourceId: item.sourceId, quantity: item.quantity, unit: item.unit }
        : {
            sourceType: 'RECIPE' as const, sourceId: item.sourceId, recipePortions: item.recipePortions,
            recipeUnit: (item.itemSnapshot.compositionSnapshot as { yieldUnit?: RecipeYieldUnit }).yieldUnit,
          }),
    });
  }

  async function setReadyMealStatus(id: string, expectedVersion: number, status: LibraryStatus): Promise<ReadyMealDto> {
    await requireMealVersion(id, expectedVersion);
    const { rows } = await run<ReadyMealRow>(sql`
      UPDATE app.ready_meals SET status = ${status}, archived_at = ${status === 'ARCHIVED' ? sql`now()` : sql`NULL`},
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${MEAL_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toMeal(rows[0]);
  }

  return {
    listRecipes, getRecipe, createRecipe, updateRecipe, duplicateRecipe,
    archiveRecipe: (id: string, version: number) => setRecipeStatus(id, version, 'ARCHIVED'),
    restoreRecipe: (id: string, version: number) => setRecipeStatus(id, version, 'ACTIVE'),
    listReadyMeals, getReadyMeal, createReadyMeal, updateReadyMeal, duplicateReadyMeal,
    archiveReadyMeal: (id: string, version: number) => setReadyMealStatus(id, version, 'ARCHIVED'),
    restoreReadyMeal: (id: string, version: number) => setReadyMealStatus(id, version, 'ACTIVE'),
  };
}

export type ServerRecipeRepository = ReturnType<typeof createServerRecipeRepository>;
