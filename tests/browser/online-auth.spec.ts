import { expect, test, type Page } from '@playwright/test';
import { registerSyntheticAccount, submitAndWait, waitForAuthLink } from './helpers/online-account';

test.use({ trace: 'off' });
test.setTimeout(300_000);

async function fillResetPassword(page: Page, password: string): Promise<void> {
  await page.getByLabel('Nova senha', { exact: true }).fill(password);
  await page.getByLabel('Confirme a nova senha', { exact: true }).fill(password);
  const response = await submitAndWait(page, 'Alterar senha', '/api/auth/reset-password');
  expect(response.status()).toBe(200);
}

test('confirms an account, logs in, recovers and resets the password, rejects OTP replay, and logs out', async ({ page }) => {
  const { email, password } = await registerSyntheticAccount(page);
  const resetPassword = 'NutriDiet-E2E-Updated-2026!';

  await page.goto('/saves');
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });

  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  const unconfirmedLoginResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/auth/login');
  await page.getByRole('button', { name: 'Entrar' }).click();
  const unconfirmedLoginResponse = await unconfirmedLoginResponsePromise;
  const unconfirmedLoginBody = await unconfirmedLoginResponse.json() as { code?: string };
  expect(unconfirmedLoginBody.code).toBe('AUTH_REQUIRED');
  await expect(page.getByText('E-mail ou senha inválidos.', { exact: true })).toBeVisible();

  const confirmationLink = await waitForAuthLink(email, '/auth/confirm', page);
  await page.goto(confirmationLink);
  await expect(page).toHaveURL(/\/criar-conta\?confirmar=1$/);
  const confirmationResponse = await submitAndWait(page, 'Confirmar e-mail', '/api/auth/confirm-email');
  expect(confirmationResponse.status()).toBe(200);
  await expect(page.getByRole('status')).toContainText('E-mail confirmado', { timeout: 30_000 });

  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  const loginResponse = await submitAndWait(page, 'Entrar', '/api/auth/login');
  expect(loginResponse.status()).toBe(200);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();

  const sessionResponse = await page.request.get('/api/auth/session');
  expect(sessionResponse.ok()).toBe(true);
  const sessionBody = await sessionResponse.json() as Record<string, unknown>;
  expect(Object.keys(sessionBody).sort()).toEqual(['destination', 'profileComplete', 'user']);
  expect(JSON.stringify(sessionBody)).not.toMatch(/access_token|refresh_token|password/i);

  await page.goto('/recuperar-senha');
  await page.getByLabel('E-mail').fill(email);
  const recoveryResponse = await submitAndWait(page, 'Enviar instruções', '/api/auth/recovery');
  expect(recoveryResponse.status()).toBe(202);
  await expect(page.getByRole('status')).toContainText('Se o endereço puder receber uma recuperação', { timeout: 30_000 });

  const recoveryLink = await waitForAuthLink(email, '/auth/recovery', page);
  await page.goto(recoveryLink);
  await expect(page).toHaveURL(/\/redefinir-senha$/);
  await fillResetPassword(page, resetPassword);
  await expect(page.getByRole('status')).toContainText('Sua senha foi alterada');

  await page.goto(recoveryLink);
  await expect(page).toHaveURL(/\/redefinir-senha$/);
  const replayResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/auth/reset-password');
  await page.getByLabel('Nova senha', { exact: true }).fill('NutriDiet-E2E-Replayed-2026!');
  await page.getByLabel('Confirme a nova senha', { exact: true }).fill('NutriDiet-E2E-Replayed-2026!');
  await page.getByRole('button', { name: 'Alterar senha' }).click();
  const replayResponse = await replayResponsePromise;
  expect(replayResponse.status()).toBe(400);
  await expect(page.getByText('Este link expirou ou já foi usado. Solicite uma nova recuperação.', { exact: true })).toBeVisible();

  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  const oldPasswordResponse = await submitAndWait(page, 'Entrar', '/api/auth/login');
  expect(oldPasswordResponse.status()).toBe(401);
  await expect(page.getByText('E-mail ou senha inválidos.', { exact: true })).toBeVisible();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(resetPassword);
  const updatedPasswordResponse = await submitAndWait(page, 'Entrar', '/api/auth/login');
  expect(updatedPasswordResponse.status()).toBe(200);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  const logoutResponse = await submitAndWait(page, 'Sair', '/api/auth/logout');
  expect(logoutResponse.status()).toBe(204);
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get('/api/auth/session')).status()).toBe(401);
});
