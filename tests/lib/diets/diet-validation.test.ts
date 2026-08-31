import { describe, expect, it } from 'vitest';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import { validateDietForConfirmation } from '@/lib/domain/diets/diet-validation';
import type { DietEditableDocument } from '@/lib/domain/diets/diet-model';
import { simpleDraftFixture, mealWithAlternativeAndSubstituteFixture } from '../../fixtures/diets';

describe('diet confirmation validation', () => {
  it('requires one meal with a counted option and a valid primary item', () => {
    const empty = structuredClone(simpleDraftFixture.payload) as DietEditableDocument;
    expect(() => validateDietForConfirmation({ ...empty, variations: [{ ...empty.variations[0], meals: [] }] })).toThrowError(
      expect.objectContaining({ code: 'INVALID_MINIMUM' }),
    );

    const noPrimary = structuredClone(simpleDraftFixture.payload) as DietEditableDocument;
    noPrimary.variations[0].meals[0].options[0].items[0].role = 'SUBSTITUTE';
    expect(() => validateDietForConfirmation(noPrimary)).toThrowError(DietDomainError);

    expect(() => validateDietForConfirmation(simpleDraftFixture.payload)).not.toThrow();
  });

  it('validates cycle globally and preserves alternative/substitute relationships', () => {
    const cycle = structuredClone(simpleDraftFixture.payload) as DietEditableDocument;
    cycle.mode = 'CARB_CYCLING';
    cycle.variations[0].meals[0].options = [mealWithAlternativeAndSubstituteFixture.options[0], mealWithAlternativeAndSubstituteFixture.options[1]];
    expect(() => validateDietForConfirmation(cycle)).not.toThrow();

    cycle.variations[0].meals[0].options[1].items[0].parentItemId = 'missing';
    expect(() => validateDietForConfirmation(cycle)).toThrowError(expect.objectContaining({ code: 'INVALID_DIET' }));
  });

  it('rejects malformed quantities, assignments and duplicate identities', () => {
    const invalid = structuredClone(simpleDraftFixture.payload) as DietEditableDocument;
    invalid.variations[0].meals[0].options[0].items[0].snapshot.prescribedQuantity = '0' as never;
    expect(() => validateDietForConfirmation(invalid)).toThrowError(expect.objectContaining({ code: 'INVALID_SNAPSHOT' }));
  });
});
