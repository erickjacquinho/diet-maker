import Decimal from 'decimal.js';
import { libraryValidationError } from './library-errors';
import type { CustomFoodInput, ReadyMealInput, RecipeInput } from './library-model';

const MEASUREMENT_BASES = new Set(['PER_100G', 'PER_100ML', 'PER_UNIT']);
const FOOD_STATES = new Set(['RAW', 'COOKED', 'PREPARED', 'AS_SOLD']);
const UNITS = new Set(['g', 'ml', 'unit']);

export function validateLibraryName(value: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    libraryValidationError('name', 'deve ser informado.');
  }
}

export function validatePositiveDecimal(value: string | number, field: string): void {
  if (value === '' || value === null || value === undefined) libraryValidationError(field, 'deve ser positivo.');
  let decimal: Decimal;
  try {
    decimal = new Decimal(value);
  } catch {
    libraryValidationError(field, 'deve ser um número decimal válido.');
  }
  if (!decimal!.isFinite() || !decimal!.isPositive()) libraryValidationError(field, 'deve ser um número finito positivo.');
}

export function validateNonNegativeDecimal(value: string | number, field: string): void {
  if (value === '' || value === null || value === undefined) libraryValidationError(field, 'deve ser informado.');
  let decimal: Decimal;
  try {
    decimal = new Decimal(value);
  } catch {
    libraryValidationError(field, 'deve ser um número decimal válido.');
  }
  if (!decimal!.isFinite() || decimal!.isNegative()) libraryValidationError(field, 'deve ser um número finito não negativo.');
}

export function validateUnit(value: string, field: string): void {
  if (!UNITS.has(value)) libraryValidationError(field, 'deve ser g, ml ou unit.');
}

export function validateCustomFoodInput(input: CustomFoodInput): void {
  validateLibraryName(input.name);
  if (!MEASUREMENT_BASES.has(input.measurementBasis)) libraryValidationError('measurementBasis', 'é inválida.');
  if (!FOOD_STATES.has(input.foodState)) libraryValidationError('foodState', 'é inválido.');
  for (const field of ['protein', 'carbs', 'fat', 'fiber'] as const) {
    validateNonNegativeDecimal(input.referenceNutrients[field], 'referenceNutrients.' + field);
  }
  if (input.referenceNutrients.energyKcal !== undefined) {
    validateNonNegativeDecimal(input.referenceNutrients.energyKcal, 'referenceNutrients.energyKcal');
  }
  if (input.servingReference) {
    validatePositiveDecimal(input.servingReference.quantity, 'servingReference.quantity');
    validateUnit(input.servingReference.unit, 'servingReference.unit');
  }
  if (input.energySource && !['REFERENCE', 'CALCULATED_449'].includes(input.energySource)) {
    libraryValidationError('energySource', 'é inválida.');
  }
}

export function validateRecipeInput(input: RecipeInput): void {
  validateLibraryName(input.name);
  validateLibraryName(input.category);
  validatePositiveDecimal(input.yieldPortions, 'yieldPortions');
  if (input.prepTimeMinutes !== undefined && (!Number.isInteger(input.prepTimeMinutes) || input.prepTimeMinutes < 0)) {
    libraryValidationError('prepTimeMinutes', 'deve ser um inteiro não negativo.');
  }
  if (input.preparedWeightGrams !== undefined) validatePositiveDecimal(input.preparedWeightGrams, 'preparedWeightGrams');
  if (input.ingredients.length === 0) libraryValidationError('ingredients', 'deve conter pelo menos um ingrediente.');
  input.ingredients.forEach((ingredient, index) => {
    if (!['SYSTEM_TACO', 'ACCOUNT_CUSTOM'].includes(ingredient.sourceType)) libraryValidationError('ingredients.' + index + '.sourceType', 'é inválido.');
    if (!ingredient.sourceId.trim()) libraryValidationError('ingredients.' + index + '.sourceId', 'deve ser informado.');
    validatePositiveDecimal(ingredient.quantity, 'ingredients.' + index + '.quantity');
    validateUnit(ingredient.unit, 'ingredients.' + index + '.unit');
  });
}

export function validateReadyMealInput(input: ReadyMealInput): void {
  validateLibraryName(input.name);
  if (input.items.length === 0) libraryValidationError('items', 'deve conter pelo menos um item.');
  input.items.forEach((item, index) => {
    if (!['FOOD', 'RECIPE'].includes(item.sourceType)) libraryValidationError('items.' + index + '.sourceType', 'é inválido.');
    if (!item.sourceId.trim()) libraryValidationError('items.' + index + '.sourceId', 'deve ser informado.');
    if (item.sourceType === 'FOOD') {
      if (item.recipePortions !== undefined) libraryValidationError('items.' + index + '.recipePortions', 'não se aplica a alimentos.');
      if (item.quantity === undefined) libraryValidationError('items.' + index + '.quantity', 'deve ser informado.');
      validatePositiveDecimal(item.quantity!, 'items.' + index + '.quantity');
      if (item.unit === undefined) libraryValidationError('items.' + index + '.unit', 'deve ser informado.');
      validateUnit(item.unit!, 'items.' + index + '.unit');
    } else {
      if (item.quantity !== undefined || item.unit !== undefined) libraryValidationError('items.' + index, 'receita usa recipePortions.');
      if (item.recipePortions === undefined) libraryValidationError('items.' + index + '.recipePortions', 'deve ser informado.');
      validatePositiveDecimal(item.recipePortions!, 'items.' + index + '.recipePortions');
    }
  });
}
