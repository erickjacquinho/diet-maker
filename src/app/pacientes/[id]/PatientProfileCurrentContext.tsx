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
import { getDaysUntilEvent } from '@/lib/patientListDateUtils';
import { calculateGPerKg } from '@/lib/nutrition/macroCalculations';
import type { ActivePlanSummary, NextEventSummary } from '@/lib/patientProfileSelectors';
import type { BodyAssessment } from '@/lib/patientRelatedRecords';

function formatAssessmentDate(dateStr?: string): string {
  if (!dateStr) return '';
  const iso = normalizeDateToISO(dateStr);
  return iso ? formatDateOnly(iso) : dateStr;
}

function formatRelativeDays(dateStr?: string): string | null {
  if (!dateStr) return null;
  const daysUntil = getDaysUntilEvent(dateStr);
  if (daysUntil === null) return null;
  if (daysUntil === 0) return 'Hoje';
  if (daysUntil === 1) return 'Amanhã';
  if (daysUntil > 1) return `Em ${daysUntil} dias`;
  const elapsedDays = Math.abs(daysUntil);
  return `Data prevista passou há ${elapsedDays} ${elapsedDays === 1 ? 'dia' : 'dias'}`;
}

export function PatientProfileCurrentContext({
  patientId,
  latestAssessment,
  activePlan,
  nextEventSummary,
  onOpenNextEvent,
  readOnly = false,
}: {
  patientId: string;
  latestAssessment: BodyAssessment | null;
  activePlan: ActivePlanSummary | null;
  nextEventSummary: NextEventSummary | null;
  onOpenNextEvent: () => void;
  readOnly?: boolean;
}) {
  const assessmentDateLabel = latestAssessment?.date
    ? formatAssessmentDate(latestAssessment.date)
    : null;

  const relativeEventDays = nextEventSummary?.date
    ? formatRelativeDays(nextEventSummary.date)
    : null;
  const daysUntilEvent = nextEventSummary?.date
    ? getDaysUntilEvent(nextEventSummary.date)
    : null;
  const weightKg = latestAssessment?.weightKg;
  const validWeightKg = typeof weightKg === 'number'
    && Number.isFinite(weightKg)
    && weightKg > 0
    ? weightKg
    : null;
  const weightLabel = validWeightKg
    ? `${validWeightKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`
    : null;
  const assessmentWeightLabel = latestAssessment?.date
    ? formatAssessmentDate(latestAssessment.date)
    : null;
  const gPerKg = activePlan && validWeightKg
    ? {
        protein: calculateGPerKg(activePlan.proteinG, validWeightKg)?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        carbs: calculateGPerKg(activePlan.carbsG, validWeightKg)?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        fats: calculateGPerKg(activePlan.fatsG, validWeightKg)?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }
    : null;
  const isCarbCycling = activePlan?.mode === 'carb_cycling';

  return (
    <div className="flex flex-col gap-6 w-full">
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

      <Surface className="flex w-full flex-col gap-6 p-6" role="region" aria-labelledby="plan-follow-up-title">
        <h2 id="plan-follow-up-title" className={textStyle('section-title')}>
          Plano e acompanhamento
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="flex min-w-0 flex-col gap-4 md:col-span-2" aria-labelledby="current-diet-title">
            <div className="flex items-center justify-between gap-3 border-b border-border-divider pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <h3 id="current-diet-title" className={textStyle('section-title')}>
                  Plano alimentar atual
                </h3>
              </div>
              <Badge variant={activePlan ? 'success' : 'neutral'}>
                {activePlan ? 'Plano ativo' : 'Sem prescrição'}
              </Badge>
            </div>

            {activePlan ? (
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h4 className={cn(textStyle('card-title'), 'truncate')}>{activePlan.name}</h4>
                    <p className={textStyle('body-secondary')}>
                      Data do plano: {formatAssessmentDate(activePlan.date) || 'Não informada'}
                    </p>
                  </div>
                  {!readOnly && (
                    <Button asChild variant="secondary" size="compact">
                      <Link href={`/pacientes/${patientId}/dieta/${activePlan.dietId}`}>
                        <span>Abrir dieta</span>
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className={textStyle('caption')}>
                      {isCarbCycling ? 'Média semanal do ciclo' : 'Metas diárias'}
                    </span>
                    <MacroSummary
                      protein={activePlan.proteinG}
                      carbs={activePlan.carbsG}
                      fats={activePlan.fatsG}
                      kcal={Math.round(activePlan.targetKcal).toLocaleString('pt-BR')}
                      className="tabular-nums"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className={textStyle('caption')}>
                      {isCarbCycling ? 'Média semanal por peso' : 'Metas por peso'}
                      {weightLabel ? ` · base: ${weightLabel}${assessmentWeightLabel ? ` em ${assessmentWeightLabel}` : ''}` : ''}
                    </span>
                    {gPerKg ? (
                      <MacroSummary
                        protein={gPerKg.protein}
                        carbs={gPerKg.carbs}
                        fats={gPerKg.fats}
                        showKcal={false}
                        unit=" g/kg"
                        className="tabular-nums"
                      />
                    ) : (
                      <p className={textStyle('body-secondary')}>
                        Sem peso de avaliação para calcular g/kg.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <h4 className={textStyle('card-title')}>Nenhuma dieta ativa</h4>
                  <p className={textStyle('body-secondary')}>
                    Nenhuma dieta ativa está vinculada a este paciente.
                  </p>
                </div>
                {!readOnly && (
                  <Button asChild variant="secondary" size="compact">
                    <Link href={`/pacientes/${patientId}/dieta/nova`}>
                      <span>Criar plano</span>
                      <Utensils className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>

          <section
            className="flex min-w-0 flex-col gap-4 border-t border-border-divider pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0"
            aria-labelledby="next-follow-up-title"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <h3 id="next-follow-up-title" className={textStyle('section-title')}>
                  Próximo acompanhamento
                </h3>
              </div>
              <Badge variant={daysUntilEvent !== null && daysUntilEvent < 0 ? 'warning' : nextEventSummary ? 'info' : 'neutral'}>
                {daysUntilEvent !== null && daysUntilEvent < 0
                  ? 'Data passou'
                  : nextEventSummary ? 'Agendado' : 'Não agendado'}
              </Badge>
            </div>

            {nextEventSummary ? (
              <div className="flex flex-col gap-1">
                <h4 className={textStyle('card-title')}>{nextEventSummary.label}</h4>
                <p className={cn(textStyle('body-secondary'), 'tabular-nums')}>
                  {formatAssessmentDate(nextEventSummary.date) || nextEventSummary.date}
                </p>
                {relativeEventDays && (
                  <p className={cn(textStyle('body-secondary'), 'font-medium')}>
                    {relativeEventDays}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <h4 className={textStyle('card-title')}>Sem acompanhamento previsto</h4>
                <p className={textStyle('body-secondary')}>
                  Nenhum acompanhamento agendado para este paciente.
                </p>
              </div>
            )}

            {!readOnly && (
              <Button type="button" variant="primary" size="compact" className="self-start" onClick={onOpenNextEvent}>
                {nextEventSummary ? 'Reagendar' : 'Definir acompanhamento'}
              </Button>
            )}
          </section>
        </div>
      </Surface>
    </div>
  );
}
