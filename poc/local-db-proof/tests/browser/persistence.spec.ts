import { expect, test } from '@playwright/test';
import { normalizeConfirmedFixture } from '../support/fixture-assertions';

for (const explicitClose of [true, false]) {
test(`preserves both accounts after page close (explicit database close=${explicitClose})`, async ({ context, page, baseURL }, testInfo) => {
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');
  const before = await page.evaluate(async (explicitClose) => {
    const clientPath = '/src/db/client.ts';
    const repositoryPath = '/src/db/repositories.ts';
    const fixturePath = '/src/fixture.ts';
    const { openDatabase, closeDatabase } = await import(clientPath);
    const { createDatabaseRepository } = await import(repositoryPath);
    const { cloneFixture } = await import(fixturePath);
    const started = performance.now();
    const handle = await openDatabase();
    const openingMs = performance.now() - started;
    try {
      const repository = createDatabaseRepository(handle);
      const writeStarted = performance.now();
      await repository.seedFixture(cloneFixture());
      const writeMs = performance.now() - writeStarted;
      const queryStarted = performance.now();
      const alpha = await repository.readConfirmed('account-alpha');
      const beta = await repository.readConfirmed('account-beta');
      const queryMs = performance.now() - queryStarted;
      return { alpha, beta, timings: { openingMs, writeMs, queryMs }, schemaVersion: handle.schemaVersion };
    } finally {
      if (explicitClose) await closeDatabase(handle);
    }
  }, explicitClose);
  await page.close();
  const reopenedPage = await context.newPage();
  await reopenedPage.goto(baseURL ?? 'http://127.0.0.1:4173');
  const after = await reopenedPage.evaluate(async () => {
    const clientPath = '/src/db/client.ts';
    const repositoryPath = '/src/db/repositories.ts';
    const { openDatabase, closeDatabase } = await import(clientPath);
    const { createDatabaseRepository } = await import(repositoryPath);
    const handle = await openDatabase();
    try {
      const repository = createDatabaseRepository(handle);
      return { alpha: await repository.readConfirmed('account-alpha'), beta: await repository.readConfirmed('account-beta') };
    } finally {
      await closeDatabase(handle);
    }
  });
  expect(normalizeConfirmedFixture(after.alpha)).toEqual(normalizeConfirmedFixture(before.alpha));
  expect(normalizeConfirmedFixture(after.beta)).toEqual(normalizeConfirmedFixture(before.beta));
  await testInfo.attach('persistence-evidence', { body: JSON.stringify(before, null, 2), contentType: 'application/json' });
  console.log('Persistent browser timings (ms):', before.timings);
});
}

test('keeps the latest draft when real IndexedDB connections receive stale autosaves', async ({ page, baseURL }) => {
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');
  const result = await page.evaluate(async () => {
    const draftPath = '/src/drafts/draft-store.ts';
    const { createDraftStore } = await import(draftPath);
    const first = createDraftStore('browser-draft-order');
    const second = createDraftStore('browser-draft-order');
    const newest = {
      draftId: 'browser-draft', accountId: 'account-alpha', patientId: 'patient-ana',
      payload: { title: 'newest' }, updatedAt: '2026-08-30T10:02:00Z',
    };
    const stale = { ...newest, payload: { title: 'stale' }, updatedAt: '2026-08-30T10:01:00Z' };
    await Promise.all([first.list(), second.list()]);
    await Promise.all([first.save(newest), second.save(stale)]);
    return { actual: await first.get(newest.draftId), expected: newest };
  });
  expect(result.actual).toEqual(result.expected);
});

test('upgrades a populated persistent v2 database and reapplies migrations without loss', async ({ page, baseURL }) => {
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');
  const result = await page.evaluate(async () => {
    const enginePath = '/node_modules/@electric-sql/pglite/dist/index.js';
    const migrationPath = '/src/db/migrations.ts';
    const fixturePath = '/src/fixture.ts';
    const clientPath = '/src/db/client.ts';
    const { PGlite } = await import(enginePath);
    const { applyMigrations, migrationFiles } = await import(migrationPath);
    const { cloneFixture } = await import(fixturePath);
    const { openDatabase, closeDatabase } = await import(clientPath);
    const dataDir = 'idb://browser-migration-v2';
    const historical = new PGlite(dataDir);
    await historical.waitReady;
    const tables = {
      accounts: 'accounts', patients: 'patients', recipes: 'recipes', recipeIngredients: 'recipe_ingredients',
      dietPlans: 'diet_plans', dietMeals: 'diet_meals', dietMealItems: 'diet_meal_items',
    };
    const before: unknown[] = [];
    try {
      await applyMigrations(historical, migrationFiles.slice(0, 2));
      const fixture = cloneFixture();
      // Only controlled fixture keys are used as SQL identifiers; values are parameters.
      for (const [collection, table] of Object.entries(tables)) {
        for (const row of fixture[collection] as Record<string, unknown>[]) {
          const columns = Object.keys(row).map((key) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`));
          const values = Object.values(row);
          await historical.query(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(',')})`, values);
        }
        before.push((await historical.query(`SELECT * FROM ${table} ORDER BY id`)).rows);
      }
    } finally {
      await historical.close();
    }
    const handle = await openDatabase({ mode: 'browser-persistent', dataDir });
    try {
      await applyMigrations(handle.client);
      const after: unknown[] = [];
      for (const table of Object.values(tables)) {
        after.push((await handle.client.query(`SELECT * FROM ${table} ORDER BY id`)).rows);
      }
      return { before, after, schemaVersion: handle.schemaVersion };
    } finally {
      await closeDatabase(handle);
    }
  });
  expect(result.schemaVersion).toBe('3');
  expect(result.after).toEqual(result.before);
});
