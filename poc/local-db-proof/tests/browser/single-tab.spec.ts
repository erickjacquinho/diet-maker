import { expect, test } from '@playwright/test';

test('blocks a second tab before opening the database and releases after the first closes', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const firstPage = await context.newPage();
  await firstPage.goto(baseURL ?? 'http://127.0.0.1:4173');
  await firstPage.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(firstPage.locator('#status')).toHaveAttribute('data-status', 'pass', { timeout: 60_000 });

  const secondPage = await context.newPage();
  await secondPage.goto(baseURL ?? 'http://127.0.0.1:4173');
  await secondPage.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(secondPage.locator('#status')).toHaveAttribute('data-status', 'fail', { timeout: 60_000 });
  await expect(secondPage.locator('#status')).toContainText('Acesso bloqueado');
  await expect(secondPage.locator('#report')).toContainText('LOCK_UNAVAILABLE');

  await firstPage.close();
  await secondPage.reload();
  await secondPage.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(secondPage.locator('#status')).toHaveAttribute('data-status', 'pass', { timeout: 60_000 });

  await context.close();
});
