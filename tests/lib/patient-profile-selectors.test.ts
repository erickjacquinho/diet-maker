import { describe, expect, it } from 'vitest';
import {
  buildNextEventSummary,
  buildPatientDietHistory,
  selectActivePlan,
  selectLatestAssessment,
} from '@/lib/patientProfileSelectors';
import type { FullDietPlan } from '@/lib/dietStore';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_DIETS,
  PATIENT_PROFILE_MULTIPLE_ACTIVE_DIETS,
} from '../fixtures/patient-profile';
import type { StoredDietRecord } from '@/lib/patientsStore';

describe('patient profile selectors', () => {
  it('selects the latest physical assessment across ISO and pt-BR dates', () => {
    expect(selectLatestAssessment(PATIENT_PROFILE_ASSESSMENTS)?.id).toBe('assessment-latest');
  });

  it('selects an active diet instead of the patient manual targets', () => {
    const plan = selectActivePlan(PATIENT_PROFILE_DIETS);

    expect(plan).toMatchObject({
      dietId: 'diet-current',
      name: 'Plano cutting agosto',
      targetKcal: 2020,
      proteinG: 150,
      carbsG: 220,
      fatsG: 60,
      status: 'Ativa',
    });
  });

  it('uses the most recent active diet and keeps the first item on a date tie', () => {
    expect(selectActivePlan(PATIENT_PROFILE_MULTIPLE_ACTIVE_DIETS)?.dietId).toBe('diet-active-new');

    expect(selectActivePlan([
      PATIENT_PROFILE_MULTIPLE_ACTIVE_DIETS[1],
      PATIENT_PROFILE_MULTIPLE_ACTIVE_DIETS[1],
    ])?.dietId).toBe('diet-active-new');
  });

  it('returns no active plan when the history only contains historical diets', () => {
    expect(selectActivePlan([{ ...PATIENT_PROFILE_DIETS[0] }])).toBeNull();
    expect(selectActivePlan([])).toBeNull();
  });

  it('keeps the empty follow-up state explicit and summarizes a scheduled event', () => {
    expect(buildNextEventSummary(null)).toBeNull();
    expect(buildNextEventSummary({ date: '2026-08-12', type: 'diet-update' })).toEqual({
      date: '12/08/2026',
      label: 'Atualização de dieta',
    });
  });

  it('maps carb cycling plans to a weighted weekly history summary', () => {
    const cycle: FullDietPlan = {
      id: 'diet-cycle',
      patientId: 'patient-1',
      name: 'Ciclo de Carboidratos',
      createdAt: '20/08/2026',
      updatedAt: '20/08/2026',
      mode: 'carb_cycling',
      simpleTargetKcal: 0,
      simpleTargetProtein: 0,
      simpleTargetCarbs: 0,
      simpleTargetFats: 0,
      simpleMeals: [],
      carbCyclingVariations: [
        {
          id: 'high',
          name: 'Dia Alto Carbo',
          type: 'high',
          assignedDays: ['seg', 'qua', 'sex'],
          targetKcal: 2300,
          targetProtein: 180,
          targetCarbs: 260,
          targetFats: 55,
          meals: [{ id: 'meal-high', name: 'Café', time: '08:00', items: [] }],
        },
        {
          id: 'low',
          name: 'Dia Baixo Carbo',
          type: 'low',
          assignedDays: ['ter', 'qui', 'sab', 'dom'],
          targetKcal: 1950,
          targetProtein: 180,
          targetCarbs: 150,
          targetFats: 55,
          meals: [],
        },
      ],
    };

    const [history] = buildPatientDietHistory([cycle as unknown as StoredDietRecord]);

    expect(history).toMatchObject({
      id: 'diet-cycle',
      mode: 'carb_cycling',
      targetKcal: 2100,
      proteinG: 180,
      carbsG: 197,
      fatsG: 55,
    });
    expect(history.carbCyclingVariations).toEqual([
      expect.objectContaining({
        id: 'high',
        name: 'Dia Alto Carbo',
        assignedDays: ['seg', 'qua', 'sex'],
        targetKcal: 2300,
        proteinG: 180,
        carbsG: 260,
        fatsG: 55,
        mealsCount: 1,
      }),
      expect.objectContaining({
        id: 'low',
        assignedDays: ['ter', 'qui', 'sab', 'dom'],
        mealsCount: 0,
      }),
    ]);
  });
});
