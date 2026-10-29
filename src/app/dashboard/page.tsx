'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { Button } from '@/components/atoms';
import { Card, CardContent } from '@/components/ui/card';
import { usePatientsPage } from '@/hooks/usePatientsPage';
import { getBrowserPatientRuntimeIfActive, getBrowserProfileSession, type BrowserPatientRuntime } from '@/lib/application/browser-composition';
import { buildAgendaSummary } from '@/lib/agenda-summary';
import { formatEventType } from '@/lib/patientListDateUtils';

const runtimeKeys = new WeakMap<BrowserPatientRuntime, number>();
let nextRuntimeKey = 0;

function weekdayLabel(date: Date) {
  const label = format(date, 'EEEE', { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getRuntimeKey(runtime: BrowserPatientRuntime) {
  let key = runtimeKeys.get(runtime);
  if (key === undefined) {
    key = ++nextRuntimeKey;
    runtimeKeys.set(runtime, key);
  }
  return key;
}

function DashboardAgenda() {
  const { patients, isLoading, error, retry } = usePatientsPage();
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const refreshToday = () => setToday(new Date());
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshToday();
    };
    refreshToday();
    window.addEventListener('focus', refreshToday);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshToday);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  const summary = useMemo(() => today ? buildAgendaSummary(patients, today) : null, [patients, today]);

  if (isLoading || !summary) {
    return <p role="status" aria-live="polite">Carregando sua semana…</p>;
  }
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-control border border-error-border bg-error-soft p-4 text-style-body text-text-primary">
        <p>Não foi possível carregar sua rotina.</p>
        <p>{error}</p>
        <Button type="button" variant="secondary" onClick={() => void retry()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <section aria-labelledby="dashboard-week-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="dashboard-week-title" className="text-style-section-title font-semibold text-text-primary">Sua semana</h2>
            <p className="text-style-body-small text-text-secondary">Domingo a sábado</p>
          </div>
          <Link className="text-style-button-label font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href="/agenda">
            Abrir agenda
          </Link>
        </div>
        <ol aria-label="Semana corrente" className="grid grid-cols-7 gap-2">
          {summary.days.map((day) => {
            const date = parseISO(day.dateKey);
            const countLabel = `${day.count} ${day.count === 1 ? 'acompanhamento' : 'acompanhamentos'}`;
            return (
              <li
                key={day.dateKey}
                aria-current={day.isToday ? 'date' : undefined}
                className={`flex min-h-24 min-w-0 flex-col gap-2 rounded-control border p-3 ${day.isToday ? 'border-primary bg-primary-soft' : 'border-border-divider bg-card'}`}
              >
                <span className="text-style-body-small text-text-secondary">{weekdayLabel(date)}</span>
                <time className="text-style-body font-semibold text-text-primary" dateTime={day.dateKey}>
                  {format(date, 'd MMM', { locale: ptBR })}
                </time>
                {day.isToday ? <span className="text-style-caption font-medium text-primary">Hoje</span> : null}
                <span aria-label={countLabel} className="text-style-body-small text-text-secondary">{countLabel}</span>
              </li>
            );
          })}
        </ol>
        {summary.days.every(({ count }) => count === 0) ? (
          <p className="rounded-control bg-surface-subtle p-4 text-style-body text-text-secondary">Nenhum acompanhamento nesta semana.</p>
        ) : null}
      </section>

      <section aria-labelledby="dashboard-actions-title" className="flex flex-col gap-4">
        <h2 id="dashboard-actions-title" className="text-style-section-title font-semibold text-text-primary">Próximas ações</h2>
        {summary.actions.length === 0 ? (
          <p className="rounded-control bg-surface-subtle p-4 text-style-body text-text-secondary">Nenhuma próxima ação nesta semana.</p>
        ) : (
          <ul aria-label="Próximas ações" className="flex flex-col gap-2">
            {summary.actions.map((action) => {
              const date = parseISO(action.dateKey);
              return (
                <li key={`${action.patientId}:${action.type}:${action.dateKey}`}>
                  <Card>
                    <CardContent className="flex min-w-0 items-center justify-between gap-4 p-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-style-body font-semibold text-text-primary">{action.patientName}</p>
                        <p className="text-style-body text-text-secondary">{formatEventType(action.type)}</p>
                        <time className="text-style-body-small text-text-muted" dateTime={action.dateKey}>
                          {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </time>
                      </div>
                      <Link
                        className="shrink-0 text-style-button-label font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        href="/agenda"
                        aria-label={`Abrir agenda para ${action.patientName}`}
                      >
                        Abrir agenda
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const session = getBrowserProfileSession();
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const activeRuntime = getBrowserPatientRuntimeIfActive();
  const runtime = snapshot.runtime && snapshot.runtime === activeRuntime ? snapshot.runtime : null;

  return (
    <section className="mx-auto flex w-full max-w-screen-xl flex-col items-start gap-8 p-8" data-route="dashboard">
      <h1 className="text-style-page-title font-bold text-text-primary">Início</h1>
      {runtime ? (
        <DashboardAgenda key={getRuntimeKey(runtime)} />
      ) : (
        <div className="flex w-full flex-col items-start gap-4 rounded-surface border border-border-divider bg-card p-6">
          <p className="text-style-body text-text-secondary">Abra um save para consultar sua semana e próximas ações.</p>
          <Button type="button" onClick={() => window.dispatchEvent(new Event('nutridiet:open-saves'))}>
            Abrir configurações de saves
          </Button>
        </div>
      )}
      <section aria-label="Assinatura" className="flex w-full items-center justify-between gap-4 border-t border-border-divider pt-4">
        <p className="text-style-body text-text-secondary">Assinatura — Em breve</p>
        <Button type="button" variant="secondary" onClick={() => window.dispatchEvent(new Event('nutridiet:open-subscription'))}>
          Gerenciar assinatura
        </Button>
      </section>
    </section>
  );
}
