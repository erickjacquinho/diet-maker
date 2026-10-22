import { expect, test, type Page } from '@playwright/test';
import { confirmAndLogin, loginSyntheticAccount, registerSyntheticAccount, submitAndWait, waitForAuthLink } from './helpers/online-account';

test.use({ trace: 'off' });
test.setTimeout(300_000);

const updatedPassword = 'NutriDiet-E2E-Updated-2026!';

async function installOriginPrivateFilePickers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const root = async () => (navigator.storage as unknown as { getDirectory(): Promise<FileSystemDirectoryHandle> }).getDirectory();
    const testWindow = window as unknown as Window & {
      __nutridietSaveName?: string;
      __nutridietSetSaveName?: (name: string) => void;
      __nutridietReadSave?: () => Promise<string>;
      showSaveFilePicker: () => Promise<FileSystemFileHandle>;
      showOpenFilePicker: () => Promise<FileSystemFileHandle[]>;
    };
    testWindow.__nutridietSaveName = 'owner-one.nutridiet';
    testWindow.__nutridietSetSaveName = (name) => { testWindow.__nutridietSaveName = name; };
    testWindow.showSaveFilePicker = async () => (await root()).getFileHandle(testWindow.__nutridietSaveName ?? 'save.nutridiet', { create: true });
    testWindow.showOpenFilePicker = async () => [await (await root()).getFileHandle(testWindow.__nutridietSaveName ?? 'save.nutridiet')];
    testWindow.__nutridietReadSave = async () => {
      const handle = await (await root()).getFileHandle(testWindow.__nutridietSaveName ?? 'save.nutridiet');
      return (await handle.getFile()).text();
    };
  });
}

async function createSave(page: Page, label: string): Promise<void> {
  await page.getByRole('button', { name: 'Criar save' }).click();
  await page.getByLabel('Nome', { exact: true }).fill(label);
  const response = page.waitForResponse((item) => new URL(item.url()).pathname === '/api/saves' && item.request().method() === 'POST');
  await page.getByRole('button', { name: 'Salvar profile' }).click();
  expect((await response).status()).toBe(201);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  await expect(page.getByRole('dialog', { name: 'Criar profile' })).toBeHidden({ timeout: 120_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
}

async function openSave(page: Page, label: string): Promise<void> {
  await page.goto('/dashboard');
  const open = page.getByRole('button', { name: new RegExp(`Abrir save ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) });
  await expect(open).toBeVisible({ timeout: 30_000 });
  await open.click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
}

async function logout(page: Page): Promise<void> {
  const response = page.waitForResponse((item) => new URL(item.url()).pathname === '/api/auth/logout', { timeout: 30_000 });
  await page.getByRole('button', { name: /Abrir menu de conta de/ }).click();
  await page.getByRole('menuitem', { name: 'Sair', exact: true }).click();
  expect((await response).status()).toBe(204);
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
}

test('keeps one encrypted save openable after re-login and password reset, and isolates two owners', async ({ page }) => {
  await installOriginPrivateFilePickers(page);
  const ownerOne = await registerSyntheticAccount(page);
  await confirmAndLogin(page, ownerOne.email, ownerOne.password);
  await createSave(page, 'Conta Protegida');

  const originalText = await page.evaluate(() => (window as unknown as { __nutridietReadSave: () => Promise<string> }).__nutridietReadSave());
  const originalEnvelope = JSON.parse(originalText) as Record<string, unknown>;
  expect(originalEnvelope).toMatchObject({ appId: 'nutridiet-local-pro', formatVersion: 2, algorithm: 'AES-256-GCM' });
  if (typeof originalEnvelope.saveId !== 'string' || typeof originalEnvelope.bindingProof !== 'string') {
    throw new Error('The protected save identity is missing.');
  }
  const saveId = originalEnvelope.saveId;
  const bindingProof = originalEnvelope.bindingProof;
  expect(originalText).not.toContain('Conta Protegida');

  await logout(page);
  await loginSyntheticAccount(page, ownerOne.email, ownerOne.password);
  for (const width of [1024, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByText('Sincronizado', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`${width}-saves-dashboard.png`), fullPage: true });
  }
  await openSave(page, 'Conta Protegida');
  expect(await page.evaluate(() => (window as unknown as { __nutridietReadSave: () => Promise<string> }).__nutridietReadSave())).toBe(originalText);

  await logout(page);
  await loginSyntheticAccount(page, ownerOne.email, ownerOne.password);
  await page.evaluate(async (content) => {
    const root = await (navigator.storage as unknown as { getDirectory(): Promise<FileSystemDirectoryHandle> }).getDirectory();
    const relocated = await root.getFileHandle('owner-one-relocated.nutridiet', { create: true });
    const stream = await relocated.createWritable();
    await stream.write(content);
    await stream.close();
    (window as unknown as { __nutridietSetSaveName(name: string): void }).__nutridietSetSaveName('owner-one-relocated.nutridiet');
  }, originalText);
  await page.getByRole('button', { name: /Localizar save Conta Protegida/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  expect(await page.evaluate(() => (window as unknown as { __nutridietReadSave: () => Promise<string> }).__nutridietReadSave())).toBe(originalText);

  await logout(page);
  await page.goto('/recuperar-senha');
  await page.getByLabel('E-mail').fill(ownerOne.email);
  expect((await submitAndWait(page, 'Enviar instruções', '/api/auth/recovery')).status()).toBe(202);
  await expect(page.getByRole('status')).toContainText('Se o endereço puder receber uma recuperação');
  await page.goto(await waitForAuthLink(ownerOne.email, '/auth/recovery', page));
  await expect(page).toHaveURL(/\/redefinir-senha$/);
  await page.getByLabel('Nova senha', { exact: true }).fill(updatedPassword);
  await page.getByLabel('Confirme a nova senha', { exact: true }).fill(updatedPassword);
  expect((await submitAndWait(page, 'Alterar senha', '/api/auth/reset-password')).status()).toBe(200);
  await expect(page.getByRole('status')).toContainText('Sua senha foi alterada');

  await loginSyntheticAccount(page, ownerOne.email, updatedPassword);
  await openSave(page, 'Conta Protegida');
  expect(await page.evaluate(() => (window as unknown as { __nutridietReadSave: () => Promise<string> }).__nutridietReadSave())).toBe(originalText);
  await logout(page);

  const ownerTwo = await registerSyntheticAccount(page);
  await confirmAndLogin(page, ownerTwo.email, ownerTwo.password);
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Abrir save Conta Protegida/ })).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { __nutridietSetSaveName: (name: string) => void }).__nutridietSetSaveName('owner-two.nutridiet'));
  await createSave(page, 'Outro Save');

  const crossOwnerStatus = await page.evaluate(async ({ saveId, bindingProof }) => {
    const csrfResponse = await fetch('/api/auth/csrf', { cache: 'no-store' });
    const { csrfToken } = await csrfResponse.json() as { csrfToken: string };
    const response = await fetch(`/api/saves/${encodeURIComponent(saveId)}/authorize`, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bindingProof, csrfToken }),
    });
    return response.status;
  }, { saveId, bindingProof });
  expect(crossOwnerStatus).toBe(404);
});
