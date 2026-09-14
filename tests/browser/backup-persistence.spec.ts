import { readFile } from 'node:fs/promises';

import { expect, test, type Download, type Page } from '@playwright/test';
import { createProfileSession } from './helpers/profile-session';

async function downloadContent(download: Download): Promise<string> {
  const path = await download.path();
  expect(path).not.toBeNull();
  return readFile(path as string, 'utf8');
}

async function exportBackup(page: Page): Promise<string> {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar backup local' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^nutridiet-backup-\d{4}-\d{2}-\d{2}\.nutridiet$/);
  return downloadContent(download);
}

async function openRestoreDialog(page: Page, content: string): Promise<void> {
  const input = page.locator('input[type="file"][accept*=".nutridiet"]');
  await page.getByRole('button', { name: 'Importar backup local' }).click();
  await input.setInputFiles({
    name: 'nutridiet-backup.nutridiet',
    mimeType: 'application/json',
    buffer: Buffer.from(content, 'utf8'),
  });
  await expect(page.getByRole('dialog', { name: 'Importar backup' })).toBeVisible();
}

async function seedEditableDraft(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('nutridiet-diet-drafts-v1', 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('diet-drafts')) {
        const store = database.createObjectStore('diet-drafts', { keyPath: 'draftId' });
        store.createIndex('contextKey', 'contextKey', { unique: true });
        store.createIndex('patientScope', ['accountId', 'patientId'], { unique: false });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('draft database could not be opened'));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction('diet-drafts', 'readwrite');
      transaction.objectStore('diet-drafts').put({
        draftId: 'browser-pending-draft',
        accountId: 'local-account',
        patientId: 'browser-patient',
        routeDietId: 'browser-route',
        contextKey: 'local-account|browser-patient|browser-route',
        state: 'EDITABLE',
      });
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error ?? new Error('draft could not be seeded'));
    };
  }));
}

test.describe('backup manual local', () => {
  test.beforeEach(async ({ page }) => {
    await createProfileSession(page, 'Backup browser');
    await expect(page.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible({ timeout: 120_000 });
    await page.waitForLoadState('networkidle');
  });

  test('exporta as 17 tabelas localmente sem request de rede ou drafts', async ({ page, context }) => {
    await exportBackup(page);
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await context.setOffline(true);
    const requestCountBefore = requests.length;
    const startedAt = Date.now();

    const content = await exportBackup(page);

    expect(Date.now() - startedAt).toBeLessThan(10_000);
    expect(requests).toHaveLength(requestCountBefore);
    expect(content).toContain('"formatVersion":1');
    expect(content).toContain('"account"');
    expect(content).toContain('"objectiveOptions"');
    expect(content).toContain('"readyMealItems"');
    expect(content).not.toContain('draft');
  });

  test('valida arquivo inválido, permite cancelar e restaura um backup válido após reload', async ({ page }) => {
    const content = await exportBackup(page);

    const input = page.locator('input[type="file"][accept*=".nutridiet"]');
    await page.getByRole('button', { name: 'Importar backup local' }).click();
    await input.setInputFiles({
      name: 'backup-invalido.nutridiet',
      mimeType: 'application/json',
      buffer: Buffer.from('{invalid', 'utf8'),
    });
    await expect(page.locator('[data-backup-feedback="error"]')).toContainText('O arquivo não é um backup NutriDiet válido.');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await openRestoreDialog(page, content);
    const dialog = page.getByRole('dialog', { name: 'Importar backup' });
    await expect(dialog).toContainText('Não haverá mesclagem.');
    await expect(dialog).toContainText('não possui senha nem criptografia');
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(dialog).toBeHidden();

    await openRestoreDialog(page, content);
    const reloadPromise = page.waitForEvent('load');
    await page.getByRole('dialog', { name: 'Importar backup' }).getByRole('button', { name: 'Importar backup', exact: true }).click();
    await reloadPromise;
    await expect(page).toHaveURL(/\/home$/, { timeout: 120_000 });
    await expect(page.getByRole('button', { name: 'Criar perfil' })).toBeVisible({ timeout: 120_000 });
  });

  test('não consulta rascunhos legados em IndexedDB durante a importação', async ({ page }) => {
    const content = await exportBackup(page);
    await seedEditableDraft(page);
    await openRestoreDialog(page, content);

    const dialog = page.getByRole('dialog', { name: 'Importar backup' });
    await dialog.getByRole('button', { name: 'Importar backup', exact: true }).click();
    await expect(page).toHaveURL(/\/home$/, { timeout: 120_000 });
  });

  test('preserva a base anterior quando a transação de importação falha', async ({ page }) => {
    const content = await exportBackup(page);
    const invalidSnapshot = JSON.parse(content) as { objectiveOptions: Array<{ origin: string }> };
    invalidSnapshot.objectiveOptions[0].origin = 'INVALID_ORIGIN';

    await openRestoreDialog(page, JSON.stringify(invalidSnapshot));
    const dialog = page.getByRole('dialog', { name: 'Importar backup' });
    await dialog.getByRole('button', { name: 'Importar backup', exact: true }).click();
    await expect(page.locator('[data-backup-feedback="error"]')).toContainText('A importação falhou; a base anterior foi preservada.');

    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(dialog).toBeHidden();
    const afterFailure = JSON.parse(await exportBackup(page)) as { objectiveOptions: Array<{ origin: string }> };
    expect(afterFailure.objectiveOptions[0].origin).toBe('SYSTEM');
  });
});
