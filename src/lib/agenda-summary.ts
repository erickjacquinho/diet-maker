import { addDays, format, startOfWeek } from 'date-fns';
import type { PatientNextEventType } from '@/lib/patientsStoreTypes';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { formatEventType, getTodayDateKey, normalizeDateKey } from '@/lib/patientListDateUtils';

export function patientAppointmentDates(patient: PatientViewModel): Partial<Record<PatientNextEventType, string>> {
  const nextEvent = patient.nextEvent;
  if (!nextEvent) return {};
  if (nextEvent.dates) return nextEvent.dates;
  const types = Array.isArray(nextEvent.type) ? nextEvent.type : [nextEvent.type];
  return Object.fromEntries(types.map((type) => [type, nextEvent.date])) as Partial<Record<PatientNextEventType, string>>;
}

export function buildAgendaSummary(patients: readonly PatientViewModel[], date = new Date()) {
  const today = getTodayDateKey(date);
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, index) => format(addDays(weekStart, index), 'yyyy-MM-dd'));
  const appointments: Array<{ patientId: string; patientName: string; type: PatientNextEventType; dateKey: string }> = [];

  patients.forEach((patient) => {
    Object.entries(patientAppointmentDates(patient)).forEach(([type, value]) => {
      if (type !== 'diet-update' && type !== 'assessment-update') return;
      const dateKey = normalizeDateKey(value ?? '');
      if (dateKey) appointments.push({ patientId: patient.id, patientName: patient.name, type, dateKey });
    });
  });

  const weekEnd = weekDates[6];
  const actions = appointments
    .filter(({ dateKey }) => dateKey >= today && dateKey <= weekEnd)
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey)
      || left.patientName.localeCompare(right.patientName, 'pt-BR')
      || (formatEventType(left.type) ?? '').localeCompare(formatEventType(right.type) ?? '', 'pt-BR'));

  return {
    days: weekDates.map((dateKey) => ({
      dateKey,
      isToday: dateKey === today,
      count: appointments.filter((appointment) => appointment.dateKey === dateKey).length,
    })),
    actions,
  };
}
