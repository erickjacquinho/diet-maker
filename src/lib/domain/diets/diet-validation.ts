import Decimal from 'decimal.js';
import { DietDomainError } from './diet-errors';
import type { DietEditableDocument, DietItem, DietMeal, DietVariation } from './diet-model';
import { isDecimalString } from './diet-model';

function fail(code: 'INVALID_DIET' | 'INVALID_MINIMUM' | 'INVALID_SNAPSHOT', message: string): never {
  throw new DietDomainError(code, message);
}

function validateItem(item: DietItem, ids: Set<string>): void {
  if (!item.id || ids.has(item.id)) fail('INVALID_DIET', 'Os itens da prescrição precisam ter identidades únicas.');
  ids.add(item.id);
  if (item.role === 'SUBSTITUTE' && (!item.parentItemId || !ids.has(item.parentItemId))) fail('INVALID_DIET', 'Substituto precisa apontar para um item principal existente.');
  if (item.role === 'PRIMARY' && item.parentItemId) fail('INVALID_DIET', 'Item principal não pode apontar para um item pai.');
  const snapshot = item.snapshot;
  if (snapshot.sourceType !== 'SYSTEM_TACO' || !snapshot.sourceId || !snapshot.sourceVersion) fail('INVALID_SNAPSHOT', 'Cada item precisa carregar um snapshot TACO completo.');
  if (!isDecimalString(snapshot.referenceQuantity) || !isDecimalString(snapshot.prescribedQuantity) || new Decimal(snapshot.referenceQuantity).lte(0) || new Decimal(snapshot.prescribedQuantity).lte(0)) fail('INVALID_SNAPSHOT', 'As quantidades do snapshot precisam ser maiores que zero.');
  for (const value of [
    ...Object.values(snapshot.referenceNutrients),
    ...Object.values(snapshot.prescribedNutrients),
  ]) {
    if (!isDecimalString(value) || new Decimal(value).lt(0)) fail('INVALID_SNAPSHOT', 'Os nutrientes do snapshot precisam ser decimais não negativos.');
  }
}

function validateMeal(meal: DietMeal, ids: Set<string>): boolean {
  if (!meal.id || !meal.name.trim()) fail('INVALID_DIET', 'Cada refeição precisa de identidade e nome.');
  const countedOptions = meal.options.filter((option) => option.countsTowardTotals);
  for (const option of meal.options) {
    if (!option.id || option.items.length === 0) continue;
    const localIds = new Set<string>();
    for (const item of option.items) {
      validateItem(item, ids);
      if (localIds.has(item.id)) fail('INVALID_DIET', 'A identidade do item não pode se repetir na opção.');
      localIds.add(item.id);
    }
  }
  return countedOptions.some((option) => option.items.some((item) => item.role === 'PRIMARY'));
}

function validateVariation(variation: DietVariation, ids: Set<string>): boolean {
  if (!variation.id || !variation.name.trim() || variation.meals.some((meal, index) => meal.position !== index)) fail('INVALID_DIET', 'Variações e refeições precisam ter posições contíguas.');
  for (const target of Object.values(variation.targets)) {
    if (!isDecimalString(target) || new Decimal(target).lt(0)) fail('INVALID_DIET', 'Metas precisam ser decimais não negativos.');
  }
  const assigned = new Set<string>();
  for (const day of variation.assignedDays) {
    if (assigned.has(day)) fail('INVALID_DIET', 'Um dia não pode ser atribuído duas vezes à mesma variação.');
    assigned.add(day);
  }
  return variation.meals.some((meal) => validateMeal(meal, ids));
}

export function validateDietForConfirmation(document: DietEditableDocument): void {
  if (!document.name.trim() || document.variations.length === 0) fail('INVALID_DIET', 'A prescrição precisa de nome e ao menos uma variação.');
  const ids = new Set<string>();
  const hasValidMeal = document.variations.some((variation) => validateVariation(variation, ids));
  if (!hasValidMeal) fail('INVALID_MINIMUM', 'Adicione ao menos uma refeição com um alimento principal.');
}
