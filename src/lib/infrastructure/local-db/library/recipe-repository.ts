import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { createLibraryError } from '@/lib/application/library/library-errors';
import { createTacoSnapshot } from '@/lib/application/diets/taco-food-adapter';
import type { FoodCatalogRepository, RecipeRepository } from '@/lib/persistence/library-repository';
import type { FoodCatalogItem, LibraryListFilter, Recipe, RecipeIngredient, RecipeInput } from '@/lib/domain/library/library-model';
import { createDecimalString, type DietUnit, type NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { calculateEnergyFromNutrition, divideNutrition, normalizeDecimal, scaleNutrition, sumNutrition, LIBRARY_CALCULATION_VERSION } from '@/lib/domain/library/library-nutrition';
import { validateRecipeInput, validatePositiveDecimal } from '@/lib/domain/library/library-validation';
import type { LocalDatabaseHandle } from '../client';
import { recipeIngredients, recipes, readyMealItems } from '../schema';

type RecipeRow = typeof recipes.$inferSelect;
type RecipeIngredientRow = typeof recipeIngredients.$inferSelect;

export interface RecipeRepositoryOptions {
  foodRepository: FoodCatalogRepository;
  now?: () => string;
  idFactory?: () => string;
}
function defaultReferenceForFood(food: FoodCatalogItem): { quantity: string; unit: DietUnit } {
  if (food.servingReference) return food.servingReference;
  if (food.measurementBasis === 'PER_100ML') return { quantity: '100', unit: 'ml' };
  if (food.measurementBasis === 'PER_UNIT') return { quantity: '1', unit: 'unit' };
  return { quantity: '100', unit: 'g' };
}

function snapshotFromCustomFood(food: FoodCatalogItem, quantity: string, unit: DietUnit): NutritionSnapshot {
  const reference = defaultReferenceForFood(food);
  if (reference.unit !== unit) {
    throw createLibraryError('LIBRARY_VALIDATION_FAILED', `A unidade do ingrediente deve ser ${reference.unit}.`, 'unit');
  }
  const energy = calculateEnergyFromNutrition(food.referenceNutrients);
  const referenceNutrients = { ...food.referenceNutrients, energyKcal: energy.value };
  return {
    sourceType: 'ACCOUNT_CUSTOM',
    sourceId: food.id,
    sourceVersion: String(food.version),
    displayName: food.name,
    description: food.description,
    measurementBasis: food.measurementBasis,
    foodState: food.foodState,
    referenceQuantity: createDecimalString(reference.quantity),
    referenceUnit: reference.unit,
    referenceNutrients,
    prescribedQuantity: createDecimalString(normalizeDecimal(quantity)),
    prescribedUnit: unit,
    prescribedNutrients: scaleNutrition(referenceNutrients, quantity, reference.quantity),
    energySource: food.energySource,
    calculationVersion: food.calculationVersion || LIBRARY_CALCULATION_VERSION,
    conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'ACCOUNT_CUSTOM', sourceVersion: food.version },
  };
}

function mapIngredientRow(row: RecipeIngredientRow): RecipeIngredient {
  return {
    id: row.id,
    recipeId: row.recipeId,
    accountId: row.accountId,
    position: row.position,
    sourceType: row.sourceType as RecipeIngredient['sourceType'],
    sourceId: row.sourceId,
    sourceVersion: row.sourceVersion,
    quantity: createDecimalString(row.quantity),
    unit: row.unit as DietUnit,
    ingredientSnapshot: row.ingredientSnapshot as NutritionSnapshot,
  };
}

function mapRecipe(row: RecipeRow, ingredientRows: RecipeIngredientRow[]): Recipe {
  const toNutrition = (protein: string, carbs: string, fat: string, fiber: string, energyKcal: string | null) => ({
    protein: createDecimalString(protein), carbs: createDecimalString(carbs), fat: createDecimalString(fat), fiber: createDecimalString(fiber),
    ...(energyKcal === null ? {} : { energyKcal: createDecimalString(energyKcal) }),
  });
  return {
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    category: row.category,
    instructions: row.instructions,
    ...(row.prepTimeMinutes === null ? {} : { prepTimeMinutes: row.prepTimeMinutes }),
    yieldPortions: createDecimalString(row.yieldPortions),
    ...(row.preparedWeightGrams === null ? {} : { preparedWeightGrams: createDecimalString(row.preparedWeightGrams) }),
    nutrition: {
      total: toNutrition(row.totalProtein, row.totalCarbs, row.totalFat, row.totalFiber, row.totalEnergyKcal),
      perPortion: toNutrition(row.perPortionProtein, row.perPortionCarbs, row.perPortionFat, row.perPortionFiber, row.perPortionEnergyKcal),
      ...(row.preparedWeightGrams === null ? {} : { perPrepared100g: scaleNutrition(toNutrition(row.totalProtein, row.totalCarbs, row.totalFat, row.totalFiber, row.totalEnergyKcal), '100', row.preparedWeightGrams) }),
    },
    status: row.status as Recipe['status'],
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
    ingredients: [...ingredientRows].sort((a, b) => a.position - b.position).map(mapIngredientRow),
  };
}

export class PGliteRecipeRepository implements RecipeRepository {
  private readonly now: () => string;
  private readonly idFactory: () => string;

  constructor(private readonly handle: LocalDatabaseHandle, private readonly options: RecipeRepositoryOptions) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.idFactory = options.idFactory ?? (() => nanoid(16));
  }

  async getById(accountId: string, recipeId: string): Promise<Recipe | null> {
    const rows = await this.handle.db.select().from(recipes).where(and(eq(recipes.id, recipeId), eq(recipes.accountId, accountId)));
    if (!rows[0]) return null;
    const ingredients = await this.handle.db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId)).orderBy(asc(recipeIngredients.position));
    return mapRecipe(rows[0], ingredients);
  }

  async list(accountId: string, filter: LibraryListFilter = {}): Promise<Recipe[]> {
    const conditions = [eq(recipes.accountId, accountId)];
    if (!filter.includeArchived) conditions.push(eq(recipes.status, 'ACTIVE'));
    if (filter.search?.trim()) conditions.push(ilike(recipes.name, `%${filter.search.trim()}%`));
    const rows = await this.handle.db.select().from(recipes).where(and(...conditions)).orderBy(desc(recipes.updatedAt));
    const result = await Promise.all(rows.map((row) => this.getById(accountId, row.id)));
    return result.filter((recipe): recipe is Recipe => recipe !== null);
  }

  async create(accountId: string, input: RecipeInput): Promise<Recipe> {
    validateRecipeInput(input);
    const resolved = await this.resolveIngredients(accountId, input);
    const id = this.idFactory();
    const now = this.now();
    const nutrition = this.calculateNutrition(resolved.map((ingredient) => ingredient.ingredientSnapshot), input.yieldPortions, input.preparedWeightGrams);
    await this.handle.db.transaction(async (tx) => {
      await tx.insert(recipes).values(this.recipeRow(id, accountId, input, nutrition, now));
      await tx.insert(recipeIngredients).values(resolved.map((ingredient, position) => ({ ...ingredient, id: this.idFactory(), recipeId: id, accountId, position })));
    });
    const result = await this.getById(accountId, id);
    if (!result) throw createLibraryError('LIBRARY_TRANSACTION_FAILED', 'A receita foi salva, mas não pôde ser relida.');
    return result;
  }

  async update(accountId: string, recipeId: string, expectedVersion: number, input: RecipeInput): Promise<Recipe> {
    validateRecipeInput(input);
    const current = await this.requireVersion(accountId, recipeId, expectedVersion);
    const resolved = await this.resolveIngredients(accountId, input);
    const nutrition = this.calculateNutrition(resolved.map((ingredient) => ingredient.ingredientSnapshot), input.yieldPortions, input.preparedWeightGrams);
    await this.handle.db.transaction(async (tx) => {
      const updated = await tx.update(recipes).set({
        name: input.name.trim(), category: input.category.trim(), instructions: input.instructions?.trim() ?? '', prepTimeMinutes: input.prepTimeMinutes ?? null,
        yieldPortions: normalizeDecimal(input.yieldPortions), preparedWeightGrams: input.preparedWeightGrams === undefined ? null : normalizeDecimal(input.preparedWeightGrams),
        ...this.nutritionRow(nutrition), version: current.version + 1, updatedAt: this.now(),
      }).where(and(eq(recipes.id, recipeId), eq(recipes.accountId, accountId), eq(recipes.version, expectedVersion))).returning({ id: recipes.id });
      if (!updated[0]) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A receita foi alterada antes da atualização.');
      await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
      await tx.insert(recipeIngredients).values(resolved.map((ingredient, position) => ({ ...ingredient, id: this.idFactory(), recipeId, accountId, position })));
    });
    const result = await this.getById(accountId, recipeId);
    if (!result) throw createLibraryError('LIBRARY_TRANSACTION_FAILED', 'A receita atualizada não pôde ser relida.');
    return result;
  }

  async duplicate(accountId: string, recipeId: string): Promise<Recipe> {
    const source = await this.requireEntity(accountId, recipeId);
    return this.create(accountId, {
      name: source.name + ' (cópia)', category: source.category, instructions: source.instructions,
      prepTimeMinutes: source.prepTimeMinutes, yieldPortions: source.yieldPortions,
      preparedWeightGrams: source.preparedWeightGrams,
      ingredients: source.ingredients.map((ingredient) => ({ sourceType: ingredient.sourceType, sourceId: ingredient.sourceId, quantity: ingredient.quantity, unit: ingredient.unit })),
    });
  }

  async archive(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe> {
    return this.changeStatus(accountId, recipeId, expectedVersion, 'ARCHIVED');
  }

  async restore(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe> {
    return this.changeStatus(accountId, recipeId, expectedVersion, 'ACTIVE');
  }

  async deleteIfUnreferenced(accountId: string, recipeId: string, expectedVersion: number): Promise<boolean> {
    await this.requireVersion(accountId, recipeId, expectedVersion);
    const references = await this.handle.db.select({ id: readyMealItems.id }).from(readyMealItems).where(and(eq(readyMealItems.accountId, accountId), eq(readyMealItems.sourceType, 'RECIPE'), eq(readyMealItems.sourceId, recipeId)));
    if (references.length) throw createLibraryError('LIBRARY_DEPENDENCY_EXISTS', 'A receita está sendo usada por uma refeição pronta.');
    await this.handle.db.delete(recipes).where(and(eq(recipes.id, recipeId), eq(recipes.accountId, accountId), eq(recipes.version, expectedVersion)));
    return (await this.getById(accountId, recipeId)) === null;
  }

  private async resolveIngredients(accountId: string, input: RecipeInput): Promise<Array<Omit<RecipeIngredient, 'id' | 'recipeId' | 'accountId' | 'position'>>> {
    return Promise.all(input.ingredients.map(async (ingredient) => {
      const snapshot = ingredient.sourceType === 'SYSTEM_TACO'
        ? this.safeTacoSnapshot(ingredient.sourceId, ingredient.quantity, ingredient.unit)
        : await this.customFoodSnapshot(accountId, ingredient.sourceId, ingredient.quantity, ingredient.unit);
      return { sourceType: ingredient.sourceType, sourceId: ingredient.sourceId, sourceVersion: snapshot.sourceVersion, quantity: createDecimalString(normalizeDecimal(ingredient.quantity)), unit: ingredient.unit, ingredientSnapshot: snapshot };
    }));
  }

  private safeTacoSnapshot(sourceId: string, quantity: string, unit: DietUnit): NutritionSnapshot {
    try {
      return createTacoSnapshot(sourceId, quantity, unit);
    } catch (cause) {
      throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento TACO não encontrado ou incompatível.', undefined, { cause });
    }
  }

  private async customFoodSnapshot(accountId: string, sourceId: string, quantity: string, unit: DietUnit): Promise<NutritionSnapshot> {
    const food = await this.options.foodRepository.getById(accountId, sourceId);
    if (!food) throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento customizado não encontrado nesta Conta.');
    if (food.status !== 'ACTIVE') throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Alimentos arquivados não podem ser usados em uma nova receita.', 'ingredients');
    return snapshotFromCustomFood(food, quantity, unit);
  }

  private calculateNutrition(snapshots: NutritionSnapshot[], yieldPortions: string, preparedWeightGrams?: string) {
    validatePositiveDecimal(yieldPortions, 'yieldPortions');
    const total = sumNutrition(snapshots.map((snapshot) => snapshot.prescribedNutrients));
    return {
      total,
      perPortion: divideNutrition(total, yieldPortions),
      ...(preparedWeightGrams === undefined ? {} : { perPrepared100g: scaleNutrition(total, '100', preparedWeightGrams) }),
    };
  }

  private nutritionRow(nutrition: ReturnType<PGliteRecipeRepository['calculateNutrition']>) {
    return {
      totalProtein: nutrition.total.protein, totalCarbs: nutrition.total.carbs, totalFat: nutrition.total.fat, totalFiber: nutrition.total.fiber, totalEnergyKcal: nutrition.total.energyKcal ?? null,
      perPortionProtein: nutrition.perPortion.protein, perPortionCarbs: nutrition.perPortion.carbs, perPortionFat: nutrition.perPortion.fat, perPortionFiber: nutrition.perPortion.fiber, perPortionEnergyKcal: nutrition.perPortion.energyKcal ?? null,
    };
  }

  private recipeRow(id: string, accountId: string, input: RecipeInput, nutrition: ReturnType<PGliteRecipeRepository['calculateNutrition']>, now: string): typeof recipes.$inferInsert {
    return {
      id, accountId, name: input.name.trim(), category: input.category.trim(), instructions: input.instructions?.trim() ?? '', prepTimeMinutes: input.prepTimeMinutes ?? null,
      yieldPortions: normalizeDecimal(input.yieldPortions), preparedWeightGrams: input.preparedWeightGrams === undefined ? null : normalizeDecimal(input.preparedWeightGrams),
      ...this.nutritionRow(nutrition), status: 'ACTIVE', version: 1, createdAt: now, updatedAt: now, archivedAt: null,
    };
  }

  private async requireEntity(accountId: string, recipeId: string): Promise<Recipe> {
    const current = await this.getById(accountId, recipeId);
    if (current) return current;
    const foreign = await this.handle.db.select({ id: recipes.id }).from(recipes).where(eq(recipes.id, recipeId));
    if (foreign[0]) throw createLibraryError('LIBRARY_SCOPE_VIOLATION', 'A receita pertence a outra Conta.');
    throw createLibraryError('LIBRARY_NOT_FOUND', 'Receita não encontrada nesta Conta.');
  }

  private async requireVersion(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe> {
    const current = await this.requireEntity(accountId, recipeId);
    if (current.version !== expectedVersion) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A versão da receita está desatualizada.');
    return current;
  }

  private async changeStatus(accountId: string, recipeId: string, expectedVersion: number, status: 'ACTIVE' | 'ARCHIVED'): Promise<Recipe> {
    const current = await this.requireVersion(accountId, recipeId, expectedVersion);
    await this.handle.db.update(recipes).set({ status, version: current.version + 1, archivedAt: status === 'ARCHIVED' ? this.now() : null, updatedAt: this.now() }).where(and(eq(recipes.id, recipeId), eq(recipes.accountId, accountId), eq(recipes.version, expectedVersion)));
    const result = await this.getById(accountId, recipeId);
    if (!result || result.version !== expectedVersion + 1) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A receita foi alterada antes da operação.');
    return result;
  }
}
