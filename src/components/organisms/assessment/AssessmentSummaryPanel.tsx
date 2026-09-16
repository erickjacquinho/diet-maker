import React from 'react';
import { Zap, TrendingDown, TrendingUp, Minus, Save, X, Scale, Copy, Check } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface, Badge, ProgressBar } from '@/components/atoms';
import { MetricBoxGroup } from '@/components/organisms/MetricBoxGroup';
import { Button } from '@/components/ui/button';
import {
  classifyBodyFat,
  classifyFfmi,
} from '@/lib/clinicalClassifications';
import type { AssessmentDeltas } from '@/hooks/useAssessmentWorkspacePage';
import type { BodyCompositionResult } from '@/lib/bodyFat';
import type { AssessmentType } from '@/lib/domain/clinical';

export interface AssessmentSummaryPanelProps {
  composition: BodyCompositionResult;
  ffmi?: number | null;
  bmi?: number | null;
  waistToHipRatio?: number | null;
  deltas: AssessmentDeltas;
  assessmentType?: AssessmentType;
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
  ffmi = null,
  deltas,
  assessmentType = 'complete',
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
  const ffmiBadge = classifyFfmi(ffmi, patientGender);
  const isSimplified = assessmentType === 'simplified';

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
      aria-label={isSimplified ? 'Painel de resumo da avaliação simplificada' : 'Painel de resumo da composição corporal e performance'}
      className={`flex flex-col gap-4 sticky top-6 ${className}`}
    >
      {isSimplified ? (
        <Surface variant="subtle" className="p-5 rounded-surface border border-border-subtle flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
            <Scale className="size-4 text-text-muted" aria-hidden="true" />
            <h3 className={textStyle('card-title')}>Avaliação simplificada</h3>
          </div>
          <p className="text-style-caption text-text-secondary">
            Registro de peso e medidas selecionadas. A composição corporal fica disponível na avaliação completa.
          </p>
        </Surface>
      ) : (
        <>
      {/* Bloco 1: Composição Corporal de Alta Performance (Grid 2x2 Bento) */}
      <Surface variant="default" className="p-5 rounded-surface border border-border-subtle flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-control bg-primary-soft text-primary">
              <Zap className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className={textStyle('card-title')}>Composição Corporal</h3>
              <span className={textStyle('helper')}>Antropometria US Navy & FFMI</span>
            </div>
          </div>
        </div>

        {/* Grade 2x2 usando o organismo canônico de métricas */}
        <MetricBoxGroup
          className="grid-cols-2 gap-2.5 divide-x-0 overflow-visible rounded-none border-0 bg-transparent"
          items={[
            {
              label: (
                <span className="flex w-full items-center justify-between gap-1">
                  <span>Body Fat</span>
                  {bfBadge && (
                    <Badge variant={bfBadge.tone} className="text-style-chart-micro h-4 px-1.5 py-0 font-medium" title={bfBadge.description}>
                      {bfBadge.label}
                    </Badge>
                  )}
                </span>
              ),
              value: composition.bodyFatPercent ?? '—',
              unit: composition.bodyFatPercent === null ? undefined : '%',
              size: 'standard',
              layout: 'stack',
              surface: 'boxed',
              className: 'h-[68px] rounded-control [&>div:first-child]:w-full [&>div:first-child]:items-start',
            },
            {
              label: 'Massa Magra (FFM)',
              value: composition.leanMassKg ?? '—',
              unit: composition.leanMassKg === null ? undefined : 'kg',
              size: 'standard',
              layout: 'stack',
              surface: 'boxed',
              className: 'h-[68px] rounded-control [&>div:first-child]:w-full [&>div:first-child]:items-start',
            },
            {
              label: 'Massa Gorda (FM)',
              value: composition.fatMassKg ?? '—',
              unit: composition.fatMassKg === null ? undefined : 'kg',
              size: 'standard',
              layout: 'stack',
              surface: 'boxed',
              className: 'h-[68px] rounded-control [&>div:first-child]:w-full [&>div:first-child]:items-start',
            },
            {
              label: (
                <span className="flex w-full items-center justify-between gap-1">
                  <span>FFMI</span>
                  {ffmiBadge && (
                    <Badge variant={ffmiBadge.tone} className="text-style-chart-micro h-4 px-1.5 py-0 font-medium" title={ffmiBadge.description}>
                      {ffmiBadge.label}
                    </Badge>
                  )}
                </span>
              ),
              value: ffmi ?? '—',
              unit: ffmi === null ? undefined : 'kg/m²',
              size: 'standard',
              layout: 'stack',
              surface: 'boxed',
              className: 'h-[68px] rounded-control [&>div:first-child]:w-full [&>div:first-child]:items-start',
            },
          ]}
        />

        {/* Barra de Distribuição de Massa Corporal */}
        {leanPct !== null && fatPct !== null && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-border-subtle/60">
            <div className="flex items-center justify-between text-style-chart-micro font-mono tabular-nums text-text-secondary">
              <span className="font-semibold text-success">{leanPct}% Massa Magra</span>
              <span className="font-medium text-warning">{fatPct}% Gordura</span>
            </div>
            <ProgressBar value={leanPct} colorVariant="emerald" />
          </div>
        )}
      </Surface>

      {/* Bloco 2: Recomposição Corporal vs. Avaliação Anterior */}
      <Surface variant="subtle" className="p-5 rounded-surface border border-border-subtle flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
          <Scale className="size-4 text-text-muted" aria-hidden="true" />
          <h4 className={textStyle('caption-strong')}>Recomposição Corporal</h4>
        </div>

        {deltas.hasPrevious ? (
          <div className="flex flex-col">
            <DeltaItem label="Massa Magra (FFM)" value={deltas.leanMassDiff} unit="kg" desirableTrend="up" />
            <DeltaItem label="Massa Gorda (FM)" value={deltas.fatMassDiff} unit="kg" desirableTrend="down" />
            <DeltaItem label="Body Fat (BF)" value={deltas.bodyFatDiff} unit="%" desirableTrend="down" />
            <DeltaItem label="Cintura" value={deltas.waistDiff} unit="cm" desirableTrend="down" />
            <DeltaItem label="Peso Total" value={deltas.weightDiff} unit="kg" desirableTrend="down" />
          </div>
        ) : (
          <p className="text-style-caption italic text-text-muted py-2 text-center">
            Primeira avaliação registrada para este paciente.
          </p>
        )}
      </Surface>
        </>
      )}

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
          className="w-full flex items-center justify-center gap-2 font-medium"
        >
          <Save size={16} aria-hidden="true" />
          <span>Salvar Avaliação <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span></span>
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
