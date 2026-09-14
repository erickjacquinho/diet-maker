import { test as base } from '@playwright/test';
import { legacyLibraryKeys } from '../../fixtures/library-fixtures';
import { createProfileSession } from '../helpers/profile-session';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript((keys) => {
      for (const key of keys) window.localStorage.removeItem(key);
    }, legacyLibraryKeys);
    await createProfileSession(page, 'Biblioteca browser');
    await use(page);
  },
});

export { expect } from '@playwright/test';
