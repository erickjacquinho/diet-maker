import { describe, expect, it } from 'vitest';
import {
  buildPatientListRows,
  buildPatientListHistory,
  filterPatients,
  formatEventStatus,
  formatBodyFatPercent,
  formatDateKey,
  normalizeDateKey,
} from '@/lib/patientListView';
import { getPatientRecordHistory } from '@/lib/patientsStore';
import {
  PATIENT_LIST_ASSESSMENTS,
  PATIENT_LIST_FIXTURES,
  PATIENT_LIST_DIET_IDS,
  PATIENT_LIST_TODAY,
} from '../fixtures/patient-list';

describe('patient list history projection', () => {
  it('normalizes pt-BR assessment dates into sortable date keys', () => {
    expect(normalizeDateKey('03/08/2026')).toBe('2026-08-03');
    expect(normalizeDateKey('2026-08-03T10:00:00.000Z')).toBe('2026-08-03');
  });

  it('formats pt-BR event dates after normalizing their date key', () => {
    expect(formatDateKey('03/08/2026')).toBe('03/08');
  });

  it('formats BF values using pt-BR decimal notation and the BF unit', () => {
    expect(formatBodyFatPercent(24.7)).toBe('24,7% BF');
  });

  it('projects current BF, comparison delta and historical record flags', () => {
    const patient = PATIENT_LIST_FIXTURES.bodyFatHistory;
    const history = buildPatientListHistory({
      assessments: PATIENT_LIST_ASSESSMENTS[patient.id],
      hasDiet: PATIENT_LIST_DIET_IDS.has(patient.id),
    });

    expect(history.hasAssessment).toBe(true);
    expect(history.hasDiet).toBe(true);
    expect(history.bodyFatLabel).toBe('24,7% BF');
    expect(history.bodyFatDeltaLabel).toBe('−0,4% 20d');
    expect(history.recordIndicatorLabel).toBe('Avaliação física e dieta registradas');
  });

  it('falls back when only one valid assessment is available', () => {
    const patient = PATIENT_LIST_FIXTURES.assessmentOnly;
    const history = buildPatientListHistory({
      assessments: PATIENT_LIST_ASSESSMENTS[patient.id],
      hasDiet: false,
    });

    expect(history.bodyFatLabel).toBe('30,2% BF');
    expect(history.bodyFatDeltaLabel).toBeNull();
    expect(history.recordIndicatorLabel).toBe('Avaliação física registrada; sem dieta');
  });

  it('ignores invalid assessment dates instead of creating a false BF value', () => {
    const history = buildPatientListHistory({
      assessments: [{
        id: 'invalid',
        date: 'not-a-date',
        bodyFatPercent: 20,
        weightKg: 65,
        muscleMassKg: 28,
        waistCm: 80,
      }],
      hasDiet: false,
    });

    expect(history.hasAssessment).toBe(true);
    expect(history.bodyFatLabel).toBe('Sem avaliação corporal recente');
  });

  it('reads assessment and diet history without mutating the patient entity', () => {
    const patientId = PATIENT_LIST_FIXTURES.bodyFatHistory.id;
    localStorage.setItem(`nutridiet_assessments_${patientId}`, JSON.stringify(PATIENT_LIST_ASSESSMENTS[patientId]));
    localStorage.setItem(`nutridiet_diets_${patientId}`, JSON.stringify([{ id: 'diet-1' }]));

    expect(getPatientRecordHistory(patientId)).toEqual({
      assessments: PATIENT_LIST_ASSESSMENTS[patientId],
      hasDiet: true,
    });
  });
});

describe('patient list ordering and filtering', () => {
  it('flattens rows in overdue, today, upcoming and no-event order', () => {
    const rows = buildPatientListRows([
      PATIENT_LIST_FIXTURES.noEvent,
      PATIENT_LIST_FIXTURES.upcoming,
      PATIENT_LIST_FIXTURES.today,
      PATIENT_LIST_FIXTURES.overdue,
    ], PATIENT_LIST_TODAY);

    expect(rows.map((row) => row.patient.id)).toEqual([
      'patient-overdue',
      'patient-today',
      'patient-upcoming',
      'patient-no-event',
    ]);
  });

  it('activates the matching record indicator for a scheduled assessment or diet', () => {
    const rows = buildPatientListRows([
      PATIENT_LIST_FIXTURES.today,
      PATIENT_LIST_FIXTURES.upcoming,
    ], PATIENT_LIST_TODAY);

    expect(rows.find((row) => row.patient.id === PATIENT_LIST_FIXTURES.today.id)?.history.hasAssessment).toBe(true);
    expect(rows.find((row) => row.patient.id === PATIENT_LIST_FIXTURES.today.id)?.history.hasDiet).toBe(false);
    expect(rows.find((row) => row.patient.id === PATIENT_LIST_FIXTURES.upcoming.id)?.history.hasAssessment).toBe(false);
    expect(rows.find((row) => row.patient.id === PATIENT_LIST_FIXTURES.upcoming.id)?.history.hasDiet).toBe(true);
  });

  it('uses patient name as the tie-breaker for equivalent event dates', () => {
    const rows = buildPatientListRows([
      {
        ...PATIENT_LIST_FIXTURES.upcoming,
        id: 'patient-upcoming-pt-br',
        name: 'Bruna Próxima',
        nextEvent: { date: '08/08/2026', type: 'diet-update' },
      },
      {
        ...PATIENT_LIST_FIXTURES.upcoming,
        id: 'patient-upcoming-iso',
        name: 'Ana Próxima',
        nextEvent: { date: '2026-08-08', type: 'diet-update' },
      },
    ], PATIENT_LIST_TODAY);

    expect(rows.map((row) => row.patient.name)).toEqual(['Ana Próxima', 'Bruna Próxima']);
  });

  it('filters by patient name or objective before building rows', () => {
    const patients = [
      PATIENT_LIST_FIXTURES.today,
      { ...PATIENT_LIST_FIXTURES.noEvent, objective: 'Cutting' },
    ];

    expect(filterPatients(patients, 'hoje')).toHaveLength(1);
    expect(filterPatients(patients, 'cutting')).toHaveLength(1);
    expect(filterPatients(patients, 'inexistente')).toEqual([]);
  });

  it('formats overdue, today, future and no-event statuses as text', () => {
    expect(formatEventStatus(PATIENT_LIST_FIXTURES.overdue.nextEvent, PATIENT_LIST_TODAY)).toContain('Atrasado');
    expect(formatEventStatus(PATIENT_LIST_FIXTURES.today.nextEvent, PATIENT_LIST_TODAY)).toBe('Hoje');
    expect(formatEventStatus(PATIENT_LIST_FIXTURES.upcoming.nextEvent, PATIENT_LIST_TODAY)).toBe('Em 5 dias');
    expect(formatEventStatus(null, PATIENT_LIST_TODAY)).toBe('Sem próximo evento');
  });
});
