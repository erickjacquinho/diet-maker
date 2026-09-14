import { type Page } from '@playwright/test';
import { expect, test } from './fixtures/library-fixture';
import { navigateWithinSession } from './helpers/profile-session';

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

test('cria e encontra um alimento customizado na sessão, mas reload retorna ao onboarding', async ({ page }) => {
  await navigateWithinSession(page, '/alimentos');
  await expect(page.getByRole('heading', { name: 'Base de Alimentos TACO' })).toBeVisible({ timeout: 120_000 });

  await page.getByRole('button', { name: 'Novo Alimento Customizado' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Nome do Alimento / Suplemento').fill('Whey local de browser');
  await dialog.getByLabel('Qtd. Porção').fill('30');
  const macroInputs = dialog.locator('input[type="number"]');
  await macroInputs.nth(1).fill('24');
  await macroInputs.nth(2).fill('3');
  await macroInputs.nth(3).fill('2');
  await dialog.getByRole('button', { name: /Salvar Alimento/ }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Customizados' }).click();
  await expect(page.getByText('Whey local de browser')).toBeVisible();
  await expectLegacyLibraryEmpty(page);

  await page.reload({ waitUntil: 'load' });
  await expect(page).toHaveURL(/\/home$/, { timeout: 120_000 });
  await expect(page.getByRole('button', { name: 'Criar perfil' })).toBeVisible({ timeout: 120_000 });
});
