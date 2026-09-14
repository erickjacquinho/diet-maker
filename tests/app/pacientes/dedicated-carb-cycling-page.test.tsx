import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DedicatedCarbCyclingPage from '@/app/pacientes/[id]/dieta/[dietaId]/ciclo/page';
import * as dietStore from '@/lib/dietStore';
import * as patientsStore from '@/lib/patientsStore';
import { toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'pat-1', dietaId: 'diet-1' }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

const canonicalPatient = {
  id: 'pat-1', accountId: 'account-a', displayCode: 'P-0001', name: 'Maria Silva', age: 28,
  gender: 'Feminino', heightCm: 165, weightKg: 65, maritalStatus: null, phone: null, whatsapp: null,
  currentObjective: 'Hipertrofia', defaultMacroTargets: { proteinG: 130, carbsG: 250, fatsG: 50, kcal: 2000 },
  createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z', version: 1, archivedAt: null,
};

const mockPatientApplication = {
  getPatientProfile: vi.fn().mockResolvedValue({ patient: canonicalPatient, initials: 'MS', availableObjectives: ['Hipertrofia'] }),
};
const mockDietApplication = {
  openEditor: vi.fn(), flushDraft: vi.fn().mockResolvedValue({ status: 'SAVED', revision: 2, updatedAt: '2026-08-30T00:00:00.000Z' }),
  saveDietAsActive: vi.fn().mockResolvedValue({ status: 'COMMITTED', draftId: 'draft-cycle', planId: 'diet-1', version: 1, message: 'Prescrição confirmada.' }),
};

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(mockPatientApplication),
  getBrowserDietApplication: () => Promise.resolve(mockDietApplication),
}));

const mockPatient = {
  id: 'pat-1',
  name: 'Maria Silva',
  initials: 'MS',
  gender: 'Feminino',
  age: 28,
  heightCm: 165,
  weightKg: 65,
  objective: 'Hipertrofia',
  targetKcal: 2000,
  targetProtein: 130,
  targetCarbs: 250,
  targetFats: 50,
  lastConsultation: '2026-08-01',
} as patientsStore.Patient;

const mockDietPlan = {
  id: 'diet-1',
  patientId: 'pat-1',
  name: 'Plano com Ciclo',
  mode: 'carb_cycling',
  carbCyclingVariationsCount: 2,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
  simpleMeals: [],
  simpleTargetKcal: 2000,
  simpleTargetProtein: 130,
  simpleTargetCarbs: 250,
  simpleTargetFats: 50,
  carbCyclingVariations: [
    {
      id: 'var-high',
      name: 'Dia Alto Carbo',
      type: 'high',
      assignedDays: ['seg', 'qua', 'sex'],
      targetKcal: 2200,
      targetProtein: 130,
      targetCarbs: 260,
      targetFats: 45,
      meals: [],
    },
    {
      id: 'var-low',
      name: 'Dia Baixo Carbo',
      type: 'low',
      assignedDays: ['ter', 'qui', 'sab', 'dom'],
      targetKcal: 1600,
      targetProtein: 130,
      targetCarbs: 100,
      targetFats: 45,
      meals: [],
    },
  ],
} as dietStore.FullDietPlan;

describe('Dedicated Carb Cycling Page (/pacientes/[id]/dieta/[dietaId]/ciclo)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatientApplication.getPatientProfile.mockResolvedValue({ patient: canonicalPatient, initials: 'MS', availableObjectives: ['Hipertrofia'] });
    mockDietApplication.openEditor.mockResolvedValue({
      draft: { draftId: 'draft-cycle', contextKey: 'account-a|pat-1|diet-1', accountId: 'account-a', patientId: 'pat-1', routeDietId: 'diet-1', payloadSchemaVersion: 1, draftRevision: 1, state: 'EDITABLE', baseDietId: 'diet-1', baseDietVersion: 1, payload: toEditableDocument(mockDietPlan), createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z' },
      isNew: false,
    });
  });

  it('renders dedicated page header, breadcrumbs, variations and actions', async () => {
    render(<DedicatedCarbCyclingPage />);

    expect(await screen.findByText('Configuração do Ciclo de Carboidratos')).toBeInTheDocument();
    expect(screen.getByText('Variações do Ciclo')).toBeInTheDocument();
    expect(screen.getAllByText('Maria Silva').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dia Baixo Carbo')).toBeInTheDocument();

    // Verify weekly average MetricBoxGroup is displayed
    expect(screen.getByText('Calorias')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
  });

  it('allows adding a new variation and saving back to the diet page', async () => {

    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    // Add new variation
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Nova Variação ao Ciclo/i }));
    expect(screen.getByDisplayValue('Variação 3')).toBeInTheDocument();

    // Save and navigate back
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/i }));
    await vi.waitFor(() => expect(mockDietApplication.flushDraft).toHaveBeenCalledTimes(1));
    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/diet-1');
  });

  it('allows selecting all days for a variation with the Todos button', async () => {

    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    const allTodosButtons = screen.getAllByRole('button', { name: /Todos/i });
    expect(allTodosButtons.length).toBe(2);

    // Click "Todos" on the first variation
    fireEvent.click(allTodosButtons[0]);

    // Click Save
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/i }));
    await vi.waitFor(() => expect(mockDietApplication.flushDraft).toHaveBeenCalledTimes(1));
    const savedDocument = mockDietApplication.flushDraft.mock.calls[0][1];
    expect(savedDocument.variations[0].assignedDays).toEqual([
      'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
    ]);
  });

  it('restricts saving and disables save button when not all 7 days are distributed', async () => {
    const incompletePlan = {
      ...mockDietPlan,
      carbCyclingVariations: [
        {
          id: 'var-1',
          name: 'Dia 1',
          type: 'high',
          assignedDays: ['seg', 'ter'], // only 2 days assigned
          targetKcal: 2000,
          targetProtein: 130,
          targetCarbs: 200,
          targetFats: 50,
          meals: [],
        },
      ],
    } as dietStore.FullDietPlan;

    mockDietApplication.openEditor.mockResolvedValueOnce({
      draft: { draftId: 'draft-incomplete', contextKey: 'account-a|pat-1|diet-1', accountId: 'account-a', patientId: 'pat-1', routeDietId: 'diet-1', payloadSchemaVersion: 1, draftRevision: 1, state: 'EDITABLE', payload: toEditableDocument(incompletePlan), createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z' }, isNew: false,
    });

    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/2\/7 dias distribuídos/i)).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(mockDietApplication.flushDraft).not.toHaveBeenCalled();
  });

  it('navigates directly when Cancelar is clicked without unsaved changes', async () => {
    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/diet-1');
    expect(screen.queryByText(/Descartar alterações\?/i)).not.toBeInTheDocument();
  });

  it('opens guardrail alert modal when trying to exit with unsaved changes', async () => {
    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    // Modify a variation name
    const nameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: 'Dia Hiper Carbo Modificado' } });

    // Click Cancelar
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    // Modal should appear
    expect(screen.getByText(/Descartar alterações\?/i)).toBeInTheDocument();
    expect(screen.getByText(/As alterações não salvas no ciclo/i)).toBeInTheDocument();

    // Click Continuar Editando
    const keepEditingButton = screen.getByRole('button', { name: /Continuar editando/i });
    fireEvent.click(keepEditingButton);
    expect(screen.queryByText(/As alterações não salvas no ciclo/i)).not.toBeInTheDocument();

    // Click Cancelar again and confirm exit
    fireEvent.click(cancelButton);
    const exitButton = screen.getByRole('button', { name: /Descartar e sair/i });
    fireEvent.click(exitButton);

    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/diet-1');
  });

  it('triggers guardrail when clicking header back button with unsaved changes', async () => {
    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    // Add a variation
    const addButton = screen.getByRole('button', { name: /Adicionar Nova Variação ao Ciclo/i });
    fireEvent.click(addButton);

    // Click back button in PageContextHeader
    const backButton = screen.getByRole('button', { name: /Voltar para a prescrição/i });
    fireEvent.click(backButton);

    expect(screen.getByText(/Descartar alterações\?/i)).toBeInTheDocument();
  });

  it('handles copy and paste between variation cards correctly', async () => {
    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    const copyButtons = screen.getAllByRole('button', { name: /Copiar valores/i });
    const pasteButtons = screen.getAllByRole('button', { name: /Colar valores/i });

    expect(copyButtons.length).toBe(2);
    expect(pasteButtons.length).toBe(2);

    // Paste buttons are initially disabled
    expect(pasteButtons[0]).toBeDisabled();
    expect(pasteButtons[1]).toBeDisabled();

    // Click Copy on variation 1 (Dia Alto Carbo: 260g carb, 2200 kcal)
    fireEvent.click(copyButtons[0]);

    // Paste buttons are now enabled
    expect(pasteButtons[0]).not.toBeDisabled();
    expect(pasteButtons[1]).not.toBeDisabled();

    // Click Paste on variation 2 (Dia Baixo Carbo)
    fireEvent.click(pasteButtons[1]);

    // Variation 2 now has 260g carb
    const carbInputs = screen.getAllByDisplayValue('260');
    expect(carbInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('limits macro inputs to at most 4 characters', async () => {
    render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    const protInput = screen.getAllByDisplayValue('130')[0]; // Dia Alto Carbo protein input
    fireEvent.change(protInput, { target: { value: '12345' } });

    // Should be truncated to 4 characters (1234)
    expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('12345')).not.toBeInTheDocument();
  });
});
