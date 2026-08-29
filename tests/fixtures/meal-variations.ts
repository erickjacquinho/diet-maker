import type { CarbCyclingVariation, DietItem, DietMeal, FullDietPlan } from '@/lib/dietStore';

export const breakfastItems: DietItem[] = [
  {
    id: 'item-breakfast-1',
    foodId: 'food-oatmeal',
    name: 'Aveia',
    quantityGrams: 50,
    protein: 7,
    carbs: 33,
    fats: 4,
    kcal: 196,
  },
  {
    id: 'item-breakfast-2',
    foodId: 'food-yogurt',
    name: 'Iogurte natural',
    quantityGrams: 170,
    protein: 9,
    carbs: 10,
    fats: 5,
    kcal: 121,
  },
];

export const legacyMeal: DietMeal = {
  id: 'meal-legacy-breakfast',
  name: 'Café da manhã',
  time: '08:00',
  items: breakfastItems,
};

export const fiveOptionMeal: DietMeal = {
  ...legacyMeal,
  id: 'meal-five-options',
  variations: [
    { id: 'variation-2', items: [{ ...breakfastItems[0], id: 'item-five-2' }] },
    { id: 'variation-3', items: [{ ...breakfastItems[0], id: 'item-five-3' }] },
    { id: 'variation-4', items: [{ ...breakfastItems[0], id: 'item-five-4' }] },
    { id: 'variation-5', items: [{ ...breakfastItems[0], id: 'item-five-5' }] },
  ],
};

const highDayMeal: DietMeal = {
  ...legacyMeal,
  id: 'meal-cycle-high',
};

const lowDayMeal: DietMeal = {
  ...legacyMeal,
  id: 'meal-cycle-low',
  items: [{ ...breakfastItems[1], id: 'item-cycle-low' }],
};

const createCycleDay = (id: string, name: string, meals: DietMeal[]): CarbCyclingVariation => ({
  id,
  name,
  type: id.includes('high') ? 'high' : 'low',
  targetKcal: 2000,
  targetProtein: 140,
  targetCarbs: id.includes('high') ? 240 : 120,
  targetFats: 60,
  meals,
});

export const simpleDietWithVariation: FullDietPlan = {
  id: 'diet-simple-variations',
  patientId: 'patient-fixture',
  name: 'Dieta simples com opções',
  createdAt: '28/08/2026',
  updatedAt: '28/08/2026',
  mode: 'simple',
  simpleTargetKcal: 2000,
  simpleTargetProtein: 140,
  simpleTargetCarbs: 220,
  simpleTargetFats: 60,
  simpleMeals: [legacyMeal],
  carbCyclingVariations: [],
};

export const carbCyclingDietWithIsolatedDays: FullDietPlan = {
  ...simpleDietWithVariation,
  id: 'diet-carb-cycling-variations',
  mode: 'carb_cycling',
  simpleMeals: [],
  carbCyclingVariations: [
    createCycleDay('day-high', 'Dia alto', [highDayMeal]),
    createCycleDay('day-low', 'Dia baixo', [lowDayMeal]),
  ],
};
