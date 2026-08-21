import type { BodyAssessment, Patient, PatientLastActivity } from './patientsStore';
import {
  PATIENT_LIST_GROUP_IDS,
  type PatientListGroupId,
  formatDateKey,
  formatEventStatus,
  formatEventType,
  getDaysUntilEvent,
  getTodayDateKey,
  normalizeDateKey,
} from './patientListDateUtils';
import { buildPatientListHistory, formatBodyFatPercent } from './patientListHistoryUtils';

export { PATIENT_LIST_GROUP_IDS, formatDateKey, formatEventStatus, formatEventType, getDaysUntilEvent, getTodayDateKey, normalizeDateKey, buildPatientListHistory, formatBodyFatPercent };
export type { PatientListGroupId };

const PATIENT_LIST_SORT_ORDER: PatientListGroupId[] = ['overdue', 'today', 'upcoming', 'no-event'];
const GROUP_META: Record<PatientListGroupId, Pick<PatientListGroup, 'label' | 'description'>> = {
  'no-event': { label: 'Sem próximo evento', description: 'Defina o próximo passo de acompanhamento para estes pacientes.' },
  overdue: { label: 'Atrasados', description: 'O próximo acompanhamento já passou da data prevista.' },
  today: { label: 'Hoje', description: 'Acompanhamentos previstos para hoje.' },
  upcoming: { label: 'Próximos acompanhamentos', description: 'Acompanhamentos futuros ordenados pela data.' },
};
const ACTIVITY_TYPE_LABELS: Record<PatientLastActivity['type'], string> = {
  diet: 'Dieta', assessment: 'Avaliação',
};

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

function getActivityDateKey(activity: PatientLastActivity | null | undefined): string | null {
  if (!activity?.at) return null;
  const normalized = normalizeDateKey(activity.at);
  if (normalized) return normalized;
  const parsed = new Date(activity.at);
  return Number.isNaN(parsed.getTime()) ? null : getTodayDateKey(parsed);
}

export function classifyPatient(patient: Patient, today = getTodayDateKey()): PatientListGroupId {
  const daysUntilEvent = patient.nextEvent?.date ? getDaysUntilEvent(patient.nextEvent.date, today) : null;
  if (daysUntilEvent === null) return 'no-event';
  if (daysUntilEvent < 0) return 'overdue';
  if (daysUntilEvent === 0) return 'today';
  return 'upcoming';
}

export function formatLastActivity(activity: PatientLastActivity | null | undefined, today = getTodayDateKey()): string {
  const activityDateKey = getActivityDateKey(activity);
  if (!activity || !activityDateKey) return 'Sem registro clínico';
  const daysSinceActivity = getDaysUntilEvent(today, activityDateKey);
  let dateLabel = formatDateKey(activityDateKey) ?? 'data indisponível';
  if (daysSinceActivity === 0) dateLabel = 'hoje';
  else if (daysSinceActivity === 1) dateLabel = 'há 1 dia';
  else if (daysSinceActivity !== null && daysSinceActivity > 1) dateLabel = `há ${daysSinceActivity} dias`;
  return `${ACTIVITY_TYPE_LABELS[activity.type]} · ${dateLabel}`;
}

export const formatLastActivityLabel = formatLastActivity;

function getPatientHistoryInput(patient: Patient, historyByPatient: Record<string, PatientListHistoryInput>): PatientListHistoryInput {
  const stored = historyByPatient[patient.id] ?? {
    assessments: patient.bodyAssessments ?? [],
    hasDiet: Boolean(patient.dietHistory?.length),
  };
  return {
    ...stored,
    hasAssessment: stored.hasAssessment === true || stored.assessments.length > 0 || patient.nextEvent?.type === 'assessment-update',
    hasDiet: stored.hasDiet || patient.nextEvent?.type === 'diet-update',
  };
}

export function buildPatientListRow(patient: Patient, today = getTodayDateKey(), historyByPatient: Record<string, PatientListHistoryInput> = {}): PatientListRow {
  const history = buildPatientListHistory(getPatientHistoryInput(patient, historyByPatient));
  return {
    patient,
    group: classifyPatient(patient, today),
    href: `/pacientes/${patient.id}`,
    eventStatusLabel: formatEventStatus(patient.nextEvent, today),
    eventTypeLabel: formatEventType(patient.nextEvent?.type),
    eventDateLabel: formatDateKey(patient.nextEvent?.date),
    lastActivityLabel: formatLastActivity(patient.lastActivity, today),
    history,
    recordIndicatorLabel: history.recordIndicatorLabel,
  };
}

function compareNames(left: PatientListRow, right: PatientListRow): number {
  return left.patient.name.localeCompare(right.patient.name, 'pt-BR', { sensitivity: 'base' });
}

function compareRows(left: PatientListRow, right: PatientListRow): number {
  if (left.group === 'no-event') {
    const leftDate = getActivityDateKey(left.patient.lastActivity) ?? '';
    const rightDate = getActivityDateKey(right.patient.lastActivity) ?? '';
    return leftDate.localeCompare(rightDate) || compareNames(left, right);
  }
  if (left.group === 'today') return compareNames(left, right);
  const leftDate = normalizeDateKey(left.patient.nextEvent?.date ?? '') ?? '';
  const rightDate = normalizeDateKey(right.patient.nextEvent?.date ?? '') ?? '';
  return leftDate.localeCompare(rightDate) || compareNames(left, right);
}

export function buildPatientListGroups(patients: Patient[], today = getTodayDateKey(), historyByPatient: Record<string, PatientListHistoryInput> = {}): PatientListGroup[] {
  const grouped = new Map<PatientListGroupId, PatientListRow[]>(PATIENT_LIST_GROUP_IDS.map((id) => [id, []]));
  patients.forEach((patient) => {
    const row = buildPatientListRow(patient, today, historyByPatient);
    grouped.get(row.group)?.push(row);
  });
  return PATIENT_LIST_GROUP_IDS.map((id) => ({ id, ...GROUP_META[id], rows: (grouped.get(id) ?? []).sort(compareRows) }))
    .filter((group) => group.rows.length > 0);
}

export const groupPatientsForListView = buildPatientListGroups;

export function buildPatientListRows(patients: Patient[], today = getTodayDateKey(), historyByPatient: Record<string, PatientListHistoryInput> = {}): PatientListRow[] {
  const groups = buildPatientListGroups(patients, today, historyByPatient);
  const groupById = new Map(groups.map((group) => [group.id, group]));
  return PATIENT_LIST_SORT_ORDER.flatMap((groupId) => groupById.get(groupId)?.rows ?? []);
}

export function filterPatients(patients: Patient[], searchTerm: string): Patient[] {
  const query = searchTerm.trim().toLocaleLowerCase('pt-BR');
  if (!query) return patients;
  return patients.filter((patient) => [patient.name, patient.objective].some((value) => value.toLocaleLowerCase('pt-BR').includes(query)));
}
