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
import { getPatientById, savePatientToStorage } from '../patientsStore';

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

  it('records diet activity when a plan is saved for a known patient', () => {
    const patient = savePatientToStorage({
      name: 'Paciente Dieta',
      age: 29,
      gender: 'Feminino',
      heightCm: 164,
      weightKg: 61,
      targetKcal: 1800,
      targetProtein: 110,
      targetCarbs: 200,
      targetFats: 55,
      objective: 'Manutenção',
    });
    const plan = createInitialDietPlan(patient.id, {
      weightKg: patient.weightKg,
      targetKcal: patient.targetKcal,
      targetProtein: patient.targetProtein,
      targetCarbs: patient.targetCarbs,
      targetFats: patient.targetFats,
    });

    saveDietToStorage(plan);

    expect(getPatientById(patient.id)?.lastActivity?.type).toBe('diet');
    expect(getPatientById(patient.id)?.lastActivity?.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
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

  it('round-trips optional meal variations while keeping legacy meals compatible', () => {
    const plan = createInitialDietPlan('pat-variations', {});
    plan.simpleMeals = [
      {
        id: 'meal-variation-store',
        name: 'Almoço',
        time: '12:00',
        items: [{ id: 'item-base', name: 'Arroz', quantityGrams: 100, protein: 2, carbs: 28, fats: 0, kcal: 130 }],
        variations: [
          {
            id: 'meal-variation-store::variation-2',
            items: [{ id: 'item-extra', name: 'Batata', quantityGrams: 150, protein: 3, carbs: 30, fats: 0, kcal: 140 }],
          },
        ],
      },
      {
        id: 'meal-legacy-store',
        name: 'Lanche',
        time: '16:00',
        items: [],
      },
    ];

    saveDietToStorage(plan);

    const fetched = getDietFromStorage('pat-variations', plan.id);
    expect(fetched?.simpleMeals[0].variations).toHaveLength(1);
    expect(fetched?.simpleMeals[0].variations?.[0].items[0].name).toBe('Batata');
    expect(fetched?.simpleMeals[1].variations).toBeUndefined();
  });
});
