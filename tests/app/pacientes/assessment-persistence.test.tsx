import { describe, expect, it } from 'vitest';
import { toAssessmentInput, toLegacyAssessment } from '@/lib/application/patients/clinical-ui-adapter';
import { makeClinicalAssessment } from '../../fixtures/clinical';

describe('assessment persistence presentation boundary', () => {
  it('round-trips the canonical assessment identity and version for edit actions', () => {
    const canonical = makeClinicalAssessment({ version: 4, clinicalDate: '2026-09-10' });
    const view = toLegacyAssessment(canonical);

    expect(view.id).toBe(canonical.id);
    expect(view.version).toBe(4);
    expect(view.date).toBe('10/09/2026');
    expect(view.muscleMassKg).toBe(canonical.leanMassKg);
    expect(toAssessmentInput(view)).toEqual(expect.objectContaining({ clinicalDate: '2026-09-10', weightKg: canonical.weightKg }));
  });

  it('never sends stored calculated results back as form authority', () => {
    const view = toLegacyAssessment(makeClinicalAssessment({ bodyFatPercent: 21, fatMassKg: 13, leanMassKg: 49 }));
    const input = toAssessmentInput(view);

    expect(input).not.toHaveProperty('bodyFatPercent');
    expect(input).not.toHaveProperty('fatMassKg');
    expect(input).not.toHaveProperty('leanMassKg');
  });
});
