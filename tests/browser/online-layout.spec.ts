import { expect, test } from '@playwright/test';

test.setTimeout(300_000);

test('public account pages fit desktop widths and 200 percent zoom with labelled keyboard controls', async ({ page }) => {
  for (const width of [1024, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/login', '/criar-conta', '/recuperar-senha', '/redefinir-senha']) {
      await page.goto(route);
      await expect(page.getByRole('main')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: test.info().outputPath(`${width}-${route.replaceAll('/', '') || 'landing'}.png`), fullPage: true });
    }
  }
  await page.goto('/criar-conta');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('registration-zoom-200.png'), fullPage: true });
  await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Senha', { exact: true })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('E-mail', { exact: true })).toBeFocused();
});
