import { describe, expect, it } from 'vitest';
import { validateReadyMealInput } from '@/lib/domain/library/library-validation';

describe('ready meal domain', () => {
  it('accepts food and recipe items with mutually exclusive quantity forms', () => {
    expect(() => validateReadyMealInput({
      name: 'Refeição',
      items: [
        { sourceType: 'FOOD', sourceId: 'taco-1', quantity: '100', unit: 'g' },
        { sourceType: 'RECIPE', sourceId: 'recipe-a', recipePortions: '1.5' },
      ],
    })).not.toThrow();
  });
});
