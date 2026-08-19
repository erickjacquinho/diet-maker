'use client';

import Link from 'next/link';
import { Calendar, ExternalLink, Scale, Percent, Activity, Ruler } from 'lucide-react';
import { MetricBoxGroup } from '@/components/organisms/MetricBoxGroup';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/atoms';
import { textStyle } from '@/design-system';
import { formatDateOnly, normalizeDateToISO } from '@/lib/date-only';
import type { ActivePlanSummary, NextEventSummary } from '@/lib/patientProfileSelectors';
import type { BodyAssessment } from '@/lib/patientsStore';

function formatAssessmentDate(dateStr?: string): string {
  if (!dateStr) return '';
  const iso = normalizeDateToISO(dateStr);
  return iso ? formatDateOnly(iso) : dateStr;
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
  const metricValue = (value: string | number | undefined, unit = '') =>
    value === undefined ? 'Sem avaliação' : `${value}${unit}`;

  const assessmentDateLabel = latestAssessment?.date
    ? formatAssessmentDate(latestAssessment.date)
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
        <Surface className="flex flex-col gap-3 p-5" role="region" aria-label="Próximo acompanhamento">
          <div className="flex items-center justify-between gap-3">
            <h2 className={textStyle('section-title')}>Próximo acompanhamento</h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
              <p className={textStyle('body-secondary')}>
                {nextEventSummary ? `${nextEventSummary.date} · ${nextEventSummary.label}` : 'Sem próximo evento'}
              </p>
            </div>
            <Button type="button" variant="secondary" size="compact" onClick={onOpenNextEvent}>
              Definir acompanhamento
            </Button>
          </div>
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
    </div>
  );
}
