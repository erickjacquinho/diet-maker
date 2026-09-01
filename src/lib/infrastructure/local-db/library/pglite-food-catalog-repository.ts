import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { FoodCatalogRepository } from '@/lib/persistence/library-repository';
import type { CustomFoodInput, FoodCatalogItem, LibraryListFilter } from '@/lib/domain/library/library-model';
import { createLibraryError } from '@/lib/application/library/library-errors';
import { calculateEnergyFromNutrition, normalizeDecimal, normalizeNutrition, LIBRARY_CALCULATION_VERSION } from '@/lib/domain/library/library-nutrition';
import { validateCustomFoodInput } from '@/lib/domain/library/library-validation';
import type { LocalDatabaseHandle } from '../client';
import { foodCatalogItems, readyMealItems, recipeIngredients } from '../schema';
import { mapFoodCatalogRow } from './library-row-mappers';

export interface FoodCatalogRepositoryOptions {
  now?: () => string;
  idFactory?: () => string;
}
export class PGliteFoodCatalogRepository implements FoodCatalogRepository {
  private readonly now: () => string;
  private readonly idFactory: () => string;

  constructor(private readonly handle: LocalDatabaseHandle, private readonly options: FoodCatalogRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.idFactory = options.idFactory ?? (() => nanoid(16));
  }

  async getById(accountId: string, foodId: string): Promise<FoodCatalogItem | null> {
    const rows = await this.handle.db.select().from(foodCatalogItems).where(and(eq(foodCatalogItems.id, foodId), eq(foodCatalogItems.accountId, accountId)));
    return rows[0] ? mapFoodCatalogRow(rows[0]) : null;
  }

  async list(accountId: string, filter: LibraryListFilter = {}): Promise<FoodCatalogItem[]> {
    const conditions = [eq(foodCatalogItems.accountId, accountId)];
    if (!filter.includeArchived) conditions.push(eq(foodCatalogItems.status, 'ACTIVE'));
    if (filter.search?.trim()) conditions.push(ilike(foodCatalogItems.name, `%${filter.search.trim()}%`));
    const rows = await this.handle.db.select().from(foodCatalogItems).where(and(...conditions)).orderBy(filter.includeArchived ? desc(foodCatalogItems.updatedAt) : asc(foodCatalogItems.name));
    return rows.map(mapFoodCatalogRow);
  }

  async create(accountId: string, input: CustomFoodInput): Promise<FoodCatalogItem> {
    validateCustomFoodInput(input);
    const now = this.now();
    const nutrients = normalizeNutrition(input.referenceNutrients);
    const energy = calculateEnergyFromNutrition(nutrients);
    const id = this.idFactory();
    await this.handle.db.insert(foodCatalogItems).values({
      id,
      accountId,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      brand: input.brand?.trim() || null,
      measurementBasis: input.measurementBasis,
      foodState: input.foodState,
      servingReference: input.servingReference ? normalizeDecimal(input.servingReference.quantity) : null,
      servingUnit: input.servingReference?.unit ?? null,
      referenceProtein: nutrients.protein,
      referenceCarbs: nutrients.carbs,
      referenceFat: nutrients.fat,
      referenceFiber: nutrients.fiber,
      referenceEnergyKcal: energy.value,
      energySource: input.energySource ?? energy.source,
      calculationVersion: input.calculationVersion ?? LIBRARY_CALCULATION_VERSION,
      status: 'ACTIVE',
      version: 1,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    });
    const result = await this.getById(accountId, id);
    if (!result) throw createLibraryError('LIBRARY_TRANSACTION_FAILED', 'O alimento foi salvo, mas não pôde ser relido.');
    return result;
  }

  async update(accountId: string, foodId: string, expectedVersion: number, input: CustomFoodInput): Promise<FoodCatalogItem> {
    validateCustomFoodInput(input);
    const current = await this.requireVersion(accountId, foodId, expectedVersion);
    const nutrients = normalizeNutrition(input.referenceNutrients);
    const energy = calculateEnergyFromNutrition(nutrients);
    await this.handle.db.update(foodCatalogItems).set({
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      brand: input.brand?.trim() || null,
      measurementBasis: input.measurementBasis,
      foodState: input.foodState,
      servingReference: input.servingReference ? normalizeDecimal(input.servingReference.quantity) : null,
      servingUnit: input.servingReference?.unit ?? null,
      referenceProtein: nutrients.protein,
      referenceCarbs: nutrients.carbs,
      referenceFat: nutrients.fat,
      referenceFiber: nutrients.fiber,
      referenceEnergyKcal: energy.value,
      energySource: input.energySource ?? energy.source,
      calculationVersion: input.calculationVersion ?? current.calculationVersion,
      version: current.version + 1,
      updatedAt: this.now(),
      archivedAt: current.archivedAt,
    }).where(and(eq(foodCatalogItems.id, foodId), eq(foodCatalogItems.accountId, accountId), eq(foodCatalogItems.version, expectedVersion)));
    const result = await this.getById(accountId, foodId);
    if (!result || result.version !== expectedVersion + 1) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'O alimento foi alterado antes da atualização.');
    return result;
  }

  async duplicate(accountId: string, foodId: string): Promise<FoodCatalogItem> {
    const source = await this.requireEntity(accountId, foodId);
    return this.create(accountId, {
      name: source.name + ' (cópia)',
      description: source.description,
      brand: source.brand,
      measurementBasis: source.measurementBasis,
      foodState: source.foodState,
      servingReference: source.servingReference,
      referenceNutrients: source.referenceNutrients,
      energySource: source.energySource,
      calculationVersion: source.calculationVersion,
    });
  }

  async archive(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem> {
    return this.changeStatus(accountId, foodId, expectedVersion, 'ARCHIVED');
  }

  async restore(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem> {
    return this.changeStatus(accountId, foodId, expectedVersion, 'ACTIVE');
  }

  async deleteIfUnreferenced(accountId: string, foodId: string, expectedVersion: number): Promise<boolean> {
    await this.requireVersion(accountId, foodId, expectedVersion);
    const [recipeReferences, readyMealReferences] = await Promise.all([
      this.handle.db.select({ id: recipeIngredients.id }).from(recipeIngredients).where(and(eq(recipeIngredients.accountId, accountId), eq(recipeIngredients.sourceType, 'ACCOUNT_CUSTOM'), eq(recipeIngredients.sourceId, foodId))),
      this.handle.db.select({ id: readyMealItems.id }).from(readyMealItems).where(and(eq(readyMealItems.accountId, accountId), eq(readyMealItems.sourceType, 'FOOD'), eq(readyMealItems.sourceId, foodId))),
    ]);
    if (recipeReferences.length || readyMealReferences.length) {
      throw createLibraryError('LIBRARY_DEPENDENCY_EXISTS', 'O alimento está sendo usado por uma receita ou refeição pronta.');
    }
    await this.handle.db.delete(foodCatalogItems).where(and(eq(foodCatalogItems.id, foodId), eq(foodCatalogItems.accountId, accountId), eq(foodCatalogItems.version, expectedVersion)));
    return (await this.getById(accountId, foodId)) === null;
  }

  private async requireEntity(accountId: string, foodId: string): Promise<FoodCatalogItem> {
    const current = await this.getById(accountId, foodId);
    if (current) return current;
    const foreign = await this.handle.db.select({ id: foodCatalogItems.id }).from(foodCatalogItems).where(eq(foodCatalogItems.id, foodId));
    if (foreign[0]) throw createLibraryError('LIBRARY_SCOPE_VIOLATION', 'O alimento pertence a outra Conta.');
    throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento não encontrado nesta Conta.');
  }

  private async requireVersion(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem> {
    const current = await this.requireEntity(accountId, foodId);
    if (current.version !== expectedVersion) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'A versão do alimento está desatualizada.');
    return current;
  }

  private async changeStatus(accountId: string, foodId: string, expectedVersion: number, status: 'ACTIVE' | 'ARCHIVED'): Promise<FoodCatalogItem> {
    const current = await this.requireVersion(accountId, foodId, expectedVersion);
    await this.handle.db.update(foodCatalogItems).set({ status, version: current.version + 1, archivedAt: status === 'ARCHIVED' ? this.now() : null, updatedAt: this.now() }).where(and(eq(foodCatalogItems.id, foodId), eq(foodCatalogItems.accountId, accountId), eq(foodCatalogItems.version, expectedVersion)));
    const result = await this.getById(accountId, foodId);
    if (!result || result.version !== expectedVersion + 1) throw createLibraryError('LIBRARY_VERSION_CONFLICT', 'O alimento foi alterado antes da operação.');
    return result;
  }
}
