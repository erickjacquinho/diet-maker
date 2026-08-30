import type { BodyAssessment } from './patientsStore';
import type { PatientListHistory, PatientListHistoryInput } from './patientListView';
import { getDaysUntilEvent, normalizeDateKey } from './patientListDateUtils';

const BODY_FAT_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatBodyFatPercent(value: number): string {
  return `${BODY_FAT_FORMATTER.format(value)}% BF`;
}

function formatSignedPercent(value: number): string {
  const sign = value < 0 ? '−' : value > 0 ? '+' : '';
  return `${sign}${BODY_FAT_FORMATTER.format(Math.abs(value))}%`;
}

function getRecordIndicatorLabel(hasAssessment: boolean, hasDiet: boolean): string {
  if (hasAssessment && hasDiet) return 'Avaliação física e dieta registradas';
  if (hasAssessment) return 'Avaliação física registrada; sem dieta';
  if (hasDiet) return 'Dieta registrada; sem avaliação física';
  return 'Sem avaliação física ou dieta registrada';
}

export function computePatientListHistory(input: PatientListHistoryInput): PatientListHistory {
  const validAssessments = input.assessments
    .map((assessment) => ({ assessment, dateKey: normalizeDateKey(assessment.date) }))
    .filter(
      (item): item is { assessment: BodyAssessment; dateKey: string } =>
        item.dateKey !== null && Number.isFinite(item.assessment.bodyFatPercent),
    )
    .sort(
      (left, right) =>
        right.dateKey.localeCompare(left.dateKey) ||
        right.assessment.id.localeCompare(left.assessment.id),
    );

  const current = validAssessments[0] ?? null;
  const previous = validAssessments[1] ?? null;
  const currentBodyFatPercent = current?.assessment.bodyFatPercent ?? null;
  const previousBodyFatPercent = previous?.assessment.bodyFatPercent ?? null;
  const bodyFatDeltaPercent =
    currentBodyFatPercent !== null && previousBodyFatPercent !== null
      ? currentBodyFatPercent - previousBodyFatPercent
      : null;
  const bodyFatDeltaDays =
    current && previous ? getDaysUntilEvent(current.dateKey, previous.dateKey) : null;
  const hasAssessment = input.hasAssessment ?? input.assessments.length > 0;

  return {
    hasAssessment,
    hasDiet: input.hasDiet,
    currentBodyFatPercent,
    previousBodyFatPercent,
    bodyFatDeltaPercent,
    bodyFatDeltaDays,
    bodyFatLabel:
      currentBodyFatPercent === null
        ? 'Sem avaliação'
        : formatBodyFatPercent(currentBodyFatPercent),
    bodyFatDeltaLabel:
      bodyFatDeltaPercent === null || bodyFatDeltaDays === null
        ? null
        : `${formatSignedPercent(bodyFatDeltaPercent)} ${bodyFatDeltaDays}d`,
    recordIndicatorLabel: getRecordIndicatorLabel(hasAssessment, input.hasDiet),
  };
}

export const buildPatientListHistory = computePatientListHistory;
