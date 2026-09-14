import { expect, type Page } from '@playwright/test';

export async function installProfileFileSystemFakes(page: Page, initialContent = ''): Promise<void> {
  await page.addInitScript(({ openContent }) => {
    const store = { content: openContent };
    const createHandle = (name: string) => ({
      name,
      async getFile() {
        return { text: async () => store.content };
      },
      async requestPermission() {
        return 'granted' as const;
      },
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

    (window as unknown as { showOpenFilePicker: () => Promise<unknown[]> }).showOpenFilePicker = async () => [createHandle('profile.nutridiet')];
    (window as unknown as { showSaveFilePicker: () => Promise<unknown> }).showSaveFilePicker = async () => createHandle('profile.nutridiet');
  }, { openContent: initialContent });
}

export async function createProfileSession(page: Page, displayName = 'Perfil de teste'): Promise<void> {
  await installProfileFileSystemFakes(page);
  await page.goto('/Home', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  await expect(page.getByRole('button', { name: 'Criar perfil' })).toBeVisible({ timeout: 120_000 });
  await page.getByRole('button', { name: 'Criar perfil' }).click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 120_000 });
  await page.getByLabel('Nome').fill(displayName);
  await page.getByRole('button', { name: 'Salvar profile' }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 120_000 });
}

export async function navigateWithinSession(page: Page, href: string): Promise<void> {
  const link = page.locator(`a[href="${href}"]`).first();
  if (await link.count()) {
    await expect(link).toBeVisible({ timeout: 120_000 });
    await link.click();
    return;
  }

  // Some protected tooling routes are intentionally absent from the product
  // sidebar. Reuse an already hydrated Next Link so navigation stays inside
  // the current in-memory session instead of forcing a document reload.
  const hydratedLink = page.locator('a[href="/pacientes"]').first();
  await expect(hydratedLink).toBeVisible({ timeout: 120_000 });
  await hydratedLink.evaluate((element, route) => element.setAttribute('href', route), href);
  await page.locator(`a[href="${href}"]`).first().click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(href);
}
