import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectLegacyDietInventory } from '../../architecture/diet-legacy-inventory';

const sourceRoot = path.resolve(process.cwd(), 'src');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(sourceRoot, relativePath), 'utf8');
}

describe('canonical diet cutover', () => {
  it('has no legacy diet storage consumers, dual writes, or embedded history', () => {
    expect(collectLegacyDietInventory()).toEqual([]);

    const activeConsumers = [
      'hooks/useDietBuilderPage.ts',
      'hooks/useDietPresets.ts',
      'app/pacientes/[id]/dieta/[dietaId]/page.tsx',
      'app/pacientes/[id]/dieta/[dietaId]/ciclo/page.tsx',
      'app/pacientes/[id]/consulta/[date]/page.tsx',
      'lib/legacyClinicalStore.ts',
      'lib/consultationStorageUtils.ts',
      'lib/patientsStoreTypes.ts',
    ];
    const forbidden = /localStorage|sessionStorage|nutridiet_(?:diets|cycle_configured)_|saveDietToStorage|getDietFromStorage|getPatientDietsFromStorage|deletePatientDietFromStorage|dietHistory\s*[:.]|from ['"].*dietStore|from ['"].*dietDuplication/;

    expect(activeConsumers.filter((file) => forbidden.test(read(file)))).toEqual([]);
  });

  it('keeps the food picker limited to TACO and the consultation route read-only for diet data', () => {
    expect(read('components/molecules/FoodSearchModal.tsx')).not.toMatch(/readyMealsStore|recipesStore|ReadyMealSearchResultsList|RecipeSearchResultsList/);

    const consultationPage = read('app/pacientes/[id]/consulta/[date]/page.tsx');
    expect(consultationPage).not.toMatch(/ConsultationDietCard|consultation\.diet|Abrir no Construtor de Dietas/);
  });

  it('does not expose destructive diet APIs from the patient model', () => {
    expect(read('lib/patientsStoreTypes.ts')).not.toMatch(/dietHistory|interface StoredDietRecord|PatientRecordHistory/);
    expect(read('lib/dietStore.ts')).not.toMatch(/saveDietToStorage|getDietFromStorage|DIETS_KEY_PREFIX|localStorage|sessionStorage/);
  });
});
