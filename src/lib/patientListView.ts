import type {
  BodyAssessment,
  Patient,
  PatientLastActivity,
  PatientNextEvent,
  PatientNextEventType,
} from './patientsStore';

export const PATIENT_LIST_GROUP_IDS = ['no-event', 'overdue', 'today', 'upcoming'] as const;

const PATIENT_LIST_SORT_ORDER: PatientListGroupId[] = ['overdue', 'today', 'upcoming', 'no-event'];

export type PatientListGroupId = (typeof PATIENT_LIST_GROUP_IDS)[number];

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

const EVENT_TYPE_LABELS: Record<PatientNextEventType, string> = {
  'diet-update': 'Atualização de dieta',
  'assessment-update': 'Atualização de avaliação',
};

const ACTIVITY_TYPE_LABELS: Record<PatientLastActivity['type'], string> = {
  diet: 'Dieta',
  assessment: 'Avaliação',
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDateKey(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function normalizeDateKey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/.exec(trimmed);
  if (isoMatch) {
    return createDateKey(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const ptBrMatch = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(trimmed);
  if (ptBrMatch) {
    return createDateKey(Number(ptBrMatch[3]), Number(ptBrMatch[2]), Number(ptBrMatch[1]));
  }

  return null;
}

function getDateKeyDate(dateKey: string): Date | null {
  const normalized = normalizeDateKey(dateKey);
  if (!normalized) return null;

  const [year, month, day] = normalized.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getActivityDateKey(activity: PatientLastActivity | null | undefined): string | null {
  if (!activity?.at) return null;
  const normalized = normalizeDateKey(activity.at);
  if (normalized) return normalized;

  const parsed = new Date(activity.at);
  return Number.isNaN(parsed.getTime()) ? null : getTodayDateKey(parsed);
}

export function getDaysUntilEvent(eventDate: string, today = getTodayDateKey()): number | null {
  const event = getDateKeyDate(eventDate);
  const current = getDateKeyDate(today);
  if (!event || !current) return null;
  return Math.round((event.getTime() - current.getTime()) / DAY_IN_MS);
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

export function formatDateKey(dateKey: string | null | undefined): string | null {
  const normalizedDateKey = dateKey ? normalizeDateKey(dateKey) : null;
  if (!normalizedDateKey) return null;
  const [, month, day] = normalizedDateKey.split('-');
  return `${day}/${month}`;
}

export function formatEventStatus(
  event: PatientNextEvent | null | undefined,
  today = getTodayDateKey(),
): string {
  if (!event?.date) return 'Sem próximo evento';

  const daysUntilEvent = getDaysUntilEvent(event.date, today);
  if (daysUntilEvent === null) return 'Sem próximo evento';
  if (daysUntilEvent < 0) {
    const days = Math.abs(daysUntilEvent);
    return `Atrasado há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  if (daysUntilEvent === 0) return 'Hoje';
  return `Em ${daysUntilEvent} ${daysUntilEvent === 1 ? 'dia' : 'dias'}`;
}

export function formatEventType(type: PatientNextEventType | undefined): string | null {
  return type ? EVENT_TYPE_LABELS[type] : null;
}

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

export function buildPatientListHistory(input: PatientListHistoryInput): PatientListHistory {
  const validAssessments = input.assessments
    .map((assessment) => ({
      assessment,
      dateKey: normalizeDateKey(assessment.date),
    }))
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
  const recordIndicatorLabel = getRecordIndicatorLabel(hasAssessment, input.hasDiet);

  return {
    hasAssessment,
    hasDiet: input.hasDiet,
    currentBodyFatPercent,
    previousBodyFatPercent,
    bodyFatDeltaPercent,
    bodyFatDeltaDays,
    bodyFatLabel:
      currentBodyFatPercent === null
        ? 'Sem avaliação corporal recente'
        : formatBodyFatPercent(currentBodyFatPercent),
    bodyFatDeltaLabel:
      bodyFatDeltaPercent === null || bodyFatDeltaDays === null
        ? null
        : `${formatSignedPercent(bodyFatDeltaPercent)} ${bodyFatDeltaDays}d`,
    recordIndicatorLabel,
  };
}

export function formatLastActivity(
  activity: PatientLastActivity | null | undefined,
  today = getTodayDateKey(),
): string {
  const dateKey = getActivityDateKey(activity);
  if (!activity || !dateKey) return 'Sem registro clínico';

  const daysSinceActivity = getDaysUntilEvent(today, dateKey);
  let dateLabel = formatDateKey(dateKey) ?? 'data indisponível';
  if (daysSinceActivity === 0) dateLabel = 'hoje';
  else if (daysSinceActivity === 1) dateLabel = 'há 1 dia';
  else if (daysSinceActivity !== null && daysSinceActivity > 1) dateLabel = `há ${daysSinceActivity} dias`;

  return `${ACTIVITY_TYPE_LABELS[activity.type]} · ${dateLabel}`;
}

function compareNames(left: PatientListRow, right: PatientListRow): number {
  return left.patient.name.localeCompare(right.patient.name, 'pt-BR', { sensitivity: 'base' });
}

function compareActivityDates(left: PatientListRow, right: PatientListRow): number {
  const leftDate = getActivityDateKey(left.patient.lastActivity) ?? '';
  const rightDate = getActivityDateKey(right.patient.lastActivity) ?? '';
  return leftDate.localeCompare(rightDate) || compareNames(left, right);
}

function compareRows(left: PatientListRow, right: PatientListRow): number {
  if (left.group === 'no-event') return compareActivityDates(left, right);

  if (left.group === 'today') return compareNames(left, right);

  const leftEventDate = normalizeDateKey(left.patient.nextEvent?.date ?? '') ?? '';
  const rightEventDate = normalizeDateKey(right.patient.nextEvent?.date ?? '') ?? '';
  return leftEventDate.localeCompare(rightEventDate) || compareNames(left, right);
}

export function filterPatients(patients: Patient[], searchTerm: string): Patient[] {
  const query = searchTerm.trim().toLocaleLowerCase('pt-BR');
  if (!query) return patients;

  return patients.filter((patient) =>
    [patient.name, patient.objective].some((value) => value.toLocaleLowerCase('pt-BR').includes(query)),
  );
}

export function buildPatientListGroups(
  patients: Patient[],
  today = getTodayDateKey(),
  historyByPatient: Record<string, PatientListHistoryInput> = {},
): PatientListGroup[] {
  const grouped = new Map<PatientListGroupId, PatientListRow[]>(
    PATIENT_LIST_GROUP_IDS.map((id) => [id, []]),
  );

  patients.forEach((patient) => {
    const group = classifyPatient(patient, today);
    const storedHistory = historyByPatient[patient.id] ?? { assessments: [], hasDiet: false };
    const history = buildPatientListHistory({
      ...storedHistory,
      hasAssessment:
        storedHistory.hasAssessment === true ||
        storedHistory.assessments.length > 0 ||
        patient.nextEvent?.type === 'assessment-update',
      hasDiet:
        storedHistory.hasDiet ||
        patient.nextEvent?.type === 'diet-update',
    });
    grouped.get(group)?.push({
      patient,
      group,
      href: `/pacientes/${patient.id}`,
      eventStatusLabel: formatEventStatus(patient.nextEvent, today),
      eventTypeLabel: formatEventType(patient.nextEvent?.type),
      eventDateLabel: formatDateKey(patient.nextEvent?.date),
      lastActivityLabel: formatLastActivity(patient.lastActivity, today),
      history,
      recordIndicatorLabel: history.recordIndicatorLabel,
    });
  });

  return PATIENT_LIST_GROUP_IDS.map((id) => ({
    id,
    ...GROUP_META[id],
    rows: (grouped.get(id) ?? []).sort(compareRows),
  })).filter((group) => group.rows.length > 0);
}

export function buildPatientListRows(
  patients: Patient[],
  today = getTodayDateKey(),
  historyByPatient: Record<string, PatientListHistoryInput> = {},
): PatientListRow[] {
  const groups = buildPatientListGroups(patients, today, historyByPatient);
  const groupById = new Map(groups.map((group) => [group.id, group]));

  return PATIENT_LIST_SORT_ORDER.flatMap((groupId) => groupById.get(groupId)?.rows ?? []);
}
