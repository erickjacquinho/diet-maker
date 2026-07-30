import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateMealTotals,
  calculateMealsTotal,
  createInitialDietPlan,
  saveDietToStorage,
  getDietFromStorage,
  getPatientDietsFromStorage,
  FullDietPlan,
  DietMeal,
} from '../dietStore';

describe('Diet Domain: dietStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly calculates meal totals from items', () => {
    const items = [
      { name: 'Ovo Cozido', quantityGrams: 100, protein: 13, carbs: 1, fats: 10, kcal: 146 },
      { name: 'Aveia', quantityGrams: 50, protein: 7, carbs: 33, fats: 4, kcal: 196 },
    ];

    const totals = calculateMealTotals(items);
    expect(totals.proteinG).toBe(20);
    expect(totals.carbsG).toBe(34);
    expect(totals.fatsG).toBe(14);
    // Kcal = 20*4 + 34*4 + 14*9 = 80 + 136 + 126 = 342
    expect(totals.kcal).toBe(342);
  });

  it('creates an initial diet plan for a patient with 3 carb cycling variations', () => {
    const initial = createInitialDietPlan('pat-123', {
      weightKg: 80,
      targetKcal: 2400,
      targetProtein: 160,
      targetCarbs: 280,
      targetFats: 65,
    });

    expect(initial.patientId).toBe('pat-123');
    expect(initial.mode).toBe('simple');
    expect(initial.simpleMeals).toEqual([]);
    expect(initial.carbCyclingVariationsCount).toBe(3);
    expect(initial.carbCyclingVariations).toHaveLength(3);

    const [high, med, low] = initial.carbCyclingVariations;
    expect(high.name).toBe('Dia Alto Carbo');
    expect(high.type).toBe('high');
    expect(high.targetCarbs).toBeGreaterThan(med.targetCarbs);

    expect(med.name).toBe('Dia Médio Carbo');
    expect(med.type).toBe('medium');

    expect(low.name).toBe('Dia Baixo Carbo');
    expect(low.type).toBe('low');
    expect(low.targetCarbs).toBeLessThan(med.targetCarbs);
  });

  it('saves and retrieves a full diet plan from localStorage', () => {
    const plan = createInitialDietPlan('pat-999', {
      weightKg: 75,
      targetKcal: 2200,
      targetProtein: 150,
      targetCarbs: 250,
      targetFats: 60,
    });

    plan.mode = 'carb_cycling';
    plan.simpleMeals = [
      {
        id: 'm-1',
        name: 'Café da Manhã',
        time: '08:00',
        items: [
          { name: 'Ovo', quantityGrams: 100, protein: 13, carbs: 1, fats: 10, kcal: 146 },
        ],
      },
    ];

    const saved = saveDietToStorage(plan);
    expect(saved.id).toBe(plan.id);

    const fetched = getDietFromStorage('pat-999', plan.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.mode).toBe('carb_cycling');
    expect(fetched?.simpleMeals).toHaveLength(1);

    const allPatientDiets = getPatientDietsFromStorage('pat-999');
    expect(allPatientDiets).toHaveLength(1);
  });
});
