import { describe, expect, it } from 'vitest';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { buildAgendaSummary, patientAppointmentDates } from '@/lib/agenda-summary';

type NextEvent = NonNullable<PatientViewModel['nextEvent']>;

function patient(id: string, name: string, nextEvent: NextEvent | null = null): PatientViewModel {
  return {
    id,
    name,
    age: 0,
    gender: '',
    heightCm: 0,
    weightKg: 0,
    targetKcal: 0,
    targetProtein: 0,
    targetCarbs: 0,
    targetFats: 0,
    objective: '',
    lastConsultation: '',
    initials: '',
    nextEvent,
  };
}

function localDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12);
}

describe('agenda summary', () => {
  it('projects Sunday through Saturday and sorts every action from today through Saturday', () => {
    const summary = buildAgendaSummary([
      patient('past', 'Paciente passado', { date: '2026-06-14', type: 'diet-update' }),
      patient('beatriz', 'Beatriz Teste', {
        date: '2026-06-17',
        type: ['diet-update', 'assessment-update'],
        dates: { 'diet-update': '2026-06-17', 'assessment-update': '2026-06-17' },
      }),
      patient('ana', 'Ana Teste', { date: '2026-06-17', type: 'assessment-update' }),
      patient('tomorrow', 'Paciente amanhã', { date: '2026-06-18', type: 'diet-update' }),
      patient('saturday', 'Paciente sábado', { date: '2026-06-20', type: 'assessment-update' }),
      patient('next-week', 'Paciente próxima semana', { date: '2026-06-21', type: 'diet-update' }),
    ], localDate(2026, 6, 17));

    expect(summary.days.map(({ dateKey, count, isToday }) => [dateKey, count, isToday])).toEqual([
      ['2026-06-14', 1, false],
      ['2026-06-15', 0, false],
      ['2026-06-16', 0, false],
      ['2026-06-17', 3, true],
      ['2026-06-18', 1, false],
      ['2026-06-19', 0, false],
      ['2026-06-20', 1, false],
    ]);
    expect(summary.actions.map(({ patientId, type, dateKey }) => [patientId, type, dateKey])).toEqual([
      ['ana', 'assessment-update', '2026-06-17'],
      ['beatriz', 'assessment-update', '2026-06-17'],
      ['beatriz', 'diet-update', '2026-06-17'],
      ['tomorrow', 'diet-update', '2026-06-18'],
      ['saturday', 'assessment-update', '2026-06-20'],
    ]);
  });

  it('keeps per-type dates and uses the legacy date only when the dates map is absent', () => {
    const splitDates = patient('split', 'Paciente dividido', {
      date: '2026-06-17',
      type: ['diet-update', 'assessment-update'],
      dates: { 'diet-update': '2026-06-16', 'assessment-update': '2026-06-19' },
    });
    const legacy = patient('legacy', 'Paciente legado', {
      date: '2026-06-18',
      type: ['diet-update', 'assessment-update'],
    });

    expect(patientAppointmentDates(splitDates)).toBe(splitDates.nextEvent!.dates);
    expect(patientAppointmentDates(legacy)).toEqual({
      'diet-update': '2026-06-18',
      'assessment-update': '2026-06-18',
    });
    expect(buildAgendaSummary([splitDates, legacy], localDate(2026, 6, 14)).actions.map(({ patientId, dateKey }) => [patientId, dateKey])).toEqual([
      ['split', '2026-06-16'],
      ['legacy', '2026-06-18'],
      ['legacy', '2026-06-18'],
      ['split', '2026-06-19'],
    ]);
  });

  it('ignores invalid dates and does not fall back when an empty dates map exists', () => {
    const invalid = patient('invalid', 'Paciente inválido', {
      date: '2026-02-24',
      type: 'diet-update',
      dates: { 'diet-update': '2026-02-30', 'assessment-update': 'não é data' },
    });
    const emptyMap = patient('empty-map', 'Paciente sem datas', {
      date: '2026-02-24',
      type: 'diet-update',
      dates: {},
    });

    const summary = buildAgendaSummary([invalid, emptyMap, patient('none', 'Sem acompanhamento')], localDate(2026, 2, 24));

    expect(summary.days).toHaveLength(7);
    expect(summary.days.every(({ count }) => count === 0)).toBe(true);
    expect(summary.actions).toEqual([]);
  });

  it('keeps local date keys across month and year boundaries', () => {
    const summary = buildAgendaSummary([
      patient('sunday', 'Domingo', { date: '2026-12-27', type: 'diet-update' }),
      patient('new-year-eve', 'Véspera', { date: '2026-12-31', type: 'assessment-update' }),
      patient('new-year', 'Ano novo', { date: '2027-01-01', type: 'diet-update' }),
      patient('saturday', 'Sábado', { date: '2027-01-02', type: 'assessment-update' }),
      patient('next-sunday', 'Domingo seguinte', { date: '2027-01-03', type: 'diet-update' }),
    ], localDate(2026, 12, 30));

    expect(summary.days.map(({ dateKey }) => dateKey)).toEqual([
      '2026-12-27', '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02',
    ]);
    expect(summary.actions.map(({ patientId }) => patientId)).toEqual(['new-year-eve', 'new-year', 'saturday']);
  });
});
