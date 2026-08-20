import React from 'react';
import { Activity, TrendingDown, TrendingUp, Minus, Save, X, Scale } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface } from '@/components/atoms';
import { MetricBox } from '@/components/molecules/MetricBox';
import { Button } from '@/components/ui/button';
import type { AssessmentDeltas } from '@/hooks/useAssessmentWorkspacePage';
import type { BodyCompositionResult } from '@/lib/bodyFat';

export interface AssessmentSummaryPanelProps {
  composition: BodyCompositionResult;
  bmi: number | null;
  waistToHipRatio: number | null;
  deltas: AssessmentDeltas;
  isSaving?: boolean;
  submitError?: string | null;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

function formatDelta(val: number | null, unit: string) {
  if (val === null || !Number.isFinite(val)) return '—';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val} ${unit}`;
}

function DeltaItem({
  label,
  value,
  unit,
  desirableTrend = 'down',
}: {
  label: string;
  value: number | null;
  unit: string;
  desirableTrend?: 'up' | 'down';
}) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <div className="flex items-center justify-between text-style-caption text-text-muted py-1 border-b border-border-subtle/50 last:border-0">
        <span>{label}</span>
        <span>—</span>
      </div>
    );
  }

  const isPositive = value > 0;
  const isZero = Math.abs(value) < 0.01;
  const isDesirable =
    (desirableTrend === 'down' && value < 0) || (desirableTrend === 'up' && value > 0);

  const colorClass = isZero
    ? 'text-text-muted'
    : isDesirable
    ? 'text-success'
    : 'text-warning';

  return (
    <div className="flex items-center justify-between text-style-caption py-1.5 border-b border-border-subtle/50 last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-semibold flex items-center gap-1 ${colorClass}`}>
        {isZero ? (
          <Minus size={12} aria-hidden="true" />
        ) : isPositive ? (
          <TrendingUp size={12} aria-hidden="true" />
        ) : (
          <TrendingDown size={12} aria-hidden="true" />
        )}
        <span>{formatDelta(value, unit)}</span>
      </span>
    </div>
  );
}

export function AssessmentSummaryPanel({
  composition,
  bmi,
  waistToHipRatio,
  deltas,
  isSaving = false,
  submitError,
  onSave,
  onCancel,
  className = '',
}: AssessmentSummaryPanelProps) {
  return (
    <aside
      aria-label="Painel de resumo da composição corporal"
      className={`flex flex-col gap-4 sticky top-6 ${className}`}
    >
      {/* Bloco 1: Composição Corporal Calculada */}
      <Surface variant="default" className="p-5 rounded-surface border border-border-subtle shadow-card flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <div className="p-1.5 rounded-control bg-primary-soft text-primary">
            <Activity className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className={textStyle('card-title')}>Composição Corporal</h3>
            <span className={textStyle('helper')}>Cálculo automático US Navy</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <MetricBox
            label="Body Fat"
            value={composition.bodyFatPercent === null ? '—' : `${composition.bodyFatPercent} %`}
            tone={composition.bodyFatPercent === null ? 'default' : 'success'}
            size="compact"
            surface="boxed"
          />
          <MetricBox
            label="Massa Magra"
            value={composition.leanMassKg === null ? '—' : `${composition.leanMassKg} kg`}
            tone="default"
            size="compact"
            surface="boxed"
          />
          <MetricBox
            label="Massa Gorda"
            value={composition.fatMassKg === null ? '—' : `${composition.fatMassKg} kg`}
            tone="default"
            size="compact"
            surface="boxed"
          />
          <MetricBox
            label="IMC"
            value={bmi === null ? '—' : `${bmi} kg/m²`}
            tone="default"
            size="compact"
            surface="boxed"
          />
        </div>

        {waistToHipRatio !== null && (
          <div className="pt-1">
            <Surface variant="subtle" density="compact" className="flex items-center justify-between p-2.5 rounded-surface text-style-caption">
              <span className="text-text-secondary">Relação Cintura / Quadril (RCQ)</span>
              <span className="font-semibold text-text-primary">{waistToHipRatio}</span>
            </Surface>
          </div>
        )}
      </Surface>

      {/* Bloco 2: Comparativo Evolutivo */}
      <Surface variant="subtle" className="p-5 rounded-surface border border-border-subtle shadow-card flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
          <Scale className="size-4 text-text-muted" aria-hidden="true" />
          <h4 className={textStyle('caption-strong')}>Evolução vs. Avaliação Anterior</h4>
        </div>

        {deltas.hasPrevious ? (
          <div className="flex flex-col">
            <DeltaItem label="Variação de Peso" value={deltas.weightDiff} unit="kg" desirableTrend="down" />
            <DeltaItem label="Variação de BF" value={deltas.bodyFatDiff} unit="%" desirableTrend="down" />
            <DeltaItem label="Massa Magra" value={deltas.leanMassDiff} unit="kg" desirableTrend="up" />
            <DeltaItem label="Cintura" value={deltas.waistDiff} unit="cm" desirableTrend="down" />
          </div>
        ) : (
          <p className="text-style-caption italic text-text-muted py-2 text-center">
            Primeira avaliação registrada para este paciente.
          </p>
        )}
      </Surface>

      {/* Bloco 3: Feedback de Erro & Ações */}
      {submitError && (
        <p role="alert" className={textStyle('validation-error')}>
          {submitError}
        </p>
      )}

      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 pt-1">
        <Button
          type="button"
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2"
        >
          <Save size={16} aria-hidden="true" />
          <span>Salvar Avaliação</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2"
        >
          <X size={16} aria-hidden="true" />
          <span>Cancelar</span>
        </Button>
      </div>
    </aside>
  );
}
