import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { clinicLogo } from '../fixtures/clinic-logo';
import { enterSaveDashboard, installProfileFileSystemFakes } from './helpers/profile-session';

test.setTimeout(300_000);

function syntheticRoutineFixture(today: string) {
  const data = JSON.parse(readFileSync(resolve(process.cwd(), 'tests/fixtures/nutridiet/valid-jacques-regiani.nutridiet'), 'utf8')) as {
    account: Array<Record<string, unknown>>;
    patients: Array<Record<string, unknown>>;
    nextFollowUps: Array<Record<string, unknown>>;
  };
  const accountId = `legacy-${crypto.randomUUID()}`;
  const patientId = String(data.patients[0].id);
  data.account[0] = { ...data.account[0], id: accountId, displayName: 'Conta de rotina', phone: null };
  data.patients = data.patients.map((patient) => ({
    ...patient,
    accountId,
    name: 'Paciente da rotina',
    age: null,
    gender: '',
    birthDate: null,
    isPregnant: false,
    pregnancyDueDate: null,
    heightCm: null,
    weightKg: null,
    maritalStatus: null,
    phone: null,
    whatsapp: null,
    currentObjective: null,
    targetProtein: null,
    targetCarbs: null,
    targetFats: null,
    targetKcal: null,
  }));
  const timestamp = `${today}T12:00:00.000Z`;
  data.nextFollowUps = [{
    accountId,
    patientId,
    dueDate: today,
    type: 'DIET_UPDATE',
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  }];
  return { content: JSON.stringify(data) };
}

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
      await route.fulfill({ json: { items: [], totalRows: 0, canCreate: true } });
    } else {
      await route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    }
  });

  await page.goto('/dashboard');
  const openSaves = page.getByRole('button', { name: 'Abrir configurações de saves' });
  const manageSubscription = page.getByRole('button', { name: 'Gerenciar assinatura' });
  const settings = page.getByRole('dialog', { name: 'Configurações', exact: true });
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByText('Abra um save para consultar sua semana e próximas ações.')).toBeVisible();

  for (const width of [1024, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    await openSaves.click();
    await expect(page.getByRole('tab', { name: 'Saves', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(settings.getByText(/Nenhum arquivo associado ainda/)).toBeVisible();
    await expect(settings.getByRole('button', { name: 'Exportar backup' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const box = await settings.boundingBox();
    expect(box).not.toBeNull();
    await expect(settings.getByRole('button', { name: 'Sair', exact: true })).toHaveCount(0);
    const profileTab = settings.getByRole('tab', { name: 'Perfil profissional', exact: true });
    const savesTab = settings.getByRole('tab', { name: 'Saves', exact: true });
    const subscriptionTab = settings.getByRole('tab', { name: 'Assinatura', exact: true });
    if (width === 1024) {
      await savesTab.focus();
      await page.keyboard.press('ArrowRight');
      await expect(subscriptionTab).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowLeft');
      await expect(savesTab).toHaveAttribute('aria-selected', 'true');

      await profileTab.click();
      const name = settings.getByLabel(/^Nome/);
      await name.fill('Ana Rascunho');
      await subscriptionTab.click();
      await expect(settings.getByText('A gestão da assinatura estará disponível em breve.')).toBeVisible();
      await expect(settings.getByText('Aqui você poderá gerenciar plano, ciclo de cobrança, renovação automática, pagamento, faturas e cancelamento.')).toBeVisible();
      await expect(settings.getByRole('form')).toHaveCount(0);
      await expect(settings.getByRole('button', { name: /Salvar|Descartar alterações/ })).toHaveCount(0);
      await expect(settings.getByText(/R\$|pagamento pendente|fatura disponível/i)).toHaveCount(0);
      await profileTab.click();
      await expect(name).toHaveValue('Ana Rascunho');
      await settings.getByRole('button', { name: 'Descartar alterações' }).click();
    }
    for (const tab of [profileTab, savesTab, subscriptionTab]) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await expect.poll(async () => (await settings.boundingBox())!.height).toBeCloseTo(box!.height, 0);
    }
    await savesTab.click();
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

  await manageSubscription.click();
  await expect(settings.getByRole('tab', { name: 'Assinatura', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(settings).toBeHidden();
  await expect(manageSubscription).toBeFocused();
  await page.getByRole('button', { name: /Abrir menu de conta de/ }).click();
  await expect(page.getByRole('menuitem', { name: 'Sair', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 512, height: 450 });
  await manageSubscription.click();
  await expect(settings.getByRole('tab', { name: 'Assinatura', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('512px-200-percent-settings.png') });
  await settings.getByRole('button', { name: 'Fechar', exact: true }).click();
});

test('projects a synthetic imported profile into the weekly dashboard', async ({ page }) => {
  const saveApiResponses: string[] = [];
  const registration = { saveId: randomUUID(), localAccountId: '', keyId: randomUUID(), bindingProof: '' };
  const rawKey = Buffer.alloc(32, 7).toString('base64url');
  let ownerId = '';
  await page.route('**/api/saves', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    const input = route.request().postDataJSON() as { localAccountId: string };
    registration.localAccountId = input.localAccountId;
    registration.bindingProof = `v1:${registration.keyId}:${Buffer.alloc(32, 9).toString('base64url')}`;
    await route.fulfill({ status: 201, json: registration });
  });
  await page.route(/\/api\/saves\/[^/]+\/authorize$/, async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({ status: 200, json: {
      ...registration,
      ownerId,
      authorizedAt: Date.now(),
      expiresAt: Date.now() + 3_600_000,
      key: rawKey,
    } });
  });
  page.on('response', (response) => {
    const pathname = new URL(response.url()).pathname;
    if (pathname.startsWith('/api/saves')) saveApiResponses.push(`${response.request().method()} ${pathname} ${response.status()}`);
  });
  const today = await page.evaluate(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const fixture = syntheticRoutineFixture(today);
  await installProfileFileSystemFakes(page, fixture.content);
  await enterSaveDashboard(page);
  ownerId = await page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    const body = await response.json() as { user: { id: string } };
    return body.user.id;
  });
  await page.getByRole('button', { name: 'Abrir configurações de saves' }).click();
  const settings = page.getByRole('dialog', { name: 'Configurações', exact: true });
  await expect(settings.getByRole('tab', { name: 'Saves', exact: true })).toHaveAttribute('aria-selected', 'true');
  await settings.getByRole('button', { name: 'Importar arquivo' }).click();
  const protectCopy = settings.getByRole('button', { name: 'Proteger cópia importada' });
  await protectCopy.click();
  const actionError = settings.getByRole('alert').first();
  await expect.poll(async () => (await protectCopy.isHidden()) || (await actionError.isVisible()), { timeout: 30_000 }).toBe(true);
  if (await protectCopy.isVisible()) throw new Error(`The synthetic save could not be protected: ${await actionError.textContent()} [${saveApiResponses.join(', ')}]`);
  await settings.getByRole('button', { name: 'Fechar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Sua semana' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Próximas ações' })).toContainText('Paciente da rotina');
  await expect(page.getByRole('list', { name: 'Próximas ações' })).toContainText('Atualização de dieta');
  await expect(page.getByRole('list', { name: 'Semana corrente' }).getByLabel('1 acompanhamento')).toBeVisible();

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
      await route.fulfill({ json: { items: [], totalRows: 0, canCreate: true } });
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
