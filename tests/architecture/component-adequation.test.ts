import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const finalOrganismSources = [
  'src/components/organisms/diet/CarbCyclingVariationPanel.tsx',
  'src/components/organisms/diet/DietModeSwitcher.tsx',
  'src/components/organisms/foods/FoodSearchModal.tsx',
  'src/components/organisms/foods/SubstituteFoodModal.tsx',
  'src/components/organisms/diets/ImportPreviousDietModal.tsx',
  'src/components/organisms/diets/ReadOnlyDietModal.tsx',
];

const moleculeSources = [
  'src/components/molecules/CarbCyclingVariationPanel.tsx',
  'src/components/molecules/DietModeSwitcher.tsx',
  'src/components/molecules/FoodSearchModal.tsx',
  'src/components/molecules/SubstituteFoodModal.tsx',
];

const legacyCoordinatorSources = [
  ...moleculeSources,
  'src/components/molecules/ImportPreviousDietModal.tsx',
  'src/components/molecules/ReadOnlyDietModal.tsx',
];

describe('component adequation architecture seam', () => {
  it('has a concrete organism owner for every coordinator target', () => {
    for (const source of finalOrganismSources) {
      expect(existsSync(source), source).toBe(true);
    }
  });

  it('does not create an ascending molecule-to-organism dependency', () => {
    for (const source of moleculeSources) {
      if (!existsSync(source)) continue;
      expect(readFileSync(source, 'utf8'), source).not.toMatch(
        /from ['"][^'"]*\/organisms(?:\/|['"])/,
      );
    }
  });

  it('does not retain migrated coordinator implementations in molecules', () => {
    for (const source of legacyCoordinatorSources) {
      expect(existsSync(source), source).toBe(false);
    }
  });
});
