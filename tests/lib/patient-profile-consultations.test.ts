import { describe, expect, it } from 'vitest';
import {
  buildPatientProfileConsultations,
  buildPatientTimelineEvents,
} from '@/lib/patientProfileConsultations';
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

describe('buildPatientTimelineEvents', () => {
  it('groups multiple diets and assessments on the same date into a single date group with distinct items', () => {
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
      {
        id: 'diet-2',
        name: 'Dieta Variação Descanso',
        date: '20/08/2026',
        targetKcal: 1700,
        proteinG: 150,
        carbsG: 120,
        fatsG: 55,
        status: 'Histórica',
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

    const groups = buildPatientTimelineEvents(diets, assessments);

    expect(groups).toHaveLength(1);
    expect(groups[0].date).toBe('20/08/2026');
    expect(groups[0].items).toHaveLength(3);

    const dietItems = groups[0].items.filter((i) => i.type === 'diet');
    const assessmentItems = groups[0].items.filter((i) => i.type === 'assessment');

    expect(dietItems).toHaveLength(2);
    expect(assessmentItems).toHaveLength(1);
    expect(dietItems[0].diet.name).toBe('Dieta Cutting');
    expect(dietItems[1].diet.name).toBe('Dieta Variação Descanso');
    expect(assessmentItems[0].assessment.weightKg).toBe(80);
  });

  it('renders date group with only assessments when no diet is registered on that date', () => {
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

    const groups = buildPatientTimelineEvents([], assessments);

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
    const item = groups[0].items[0];
    expect(item.type).toBe('assessment');
    if (item.type === 'assessment') {
      expect(item.assessment.id).toBe('asm-1');
    }
  });

  it('renders date group with only diets when no assessment is registered on that date', () => {
    const diets: HistoricalDiet[] = [
      {
        id: 'diet-1',
        name: 'Dieta Bulking',
        date: '20/08/2026',
        targetKcal: 3000,
        proteinG: 180,
        carbsG: 380,
        fatsG: 70,
        status: 'Ativa',
      },
    ];

    const groups = buildPatientTimelineEvents(diets, []);

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
    const dietItem = groups[0].items[0];
    expect(dietItem.type).toBe('diet');
    if (dietItem.type === 'diet') {
      expect(dietItem.diet.id).toBe('diet-1');
    }
  });

  it('sorts date groups in descending chronological order across multiple dates', () => {
    const diets: HistoricalDiet[] = [
      {
        id: 'diet-old',
        name: 'Dieta Antiga',
        date: '10/08/2026',
        targetKcal: 2000,
        proteinG: 150,
        carbsG: 200,
        fatsG: 60,
        status: 'Histórica',
      },
    ];
    const assessments: BodyAssessment[] = [
      {
        id: 'asm-new',
        date: '20/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
      },
    ];

    const groups = buildPatientTimelineEvents(diets, assessments);

    expect(groups).toHaveLength(2);
    expect(groups[0].date).toBe('20/08/2026');
    expect(groups[0].items[0].type).toBe('assessment');
    expect(groups[1].date).toBe('10/08/2026');
    expect(groups[1].items[0].type).toBe('diet');
  });
});

