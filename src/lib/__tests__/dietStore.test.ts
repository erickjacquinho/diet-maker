import { describe, it, expect } from 'vitest';
import {
  calculateMealTotals,
  createInitialDietPlan,
} from '../dietStore';

describe('Pure legacy diet view helpers', () => {

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

  it('creates an initial diet plan with zeroed targets when patient has no targets configured', () => {
    const plan = createInitialDietPlan('pat-no-targets', {});

    expect(plan.simpleTargetProtein).toBe(0);
    expect(plan.simpleTargetCarbs).toBe(0);
    expect(plan.simpleTargetFats).toBe(0);
    expect(plan.simpleTargetKcal).toBe(0);
    expect(plan.carbCyclingVariations[0].targetProtein).toBe(0);
    expect(plan.carbCyclingVariations[0].targetCarbs).toBe(0);
    expect(plan.carbCyclingVariations[0].targetFats).toBe(0);
    expect(plan.carbCyclingVariations[0].targetKcal).toBe(0);
  });

});
