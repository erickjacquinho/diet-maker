'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Eye,
  Scale,
  TrendingDown,
  Utensils,
  Ruler,
  CheckCircle2,
} from 'lucide-react';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { EditIconButton, IconButton, Badge } from '@/components/atoms';
import { MetricBox } from '@/components/molecules/MetricBox';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';
import type { ConsolidatedConsultation } from '@/lib/patientProfileConsultations';

export interface ConsultationHistoryRowProps {
  patientId: string;
  consultation: ConsolidatedConsultation;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onOpenEditAssessment?: (assessment: BodyAssessment) => void;
}

export function ConsultationHistoryRow({
  patientId,
  consultation,
  isExpanded,
  onToggleExpand,
}: ConsultationHistoryRowProps) {
  const isActive = consultation.isActive;
  const primaryDiet = consultation.primaryDiet;
  const primaryAssessment = consultation.primaryAssessment;
  const dietsCount = consultation.diets.length;
  const assessmentsCount = consultation.assessments.length;

  return (
    <TableRow
      className={`border-l-4 transition-colors ${
        isActive
          ? 'border-l-4 border-l-primary bg-primary-soft/30 hover:bg-primary-soft/50'
          : 'border-l-transparent hover:bg-surface-hover'
      }`}
    >
      {/* 1. Data */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="shrink-0 text-text-muted" aria-hidden="true" />
          <span className={textStyle('table-cell-strong')}>{consultation.date}</span>
        </div>
      </TableCell>

      {/* 2. Tipo de Registro */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {dietsCount > 0 && (
            <Badge variant="neutral">
              {dietsCount === 1 ? 'Dieta' : `${dietsCount} Dietas`}
            </Badge>
          )}
          {assessmentsCount > 0 && (
            <Badge variant="neutral">
              {assessmentsCount === 1 ? 'Avaliação Física' : `${assessmentsCount} Avaliações`}
            </Badge>
          )}
        </div>
      </TableCell>

      {/* 3. Dados Dietéticos */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        {primaryDiet ? (
          <div className="flex items-center gap-2">
            <MacroSummary
              protein={primaryDiet.proteinG}
              carbs={primaryDiet.carbsG}
              fats={primaryDiet.fatsG}
              kcal={primaryDiet.targetKcal}
              className={textStyle('table-number')}
            />
            {dietsCount > 1 && (
              <span className={`text-text-muted font-medium bg-surface-subtle px-1.5 py-0.5 rounded-control ${textStyle('legal')}`}>
                +{dietsCount - 1} variação
              </span>
            )}
          </div>
        ) : (
          <span className={`italic ${textStyle('caption')}`}>Sem alteração dietética</span>
        )}
      </TableCell>

      {/* 4. Valores Corporais */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        {primaryAssessment ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${textStyle('table-number')}`}>
              <span>{primaryAssessment.weightKg} kg</span>
              <span className="font-normal text-text-muted">•</span>
              <span>{primaryAssessment.bodyFatPercent}% BF</span>
            </div>
            {assessmentsCount > 1 && (
              <span className={`text-text-muted font-medium bg-surface-subtle px-1.5 py-0.5 rounded-control ${textStyle('legal')}`}>
                +{assessmentsCount - 1} medição
              </span>
            )}
          </div>
        ) : (
          <span className={`italic ${textStyle('caption')}`}>Sem medição corporal</span>
        )}
      </TableCell>

      {/* 5. Ação / Detalhes (Ver Consulta + Chevron) */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="secondary" size="compact" type="button">
            <Link href={`/pacientes/${patientId}/consulta/${encodeURIComponent(consultation.date.replace(/\//g, '-'))}`}>
              <span>Ver Consulta</span>
              <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </Button>
          <IconButton
            aria-label={isExpanded ? 'Recolher consulta' : 'Expandir consulta'}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Recolher detalhes' : 'Ver mais detalhes sem sair da página'}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand();
            }}
          >
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn('transition-transform duration-standard', isExpanded && 'rotate-180')}
            />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ConsultationHistoryExpandedRow({
  patientId,
  consultation,
  onOpenReadOnlyDiet,
}: Pick<ConsultationHistoryRowProps, 'patientId' | 'consultation' | 'onOpenReadOnlyDiet'>) {
  return (
    <TableRow className="bg-surface-subtle/40" data-expanded-row-id={consultation.id}>
      <TableCell colSpan={5} className="border-b border-t border-border-subtle/50 p-4">
        <div className="flex flex-col gap-4 animate-in fade-in-50 slide-in-from-top-2 duration-fast">
          {/* Seção de Dietas */}
          {consultation.diets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {consultation.diets.map((diet, idx) => (
                <div
                  key={diet.id ?? `diet-${idx}`}
                  className="flex flex-col gap-3 rounded-surface border border-border-subtle bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils size={15} className="shrink-0 text-primary" />
                      <span className={textStyle('card-title')}>{diet.name}</span>
                    </div>
                    <Badge variant={diet.status === 'Ativa' ? 'primary' : 'neutral'}>
                      {diet.status === 'Ativa' ? 'Plano Ativo' : 'Histórica'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <MetricBox size="compact" label="Calorias" value={`${diet.targetKcal} kcal`} />
                    <MetricBox size="compact" tone="protein" label="Proteínas" value={`${diet.proteinG}g`} />
                    <MetricBox size="compact" tone="carbohydrate" label="Carbo" value={`${diet.carbsG}g`} />
                    <MetricBox size="compact" tone="fat" label="Gorduras" value={`${diet.fatsG}g`} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
                    <Button
                      type="button"
                      variant="primary"
                      size="compact"
                      onClick={() => onOpenReadOnlyDiet(diet)}
                      className="flex items-center gap-1.5"
                    >
                      <Eye size={14} aria-hidden="true" />
                      <span>Ver Cardápio</span>
                    </Button>
                    <Link
                      href={`/pacientes/${patientId}/dieta/${diet.id}`}
                      title="Editar no Construtor de Dietas"
                    >
                      <EditIconButton title="Editar no Construtor de Dietas" size="compact" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-4 text-style-caption italic text-text-muted">
              Nenhuma prescrição dietética foi criada nesta data.
            </div>
          )}

          {/* Seção de Avaliações Físicas */}
          {consultation.assessments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {consultation.assessments.map((assessment, idx) => (
                <div
                  key={assessment.id ?? `asm-${idx}`}
                  className="flex flex-col gap-3 rounded-surface border border-border-subtle bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale size={15} className="shrink-0 text-primary" />
                      <span className={textStyle('card-title')}>Avaliação Física & Valores</span>
                    </div>
                    <span className={`flex items-center gap-1 text-success ${textStyle('caption')}`}>
                      <TrendingDown size={11} aria-hidden="true" />
                      <span>Evolução Favorável</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <MetricBox size="compact" label="Peso" value={`${assessment.weightKg} kg`} />
                    <MetricBox size="compact" label="% Gordura" value={`${assessment.bodyFatPercent}%`} />
                    <MetricBox size="compact" label="Massa Magra" value={`${assessment.muscleMassKg} kg`} />
                    <MetricBox size="compact" label="Cintura" value={`${assessment.waistCm} cm`} />
                  </div>

                  {/* Circunferências / Perímetros adicionais */}
                  {(assessment.abdomenCm || assessment.hipCm || assessment.bustCm || assessment.leftArmCm) && (
                    <div className="flex flex-col gap-2 rounded-control bg-surface-subtle p-2.5 border border-border-subtle text-style-caption">
                      <span className={`flex items-center gap-1 text-text-secondary ${textStyle('caption-strong')}`}>
                        <Ruler size={12} className="text-text-muted" />
                        <span>Perímetros Corporais Complementares:</span>
                      </span>
                      <div className={`flex flex-wrap gap-3 text-text-secondary ${textStyle('caption')}`}>
                        {assessment.abdomenCm && <span>Abdômen: <strong className="text-text-primary">{assessment.abdomenCm} cm</strong></span>}
                        {assessment.hipCm && <span>Quadril: <strong className="text-text-primary">{assessment.hipCm} cm</strong></span>}
                        {assessment.bustCm && <span>Tórax/Busto: <strong className="text-text-primary">{assessment.bustCm} cm</strong></span>}
                        {assessment.leftArmCm && <span>Braço: <strong className="text-text-primary">{assessment.leftArmCm} cm</strong></span>}
                        {assessment.leftProximalThighCm && <span>Coxa: <strong className="text-text-primary">{assessment.leftProximalThighCm} cm</strong></span>}
                        {assessment.leftCalfCm && <span>Panturrilha: <strong className="text-text-primary">{assessment.leftCalfCm} cm</strong></span>}
                      </div>
                    </div>
                  )}

                  {assessment.autoFilledFields && assessment.autoFilledFields.length > 0 && (
                    <div className={`text-text-muted flex items-center gap-1.5 pt-0.5 ${textStyle('legal')}`}>
                      <CheckCircle2 size={11} className="text-primary" />
                      <span>{assessment.autoFilledFields.length} medidas opcionais replicadas da avaliação anterior</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-border-subtle/50">
                    <Link
                      href={`/pacientes/${patientId}/avaliacao/${assessment.id}`}
                      title="Editar Avaliação Física"
                    >
                      <EditIconButton title="Editar Avaliação Física" size="compact" />
                    </Link>
                  </div>
                </div>
              ))}
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
