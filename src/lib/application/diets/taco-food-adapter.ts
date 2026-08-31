import tacoData from '@/data/taco_database.json';
import Decimal from 'decimal.js';
import { TACO_DATASET_MANIFEST } from '@/data/taco-dataset-manifest';
import { createDecimalString, type DecimalString, type DietUnit, type FoodState, type NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { calculateEnergyFromMacros, scaleNutrition } from '@/lib/domain/diets/nutrition';

export interface TacoFoodRecord {
  id: string;
  name: string;
  preparo: string;
  category: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
  sourceType: 'SYSTEM_TACO';
}

type TacoJsonRecord = Omit<TacoFoodRecord, 'sourceType'>;

const bundledFoods: readonly TacoFoodRecord[] = (tacoData as TacoJsonRecord[]).map((food) => ({
  ...food,
  sourceType: 'SYSTEM_TACO',
}));

function normalizedText(value: string): string {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeFoodState(preparation: string): FoodState {
  const value = normalizedText(preparation);
  if (value.includes('cru') || value.includes('in natura')) return 'RAW';
  if (value.includes('cozid')) return 'COOKED';
  if (value.includes('assad') || value.includes('grelhad') || value.includes('frit')) return 'PREPARED';
  return 'AS_SOLD';
}

function numberToDecimal(value: number): DecimalString {
  if (!Number.isFinite(value) || value < 0) throw new Error('Nutriente TACO inválido.');
  return createDecimalString(String(value));
}

function preparationDescription(food: TacoFoodRecord): string {
  return `${food.name} — ${food.category}; preparo original: ${food.preparo || 'inNatura'}`;
}

export function listTacoFoods(): readonly TacoFoodRecord[] {
  return bundledFoods;
}

export function searchTaco(query: string): readonly TacoFoodRecord[] {
  const normalizedQuery = normalizedText(query).trim();
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  return bundledFoods
    .map((food, index) => {
      const searchable = normalizedText(`${food.name} ${food.preparo} ${food.category}`);
      const matched = terms.filter((term) => searchable.includes(term)).length;
      return { food, index, score: matched === terms.length ? 100 + (searchable.startsWith(normalizedQuery) ? 10 : 0) : matched };
    })
    .filter((entry) => entry.score >= (terms.length > 1 ? terms.length : 1))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.food);
}

export function createTacoSnapshot(foodId: string, prescribedQuantity: string, prescribedUnit: DietUnit = 'g'): NutritionSnapshot {
  const food = bundledFoods.find((candidate) => candidate.id === foodId);
  if (!food) throw new Error('Alimento TACO não encontrado.');
  if (prescribedUnit !== 'g') throw new Error('Alimentos TACO desta etapa usam gramas.');

  const quantity = createDecimalString(prescribedQuantity);
  if (!new Decimal(quantity).isFinite() || !new Decimal(quantity).isPositive()) throw new Error('A quantidade prescrita deve ser positiva.');

  const reference = {
    referenceQuantity: createDecimalString('100'),
    protein: numberToDecimal(food.proteinG),
    carbs: numberToDecimal(food.carbsG),
    fat: numberToDecimal(food.fatsG),
    fiber: numberToDecimal(food.fiberG),
    energyKcal: numberToDecimal(food.kcal),
  };
  const prescribed = scaleNutrition(reference, quantity);
  const energy = calculateEnergyFromMacros(reference);
  const foodState = normalizeFoodState(food.preparo);

  return {
    sourceType: TACO_DATASET_MANIFEST.sourceType,
    sourceId: food.id,
    sourceVersion: TACO_DATASET_MANIFEST.version,
    displayName: food.name,
    description: preparationDescription(food),
    measurementBasis: 'PER_100G',
    foodState,
    referenceQuantity: reference.referenceQuantity,
    referenceUnit: 'g',
    referenceNutrients: {
      protein: reference.protein,
      carbs: reference.carbs,
      fat: reference.fat,
      fiber: reference.fiber,
      energyKcal: energy.value,
    },
    prescribedQuantity: quantity,
    prescribedUnit,
    prescribedNutrients: {
      protein: prescribed.protein,
      carbs: prescribed.carbs,
      fat: prescribed.fat,
      fiber: prescribed.fiber,
      energyKcal: prescribed.energyKcal,
    },
    energySource: energy.source,
    calculationVersion: 'taco-decimal-v1',
    conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: {
      schemaVersion: 1,
      source: 'TACO',
      originalPreparation: food.preparo,
      normalizedPreparation: foodState,
      category: food.category,
    },
  };
}
