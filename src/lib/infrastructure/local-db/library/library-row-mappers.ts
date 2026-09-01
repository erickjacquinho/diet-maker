import { createDecimalString, type EnergySource, type FoodState, type MeasurementBasis } from '@/lib/domain/diets/diet-model';
import type { FoodCatalogItem } from '@/lib/domain/library/library-model';
import type { foodCatalogItems } from '../schema';

type FoodCatalogRow = typeof foodCatalogItems.$inferSelect;

export function mapFoodCatalogRow(row: FoodCatalogRow): FoodCatalogItem {
  return {
    id: row.id,
    accountId: row.accountId,
    sourceType: 'ACCOUNT_CUSTOM',
    name: row.name,
    description: row.description,
    ...(row.brand === null ? {} : { brand: row.brand }),
    measurementBasis: row.measurementBasis as MeasurementBasis,
    foodState: row.foodState as FoodState,
    ...(row.servingReference === null || row.servingUnit === null
      ? {}
      : { servingReference: { quantity: createDecimalString(row.servingReference), unit: row.servingUnit as FoodCatalogItem['servingReference'] extends { unit: infer Unit } ? Unit : never } }),
    referenceNutrients: {
      protein: createDecimalString(row.referenceProtein),
      carbs: createDecimalString(row.referenceCarbs),
      fat: createDecimalString(row.referenceFat),
      fiber: createDecimalString(row.referenceFiber),
      ...(row.referenceEnergyKcal === null ? {} : { energyKcal: createDecimalString(row.referenceEnergyKcal) }),
    },
    energySource: row.energySource as EnergySource,
    calculationVersion: row.calculationVersion,
    status: row.status as FoodCatalogItem['status'],
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
  };
}
