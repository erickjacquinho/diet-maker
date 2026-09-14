import { expect, test } from '@playwright/test';

test('reports a rejected Web Locks request instead of leaving initialization pending', async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: async () => { throw new DOMException('Lock manager unavailable', 'SecurityError'); } },
    });
  });
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');
  await page.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-status', 'fail');
  await expect(page.locator('#report')).toContainText('LOCK_UNAVAILABLE');
});

test('releases a reacquired lease when its page closes without a database', async ({ context, page, baseURL }) => {
  await page.goto(baseURL ?? 'http://127.0.0.1:4173');
  await page.evaluate(async () => {
    const lockPath = '/src/locking/single-tab-lock.ts';
    const { SingleTabLock } = await import(lockPath);
    const lock = new SingleTabLock();
    const firstLease = await lock.acquire();
    await firstLease.release();
    await lock.acquire();
  });
  const observer = await context.newPage();
  await observer.goto(baseURL ?? 'http://127.0.0.1:4173');
  await page.close();
  await expect.poll(async () => (await observer.evaluate(() => navigator.locks.query())).held).toEqual([]);
});

test('blocks a second tab before opening the database and releases after the first closes', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const firstPage = await context.newPage();
  await firstPage.goto(baseURL ?? 'http://127.0.0.1:4173');
  await firstPage.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(firstPage.locator('#status')).toHaveAttribute('data-status', 'pass', { timeout: 60_000 });

  const secondPage = await context.newPage();
  await secondPage.goto(baseURL ?? 'http://127.0.0.1:4173');
  await secondPage.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(secondPage.locator('#status')).toHaveAttribute('data-status', 'fail', { timeout: 60_000 });
  await expect(secondPage.locator('#status')).toContainText('Acesso bloqueado');
  await expect(secondPage.locator('#report')).toContainText('LOCK_UNAVAILABLE');

  await firstPage.close();
  await expect.poll(async () => (await secondPage.evaluate(() => navigator.locks.query())).held).toEqual([]);
  await secondPage.reload();
  await secondPage.getByRole('button', { name: 'Inicializar fixture' }).click();
  await expect(secondPage.locator('#status')).toHaveAttribute('data-status', 'pass', { timeout: 60_000 });

  await context.close();
});

test('keeps a second tab blocked after the first reopens its database', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const first = await context.newPage();
    await first.goto(baseURL ?? 'http://127.0.0.1:4173');
    await first.getByRole('button', { name: 'Inicializar fixture' }).click();
    await expect(first.locator('#status')).toContainText('Base persistente inicializada', { timeout: 60_000 });
    await first.getByRole('button', { name: 'Fechar e reabrir' }).click();
    await expect(first.locator('#status')).toContainText('Reabertura confirmada', { timeout: 60_000 });

    const second = await context.newPage();
    await second.goto(baseURL ?? 'http://127.0.0.1:4173');
    await second.getByRole('button', { name: 'Inicializar fixture' }).click();
    await expect(second.locator('#report')).toContainText('LOCK_UNAVAILABLE', { timeout: 10_000 });
    await expect(second.locator('#status')).toHaveAttribute('data-status', 'fail');

    await first.close();
    await expect.poll(async () => (await second.evaluate(() => navigator.locks.query())).held).toEqual([]);
    await second.getByRole('button', { name: 'Inicializar fixture' }).click();
    await expect(second.locator('#status')).toContainText('Base persistente inicializada', { timeout: 60_000 });
  } finally {
    await context.close();
  }
});
