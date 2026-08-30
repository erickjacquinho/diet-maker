import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DedicatedCarbCyclingPage from '@/app/pacientes/[id]/dieta/[dietaId]/ciclo/page';
import DietBuilderPage from '@/app/pacientes/[id]/dieta/[dietaId]/page';
import * as dietStore from '@/lib/dietStore';
import * as patientsStore from '@/lib/patientsStore';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'pat-1', dietaId: 'nova' }),
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

describe('Bidirectional Sync between /dieta/nova/ciclo and /dieta/nova', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(patientsStore, 'getPatientById').mockReturnValue(mockPatient);
  });

  it('saves configured variations in /ciclo and loads them seamlessly in /dieta/nova', () => {
    let storedDiets: dietStore.FullDietPlan[] = [];

    vi.spyOn(dietStore, 'getPatientDietsFromStorage').mockImplementation(() => storedDiets);
    vi.spyOn(dietStore, 'getDietFromStorage').mockImplementation((pid, did) => {
      return storedDiets.find((d) => d.patientId === pid && d.id === did) || null;
    });
    vi.spyOn(dietStore, 'saveDietToStorage').mockImplementation((plan) => {
      const existingIdx = storedDiets.findIndex((d) => d.id === plan.id);
      if (existingIdx >= 0) {
        storedDiets[existingIdx] = plan;
      } else {
        storedDiets.push(plan);
      }
      return plan;
    });

    // 1. Render dedicated cycle page for /dieta/nova/ciclo
    const { unmount: unmountCycle } = render(<DedicatedCarbCyclingPage />);

    // Select all days for the first variation with the Todos button
    const todosButtons = screen.getAllByRole('button', { name: /Todos/i });
    fireEvent.click(todosButtons[0]);

    // Save cycle settings
    const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/nova');
    unmountCycle();

    // 2. Render DietBuilderPage for /dieta/nova
    render(<DietBuilderPage />);

    // Mode is carb_cycling and variations are visible
    expect(screen.getByTestId('carb-cycling-variation-panel')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByText('Seg, Ter, Qua, Qui, Sex, Sáb, Dom')).toBeInTheDocument();
  });

  it('preserves draft from /dieta/nova when clicking Configurar Ciclo and opens /dieta/nova/ciclo', () => {
    let storedDiets: dietStore.FullDietPlan[] = [];

    vi.spyOn(dietStore, 'getPatientDietsFromStorage').mockImplementation(() => storedDiets);
    vi.spyOn(dietStore, 'getDietFromStorage').mockImplementation((pid, did) => {
      return storedDiets.find((d) => d.patientId === pid && d.id === did) || null;
    });
    vi.spyOn(dietStore, 'saveDietToStorage').mockImplementation((plan) => {
      const existingIdx = storedDiets.findIndex((d) => d.id === plan.id);
      if (existingIdx >= 0) {
        storedDiets[existingIdx] = plan;
      } else {
        storedDiets.push(plan);
      }
      return plan;
    });

    // 1. Render DietBuilderPage for /dieta/nova
    const { unmount: unmountBuilder } = render(<DietBuilderPage />);

    // Switch to carb cycling mode
    const cyclingTab = screen.getByRole('tab', { name: /Ciclo de Carboidratos/i });
    fireEvent.click(cyclingTab);

    // Click Configurar Ciclo
    const configButton = screen.getByRole('button', { name: /Configurar Ciclo/i });
    fireEvent.click(configButton);

    expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/nova/ciclo');
    expect(storedDiets.length).toBeGreaterThan(0);
    expect(storedDiets[0].mode).toBe('carb_cycling');
    unmountBuilder();

    // 2. Render DedicatedCarbCyclingPage
    render(<DedicatedCarbCyclingPage />);
    expect(screen.getByText('Configuração do Ciclo de Carboidratos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dia Alto Carbo')).toBeInTheDocument();
  });

  it('preserves added variations and edits when switching browser tabs (focus event) or variation tabs in /dieta/nova', () => {
    let storedDiets: dietStore.FullDietPlan[] = [];
    vi.spyOn(dietStore, 'getPatientDietsFromStorage').mockImplementation(() => storedDiets);
    vi.spyOn(dietStore, 'getDietFromStorage').mockImplementation((pid, did) => {
      return storedDiets.find((d) => d.patientId === pid && d.id === did) || null;
    });

    render(<DietBuilderPage />);

    // Switch to carb cycling mode
    const cyclingTab = screen.getByRole('tab', { name: /Ciclo de Carboidratos/i });
    fireEvent.click(cyclingTab);

    // Initial 3 variations are rendered
    expect(screen.getByTestId('carb-cycling-variation-panel')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByText('Dia Médio Carbo')).toBeInTheDocument();
    expect(screen.getByText('Dia Baixo Carbo')).toBeInTheDocument();

    // Click "Adicionar Dia"
    const addVariationBtn = screen.getByRole('button', { name: /Adicionar Dia/i });
    fireEvent.click(addVariationBtn);

    // Variação 4 should now be visible
    expect(screen.getByText('Variação 4')).toBeInTheDocument();

    // Simulate switching browser tab and returning (fires 'focus' event on window)
    window.dispatchEvent(new Event('focus'));

    // Variação 4 and all variations must still be present!
    expect(screen.getByText('Variação 4')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByText('Dia Médio Carbo')).toBeInTheDocument();
    expect(screen.getByText('Dia Baixo Carbo')).toBeInTheDocument();

    // Select another variation tab (e.g. Dia Médio Carbo)
    fireEvent.click(screen.getByText('Dia Médio Carbo'));

    // Again simulate tab switch / focus event
    window.dispatchEvent(new Event('focus'));

    // Variação 4 must still be preserved
    expect(screen.getByText('Variação 4')).toBeInTheDocument();
  });
});
