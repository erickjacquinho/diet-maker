import type {
  PatientListHistoryInput,
  PatientListHistory,
} from './patientListView';
import {
  getTodayDateKey,
  getDateKeyDate,
} from './patientListDateUtils';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

export function computePatientListHistory(
  input: PatientListHistoryInput,
  today = getTodayDateKey(),
): PatientListHistory {
  const hasAssessment = input.hasAssessment ?? input.assessments.length > 0;
  const { hasDiet } = input;
  const recordIndicatorLabel = getRecordIndicatorLabel(hasAssessment, hasDiet);

  if (!hasAssessment || input.assessments.length === 0) {
    return {
      hasAssessment,
      hasDiet,
      currentBodyFatPercent: null,
      previousBodyFatPercent: null,
      bodyFatDeltaPercent: null,
      bodyFatDeltaDays: null,
      bodyFatLabel: 'Sem dados',
      bodyFatDeltaLabel: null,
      recordIndicatorLabel,
    };
  }

  const sortedAssessments = [...input.assessments].sort((a, b) => b.date.localeCompare(a.date));
  const latestAssessment = sortedAssessments[0];
  const previousAssessment = sortedAssessments[1];
  const currentBodyFatPercent = latestAssessment.bodyFatPercent;

  if (!previousAssessment) {
    return {
      hasAssessment,
      hasDiet,
      currentBodyFatPercent,
      previousBodyFatPercent: null,
      bodyFatDeltaPercent: null,
      bodyFatDeltaDays: null,
      bodyFatLabel: formatBodyFatPercent(currentBodyFatPercent),
      bodyFatDeltaLabel: null,
      recordIndicatorLabel,
    };
  }

  const previousBodyFatPercent = previousAssessment.bodyFatPercent;
  const bodyFatDeltaPercent = Number(
    (currentBodyFatPercent - previousBodyFatPercent).toFixed(1),
  );

  const latestDate = getDateKeyDate(latestAssessment.date);
  const previousDate = getDateKeyDate(previousAssessment.date);
  const bodyFatDeltaDays =
    latestDate && previousDate
      ? Math.max(0, Math.round((latestDate.getTime() - previousDate.getTime()) / DAY_IN_MS))
      : null;

  return {
    hasAssessment,
    hasDiet,
    currentBodyFatPercent,
    previousBodyFatPercent,
    bodyFatDeltaPercent,
    bodyFatDeltaDays,
    bodyFatLabel: formatBodyFatPercent(currentBodyFatPercent),
    bodyFatDeltaLabel: formatSignedPercent(bodyFatDeltaPercent),
    recordIndicatorLabel,
  };
}
