import Decimal from 'decimal.js';
import type { DietItem as LegacyDietItem, DietMeal as LegacyDietMeal, FullDietPlan } from '@/lib/legacy-diet-types';
import type {
  DietEditableDocument,
  DietItem,
  DietMeal,
  DietMealOption,
  DietMode,
  DietPlan,
  DietVariation,
  NutritionSnapshot,
} from '@/lib/domain/diets/diet-model';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { createTacoSnapshot, listTacoFoods } from './taco-food-adapter';

const DAY_TO_CANONICAL: Record<string, DietVariation['assignedDays'][number]> = {
  seg: 'MON', ter: 'TUE', qua: 'WED', qui: 'THU', sex: 'FRI', sab: 'SAT', dom: 'SUN',
};

function decimal(value: number | string | undefined): ReturnType<typeof createDecimalString> {
  const normalized = new Decimal(value ?? 0).toFixed();
  return createDecimalString(normalized);
}

function dateText(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
}

function snapshotFor(item: LegacyDietItem): NutritionSnapshot {
  const candidate = (item as LegacyDietItem & { snapshot?: NutritionSnapshot }).snapshot;
  if (candidate) return structuredClone(candidate);
  const normalizedName = item.name.trim().toLocaleLowerCase('pt-BR');
  const food = listTacoFoods().find((candidate) => candidate.id === item.foodId || candidate.name.toLocaleLowerCase('pt-BR') === normalizedName);
  if (!food) throw new Error(`O alimento legado "${item.name}" não possui snapshot TACO recuperável.`);
  return createTacoSnapshot(food.id, String(item.quantityGrams || item.grams || 100));
}

function canonicalItem(item: LegacyDietItem, role: DietItem['role'] = 'PRIMARY', parentItemId?: string): DietItem {
  return {
    id: item.id ?? `item-${item.name}`,
    position: 0,
    role,
    ...(parentItemId ? { parentItemId } : {}),
    name: item.name,
    snapshot: snapshotFor(item),
  };
}

function canonicalMeal(meal: LegacyDietMeal): DietMeal {
  const primaryItems = meal.items.map((item, position) => ({ ...canonicalItem(item), position }));
  const primaryIds = new Map(meal.items.map((item, index) => [item.id ?? `item-${item.name}`, primaryItems[index].id]));
  const options: DietMealOption[] = [{ id: `${meal.id}-option-0`, position: 0, label: 'Principal', countsTowardTotals: true, items: primaryItems }];
  for (const [optionIndex, variation] of (meal.variations ?? []).entries()) {
    options.push({
      id: variation.id,
      position: optionIndex + 1,
      label: `Alternativa ${optionIndex + 1}`,
      countsTowardTotals: false,
      items: variation.items.map((item, position) => ({
        ...canonicalItem(item, 'SUBSTITUTE', item.foodId ? primaryIds.get(item.foodId) : undefined),
        position,
      })),
    });
  }
  return { id: meal.id, position: 0, name: meal.name, ...(meal.time ? { time: meal.time } : {}), options };
}

function canonicalVariation(variation: FullDietPlan['carbCyclingVariations'][number], position: number): DietVariation {
  return {
    id: variation.id,
    position,
    kind: variation.type === 'high' ? 'HIGH' : variation.type === 'medium' ? 'MEDIUM' : variation.type === 'low' ? 'LOW' : variation.type === 'zero' ? 'ZERO' : 'CUSTOM',
    name: variation.name,
    inputMode: variation.inputMode === 'g_per_kg' ? 'G_PER_KG' : variation.inputMode === 'percentage' ? 'PERCENTAGE' : variation.inputMode === 'delta_base' ? 'DELTA_BASE' : 'GRAMS',
    assignedDays: (variation.assignedDays ?? []).map((day) => DAY_TO_CANONICAL[day] ?? 'MON'),
    targets: { protein: decimal(variation.targetProtein), carbs: decimal(variation.targetCarbs), fat: decimal(variation.targetFats), energyKcal: decimal(variation.targetKcal) },
    ...(variation.gPerKg ? { gPerKg: { protein: decimal(variation.gPerKg.protein), carbs: decimal(variation.gPerKg.carbs), fat: decimal(variation.gPerKg.fats) } } : {}),
    meals: variation.meals.map(canonicalMeal).map((meal, index) => ({ ...meal, position: index })),
  };
}

export function toEditableDocument(plan: FullDietPlan): DietEditableDocument {
  const variations: DietVariation[] = plan.mode === 'simple'
    ? [{
      id: 'variation-simple', position: 0, kind: 'SIMPLE', name: 'Plano diário', inputMode: 'GRAMS', assignedDays: [],
      targets: { protein: decimal(plan.simpleTargetProtein), carbs: decimal(plan.simpleTargetCarbs), fat: decimal(plan.simpleTargetFats), energyKcal: decimal(plan.simpleTargetKcal) },
      meals: (plan.simpleMeals ?? []).map(canonicalMeal).map((meal, index) => ({ ...meal, position: index })),
    }]
    : plan.carbCyclingVariations.map(canonicalVariation);
  return {
    name: plan.name,
    mode: plan.mode === 'carb_cycling' ? 'CARB_CYCLING' : 'SIMPLE',
    variations,
  };
}

function legacyItem(item: DietItem): LegacyDietItem {
  const nutrients = item.snapshot.prescribedNutrients;
  const quantityGrams = Number(item.snapshot.prescribedQuantity);
  return {
    id: item.id,
    foodId: item.snapshot.sourceId,
    name: item.name,
    quantityGrams,
    grams: quantityGrams,
    protein: Number(nutrients.protein),
    carbs: Number(nutrients.carbs),
    fats: Number(nutrients.fat),
    kcal: Number(nutrients.energyKcal ?? 0),
    snapshot: structuredClone(item.snapshot),
  } as LegacyDietItem;
}

function legacyMeal(meal: DietMeal): LegacyDietMeal {
  const [primary, ...alternatives] = meal.options;
  return {
    id: meal.id,
    name: meal.name,
    time: meal.time ?? '',
    items: (primary?.items ?? []).map(legacyItem),
    variations: alternatives.map((option) => ({ id: option.id, items: option.items.map(legacyItem) })),
  };
}

export function fromEditableDocument(document: DietEditableDocument, patientId: string, id: string, createdAt: string, updatedAt: string): FullDietPlan {
  const simple = document.variations[0];
  return {
    id,
    patientId,
    name: document.name,
    createdAt: dateText(createdAt),
    updatedAt: dateText(updatedAt),
    mode: document.mode === 'CARB_CYCLING' ? 'carb_cycling' : 'simple',
    simpleTargetKcal: Number(simple?.targets.energyKcal ?? 0),
    simpleTargetProtein: Number(simple?.targets.protein ?? 0),
    simpleTargetCarbs: Number(simple?.targets.carbs ?? 0),
    simpleTargetFats: Number(simple?.targets.fat ?? 0),
    simpleMeals: document.mode === 'SIMPLE' ? (simple?.meals ?? []).map(legacyMeal) : [],
    carbCyclingVariationsCount: document.mode === 'CARB_CYCLING' ? document.variations.length : 3,
    carbCyclingVariations: document.mode === 'CARB_CYCLING' ? document.variations.map((variation) => ({
      id: variation.id,
      name: variation.name,
      type: variation.kind === 'HIGH' ? 'high' : variation.kind === 'MEDIUM' ? 'medium' : variation.kind === 'LOW' ? 'low' : variation.kind === 'ZERO' ? 'zero' : 'custom',
      assignedDays: variation.assignedDays.map((day) => Object.entries(DAY_TO_CANONICAL).find(([, canonical]) => canonical === day)?.[0] ?? 'seg') as FullDietPlan['carbCyclingVariations'][number]['assignedDays'],
      targetKcal: Number(variation.targets.energyKcal),
      targetProtein: Number(variation.targets.protein),
      targetCarbs: Number(variation.targets.carbs),
      targetFats: Number(variation.targets.fat),
      inputMode: variation.inputMode === 'G_PER_KG' ? 'g_per_kg' : variation.inputMode === 'PERCENTAGE' ? 'percentage' : variation.inputMode === 'DELTA_BASE' ? 'delta_base' : 'grams',
      ...(variation.gPerKg ? { gPerKg: { protein: Number(variation.gPerKg.protein), carbs: Number(variation.gPerKg.carbs), fats: Number(variation.gPerKg.fat) } } : {}),
      meals: variation.meals.map(legacyMeal),
    })) : [],
  };
}

export function fromCanonicalPlan(plan: DietPlan): FullDietPlan {
  const document: DietEditableDocument = {
    name: plan.name,
    mode: plan.mode,
    ...(plan.weightReferenceKg ? { weightReferenceKg: plan.weightReferenceKg } : {}),
    variations: structuredClone(plan.variations),
  };
  return fromEditableDocument(document, plan.patientId, plan.id, plan.createdAt, plan.updatedAt);
}
