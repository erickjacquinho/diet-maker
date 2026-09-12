import { expect, test, type Locator, type Page } from '@playwright/test';

const assessmentFields = [
  ['Peso atual', '76'],
  ['Pescoço', '40'],
  ['Escápula', '100'],
  ['Busto', '95'],
  ['Cintura', '85'],
  ['Barriga', '90'],
  ['Quadril', '95'],
  ['Coxa proximal esquerda', '55'],
] as const;

function dateLabel(offsetDays: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString('pt-BR');
}

async function createPatient(page: Page, name: string): Promise<string> {
  const createPatientButton = page.getByRole('button', { name: /Cadastrar Primeiro Paciente|Novo paciente/ }).first();
  await expect(createPatientButton).toBeVisible({ timeout: 120_000 });
  await createPatientButton.evaluate((element) => (element as HTMLButtonElement).click());

  const createDialog = page.getByRole('dialog', { name: 'Cadastrar Novo Paciente' });
  await createDialog.getByLabel('Nome Completo').fill(name);
  await createDialog.getByRole('button', { name: /Salvar Paciente/ }).click();
  await expect(createDialog).toBeHidden({ timeout: 120_000 });

  const profileLink = page.getByRole('link', { name: `Ver perfil de ${name}` });
  await expect(profileLink).toBeVisible({ timeout: 120_000 });
  const href = await profileLink.getAttribute('href');
  expect(href).toMatch(/^\/pacientes\/[^/]+$/);
  return href as string;
}

async function fillAssessment(page: Page, weight: string): Promise<void> {
  for (const [label, initialValue] of assessmentFields) {
    await page.getByLabel(new RegExp(`^${label}`, 'i')).fill(label === 'Peso atual' ? weight : initialValue);
  }
}

async function saveAssessment(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Salvar Avaliação/ }).evaluate((element) => (element as HTMLButtonElement).click());
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil do paciente' })).toBeVisible({ timeout: 120_000 });
}

async function chooseDate(page: Page, container: Page | Locator, label: string): Promise<void> {
  await container.getByRole('button', { name: 'Data', exact: true }).click();
  const day = page.locator(`button[data-day="${label}"]`);
  await expect(day).toBeVisible({ timeout: 30_000 });
  await day.click();
}

async function saveFollowUp(page: Page, offsetDays: number, type: string): Promise<void> {
  const region = page.getByRole('region', { name: 'Próximo acompanhamento' });
  await region.getByRole('button', { name: /Definir acompanhamento|Reagendar/ }).click();
  const dialog = page.getByRole('dialog', { name: /Definir próximo acompanhamento|Reagendar acompanhamento/ });
  const label = dateLabel(offsetDays);
  await chooseDate(page, dialog, label);
  await dialog.getByRole('combobox', { name: 'Tipo', exact: true }).click();
  await page.getByRole('option', { name: type, exact: true }).click();
  await dialog.getByRole('button', { name: /^Salvar/ }).click();
  await expect(dialog).toBeHidden({ timeout: 120_000 });
  await expect(region).toContainText(label);
  await expect(region).toContainText(type);
}

async function holdToConfirm(page: Page, button: Locator): Promise<void> {
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1_700);
  await page.mouse.up();
}

test('persiste o ciclo clínico local completo e mantém a fronteira sem chaves legadas', async ({ page }) => {
  test.setTimeout(600_000);
  const patientOneName = `Paciente clínico ${Date.now()}`;
  const patientTwoName = `${patientOneName} isolado`;

  await page.goto('/pacientes', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible({ timeout: 120_000 });

  const patientOnePath = await createPatient(page, patientOneName);
  const patientOneId = patientOnePath.split('/').at(-1) as string;
  await createPatient(page, patientTwoName);

  await page.goto(patientOnePath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil do paciente' })).toBeVisible({ timeout: 120_000 });

  // Create two independent assessments on the same clinical date.
  await page.getByRole('link', { name: 'Nova Avaliação' }).click({ timeout: 120_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Nova Avaliação Antropométrica' })).toBeVisible({ timeout: 120_000 });
  const assessmentDate = await page.locator('#assessment-date').inputValue();
  await fillAssessment(page, '76');
  await saveAssessment(page);

  await page.getByRole('link', { name: 'Nova Avaliação' }).click({ timeout: 120_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Nova Avaliação Antropométrica' })).toBeVisible({ timeout: 120_000 });
  await fillAssessment(page, '80');
  await saveAssessment(page);

  const assessmentTable = page.getByRole('table', { name: 'Histórico de avaliações físicas e composição corporal' });
  await expect(page.getByText('2 avaliações', { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(assessmentTable).toContainText('76 kg');
  await expect(assessmentTable).toContainText('80 kg');

  // Edit only the selected row; the other confirmed row remains intact.
  const firstAssessmentRow = assessmentTable.getByRole('row').filter({ hasText: '76 kg' }).first();
  const firstAssessmentLink = firstAssessmentRow.getByRole('link', { name: 'Editar Avaliação Física' });
  const firstAssessmentPath = await firstAssessmentLink.getAttribute('href');
  expect(firstAssessmentPath).toMatch(/^\/pacientes\/[^/]+\/avaliacao\/[^/]+$/);
  await firstAssessmentLink.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Editar Avaliação Antropométrica' })).toBeVisible({ timeout: 120_000 });
  await page.getByLabel(/^Peso atual/i).fill('77');
  await saveAssessment(page);
  await expect(assessmentTable).toContainText('77 kg');
  await expect(assessmentTable).toContainText('80 kg');
  await expect(assessmentTable).not.toContainText('76 kg');

  // Optimistic version rejection is covered by the same canonical repository/application
  // exercised in the deterministic integration suites; the browser remains single-tab by design.
  // The UI journey below covers the corresponding successful edit and recovery-facing states.

  // The consultation is a read-only projection of both confirmed assessments on the same date.
  await page.goto(`${patientOnePath}/consulta/${assessmentDate.replace(/\//g, '-')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  await expect(page.getByRole('heading', { name: 'Avaliação Física & Antropometria' }).first()).toBeVisible({ timeout: 120_000 });
  await expect(page.locator('body')).toContainText('77 kg');
  await expect(page.locator('body')).toContainText('80 kg');
  await expect(page.locator('body')).toContainText('Sem observações registradas para esta consulta.');

  await page.goto(patientOnePath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  const followUpRegion = page.getByRole('region', { name: 'Próximo acompanhamento' });

  // Create, replace and remove the one allowed follow-up while checking list projections.
  await saveFollowUp(page, 2, 'Atualização de dieta');
  await page.goto('/pacientes', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  const patientOneRow = page.getByRole('row').filter({ hasText: patientOneName }).first();
  await expect(patientOneRow).toContainText('Em 2 dias');
  await expect(patientOneRow).toContainText('Atualização de dieta');

  await page.goto(patientOnePath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await saveFollowUp(page, 0, 'Atualização de avaliação');
  await page.goto('/pacientes', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.getByRole('row').filter({ hasText: patientOneName }).first()).toContainText('Hoje');

  await page.goto(patientOnePath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await saveFollowUp(page, -1, 'Atualização de avaliação');
  await page.goto('/pacientes', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.getByRole('row').filter({ hasText: patientOneName }).first()).toContainText('Atrasado há 1 dia');

  await page.goto(patientOnePath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await followUpRegion.getByRole('button', { name: 'Reagendar' }).click();
  const rescheduleDialog = page.getByRole('dialog', { name: 'Reagendar acompanhamento' });
  await rescheduleDialog.getByRole('button', { name: 'Remover data' }).click();
  const removeDialog = page.getByRole('dialog', { name: 'Remover acompanhamento?' });
  await holdToConfirm(page, removeDialog.getByRole('button', { name: 'Sim, remover' }));
  await expect(removeDialog).toBeHidden({ timeout: 120_000 });
  await expect(followUpRegion).toContainText('Não agendado');
  await expect(followUpRegion).toContainText('Sem próximo evento');

  // Archive preserves the historical rows but removes clinical mutation affordances.
  await page.getByRole('button', { name: 'Arquivar Paciente' }).click();
  const archiveDialog = page.getByRole('dialog', { name: /Confirmar arquivamento do paciente/ });
  await holdToConfirm(page, archiveDialog.getByRole('button', { name: /Pressione e segure.*arquivar/i }));
  await expect(page).toHaveURL(/\/pacientes$/);

  await page.goto(patientOnePath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.getByText('Este paciente está arquivado.', { exact: false })).toBeVisible({ timeout: 120_000 });
  const archivedAssessmentTable = page.getByRole('table', { name: 'Histórico de avaliações físicas e composição corporal' });
  await expect(archivedAssessmentTable).toContainText('77 kg');
  await expect(archivedAssessmentTable).toContainText('80 kg');
  await expect(page.getByRole('link', { name: 'Nova Avaliação' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Definir acompanhamento|Reagendar/ })).toHaveCount(0);

  // A second patient never receives the first patient's clinical rows.
  await page.goto('/pacientes', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  const patientTwoLink = page.getByRole('link', { name: `Ver perfil de ${patientTwoName}` });
  await expect(patientTwoLink).toBeVisible({ timeout: 120_000 });
  const patientTwoPath = await patientTwoLink.getAttribute('href');
  expect(patientTwoPath).toBeTruthy();
  await patientTwoLink.click();
  const isolatedAssessmentTable = page.getByRole('table', { name: 'Histórico de avaliações físicas e composição corporal' });
  await expect(isolatedAssessmentTable).toContainText('Nenhuma avaliação física registrada');
  await expect(isolatedAssessmentTable).not.toContainText('77 kg');
  await expect(page.getByRole('region', { name: 'Próximo acompanhamento' })).toContainText('Sem próximo evento');

  const legacyKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => /nutridiet_(?:patients|assessments_)/i.test(key)));
  expect(legacyKeys).toEqual([]);

  await page.context().setOffline(true);
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);
  await page.context().setOffline(false);

  // Keep the id in the journey so the URL is asserted as a patient-scoped route.
  expect(patientOneId).toBeTruthy();
});
