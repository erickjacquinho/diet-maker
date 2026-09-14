import { describe, expect, it } from 'vitest';
import { createTacoSnapshot } from '@/lib/application/diets/taco-food-adapter';
import { calculateDocumentSnapshotTotals } from '@/lib/application/diets/diet-snapshot-consumers';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { simpleDraftFixture } from '../fixtures/diets';

describe('diet snapshot round-trip', () => {
  it('keeps reference energy and decimal quantities through scaling and reading', () => {
    const snapshot = createTacoSnapshot('taco-3', '64');
    expect(snapshot.referenceNutrients.energyKcal).toBe(createDecimalString('128'));
    expect(snapshot.prescribedNutrients.energyKcal).toBe(createDecimalString('81.92'));
    expect(calculateDocumentSnapshotTotals(simpleDraftFixture.payload, 'variation-simple')).toMatchObject({ energyKcal: '128' });
  });

  it('uses frozen weight and snapshot values, never live patient data', () => {
    const document = structuredClone(simpleDraftFixture.payload);
    document.weightReferenceKg = createDecimalString('64');
    const result = calculateDocumentSnapshotTotals(document, 'variation-simple');
    expect(result.weightReferenceKg).toBe('64');
    expect(result.protein).toBe('2.5');
    expect(result.energyKcal).toBe('128');
  });
});
