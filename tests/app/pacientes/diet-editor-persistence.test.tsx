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
});
