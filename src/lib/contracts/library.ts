import type { DietEditableDocument, DietUnit, EnergySource, FoodState, MeasurementBasis } from '@/lib/domain/diets/diet-model';
import type { CustomFoodInput, FoodCatalogItem, ReadyDiet } from '@/lib/domain/library/library-model';
import { parseDietDocument } from './diets';

/** Wire contracts for `/api/v1/library`. Shared by browser and server. */

export type FoodDto = Omit<FoodCatalogItem, 'accountId'>;
export type ReadyDietDto = Omit<ReadyDiet, 'accountId'>;

export interface CreateFoodRequest {
  /** Client-generated stable ID; repeating the request returns the same food. */
  id: string;
  food: CustomFoodInput;
}

export interface FoodListRequest {
  search?: string;
  includeArchived: boolean;
}

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const decimalPattern = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const foodKeys = ['name', 'description', 'brand', 'measurementBasis', 'foodState', 'servingReference', 'referenceNutrients', 'energySource'] as const;

function record(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object.');
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) if (!allowed.includes(key)) throw new TypeError('Unknown field.');
  return source;
}

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

const units: readonly DietUnit[] = ['g', 'ml', 'unit'];

/** Strict parser: accountId, status, version, timestamps and calculationVersion are server-owned. */
export function parseCustomFoodInput(value: unknown): CustomFoodInput {
  const v = record(value, foodKeys);
  const n = record(v.referenceNutrients, ['protein', 'carbs', 'fat', 'fiber', 'energyKcal']);
  const serving = v.servingReference === undefined || v.servingReference === null
    ? undefined
    : (() => {
        const s = record(v.servingReference, ['quantity', 'unit']);
        return { quantity: decimal(s.quantity), unit: oneOf(s.unit, units) };
      })();
  return {
    name: text(v.name, 200),
    ...(v.description == null ? {} : { description: text(v.description, 1000) }),
    ...(v.brand == null ? {} : { brand: text(v.brand, 200) }),
    measurementBasis: oneOf<MeasurementBasis>(v.measurementBasis, ['PER_100G', 'PER_100ML', 'PER_UNIT']),
    foodState: oneOf<FoodState>(v.foodState, ['RAW', 'COOKED', 'PREPARED', 'AS_SOLD']),
    ...(serving ? { servingReference: serving } : {}),
    referenceNutrients: {
      protein: decimal(n.protein), carbs: decimal(n.carbs), fat: decimal(n.fat), fiber: decimal(n.fiber),
      ...(n.energyKcal == null ? {} : { energyKcal: decimal(n.energyKcal) }),
    },
    ...(v.energySource == null ? {} : { energySource: oneOf<EnergySource>(v.energySource, ['REFERENCE', 'CALCULATED_449']) }),
  };
}

export function parseCreateFoodRequest(value: unknown): CreateFoodRequest {
  const v = record(value, ['id', 'food']);
  return { id: uuid(v.id), food: parseCustomFoodInput(v.food) };
}

export function parseUpdateFoodRequest(value: unknown): CustomFoodInput {
  return parseCustomFoodInput(record(value, ['food']).food);
}

export function parseDuplicateRequest(value: unknown): { id: string } {
  return { id: uuid(record(value, ['id']).id) };
}

export function parseFoodListRequest(search: URLSearchParams): FoodListRequest {
  const term = search.get('search');
  if (term !== null && term.length > 200) throw new TypeError('Invalid search.');
  const archived = search.get('includeArchived');
  if (archived !== null && archived !== 'true' && archived !== 'false') throw new TypeError('Invalid flag.');
  return { ...(term ? { search: term } : {}), includeArchived: archived === 'true' };
}

/** Output allowlist: rebuilds the food from public fields only. */
export function parseFoodDto(value: unknown): FoodDto {
  const f = record(value, ['id', 'accountId', 'sourceType', 'name', 'description', 'brand', 'measurementBasis', 'foodState', 'servingReference', 'referenceNutrients', 'energySource', 'calculationVersion', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt']);
  const input = parseCustomFoodInput({
    name: f.name, description: f.description, brand: f.brand, measurementBasis: f.measurementBasis, foodState: f.foodState,
    servingReference: f.servingReference, referenceNutrients: f.referenceNutrients, energySource: f.energySource,
  });
  return {
    id: String(f.id), sourceType: 'ACCOUNT_CUSTOM', name: input.name, description: input.description ?? '',
    ...(input.brand === undefined ? {} : { brand: input.brand }),
    measurementBasis: input.measurementBasis, foodState: input.foodState,
    ...(input.servingReference ? { servingReference: input.servingReference as FoodDto['servingReference'] } : {}),
    referenceNutrients: input.referenceNutrients as FoodDto['referenceNutrients'],
    energySource: input.energySource ?? 'REFERENCE', calculationVersion: String(f.calculationVersion),
    status: f.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE', version: Number(f.version),
    createdAt: String(f.createdAt), updatedAt: String(f.updatedAt),
    archivedAt: f.archivedAt == null ? null : String(f.archivedAt),
  };
}

export function parseFoodListDto(value: unknown): { items: FoodDto[] } {
  const v = record(value, ['items']);
  if (!Array.isArray(v.items)) throw new TypeError('Invalid list.');
  return { items: v.items.map(parseFoodDto) };
}

export interface CreateReadyDietRequest {
  id: string;
  name: string;
  document: DietEditableDocument;
}

export function parseCreateReadyDietRequest(value: unknown): CreateReadyDietRequest {
  const v = record(value, ['id', 'name', 'document']);
  return { id: uuid(v.id), name: text(v.name, 200), document: parseDietDocument(v.document) };
}

export function parseReadyDietDto(value: unknown): ReadyDietDto {
  const r = record(value, ['id', 'accountId', 'name', 'document', 'version', 'createdAt', 'updatedAt']);
  return {
    id: String(r.id), name: String(r.name), document: parseDietDocument(r.document),
    version: Number(r.version), createdAt: String(r.createdAt), updatedAt: String(r.updatedAt),
  };
}

export function parseReadyDietListDto(value: unknown): { items: ReadyDietDto[] } {
  const v = record(value, ['items']);
  if (!Array.isArray(v.items)) throw new TypeError('Invalid list.');
  return { items: v.items.map(parseReadyDietDto) };
}
