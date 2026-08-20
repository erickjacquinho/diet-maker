'use client';

import Link from 'next/link';
import { Calendar, ChevronDown, ChevronRight, ChevronUp, Eye, Scale, TrendingDown, Utensils } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { EditIconButton, IconButton } from '@/components/atoms';
import { MetricBox } from '@/components/molecules/MetricBox';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';
import type { ConsolidatedConsultationUpdate } from '../PatientConsultationHistoryTable';

export interface ConsultationHistoryRowProps {
  patientId: string;
  update: ConsolidatedConsultationUpdate;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onOpenEditAssessment: (assessment: BodyAssessment) => void;
}

export function ConsultationHistoryRow({
  patientId,
  update,
  isExpanded,
  onToggleExpand,
}: ConsultationHistoryRowProps) {
  const isActiveDietRow = update.diet?.status === 'Ativa';

  return (
    <TableRow
      className={`border-l-4 transition-colors ${
        isActiveDietRow
          ? 'border-l-success bg-success/[0.04] hover:bg-success/[0.08]'
          : 'border-l-transparent hover:bg-surface-hover'
      }`}
    >
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="shrink-0 text-text-muted" />
          <span className={textStyle('table-cell-strong')}>{update.date}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          {update.diet && (
            <Badge variant="outline" className="pointer-events-none border-border-subtle bg-surface px-2 py-0.5 text-style-caption font-semibold text-text-primary shadow-none">
              Dieta
            </Badge>
          )}
          {update.assessment && (
            <Badge variant="outline" className="pointer-events-none border-border-subtle bg-surface px-2 py-0.5 text-style-caption font-semibold text-text-primary shadow-none">
              Avaliação Física
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        {update.diet ? (
          <div className={`flex items-center gap-1.5 ${textStyle('table-number')}`}>
            <span className="font-bold text-macro-protein">{update.diet.proteinG}g</span>
            <span className="font-normal text-text-muted">•</span>
            <span className="font-bold text-macro-carbohydrate">{update.diet.carbsG}g</span>
            <span className="font-normal text-text-muted">•</span>
            <span className="font-bold text-macro-fat">{update.diet.fatsG}g</span>
            <span className="font-normal text-text-muted">•</span>
            <span className="font-bold text-text-muted">{update.diet.targetKcal} kcal</span>
          </div>
        ) : (
          <span className={`italic ${textStyle('caption')}`}>Sem alteração dietética</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        {update.assessment ? (
          <div className={`flex items-center gap-1.5 ${textStyle('table-number')}`}>
            <span>{update.assessment.weightKg} kg</span>
            <span className="font-normal text-text-muted">•</span>
            <span>{update.assessment.bodyFatPercent}% BF</span>
          </div>
        ) : (
          <span className={`italic ${textStyle('caption')}`}>Sem medição corporal</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="secondary" size="compact" type="button">
            <Link href={`/pacientes/${patientId}/consulta/${encodeURIComponent(update.date.replace(/\//g, '-'))}`}>
              <span>Abrir</span>
              <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </Button>
          <IconButton
            aria-label={isExpanded ? 'Recolher consulta' : 'Expandir consulta'}
            aria-expanded={isExpanded}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ConsultationHistoryExpandedRow({
  patientId,
  update,
  onOpenReadOnlyDiet,
  onOpenEditAssessment,
}: Pick<ConsultationHistoryRowProps, 'patientId' | 'update' | 'onOpenReadOnlyDiet' | 'onOpenEditAssessment'>) {
  return (
    <TableRow className="bg-surface-subtle/40" data-expanded-row-id={update.date}>
      <TableCell colSpan={5} className="border-b border-t border-border-subtle/50 p-4">
        <div className="grid grid-cols-1 gap-4">
          {update.diet ? (
            <div className="flex flex-col gap-3 rounded-surface border border-border-subtle bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils size={15} className="shrink-0 text-success" />
                  <span className={textStyle('card-title')}>{update.diet.name}</span>
                </div>
                <Badge variant="secondary" className="text-style-caption font-semibold">
                  {update.diet.status}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <MetricBox size="compact" label="Calorias" value={`${update.diet.targetKcal} kcal`} />
                <MetricBox size="compact" tone="protein" label="Proteínas" value={`${update.diet.proteinG}g`} />
                <MetricBox size="compact" tone="carbohydrate" label="Carbo" value={`${update.diet.carbsG}g`} />
                <MetricBox size="compact" tone="fat" label="Gorduras" value={`${update.diet.fatsG}g`} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="primary" size="compact" onClick={() => onOpenReadOnlyDiet(update.diet!)}>
                  <Eye size={14} aria-hidden="true" />
                  <span>Ver Dieta</span>
                </Button>
                <Link href={`/pacientes/${patientId}/dieta/${update.diet.id}`} title="Editar no Construtor de Dietas">
                  <EditIconButton title="Editar no Construtor de Dietas" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-4 text-style-caption italic text-text-muted">
              Nenhuma prescrição dietética foi criada nesta data.
            </div>
          )}

          {update.assessment ? (
            <div className="flex flex-col gap-3 rounded-surface border border-border-subtle bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={15} className="shrink-0 text-success" />
                  <span className={textStyle('card-title')}>Avaliação Física & Valores</span>
                </div>
                <span className={`flex items-center gap-1 text-success ${textStyle('caption')}`}>
                  <TrendingDown size={11} aria-hidden="true" />
                  <span>Evolução Favorável</span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <MetricBox size="compact" label="Peso" value={`${update.assessment.weightKg} kg`} />
                <MetricBox size="compact" label="% Gordura" value={`${update.assessment.bodyFatPercent}%`} />
                <MetricBox size="compact" label="Massa Magra" value={`${update.assessment.muscleMassKg} kg`} />
                <MetricBox size="compact" label="Cintura" value={`${update.assessment.waistCm} cm`} />
              </div>

              {update.assessment.autoFilledFields && update.assessment.autoFilledFields.length > 0 && (
                <div className="text-[11px] text-text-muted flex items-center gap-1.5 pt-1">
                  <span className="text-primary font-bold">✦</span>
                  <span>{update.assessment.autoFilledFields.length} medidas opcionais replicadas da avaliação anterior</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Link href={`/pacientes/${patientId}/avaliacao/${update.assessment.id}`} title="Editar Avaliação Física">
                  <EditIconButton title="Editar Avaliação Física" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-4 text-style-caption italic text-text-muted">
              Nenhuma avaliação física foi realizada nesta data.
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
