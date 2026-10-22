import { expect, test } from '@playwright/test';
import { clinicLogo } from '../fixtures/clinic-logo';

test('manages saves inside Settings and returns from creation without stacking dialogs', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/session') {
      await route.fulfill({ json: { user: { id: 'a4d66df7-9bf7-431f-8686-11c4ae9d6e5d' }, profileComplete: true } });
    } else if (path === '/api/profile') {
      await route.fulfill({ json: {
        accountEmail: 'ana@example.invalid',
        profile: { firstName: 'Ana', lastName: 'Souza', averagePatientsPerMonth: 40, experience: { kind: 'years', value: 5 } },
      } });
    } else if (path === '/api/saves') {
      await route.fulfill({ json: { items: [], totalRows: 0 } });
    } else {
      await route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    }
  });

  await page.goto('/dashboard');
  const openSaves = page.getByRole('button', { name: 'Abrir configurações de saves' });
  const settings = page.getByRole('dialog', { name: 'Configurações', exact: true });
  await expect(page.getByRole('table')).toHaveCount(0);

  for (const width of [1024, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    await openSaves.click();
    await expect(page.getByRole('tab', { name: 'Saves', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(settings.getByText(/Nenhum arquivo associado ainda/)).toBeVisible();
    await expect(settings.getByRole('button', { name: 'Exportar backup' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const box = await settings.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: test.info().outputPath(`${width}-settings-saves.png`) });

    await settings.getByRole('button', { name: 'Criar save' }).click();
    const create = page.getByRole('dialog', { name: 'Criar profile', exact: true });
    await expect(create).toBeVisible();
    await expect(settings).toBeHidden();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await create.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(settings).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Saves', exact: true })).toHaveAttribute('aria-selected', 'true');
    await settings.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(openSaves).toBeFocused();
  }
});

test('persists reminder preferences and logo through the profile API and requests password recovery', async ({ page }) => {
  let persisted: Record<string, unknown> = { firstName: 'Ana', lastName: 'Souza', averagePatientsPerMonth: 40, experience: { kind: 'years', value: 5 } };
  let recovery: unknown;
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/session') {
      await route.fulfill({ json: { user: { id: 'a4d66df7-9bf7-431f-8686-11c4ae9d6e5d' }, profileComplete: true } });
    } else if (path === '/api/profile') {
      if (route.request().method() === 'PUT') {
        const { csrfToken: _csrf, ...profile } = route.request().postDataJSON();
        persisted = profile;
      }
      await route.fulfill({ json: { accountEmail: 'ana@example.invalid', profile: persisted } });
    } else if (path === '/api/auth/csrf') {
      await route.fulfill({ json: { csrfToken: 'A'.repeat(43) } });
    } else if (path === '/api/auth/recovery') {
      recovery = route.request().postDataJSON();
      await route.fulfill({ status: 202, json: {} });
    } else if (path === '/api/saves') {
      await route.fulfill({ json: { items: [], totalRows: 0 } });
    } else {
      await route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    }
  });
  const openProfile = async () => {
    await page.getByRole('button', { name: /Abrir menu de conta de/ }).click();
    await page.getByRole('menuitem', { name: 'Configurações' }).click();
  };

  await page.goto('/dashboard');
  await openProfile();
  const settings = page.getByRole('dialog', { name: 'Configurações', exact: true });
  await settings.getByRole('button', { name: 'Redefinir senha' }).click();
  await expect(settings.getByText('Se o endereço puder receber uma recuperação, as instruções serão enviadas.')).toBeVisible();
  expect(recovery).toEqual({ email: 'ana@example.invalid', csrfToken: 'A'.repeat(43) });

  await settings.getByRole('checkbox', { name: 'Exibir lembretes da agenda' }).uncheck();
  await settings.getByLabel('Logotipo do consultório', { exact: true }).setInputFiles({
    name: 'clinica.png', mimeType: 'image/png', buffer: Buffer.from(clinicLogo.slice(22), 'base64'),
  });
  await expect(settings.getByRole('img', { name: 'Prévia do logotipo do consultório' })).toBeVisible();
  await settings.getByRole('button', { name: 'Salvar perfil', exact: true }).click();
  await expect(settings.getByText('Perfil profissional atualizado.')).toBeVisible();
  expect(persisted).toMatchObject({ agendaRemindersEnabled: false, documentLogo: clinicLogo });
  await page.screenshot({ path: test.info().outputPath('profile-settings-logo.png') });

  await settings.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.reload();
  await openProfile();
  await expect(settings.getByRole('checkbox', { name: 'Exibir lembretes da agenda' })).not.toBeChecked();
  await expect(settings.getByRole('img', { name: 'Prévia do logotipo do consultório' })).toHaveAttribute('src', clinicLogo);
  await settings.getByRole('button', { name: 'Remover logotipo' }).click();
  await settings.getByRole('button', { name: 'Salvar perfil', exact: true }).click();
  await expect(settings.getByText('Perfil profissional atualizado.')).toBeVisible();
  expect(persisted.documentLogo).toBeNull();
});
