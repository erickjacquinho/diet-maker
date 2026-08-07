'use client';

import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
import { MetricBox } from '@/components/molecules/MetricBox';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/atoms';
import { textStyle } from '@/design-system';
import type { ActivePlanSummary, NextEventSummary } from '@/lib/patientProfileSelectors';
import type { BodyAssessment } from '@/lib/patientsStore';

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
  const metricValue = (value: string | number | undefined, unit = '') =>
    value === undefined ? 'Sem avaliação' : `${value}${unit}`;

  return (
    <section className="grid grid-cols-2 gap-4" aria-label="Contexto atual do paciente">
      <Surface className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className={textStyle('section-title')}>Indicadores atuais</h2>
          <span className={textStyle('caption')}>Última avaliação</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <MetricBox label="Peso" value={metricValue(latestAssessment?.weightKg, ' kg')} size="compact" />
          <MetricBox label="Body fat" value={metricValue(latestAssessment?.bodyFatPercent, ' %')} size="compact" />
          <MetricBox label="Massa magra" value={metricValue(latestAssessment?.muscleMassKg, ' kg')} size="compact" />
          <MetricBox label="Cintura" value={metricValue(latestAssessment?.waistCm, ' cm')} size="compact" />
        </div>
      </Surface>

      <div className="flex flex-col gap-4">
        <Surface className="flex flex-1 items-center justify-between gap-4 p-5" role="region" aria-label="Próximo acompanhamento">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-4 text-primary" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <h3 className={textStyle('card-title')}>Próximo acompanhamento</h3>
              <p className={textStyle('body-secondary')}>
                {nextEventSummary ? `${nextEventSummary.date} · ${nextEventSummary.label}` : 'Sem próximo evento'}
              </p>
            </div>
          </div>
          <Button type="button" variant="secondary" size="compact" onClick={onOpenNextEvent}>
            Definir acompanhamento
          </Button>
        </Surface>

        <Surface className="flex flex-col gap-3 p-5" aria-labelledby="current-diet-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="current-diet-title" className={textStyle('section-title')}>Plano alimentar atual</h2>
            {activePlan && <span className={textStyle('caption-strong')}>Plano vigente</span>}
          </div>
          {activePlan ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className={textStyle('card-title')}>{activePlan.name}</h3>
                <p className={textStyle('body-secondary')}>
                  {activePlan.targetKcal} kcal · {activePlan.proteinG}g P · {activePlan.carbsG}g C · {activePlan.fatsG}g G
                </p>
              </div>
              <Button asChild variant="secondary" size="compact">
                <Link href={`/pacientes/${patientId}/dieta/${activePlan.dietId}`}>
                  Abrir dieta
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className={textStyle('body-secondary')}>Nenhuma dieta ativa está vinculada a este paciente.</p>
          )}
        </Surface>
      </div>
    </section>
  );
}
