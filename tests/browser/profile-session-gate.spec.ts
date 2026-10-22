import { expect, test } from '@playwright/test';

const sessionReady = {
  user: { id: '6b8b607d-a5ae-4b40-8f5e-2c6e76bc8e42', email: 'ana@example.test' },
  profileComplete: true,
  destination: '/dashboard',
};

test('redirects an unauthenticated direct clinical route to login before showing the app shell', async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ status: 401, json: { user: null } }));
  await page.goto('/pacientes');
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
  await expect(page.getByRole('navigation')).not.toBeVisible();
});

test('shows the dashboard shell for an authenticated account without a save and keeps clinical routes gated', async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: sessionReady, headers: { 'cache-control': 'no-store' } }));
  await page.route('**/api/saves?*', (route) => route.fulfill({ json: { items: [], totalRows: 0, pageIndex: 0, pageSize: 50 } }));

  await page.goto('/home');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
  await expect(page.locator('[data-session-gate="restoring"]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();

  await page.goto('/pacientes');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Pacientes' })).toHaveCount(0);
});

test('routes an authenticated account without professional profile completion to the completion form', async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({
    json: { ...sessionReady, profileComplete: false, destination: '/criar-conta?completar=1' },
    headers: { 'cache-control': 'no-store' },
  }));

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/criar-conta\?completar=1$/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { name: 'Conclua seu cadastro' })).toBeVisible({ timeout: 30_000 });
});

test('keeps public landing outside account and clinical session hydration', async ({ page }) => {
  let accountRequests = 0;
  await page.route('**/api/auth/session', (route) => {
    accountRequests += 1;
    return route.fulfill({ json: sessionReady });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Landing page' })).toBeVisible();
  await expect(page.getByText(/pacientes|dietas clínicas/i)).toHaveCount(0);
  expect(accountRequests).toBe(0);
});
