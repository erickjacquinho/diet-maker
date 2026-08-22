import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DedicatedCarbCyclingPage from '@/app/pacientes/[id]/dieta/[dietaId]/ciclo/page';
import * as dietStore from '@/lib/dietStore';
import * as patientsStore from '@/lib/patientsStore';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'pat-1', dietaId: 'diet-1' }),
  useRouter: () => ({
    push: mockPush,
  }),
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
    vi.spyOn(patientsStore, 'getPatientById').mockReturnValue(mockPatient);
    vi.spyOn(dietStore, 'getDietFromStorage').mockReturnValue(mockDietPlan);
  });

  it('renders dedicated page header, breadcrumbs, variations and actions', () => {
    render(<DedicatedCarbCyclingPage />);

    expect(screen.getByText('Configuração do Ciclo de Carboidratos')).toBeInTheDocument();
    expect(screen.getByText('Variações do Ciclo')).toBeInTheDocument();
    expect(screen.getAllByText('Maria Silva').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dia Baixo Carbo')).toBeInTheDocument();

    // Verify weekly average MetricBoxGroup is displayed
    expect(screen.getByText('Calorias')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
  });

  it('allows adding a new variation and saving back to the diet page', () => {
    const saveSpy = vi.spyOn(dietStore, 'saveDietToStorage').mockImplementation((d) => d);

    render(<DedicatedCarbCyclingPage />);

    // Add new variation
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Nova Variação ao Ciclo/i }));
    expect(screen.getByDisplayValue('Variação 3')).toBeInTheDocument();

    // Save and navigate back
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/i }));
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/diet-1');
  });

  it('allows selecting all days for a variation with the Todos button', () => {
    const saveSpy = vi.spyOn(dietStore, 'saveDietToStorage').mockImplementation((d) => d);

    render(<DedicatedCarbCyclingPage />);

    const allTodosButtons = screen.getAllByRole('button', { name: /Todos/i });
    expect(allTodosButtons.length).toBe(2);

    // Click "Todos" on the first variation
    fireEvent.click(allTodosButtons[0]);

    // Click Save
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/i }));
    expect(saveSpy).toHaveBeenCalledTimes(1);
    const savedPlan = saveSpy.mock.calls[0][0];
    expect(savedPlan.carbCyclingVariations[0].assignedDays).toEqual([
      'seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'
    ]);
  });

  it('restricts saving and disables save button when not all 7 days are distributed', () => {
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

    vi.spyOn(dietStore, 'getDietFromStorage').mockReturnValue(incompletePlan);
    const saveSpy = vi.spyOn(dietStore, 'saveDietToStorage');

    render(<DedicatedCarbCyclingPage />);

    const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/2\/7 dias distribuídos/i)).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('navigates directly when Cancelar is clicked without unsaved changes', () => {
    render(<DedicatedCarbCyclingPage />);

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/diet-1');
    expect(screen.queryByText(/Descartar alterações\?/i)).not.toBeInTheDocument();
  });

  it('opens guardrail alert modal when trying to exit with unsaved changes', () => {
    render(<DedicatedCarbCyclingPage />);

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

  it('triggers guardrail when clicking header back button with unsaved changes', () => {
    render(<DedicatedCarbCyclingPage />);

    // Add a variation
    const addButton = screen.getByRole('button', { name: /Adicionar Nova Variação ao Ciclo/i });
    fireEvent.click(addButton);

    // Click back button in PageContextHeader
    const backButton = screen.getByRole('button', { name: /Voltar para a prescrição/i });
    fireEvent.click(backButton);

    expect(screen.getByText(/Descartar alterações\?/i)).toBeInTheDocument();
  });

  it('handles copy and paste between variation cards correctly', () => {
    render(<DedicatedCarbCyclingPage />);

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
});
