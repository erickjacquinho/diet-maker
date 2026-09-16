import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/valid-jacques-regiani.nutridiet'), 'utf8');
const invalidFixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/invalid.nutridiet'), 'utf8');

async function installFileSystemFakes(page: import('@playwright/test').Page, openContent: string) {
  await page.addInitScript(({ openContent: initialContent }) => {
    const store = { content: initialContent };
    const handle = (name: string) => ({
      name,
      async getFile() { return { text: async () => store.content }; },
      async requestPermission() { return 'granted' as const; },
      async createWritable() {
        return {
          async write(content: string) {
            store.content = content;
            (window as unknown as { __nutridietLastWrite?: string }).__nutridietLastWrite = content;
          },
          async close() {},
        };
      },
    });

    (window as unknown as {
      showOpenFilePicker: () => Promise<unknown[]>;
      showSaveFilePicker: () => Promise<unknown>;
    }).showOpenFilePicker = async () => [handle('fixture.nutridiet')];
    (window as unknown as {
      showSaveFilePicker: () => Promise<unknown>;
    }).showSaveFilePicker = async () => handle('created.nutridiet');
  }, { openContent });
}

test('creates a profile and writes schema 6 before entering the internal app', async ({ page }) => {
  await installFileSystemFakes(page, '');
  await page.goto('/Home');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Criar perfil' }).click();
  await page.getByLabel('Nome').fill('Jacques Regiani');
  await page.getByLabel('Telefone').fill('11 99999-0000');
  await page.getByRole('button', { name: 'Salvar profile' }).click();

  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 60_000 });
  const written = await page.evaluate(() => JSON.parse((window as unknown as { __nutridietLastWrite: string }).__nutridietLastWrite));
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
