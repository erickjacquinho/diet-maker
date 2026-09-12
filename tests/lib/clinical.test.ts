import { describe, expect, it } from 'vitest';
import {
  ClinicalApplicationError,
  buildBodyAssessment,
  getFollowUpStatus,
  normalizePairedMeasurements,
  normalizeClinicalDate,
  sortAssessments,
  validateNextFollowUpInput,
} from '@/lib/domain/clinical';
import { calculateBodyComposition } from '@/lib/bodyFat';
import { CLINICAL_ASSESSMENT_INPUT, makeClinicalAssessment } from '../fixtures/clinical';

const patient = {
  id: 'patient-alpha-active',
  accountId: 'account-alpha',
  gender: 'Feminino',
  heightCm: 165,
  archivedAt: null,
};

describe('clinical domain', () => {
  it('normalizes a single-sided measurement without overwriting explicit values', () => {
    const normalized = normalizePairedMeasurements({
      ...CLINICAL_ASSESSMENT_INPUT,
      rightArmCm: 29,
      rightProximalThighCm: undefined,
    });

    expect(normalized.leftArmCm).toBe(28);
    expect(normalized.rightArmCm).toBe(29);
    expect(normalized.rightProximalThighCm).toBe(55);
  });

  it('normalizes civil dates without applying a timezone offset', () => {
    expect(normalizeClinicalDate('11/09/2026')).toBe('2026-09-11');
    expect(normalizeClinicalDate('2026-09-11')).toBe('2026-09-11');
    expect(normalizeClinicalDate('2026-02-31')).toBeNull();
  });

  it('creates a confirmed assessment from authoritative patient data and current input', () => {
    const result = buildBodyAssessment(CLINICAL_ASSESSMENT_INPUT, {
      accountId: patient.accountId,
      patientId: patient.id,
      patient,
      id: 'assessment-created',
      now: () => '2026-09-11T12:00:00.000Z',
    });

    expect(result).toMatchObject({
      id: 'assessment-created',
      accountId: 'account-alpha',
      patientId: 'patient-alpha-active',
      clinicalDate: '2026-09-10',
      calculationMethod: 'US_NAVY',
      version: 1,
    });
    expect(result.bodyFatPercent).toBeGreaterThan(0);
    expect(result.calculationInputSnapshot.heightCm).toBe(165);
    expect(result.autoFilledFields).toContain('rightArmCm');
    expect(result.rightArmCm).toBe(28);
  });

  it('uses the previous assessment only for missing optional measurements', () => {
    const result = buildBodyAssessment(
      { ...CLINICAL_ASSESSMENT_INPUT, neckCm: undefined, leftCalfCm: undefined },
      {
        accountId: patient.accountId,
        patientId: patient.id,
        patient,
        previousAssessment: makeClinicalAssessment({ neckCm: 35, leftCalfCm: 36, rightCalfCm: 36 }),
        id: 'assessment-with-assistance',
        now: () => '2026-09-11T12:00:00.000Z',
      },
    );

    expect(result.neckCm).toBe(35);
    expect(result.leftCalfCm).toBe(36);
    expect(result.autoFilledFields).toEqual(expect.arrayContaining(['neckCm', 'leftCalfCm']));
  });

  it('rejects invalid clinical input without producing a partial record', () => {
    expect(() => buildBodyAssessment(
      { ...CLINICAL_ASSESSMENT_INPUT, weightKg: 0 },
      {
        accountId: patient.accountId,
        patientId: patient.id,
        patient,
        id: 'invalid',
        now: () => '2026-09-11T12:00:00.000Z',
      },
    )).toThrowError(ClinicalApplicationError);
  });

  it('uses the existing US Navy calculation and persists its result', () => {
    const expected = calculateBodyComposition({
      sex: 'female',
      heightCm: patient.heightCm,
      neckCm: CLINICAL_ASSESSMENT_INPUT.neckCm,
      waistCm: CLINICAL_ASSESSMENT_INPUT.waistCm,
      abdomenCm: CLINICAL_ASSESSMENT_INPUT.abdomenCm,
      hipCm: CLINICAL_ASSESSMENT_INPUT.hipCm,
      weightKg: CLINICAL_ASSESSMENT_INPUT.weightKg,
    });
    const result = buildBodyAssessment(CLINICAL_ASSESSMENT_INPUT, {
      accountId: patient.accountId,
      patientId: patient.id,
      patient,
      id: 'assessment-calculation',
      now: () => '2026-09-11T12:00:00.000Z',
    });

    expect(result.bodyFatPercent).toBe(expected.bodyFatPercent);
    expect(result.fatMassKg).toBe(expected.fatMassKg);
    expect(result.leanMassKg).toBe(expected.leanMassKg);
  });

  it('validates follow-up type and represents civil dates as overdue, today, or future', () => {
    expect(validateNextFollowUpInput({ dueDate: '2026-09-15', type: 'DIET_UPDATE' })).toEqual({ valid: true, fieldErrors: {} });
    expect(validateNextFollowUpInput({ dueDate: '2026-09-15', type: 'other' as never }).valid).toBe(false);
    expect(getFollowUpStatus('2026-09-10', '2026-09-11')).toBe('OVERDUE');
    expect(getFollowUpStatus('2026-09-11', '2026-09-11')).toBe('TODAY');
    expect(getFollowUpStatus('2026-09-12', '2026-09-11')).toBe('UPCOMING');
  });

  it('sorts same-day assessments deterministically and preserves independent identities', () => {
    const sorted = sortAssessments([
      makeClinicalAssessment({ id: 'assessment-b', createdAt: '2026-09-11T12:00:02.000Z' }),
      makeClinicalAssessment({ id: 'assessment-a', createdAt: '2026-09-11T12:00:02.000Z' }),
      makeClinicalAssessment({ id: 'assessment-c', clinicalDate: '2026-09-09' }),
    ]);

    expect(sorted.map((assessment) => assessment.id)).toEqual(['assessment-a', 'assessment-b', 'assessment-c']);
  });
});
