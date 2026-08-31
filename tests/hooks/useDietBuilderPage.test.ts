import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDietBuilderPage } from '@/hooks/useDietBuilderPage';
import * as dietStore from '@/lib/dietStore';
import * as patientsStore from '@/lib/patientsStore';
import { getBaseMealVariationId, getMealVariationContextKey, getMealVariationOptions } from '@/lib/mealVariations';
import type { DietMeal, FullDietPlan } from '@/lib/dietStore';
import { toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';
import { tacoSnapshotFixture } from '../fixtures/diets';

const mockPush = vi.fn();

const canonicalPatient = {
  id: 'patient-variations',
  accountId: 'account-a',
  displayCode: 'P-0001',
  name: 'Paciente Teste',
  age: 30,
  gender: 'Feminino',
  heightCm: 170,
  weightKg: 70,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 140, carbsG: 220, fatsG: 60, kcal: 2000 },
  createdAt: '2026-08-28T00:00:00.000Z',
  updatedAt: '2026-08-28T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};

const mockPatientApplication = {
  getPatientProfile: vi.fn().mockResolvedValue({ patient: canonicalPatient, initials: 'PT', availableObjectives: ['Manutenção'] }),
};

const mockDietApplication = {
  openEditor: vi.fn(),
  listPreviousDietSources: vi.fn().mockResolvedValue([]),
  autosaveDraft: vi.fn(),
  flushDraft: vi.fn(),
  saveDietAsActive: vi.fn(),
  discardDraft: vi.fn(),
  pullTargets: vi.fn(),
  pullCompleteDiet: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient-variations', dietaId: 'diet-variations' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(mockPatientApplication),
  getBrowserDietApplication: () => Promise.resolve(mockDietApplication),
}));

const patient = {
  id: 'patient-variations',
  name: 'Paciente Teste',
  initials: 'PT',
  weightKg: 70,
  targetKcal: 2000,
  targetProtein: 140,
  targetCarbs: 220,
  targetFats: 60,
} as patientsStore.Patient;

const createMeal = (id: string, suffix: string): DietMeal => ({
  id,
  name: 'Café da manhã',
  time: '08:00',
  items: [{ id: `${id}-base`, name: `Base ${suffix}`, quantityGrams: 50, protein: 7, carbs: 33, fats: 4, kcal: 196, snapshot: tacoSnapshotFixture } as DietMeal['items'][number]],
  variations: [{
    id: `${id}-variation-2`,
    items: [{ id: `${id}-extra`, name: `Opção ${suffix}`, quantityGrams: 170, protein: 9, carbs: 10, fats: 5, kcal: 121, snapshot: tacoSnapshotFixture } as DietMeal['items'][number]],
  }],
});

const dietPlan: FullDietPlan = {
  id: 'diet-variations',
  patientId: patient.id,
  name: 'Dieta de teste',
  createdAt: '28/08/2026',
  updatedAt: '28/08/2026',
  mode: 'carb_cycling',
  simpleTargetKcal: 0,
  simpleTargetProtein: 0,
  simpleTargetCarbs: 0,
  simpleTargetFats: 0,
  simpleMeals: [],
  carbCyclingVariations: [
    {
      id: 'day-high',
      name: 'Dia alto',
      type: 'high',
      targetKcal: 2000,
      targetProtein: 140,
      targetCarbs: 240,
      targetFats: 60,
      meals: [createMeal('meal-shared', 'alto')],
    },
    {
      id: 'day-low',
      name: 'Dia baixo',
      type: 'low',
      targetKcal: 1600,
      targetProtein: 140,
      targetCarbs: 120,
      targetFats: 60,
      meals: [createMeal('meal-shared', 'baixo')],
    },
  ],
};

describe('useDietBuilderPage meal variation context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatientApplication.getPatientProfile.mockResolvedValue({ patient: canonicalPatient, initials: 'PT', availableObjectives: ['Manutenção'] });
    mockDietApplication.openEditor.mockResolvedValue({
      draft: {
        draftId: 'draft-variations', contextKey: 'account-a|patient-variations|diet-variations', accountId: 'account-a', patientId: patient.id,
        routeDietId: 'diet-variations', payloadSchemaVersion: 1, draftRevision: 1, state: 'EDITABLE', payload: toEditableDocument(dietPlan),
        baseDietId: 'diet-variations', baseDietVersion: 1, createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z',
      },
      isNew: false,
    });
  });

  it('scopes active meal options by mode, day, and meal and resets to base on a new load', async () => {
    const { result } = renderHook(() => useDietBuilderPage());

    await waitFor(() => expect(result.current.dietPlan?.id).toBe('diet-variations'));

    const mealId = 'meal-shared';
    const highDay = dietPlan.carbCyclingVariations[0];
    const lowDay = dietPlan.carbCyclingVariations[1];
    const highVariationId = getMealVariationOptions(highDay.meals[0])[1].id;
    const lowVariationId = getMealVariationOptions(lowDay.meals[0])[1].id;
    const highKey = getMealVariationContextKey('carb_cycling', mealId, highDay.id);
    const lowKey = getMealVariationContextKey('carb_cycling', mealId, lowDay.id);

    act(() => {
      result.current.setActiveVariationId(highDay.id);
      result.current.handleSelectMealVariation(mealId, highVariationId);
    });

    expect(result.current.activeMealVariationIds[highKey]).toBe(highVariationId);
    expect(result.current.currentMeals[0].items[0].name).toBe('Opção alto');

    act(() => {
      result.current.setActiveVariationId(lowDay.id);
    });

    expect(result.current.currentMeals[0].items[0].name).toBe('Base baixo');
    expect(result.current.getActiveMealVariationId(mealId)).toBe(getBaseMealVariationId(mealId));

    act(() => {
      result.current.handleSelectMealVariation(mealId, lowVariationId);
    });

    expect(result.current.activeMealVariationIds).toMatchObject({
      [highKey]: highVariationId,
      [lowKey]: lowVariationId,
    });
    expect(result.current.currentMeals[0].items[0].name).toBe('Opção baixo');
  });
});
