import { expect, test } from '@playwright/test';

test('releases the instance when fixture initialization fails after opening storage', async ({ page, baseURL }) => {
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');
  await page.evaluate(async () => {
    const clientPath = '/src/db/client.ts';
    const repositoryPath = '/src/db/repositories.ts';
    const transferPath = '/src/portability/sample-transfer.ts';
    const fixturePath = '/src/fixture.ts';
    const { openDatabase, closeDatabase } = await import(clientPath);
    const { createDatabaseRepository } = await import(repositoryPath);
    const { createPortableSample } = await import(transferPath);
    const { cloneFixture } = await import(fixturePath);
    const handle = await openDatabase();
    try {
      await createDatabaseRepository(handle).replaceConfirmed(createPortableSample({
        accounts: cloneFixture().accounts.filter((account: { id: string }) => account.id === 'account-beta'),
        patients: [], recipes: [], recipeIngredients: [], dietPlans: [], dietMeals: [], dietMealItems: [],
      }, 'account-beta'));
    } finally {
      await closeDatabase(handle);
    }
  });
  await page.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-status', 'fail', { timeout: 60_000 });
  await expect(page.locator('#report')).toContainText('INTEGRITY_VIOLATION');
  expect(await page.evaluate(async () => (await navigator.locks.query()).held)).toEqual([]);
});

test('reports a failed reopen and permits recovery in the same tab', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(page.locator('#status')).toContainText('Base persistente inicializada', { timeout: 60_000 });

  await page.evaluate(() => {
    const storage = window.indexedDB;
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      get: () => document.body.dataset.rejectStorage === 'true' ? undefined : storage,
    });
    document.body.dataset.rejectStorage = 'true';
  });
  await page.getByRole('button', { name: 'Fechar e reabrir' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-status', 'fail', { timeout: 10_000 });
  await expect(page.locator('#status')).toContainText('PERSISTENCE_UNCONFIRMED');
  const report = JSON.parse(await page.locator('#report').innerText());
  expect(report.entries.at(-1)).toMatchObject({ scenario: 'US1/reopen', status: 'fail' });

  await page.evaluate(() => { document.body.dataset.rejectStorage = 'false'; });
  await page.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(page.locator('#report')).toContainText('recuperada do armazenamento persistente', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Fechar e reabrir' }).click();
  await expect(page.locator('#status')).toContainText('Reabertura confirmada', { timeout: 60_000 });
});
