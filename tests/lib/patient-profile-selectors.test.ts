import { describe, expect, it } from 'vitest';
import {
  buildNextEventSummary,
  selectActivePlan,
  selectLatestAssessment,
} from '@/lib/patientProfileSelectors';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_DIETS,
  PATIENT_PROFILE_MULTIPLE_ACTIVE_DIETS,
} from '../fixtures/patient-profile';

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
});
