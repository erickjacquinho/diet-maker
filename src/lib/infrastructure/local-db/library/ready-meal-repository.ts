import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { createLibraryError } from '@/lib/application/library/library-errors';
import { createTacoSnapshot } from '@/lib/application/diets/taco-food-adapter';
import { listTacoFoods } from '@/lib/application/diets/taco-food-adapter';
import type { FoodCatalogRepository, ReadyMealRepository, RecipeRepository } from '@/lib/persistence/library-repository';
import type { FoodCatalogItem, LibraryListFilter, ReadyMeal, ReadyMealItem, ReadyMealInput, Recipe } from '@/lib/domain/library/library-model';
import { createDecimalString, type DietUnit, type NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { calculateEnergyFromNutrition, normalizeDecimal, scaleNutrition } from '@/lib/domain/library/library-nutrition';
import { validateReadyMealInput } from '@/lib/domain/library/library-validation';
import type { LocalDatabaseHandle } from '../client';
import { readyMealItems, readyMeals } from '../schema';

type ReadyMealRow = typeof readyMeals.$inferSelect;
type ReadyMealItemRow = typeof readyMealItems.$inferSelect;

export interface ReadyMealRepositoryOptions {
  foodRepository: FoodCatalogRepository;
  recipeRepository: RecipeRepository;
  now?: () => string;
  idFactory?: () => string;
}

function referenceForFood(food: FoodCatalogItem): { quantity: string; unit: DietUnit } {
  if (food.servingReference) return food.servingReference;
  if (food.measurementBasis === 'PER_100ML') return { quantity: '100', unit: 'ml' };
  if (food.measurementBasis === 'PER_UNIT') return { quantity: '1', unit: 'unit' };
  return { quantity: '100', unit: 'g' };
}

function customFoodSnapshot(food: FoodCatalogItem, quantity: string, unit: DietUnit): NutritionSnapshot {
  const reference = referenceForFood(food);
  if (reference.unit !== unit) throw createLibraryError('LIBRARY_VALIDATION_FAILED', `A unidade do item deve ser ${reference.unit}.`, 'unit');
  const energy = calculateEnergyFromNutrition(food.referenceNutrients);
  const referenceNutrients = { ...food.referenceNutrients, energyKcal: energy.value };
  return {
    sourceType: 'ACCOUNT_CUSTOM', sourceId: food.id, sourceVersion: String(food.version), displayName: food.name, description: food.description,
    measurementBasis: food.measurementBasis, foodState: food.foodState, referenceQuantity: createDecimalString(reference.quantity), referenceUnit: reference.unit,
    referenceNutrients, prescribedQuantity: createDecimalString(normalizeDecimal(quantity)), prescribedUnit: unit,
    prescribedNutrients: scaleNutrition(referenceNutrients, quantity, reference.quantity), energySource: food.energySource,
    calculationVersion: food.calculationVersion, conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'ACCOUNT_CUSTOM', sourceVersion: food.version },
  };
}

function recipeSnapshot(recipe: Recipe, portions: string): NutritionSnapshot {
  const energy = calculateEnergyFromNutrition(recipe.nutrition.perPortion);
  const referenceNutrients = { ...recipe.nutrition.perPortion, energyKcal: energy.value };
  return {
    sourceType: 'RECIPE', sourceId: recipe.id, sourceVersion: String(recipe.version), displayName: recipe.name, description: recipe.instructions,
    measurementBasis: 'PER_UNIT', foodState: 'PREPARED', referenceQuantity: createDecimalString('1'), referenceUnit: 'unit', referenceNutrients,
    prescribedQuantity: createDecimalString(normalizeDecimal(portions)), prescribedUnit: 'unit', prescribedNutrients: scaleNutrition(referenceNutrients, portions, '1'),
    energySource: energy.source, calculationVersion: 'recipe-decimal-v1', conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'RECIPE', sourceVersion: recipe.version, ingredientCount: recipe.ingredients.length },
  };
}

function mapItem(row: ReadyMealItemRow): ReadyMealItem {
  return {
    id: row.id, readyMealId: row.readyMealId, accountId: row.accountId, position: row.position,
    sourceType: row.sourceType as ReadyMealItem['sourceType'], sourceId: row.sourceId, sourceVersion: row.sourceVersion,
    ...(row.quantity === null ? {} : { quantity: createDecimalString(row.quantity) }),
    ...(row.unit === null ? {} : { unit: row.unit as DietUnit }),
    ...(row.recipePortions === null ? {} : { recipePortions: createDecimalString(row.recipePortions) }),
    itemSnapshot: row.itemSnapshot as NutritionSnapshot,
  };
}

function mapMeal(row: ReadyMealRow, items: ReadyMealItemRow[]): ReadyMeal {
  return {
    id: row.id, accountId: row.accountId, name: row.name, description: row.description,
    ...(row.suggestedTime === null ? {} : { suggestedTime: row.suggestedTime }), status: row.status as ReadyMeal['status'], version: row.version,
    createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt,
    items: [...items].sort((a, b) => a.position - b.position).map(mapItem),
  };
}

export class PGliteReadyMealRepository implements ReadyMealRepository {
  private readonly now: () => string;
  private readonly idFactory: () => string;

  constructor(private readonly handle: LocalDatabaseHandle, private readonly options: ReadyMealRepositoryOptions) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.idFactory = options.idFactory ?? (() => nanoid(16));
  }

  async getById(accountId: string, readyMealId: string): Promise<ReadyMeal | null> {
    const rows = await this.handle.db.select().from(readyMeals).where(and(eq(readyMeals.id, readyMealId), eq(readyMeals.accountId, accountId)));
    if (!rows[0]) return null;
    const items = await this.handle.db.select().from(readyMealItems).where(eq(readyMealItems.readyMealId, readyMealId)).orderBy(asc(readyMealItems.position));
    return mapMeal(rows[0], items);
  }

  async list(accountId: string, filter: LibraryListFilter = {}): Promise<ReadyMeal[]> {
    const conditions = [eq(readyMeals.accountId, accountId)];
    if (!filter.includeArchived) conditions.push(eq(readyMeals.status, 'ACTIVE'));
    if (filter.search?.trim()) conditions.push(ilike(readyMeals.name, `%${filter.search.trim()}%`));
    const rows = await this.handle.db.select().from(readyMeals).where(and(...conditions)).orderBy(desc(readyMeals.updatedAt));
    const result = await Promise.all(rows.map((row) => this.getById(accountId, row.id)));
    return result.filter((meal): meal is ReadyMeal => meal !== null);
  }

  async create(accountId: string, input: ReadyMealInput): Promise<ReadyMeal> {
    validateReadyMealInput(input);
    const resolved = await this.resolveItems(accountId, input);
    const id = this.idFactory();
    const now = this.now();
    await this.handle.db.transaction(async (tx) => {
      await tx.insert(readyMeals).values({ id, accountId, name: input.name.trim(), description: input.description?.trim() ?? '', suggestedTime: input.suggestedTime?.trim() || null, status: 'ACTIVE', version: 1, createdAt: now, updatedAt: now, archivedAt: null });
      await tx.insert(readyMealItems).values(resolved.map((item, position) => ({ ...item, id: this.idFactory(), readyMealId: id, accountId, position })));
    });
    const result = await this.getById(accountId, id);
    if (!result) throw createLibraryError('LIBRARY_TRANSACTION_FAILED', 'A refeição pronta foi salva, mas não pôde ser relida.');
    return result;
  }

  async update(accountId: string, readyMealId: string, expectedVersion: number, input: ReadyMealInput): Promise<ReadyMeal> {
    validateReadyMealInput(input);
    const current = await this.requireVersion(accountId, readyMealId, expectedVersion);
    const resolved = await this.resolveItems(accountId, input);
    await this.handle.db.transaction(async (tx) => {
      const updated = await tx.update(readyMeals).set({ name: input.name.trim(), description: input.description?.trim() ?? '', suggestedTime: input.suggestedTime?.trim() || null, version: current.version + 1, updatedAt: this.now() }).where(and(eq(readyMeals.id, readyMealId), eq(readyMeals.accountId, accountId), eq(readyMeals.version, expectedVersion))).returning({ id: readyMeals.id });
      if (!updated[0]) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A refeição pronta foi alterada antes da atualização.');
      await tx.delete(readyMealItems).where(eq(readyMealItems.readyMealId, readyMealId));
      await tx.insert(readyMealItems).values(resolved.map((item, position) => ({ ...item, id: this.idFactory(), readyMealId, accountId, position })));
    });
    const result = await this.getById(accountId, readyMealId);
    if (!result) throw createLibraryError('LIBRARY_TRANSACTION_FAILED', 'A refeição pronta atualizada não pôde ser relida.');
    return result;
  }

  async duplicate(accountId: string, readyMealId: string): Promise<ReadyMeal> {
    const source = await this.requireEntity(accountId, readyMealId);
    return this.create(accountId, { name: source.name + ' (cópia)', description: source.description, suggestedTime: source.suggestedTime, items: source.items.map((item) => item.sourceType === 'FOOD' ? { sourceType: 'FOOD' as const, sourceId: item.sourceId, quantity: item.quantity!, unit: item.unit! } : { sourceType: 'RECIPE' as const, sourceId: item.sourceId, recipePortions: item.recipePortions! }) });
  }

  async archive(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal> {
    return this.changeStatus(accountId, readyMealId, expectedVersion, 'ARCHIVED');
  }

  async restore(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal> {
    return this.changeStatus(accountId, readyMealId, expectedVersion, 'ACTIVE');
  }

  async deleteIfUnreferenced(accountId: string, readyMealId: string, expectedVersion: number): Promise<boolean> {
    await this.requireVersion(accountId, readyMealId, expectedVersion);
    await this.handle.db.delete(readyMeals).where(and(eq(readyMeals.id, readyMealId), eq(readyMeals.accountId, accountId), eq(readyMeals.version, expectedVersion)));
    return (await this.getById(accountId, readyMealId)) === null;
  }

  private async resolveItems(accountId: string, input: ReadyMealInput): Promise<Array<Omit<ReadyMealItem, 'id' | 'readyMealId' | 'accountId' | 'position'>>> {
    return Promise.all(input.items.map(async (item) => {
      if (item.sourceType === 'FOOD') {
        const snapshot = listTacoFoods().some((food) => food.id === item.sourceId) ? this.safeTacoSnapshot(item.sourceId, item.quantity!, item.unit!) : await this.customFoodSnapshot(accountId, item.sourceId, item.quantity!, item.unit!);
        return { sourceType: 'FOOD' as const, sourceId: item.sourceId, sourceVersion: snapshot.sourceVersion, quantity: createDecimalString(normalizeDecimal(item.quantity!)), unit: item.unit!, itemSnapshot: snapshot };
      }
      const recipe = await this.options.recipeRepository.getById(accountId, item.sourceId);
      if (!recipe) throw createLibraryError('LIBRARY_NOT_FOUND', 'Receita não encontrada nesta Conta.');
      if (recipe.status !== 'ACTIVE') throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Receitas arquivadas não podem ser usadas em uma nova refeição pronta.', 'items');
      return { sourceType: 'RECIPE' as const, sourceId: item.sourceId, sourceVersion: String(recipe.version), recipePortions: createDecimalString(normalizeDecimal(item.recipePortions!)), itemSnapshot: recipeSnapshot(recipe, item.recipePortions!) };
    }));
  }

  private safeTacoSnapshot(sourceId: string, quantity: string, unit: DietUnit): NutritionSnapshot {
    try { return createTacoSnapshot(sourceId, quantity, unit); } catch (cause) { throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento TACO não encontrado ou incompatível.', undefined, { cause }); }
  }

  private async customFoodSnapshot(accountId: string, sourceId: string, quantity: string, unit: DietUnit): Promise<NutritionSnapshot> {
    const food = await this.options.foodRepository.getById(accountId, sourceId);
    if (!food) throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento customizado não encontrado nesta Conta.');
    if (food.status !== 'ACTIVE') throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Alimentos arquivados não podem ser usados em uma nova refeição pronta.', 'items');
    return customFoodSnapshot(food, quantity, unit);
  }

  private async requireEntity(accountId: string, readyMealId: string): Promise<ReadyMeal> {
    const current = await this.getById(accountId, readyMealId);
    if (current) return current;
    const foreign = await this.handle.db.select({ id: readyMeals.id }).from(readyMeals).where(eq(readyMeals.id, readyMealId));
    if (foreign[0]) throw createLibraryError('LIBRARY_SCOPE_VIOLATION', 'A refeição pronta pertence a outra Conta.');
    throw createLibraryError('LIBRARY_NOT_FOUND', 'Refeição pronta não encontrada nesta Conta.');
  }

  private async requireVersion(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal> {
    const current = await this.requireEntity(accountId, readyMealId);
    if (current.version !== expectedVersion) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A versão da refeição pronta está desatualizada.');
    return current;
  }

  private async changeStatus(accountId: string, readyMealId: string, expectedVersion: number, status: 'ACTIVE' | 'ARCHIVED'): Promise<ReadyMeal> {
    const current = await this.requireVersion(accountId, readyMealId, expectedVersion);
    await this.handle.db.update(readyMeals).set({ status, version: current.version + 1, archivedAt: status === 'ARCHIVED' ? this.now() : null, updatedAt: this.now() }).where(and(eq(readyMeals.id, readyMealId), eq(readyMeals.accountId, accountId), eq(readyMeals.version, expectedVersion)));
    const result = await this.getById(accountId, readyMealId);
    if (!result || result.version !== expectedVersion + 1) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A refeição pronta foi alterada antes da operação.');
    return result;
  }
}
