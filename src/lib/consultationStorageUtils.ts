import { normalizeDateToISO } from './date-only';
import type { BodyAssessment, ConsultationRecord } from './patientsStore';

export function normalizeDateKey(value: string): string {
  return normalizeDateToISO(value) ?? value.trim();
}

export function normalizePairedBodyMeasurements(assessment: BodyAssessment): BodyAssessment {
  const normalized = { ...assessment };
  const pairs: Array<[keyof BodyAssessment, keyof BodyAssessment]> = [
    ['leftArmCm', 'rightArmCm'],
    ['leftProximalThighCm', 'rightProximalThighCm'],
    ['leftDistalThighCm', 'rightDistalThighCm'],
    ['leftCalfCm', 'rightCalfCm'],
  ];

  for (const [leftKey, rightKey] of pairs) {
    const leftVal = normalized[leftKey] as number | undefined;
    const rightVal = normalized[rightKey] as number | undefined;

    const hasLeft = leftVal !== undefined && !Number.isNaN(leftVal) && leftVal > 0;
    const hasRight = rightVal !== undefined && !Number.isNaN(rightVal) && rightVal > 0;

    if (hasLeft && !hasRight) {
      (normalized[rightKey] as number) = leftVal;
    } else if (!hasLeft && hasRight) {
      (normalized[leftKey] as number) = rightVal;
    }
  }

  return normalized;
}

export function getConsultationRecordHelper(
  patientId: string,
  rawDateParam: string,
  getPatientAssessmentsFromStorage: (id: string) => BodyAssessment[],
): ConsultationRecord {
  const normalizedDate = decodeURIComponent(rawDateParam).replace(/-/g, '/');

  const savedAssessments = getPatientAssessmentsFromStorage(patientId);
  const assessment = savedAssessments.find(
    (item) => normalizeDateKey(item.date) === normalizeDateKey(rawDateParam),
  );

  return {
    date: normalizedDate,
    assessment,
    notes: 'Sem observações registradas para esta consulta.',
    prescribedSupplements: [],
  };
}
