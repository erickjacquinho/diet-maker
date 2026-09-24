import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { componentAdequationFixtures } from '../fixtures/component-adequation';
import { createProfileSession, navigateWithinSession } from './helpers/profile-session';

const pageTimeout = 120_000;

type Viewport = { width: number; height: number };

const catalogFamilies = [
  {
    name: 'Ações e resumos',
    entries: [
      { id: 'atom-icon-button', label: 'IconButton', layer: 'Atoms' },
      { id: 'molecule-macro-summary', label: 'MacroSummary', layer: 'Molecules' },
      { id: 'molecule-macro-proportion-bar', label: 'MacroProportionBar', layer: 'Molecules' },
    ],
  },
  {
    name: 'Categorias e resultados',
    entries: [
      { id: 'molecule-food-search-category-selector', label: 'FoodSearchCategorySelector', layer: 'Molecules' },
      { id: 'molecule-ready-meal-search-results-list', label: 'ReadyMealSearchResultsList', layer: 'Molecules' },
      { id: 'molecule-recipe-search-results-list', label: 'RecipeSearchResultsList', layer: 'Molecules' },
    ],
  },
  {
    name: 'Ciclos',
    entries: [
      { id: 'organism-diet-mode-switcher', label: 'DietModeSwitcher', layer: 'Organisms' },
      { id: 'organism-carb-cycling-variation-panel', label: 'CarbCyclingVariationPanel', layer: 'Organisms' },
    ],
  },
  {
    name: 'Modais',
    entries: [
      { id: 'organism-food-search-modal', label: 'FoodSearchModal', layer: 'Organisms' },
      { id: 'organism-substitute-food-modal', label: 'SubstituteFoodModal', layer: 'Organisms' },
      { id: 'organism-import-previous-diet-modal', label: 'ImportPreviousDietModal', layer: 'Organisms' },
      { id: 'organism-read-only-diet-modal', label: 'ReadOnlyDietModal', layer: 'Organisms' },
    ],
  },
  {
    name: 'Histórico',
    entries: [
      { id: 'organism-patient-assessments-table', label: 'PatientAssessmentsTable', layer: 'Organisms' },
      { id: 'organism-patient-diets-table', label: 'PatientDietsTable', layer: 'Organisms' },
      { id: 'organism-consultation-history-row', label: 'ConsultationHistoryRow', layer: 'Organisms' },
      { id: 'organism-patient-list-table-row', label: 'PatientListTableRow', layer: 'Organisms' },
    ],
  },
] as const;

async function visit(page: Page, route: string, marker: Locator) {
  const inAppLink = page.locator(`a[href="${route}"]`).first();
  if (await inAppLink.count() || route === '/design-system') {
    await navigateWithinSession(page, route);
  } else {
    await page.goto(route, { waitUntil: 'load', timeout: pageTimeout });
  }
  // O modo de desenvolvimento mantém conexões do HMR abertas; a espera é
  // limitada e o marcador funcional continua sendo a condição de prontidão.
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  await expect(marker).toBeVisible({ timeout: pageTimeout });
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true,
  });
}

async function createSyntheticPatient(page: Page): Promise<{ name: string; profileHref: string }> {
  const name = 'Paciente synthetic adequacao';
  const createTrigger = page.getByRole('button', { name: /Cadastrar Primeiro Paciente|Novo paciente/ }).first();
  await expect(createTrigger).toBeVisible({ timeout: pageTimeout });
  await createTrigger.click();

  const dialog = page.getByRole('dialog', { name: 'Cadastrar Novo Paciente' });
  await expect(dialog).toBeVisible({ timeout: pageTimeout });
  await dialog.getByLabel('Nome Completo').fill(name);
  await dialog.getByLabel('WhatsApp').fill('11999990000');
  await dialog.getByRole('textbox', { name: 'Data de nascimento' }).fill('01011990');
  await dialog.getByRole('combobox', { name: 'Gênero' }).click();
  await page.getByRole('option', { name: 'Masculino', exact: true }).click();
  await dialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect(dialog).toBeHidden({ timeout: pageTimeout });

  const profileLink = page.getByRole('link', { name: `Ver perfil de ${name}` });
  await expect(profileLink).toBeVisible({ timeout: pageTimeout });
  const profileHref = await profileLink.getAttribute('href');
  expect(profileHref).toBeTruthy();

  return { name, profileHref: profileHref! };
}

async function goToNewDiet(page: Page, profileHref: string) {
  await visit(page, profileHref, page.getByRole('heading', { level: 1, name: 'Perfil do paciente' }));
  const newDiet = page.getByRole('link', { name: 'Nova Dieta' });
  await expect(newDiet).toBeVisible({ timeout: pageTimeout });
  const href = await newDiet.getAttribute('href');
  expect(href).toBeTruthy();
  await visit(page, href!, page.getByRole('main', { name: 'Elaboração de Dieta' }));
}

test('valida o catálogo das famílias e as condições desktop do design system', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await createProfileSession(page, 'Adequação design system');

  for (const viewport of [{ width: 1024, height: 900 }, { width: 1440, height: 900 } satisfies Viewport]) {
    await page.setViewportSize(viewport);
    await visit(page, '/design-system', page.getByRole('heading', { name: 'Design System canônico' }));

    await expect(page.getByText('Estados', { exact: true })).toBeVisible();
    await expect(page.getByText('Desktop ≥ 1024px', { exact: false })).toBeVisible();

    const search = page.getByRole('textbox', { name: 'Buscar no catálogo de componentes' });
    await expect(search).toBeVisible();

    for (const family of catalogFamilies) {
      for (const entry of family.entries) {
        await search.fill(entry.id);
        const code = page.getByText(entry.id, { exact: true });
        await expect(code, `${family.name}: ${entry.id}`).toBeVisible({ timeout: pageTimeout });
        const card = code.locator('xpath=../..');
        await expect(card).toContainText(entry.label);
        await expect(card).toContainText(entry.layer);
      }
    }

    await search.fill('');
    await capture(page, testInfo, `design-system-${viewport.width}`);

    if (viewport.width === 1024) {
      await page.evaluate(() => {
        document.documentElement.style.zoom = '2';
      });
      await expect(page.getByRole('heading', { name: 'Design System canônico' })).toBeVisible();
      await capture(page, testInfo, 'design-system-1024-zoom-200');
      await page.evaluate(() => {
        document.documentElement.style.zoom = '';
      });
    }
  }
});

test('preserva semântica, foco e estados vazios no histórico de pacientes', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await createProfileSession(page, 'Adequação histórico');
  await visit(page, '/pacientes', page.getByRole('heading', { level: 1, name: 'Pacientes' }));

  await expect(page.getByText('Nenhum paciente cadastrado', { exact: true })).toBeVisible({ timeout: pageTimeout });
  await capture(page, testInfo, 'patients-empty-1024');

  const { name, profileHref } = await createSyntheticPatient(page);
  const patientRow = page.getByRole('row', { name: `Abrir perfil de ${name}` });
  await expect(patientRow).toBeVisible({ timeout: pageTimeout });
  expect(await patientRow.getAttribute('role')).toBeNull();

  const profileLink = page.getByRole('link', { name: `Ver perfil de ${name}` });
  await profileLink.focus();
  await expect(profileLink).toBeFocused();
  await capture(page, testInfo, 'patients-filled-1024');

  await visit(page, profileHref, page.getByRole('heading', { level: 1, name: 'Perfil do paciente' }));
  await expect(page.getByText('Nenhuma prescrição dietética registrada para este paciente até o momento.', { exact: true })).toBeVisible();
  await expect(page.getByText('Nenhuma avaliação física registrada para este paciente até o momento.', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Histórico de prescrições dietéticas e planos alimentares' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Histórico de avaliações físicas' })).toBeVisible();
  await capture(page, testInfo, 'patient-profile-empty-history-1024');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil do paciente' })).toBeVisible();
  await capture(page, testInfo, 'patient-profile-1440-zoom-200');
});

test('valida ciclos, busca, substituição, somente leitura e importação', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await createProfileSession(page, 'Adequação dietas');
  await visit(page, '/pacientes', page.getByRole('heading', { level: 1, name: 'Pacientes' }));

  const { name, profileHref } = await createSyntheticPatient(page);
  await goToNewDiet(page, profileHref);

  const simpleMode = page.getByRole('button', { name: 'Dieta Simples', exact: true });
  const cycleMode = page.getByRole('button', { name: 'Ciclo de Carboidratos', exact: true });
  await expect(simpleMode).toBeVisible();
  await expect(cycleMode).toBeVisible();

  await cycleMode.click();
  const cyclePanel = page.getByTestId('carb-cycling-variation-panel');
  await expect(cyclePanel).toBeVisible();
  for (const action of ['Configurar Ciclo', 'Copiar Refeições', 'Adicionar Dia']) {
    await expect(cyclePanel.getByRole('button', { name: action, exact: true })).toBeVisible();
  }
  const variationCards = cyclePanel.locator('[role="button"][aria-pressed]');
  await expect(variationCards).toHaveCount(3);
  await variationCards.nth(1).focus();
  await variationCards.nth(1).press('Enter');
  await expect(variationCards.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await simpleMode.click();
  await expect(cyclePanel).toBeHidden();

  const importButton = page.getByRole('button', { name: 'Puxar Metas Anteriores', exact: true });
  await expect(importButton).toBeDisabled();

  await page.getByRole('button', { name: 'Nova Refeição', exact: true }).click();
  const addFoodButton = page.getByRole('button', { name: 'Adicionar Alimento', exact: true });
  await expect(addFoodButton).toBeVisible({ timeout: pageTimeout });
  await addFoodButton.click();

  const foodDialog = page.getByRole('dialog', { name: /Adicionar à Refeição/ });
  await expect(foodDialog).toBeVisible({ timeout: pageTimeout });
  const foodSearch = foodDialog.getByPlaceholder('Buscar por nome do alimento...');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('food-search-input');
  await foodSearch.fill(componentAdequationFixtures.labels.long);
  await expect(foodDialog.getByText(/Nenhum resultado para/)).toBeVisible({ timeout: pageTimeout });
  await capture(page, testInfo, 'food-search-empty-long-label-1440');

  await page.keyboard.press('Escape');
  await expect(foodDialog).toBeHidden({ timeout: pageTimeout });
  await expect(addFoodButton).toBeFocused();

  await addFoodButton.click();
  await expect(foodDialog).toBeVisible({ timeout: pageTimeout });
  await foodDialog.getByPlaceholder('Buscar por nome do alimento...').fill(componentAdequationFixtures.search.foods[0]);
  const foodRow = foodDialog.getByRole('row').filter({ hasText: /Feijão[,\s]+carioca/i }).first();
  await expect(foodRow).toBeVisible({ timeout: pageTimeout });
  await foodRow.getByRole('checkbox').click();
  const addSelectedButton = foodDialog.getByRole('button', { name: /Adicionar \(1\)/ });
  await expect(addSelectedButton).toBeEnabled();
  await addSelectedButton.click();
  await expect(foodDialog).toBeHidden({ timeout: pageTimeout });

  const mealRow = page.getByRole('row').filter({ hasText: /Feijão[,\s]+carioca/i }).first();
  await expect(mealRow).toBeVisible({ timeout: pageTimeout });
  await mealRow.hover();
  const substituteButton = mealRow.getByRole('button', { name: /Substituir Feijão/i });
  await expect(substituteButton).toBeVisible();
  await substituteButton.click();

  const substituteDialog = page.getByRole('dialog', { name: /Substituir Alimento em/ });
  await expect(substituteDialog).toBeVisible({ timeout: pageTimeout });
  await expect(substituteDialog.getByText('100g preservados', { exact: true })).toBeVisible();
  await expect(substituteDialog.getByRole('button', { name: 'Substituir Alimento', exact: true })).toBeDisabled();
  await substituteDialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(substituteDialog).toBeHidden({ timeout: pageTimeout });
  await capture(page, testInfo, 'diet-search-substitution-1440');

  await page.getByRole('button', { name: 'Salvar Prescrição', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil do paciente' })).toBeVisible({ timeout: pageTimeout });
  await expect(page.getByText('1 plano', { exact: true })).toBeVisible({ timeout: pageTimeout });

  const dietRow = page.getByRole('row').filter({ hasText: /Simples/ }).first();
  await expect(dietRow).toBeVisible({ timeout: pageTimeout });
  await dietRow.hover();
  const readOnlyTrigger = dietRow.getByRole('button', { name: /Ver cardápio completo da dieta/ });
  await expect(readOnlyTrigger).toBeVisible();
  await readOnlyTrigger.click();

  const readOnlyDialog = page.getByRole('dialog').filter({ hasText: 'Somente leitura' });
  await expect(readOnlyDialog).toBeVisible({ timeout: pageTimeout });
  const prescriptionRegion = page.getByRole('region', { name: 'Conteúdo da prescrição' });
  await expect(prescriptionRegion).toBeVisible();
  await expect.poll(() => prescriptionRegion.evaluate((element) => getComputedStyle(element).overflowY)).toBe('auto');
  await expect(readOnlyDialog.getByRole('button', { name: 'Fechar Visualização', exact: true })).toBeVisible();
  await capture(page, testInfo, 'read-only-diet-modal-1440');
  await page.keyboard.press('Escape');
  await expect(readOnlyDialog).toBeHidden({ timeout: pageTimeout });

  const newDietLink = page.getByRole('link', { name: 'Nova Dieta' });
  const newDietHref = await newDietLink.getAttribute('href');
  expect(newDietHref).toBeTruthy();
  await visit(page, newDietHref!, page.getByRole('main', { name: 'Elaboração de Dieta' }));

  const enabledImportButton = page.getByRole('button', { name: 'Puxar Metas Anteriores', exact: true });
  await expect(enabledImportButton).toBeEnabled({ timeout: pageTimeout });
  await enabledImportButton.focus();
  await enabledImportButton.press('Enter');
  const importDialog = page.getByRole('dialog').filter({ hasText: 'Importar Dieta Anterior' });
  await expect(importDialog).toBeVisible({ timeout: pageTimeout });
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('previous-diet-search-input');

  const importSearch = importDialog.getByPlaceholder('Buscar por nome da dieta ou data...');
  await importSearch.fill(componentAdequationFixtures.labels.long);
  await expect(importDialog.getByText('Nenhuma dieta anterior encontrada', { exact: true })).toBeVisible();
  await expect(importDialog.getByText(/Nenhum resultado para/)).toBeVisible();
  await capture(page, testInfo, 'import-previous-diet-empty-long-label-1440');

  await importSearch.fill('');
  const previousDietRow = importDialog.getByRole('row').filter({ hasText: /Simples/ }).first();
  await expect(previousDietRow).toBeVisible({ timeout: pageTimeout });
  await previousDietRow.getByRole('checkbox').click();
  await expect(importDialog.getByRole('button', { name: 'Puxar apenas os macros', exact: true })).toBeEnabled();
  await expect(importDialog.getByRole('button', { name: 'Puxar todas as refeições', exact: true })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(importDialog).toBeHidden({ timeout: pageTimeout });

  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
});
