import { expect, type Page } from '@playwright/test';

const mailpitUrl = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324';
export const syntheticPassword = 'NutriDiet-E2E-Original-2026!';

interface MailpitMessage {
  ID: string;
  Subject?: string;
  [key: string]: unknown;
}

export async function registerSyntheticAccount(page: Page): Promise<{ email: string; password: string }> {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `192.0.2.${1 + Math.floor(Math.random() * 253)}` });
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
  await page.goto('/criar-conta');
  await page.getByLabel('Nome', { exact: true }).fill('Conta');
  await page.getByLabel('Sobrenome').fill('Sintética');
  await page.getByLabel('Média de pacientes por mês').fill('8.5');
  await page.getByRole('combobox', { name: 'Experiência profissional' }).click();
  await page.getByRole('option', { name: 'De 1 a 6 meses' }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Confirme o e-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(syntheticPassword);
  await page.getByLabel('Confirme a senha').fill(syntheticPassword);
  const signupResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/auth/signup');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  expect((await signupResponse).status()).toBe(202);
  await expect(page.getByRole('status')).toContainText('Se for possível usar este e-mail', { timeout: 30_000 });
  return { email, password: syntheticPassword };
}

export async function waitForAuthLink(email: string, route: '/auth/confirm' | '/auth/recovery', page: Page): Promise<string> {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const listResponse = await page.request.get(`${mailpitUrl}/api/v1/messages?limit=100`);
    if (!listResponse.ok()) throw new Error(`Mailpit returned ${listResponse.status()}.`);
    const list = await listResponse.json() as { messages?: MailpitMessage[] };
    const message = list.messages?.find((item) =>
      item.Subject?.toLowerCase().includes(route === '/auth/confirm' ? 'confirme' : 'redefina')
      && JSON.stringify(item).toLowerCase().includes(email.toLowerCase()));
    if (message) {
      const detailResponse = await page.request.get(`${mailpitUrl}/api/v1/message/${encodeURIComponent(message.ID)}`);
      if (!detailResponse.ok()) throw new Error(`Mailpit message returned ${detailResponse.status()}.`);
      const link = extractAuthLink(await detailResponse.json(), route);
      if (link) return link;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Timed out waiting for the synthetic ${route} message.`);
}

export async function confirmAndLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto(await waitForAuthLink(email, '/auth/confirm', page));
  await expect(page).toHaveURL(/\/criar-conta\?confirmar=1$/);
  expect((await submitAndWait(page, 'Confirmar e-mail', '/api/auth/confirm-email')).status()).toBe(200);
  await expect(page.getByRole('status')).toContainText('E-mail confirmado', { timeout: 30_000 });
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  expect((await submitAndWait(page, 'Entrar', '/api/auth/login')).status()).toBe(200);
  await expect(page).toHaveURL(/\/saves$/, { timeout: 30_000 });
}

export async function loginSyntheticAccount(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  expect((await submitAndWait(page, 'Entrar', '/api/auth/login')).status()).toBe(200);
  await expect(page).toHaveURL(/\/saves$/, { timeout: 30_000 });
}

export async function submitAndWait(page: Page, buttonName: string, route: string) {
  const response = page.waitForResponse((item) => new URL(item.url()).pathname === route);
  await page.getByRole('button', { name: buttonName }).click();
  return response;
}

function extractAuthLink(value: unknown, route: string): string | null {
  if (typeof value === 'string') {
    const candidate = value.replaceAll('&amp;', '&').match(/https?:\/\/[^\s"'<>]+/)?.[0];
    if (!candidate) return null;
    try {
      const url = new URL(candidate);
      const tokenHash = url.searchParams.get('token_hash');
      if (url.pathname !== route || !tokenHash) return null;
      if (route === '/auth/recovery' && url.searchParams.get('type') !== 'recovery') return null;
      return `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const link = extractAuthLink(entry, route);
      if (link) return link;
    }
  } else if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      const link = extractAuthLink(entry, route);
      if (link) return link;
    }
  }
  return null;
}
