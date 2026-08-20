import { describe, expect, it } from 'vitest';
import { buildPatientProfileConsultations } from '@/lib/patientProfileConsultations';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';

describe('buildPatientProfileConsultations', () => {
  it('pairs 1 diet and 1 assessment on the same date into 1 consultation row', () => {
    const diets: HistoricalDiet[] = [
      {
        id: 'diet-1',
        name: 'Dieta Cutting',
        date: '20/08/2026',
        targetKcal: 2000,
        proteinG: 150,
        carbsG: 200,
        fatsG: 60,
        status: 'Ativa',
      },
    ];
    const assessments: BodyAssessment[] = [
      {
        id: 'asm-1',
        date: '20/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
      },
    ];

    const result = buildPatientProfileConsultations(diets, assessments);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: '20/08/2026',
      diet: diets[0],
      assessment: assessments[0],
    });
  });

  it('displays multiple assessments on the same date as distinct consultation rows', () => {
    const assessments: BodyAssessment[] = [
      {
        id: 'asm-1',
        date: '20/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
      },
      {
        id: 'asm-2',
        date: '20/08/2026',
        weightKg: 79.5,
        bodyFatPercent: 14.8,
        muscleMassKg: 35.2,
        waistCm: 79,
      },
    ];

    const result = buildPatientProfileConsultations([], assessments);

    expect(result).toHaveLength(2);
    expect(result[0].assessment?.id).toBe('asm-1');
    expect(result[1].assessment?.id).toBe('asm-2');
    expect(result[0].date).toBe('20/08/2026');
    expect(result[1].date).toBe('20/08/2026');
    expect(result[0].id).not.toBe(result[1].id);
  });

  it('pairs 1 diet with the first assessment and displays the second assessment in its own row when registered on the same date', () => {
    const diets: HistoricalDiet[] = [
      {
        id: 'diet-1',
        name: 'Dieta Cutting',
        date: '20/08/2026',
        targetKcal: 2000,
        proteinG: 150,
        carbsG: 200,
        fatsG: 60,
        status: 'Ativa',
      },
    ];
    const assessments: BodyAssessment[] = [
      {
        id: 'asm-1',
        date: '20/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
      },
      {
        id: 'asm-2',
        date: '20/08/2026',
        weightKg: 79.5,
        bodyFatPercent: 14.8,
        muscleMassKg: 35.2,
        waistCm: 79,
      },
    ];

    const result = buildPatientProfileConsultations(diets, assessments);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      diet: diets[0],
      assessment: assessments[0],
    });
    expect(result[1].assessment?.id).toBe('asm-2');
    expect(result[1].diet).toBeUndefined();
  });

  it('sorts consultations in descending chronological order across multiple dates', () => {
    const assessments: BodyAssessment[] = [
      {
        id: 'asm-old',
        date: '10/08/2026',
        weightKg: 82,
        bodyFatPercent: 16,
        muscleMassKg: 34,
        waistCm: 82,
      },
      {
        id: 'asm-new',
        date: '20/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
      },
    ];

    const result = buildPatientProfileConsultations([], assessments);

    expect(result).toHaveLength(2);
    expect(result[0].assessment?.id).toBe('asm-new');
    expect(result[1].assessment?.id).toBe('asm-old');
  });
});
