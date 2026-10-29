'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock3, Plus } from 'lucide-react';
import Link from 'next/link';

import { Checkbox } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NextEventModal } from '@/components/molecules/NextEventModal';
import { textStyle } from '@/design-system';
import {
  getBrowserPatientApplication,
  getBrowserPatientRuntimeIfActive,
  persistAgendaReminderChange,
} from '@/lib/application/browser-composition';
import {
  toNextFollowUpInput,
  type PatientNextEvent,
  type PatientNextEventType,
} from '@/lib/application/patients/clinical-ui-adapter';
import { getTodayDateKey, normalizeDateKey } from '@/lib/patientListDateUtils';
import { patientAppointmentDates } from '@/lib/agenda-summary';
import type { FollowUpType, NextFollowUpDateChange } from '@/lib/domain/clinical';
import {
  addAgendaReminder,
  agendaRemindersStorageKey,
  AGENDA_REMINDERS_CHANGED,
  listAgendaReminders,
  type AgendaReminder,
  type AgendaReminderTask,
} from '@/lib/agenda-reminders';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { usePatientsPage } from '@/hooks/usePatientsPage';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type AgendaAppointment = {
  patient: PatientViewModel;
  type: PatientNextEventType;
};

type AgendaSelection = Pick<AgendaAppointment, 'type'> & { patientId: string };

function appointmentKey(appointment: AgendaSelection) {
  return `${appointment.patientId}:${appointment.type}`;
}

function toFollowUpType(type: PatientNextEventType): FollowUpType {
  return type === 'diet-update' ? 'DIET_UPDATE' : 'ASSESSMENT_UPDATE';
}

function toPatientDateUpdates(changes: readonly NextFollowUpDateChange[], includeVersion = false) {
  return changes.map(({ patientId, types, dueDate, expectedVersion }) => ({
    patientId,
    dates: Object.fromEntries(types.map((type) => [
      type === 'DIET_UPDATE' ? 'diet-update' : 'assessment-update', dueDate,
    ])) as Partial<Record<PatientNextEventType, string | null>>,
    ...(includeVersion ? { version: expectedVersion } : {}),
  }));
}

function reminderTaskLabel(task: AgendaReminderTask) {
  return task === 'diet-update' ? 'Atualização de dieta' : 'Avaliação física';
}

function PendingPatientList({
  id,
  title,
  taskLabel,
  appointments,
  getHref,
  selectionMode,
  selectedAppointments,
  onToggleAppointment,
}: {
  id: string;
  title: string;
  taskLabel: string;
  appointments: AgendaAppointment[];
  getHref: (patientId: string) => string;
  selectionMode: boolean;
  selectedAppointments: AgendaSelection[];
  onToggleAppointment: (appointment: AgendaSelection) => void;
}) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="mb-2 text-style-body-small font-semibold text-text-primary">
        {title} ({appointments.length})
      </h3>
      {appointments.length > 0 ? (
        <ul className="rounded-control border border-border-subtle">
          {appointments.map(({ patient, type }) => {
            const selection = { patientId: patient.id, type };
            const selected = selectedAppointments.some((item) => appointmentKey(item) === appointmentKey(selection));
            return (
              <li
                key={appointmentKey(selection)}
                className={cn(
                  'group flex h-control-compact items-center border-b border-border-divider last:border-b-0 hover:bg-surface-hover',
                  selected && 'bg-primary-soft',
                )}
              >
                {selectionMode ? (
                  <div className="flex h-full w-full items-center gap-2 px-2">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onToggleAppointment(selection)}
                      aria-label={`Selecionar ${taskLabel} de ${patient.name} para remanejar`}
                      className="shrink-0"
                    />
                    <span className="truncate text-style-body-small text-text-primary">{patient.name}</span>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-between gap-2 px-2">
                    <span className="truncate text-style-body-small text-text-primary">{patient.name}</span>
                    <Button
                      asChild
                      variant="quiet"
                      size="compact"
                      className="opacity-subdued transition-opacity group-hover:opacity-full focus-visible:opacity-full motion-reduce:transition-none"
                    >
                      <Link
                        href={getHref(patient.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir ${taskLabel} de ${patient.name} em nova aba`}
                      >
                        Abrir
                      </Link>
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-control border border-border-subtle bg-surface-subtle px-3 py-2 text-style-body-small text-text-muted">
          Ninguém pendente nesta data.
        </p>
      )}
    </section>
  );
}

interface AgendaUndoEntry {
  changes: NextFollowUpDateChange[];
  current: NextFollowUpDateChange[];
}

export default function AgendaPage() {
  const {
    patients,
    total,
    isLoading,
    error,
    retry,
    updateNextFollowUpDates,
  } = usePatientsPage();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [isSelectingAppointments, setIsSelectingAppointments] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<AgendaSelection[]>([]);
  const [isPatientPickerOpen, setIsPatientPickerOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [draggedDate, setDraggedDate] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [moveSourceDate, setMoveSourceDate] = useState<string | null>(null);
  const [moveTargetDate, setMoveTargetDate] = useState('');
  const [moveSelections, setMoveSelections] = useState<AgendaSelection[] | null>(null);
  const [isMovingEvents, setIsMovingEvents] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const undoStackRef = useRef<AgendaUndoEntry[]>([]);
  const isMovingEventsRef = useRef(false);
  const [reminderAccountId, setReminderAccountId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<AgendaReminder[]>([]);
  const [reminderDate, setReminderDate] = useState<string | null>(null);
  const [reminderTask, setReminderTask] = useState<AgendaReminderTask>('diet-update');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  useEffect(() => {
    const accountId = getBrowserPatientRuntimeIfActive()?.account.id;
    if (!accountId) return undefined;
    setReminderAccountId(accountId);

    const refreshReminders = () => setReminders(listAgendaReminders(accountId));
    const handleStorage = (event: StorageEvent) => {
      if (event.key === agendaRemindersStorageKey(accountId)) refreshReminders();
    };
    refreshReminders();
    window.addEventListener(AGENDA_REMINDERS_CHANGED, refreshReminders);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(AGENDA_REMINDERS_CHANGED, refreshReminders);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);
  const weeks = useMemo(
    () => Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7)),
    [days],
  );
  const eventsByDate = useMemo(() => {
    const events = new Map<string, AgendaAppointment[]>();
    patients.forEach((patient) => {
      Object.entries(patientAppointmentDates(patient)).forEach(([type, date]) => {
        const dateKey = normalizeDateKey(date ?? '');
        if (!dateKey || (type !== 'diet-update' && type !== 'assessment-update')) return;
        events.set(dateKey, [
          ...(events.get(dateKey) ?? []),
          { patient, type },
        ]);
      });
    });
    return events;
  }, [patients]);
  const remindersByDate = useMemo(() => {
    const grouped = new Map<string, AgendaReminder[]>();
    reminders.forEach((reminder) => {
      grouped.set(reminder.date, [...(grouped.get(reminder.date) ?? []), reminder]);
    });
    grouped.forEach((items) => items.sort((left, right) => left.time.localeCompare(right.time)));
    return grouped;
  }, [reminders]);
  const sortedPatients = useMemo(
    () => [...patients].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
    [patients],
  );
  const activePatient = patients.find((patient) => patient.id === activePatientId) ?? null;
  const activeDateAppointments = activeDate ? eventsByDate.get(activeDate) ?? [] : [];
  const activeDietAppointments = activeDateAppointments
    .filter((appointment) => appointment.type === 'diet-update')
    .sort((left, right) => left.patient.name.localeCompare(right.patient.name, 'pt-BR'));
  const activeAssessmentAppointments = activeDateAppointments
    .filter((appointment) => appointment.type === 'assessment-update')
    .sort((left, right) => left.patient.name.localeCompare(right.patient.name, 'pt-BR'));
  const activeDateLabel = activeDate
    ? format(parseISO(activeDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';
  const modalNextEvent: PatientNextEvent | null = activePatient?.nextEvent
    ? {
        ...activePatient.nextEvent,
        date: normalizeDateKey(activePatient.nextEvent.date) ?? '',
        ...(activePatient.nextEvent.dates ? {
          dates: Object.fromEntries(Object.entries(activePatient.nextEvent.dates).map(([type, date]) => [
            type,
            normalizeDateKey(date) ?? date,
          ])) as PatientNextEvent['dates'],
        } : {}),
      }
    : null;
  const monthLabel = format(visibleMonth, 'MMMM yyyy', { locale: ptBR });
  const todayKey = getTodayDateKey();

  const replaceUndoStack = useCallback((stack: AgendaUndoEntry[]) => {
    undoStackRef.current = stack;
    setUndoCount(stack.length);
  }, []);

  const undoLastMove = useCallback(async () => {
    const stack = undoStackRef.current;
    const entry = stack[stack.length - 1];
    if (!entry || isMovingEventsRef.current) return;

    isMovingEventsRef.current = true;
    setIsMovingEvents(true);
    updateNextFollowUpDates(toPatientDateUpdates(entry.changes));
    try {
      const application = await getBrowserPatientApplication();
      const moved = await application.moveNextFollowUps(entry.changes);
      if (moved.length !== entry.changes.length) throw new Error('Não foi possível confirmar a reversão de todos os acompanhamentos.');
      const versions = new Map(moved.map(({ after }) => [after.patientId, after.version]));
      updateNextFollowUpDates(moved.map(({ after }) => ({
        patientId: after.patientId,
        dates: {
          'assessment-update': after.dueDates?.ASSESSMENT_UPDATE ?? null,
          'diet-update': after.dueDates?.DIET_UPDATE ?? null,
        },
        version: after.version,
      })));
      const previous = stack.slice(0, -1).map((move) => ({
        changes: move.changes.map((change) => {
          const expectedVersion = versions.get(change.patientId);
          return expectedVersion === undefined ? change : { ...change, expectedVersion };
        }),
        current: move.current.map((item) => {
          const version = versions.get(item.patientId);
          return version === undefined ? item : { ...item, expectedVersion: version };
        }),
      }));
      replaceUndoStack(previous);
      toast.success('Movimentação desfeita.');
    } catch (cause) {
      updateNextFollowUpDates(toPatientDateUpdates(entry.current, true));
      toast.error(cause instanceof Error ? cause.message : 'Não foi possível desfazer a movimentação.');
    } finally {
      isMovingEventsRef.current = false;
      setIsMovingEvents(false);
    }
  }, [replaceUndoStack, updateNextFollowUpDates]);

  useEffect(() => {
    const handleUndoShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.key.toLowerCase() !== 'z') return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.isContentEditable || target?.closest('input, textarea, select, [role="textbox"], [role="combobox"], [role="dialog"], [role="menu"]')) return;
      if (undoStackRef.current.length === 0) return;
      event.preventDefault();
      void undoLastMove();
    };
    window.addEventListener('keydown', handleUndoShortcut);
    return () => window.removeEventListener('keydown', handleUndoShortcut);
  }, [undoLastMove]);

  const moveAppointments = async (sourceDate: string, targetDate: string, selections?: AgendaSelection[]) => {
    if (sourceDate === targetDate || isMovingEventsRef.current) return false;
    const requestedKeys = selections ? new Set(selections.map(appointmentKey)) : null;
    const sourceAppointments = (eventsByDate.get(sourceDate) ?? []).filter(
      (appointment) => !requestedKeys || requestedKeys.has(appointmentKey({ patientId: appointment.patient.id, type: appointment.type })),
    );
    if (sourceAppointments.length === 0) return false;
    if (requestedKeys && sourceAppointments.length !== requestedKeys.size) {
      toast.error('Atualize a agenda antes de mover os acompanhamentos.');
      return false;
    }
    if (sourceAppointments.some(({ patient }) => !patient.nextEvent || typeof patient.nextEvent.version !== 'number')) {
      toast.error('Atualize a agenda antes de mover os acompanhamentos.');
      return false;
    }

    const changesByPatient = new Map<string, NextFollowUpDateChange>();
    sourceAppointments.forEach(({ patient, type }) => {
      const followUpType = toFollowUpType(type);
      const existing = changesByPatient.get(patient.id);
      if (existing) {
        if (!existing.types.includes(followUpType)) existing.types.push(followUpType);
      } else {
        changesByPatient.set(patient.id, {
          patientId: patient.id,
          types: [followUpType],
          expectedVersion: patient.nextEvent!.version!,
          dueDate: targetDate,
        });
      }
    });
    const changes = [...changesByPatient.values()];
    const previous = changes.map((change) => ({
      ...change,
      dueDate: sourceDate,
    }));
    isMovingEventsRef.current = true;
    setIsMovingEvents(true);
    updateNextFollowUpDates(toPatientDateUpdates(changes));
    try {
      const application = await getBrowserPatientApplication();
      const moved = await application.moveNextFollowUps(changes);
      if (moved.length !== changes.length) throw new Error('Não foi possível confirmar todos os acompanhamentos movidos.');
      updateNextFollowUpDates(moved.map(({ after }) => ({
        patientId: after.patientId,
        dates: {
          'assessment-update': after.dueDates?.ASSESSMENT_UPDATE ?? null,
          'diet-update': after.dueDates?.DIET_UPDATE ?? null,
        },
        version: after.version,
      })));

      const changedTypesByPatient = new Map(changes.map((change) => [change.patientId, change.types]));
      replaceUndoStack([...undoStackRef.current, {
        changes: moved.map(({ before, after }) => ({
          patientId: before.patientId,
          types: changedTypesByPatient.get(before.patientId) ?? [],
          expectedVersion: after.version,
          dueDate: sourceDate,
        })),
        current: moved.map(({ after }) => ({
          patientId: after.patientId,
          types: changedTypesByPatient.get(after.patientId) ?? [],
          expectedVersion: after.version,
          dueDate: targetDate,
        })),
      }]);
      const movedCount = changes.reduce((count, change) => count + change.types.length, 0);
      toast.success('Acompanhamentos movidos.', {
        description: `${movedCount} ${movedCount === 1 ? 'acompanhamento movido' : 'acompanhamentos movidos'}. Ctrl+Z para desfazer.`,
        action: { label: 'Desfazer', onClick: () => { void undoLastMove(); } },
      });
      if (selections) {
        setActiveDate(null);
        setIsSelectingAppointments(false);
        setSelectedAppointments([]);
      }
      return true;
    } catch (cause) {
      updateNextFollowUpDates(toPatientDateUpdates(previous, true));
      toast.error(cause instanceof Error ? cause.message : 'Não foi possível mover os acompanhamentos.');
      return false;
    } finally {
      isMovingEventsRef.current = false;
      setIsMovingEvents(false);
    }
  };

  const openNewEvent = () => setIsPatientPickerOpen(true);

  const openMoveDialog = (date: string, selections?: AgendaSelection[]) => {
    setMoveSourceDate(date);
    setMoveTargetDate('');
    setMoveSelections(selections ?? null);
  };

  const closeMoveDialog = () => {
    setMoveSourceDate(null);
    setMoveTargetDate('');
    setMoveSelections(null);
  };

  const toggleAppointmentSelection = (selection: AgendaSelection) => {
    const key = appointmentKey(selection);
    setSelectedAppointments((current) => current.some((item) => appointmentKey(item) === key)
      ? current.filter((item) => appointmentKey(item) !== key)
      : [...current, selection]);
  };

  const openReminderDialog = (date: string, dietCount: number, assessmentCount: number) => {
    setReminderDate(date);
    setReminderTask(assessmentCount > 0 && dietCount === 0 ? 'assessment-update' : 'diet-update');
    setReminderTime('');
    setReminderError(null);
    setIsReminderDialogOpen(true);
  };

  const saveReminder = async () => {
    if (isSavingReminder) return;
    if (!reminderAccountId || !reminderDate || !reminderTime) {
      setReminderError('Escolha uma tarefa e um horário.');
      return;
    }

    const dueAt = new Date(`${reminderDate}T${reminderTime}:00`);
    if (Number.isNaN(dueAt.getTime()) || dueAt.getTime() <= Date.now()) {
      setReminderError('Escolha um horário futuro.');
      return;
    }

    setIsSavingReminder(true);
    const reminder: AgendaReminder = {
      id: nanoid(),
      date: reminderDate,
      time: reminderTime,
      task: reminderTask,
    };
    if (!addAgendaReminder(reminderAccountId, reminder)) {
      setReminderError('Não foi possível guardar o lembrete neste navegador.');
      setIsSavingReminder(false);
      return;
    }

    setIsReminderDialogOpen(false);
    try {
      await persistAgendaReminderChange(reminderAccountId);
      toast.success('Lembrete agendado e salvo no arquivo principal.');
    } catch {
      toast.error('Lembrete agendado neste navegador, mas não salvo no arquivo principal. Tente salvar as alterações novamente.');
    } finally {
      setIsSavingReminder(false);
    }
  };

  const selectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    setIsPatientPickerOpen(false);
    setIsEventModalOpen(true);
  };

  const saveEvent = async (event: PatientNextEvent) => {
    if (!activePatientId) throw new Error('Selecione um paciente.');
    const application = await getBrowserPatientApplication();
    const current = await application.getNextFollowUp(activePatientId);
    await application.setNextFollowUp(
      activePatientId,
      current?.version ?? null,
      toNextFollowUpInput(event),
    );
    toast.success('Próximo acompanhamento salvo.');
    await retry();
  };

  const clearEvent = async () => {
    if (!activePatientId) return;
    const application = await getBrowserPatientApplication();
    const current = await application.getNextFollowUp(activePatientId);
    if (!current) return;
    await application.clearNextFollowUp(activePatientId, current.version);
    toast.success('Próximo acompanhamento removido.');
    await retry();
  };

  return (
    <div className="flex min-h-full w-full flex-col gap-4 px-8 py-4">
      <header>
        <h1 className={textStyle('section-title')}>Agenda</h1>
        <p className={cn(textStyle('legal'), 'mt-1 text-text-muted')}>
          Próximos acompanhamentos dos pacientes.
        </p>
      </header>

      {isLoading ? (
        <div role="status" className="py-16 text-center text-style-body-small text-text-muted">
          Carregando acompanhamentos...
        </div>
      ) : error ? (
        <Card className="mx-auto my-8 max-w-md rounded-surface border-border-subtle bg-surface p-0">
          <CardContent className="flex flex-col gap-4 p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-surface border border-error-border bg-error-soft text-error">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-style-body text-text-primary">Não foi possível carregar a agenda</h2>
              <p className="mt-1 text-style-legal leading-relaxed text-text-muted">{error}</p>
            </div>
            <Button type="button" variant="secondary" size="compact" onClick={() => void retry()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="flex flex-1 flex-col rounded-surface border border-border-subtle bg-surface">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-4 py-3">
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" size="compact" onClick={() => setVisibleMonth(startOfMonth(new Date()))}>
                Hoje
              </Button>
              {undoCount > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  aria-keyshortcuts="Control+Z Meta+Z"
                  title="Desfazer última movimentação (Ctrl+Z)"
                  onClick={() => { void undoLastMove(); }}
                  disabled={isMovingEvents}
                >
                  Desfazer
                </Button>
              )}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  iconOnly
                  aria-label="Mês anterior"
                  onClick={() => setVisibleMonth((month) => startOfMonth(subMonths(month, 1)))}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  iconOnly
                  aria-label="Próximo mês"
                  onClick={() => setVisibleMonth((month) => startOfMonth(addMonths(month, 1)))}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
              <h2 className="text-style-subsection-title font-semibold text-text-primary">
                {monthLabel.charAt(0).toLocaleUpperCase('pt-BR') + monthLabel.slice(1)}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span aria-label="Visualização atual: mês" className="inline-flex h-control-compact items-center rounded-control border border-border-subtle px-3 text-style-button-label text-text-primary">
                Mês
              </span>
              <Button type="button" variant="primary" size="compact" onClick={openNewEvent} disabled={total === 0}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                Novo evento
              </Button>
            </div>
          </div>

          <div role="table" aria-label={`Agenda de ${monthLabel}`} className="flex flex-1 flex-col">
            <div role="row" className="grid h-10 shrink-0 grid-cols-7 divide-x divide-border-subtle border-b border-border-subtle">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday} role="columnheader" className="flex items-center justify-center text-style-caption font-medium text-text-muted">
                  {weekday}
                </div>
              ))}
            </div>
            <div
              role="rowgroup"
              className="grid flex-1 auto-rows-fr"
            >
              {weeks.map((week, weekIndex) => (
                <div key={format(week[0], 'yyyy-MM-dd')} role="row" className="grid grid-cols-7 divide-x divide-border-subtle border-b border-border-subtle last:border-b-0">
                  {week.map((day, dayIndex) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate.get(dateKey) ?? [];
                    const dietCount = dayEvents.filter((appointment) => appointment.type === 'diet-update').length;
                    const assessmentCount = dayEvents.filter((appointment) => appointment.type === 'assessment-update').length;
                    const dayReminders = remindersByDate.get(dateKey) ?? [];
                    const isToday = dateKey === todayKey;
                    const dietLabel = `${dietCount} ${dietCount === 1 ? 'atualização de dieta' : 'atualizações de dieta'}`;
                    const assessmentLabel = `${assessmentCount} ${assessmentCount === 1 ? 'avaliação física' : 'avaliações físicas'}`;
                    const appointmentLabels = [dietCount > 0 ? dietLabel : null, assessmentCount > 0 ? assessmentLabel : null]
                      .filter(Boolean)
                      .join(' e ');

                    return (
                      <ContextMenu.Root key={dateKey}>
                        <ContextMenu.Trigger asChild>
                          <div
                            role="cell"
                            className={cn(
                              'min-h-24 p-2',
                              !isSameMonth(day, visibleMonth) && 'bg-surface-subtle/40',
                              dragOverDate === dateKey && draggedDate !== dateKey && 'bg-surface-hover',
                              weekIndex === weeks.length - 1 && dayIndex === 0 && 'rounded-bl-surface',
                              weekIndex === weeks.length - 1 && dayIndex === 6 && 'rounded-br-surface',
                            )}
                            onDragOver={(event) => {
                              if (!draggedDate || draggedDate === dateKey || isMovingEvents) return;
                              event.preventDefault();
                              event.dataTransfer.dropEffect = 'move';
                              setDragOverDate(dateKey);
                            }}
                            onDragLeave={(event) => {
                              if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                              if (dragOverDate === dateKey) setDragOverDate(null);
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              const sourceDate = event.dataTransfer.getData('text/plain');
                              setDraggedDate(null);
                              setDragOverDate(null);
                              if (sourceDate) void moveAppointments(sourceDate, dateKey);
                            }}
                          >
                            <div className="mb-2 flex h-6 items-center">
                              <span
                                aria-current={isToday ? 'date' : undefined}
                                className={cn(
                                  'flex size-6 items-center justify-center rounded-control text-style-caption',
                                  isToday ? 'bg-primary text-on-primary' : 'text-text-primary',
                                  !isSameMonth(day, visibleMonth) && 'text-text-muted',
                                )}
                              >
                                {format(day, 'd')}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {dietCount + assessmentCount > 0 && (
                                <Button
                                  type="button"
                                  variant="quiet"
                                  size="compact"
                                  draggable={!isMovingEvents}
                                  disabled={isMovingEvents}
                                  aria-haspopup="dialog"
                                  aria-label={`Abrir pendências: ${appointmentLabels} em ${format(day, "d 'de' MMMM yyyy", { locale: ptBR })}`}
                                  title="Arraste para mover os acompanhamentos. Ctrl+Z desfaz a última movimentação."
                                  onClick={() => setActiveDate(dateKey)}
                                  onDragStart={(event) => {
                                    if (isMovingEvents) {
                                      event.preventDefault();
                                      return;
                                    }
                                    event.dataTransfer.effectAllowed = 'move';
                                    event.dataTransfer.setData('text/plain', dateKey);
                                    setDraggedDate(dateKey);
                                  }}
                                  onDragEnd={() => {
                                    setDraggedDate(null);
                                    setDragOverDate(null);
                                  }}
                                  className={cn(
                                    'group flex h-auto w-full cursor-grab flex-col gap-1 rounded-control border border-border-subtle bg-surface-subtle px-2 py-2 text-left text-style-legal font-medium text-text-primary transition-colors hover:border-primary-focus focus-visible:border-primary-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:cursor-grabbing motion-reduce:transition-none',
                                    draggedDate === dateKey && 'opacity-disabled',
                                  )}
                                >
                                  {dietCount > 0 && (
                                    <span className="truncate text-text-primary group-hover:text-primary">
                                      {dietLabel}
                                    </span>
                                  )}
                                  {assessmentCount > 0 && (
                                    <span className="truncate text-text-primary group-hover:text-primary">
                                      {assessmentLabel}
                                    </span>
                                  )}
                                </Button>
                              )}
                              {dayReminders.map((reminder) => (
                                <Badge key={reminder.id} variant="neutral" className="w-full min-w-0 justify-start gap-1 font-medium">
                                  <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
                                  <time dateTime={`${reminder.date}T${reminder.time}`}>{reminder.time}</time>
                                  <span className="min-w-0 truncate">{reminderTaskLabel(reminder.task)}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </ContextMenu.Trigger>
                        <ContextMenu.Portal>
                          <ContextMenu.Content className="z-dropdown min-w-40 rounded-control border border-border-subtle bg-surface p-1 text-text-primary shadow-floating outline-none">
                            {dayEvents.length > 0 && (
                              <ContextMenu.Item
                                disabled={isMovingEvents}
                                onSelect={() => openMoveDialog(dateKey)}
                                className="flex cursor-default select-none items-center rounded-control px-3 py-2 text-style-nav-item text-text-secondary outline-none focus:bg-surface-hover focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:text-text-muted"
                              >
                                Mover acompanhamentos...
                              </ContextMenu.Item>
                            )}
                            <ContextMenu.Item
                              disabled={isMovingEvents}
                              onSelect={() => openReminderDialog(dateKey, dietCount, assessmentCount)}
                              className="flex cursor-default select-none items-center rounded-control px-3 py-2 text-style-nav-item text-text-secondary outline-none focus:bg-surface-hover focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:text-text-muted"
                            >
                              Agendar lembrete
                            </ContextMenu.Item>
                          </ContextMenu.Content>
                        </ContextMenu.Portal>
                      </ContextMenu.Root>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Dialog open={isPatientPickerOpen} onOpenChange={setIsPatientPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo acompanhamento</DialogTitle>
            <DialogDescription>
              Escolha o paciente para definir ou editar as datas de dieta e avaliação física.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <span id="agenda-patient-label" className={textStyle('field-label')}>Paciente</span>
            <Select onValueChange={selectPatient}>
              <SelectTrigger aria-labelledby="agenda-patient-label">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent layer="modal">
                <SelectGroup>
                  {sortedPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={moveSourceDate !== null}
        onOpenChange={(open) => {
          if (!open && !isMovingEvents) closeMoveDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover acompanhamentos</DialogTitle>
            <DialogDescription>
              {moveSelections
                ? `Escolha a nova data para ${moveSelections.length} ${moveSelections.length === 1 ? 'acompanhamento selecionado' : 'acompanhamentos selecionados'} de ${moveSourceDate ? format(parseISO(moveSourceDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}.`
                : `Escolha a nova data para os acompanhamentos de ${moveSourceDate ? format(parseISO(moveSourceDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor="agenda-move-date" className={textStyle('field-label')}>Nova data</label>
            <Input
              id="agenda-move-date"
              type="date"
              value={moveTargetDate}
              onChange={(event) => setMoveTargetDate(event.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" size="compact" onClick={closeMoveDialog} disabled={isMovingEvents}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="compact"
              disabled={!moveTargetDate || moveTargetDate === moveSourceDate || isMovingEvents}
              onClick={() => {
                if (moveSourceDate && moveTargetDate) {
                  void moveAppointments(moveSourceDate, moveTargetDate, moveSelections ?? undefined).then((moved) => {
                    if (moved) {
                      closeMoveDialog();
                    }
                  });
                }
              }}
            >
              {isMovingEvents ? 'Movendo...' : 'Mover acompanhamentos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar lembrete</DialogTitle>
            <DialogDescription>
              Defina a tarefa e o horário para {reminderDate ? format(parseISO(reminderDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span id="agenda-reminder-task-label" className={textStyle('field-label')}>Tarefa</span>
              <Select value={reminderTask} onValueChange={(value) => setReminderTask(value as AgendaReminderTask)}>
                <SelectTrigger aria-labelledby="agenda-reminder-task-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent layer="modal">
                  <SelectGroup>
                    <SelectItem value="diet-update">Atualização de dieta</SelectItem>
                    <SelectItem value="assessment-update">Avaliação física</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="agenda-reminder-time" className={textStyle('field-label')}>Horário</label>
              <Input
                id="agenda-reminder-time"
                type="time"
                value={reminderTime}
                onChange={(event) => {
                  setReminderTime(event.target.value);
                  setReminderError(null);
                }}
                aria-invalid={reminderError ? 'true' : undefined}
                required
              />
            </div>
            {reminderError && <p role="alert" className={textStyle('validation-error')}>{reminderError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" size="compact" onClick={() => setIsReminderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" size="compact" onClick={saveReminder} disabled={!reminderTime || !reminderAccountId || isSavingReminder}>
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDate(null);
            setIsSelectingAppointments(false);
            setSelectedAppointments([]);
          }
        }}
      >
        {activeDate && (
          <DialogContent className="flex h-full max-h-dialog flex-col">
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle>Acompanhamentos pendentes</DialogTitle>
                  <DialogDescription className="mt-2">
                    {isSelectingAppointments
                      ? `Selecione os acompanhamentos de ${activeDateLabel} que deseja remanejar.`
                      : `Pendências de ${activeDateLabel}.`}
                  </DialogDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  className="shrink-0"
                  aria-pressed={isSelectingAppointments}
                  onClick={() => {
                    if (isSelectingAppointments) setSelectedAppointments([]);
                    setIsSelectingAppointments((current) => !current);
                  }}
                  disabled={isMovingEvents}
                >
                  {isSelectingAppointments ? 'Cancelar seleção' : 'Remanejar'}
                </Button>
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                <PendingPatientList
                  id="diet-follow-ups-title"
                  title="Atualizações de dieta"
                  taskLabel="atualização de dieta"
                  appointments={activeDietAppointments}
                  getHref={(patientId) => `/pacientes/${patientId}`}
                  selectionMode={isSelectingAppointments}
                  selectedAppointments={selectedAppointments}
                  onToggleAppointment={toggleAppointmentSelection}
                />
                <PendingPatientList
                  id="assessment-follow-ups-title"
                  title="Avaliações físicas"
                  taskLabel="avaliação física"
                  appointments={activeAssessmentAppointments}
                  getHref={(patientId) => `/pacientes/${patientId}/avaliacao/nova`}
                  selectionMode={isSelectingAppointments}
                  selectedAppointments={selectedAppointments}
                  onToggleAppointment={toggleAppointmentSelection}
                />
              </div>
            </div>
            {isSelectingAppointments && (
              <DialogFooter>
                <span role="status" aria-live="polite" className="mr-auto text-style-body-small text-text-secondary">
                  {selectedAppointments.length} {selectedAppointments.length === 1 ? 'acompanhamento selecionado' : 'acompanhamentos selecionados'}
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="compact"
                  disabled={selectedAppointments.length === 0 || isMovingEvents}
                  onClick={() => openMoveDialog(activeDate, selectedAppointments)}
                >
                  Mover selecionados
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>

      {activePatient && (
        <NextEventModal
          open={isEventModalOpen}
          nextEvent={modalNextEvent}
          onOpenChange={setIsEventModalOpen}
          onSave={saveEvent}
          onClear={clearEvent}
        />
      )}
    </div>
  );
}
