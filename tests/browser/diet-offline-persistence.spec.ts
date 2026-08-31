import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('persists a draft across reload and keeps a second tab out of the local runtime', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const first = await context.newPage();
  await first.goto(baseURL ?? 'http://127.0.0.1:3000');
  await first.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('diet-browser-journey', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts', { keyPath: 'id' });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const transaction = request.result.transaction('drafts', 'readwrite');
      transaction.objectStore('drafts').put({ id: 'draft-a', revision: 1, payload: { name: 'Arroz' } });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  }));
  await first.reload();
  await expect.poll(() => first.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('diet-browser-journey');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction('drafts').objectStore('drafts').get('draft-a');
      get.onsuccess = () => resolve(get.result?.revision ?? 0);
      get.onerror = () => reject(get.error);
    };
  }))).toBe(1);

  const release = await first.evaluate(() => {
    if (!navigator.locks) return false;
    const state = window as typeof window & { releaseDietLock?: () => void };
    void navigator.locks.request('nutridiet-browser-journey', async () => new Promise<void>((resolve) => { state.releaseDietLock = resolve; }));
    return true;
  });
  const second = await context.newPage();
  await second.goto(baseURL ?? 'http://127.0.0.1:3000');
  if (release) {
    await expect.poll(() => second.evaluate(() => navigator.locks.request('nutridiet-browser-journey', { ifAvailable: true }, (lock) => Boolean(lock)))).toBe(false);
    await first.evaluate(() => (window as typeof window & { releaseDietLock?: () => void }).releaseDietLock?.());
  }
  await context.setOffline(true);
  await expect(second.evaluate(() => navigator.onLine)).resolves.toBe(false);
  await context.close();
});
