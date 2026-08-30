import { expect, test } from '@playwright/test';

test('reports unprepared resources and operates locally after preparation when offline', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');

  await page.getByRole('button', { name: 'Executar offline' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-status', 'fail');
  await expect(page.locator('#status')).toContainText('OFFLINE_RESOURCE_NOT_READY');

  await page.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-status', 'pass', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Preparar recursos offline' }).click();
  await expect(page.locator('#status')).toContainText('Recursos locais preparados');

  await context.setOffline(true);
  await page.getByRole('button', { name: 'Executar offline' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-status', 'pass', { timeout: 60_000 });
  await expect(page.locator('#status')).toContainText('Operações offline aprovadas');
  await expect(page.locator('#report')).toContainText('US4/offline-after-preparation');

  await context.close();
});
