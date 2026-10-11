import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createProfileSession, decryptBrowserSave, enterSaveDashboard, installProfileFileSystemFakes, loadLegacyProfileSession, openRememberedSave, readPrimarySave } from './helpers/profile-session';

test.use({ trace: 'off' });
test.setTimeout(300_000);

const fixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/valid-jacques-regiani.nutridiet'), 'utf8');
const invalidFixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/invalid.nutridiet'), 'utf8');

async function fillPatientForm(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: /Cadastrar Primeiro Paciente|Novo paciente/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Cadastrar Novo Paciente' });
  await dialog.getByLabel('Nome Completo').fill(name);
  await dialog.getByLabel('WhatsApp').fill('11999990000');
  await dialog.getByRole('textbox', { name: 'Data de nascimento' }).fill('01011990');
  await dialog.getByRole('combobox', { name: 'Gênero' }).click();
  await page.getByRole('option', { name: 'Feminino' }).click();
  return dialog;
}

test('creates a protected save with schema 11 before entering the internal app', async ({ page }) => {
  await createProfileSession(page);
  const written = await decryptBrowserSave(page, (await readPrimarySave(page)).content);
  expect(written.schemaVersion).toBe('11');
  expect(written.favorites).toEqual([]);
  expect(written.account[0]).toMatchObject({ displayName: 'Perfil de teste', phone: null });
});

test('loads the portable fixture and makes Jacques Regiani patient data visible', async ({ page }) => {
  const source = await loadLegacyProfileSession(page, fixture);
  expect(await page.evaluate(() => (window as unknown as { __nutridietReadSource(): Promise<string> }).__nutridietReadSource())).toBe(source);
  await expect(page.getByText('Paciente de Jacques')).toBeVisible({ timeout: 30_000 });
});

test('keeps the save dashboard available when the selected file is invalid', async ({ page }) => {
  await installProfileFileSystemFakes(page, invalidFixture);
  await enterSaveDashboard(page);
  await page.getByRole('button', { name: 'Importar arquivo' }).click();
  await expect(page).toHaveURL(/\/saves$/);
  await expect(page.getByRole('button', { name: 'Criar save' })).toBeVisible();
  await expect(page.locator('p[role="alert"]')).toContainText('aplicação');
});

test('field edits stay local; explicit save and Ctrl+S write only confirmed changes', async ({ page }) => {
  await createProfileSession(page, 'Confirmações');

  const firstDialog = await fillPatientForm(page, 'Ana Botão');
  await expect.poll(async () => (await readPrimarySave(page)).attempts).toBe(1);
  await firstDialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect(page.getByText('Ana Botão')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(2);

  const secondDialog = await fillPatientForm(page, 'Bruno Atalho');
  await expect.poll(async () => (await readPrimarySave(page)).attempts).toBe(2);
  await page.keyboard.press('Control+s');
  await expect(page.getByText('Bruno Atalho')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(3);
  expect((await decryptBrowserSave(page, (await readPrimarySave(page)).content)).patients).toHaveLength(2);
  await expect(secondDialog).toBeHidden();

  const attemptsBeforeNavigation = (await readPrimarySave(page)).attempts;
  await page.getByRole('link', { name: 'Receitas Culinárias' }).click();
  await expect(page).toHaveURL(/\/receitas$/, { timeout: 60_000 });
  await expect.poll(async () => (await readPrimarySave(page)).attempts).toBe(attemptsBeforeNavigation);
});

test('keeps a failed checkpoint across reload, retries after route change, and exposes manual retry', async ({ page }) => {
  await createProfileSession(page, 'Recuperação');
  await page.evaluate(() => localStorage.setItem('nutridiet-e2e-fail-next-write', '1'));

  const dialog = await fillPatientForm(page, 'Paciente Recuperado');
  await dialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect(dialog.getByRole('alert')).toContainText('simulated file write failure');
  await expect(page.locator('[data-profile-sync-state="paused"]')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(1);

  await page.reload();
  await expect(page).toHaveURL(/\/saves$/);
  await page.evaluate(() => localStorage.setItem('nutridiet-e2e-fail-next-write', '1'));
  await openRememberedSave(page);
  await expect(page.getByText('Paciente Recuperado')).toBeVisible();
  await expect(page.locator('[data-profile-sync-state="paused"]')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(1);

  await page.getByRole('button', { name: 'Reautorizar arquivo' }).click();
  await expect(page.locator('[data-profile-sync-state="synced"]')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(2);
  expect((await decryptBrowserSave(page, (await readPrimarySave(page)).content)).patients).toHaveLength(1);
});

test('a pathname change during a checkpoint shares the in-flight file write', async ({ page }) => {
  await createProfileSession(page, 'Checkpoint simultâneo');
  const dialog = await fillPatientForm(page, 'Paciente Concorrente');
  await page.evaluate(() => localStorage.setItem('nutridiet-e2e-delay-next-write', '1'));

  await dialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect.poll(() => page.evaluate(() => Boolean((window as unknown as { __nutridietWritePending?: boolean }).__nutridietWritePending))).toBe(true);
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a')).find((candidate) => candidate.getAttribute('href') === '/receitas');
    if (!link) throw new Error('Receitas link was not found');
    link.click();
  });
  await expect(page).toHaveURL(/\/receitas$/, { timeout: 60_000 });
  await expect.poll(async () => (await readPrimarySave(page)).attempts).toBe(2);

  await page.evaluate(() => (window as unknown as { __nutridietReleaseWrite?: () => void }).__nutridietReleaseWrite?.());
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(2);
  expect((await decryptBrowserSave(page, (await readPrimarySave(page)).content)).patients).toHaveLength(1);
});
