import React from 'react';
import { Zap, TrendingDown, TrendingUp, Minus, Save, X, Scale, Copy, Check } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface, Badge, ProgressBar } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  classifyBodyFat,
  classifyFfmi,
} from '@/lib/clinicalClassifications';
import type { AssessmentDeltas } from '@/hooks/useAssessmentWorkspacePage';
import type { BodyCompositionResult } from '@/lib/bodyFat';

export interface AssessmentSummaryPanelProps {
  composition: BodyCompositionResult;
  ffmi?: number | null;
  bmi?: number | null;
  waistToHipRatio?: number | null;
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
  ffmi = null,
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
  const ffmiBadge = classifyFfmi(ffmi, patientGender);

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
      aria-label="Painel de resumo da composição corporal e performance"
      className={`flex flex-col gap-4 sticky top-6 ${className}`}
    >
      {/* Bloco 1: Composição Corporal de Alta Performance (Grid 2x2 Bento) */}
      <Surface variant="default" className="p-5 rounded-surface border border-border-subtle shadow-card flex flex-col gap-4">
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

        {/* Grade 2x2 Rigorosamente Simétrica com Altura e Padding Padronizados */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Body Fat (BF%) */}
          <div className="flex flex-col justify-between p-3 rounded-control border border-border-subtle bg-surface-subtle h-[68px]">
            <div className="flex items-center justify-between gap-1">
              <span className="text-style-legal font-bold tracking-label text-text-muted">Body Fat</span>
              {bfBadge && (
                <Badge variant={bfBadge.tone} className="text-[10px] h-4 px-1.5 py-0 font-medium" title={bfBadge.description}>
                  {bfBadge.label}
                </Badge>
              )}
            </div>
            <span className="font-bold font-mono tabular-nums text-style-body-small text-text-primary">
              {composition.bodyFatPercent === null ? '—' : `${composition.bodyFatPercent} %`}
            </span>
          </div>

          {/* 2. Massa Magra (FFM) */}
          <div className="flex flex-col justify-between p-3 rounded-control border border-border-subtle bg-surface-subtle h-[68px]">
            <span className="text-style-legal font-bold tracking-label text-text-muted">Massa Magra (FFM)</span>
            <span className="font-bold font-mono tabular-nums text-style-body-small text-text-primary">
              {composition.leanMassKg === null ? '—' : `${composition.leanMassKg} kg`}
            </span>
          </div>

          {/* 3. Massa Gorda (FM) */}
          <div className="flex flex-col justify-between p-3 rounded-control border border-border-subtle bg-surface-subtle h-[68px]">
            <span className="text-style-legal font-bold tracking-label text-text-muted">Massa Gorda (FM)</span>
            <span className="font-bold font-mono tabular-nums text-style-body-small text-text-primary">
              {composition.fatMassKg === null ? '—' : `${composition.fatMassKg} kg`}
            </span>
          </div>

          {/* 4. FFMI (Índice de Massa Livre de Gordura) */}
          <div className="flex flex-col justify-between p-3 rounded-control border border-border-subtle bg-surface-subtle h-[68px]">
            <div className="flex items-center justify-between gap-1">
              <span className="text-style-legal font-bold tracking-label text-text-muted">FFMI</span>
              {ffmiBadge && (
                <Badge variant={ffmiBadge.tone} className="text-[10px] h-4 px-1.5 py-0 font-medium" title={ffmiBadge.description}>
                  {ffmiBadge.label}
                </Badge>
              )}
            </div>
            <span className="font-bold font-mono tabular-nums text-style-body-small text-text-primary">
              {ffmi === null ? '—' : `${ffmi} kg/m²`}
            </span>
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
      </Surface>

      {/* Bloco 2: Recomposição Corporal vs. Avaliação Anterior */}
      <Surface variant="subtle" className="p-5 rounded-surface border border-border-subtle shadow-card flex flex-col gap-3">
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
