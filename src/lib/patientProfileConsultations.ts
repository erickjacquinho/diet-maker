import type { BodyAssessment, HistoricalDiet } from './patientsStore';
import { normalizePatientDateKey } from './patientProfileSelectors';

export type TimelineEventType = 'diet' | 'assessment';

export interface TimelineDietEvent {
  id: string;
  type: 'diet';
  date: string;
  dateIso: string;
  diet: HistoricalDiet;
}

export interface TimelineAssessmentEvent {
  id: string;
  type: 'assessment';
  date: string;
  dateIso: string;
  assessment: BodyAssessment;
}

export type TimelineItem = TimelineDietEvent | TimelineAssessmentEvent;

export interface TimelineDateGroup {
  date: string;
  dateIso: string;
  items: TimelineItem[];
}

export type TimelineFilter = 'all' | 'assessments' | 'diets';

export interface ConsolidatedConsultation {
  id: string;
  date: string;
  dateIso: string;
  diets: HistoricalDiet[];
  assessments: BodyAssessment[];
  primaryDiet?: HistoricalDiet;
  primaryAssessment?: BodyAssessment;
  hasDiet: boolean;
  hasAssessment: boolean;
  isActive: boolean;
  diet?: HistoricalDiet; // retrocompatibilidade
  assessment?: BodyAssessment; // retrocompatibilidade
}

export interface PatientProfileConsultation {
  id?: string;
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}

/**
 * Builds unified, date-consolidated consultations for the table view.
 * Guarantees exactly 1 row per date, containing all diets and assessments from that session.
 */
export function buildConsolidatedConsultations(
  diets: HistoricalDiet[],
  assessments: BodyAssessment[],
): ConsolidatedConsultation[] {
  const groupsMap = new Map<
    string,
    { dateDisplay: string; dateIso: string; diets: HistoricalDiet[]; assessments: BodyAssessment[] }
  >();

  diets.forEach((diet, index) => {
    const dateIso = normalizePatientDateKey(diet.date) ?? diet.date;
    const dateKey = dateIso || `undated-diet-${index}`;
    const group = groupsMap.get(dateKey) ?? {
      dateDisplay: diet.date,
      dateIso,
      diets: [],
      assessments: [],
    };
    group.diets.push(diet);
    groupsMap.set(dateKey, group);
  });

  assessments.forEach((assessment, index) => {
    const dateIso = normalizePatientDateKey(assessment.date) ?? assessment.date;
    const dateKey = dateIso || `undated-asm-${index}`;
    const group = groupsMap.get(dateKey) ?? {
      dateDisplay: assessment.date,
      dateIso,
      diets: [],
      assessments: [],
    };
    group.assessments.push(assessment);
    groupsMap.set(dateKey, group);
  });

  const sortedDateKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

  return sortedDateKeys.map((dateKey) => {
    const group = groupsMap.get(dateKey)!;
    const primaryDiet = group.diets[0];
    const primaryAssessment = group.assessments[0];
    const isActive = group.diets.some((d) => d.status === 'Ativa');

    return {
      id: dateKey,
      date: group.dateDisplay,
      dateIso: group.dateIso,
      diets: group.diets,
      assessments: group.assessments,
      primaryDiet,
      primaryAssessment,
      hasDiet: group.diets.length > 0,
      hasAssessment: group.assessments.length > 0,
      isActive,
      diet: primaryDiet,
      assessment: primaryAssessment,
    };
  });
}


/**
 * Builds chronological timeline date groups with autonomous diet and assessment events.
 * Multiple events on the same date remain grouped under a single date header without artificial pairing.
 */
export function buildPatientTimelineEvents(
  diets: HistoricalDiet[],
  assessments: BodyAssessment[],
): TimelineDateGroup[] {
  const groupsMap = new Map<
    string,
    { dateDisplay: string; dateIso: string; items: TimelineItem[] }
  >();

  diets.forEach((diet, index) => {
    const dateIso = normalizePatientDateKey(diet.date) ?? diet.date;
    const dateKey = dateIso || `undated-diet-${index}`;
    const group = groupsMap.get(dateKey) ?? {
      dateDisplay: diet.date,
      dateIso,
      items: [],
    };

    group.items.push({
      id: diet.id ? `diet-${diet.id}` : `diet-${dateIso}-${index}`,
      type: 'diet',
      date: diet.date,
      dateIso,
      diet,
    });

    groupsMap.set(dateKey, group);
  });

  assessments.forEach((assessment, index) => {
    const dateIso = normalizePatientDateKey(assessment.date) ?? assessment.date;
    const dateKey = dateIso || `undated-asm-${index}`;
    const group = groupsMap.get(dateKey) ?? {
      dateDisplay: assessment.date,
      dateIso,
      items: [],
    };

    group.items.push({
      id: assessment.id ? `asm-${assessment.id}` : `asm-${dateIso}-${index}`,
      type: 'assessment',
      date: assessment.date,
      dateIso,
      assessment,
    });

    groupsMap.set(dateKey, group);
  });

  const sortedDateKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

  return sortedDateKeys.map((dateKey) => {
    const group = groupsMap.get(dateKey)!;
    return {
      date: group.dateDisplay,
      dateIso: group.dateIso,
      items: group.items,
    };
  });
}

/**
 * Legacy consultation builder for backward compatibility.
 */
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

