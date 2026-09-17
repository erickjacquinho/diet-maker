import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DedicatedCarbCyclingPage from '@/app/pacientes/[id]/dieta/[dietaId]/ciclo/page';
import DietBuilderPage from '@/app/pacientes/[id]/dieta/[dietaId]/page';
import * as patientsStore from '@/lib/patientsStore';
import { createInitialDietPlan, type FullDietPlan } from '@/lib/dietStore';
import { fromEditableDocument, toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';

const mockPush = vi.fn();
let storedDiets: FullDietPlan[] = [];
let initialMode: FullDietPlan['mode'] = 'carb_cycling';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'pat-1', dietaId: 'nova' }),
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
  openEditor: vi.fn().mockImplementation(async (patientId: string, routeDietId: string) => {
    const stored = storedDiets.find((diet) => diet.patientId === patientId && diet.id === routeDietId) ?? null;
    const plan = stored ?? { ...createInitialDietPlan(patientId, { weightKg: 65 }), id: routeDietId, mode: initialMode };
    return {
      draft: { draftId: `draft-${routeDietId}`, contextKey: `account-a|${patientId}|${routeDietId}`, accountId: 'account-a', patientId, routeDietId, payloadSchemaVersion: 1, draftRevision: 1, state: 'EDITABLE' as const, payload: toEditableDocument(plan), createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z' },
      isNew: !stored,
    };
  }),
  autosaveDraft: vi.fn().mockResolvedValue({ status: 'SAVED' as const, revision: 2, updatedAt: '2026-08-30T00:00:00.000Z' }),
  flushDraft: vi.fn().mockImplementation(async (_draftId: string, document: ReturnType<typeof toEditableDocument>) => {
    const plan = fromEditableDocument(document, 'pat-1', 'nova', '2026-08-01T00:00:00.000Z', '2026-08-30T00:00:00.000Z');
    const existingIndex = storedDiets.findIndex((diet) => diet.id === plan.id);
    if (existingIndex >= 0) storedDiets[existingIndex] = plan;
    else storedDiets.push(plan);
    return { status: 'SAVED' as const, revision: 2, updatedAt: '2026-08-30T00:00:00.000Z' };
  }),
  listPreviousDietSources: vi.fn().mockResolvedValue([]),
};

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(mockPatientApplication),
  getBrowserDietApplication: () => Promise.resolve(mockDietApplication),
  getBrowserLibraryApplication: () => Promise.resolve({
    listCustomFoods: vi.fn().mockResolvedValue([]),
    listRecipes: vi.fn().mockResolvedValue([]),
    listReadyMeals: vi.fn().mockResolvedValue([]),
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
    storedDiets = [];
    initialMode = 'carb_cycling';
    vi.spyOn(patientsStore, 'getPatientById').mockReturnValue(mockPatient);
  });

  it('saves configured variations in /ciclo and loads them seamlessly in /dieta/nova', async () => {
    // 1. Render dedicated cycle page for /dieta/nova/ciclo
    const { unmount: unmountCycle } = render(<DedicatedCarbCyclingPage />);
    await screen.findByText('Configuração do Ciclo de Carboidratos');

    // Select all days for the first variation with the Todos button
    const todosButtons = screen.getAllByRole('button', { name: /Todos/i });
    fireEvent.click(todosButtons[0]);

    // Save cycle settings
    const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await vi.waitFor(() => expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/nova'));
    unmountCycle();

    // 2. Render DietBuilderPage for /dieta/nova
    render(<DietBuilderPage />);
    await screen.findByTestId('carb-cycling-variation-panel');

    // Mode is carb_cycling and variations are visible
    expect(screen.getByTestId('carb-cycling-variation-panel')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByText('Seg, Ter, Qua, Qui, Sex, Sáb, Dom')).toBeInTheDocument();
  });

  it('preserves draft from /dieta/nova when clicking Configurar Ciclo and opens /dieta/nova/ciclo', async () => {
    // 1. Render DietBuilderPage for /dieta/nova
    const { unmount: unmountBuilder } = render(<DietBuilderPage />);
    await screen.findByRole('button', { name: /Ciclo de Carboidratos/i });

    // Switch to carb cycling mode
    const cyclingTab = screen.getByRole('button', { name: /Ciclo de Carboidratos/i });
    fireEvent.click(cyclingTab);

    // Click Configurar Ciclo
    const configButton = screen.getByRole('button', { name: /Configurar Ciclo/i });
    fireEvent.click(configButton);

    await vi.waitFor(() => expect(mockPush).toHaveBeenCalledWith('/pacientes/pat-1/dieta/nova/ciclo'));
    await vi.waitFor(() => expect(storedDiets.length).toBeGreaterThan(0));
    expect(storedDiets[0].mode).toBe('carb_cycling');
    unmountBuilder();

    // 2. Render DedicatedCarbCyclingPage
    render(<DedicatedCarbCyclingPage />);
    expect(await screen.findByText('Configuração do Ciclo de Carboidratos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dia Alto Carbo')).toBeInTheDocument();
  });

  it('preserves added variations and edits when switching browser tabs (focus event) or variation tabs in /dieta/nova', async () => {
    render(<DietBuilderPage />);
    await screen.findByRole('button', { name: /Ciclo de Carboidratos/i });

    // Switch to carb cycling mode
    const cyclingTab = screen.getByRole('button', { name: /Ciclo de Carboidratos/i });
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

  it('creates a meal without opening the food picker, which remains optional', async () => {
    render(<DietBuilderPage />);
    await screen.findByRole('button', { name: /Ciclo de Carboidratos/i });

    fireEvent.click(screen.getByRole('button', { name: /Ciclo de Carboidratos/i }));
    fireEvent.click(screen.getByText('Dia Médio Carbo'));

    const mealsRegion = screen.getByRole('region', { name: 'Refeições' });
    fireEvent.click(within(mealsRegion).getByRole('button', { name: 'Nova Refeição' }));

    expect(await within(mealsRegion).findByDisplayValue('Refeição 1')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(within(mealsRegion).getByRole('button', { name: 'Adicionar Alimento' }));
    expect(await screen.findByText('Adicionar à Refeição "Refeição 1"')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.click(screen.getByText('Dia Alto Carbo'));
    expect(within(screen.getByRole('region', { name: 'Refeições' })).getByText('Nenhuma Refeição Cadastrada')).toBeInTheDocument();
  });

  it('creates a meal after switching a simple diet to carb cycling', async () => {
    initialMode = 'simple';
    render(<DietBuilderPage />);
    await screen.findByRole('button', { name: /Ciclo de Carboidratos/i });

    fireEvent.click(screen.getByRole('button', { name: /Ciclo de Carboidratos/i }));

    const mealsRegion = screen.getByRole('region', { name: 'Refeições' });
    fireEvent.click(within(mealsRegion).getByRole('button', { name: 'Nova Refeição' }));

    expect(await within(mealsRegion).findByDisplayValue('Refeição 1')).toBeInTheDocument();
    fireEvent.click(within(mealsRegion).getByRole('button', { name: 'Nova Refeição' }));
    expect(await within(mealsRegion).findByDisplayValue('Refeição 2')).toBeInTheDocument();
  });
});
