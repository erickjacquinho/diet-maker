import { describe, expect, it } from 'vitest';
import { inventoryByCategory } from './diet-legacy-inventory';

describe('diet legacy inventory', () => {
  it('finds no active legacy diet consumer or persistence key after cutover', () => {
    const inventory = inventoryByCategory();

    expect(inventory).toEqual(new Map());
  });
});
