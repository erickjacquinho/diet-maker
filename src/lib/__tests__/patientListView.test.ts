import { describe, expect, it } from 'vitest';
import type { Patient } from '../patientsStore';
import {
  buildPatientListGroups,
  buildPatientListRows,
  classifyPatient,
  filterPatients,
  formatEventStatus,
} from '../patientListView';

const TODAY = '2026-08-03';

function patient(
  id: string,
  name: string,
  nextEvent: Patient['nextEvent'] = null,
  lastActivity: Patient['lastActivity'] = null,
): Patient {
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
    nextEvent,
    lastActivity,
  };
}

describe('patientListView', () => {
  it('classifies the boundaries yesterday, today and tomorrow', () => {
    expect(classifyPatient(patient('yesterday', 'Ontem', { date: '2026-08-02', type: 'diet-update' }), TODAY)).toBe('overdue');
    expect(classifyPatient(patient('today', 'Hoje', { date: TODAY, type: 'assessment-update' }), TODAY)).toBe('today');
    expect(classifyPatient(patient('tomorrow', 'Amanhã', { date: '2026-08-04', type: 'diet-update' }), TODAY)).toBe('upcoming');
    expect(classifyPatient(patient('none', 'Sem evento'), TODAY)).toBe('no-event');
  });

  it('builds only non-empty groups and applies the defined internal ordering', () => {
    const groups = buildPatientListGroups([
      patient('future-late', 'Zoe', { date: '2026-08-12', type: 'diet-update' }),
      patient('future-soon', 'Ana', { date: '2026-08-04', type: 'assessment-update' }),
      patient('overdue-late', 'Bia', { date: '2026-08-02', type: 'diet-update' }),
      patient('overdue-old', 'Caio', { date: '2026-07-20', type: 'assessment-update' }),
      patient('today-z', 'Zilda', { date: TODAY, type: 'assessment-update' }),
      patient('today-a', 'Alice', { date: TODAY, type: 'diet-update' }),
      patient('no-new', 'Bruno', null, { at: '2026-08-02T10:00:00.000Z', type: 'diet' }),
      patient('no-old', 'Duda', null, { at: '2026-07-01T10:00:00.000Z', type: 'assessment' }),
    ], TODAY);

    expect(groups.map((group) => group.id)).toEqual(['no-event', 'overdue', 'today', 'upcoming']);
    expect(groups[0].rows.map((row) => row.patient.id)).toEqual(['no-old', 'no-new']);
    expect(groups[1].rows.map((row) => row.patient.id)).toEqual(['overdue-old', 'overdue-late']);
    expect(groups[2].rows.map((row) => row.patient.id)).toEqual(['today-a', 'today-z']);
    expect(groups[3].rows.map((row) => row.patient.id)).toEqual(['future-soon', 'future-late']);
    expect(groups[1].rows[0].eventStatusLabel).toContain('Atrasado');
    expect(groups[1].rows[0].eventDateLabel).toBe('20/07');
    expect(groups[3].rows[0].eventTypeLabel).toContain('avalia');
  });

  it('filters before grouping and supports empty search results', () => {
    const patients = [
      patient('ana', 'Ana Lima', { date: TODAY, type: 'diet-update' }),
      patient('bruno', 'Bruno Reis'),
    ];

    const filtered = filterPatients(patients, 'ana');
    expect(filtered).toHaveLength(1);
    expect(buildPatientListGroups(filtered, TODAY)).toHaveLength(1);
    expect(filterPatients(patients, 'inexistente')).toEqual([]);
  });

  it('flattens the priority order into one continuous list', () => {
    const rows = buildPatientListRows([
      patient('none', 'Sem evento'),
      patient('future', 'Futuro', { date: '2026-08-10', type: 'diet-update' }),
      patient('today', 'Hoje', { date: TODAY, type: 'assessment-update' }),
      patient('overdue', 'Atrasado', { date: '2026-08-01', type: 'diet-update' }),
    ], TODAY);

    expect(rows.map((row) => row.patient.id)).toEqual(['overdue', 'today', 'future', 'none']);
  });

  it('announces overdue and future states as text', () => {
    expect(formatEventStatus({ date: '2026-08-02', type: 'diet-update' }, TODAY)).toContain('Atrasado');
    expect(formatEventStatus({ date: TODAY, type: 'diet-update' }, TODAY)).toBe('Hoje');
    expect(formatEventStatus({ date: '2026-08-04', type: 'diet-update' }, TODAY)).toBe('Em 1 dia');
    expect(formatEventStatus(null, TODAY)).toContain('Sem');
  });

});
