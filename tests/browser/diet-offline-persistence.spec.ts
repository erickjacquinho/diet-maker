import { expect, test } from '@playwright/test';
import { createProfileSession, openRememberedSave, openSaveSettings } from './helpers/profile-session';

test.describe.configure({ mode: 'serial' });
test.use({ trace: 'off' });

test('mantém o workspace local IndexedDB após reload e reabre em uma nova aba exclusiva', async ({ browser, baseURL }) => {
  test.setTimeout(600_000);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const first = await context.newPage();

  await test.step('create an online authorized save', () => createProfileSession(first, 'Sessão offline'), { timeout: 120_000 });
  await expect(first.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible({ timeout: 120_000 });

  await first.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(first).toHaveURL(/\/dashboard$/, { timeout: 120_000 });
  await test.step('reopen after reload', () => openRememberedSave(first), { timeout: 120_000 });

  const hostDatabases = await test.step('inspect IndexedDB workspaces', () => first.evaluate(async () => {
    if (typeof indexedDB.databases !== 'function') return [];
    return (await indexedDB.databases())
      .map(({ name }) => name)
      .filter((name): name is string => typeof name === 'string' && /nutridiet|diet-browser-journey/i.test(name));
  }), { timeout: 30_000 });
  expect(hostDatabases).toContain('nutridiet-profile-session-v1');
  expect(hostDatabases.filter((name) => name.startsWith('/pglite/nutridiet-'))).toHaveLength(1);
  expect(hostDatabases.some((name) => name.includes('diet-browser-journey'))).toBe(false);

  await test.step('release the first tab', () => first.close(), { timeout: 30_000 });
  const second = await test.step('create the exclusive replacement tab', () => context.newPage(), { timeout: 30_000 });
  await second.goto(`${baseURL ?? 'http://127.0.0.1:3000'}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(second).toHaveURL(/\/dashboard$/, { timeout: 120_000 });
  await test.step('show remembered save in replacement tab', () => openSaveSettings(second), { timeout: 120_000 });
  await expect(second.getByRole('button', { name: /^Abrir save / })).toBeVisible({ timeout: 30_000 });
  await expect(second.getByText('Sincronizado', { exact: true })).toBeVisible({ timeout: 30_000 });

  await test.step('disconnect the replacement tab', () => context.setOffline(true), { timeout: 30_000 });
  await expect(second.evaluate(() => navigator.onLine)).resolves.toBe(false);
  await test.step('resume the compatible save offline', () => openRememberedSave(second), { timeout: 120_000 });
  await expect(second).toHaveURL(/\/dashboard$/);
  await expect(second.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
  await test.step('restore network', () => context.setOffline(false), { timeout: 30_000 });
  await test.step('close the isolated context', () => context.close(), { timeout: 30_000 });
});
