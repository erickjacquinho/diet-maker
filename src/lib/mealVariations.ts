import type { DietItem, DietMeal, DietMealVariation } from './dietStore';

export const MAX_MEAL_VARIATIONS = 5;

export interface MealVariationOption {
  id: string;
  label: string;
  items: DietItem[];
}

export interface AppendMealVariationResult {
  meal: DietMeal;
  variationId: string;
  changed: boolean;
}

export interface RemoveMealVariationResult {
  meal: DietMeal;
  activeVariationId: string;
  removed: boolean;
}

export type ActiveMealVariationIds = Record<string, string>;

export function getBaseMealVariationId(mealId: string): string {
  return `${mealId}::variation-1`;
}

export function getMealVariationContextKey(
  mode: 'simple' | 'carb_cycling',
  mealId: string,
  cycleVariationId?: string
): string {
  return mode === 'carb_cycling'
    ? `carb_cycling:${cycleVariationId || 'default'}:${mealId}`
    : `simple:${mealId}`;
}

export function projectMealGroups(
  meals: DietMeal[],
  mode: 'simple' | 'carb_cycling',
  cycleVariationId: string | undefined,
  activeMealVariationIds: ActiveMealVariationIds = {}
): DietMeal[] {
  return meals.map((meal) => {
    const contextKey = getMealVariationContextKey(mode, meal.id, cycleVariationId);
    const active = getActiveMealVariation(meal, activeMealVariationIds[contextKey]);
    return { ...meal, items: active.items };
  });
}

export function createMealVariationId(mealId: string): string {
  return `${mealId}::variation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createFreshItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createFreshMealId(): string {
  return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneItemsWithFreshIds(items: DietItem[] = []): DietItem[] {
  return items.map((item) => ({ ...item, id: createFreshItemId() }));
}

function isValidVariation(value: DietMealVariation | null | undefined): value is DietMealVariation {
  return Boolean(value && typeof value.id === 'string' && value.id.length > 0 && Array.isArray(value.items));
}

function getExtraVariations(meal: DietMeal): DietMealVariation[] {
  if (!Array.isArray(meal.variations)) return [];

  const seenIds = new Set<string>([getBaseMealVariationId(meal.id)]);
  return meal.variations
    .filter(isValidVariation)
    .filter((variation) => {
      if (seenIds.has(variation.id)) return false;
      seenIds.add(variation.id);
      return true;
    })
    .slice(0, MAX_MEAL_VARIATIONS - 1)
    .map((variation) => ({
      id: variation.id,
      items: Array.isArray(variation.items) ? variation.items : [],
    }));
}

export function getMealVariations(meal: DietMeal): DietMealVariation[] {
  return [
    {
      id: getBaseMealVariationId(meal.id),
      items: Array.isArray(meal.items) ? meal.items : [],
    },
    ...getExtraVariations(meal),
  ];
}

export function getMealVariationOptions(meal: DietMeal): MealVariationOption[] {
  return getMealVariations(meal).map((variation, index) => ({
    id: variation.id,
    label: `Variação ${index + 1}`,
    items: variation.items,
  }));
}

export function getActiveMealVariationId(meal: DietMeal, requestedId?: string): string {
  const options = getMealVariations(meal);
  return options.some((option) => option.id === requestedId)
    ? requestedId as string
    : options[0].id;
}

export function getActiveMealVariation(meal: DietMeal, requestedId?: string): MealVariationOption {
  const options = getMealVariationOptions(meal);
  const activeId = getActiveMealVariationId(meal, requestedId);
  return options.find((option) => option.id === activeId) || options[0];
}

export function normalizeMealVariations(meal: DietMeal): DietMeal {
  const extras = getExtraVariations(meal);
  const normalized: DietMeal = {
    ...meal,
    items: Array.isArray(meal.items) ? meal.items : [],
  };

  if (extras.length > 0) {
    normalized.variations = extras;
  } else {
    delete normalized.variations;
  }

  return normalized;
}

export function appendMealVariation(meal: DietMeal, sourceVariationId?: string): AppendMealVariationResult {
  const normalized = normalizeMealVariations(meal);
  const options = getMealVariations(normalized);
  const activeId = getActiveMealVariationId(normalized, sourceVariationId);

  if (options.length >= MAX_MEAL_VARIATIONS) {
    return {
      meal,
      variationId: activeId,
      changed: false,
    };
  }

  const source = getActiveMealVariation(normalized, activeId);
  const variation: DietMealVariation = {
    id: createMealVariationId(normalized.id),
    items: cloneItemsWithFreshIds(source.items),
  };

  return {
    meal: {
      ...normalized,
      variations: [...(normalized.variations || []), variation],
    },
    variationId: variation.id,
    changed: true,
  };
}

export function updateMealVariationItems(
  meal: DietMeal,
  variationId: string | undefined,
  updater: (items: DietItem[]) => DietItem[]
): DietMeal {
  const normalized = normalizeMealVariations(meal);
  const activeId = getActiveMealVariationId(normalized, variationId);

  if (activeId === getBaseMealVariationId(normalized.id)) {
    return { ...normalized, items: updater(normalized.items) };
  }

  return {
    ...normalized,
    variations: (normalized.variations || []).map((variation) => (
      variation.id === activeId
        ? { ...variation, items: updater(variation.items) }
        : variation
    )),
  };
}

export function removeMealVariation(meal: DietMeal, variationId?: string): RemoveMealVariationResult {
  const normalized = normalizeMealVariations(meal);
  const options = getMealVariations(normalized);
  const activeId = getActiveMealVariationId(normalized, variationId);

  if (options.length <= 1) {
    return { meal, activeVariationId: activeId, removed: false };
  }

  const remaining = options.filter((option) => option.id !== activeId);
  const [first, ...extra] = remaining;
  const compacted: DietMeal = {
    ...normalized,
    items: first.items,
  };

  if (extra.length > 0) {
    compacted.variations = extra.map((option) => ({ id: option.id, items: option.items }));
  } else {
    delete compacted.variations;
  }

  return {
    meal: compacted,
    activeVariationId: remaining[remaining.length - 1].id,
    removed: true,
  };
}

export function cloneMealGroupWithFreshIds(meal: DietMeal): DietMeal {
  const cloned: DietMeal = {
    ...meal,
    id: createFreshMealId(),
    items: cloneItemsWithFreshIds(meal.items),
  };

  if (meal.variations && meal.variations.length > 0) {
    cloned.variations = meal.variations.map((variation) => ({
      ...variation,
      id: createMealVariationId(cloned.id),
      items: cloneItemsWithFreshIds(variation.items),
    }));
  }

  return cloned;
}
