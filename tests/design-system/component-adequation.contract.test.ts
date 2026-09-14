import { describe, expect, it } from 'vitest';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { verifyComponentCatalog } from '../../scripts/verify-design-system-components.mjs';

const scopedSources = [
  ['IconButton', 'src/components/atoms/IconButton.tsx'],
  ['MacroProportionBar', 'src/components/molecules/MacroProportionBar.tsx'],
  ['MacroSummary', 'src/components/molecules/MacroSummary.tsx'],
  ['CarbCyclingVariationPanel', 'src/components/organisms/diet/CarbCyclingVariationPanel.tsx'],
  ['DietModeSwitcher', 'src/components/organisms/diet/DietModeSwitcher.tsx'],
  ['FoodSearchCategorySelector', 'src/components/molecules/food-search/FoodSearchCategorySelector.tsx'],
  ['ReadyMealSearchResultsList', 'src/components/molecules/food-search/ReadyMealSearchResultsList.tsx'],
  ['RecipeSearchResultsList', 'src/components/molecules/food-search/RecipeSearchResultsList.tsx'],
  ['FoodSearchModal', 'src/components/organisms/foods/FoodSearchModal.tsx'],
  ['SubstituteFoodModal', 'src/components/organisms/foods/SubstituteFoodModal.tsx'],
  ['ImportPreviousDietModal', 'src/components/organisms/diets/ImportPreviousDietModal.tsx'],
  ['ReadOnlyDietModal', 'src/components/organisms/diets/ReadOnlyDietModal.tsx'],
  ['PatientAssessmentsTable', 'src/components/organisms/patient/PatientAssessmentsTable.tsx'],
  ['PatientDietsTable', 'src/components/organisms/patient/PatientDietsTable.tsx'],
  ['ConsultationHistoryRow', 'src/components/organisms/patient/ConsultationHistoryRow.tsx'],
  ['PatientListTableRow', 'src/components/organisms/patient/PatientListTableRow.tsx'],
] as const;

describe('component adequation catalog contract', () => {
  it('registers every scoped final source and its public family name', async () => {
    const registry = JSON.parse(
      await readFile('design-system/components/registry.json', 'utf8'),
    ) as {
      components: Array<{
        name: string;
        lifecycle: string;
        sourceFiles: Array<{ path: string }>;
      }>;
    };

    for (const [name, source] of scopedSources) {
      const entry = registry.components.find((component) =>
        component.sourceFiles.some(({ path: sourcePath }) => sourcePath === source),
      ) ?? registry.components.find((component) => component.name === name);
      expect(entry, `${name} -> ${source}`).toBeDefined();
      expect(entry?.name, source).toContain(name.replace('Row', ''));
      if (!entry?.sourceFiles.some(({ path: sourcePath }) => sourcePath === source)) {
        expect(entry?.lifecycle, name).toBe('migration-required');
      }
    }
  });

  it('accepts the reconciled catalog through the public verifier', async () => {
    await expect(verifyComponentCatalog(process.cwd(), { mode: 'strict' })).resolves.toEqual([]);
  });

  it('detects a broken registry fixture without weakening the verifier', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'nutridiet-adequation-'));
    try {
      await cp(
        path.resolve('tests/fixtures/design-system-catalog/registry/valid'),
        root,
        { recursive: true },
      );
      const registryPath = path.join(root, 'design-system/components/registry.json');
      await writeFile(registryPath, JSON.stringify({ components: [] }));
      const findings = await verifyComponentCatalog(root, { mode: 'inventory' });
      expect(findings.map((finding: { code: string }) => finding.code)).toContain('REG001');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
