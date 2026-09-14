import { expect, test } from '@playwright/test';

test('redirects a direct internal route to the public onboarding', async ({ page }) => {
  await page.goto('/pacientes');
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('navigation')).not.toBeVisible();
});
