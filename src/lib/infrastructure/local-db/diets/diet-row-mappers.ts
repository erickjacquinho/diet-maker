import { createDecimalString, type DietDayCode, type DietPlan, type DietVariation, type DietMeal, type DietMealOption, type DietItem, type NutritionSnapshot, type NutritionValues, type JsonValue } from '@/lib/domain/diets/diet-model';
import type { dietItemSnapshots, dietMealItems, dietMealOptions, dietMeals, dietPlans, dietVariationDays, dietVariations } from '../schema';

type PlanRow = typeof dietPlans.$inferSelect;
type VariationRow = typeof dietVariations.$inferSelect;
type VariationDayRow = typeof dietVariationDays.$inferSelect;
type MealRow = typeof dietMeals.$inferSelect;
type OptionRow = typeof dietMealOptions.$inferSelect;
type ItemRow = typeof dietMealItems.$inferSelect;
type SnapshotRow = typeof dietItemSnapshots.$inferSelect;

export function decimalToNumeric(value: string): string {
  return value;
}

export function numericToDecimal(value: string | number | null | undefined): ReturnType<typeof createDecimalString> | undefined {
  if (value === null || value === undefined) return undefined;
  return createDecimalString(String(value));
}

function requiredDecimal(value: string | number): ReturnType<typeof createDecimalString> {
  const result = numericToDecimal(value);
  if (!result) throw new Error('Valor numeric obrigatório ausente.');
  return result;
}

function toJsonValue(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(toJsonValue);
  if (typeof value === 'object') {
    const result: { [key: string]: JsonValue } = {};
    for (const [key, child] of Object.entries(value)) result[key] = toJsonValue(child);
    return result;
  }
  throw new Error('Snapshot JSON inválido.');
}

function nutritionValues(protein: string | number, carbs: string | number, fat: string | number, fiber: string | number, energyKcal: string | number | null): NutritionValues {
  return {
    protein: requiredDecimal(protein),
    carbs: requiredDecimal(carbs),
    fat: requiredDecimal(fat),
    fiber: requiredDecimal(fiber),
    ...(energyKcal === null ? {} : { energyKcal: requiredDecimal(energyKcal) }),
  };
}

export function mapNutritionSnapshot(row: SnapshotRow): NutritionSnapshot {
  return {
    sourceType: row.sourceType as NutritionSnapshot['sourceType'],
    sourceId: row.sourceId,
    sourceVersion: row.sourceVersion,
    displayName: row.displayName,
    description: row.description,
    measurementBasis: row.measurementBasis as NutritionSnapshot['measurementBasis'],
    foodState: row.foodState as NutritionSnapshot['foodState'],
    referenceQuantity: requiredDecimal(row.referenceQuantity),
    referenceUnit: row.referenceUnit as NutritionSnapshot['referenceUnit'],
    referenceNutrients: nutritionValues(row.referenceProtein, row.referenceCarbs, row.referenceFat, row.referenceFiber, row.referenceEnergyKcal),
    prescribedQuantity: requiredDecimal(row.prescribedQuantity),
    prescribedUnit: row.prescribedUnit as NutritionSnapshot['prescribedUnit'],
    prescribedNutrients: nutritionValues(row.prescribedProtein, row.prescribedCarbs, row.prescribedFat, row.prescribedFiber, row.prescribedEnergyKcal),
    energySource: row.energySource as NutritionSnapshot['energySource'],
    calculationVersion: row.calculationVersion,
    conversionSnapshot: toJsonValue(row.conversionSnapshot),
    compositionSnapshot: toJsonValue(row.compositionSnapshot),
  };
}

export interface DietAggregateRows {
  plan: PlanRow;
  variations: VariationRow[];
  days: VariationDayRow[];
  meals: MealRow[];
  options: OptionRow[];
  items: ItemRow[];
  snapshots: SnapshotRow[];
}

export function mapDietAggregate(rows: DietAggregateRows): DietPlan {
  const snapshots = new Map(rows.snapshots.map((snapshot) => [snapshot.dietMealItemId, mapNutritionSnapshot(snapshot)]));
  const itemsByOption = new Map<string, DietItem[]>();
  for (const row of [...rows.items].sort((a, b) => a.position - b.position)) {
    const items = itemsByOption.get(row.dietMealOptionId) ?? [];
    const snapshot = snapshots.get(row.id);
    if (!snapshot) throw new Error(`Snapshot ausente para o item ${row.id}.`);
    items.push({ id: row.id, position: row.position, role: row.role as DietItem['role'], ...(row.parentItemId ? { parentItemId: row.parentItemId } : {}), name: row.name, snapshot });
    itemsByOption.set(row.dietMealOptionId, items);
  }

  const optionsByMeal = new Map<string, DietMealOption[]>();
  for (const row of [...rows.options].sort((a, b) => a.position - b.position)) {
    const options = optionsByMeal.get(row.dietMealId) ?? [];
    options.push({ id: row.id, position: row.position, label: row.label, countsTowardTotals: row.countsTowardTotals, items: itemsByOption.get(row.id) ?? [] });
    optionsByMeal.set(row.dietMealId, options);
  }

  const mealsByVariation = new Map<string, DietMeal[]>();
  for (const row of [...rows.meals].sort((a, b) => a.position - b.position)) {
    const meals = mealsByVariation.get(row.variationId) ?? [];
    meals.push({ id: row.id, position: row.position, name: row.name, ...(row.time ? { time: row.time } : {}), options: optionsByMeal.get(row.id) ?? [] });
    mealsByVariation.set(row.variationId, meals);
  }

  const daysByVariation = new Map<string, DietDayCode[]>();
  for (const row of [...rows.days].sort((a, b) => a.position - b.position)) {
    const days = daysByVariation.get(row.variationId) ?? [];
    days.push(row.dayCode as DietDayCode);
    daysByVariation.set(row.variationId, days);
  }

  const variations: DietVariation[] = [...rows.variations].sort((a, b) => a.position - b.position).map((row) => ({
    id: row.id,
    position: row.position,
    kind: row.kind as DietVariation['kind'],
    name: row.name,
    inputMode: row.inputMode as DietVariation['inputMode'],
    assignedDays: daysByVariation.get(row.id) ?? [],
    targets: { protein: requiredDecimal(row.targetProtein), carbs: requiredDecimal(row.targetCarbs), fat: requiredDecimal(row.targetFat), energyKcal: requiredDecimal(row.targetKcal) },
    ...(row.gPerKgProtein === null || row.gPerKgCarbs === null || row.gPerKgFat === null ? {} : { gPerKg: { protein: requiredDecimal(row.gPerKgProtein), carbs: requiredDecimal(row.gPerKgCarbs), fat: requiredDecimal(row.gPerKgFat) } }),
    meals: mealsByVariation.get(row.id) ?? [],
  }));

  return {
    id: rows.plan.id,
    accountId: rows.plan.accountId,
    patientId: rows.plan.patientId,
    name: rows.plan.name,
    mode: rows.plan.mode as DietPlan['mode'],
    status: rows.plan.status as DietPlan['status'],
    version: rows.plan.version,
    ...(rows.plan.weightReferenceKg === null ? {} : { weightReferenceKg: requiredDecimal(rows.plan.weightReferenceKg) }),
    createdAt: rows.plan.createdAt,
    updatedAt: rows.plan.updatedAt,
    activatedAt: rows.plan.activatedAt,
    supersededAt: rows.plan.supersededAt,
    variations,
  };
}
