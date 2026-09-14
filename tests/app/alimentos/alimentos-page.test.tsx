import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('alimentos page canonical boundary', () => {
  it('uses the relational application hook and keeps legacy library keys out of the page', () => {
    const source = readFileSync('src/app/alimentos/page.tsx', 'utf8');
    expect(source).toContain('@/hooks/useFoodSearchPage');
    expect(source).not.toMatch(/nutridiet_(?:custom_foods|recipes|ready_meals)|tacoStore|recipesStore|readyMealsStore/);
  });
});
