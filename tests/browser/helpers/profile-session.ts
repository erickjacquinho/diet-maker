import { expect, type Page } from '@playwright/test';
import { confirmAndLogin, registerSyntheticAccount } from './online-account';
import { decryptProtectedSave, encryptProtectedSave } from '@/lib/infrastructure/crypto/protected-save';
import type { ProtectedSaveGrant } from '@/lib/domain/protected-save';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';

const grants = new WeakMap<Page, Promise<ProtectedSaveGrant>>();

function captureGrant(page: Page): void {
  page.on('response', (response) => {
    if (!response.ok() || !/\/api\/saves\/[^/]+\/authorize$/.test(new URL(response.url()).pathname)) return;
    grants.set(page, response.json().then(async (body) => {
      const bytes = Buffer.from(body.key as string, 'base64url');
      try {
        const key = await crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
        body.key = key;
        return body as ProtectedSaveGrant;
      } finally { bytes.fill(0); }
    }));
  });
}

export async function decryptBrowserSave(page: Page, content: string): Promise<BackupEnvelope> {
  const grant = grants.get(page);
  if (!grant) throw new Error('No synthetic save authorization was captured.');
  return decryptProtectedSave(content, await grant);
}

export async function encryptBrowserSave(page: Page, envelope: BackupEnvelope): Promise<string> {
  const grant = grants.get(page);
  if (!grant) throw new Error('No synthetic save authorization was captured.');
  return encryptProtectedSave(envelope, await grant);
}

export async function installProfileFileSystemFakes(page: Page, initialContent = ''): Promise<void> {
  await page.addInitScript(({ openContent }) => {
    const root = () => (navigator.storage as unknown as { getDirectory(): Promise<FileSystemDirectoryHandle> }).getDirectory();
    const testWindow = window as unknown as {
      showOpenFilePicker(): Promise<FileSystemFileHandle[]>;
      showSaveFilePicker(): Promise<FileSystemFileHandle>;
      __nutridietReadSave(): Promise<string>;
      __nutridietReadSource(): Promise<string>;
      __nutridietWritePending?: boolean;
      __nutridietReleaseWrite?: () => void;
    };
    const prototype = FileSystemFileHandle.prototype;
    const original = prototype.createWritable;
    prototype.createWritable = async function (options) {
      const stream = await original.call(this, options);
      if (this.name !== 'profile.nutridiet') return stream;
      const write = stream.write.bind(stream);
      const close = stream.close.bind(stream);
      stream.write = async (content) => {
        const key = 'nutridiet-e2e-write-attempts';
        localStorage.setItem(key, String(Number(localStorage.getItem(key) ?? '0') + 1));
        if (localStorage.getItem('nutridiet-e2e-fail-next-write') === '1') {
          localStorage.removeItem('nutridiet-e2e-fail-next-write');
          throw new Error('simulated file write failure');
        }
        if (localStorage.getItem('nutridiet-e2e-delay-next-write') === '1') {
          localStorage.removeItem('nutridiet-e2e-delay-next-write');
          testWindow.__nutridietWritePending = true;
          await new Promise<void>((resolve) => { testWindow.__nutridietReleaseWrite = resolve; });
          testWindow.__nutridietWritePending = false;
        }
        await write(content);
      };
      stream.close = async () => {
        await close();
        const key = 'nutridiet-e2e-write-successes';
        localStorage.setItem(key, String(Number(localStorage.getItem(key) ?? '0') + 1));
      };
      return stream;
    };
    testWindow.showSaveFilePicker = async () => (await root()).getFileHandle('profile.nutridiet', { create: true });
    testWindow.showOpenFilePicker = async () => {
      const handle = await (await root()).getFileHandle('fixture.nutridiet', { create: true });
      const stream = await original.call(handle);
      await stream.write(openContent);
      await stream.close();
      return [handle];
    };
    const read = async (name: string) => (await (await (await root()).getFileHandle(name)).getFile()).text();
    testWindow.__nutridietReadSave = () => read('profile.nutridiet');
    testWindow.__nutridietReadSource = () => read('fixture.nutridiet');
  }, { openContent: initialContent });
}

export async function createProfileSession(page: Page, displayName = 'Perfil de teste'): Promise<void> {
  await installProfileFileSystemFakes(page);
  await enterSaveDashboard(page);
  await page.getByRole('button', { name: 'Criar save' }).click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 120_000 });
  await page.getByLabel('Nome', { exact: true }).fill(displayName);
  await page.getByRole('button', { name: 'Salvar profile' }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 120_000 });
}

export async function enterSaveDashboard(page: Page): Promise<void> {
  captureGrant(page);
  const account = await registerSyntheticAccount(page);
  await confirmAndLogin(page, account.email, account.password);
}

export async function loadLegacyProfileSession(page: Page, content: string): Promise<string> {
  const originalAccountId = (JSON.parse(content) as BackupEnvelope).account[0].id;
  const source = content.replaceAll(JSON.stringify(originalAccountId), JSON.stringify(`legacy-${crypto.randomUUID()}`));
  await installProfileFileSystemFakes(page, source);
  await enterSaveDashboard(page);
  await page.getByRole('button', { name: 'Importar arquivo' }).click();
  await page.getByRole('button', { name: 'Proteger cópia importada' }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 120_000 });
  return source;
}

export async function openRememberedSave(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/saves$/, { timeout: 120_000 });
  await page.getByRole('button', { name: /^Abrir save / }).click();
  await expect(page).toHaveURL(/\/pacientes$/, { timeout: 120_000 });
}

export async function readPrimarySave(page: Page): Promise<{ content: string; attempts: number; successes: number }> {
  return page.evaluate(async () => ({
    content: await (window as unknown as { __nutridietReadSave(): Promise<string> }).__nutridietReadSave(),
    attempts: Number(localStorage.getItem('nutridiet-e2e-write-attempts') ?? '0'),
    successes: Number(localStorage.getItem('nutridiet-e2e-write-successes') ?? '0'),
  }));
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
