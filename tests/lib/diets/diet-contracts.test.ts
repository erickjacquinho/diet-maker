import { describe, expect, it } from 'vitest';
import {
  createDecimalString,
  type ConfirmActiveResult,
  type DietDraft,
  type DietItem,
  type DietPlan,
  type NutritionSnapshot,
  type SaveOutcome,
} from '@/lib/domain/diets/diet-model';

describe('diet domain contracts', () => {
  it('accepts canonical decimal strings and rejects exponent notation', () => {
    expect(createDecimalString('128.00')).toBe('128.00');
    expect(() => createDecimalString('1e2')).toThrow();
    expect(() => createDecimalString('NaN')).toThrow();
  });

  it('keeps the draft payload complete and distinct from confirmed data', () => {
    const snapshot: NutritionSnapshot = {
      sourceType: 'SYSTEM_TACO',
      sourceId: 'taco-1',
      sourceVersion: 'TACO-4.0',
      displayName: 'Arroz cozido',
      description: 'Arroz branco',
      measurementBasis: 'PER_100G',
      foodState: 'COOKED',
      referenceQuantity: createDecimalString('100'),
      referenceUnit: 'g',
      referenceNutrients: {
        protein: createDecimalString('2.5'),
        carbs: createDecimalString('28.1'),
        fat: createDecimalString('0.2'),
        fiber: createDecimalString('1.6'),
        energyKcal: createDecimalString('128'),
      },
      prescribedQuantity: createDecimalString('100'),
      prescribedUnit: 'g',
      prescribedNutrients: {
        protein: createDecimalString('2.5'),
        carbs: createDecimalString('28.1'),
        fat: createDecimalString('0.2'),
        fiber: createDecimalString('1.6'),
        energyKcal: createDecimalString('128'),
      },
      energySource: 'REFERENCE',
      calculationVersion: 'taco-decimal-v1',
      conversionSnapshot: { schemaVersion: 1, conversions: [] },
      compositionSnapshot: { schemaVersion: 1, source: 'TACO' },
    };
    const item: DietItem = { id: 'item-1', position: 0, role: 'PRIMARY', name: 'Arroz cozido', snapshot };
    const draft: DietDraft = {
      draftId: 'draft-1',
      contextKey: 'account-1|patient-1|nova',
      accountId: 'account-1',
      patientId: 'patient-1',
      routeDietId: 'nova',
      payloadSchemaVersion: 1,
      draftRevision: 1,
      state: 'EDITABLE',
      createdAt: '2026-08-30T10:00:00.000Z',
      updatedAt: '2026-08-30T10:00:00.000Z',
      payload: {
        name: 'Plano',
        mode: 'SIMPLE',
        weightReferenceKg: createDecimalString('64'),
        variations: [{
          id: 'variation-1', position: 0, kind: 'SIMPLE', name: 'Diário', inputMode: 'GRAMS', assignedDays: [],
          targets: { protein: createDecimalString('0'), carbs: createDecimalString('0'), fat: createDecimalString('0'), energyKcal: createDecimalString('0') },
          meals: [{ id: 'meal-1', position: 0, name: 'Café', time: '08:00', options: [{ id: 'option-1', position: 0, label: 'Base', countsTowardTotals: true, items: [item] }] }],
        }],
      },
    };
    expect(draft.state).toBe('EDITABLE');
    expect(draft.payload.variations[0].meals[0].options[0].items[0].snapshot).toBe(snapshot);
  });

  it('expresses confirmed aggregates and nominal outcomes', () => {
    const result: ConfirmActiveResult = { status: 'COMMITTED_NEW', planId: 'diet-1', version: 1 };
    const plan: DietPlan = {
      id: 'diet-1', accountId: 'account-1', patientId: 'patient-1', name: 'Plano', mode: 'SIMPLE', status: 'ACTIVE', version: 1,
      weightReferenceKg: createDecimalString('64'), createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z',
      activatedAt: '2026-08-30T10:00:00.000Z', supersededAt: null, variations: [],
    };
    const outcome: SaveOutcome = { status: 'ROLLED_BACK', draftId: 'draft-1', message: 'retry' };
    expect(result.status).toBe('COMMITTED_NEW');
    expect(plan.status).toBe('ACTIVE');
    expect(outcome.status).toBe('ROLLED_BACK');
  });
});
