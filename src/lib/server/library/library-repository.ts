import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import type { DecimalString, DietEditableDocument, DietUnit, EnergySource, FoodState, MeasurementBasis } from '@/lib/domain/diets/diet-model';
import type { CustomFoodInput, FoodCatalogItem, LibraryListFilter, ReadyDiet } from '@/lib/domain/library/library-model';
import { LibraryValidationError } from '@/lib/domain/library/library-errors';
import { calculateEnergyFromNutrition, LIBRARY_CALCULATION_VERSION, normalizeDecimal, normalizeNutrition } from '@/lib/domain/library/library-nutrition';
import { validateCustomFoodInput } from '@/lib/domain/library/library-validation';
import { ApiError, NotFoundError, VersionConflictError } from '../api/api-errors';
import type { SqlExecutor } from '../patients/patient-repository';

type FoodRow = {
  id: string;
  name: string;
  description: string;
  brand: string | null;
  measurement_basis: MeasurementBasis;
  food_state: FoodState;
  serving_reference: string | null;
  serving_unit: DietUnit | null;
  reference_protein: string;
  reference_carbs: string;
  reference_fat: string;
  reference_fiber: string;
  reference_energy_kcal: string | null;
  energy_source: EnergySource;
  calculation_version: string;
  status: 'ACTIVE' | 'ARCHIVED';
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  archived_at: Date | string | null;
};

type ReadyDietRow = { id: string; name: string; document: DietEditableDocument; version: number; created_at: Date | string; updated_at: Date | string };

const FOOD_COLUMNS = sql`id, name, description, brand, measurement_basis, food_state, serving_reference, serving_unit,
  reference_protein, reference_carbs, reference_fat, reference_fiber, reference_energy_kcal, energy_source,
  calculation_version, status, version, created_at, updated_at, archived_at`;
const READY_DIET_COLUMNS = sql`id, name, document, version, created_at, updated_at`;

const iso = (value: Date | string): string => new Date(value).toISOString();
const decimal = (value: string) => value as DecimalString;

/** Domain validation failures are client errors; only the field name is echoed back. */
function invalid(error: unknown): never {
  if (error instanceof LibraryValidationError) throw new ApiError(422, 'UNPROCESSABLE', { field: error.field });
  throw error;
}

function toFood(row: FoodRow, accountId: string): FoodCatalogItem {
  return {
    id: row.id,
    accountId,
    sourceType: 'ACCOUNT_CUSTOM',
    name: row.name,
    description: row.description,
    ...(row.brand === null ? {} : { brand: row.brand }),
    measurementBasis: row.measurement_basis,
    foodState: row.food_state,
    ...(row.serving_reference === null || row.serving_unit === null
      ? {}
      : { servingReference: { quantity: decimal(row.serving_reference), unit: row.serving_unit } }),
    referenceNutrients: {
      protein: decimal(row.reference_protein), carbs: decimal(row.reference_carbs),
      fat: decimal(row.reference_fat), fiber: decimal(row.reference_fiber),
      ...(row.reference_energy_kcal === null ? {} : { energyKcal: decimal(row.reference_energy_kcal) }),
    },
    energySource: row.energy_source,
    calculationVersion: row.calculation_version,
    status: row.status,
    version: row.version,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    archivedAt: row.archived_at === null ? null : iso(row.archived_at),
  };
}

function foodValues(input: CustomFoodInput) {
  try {
    validateCustomFoodInput(input);
    const nutrients = normalizeNutrition(input.referenceNutrients);
    const energy = calculateEnergyFromNutrition(nutrients);
    return { nutrients, energy };
  } catch (error) {
    return invalid(error);
  }
}

export function createServerLibraryRepository(tx: SqlExecutor, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });

  async function selectFood(id: string): Promise<FoodRow | undefined> {
    const { rows } = await run<FoodRow>(sql`SELECT ${FOOD_COLUMNS} FROM app.food_catalog_items WHERE account_id = ${accountId} AND id = ${id}`);
    return rows[0];
  }

  async function getFood(id: string): Promise<FoodCatalogItem> {
    const row = await selectFood(id);
    if (!row) throw new NotFoundError();
    return toFood(row, accountId);
  }

  async function listFoods(filter: LibraryListFilter = {}): Promise<FoodCatalogItem[]> {
    const search = filter.search?.trim();
    const { rows } = await run<FoodRow>(sql`
      SELECT ${FOOD_COLUMNS} FROM app.food_catalog_items
      WHERE account_id = ${accountId}
        ${filter.includeArchived ? sql`` : sql`AND status = 'ACTIVE'`}
        ${search ? sql`AND position(lower(${search}) in lower(name)) > 0` : sql``}
      ORDER BY ${filter.includeArchived ? sql`updated_at DESC` : sql`name ASC`}, id LIMIT 1000`);
    return rows.map((row) => toFood(row, accountId));
  }

  /** Idempotent: repeating a create with the same ID returns the stored food unchanged. */
  async function createFood(id: string, input: CustomFoodInput): Promise<{ food: FoodCatalogItem; created: boolean }> {
    const existing = await selectFood(id);
    if (existing) return { food: toFood(existing, accountId), created: false };
    const { nutrients, energy } = foodValues(input);
    const { rows } = await run<FoodRow>(sql`
      INSERT INTO app.food_catalog_items (account_id, id, name, description, brand, measurement_basis, food_state,
        serving_reference, serving_unit, reference_protein, reference_carbs, reference_fat, reference_fiber,
        reference_energy_kcal, energy_source, calculation_version, status, version)
      VALUES (${accountId}, ${id}, ${input.name.trim()}, ${input.description?.trim() ?? ''}, ${input.brand?.trim() || null},
        ${input.measurementBasis}, ${input.foodState},
        ${input.servingReference ? normalizeDecimal(input.servingReference.quantity) : null}, ${input.servingReference?.unit ?? null},
        ${nutrients.protein}, ${nutrients.carbs}, ${nutrients.fat}, ${nutrients.fiber}, ${energy.value},
        ${input.energySource ?? energy.source}, ${LIBRARY_CALCULATION_VERSION}, 'ACTIVE', 1)
      RETURNING ${FOOD_COLUMNS}`);
    return { food: toFood(rows[0], accountId), created: true };
  }

  async function requireVersion(id: string, expectedVersion: number): Promise<FoodRow> {
    const row = await selectFood(id);
    if (!row) throw new NotFoundError();
    if (row.version !== expectedVersion) throw new VersionConflictError(row.version);
    return row;
  }

  async function updateFood(id: string, expectedVersion: number, input: CustomFoodInput): Promise<FoodCatalogItem> {
    await requireVersion(id, expectedVersion);
    const { nutrients, energy } = foodValues(input);
    const { rows } = await run<FoodRow>(sql`
      UPDATE app.food_catalog_items SET name = ${input.name.trim()}, description = ${input.description?.trim() ?? ''},
        brand = ${input.brand?.trim() || null}, measurement_basis = ${input.measurementBasis}, food_state = ${input.foodState},
        serving_reference = ${input.servingReference ? normalizeDecimal(input.servingReference.quantity) : null},
        serving_unit = ${input.servingReference?.unit ?? null}, reference_protein = ${nutrients.protein},
        reference_carbs = ${nutrients.carbs}, reference_fat = ${nutrients.fat}, reference_fiber = ${nutrients.fiber},
        reference_energy_kcal = ${energy.value}, energy_source = ${input.energySource ?? energy.source},
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${FOOD_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toFood(rows[0], accountId);
  }

  async function duplicateFood(sourceId: string, newId: string): Promise<{ food: FoodCatalogItem; created: boolean }> {
    const source = await getFood(sourceId);
    return createFood(newId, {
      name: `${source.name} (cópia)`,
      description: source.description,
      brand: source.brand,
      measurementBasis: source.measurementBasis,
      foodState: source.foodState,
      servingReference: source.servingReference,
      referenceNutrients: source.referenceNutrients,
      energySource: source.energySource,
    });
  }

  async function setFoodStatus(id: string, expectedVersion: number, status: 'ACTIVE' | 'ARCHIVED'): Promise<FoodCatalogItem> {
    await requireVersion(id, expectedVersion);
    const { rows } = await run<FoodRow>(sql`
      UPDATE app.food_catalog_items
      SET status = ${status}, archived_at = ${status === 'ARCHIVED' ? sql`now()` : sql`NULL`}, version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${FOOD_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toFood(rows[0], accountId);
  }

  /** A food is in use when a confirmed diet or a ready diet carries a snapshot of it. */
  async function isFoodReferenced(id: string): Promise<boolean> {
    const vars = sql`jsonb_build_object('id', ${id}::text)`;
    const { rows } = await run<{ used: boolean }>(sql`
      SELECT (
        EXISTS (SELECT 1 FROM app.diet_plans WHERE account_id = ${accountId}
          AND jsonb_path_exists(variations, '$.**.snapshot ? (@.sourceType == "ACCOUNT_CUSTOM" && @.sourceId == $id)', ${vars}))
        OR EXISTS (SELECT 1 FROM app.ready_diets WHERE account_id = ${accountId}
          AND jsonb_path_exists(document, '$.**.snapshot ? (@.sourceType == "ACCOUNT_CUSTOM" && @.sourceId == $id)', ${vars}))
      ) AS used`);
    return rows[0].used;
  }

  async function deleteFoodIfUnreferenced(id: string, expectedVersion: number): Promise<void> {
    await requireVersion(id, expectedVersion);
    if (await isFoodReferenced(id)) throw new ApiError(409, 'CONFLICT', { reason: 'IN_USE' });
    await run(sql`DELETE FROM app.food_catalog_items WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}`);
  }

  function toReadyDiet(row: ReadyDietRow): ReadyDiet {
    return { id: row.id, accountId, name: row.name, document: row.document, version: row.version, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) };
  }

  async function createReadyDiet(id: string, name: string, document: DietEditableDocument): Promise<ReadyDiet> {
    const existing = await run<ReadyDietRow>(sql`SELECT ${READY_DIET_COLUMNS} FROM app.ready_diets WHERE account_id = ${accountId} AND id = ${id}`);
    if (existing.rows[0]) return toReadyDiet(existing.rows[0]);
    if (!name.trim()) throw new ApiError(422, 'UNPROCESSABLE', { field: 'name' });
    const { rows } = await run<ReadyDietRow>(sql`
      INSERT INTO app.ready_diets (account_id, id, name, document, version)
      VALUES (${accountId}, ${id}, ${name.trim()}, ${JSON.stringify(document)}::jsonb, 1)
      RETURNING ${READY_DIET_COLUMNS}`);
    return toReadyDiet(rows[0]);
  }

  async function listReadyDiets(): Promise<ReadyDiet[]> {
    const { rows } = await run<ReadyDietRow>(sql`
      SELECT ${READY_DIET_COLUMNS} FROM app.ready_diets WHERE account_id = ${accountId}
      ORDER BY updated_at DESC, name ASC, id LIMIT 500`);
    return rows.map(toReadyDiet);
  }

  return {
    listFoods, getFood, createFood, updateFood, duplicateFood,
    archiveFood: (id: string, version: number) => setFoodStatus(id, version, 'ARCHIVED'),
    restoreFood: (id: string, version: number) => setFoodStatus(id, version, 'ACTIVE'),
    deleteFoodIfUnreferenced, createReadyDiet, listReadyDiets,
  };
}

export type ServerLibraryRepository = ReturnType<typeof createServerLibraryRepository>;
