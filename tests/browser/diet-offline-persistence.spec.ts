import { expect, test } from '@playwright/test';
import { createProfileSession } from './helpers/profile-session';

test.describe.configure({ mode: 'serial' });

test('não persiste profile ou drafts no host após reload e mantém a nova aba no onboarding', async ({ browser, baseURL }) => {
  test.setTimeout(600_000);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const first = await context.newPage();

  await createProfileSession(first, 'Sessão offline');
  await expect(first.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible({ timeout: 120_000 });

  await first.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(first).toHaveURL(/\/home$/, { timeout: 120_000 });
  await expect(first.getByRole('button', { name: 'Criar perfil' })).toBeVisible({ timeout: 120_000 });

  const hostDatabases = await first.evaluate(async () => {
    if (typeof indexedDB.databases !== 'function') return [];
    return (await indexedDB.databases())
      .map(({ name }) => name)
      .filter((name): name is string => typeof name === 'string' && /nutridiet|diet-browser-journey/i.test(name));
  });
  expect(hostDatabases).toEqual([]);

  const second = await context.newPage();
  await second.goto(`${baseURL ?? 'http://127.0.0.1:3000'}/pacientes`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(second).toHaveURL(/\/home$/, { timeout: 120_000 });
  await expect(second.getByRole('button', { name: 'Criar perfil' })).toBeVisible({ timeout: 120_000 });

  await context.setOffline(true);
  await expect(second.evaluate(() => navigator.onLine)).resolves.toBe(false);
  await context.setOffline(false);
  await context.close();
});
