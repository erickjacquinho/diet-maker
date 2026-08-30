'use client';

import Link from 'next/link';
import { Calendar, ExternalLink, Scale, Percent, Activity, Ruler, Utensils } from 'lucide-react';
import { MetricBoxGroup } from '@/components/organisms/MetricBoxGroup';
import { Button } from '@/components/ui/button';
import { Badge, Surface } from '@/components/atoms';
import { MacroSummary } from '@/components/molecules';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { formatDateOnly, normalizeDateToISO } from '@/lib/date-only';
import type { ActivePlanSummary, NextEventSummary } from '@/lib/patientProfileSelectors';
import type { BodyAssessment } from '@/lib/patientsStore';

function formatAssessmentDate(dateStr?: string): string {
  if (!dateStr) return '';
  const iso = normalizeDateToISO(dateStr);
  return iso ? formatDateOnly(iso) : dateStr;
}

function formatRelativeDays(dateStr?: string): string | null {
  if (!dateStr) return null;
  let day: number, month: number, year: number;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    return null;
  }
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  const target = new Date(year, month, day);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays > 1) return `Em ${diffDays} dias`;
  if (diffDays < -1) return `Atrasado há ${Math.abs(diffDays)} dias`;
  return null;
}

export function PatientProfileCurrentContext({
  patientId,
  latestAssessment,
  activePlan,
  nextEventSummary,
  onOpenNextEvent,
}: {
  patientId: string;
  latestAssessment: BodyAssessment | null;
  activePlan: ActivePlanSummary | null;
  nextEventSummary: NextEventSummary | null;
  onOpenNextEvent: () => void;
}) {
  const assessmentDateLabel = latestAssessment?.date
    ? formatAssessmentDate(latestAssessment.date)
    : null;

  const relativeEventDays = nextEventSummary?.date
    ? formatRelativeDays(nextEventSummary.date)
    : null;

  return (
    <div className="flex flex-col gap-6 w-full" aria-label="Contexto atual do paciente">
      <Surface className="flex flex-col gap-4 p-5 w-full">
        <div className="flex items-center justify-between gap-3">
          <h2 className={textStyle('section-title')}>Indicadores atuais</h2>
          <span className={textStyle('caption')}>
            {assessmentDateLabel ? `Última avaliação: ${assessmentDateLabel}` : 'Sem avaliações'}
          </span>
        </div>
        <MetricBoxGroup
          items={[
            {
              label: 'Peso',
              value: latestAssessment?.weightKg ?? 'Sem avaliação',
              unit: latestAssessment?.weightKg !== undefined ? 'kg' : undefined,
              icon: <Scale aria-hidden="true" />,
            },
            {
              label: 'Body fat',
              value: latestAssessment?.bodyFatPercent ?? 'Sem avaliação',
              unit: latestAssessment?.bodyFatPercent !== undefined ? '%' : undefined,
              icon: <Percent aria-hidden="true" />,
            },
            {
              label: 'Massa magra',
              value: latestAssessment?.muscleMassKg ?? 'Sem avaliação',
              unit: latestAssessment?.muscleMassKg !== undefined ? 'kg' : undefined,
              icon: <Activity aria-hidden="true" />,
            },
            {
              label: 'Cintura',
              value: latestAssessment?.waistCm ?? 'Sem avaliação',
              unit: latestAssessment?.waistCm !== undefined ? 'cm' : undefined,
              icon: <Ruler aria-hidden="true" />,
            },
          ]}
        />
      </Surface>

      <div className="grid grid-cols-2 gap-4 w-full">
        {/* 1. Próximo acompanhamento */}
        <Surface
          className="flex flex-col justify-between gap-3.5 p-5 min-h-[148px]"
          role="region"
          aria-label="Próximo acompanhamento"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-divider pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
              <h2 className={textStyle('section-title')}>Próximo acompanhamento</h2>
            </div>
            <Badge variant={nextEventSummary ? 'info' : 'neutral'}>
              {nextEventSummary ? 'Agendado' : 'Não agendado'}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h3 className={cn(textStyle('card-title'), 'truncate')}>
                {nextEventSummary ? nextEventSummary.label : 'Sem próximo evento'}
              </h3>
              {nextEventSummary ? (
                <div className={cn(textStyle('body-secondary'), 'flex items-center gap-1.5 tabular-nums truncate')}>
                  <span className="font-semibold text-text-primary">{nextEventSummary.date}</span>
                  {relativeEventDays ? (
                    <>
                      <span className="text-text-muted">•</span>
                      <span className="font-medium text-text-muted">{relativeEventDays}</span>
                    </>
                  ) : null}
                </div>
              ) : (
                <p className={cn(textStyle('body-secondary'), 'truncate')}>
                  Nenhum acompanhamento agendado para este paciente.
                </p>
              )}
            </div>

            <Button type="button" variant="secondary" size="compact" onClick={onOpenNextEvent}>
              {nextEventSummary ? 'Reagendar' : 'Definir acompanhamento'}
            </Button>
          </div>
        </Surface>

        {/* 2. Plano alimentar atual */}
        <Surface
          className="flex flex-col justify-between gap-3.5 p-5 min-h-[148px]"
          aria-labelledby="current-diet-title"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-divider pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="size-4 text-primary shrink-0" aria-hidden="true" />
              <h2 id="current-diet-title" className={textStyle('section-title')}>
                Plano alimentar atual
              </h2>
            </div>
            <Badge variant={activePlan ? 'success' : 'neutral'}>
              {activePlan ? 'Plano ativo' : 'Sem prescrição'}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h3 className={cn(textStyle('card-title'), 'truncate')}>
                {activePlan ? activePlan.name : 'Nenhuma dieta ativa'}
              </h3>
              {activePlan ? (
                <MacroSummary
                  protein={activePlan.proteinG}
                  carbs={activePlan.carbsG}
                  fats={activePlan.fatsG}
                  kcal={activePlan.targetKcal}
                  className={cn(textStyle('body-secondary'), 'tabular-nums truncate')}
                />
              ) : (
                <p className={cn(textStyle('body-secondary'), 'truncate')}>
                  Nenhuma dieta ativa está vinculada a este paciente.
                </p>
              )}
            </div>

            {activePlan ? (
              <Button asChild variant="secondary" size="compact">
                <Link href={`/pacientes/${patientId}/dieta/${activePlan.dietId}`}>
                  <span>Abrir dieta</span>
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="compact">
                <Link href={`/pacientes/${patientId}/dieta/nova`}>
                  <span>Criar plano</span>
                  <Utensils className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}
