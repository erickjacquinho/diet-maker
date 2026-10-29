import { type Page } from '@playwright/test';
import { expect, test } from './fixtures/library-fixture';
import { decryptBrowserSave, navigateWithinSession, openRememberedSave, readPrimarySave } from './helpers/profile-session';

const legacyKeys = ['nutridiet_custom_foods', 'nutridiet_recipes', 'nutridiet_ready_meals'];

async function expectLegacyLibraryEmpty(page: Page) {
  const values = await page.evaluate((keys) => keys.map((key) => window.localStorage.getItem(key)), legacyKeys);
  expect(values).toEqual([null, null, null]);
}

test('mantém as superfícies da biblioteca sem as chaves legadas', async ({ page }) => {
  for (const route of ['/alimentos', '/receitas', '/refeicoes']) {
    await navigateWithinSession(page, route);
    await expect(page.locator('body')).toBeVisible();
    await expectLegacyLibraryEmpty(page);
  }
});

test('recupera alimento e macros do checkpoint após reload e abertura autorizada do mesmo save', async ({ page }) => {
  await navigateWithinSession(page, '/alimentos');
  await expect(page.getByRole('heading', { name: 'Base de Alimentos TACO' })).toBeVisible({ timeout: 120_000 });

  await page.getByRole('button', { name: 'Novo Alimento Customizado' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Nome do Alimento / Suplemento').fill('Whey local de browser');
  await dialog.getByLabel('Qtd. Porção').fill('30');
  for (const [label, value] of [['Prot (g)', '24'], ['Carb (g)', '3'], ['Gord (g)', '2']]) {
    await dialog.getByText(label, { exact: true }).locator('..').getByRole('spinbutton').fill(value);
  }
  await dialog.getByRole('button', { name: /Salvar Alimento/ }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Customizados' }).click();
  await expect(page.getByText('Whey local de browser')).toBeVisible();
  await expectLegacyLibraryEmpty(page);

  // The fixture uses real OPFS bytes with controlled file pickers, not an external file picker.
  const savedFood = async () => {
    const envelope = await decryptBrowserSave(page, (await readPrimarySave(page)).content);
    const food = envelope.foodCatalogItems.find((item) => item.name === 'Whey local de browser');
    return food && {
      name: food.name,
      servingReference: Number(food.servingReference),
      protein: Number(food.referenceProtein),
      carbs: Number(food.referenceCarbs),
      fat: Number(food.referenceFat),
    };
  };
  const expected = { name: 'Whey local de browser', servingReference: 30, protein: 24, carbs: 3, fat: 2 };
  await page.keyboard.press('Control+s');
  await expect.poll(savedFood).toEqual(expected);

  await page.reload({ waitUntil: 'load' });
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 120_000 });
  await openRememberedSave(page);
  await navigateWithinSession(page, '/alimentos');
  await page.getByRole('button', { name: 'Customizados' }).click();
  await expect(page.getByText(expected.name)).toBeVisible();
  await expect.poll(savedFood).toEqual(expected);
  await expectLegacyLibraryEmpty(page);
});
