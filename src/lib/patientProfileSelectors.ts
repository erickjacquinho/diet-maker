import type {
  BodyAssessment,
  HistoricalDiet,
  PatientNextEvent,
} from './patientsStore';

export interface ActivePlanSummary {
  dietId: string;
  name: string;
  date: string;
  status: 'Ativa';
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface NextEventSummary {
  date: string;
  label: string;
}

export function normalizePatientDateKey(value: string | undefined): string | null {
  const normalized = value?.trim() ?? '';
  if (!normalized) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return normalized.slice(0, 10);
  }

  const [day, month, year] = normalized.split(/[/-]/).map((part) => part.trim());
  if (day && month && year?.length === 4 && /^\d{1,2}$/.test(day) && /^\d{1,2}$/.test(month)) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

export function selectLatestAssessment(assessments: BodyAssessment[]): BodyAssessment | null {
  let latest: BodyAssessment | null = null;
  let latestKey: string | null = null;

  for (const assessment of assessments) {
    const dateKey = normalizePatientDateKey(assessment.date);
    if (!dateKey) continue;

    if (!latest || !latestKey || dateKey > latestKey) {
      latest = assessment;
      latestKey = dateKey;
    }
  }

  return latest;
}

export function selectActivePlan(diets: HistoricalDiet[]): ActivePlanSummary | null {
  let activePlan: HistoricalDiet | null = null;
  let activeDateKey: string | null = null;

  for (const diet of diets) {
    if (diet.status !== 'Ativa') continue;

    const dateKey = normalizePatientDateKey(diet.date);
    if (!dateKey) continue;

    if (!activePlan || !activeDateKey || dateKey > activeDateKey) {
      activePlan = diet;
      activeDateKey = dateKey;
    }
  }

  if (!activePlan) return null;

  return {
    dietId: activePlan.id,
    name: activePlan.name,
    date: activePlan.date,
    status: 'Ativa',
    targetKcal: activePlan.targetKcal,
    proteinG: activePlan.proteinG,
    carbsG: activePlan.carbsG,
    fatsG: activePlan.fatsG,
  };
}

export function buildNextEventSummary(event: PatientNextEvent | null | undefined): NextEventSummary | null {
  if (!event) return null;

  const normalizedDate = normalizePatientDateKey(event.date);
  const date = normalizedDate
    ? normalizedDate.split('-').reverse().join('/')
    : event.date;

  return {
    date,
    label: event.type === 'diet-update' ? 'Atualização de dieta' : 'Atualização de avaliação',
  };
}
