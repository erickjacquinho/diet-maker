import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/valid-jacques-regiani.nutridiet'), 'utf8');
const invalidFixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/invalid.nutridiet'), 'utf8');

async function installFileSystemFakes(page: import('@playwright/test').Page, openContent: string) {
  await page.addInitScript(({ openContent: initialContent }) => {
    const contentKey = 'nutridiet-e2e-primary-content';
    const attemptsKey = 'nutridiet-e2e-write-attempts';
    const successesKey = 'nutridiet-e2e-write-successes';
    if (localStorage.getItem(contentKey) === null) localStorage.setItem(contentKey, initialContent);
    const e2eWindow = window as unknown as {
      __nutridietWritePending?: boolean;
      __nutridietReleaseWrite?: () => void;
      __nutridietWriteAttempts?: number;
      __nutridietWriteSuccesses?: number;
    };
    const counter = (key: string): number => Number(localStorage.getItem(key) ?? '0');
    const increment = (key: string): number => {
      const next = counter(key) + 1;
      localStorage.setItem(key, String(next));
      return next;
    };
    const store = {
      get content() { return localStorage.getItem(contentKey) ?? ''; },
      set content(value: string) { localStorage.setItem(contentKey, value); },
    };
    const handle = (name: string) => ({
      name,
      async getFile() { return { text: async () => store.content }; },
      async requestPermission() { return 'granted' as const; },
      async createWritable() {
        return {
          async write(content: string) {
            e2eWindow.__nutridietWriteAttempts = increment(attemptsKey);
            if (localStorage.getItem('nutridiet-e2e-fail-next-write') === '1') {
              localStorage.removeItem('nutridiet-e2e-fail-next-write');
              throw new Error('simulated file write failure');
            }
            if (localStorage.getItem('nutridiet-e2e-delay-next-write') === '1') {
              localStorage.removeItem('nutridiet-e2e-delay-next-write');
              e2eWindow.__nutridietWritePending = true;
              await new Promise<void>((resolve) => {
                e2eWindow.__nutridietReleaseWrite = resolve;
              });
              e2eWindow.__nutridietWritePending = false;
              e2eWindow.__nutridietReleaseWrite = undefined;
            }
            store.content = content;
            (window as unknown as { __nutridietLastWrite?: string }).__nutridietLastWrite = content;
            e2eWindow.__nutridietWriteSuccesses = increment(successesKey);
          },
          async close() {},
        };
      },
    });

    e2eWindow.__nutridietWriteAttempts = counter(attemptsKey);
    e2eWindow.__nutridietWriteSuccesses = counter(successesKey);

    (window as unknown as {
      showOpenFilePicker: () => Promise<unknown[]>;
      showSaveFilePicker: () => Promise<unknown>;
    }).showOpenFilePicker = async () => [handle('fixture.nutridiet')];
    (window as unknown as {
      showSaveFilePicker: () => Promise<unknown>;
    }).showSaveFilePicker = async () => handle('created.nutridiet');
  }, { openContent });
}

async function createProfile(page: import('@playwright/test').Page, name = 'Jacques Regiani') {
  await page.goto('/Home');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Criar perfil' }).click();
  await page.getByLabel('Nome').fill(name);
  await page.getByLabel('Telefone').fill('11 99999-0000');
  await page.getByRole('button', { name: 'Salvar profile' }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible();
}

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

async function readPrimarySave(page: import('@playwright/test').Page) {
  return page.evaluate(() => ({
    content: localStorage.getItem('nutridiet-e2e-primary-content') ?? '',
    attempts: Number(localStorage.getItem('nutridiet-e2e-write-attempts') ?? '0'),
    successes: Number(localStorage.getItem('nutridiet-e2e-write-successes') ?? '0'),
  }));
}

test('creates a profile and writes schema 6 before entering the internal app', async ({ page }) => {
  await installFileSystemFakes(page, '');
  await createProfile(page);
  const written = JSON.parse((await readPrimarySave(page)).content);
  expect(written.schemaVersion).toBe('6');
  expect(written.favorites).toEqual([]);
  expect(written.account[0]).toMatchObject({ displayName: 'Jacques Regiani', phone: '(11) 99999-0000' });
});

test('loads the portable fixture and makes Jacques Regiani patient data visible', async ({ page }) => {
  await installFileSystemFakes(page, fixture);
  await page.goto('http://localhost:3100/Home');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Abrir arquivo' }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 60_000 });
  await expect(page.getByText('Paciente de Jacques')).toBeVisible({ timeout: 30_000 });
});

test('keeps onboarding available when the selected file is invalid', async ({ page }) => {
  await installFileSystemFakes(page, invalidFixture);
  await page.goto('/Home');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Abrir arquivo' }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('button', { name: 'Criar perfil' })).toBeVisible();
  await expect(page.locator('p[role="alert"]')).toContainText('aplicação');
});

test('field edits stay local; explicit save and Ctrl+S write only confirmed changes', async ({ page }) => {
  await installFileSystemFakes(page, '');
  await createProfile(page, 'Confirmações');

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
  expect(JSON.parse((await readPrimarySave(page)).content).patients).toHaveLength(2);
  await expect(secondDialog).toBeHidden();

  const attemptsBeforeNavigation = (await readPrimarySave(page)).attempts;
  await page.getByRole('link', { name: 'Receitas Culinárias' }).click();
  await expect(page).toHaveURL(/\/receitas$/, { timeout: 60_000 });
  await expect.poll(async () => (await readPrimarySave(page)).attempts).toBe(attemptsBeforeNavigation);
});

test('keeps a failed checkpoint across reload, retries after route change, and exposes manual retry', async ({ page }) => {
  await installFileSystemFakes(page, '');
  await createProfile(page, 'Recuperação');
  await page.evaluate(() => localStorage.setItem('nutridiet-e2e-fail-next-write', '1'));

  const dialog = await fillPatientForm(page, 'Paciente Recuperado');
  await dialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect(dialog.getByRole('alert')).toContainText('simulated file write failure');
  await expect(page.locator('[data-profile-sync-state="paused"]')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(1);

  await page.reload();
  await expect(page).toHaveURL(/\/home$/);
  await page.evaluate(() => localStorage.setItem('nutridiet-e2e-fail-next-write', '1'));
  await page.getByRole('button', { name: 'Abrir arquivo' }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 60_000 });
  await expect(page.getByText('Paciente Recuperado')).toBeVisible();
  await expect(page.locator('[data-profile-sync-state="paused"]')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(1);

  await page.getByRole('button', { name: 'Reautorizar arquivo' }).click();
  await expect(page.locator('[data-profile-sync-state="synced"]')).toBeVisible();
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(2);
  expect(JSON.parse((await readPrimarySave(page)).content).patients).toHaveLength(1);
});

test('a pathname change during a checkpoint shares the in-flight file write', async ({ page }) => {
  await installFileSystemFakes(page, '');
  await createProfile(page, 'Checkpoint simultâneo');
  const dialog = await fillPatientForm(page, 'Paciente Concorrente');
  await page.evaluate(() => localStorage.setItem('nutridiet-e2e-delay-next-write', '1'));

  await dialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect.poll(() => page.evaluate(() => Boolean((window as unknown as { __nutridietWritePending?: boolean }).__nutridietWritePending))).toBe(true);
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a')).find((candidate) => candidate.getAttribute('href') === '/receitas');
    if (!link) throw new Error('Receitas link was not found');
    link.click();
  });
  await expect(page).toHaveURL(/\/receitas$/);
  await expect.poll(async () => (await readPrimarySave(page)).attempts).toBe(2);

  await page.evaluate(() => (window as unknown as { __nutridietReleaseWrite?: () => void }).__nutridietReleaseWrite?.());
  await expect.poll(async () => (await readPrimarySave(page)).successes).toBe(2);
  expect(JSON.parse((await readPrimarySave(page)).content).patients).toHaveLength(1);
});
