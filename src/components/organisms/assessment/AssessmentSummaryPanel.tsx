import React from 'react';
import { Activity, TrendingDown, TrendingUp, Minus, Save, X, Scale, Copy, Check } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface, Badge, ProgressBar } from '@/components/atoms';
import { MetricBox } from '@/components/molecules/MetricBox';
import { Button } from '@/components/ui/button';
import {
  classifyBodyFat,
  classifyBmi,
  classifyWaistToHipRatio,
} from '@/lib/clinicalClassifications';
import type { AssessmentDeltas } from '@/hooks/useAssessmentWorkspacePage';
import type { BodyCompositionResult } from '@/lib/bodyFat';

export interface AssessmentSummaryPanelProps {
  composition: BodyCompositionResult;
  bmi: number | null;
  waistToHipRatio: number | null;
  deltas: AssessmentDeltas;
  patientGender?: string | null;
  isSaving?: boolean;
  submitError?: string | null;
  onSave: () => void;
  onCancel: () => void;
  onCopySummary?: () => void;
  isCopied?: boolean;
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
      <div className="flex items-center justify-between text-style-caption text-text-muted py-1.5 border-b border-border-subtle/50 last:border-0">
        <span>{label}</span>
        <span className="font-mono tabular-nums">—</span>
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
      <span className={`font-semibold font-mono tabular-nums flex items-center gap-1.5 ${colorClass}`}>
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
  patientGender,
  isSaving = false,
  submitError,
  onSave,
  onCancel,
  onCopySummary,
  isCopied = false,
  className = '',
}: AssessmentSummaryPanelProps) {
  const bfBadge = classifyBodyFat(composition.bodyFatPercent, patientGender);
  const bmiBadge = classifyBmi(bmi);
  const whrBadge = classifyWaistToHipRatio(waistToHipRatio, patientGender);

  const leanPct =
    composition.bodyFatPercent !== null
      ? Math.max(0, Math.min(100, Number((100 - composition.bodyFatPercent).toFixed(1))))
      : null;
  const fatPct =
    composition.bodyFatPercent !== null
      ? Math.max(0, Math.min(100, Number(composition.bodyFatPercent.toFixed(1))))
      : null;

  return (
    <aside
      aria-label="Painel de resumo da composição corporal"
      className={`flex flex-col gap-4 sticky top-6 ${className}`}
    >
      {/* Bloco 1: Composição Corporal Calculada */}
      <Surface variant="default" className="p-5 rounded-surface border border-border-subtle shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-control bg-primary-soft text-primary">
              <Activity className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className={textStyle('card-title')}>Composição Corporal</h3>
              <span className={textStyle('helper')}>Equação US Navy</span>
            </div>
          </div>
          {bfBadge && (
            <Badge variant={bfBadge.tone} className="text-[10px] font-medium" title={bfBadge.description}>
              {bfBadge.label}
            </Badge>
          )}
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
          <div className="flex flex-col justify-between">
            <MetricBox
              label="IMC"
              value={bmi === null ? '—' : `${bmi} kg/m²`}
              tone="default"
              size="compact"
              surface="boxed"
            />
            {bmiBadge && (
              <div className="pt-1 flex justify-end">
                <Badge variant={bmiBadge.tone} className="text-[10px] font-medium" title={bmiBadge.description}>
                  {bmiBadge.label}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Distribuição de Massa Corporal */}
        {leanPct !== null && fatPct !== null && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-border-subtle/60">
            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-text-secondary">
              <span className="font-semibold text-success">{leanPct}% Massa Magra</span>
              <span className="font-medium text-warning">{fatPct}% Gordura</span>
            </div>
            <ProgressBar value={leanPct} colorVariant="emerald" />
          </div>
        )}

        {/* RCQ */}
        {waistToHipRatio !== null && (
          <div className="pt-0.5">
            <Surface variant="subtle" density="compact" className="flex items-center justify-between p-2.5 rounded-surface text-style-caption">
              <div className="flex flex-col">
                <span className="text-text-secondary text-[11px]">Relação Cintura / Quadril (RCQ)</span>
                <span className="font-bold font-mono tabular-nums text-text-primary">{waistToHipRatio}</span>
              </div>
              {whrBadge && (
                <Badge variant={whrBadge.tone} className="text-[10px] font-medium" title={whrBadge.description}>
                  {whrBadge.label}
                </Badge>
              )}
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

      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="button"
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 shadow-sm font-medium"
        >
          <Save size={16} aria-hidden="true" />
          <span>Salvar Avaliação <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span></span>
        </Button>

        {onCopySummary && composition.isValid && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCopySummary}
            className="w-full flex items-center justify-center gap-2"
          >
            {isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            <span>{isCopied ? 'Resumo Copiado!' : 'Copiar Resumo'}</span>
          </Button>
        )}

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
