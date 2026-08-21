import type { BodyAssessment, Patient } from '@/lib/patientsStore';

export const PATIENT_LIST_TODAY = '2026-08-03';

export function makePatient(
  overrides: Partial<Patient> & Pick<Patient, 'id' | 'name'>,
): Patient {
  const { id, name, ...patientOverrides } = overrides;

  return {
    id,
    name,
    age: 30,
    gender: 'Feminino',
    heightCm: 165,
    weightKg: 65,
    targetKcal: 1800,
    targetProtein: 110,
    targetCarbs: 200,
    targetFats: 55,
    objective: 'Manutenção',
    lastConsultation: '03/08/2026',
    initials: name.slice(0, 2).toUpperCase(),
    nextEvent: null,
    lastActivity: null,
    ...patientOverrides,
  };
}

export function makeAssessment(
  overrides: Partial<BodyAssessment> & Pick<BodyAssessment, 'id' | 'date' | 'bodyFatPercent'>,
): BodyAssessment {
  const { id, date, bodyFatPercent, ...assessmentOverrides } = overrides;

  return {
    id,
    date,
    bodyFatPercent,
    weightKg: 65,
    muscleMassKg: 28,
    waistCm: 80,
    ...assessmentOverrides,
  };
}

export const PATIENT_LIST_FIXTURES = {
  overdue: makePatient({
    id: 'patient-overdue',
    name: 'Bruno Atrasado',
    gender: 'Masculino',
    nextEvent: { date: '2026-08-02', type: 'diet-update' },
  }),
  today: makePatient({
    id: 'patient-today',
    name: 'Ana Hoje',
    nextEvent: { date: PATIENT_LIST_TODAY, type: 'assessment-update' },
  }),
  upcoming: makePatient({
    id: 'patient-upcoming',
    name: 'Carlos Próximo',
    nextEvent: { date: '2026-08-08', type: 'diet-update' },
  }),
  noEvent: makePatient({
    id: 'patient-no-event',
    name: 'Diana Sem Evento',
  }),
  bodyFatHistory: makePatient({
    id: 'patient-body-fat',
    name: 'Fernanda BF',
    gender: 'Feminino',
    nextEvent: { date: '2026-08-10', type: 'assessment-update' },
  }),
  assessmentOnly: makePatient({
    id: 'patient-assessment-only',
    name: 'Gustavo Avaliação',
  }),
  dietOnly: makePatient({
    id: 'patient-diet-only',
    name: 'Helena Dieta',
  }),
  noRecords: makePatient({
    id: 'patient-no-records',
    name: 'Íris Sem Registro',
  }),
} as const;

export const PATIENT_LIST_ASSESSMENTS: Record<string, BodyAssessment[]> = {
  [PATIENT_LIST_FIXTURES.bodyFatHistory.id]: [
    makeAssessment({ id: 'assessment-current', date: '2026-08-03', bodyFatPercent: 24.7 }),
    makeAssessment({ id: 'assessment-previous', date: '2026-07-14', bodyFatPercent: 25.1 }),
  ],
  [PATIENT_LIST_FIXTURES.assessmentOnly.id]: [
    makeAssessment({ id: 'assessment-only', date: '2026-08-01', bodyFatPercent: 30.2 }),
  ],
};

export const PATIENT_LIST_DIET_IDS = new Set([
  PATIENT_LIST_FIXTURES.bodyFatHistory.id,
  PATIENT_LIST_FIXTURES.dietOnly.id,
]);
