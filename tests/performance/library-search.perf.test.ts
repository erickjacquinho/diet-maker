import { describe, expect, it } from 'vitest';
import { listTacoFoodItems, searchTacoFoods, toFoodItem } from '@/lib/library-ui-adapter';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { customFoodInput } from '../fixtures/library-fixtures';

describe('reusable library search budget', () => {
  it('keeps representative TACO and custom searches below 100ms after initialization', () => {
    const foods = [...listTacoFoodItems(), toFoodItem({
      id: 'custom-search',
      accountId: 'local-account',
      sourceType: 'ACCOUNT_CUSTOM' as const,
      ...customFoodInput,
      servingReference: { quantity: createDecimalString('170'), unit: 'g' as const },
      referenceNutrients: {
        protein: createDecimalString('10.25'),
        carbs: createDecimalString('8.40'),
        fat: createDecimalString('2.10'),
        fiber: createDecimalString('0.00'),
        energyKcal: createDecimalString('91'),
      },
      status: 'ACTIVE',
      version: 1,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
      archivedAt: null,
      energySource: 'CALCULATED_449',
      calculationVersion: 'library-decimal-v1',
    })];

    // Warm the static index and measure only the steady-state search path.
    expect(searchTacoFoods('arroz', foods).length).toBeGreaterThan(0);
    const timings = ['arroz', 'custom'].map((query) => {
      const startedAt = performance.now();
      expect(searchTacoFoods(query, foods).length).toBeGreaterThan(0);
      return performance.now() - startedAt;
    });

    expect(Math.max(...timings)).toBeLessThan(100);
  });
});
