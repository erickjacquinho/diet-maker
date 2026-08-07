import type { BodyAssessment, HistoricalDiet } from './patientsStore';
import { normalizePatientDateKey } from './patientProfileSelectors';

export interface PatientProfileConsultation {
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}

export function buildPatientProfileConsultations(
  diets: HistoricalDiet[],
  assessments: BodyAssessment[],
): PatientProfileConsultation[] {
  const map = new Map<string, PatientProfileConsultation>();

  diets.forEach((diet) => {
    const dateKey = normalizePatientDateKey(diet.date) ?? diet.date;
    const consultation = map.get(dateKey) ?? { date: diet.date };
    map.set(dateKey, { ...consultation, diet });
  });

  assessments.forEach((assessment) => {
    const dateKey = normalizePatientDateKey(assessment.date) ?? assessment.date;
    const consultation = map.get(dateKey) ?? { date: assessment.date };
    map.set(dateKey, { ...consultation, assessment });
  });

  return Array.from(map.values()).sort((left, right) => {
    const leftKey = normalizePatientDateKey(left.date) ?? left.date;
    const rightKey = normalizePatientDateKey(right.date) ?? right.date;
    return rightKey.localeCompare(leftKey);
  });
}
