import type { BodyAssessment, HistoricalDiet } from './patientsStore';
import { normalizePatientDateKey } from './patientProfileSelectors';

export interface PatientProfileConsultation {
  id?: string;
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}

export function buildPatientProfileConsultations(
  diets: HistoricalDiet[],
  assessments: BodyAssessment[],
): PatientProfileConsultation[] {
  const dateGroups = new Map<
    string,
    { dateDisplay: string; diets: HistoricalDiet[]; assessments: BodyAssessment[] }
  >();

  diets.forEach((diet) => {
    const dateKey = normalizePatientDateKey(diet.date) ?? diet.date;
    const group = dateGroups.get(dateKey) ?? {
      dateDisplay: diet.date,
      diets: [],
      assessments: [],
    };
    group.diets.push(diet);
    dateGroups.set(dateKey, group);
  });

  assessments.forEach((assessment) => {
    const dateKey = normalizePatientDateKey(assessment.date) ?? assessment.date;
    const group = dateGroups.get(dateKey) ?? {
      dateDisplay: assessment.date,
      diets: [],
      assessments: [],
    };
    group.assessments.push(assessment);
    dateGroups.set(dateKey, group);
  });

  const sortedDateKeys = Array.from(dateGroups.keys()).sort((a, b) => b.localeCompare(a));

  const result: PatientProfileConsultation[] = [];

  for (const dateKey of sortedDateKeys) {
    const group = dateGroups.get(dateKey)!;
    const count = Math.max(group.diets.length, group.assessments.length);

    for (let i = 0; i < count; i++) {
      const diet = group.diets[i];
      const assessment = group.assessments[i];
      const date = diet?.date ?? assessment?.date ?? group.dateDisplay;
      const id = `${dateKey}-${diet?.id ?? 'no-diet'}-${assessment?.id ?? 'no-asm'}-${i}`;

      result.push({
        id,
        date,
        diet,
        assessment,
      });
    }
  }

  return result;
}
