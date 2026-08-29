import { describe, it, expect } from 'vitest';
import {
  buildPreviousDietSummaries,
  cloneMealsWithFreshIds,
  cloneDietForNewDraft,
  extractMacrosFromPreviousDiet,
  type PreviousDietSummary,
} from '@/lib/dietDuplication';
import type { FullDietPlan, DietMeal } from '@/lib/dietStore';
import type { HistoricalDiet } from '@/lib/patientsStore';

describe('dietDuplication utility', () => {
  const mockStoredDiet: FullDietPlan = {
    id: 'diet-101',
    patientId: 'pat-1',
    name: 'Dieta Hipertrofia 2026',
    createdAt: '15/01/2026',
    updatedAt: '20/01/2026',
    mode: 'simple',
    simpleTargetKcal: 2500,
    simpleTargetProtein: 180,
    simpleTargetCarbs: 300,
    simpleTargetFats: 65,
    simpleMeals: [
      {
        id: 'meal-1',
        name: 'Café da Manhã',
        time: '08:00',
        items: [
          {
            id: 'item-1',
            name: 'Ovo cozido',
            quantityGrams: 100,
            protein: 13,
            carbs: 1,
            fats: 9,
            kcal: 140,
          },
          {
            id: 'item-2',
            name: 'Pão Francês',
            quantityGrams: 50,
            protein: 4,
            carbs: 28,
            fats: 1,
            kcal: 135,
          },
        ],
      },
      {
        id: 'meal-2',
        name: 'Almoço',
        time: '12:30',
        items: [
          {
            id: 'item-3',
            name: 'Frango Grelhado',
            quantityGrams: 150,
            protein: 45,
            carbs: 0,
            fats: 4,
            kcal: 220,
          },
        ],
      },
    ],
    carbCyclingVariationsCount: 3,
    carbCyclingVariations: [],
  };

  const mockHistoricalDiet: HistoricalDiet = {
    id: 'diet-old-99',
    name: 'Plano Antigo 2025',
    date: '10/11/2025',
    status: 'Histórica',
    targetKcal: 2000,
    proteinG: 140,
    carbsG: 220,
    fatsG: 50,
    meals: [
      {
        name: 'Lanche',
        time: '16:00',
        kcal: 100,
        proteinG: 1,
        carbsG: 25,
        fatsG: 0,
        itemsSummary: 'Banana (100g)',
      },
    ],
  };

  describe('buildPreviousDietSummaries', () => {
    it('should format stored and historical diets into unified summaries, excluding nova and current diet', () => {
      const stored = [
        mockStoredDiet,
        { ...mockStoredDiet, id: 'nova', name: 'Rascunho Atual' },
        { ...mockStoredDiet, id: 'current-edit', name: 'Em Edição' },
      ];
      const historical = [mockHistoricalDiet];

      const summaries = buildPreviousDietSummaries(stored, historical, 'current-edit');

      expect(summaries).toHaveLength(2);
      expect(summaries.some((s) => s.id === 'nova')).toBe(false);
      expect(summaries.some((s) => s.id === 'current-edit')).toBe(false);

      const s1 = summaries.find((s) => s.id === 'diet-101');
      expect(s1).toBeDefined();
      expect(s1?.name).toBe('Dieta Hipertrofia 2026');
      expect(s1?.targetKcal).toBe(2500);
      expect(s1?.proteinG).toBe(180);
      expect(s1?.carbsG).toBe(300);
      expect(s1?.fatsG).toBe(65);
      expect(s1?.mealsCount).toBe(2);
      expect(s1?.modeLabel).toBe('Simples');

      const s2 = summaries.find((s) => s.id === 'diet-old-99');
      expect(s2).toBeDefined();
      expect(s2?.name).toBe('Plano Antigo 2025');
      expect(s2?.mealsCount).toBe(1);
    });

    it('should sort diets by date descending (newest first)', () => {
      const d1 = { ...mockStoredDiet, id: 'd-older', updatedAt: '01/01/2025' };
      const d2 = { ...mockStoredDiet, id: 'd-newer', updatedAt: '15/08/2026' };
      const d3 = { ...mockStoredDiet, id: 'd-mid', updatedAt: '10/05/2025' };

      const summaries = buildPreviousDietSummaries([d1, d2, d3]);

      expect(summaries[0].id).toBe('d-newer');
      expect(summaries[1].id).toBe('d-mid');
      expect(summaries[2].id).toBe('d-older');
    });

    it('should return an empty array when no previous diets exist', () => {
      const summaries = buildPreviousDietSummaries([], []);
      expect(summaries).toEqual([]);
    });

    it('should summarize a carb cycling diet using the weighted weekly average', () => {
      const cyclingDiet: FullDietPlan = {
        ...mockStoredDiet,
        id: 'diet-cycle-101',
        mode: 'carb_cycling',
        carbCyclingVariations: [
          {
            id: 'var-high',
            name: 'Dia Alto Carbo',
            type: 'high',
            assignedDays: ['seg', 'qua', 'sex'],
            targetKcal: 2300,
            targetProtein: 180,
            targetCarbs: 260,
            targetFats: 55,
            meals: [],
          },
          {
            id: 'var-low',
            name: 'Dia Baixo Carbo',
            type: 'low',
            assignedDays: ['ter', 'qui', 'sab', 'dom'],
            targetKcal: 1950,
            targetProtein: 180,
            targetCarbs: 150,
            targetFats: 55,
            meals: [],
          },
        ],
      };

      const [summary] = buildPreviousDietSummaries([cyclingDiet]);

      expect(summary.modeLabel).toBe('Ciclo de Carboidratos');
      expect(summary.targetKcal).toBe(2100);
      expect(summary.proteinG).toBe(180);
      expect(summary.carbsG).toBe(197);
      expect(summary.fatsG).toBe(55);
      expect(summary.variationsCount).toBe(2);
      expect(summary.daysAssignedCount).toBe(7);
    });
  });

  describe('cloneMealsWithFreshIds', () => {
    it('should deep clone meals and items giving each a new unique ID', () => {
      const cloned = cloneMealsWithFreshIds(mockStoredDiet.simpleMeals);

      expect(cloned).toHaveLength(2);
      expect(cloned[0].name).toBe(mockStoredDiet.simpleMeals[0].name);
      expect(cloned[0].time).toBe(mockStoredDiet.simpleMeals[0].time);
      expect(cloned[0].id).not.toBe(mockStoredDiet.simpleMeals[0].id);
      expect(cloned[0].id).toMatch(/^meal-/);

      expect(cloned[0].items).toHaveLength(2);
      expect(cloned[0].items[0].id).not.toBe(mockStoredDiet.simpleMeals[0].items[0].id);
      expect(cloned[0].items[0].id).toMatch(/^item-/);
      expect(cloned[0].items[0].name).toBe('Ovo cozido');
      expect(cloned[0].items[0].quantityGrams).toBe(100);
    });

    it('clones every variation and keeps option edits independent', () => {
      const sourceMeal: DietMeal = {
        ...mockStoredDiet.simpleMeals[0],
        variations: [
          {
            id: 'variation-source-2',
            items: [{ ...mockStoredDiet.simpleMeals[0].items[0], id: 'variation-item-source' }],
          },
        ],
      };

      const [cloned] = cloneMealsWithFreshIds([sourceMeal]);

      expect(cloned.variations).toHaveLength(1);
      expect(cloned.variations?.[0].id).not.toBe(sourceMeal.variations?.[0].id);
      expect(cloned.variations?.[0].items[0].id).not.toBe(sourceMeal.variations?.[0].items[0].id);

      cloned.variations![0].items[0].quantityGrams = 999;
      expect(sourceMeal.variations![0].items[0].quantityGrams).toBe(100);
    });
  });

  describe('cloneDietForNewDraft', () => {
    it('should clone a FullDietPlan into a new draft with id: nova, keeping original untouched', () => {
      const summary: PreviousDietSummary = {
        id: mockStoredDiet.id,
        name: mockStoredDiet.name,
        date: mockStoredDiet.updatedAt,
        mode: 'simple',
        modeLabel: 'Simples',
        targetKcal: 2500,
        proteinG: 180,
        carbsG: 300,
        fatsG: 65,
        mealsCount: 2,
        fullPlan: mockStoredDiet,
      };

      const cloned = cloneDietForNewDraft(summary, 'pat-1', 'nova');

      expect(cloned.id).toBe('nova');
      expect(cloned.patientId).toBe('pat-1');
      expect(cloned.name).toBe('Dieta Hipertrofia 2026 (Cópia)');
      expect(cloned.simpleTargetKcal).toBe(2500);
      expect(cloned.simpleTargetProtein).toBe(180);
      expect(cloned.simpleTargetCarbs).toBe(300);
      expect(cloned.simpleTargetFats).toBe(65);
      expect(cloned.simpleMeals).toHaveLength(2);
      expect(cloned.simpleMeals[0].id).not.toBe(mockStoredDiet.simpleMeals[0].id);
      expect(mockStoredDiet.id).toBe('diet-101'); // original untouched
    });
  });

  describe('extractMacrosFromPreviousDiet', () => {
    it('should extract correct targets from summary or full plan', () => {
      const summary: PreviousDietSummary = {
        id: 'd-1',
        name: 'Test',
        date: '01/01/2026',
        mode: 'simple',
        modeLabel: 'Simples',
        targetKcal: 2200,
        proteinG: 160,
        carbsG: 250,
        fatsG: 60,
        mealsCount: 0,
      };

      const macros = extractMacrosFromPreviousDiet(summary);
      expect(macros).toEqual({
        targetProtein: 160,
        targetCarbs: 250,
        targetFats: 60,
        targetKcal: 2200,
      });
    });
  });
});
