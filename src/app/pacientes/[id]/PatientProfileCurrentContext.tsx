'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Badge, SelectField, Surface } from '@/components/atoms';
import { MacroSummary } from '@/components/molecules';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { textStyle } from '@/design-system';
import { formatDateOnly, normalizeDateToISO } from '@/lib/date-only';
import type { HistoricalDiet } from '@/lib/patientsStoreTypes';
import type { BodyAssessment } from '@/lib/patientRelatedRecords';

const PROGRESS_PERIODS = [
  { value: '30d', label: '30 dias' },
  { value: '2m', label: '2 meses' },
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
] as const;

function formatDate(value?: string): string {
  if (!value) return '';
  const iso = normalizeDateToISO(value);
  return iso ? formatDateOnly(iso) : value;
}

function formatNumber(value: number | undefined, maximumFractionDigits: 0 | 1 = 1): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toLocaleString('pt-BR', { maximumFractionDigits });
}

function formatMeasurement(value: number | undefined, unit: string): string {
  const formatted = formatNumber(value);
  return formatted === '—' ? formatted : `${formatted} ${unit}`;
}

export function PatientProfileCurrentContext({
  patientId,
  latestDiet,
  latestAssessment,
  readOnly = false,
}: {
  patientId: string;
  latestDiet: HistoricalDiet | null;
  latestAssessment: BodyAssessment | null;
  readOnly?: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-3 gap-4">
      <Surface
        className="col-span-2 flex min-w-0 flex-col gap-4"
        role="region"
        aria-labelledby="current-progress-title"
      >
        <div className="flex items-end justify-between gap-4">
          <h2 id="current-progress-title" className={textStyle('section-title')}>
            Progresso Atual
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <label htmlFor="progress-period" className={textStyle('field-label')}>
              Período
            </label>
            <SelectField
              id="progress-period"
              defaultValue="30d"
              options={PROGRESS_PERIODS}
              size="compact"
              className="w-40"
            />
          </div>
        </div>
      </Surface>

      <div className="col-span-1 min-w-0">
        <Surface
          density="compact"
          className="flex min-w-0 flex-col gap-3"
          role="group"
          aria-label="Última prescrição e avaliação"
        >
          <section className="flex min-w-0 flex-col gap-3" aria-labelledby="latest-prescription-title">
            <div className="flex items-center justify-between gap-2">
              <h3 id="latest-prescription-title" className={textStyle('card-title')}>
                Última Prescrição
                {latestDiet && (
                  <>
                    {' '}
                    <time
                      dateTime={normalizeDateToISO(latestDiet.date) ?? undefined}
                      className={textStyle('body-secondary')}
                    >
                      {formatDate(latestDiet.date) || 'Data não informada'}
                    </time>
                  </>
                )}
              </h3>
              {latestDiet && (
                <Badge variant={latestDiet.status === 'Ativa' ? 'primary' : 'neutral'} className="px-1">
                  {latestDiet.status === 'Ativa' ? 'Ativo' : 'Histórico'}
                </Badge>
              )}
            </div>

            {latestDiet ? (
              <>
                <h4 className={textStyle('body-strong')}>{latestDiet.name}</h4>

                <div className="flex flex-col gap-2">
                  <span className={textStyle('caption')}>
                    {latestDiet.mode === 'carb_cycling' ? 'Média semanal do ciclo' : 'Objetivo Diário'}
                  </span>
                  <MacroSummary
                    protein={formatNumber(latestDiet.proteinG)}
                    carbs={formatNumber(latestDiet.carbsG)}
                    fats={formatNumber(latestDiet.fatsG)}
                    kcal={formatNumber(latestDiet.targetKcal, 0)}
                    className="tabular-nums"
                  />
                </div>

                {!readOnly && (
                  <Button asChild variant="secondary" size="compact" className="self-start">
                    <Link href={`/pacientes/${patientId}/dieta/${latestDiet.id}`}>
                      <span>Abrir dieta</span>
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <p className={textStyle('body-secondary')}>Nenhuma prescrição registrada.</p>
            )}
          </section>

          <Separator className="bg-border-divider" />

          <section className="flex min-w-0 flex-col gap-3" aria-labelledby="latest-assessment-title">
            <h3 id="latest-assessment-title" className={textStyle('card-title')}>
              Última avaliação
            </h3>

            {latestAssessment ? (
              <>
                <p className={textStyle('body-secondary')}>
                  {formatDate(latestAssessment.date) || 'Data não informada'}
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: 'Peso', value: formatMeasurement(latestAssessment.weightKg, 'kg') },
                    { label: 'Gordura corporal', value: formatMeasurement(latestAssessment.bodyFatPercent, '%') },
                    { label: 'Massa muscular', value: formatMeasurement(latestAssessment.muscleMassKg, 'kg') },
                    { label: 'Cintura', value: formatMeasurement(latestAssessment.waistCm, 'cm') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex min-w-0 flex-col gap-1">
                      <dt className={textStyle('caption')}>{label}</dt>
                      <dd className={textStyle('body-strong')}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className={textStyle('body-secondary')}>Nenhuma avaliação registrada.</p>
            )}
          </section>
        </Surface>
      </div>
    </div>
  );
}
