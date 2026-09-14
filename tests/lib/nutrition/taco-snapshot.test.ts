import { describe, expect, it } from 'vitest';
import { TACO_DATASET_MANIFEST } from '@/data/taco-dataset-manifest';
import { createTacoSnapshot, listTacoFoods, searchTaco } from '@/lib/application/diets/taco-food-adapter';

describe('TACO dataset and snapshots', () => {
  it('publishes the bundled dataset identity and expected record count', () => {
    expect(TACO_DATASET_MANIFEST).toMatchObject({ sourceType: 'SYSTEM_TACO', version: 'TACO-4.0', recordCount: 597 });
    expect(listTacoFoods()).toHaveLength(597);
    expect(searchTaco('arroz tipo 1 cozido').some((food) => food.id === 'taco-3')).toBe(true);
  });

  it('creates an autonomous snapshot with original preparation and scaled nutrients', () => {
    const snapshot = createTacoSnapshot('taco-3', '50');

    expect(snapshot.sourceType).toBe('SYSTEM_TACO');
    expect(snapshot.sourceVersion).toBe('TACO-4.0');
    expect(snapshot.foodState).toBe('COOKED');
    expect(snapshot.compositionSnapshot).toMatchObject({ originalPreparation: 'Cozido', normalizedPreparation: 'COOKED' });
    expect(snapshot.referenceQuantity).toBe('100');
    expect(snapshot.prescribedQuantity).toBe('50');
    expect(snapshot.prescribedNutrients).toMatchObject({ protein: '1.25', carbs: '14.05', fat: '0.1', fiber: '0.8', energyKcal: '64' });
    expect(snapshot.conversionSnapshot).toMatchObject({ schemaVersion: 1 });
  });

  it('does not expose custom foods or future sources through the adapter', () => {
    expect(listTacoFoods().every((food) => food.sourceType === 'SYSTEM_TACO')).toBe(true);
    expect(() => createTacoSnapshot('custom-1', '100')).toThrow();
  });
});
