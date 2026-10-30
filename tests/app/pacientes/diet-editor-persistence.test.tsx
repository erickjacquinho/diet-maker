import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DietBuilderPage from '@/app/pacientes/[id]/dieta/[dietaId]/page';
import { createInitialDietPlan } from '@/lib/dietStore';
import type { FullDietPlan } from '@/lib/dietStore';
import { toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';
import { tacoSnapshotFixture } from '../../fixtures/diets';

const router = { push: vi.fn() };
const patientId = 'patient-editor';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: patientId, dietaId: 'nova' }),
  useRouter: () => router,
}));

const patientApplication = {
  getPatientProfile: vi.fn(),
};

const dietApplication = {
  openEditor: vi.fn(),
  listPreviousDietSources: vi.fn(),
  autosaveDraft: vi.fn(),
  flushDraft: vi.fn(),
  saveDietAsActive: vi.fn(),
  discardDraft: vi.fn(),
};

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(patientApplication),
  getBrowserDietApplication: () => Promise.resolve(dietApplication),
  getBrowserProfileSession: () => ({
    isReady: () => true,
  }),
}));

const canonicalPatient = {
  id: patientId,
  accountId: 'account-editor',
  displayCode: 'P-0001',
  name: 'Paciente Editor',
  age: 30,
  gender: 'Feminino',
  heightCm: 165,
  weightKg: 64,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 120, carbsG: 180, fatsG: 55, kcal: 1655 },
  createdAt: '2026-08-30T00:00:00.000Z',
  updatedAt: '2026-08-30T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};

const plan = createInitialDietPlan(patientId, {
  weightKg: 64,
  targetKcal: 1655,
  targetProtein: 120,
  targetCarbs: 180,
  targetFats: 55,
}) as FullDietPlan;
plan.simpleMeals = [{
  id: 'meal-editor',
  name: 'Almoço',
  time: '12:00',
  items: [{
    id: 'item-editor',
    name: 'Arroz, tipo 1, cozido',
    quantityGrams: 100,
    protein: 2.5,
    carbs: 28.1,
    fats: 0.2,
    kcal: 128,
    snapshot: tacoSnapshotFixture,
  } as unknown as FullDietPlan['simpleMeals'][number]['items'][number]],
}];

function configureApplication() {
  patientApplication.getPatientProfile.mockResolvedValue({
    patient: canonicalPatient,
    initials: 'PE',
    availableObjectives: ['Manutenção'],
  });
  dietApplication.openEditor.mockResolvedValue({
    draft: {
      draftId: 'draft-editor',
      contextKey: `account-editor|${patientId}|nova`,
      accountId: 'account-editor',
      patientId,
      routeDietId: 'nova',
      payloadSchemaVersion: 1,
      draftRevision: 1,
      state: 'EDITABLE',
      payload: toEditableDocument(plan),
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    },
    isNew: true,
  });
  dietApplication.listPreviousDietSources.mockResolvedValue([]);
  dietApplication.autosaveDraft.mockResolvedValue({ status: 'SAVED', revision: 2, updatedAt: '2026-08-30T00:00:01.000Z' });
  dietApplication.flushDraft.mockResolvedValue({ status: 'SAVED', revision: 2, updatedAt: '2026-08-30T00:00:01.000Z' });
  dietApplication.saveDietAsActive.mockResolvedValue({
    status: 'COMMITTED',
    draftId: 'draft-editor',
    planId: 'diet-editor',
    version: 1,
    message: 'Prescrição confirmada.',
  });
}

describe('diet editor persistence boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureApplication();
  });

  it('flushes the current draft before confirming and navigates after durability', async () => {
    render(<DietBuilderPage />);

    const saveButton = await screen.findByRole('button', { name: 'Salvar Prescrição' });
    fireEvent.click(saveButton);

    await waitFor(() => expect(dietApplication.saveDietAsActive).toHaveBeenCalledWith('draft-editor', 2));
    expect(dietApplication.flushDraft).toHaveBeenCalledWith('draft-editor', expect.objectContaining({
      name: 'Prescrição Alimentar',
      mode: 'SIMPLE',
    }));
    expect(router.push).toHaveBeenCalledWith(`/pacientes/${patientId}`);
  });

  it('flushes before leaving through the contextual back action', async () => {
    render(<DietBuilderPage />);

    const backButton = await screen.findByRole('button', { name: `Voltar para a ficha de ${canonicalPatient.name}` });
    fireEvent.click(backButton);

    await waitFor(() => expect(dietApplication.flushDraft).toHaveBeenCalledWith('draft-editor', expect.any(Object)));
    expect(router.push).toHaveBeenCalledWith(`/pacientes/${patientId}`);
  });

  it('keeps the editor open when the back flush is superseded', async () => {
    dietApplication.flushDraft.mockResolvedValue({ status: 'SUPERSEDED', currentRevision: 3 });
    render(<DietBuilderPage />);

    fireEvent.click(await screen.findByRole('button', { name: `Voltar para a ficha de ${canonicalPatient.name}` }));

    await waitFor(() => expect(dietApplication.flushDraft).toHaveBeenCalled());
    expect(router.push).not.toHaveBeenCalled();
  });

  it('keeps the editor open when the back flush throws', async () => {
    dietApplication.flushDraft.mockRejectedValue(new Error('armazenamento indisponível'));
    render(<DietBuilderPage />);

    fireEvent.click(await screen.findByRole('button', { name: `Voltar para a ficha de ${canonicalPatient.name}` }));

    await waitFor(() => expect(dietApplication.flushDraft).toHaveBeenCalled());
    expect(router.push).not.toHaveBeenCalled();
  });

  it('blocks cycle-matrix navigation unless the flush returns SAVED', async () => {
    dietApplication.flushDraft.mockResolvedValue({ status: 'INVALIDATED' });
    render(<DietBuilderPage />);

    fireEvent.click(await screen.findByRole('button', { name: /ciclo de carboidratos/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Configurar Ciclo' }));

    await waitFor(() => expect(dietApplication.flushDraft).toHaveBeenCalled());
    expect(router.push).not.toHaveBeenCalled();
  });

  it('opens the cycle matrix after the current draft is saved', async () => {
    render(<DietBuilderPage />);

    fireEvent.click(await screen.findByRole('button', { name: /ciclo de carboidratos/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Configurar Ciclo' }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith(`/pacientes/${patientId}/dieta/nova/ciclo`));
  });

  it('keeps PDF preview gated when the local flush throws', async () => {
    dietApplication.flushDraft.mockRejectedValue(new Error('falha no draft'));
    render(<DietBuilderPage />);

    const exportButton = await screen.findByRole('button', { name: /exportar dieta/i });
    fireEvent.pointerDown(exportButton, { button: 0, pointerType: 'mouse' });
    fireEvent.click(exportButton);
    fireEvent.click(await screen.findByRole('menuitem', { name: /pdf/i }));

    await waitFor(() => expect(dietApplication.flushDraft).toHaveBeenCalled());
    expect(router.push).not.toHaveBeenCalled();
  });

  it('keeps page preview gated and explains a superseded flush', async () => {
    dietApplication.flushDraft.mockResolvedValue({ status: 'SUPERSEDED', currentRevision: 3 });
    render(<DietBuilderPage />);

    const exportButton = await screen.findByRole('button', { name: /exportar dieta/i });
    fireEvent.pointerDown(exportButton, { button: 0, pointerType: 'mouse' });
    fireEvent.click(exportButton);
    fireEvent.click(await screen.findByRole('menuitem', { name: /exportar como página externa/i }));
    fireEvent.click(await screen.findByRole('button', { name: /abrir prévia local/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível preparar o rascunho. Tente novamente.');
    expect(router.push).not.toHaveBeenCalled();
  });
});
