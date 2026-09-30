// Run from repo root: node refs/UI/dieta-exportada/verify.cjs
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
    await page.goto(pathToFileURL(path.join(__dirname, 'dieta-simples.html')).href);
    await page.getByRole('button', { name: 'Exportar dieta', exact: true }).click();
    await page.getByRole('menuitem').click();
    assert(await page.getByRole('dialog').isVisible());
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Tab');
      assert(await page.evaluate(() => Boolean(document.activeElement.closest('[role="dialog"]'))));
    }
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert(await page.getByRole('button', { name: 'Exportar dieta', exact: true }).evaluate(element => element === document.activeElement));
    await page.getByRole('button', { name: 'Exportar dieta', exact: true }).click();
    await page.getByRole('menuitem').click();
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Abrir página inteligente' }).click();
    const exported = await popup;
    await exported.waitForLoadState();
    assert.equal(await exported.getByRole('button', { name: 'Exportar dieta', exact: true }).count(), 0);
    const tabs = exported.getByRole('tablist', { name: 'Opções de Café da manhã' });
    await tabs.getByRole('tab', { name: 'Principal' }).press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'Alternativa 1' })).toHaveAttribute('aria-selected', 'true');
    assert(await exported.getByRole('tabpanel').filter({ hasText: 'Aveia em flocos' }).isVisible());
    await expect(exported.locator('time[datetime="2026-09-30"]')).toHaveText('30/09/2026');
    const summary = exported.getByRole('table', { name: 'Resumo nutricional das opções principais' });
    await expect(summary.getByRole('columnheader')).toHaveCount(2);
    await expect(summary.getByRole('columnheader', { name: 'Macros', exact: true })).toBeVisible();
    await expect(summary.getByTestId('macro-summary')).toHaveCount(5);
    const foodRow = exported.getByRole('row').filter({ hasText: 'Aveia em flocos' });
    await foodRow.getByRole('cell').filter({ hasText: 'Aveia em flocos' }).click();
    await expect(foodRow.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await foodRow.getByRole('cell').last().click();
    await expect(foodRow.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    await foodRow.getByRole('checkbox').click();
    await expect(foodRow.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await foodRow.press('Space');
    await expect(foodRow.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    await foodRow.press('Enter');
    await expect(foodRow.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await tabs.getByRole('tab', { name: 'Principal' }).click();
    await tabs.getByRole('tab', { name: 'Alternativa 1' }).click();
    await expect(exported.getByRole('row').filter({ hasText: 'Aveia em flocos' }).getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    for (const width of [1024, 1440]) {
      await exported.setViewportSize({ width, height: 900 });
      assert(await exported.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await exported.screenshot({ path: path.join(__dirname, 'pagina-' + width + '.png'), fullPage: true });
    }
    console.log('PASS: menu > modal > página; abas por teclado; desktop 1024/1440.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
