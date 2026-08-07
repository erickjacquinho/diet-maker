import type {
  BodyAssessment,
  Patient,
  PatientLastActivity,
  PatientNextEvent,
  PatientNextEventType,
} from './patientsStore';

import {
  PATIENT_LIST_GROUP_IDS,
  PatientListGroupId,
  getTodayDateKey,
  normalizeDateKey,
  getDateKeyDate,
  getDaysUntilEvent,
  formatDateKey,
  formatEventStatus,
  formatEventType,
} from './patientListDateUtils';

import {
  computePatientListHistory,
  formatBodyFatPercent,
} from './patientListHistoryUtils';

export {
  PATIENT_LIST_GROUP_IDS,
  PatientListGroupId,
  getTodayDateKey,
  normalizeDateKey,
  getDaysUntilEvent,
  formatDateKey,
  formatEventStatus,
  formatEventType,
  computePatientListHistory,
  formatBodyFatPercent,
};

const PATIENT_LIST_SORT_ORDER: PatientListGroupId[] = ['overdue', 'today', 'upcoming', 'no-event'];

export interface PatientListHistoryInput {
  assessments: BodyAssessment[];
  hasDiet: boolean;
  hasAssessment?: boolean;
}

export interface PatientListHistory {
  hasAssessment: boolean;
  hasDiet: boolean;
  currentBodyFatPercent: number | null;
  previousBodyFatPercent: number | null;
  bodyFatDeltaPercent: number | null;
  bodyFatDeltaDays: number | null;
  bodyFatLabel: string;
  bodyFatDeltaLabel: string | null;
  recordIndicatorLabel: string;
}

export interface PatientListRow {
  patient: Patient;
  group: PatientListGroupId;
  href: string;
  eventStatusLabel: string;
  eventTypeLabel: string | null;
  eventDateLabel: string | null;
  lastActivityLabel: string;
  history: PatientListHistory;
  recordIndicatorLabel: string;
}

export interface PatientListGroup {
  id: PatientListGroupId;
  label: string;
  description: string;
  rows: PatientListRow[];
}

const GROUP_META: Record<PatientListGroupId, Pick<PatientListGroup, 'label' | 'description'>> = {
  'no-event': {
    label: 'Sem próximo evento',
    description: 'Defina o próximo passo de acompanhamento para estes pacientes.',
  },
  overdue: {
    label: 'Atrasados',
    description: 'O próximo acompanhamento já passou da data prevista.',
  },
  today: {
    label: 'Hoje',
    description: 'Acompanhamentos previstos para hoje.',
  },
  upcoming: {
    label: 'Próximos acompanhamentos',
    description: 'Acompanhamentos futuros ordenados pela data.',
  },
};

const ACTIVITY_TYPE_LABELS: Record<PatientLastActivity['type'], string> = {
  diet: 'Dieta',
  assessment: 'Avaliação',
};

function getActivityDateKey(activity: PatientLastActivity | null | undefined): string | null {
  if (!activity?.at) return null;
  const normalized = normalizeDateKey(activity.at);
  if (normalized) return normalized;

  const parsed = new Date(activity.at);
  return Number.isNaN(parsed.getTime()) ? null : getTodayDateKey(parsed);
}

export function classifyPatient(patient: Patient, today = getTodayDateKey()): PatientListGroupId {
  const daysUntilEvent = patient.nextEvent?.date
    ? getDaysUntilEvent(patient.nextEvent.date, today)
    : null;

  if (daysUntilEvent === null) return 'no-event';
  if (daysUntilEvent < 0) return 'overdue';
  if (daysUntilEvent === 0) return 'today';
  return 'upcoming';
}

export function formatLastActivityLabel(
  activity: PatientLastActivity | null | undefined,
  today = getTodayDateKey(),
): string {
  if (!activity?.at) return 'Sem atividade registrada';

  const activityDateKey = getActivityDateKey(activity);
  const daysAgo = activityDateKey ? getDaysUntilEvent(today, activityDateKey) : null;
  const typeName = ACTIVITY_TYPE_LABELS[activity.type];

  if (daysAgo === null) return `${typeName} registrada`;
  if (daysAgo <= 0) return `${typeName} atualizada hoje`;
  if (daysAgo === 1) return `${typeName} há 1 dia`;
  return `${typeName} há ${daysAgo} dias`;
}

export function buildPatientListRow(patient: Patient, today = getTodayDateKey()): PatientListRow {
  const group = classifyPatient(patient, today);
  const history = computePatientListHistory(
    {
      assessments: patient.assessments ?? [],
      hasDiet: Boolean(patient.dietaAtivaId || patient.diets?.length),
    },
    today,
  );

  return {
    patient,
    group,
    href: `/pacientes/${patient.id}`,
    eventStatusLabel: formatEventStatus(patient.nextEvent, today),
    eventTypeLabel: formatEventType(patient.nextEvent?.type),
    eventDateLabel: formatDateKey(patient.nextEvent?.date),
    lastActivityLabel: formatLastActivityLabel(patient.lastActivity, today),
    history,
    recordIndicatorLabel: history.recordIndicatorLabel,
  };
}

export function groupPatientsForListView(
  patients: Patient[],
  today = getTodayDateKey(),
): PatientListGroup[] {
  const rows = patients.map((patient) => buildPatientListRow(patient, today));
  const rowsByGroup = new Map<PatientListGroupId, PatientListRow[]>();

  PATIENT_LIST_GROUP_IDS.forEach((groupId) => rowsByGroup.set(groupId, []));

  rows.forEach((row) => {
    rowsByGroup.get(row.group)?.push(row);
  });

  rowsByGroup.forEach((groupRows) => {
    groupRows.sort((a, b) => {
      const aDate = a.patient.nextEvent?.date;
      const bDate = b.patient.nextEvent?.date;

      if (!aDate && !bDate) return a.patient.name.localeCompare(b.patient.name);
      if (!aDate) return 1;
      if (!bDate) return -1;

      const dateComparison = aDate.localeCompare(bDate);
      if (dateComparison !== 0) return dateComparison;
      return a.patient.name.localeCompare(b.patient.name);
    });
  });

  return PATIENT_LIST_SORT_ORDER.map((id) => ({
    id,
    label: GROUP_META[id].label,
    description: GROUP_META[id].description,
    rows: rowsByGroup.get(id) ?? [],
  }));
}
