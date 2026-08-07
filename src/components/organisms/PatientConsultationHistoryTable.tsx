'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Utensils,
  Scale,
  TrendingDown,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { textStyle } from '@/design-system';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { EditIconButton, IconButton } from '@/components/atoms';
import { MetricBox } from '@/components/molecules/MetricBox';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';

export interface ConsolidatedConsultationUpdate {
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}

export interface PatientConsultationHistoryTableProps {
  patientId: string;
  updates: ConsolidatedConsultationUpdate[];
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onOpenEditAssessment: (assessment: BodyAssessment) => void;
}

export function PatientConsultationHistoryTable({
  patientId,
  updates,
  onOpenReadOnlyDiet,
  onOpenEditAssessment,
}: PatientConsultationHistoryTableProps) {
  const [expandedRowDate, setExpandedRowDate] = useState<string | null>(null);

  const toggleRowExpansion = (date: string) => {
    setExpandedRowDate(expandedRowDate === date ? null : date);
  };

  return (
    <section
      role="region"
      aria-labelledby="consultation-history-title"
      className="flex flex-col gap-4 border-t border-border-divider pt-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-text-secondary shrink-0" />
          <div>
            <h2 id="consultation-history-title" className={textStyle('subsection-title')}>
              Histórico de consultas
            </h2>
            <p className={textStyle('caption')}>
              Dietas e avaliações físicas organizadas por data
            </p>
          </div>
        </div>
        <span className={textStyle('caption')}>
          {updates.length === 1 ? '1 consulta' : `${updates.length} consultas`}
        </span>
      </div>

      {updates.length === 0 ? (
        <div className="p-6 text-center bg-surface-subtle border border-dashed border-border-subtle rounded-surface">
          <p className={textStyle('body-secondary')}>
            Nenhum histórico registrado para este paciente até o momento.
          </p>
        </div>
      ) : (
        <div className="border border-border-subtle rounded-surface overflow-hidden">
          <Table aria-label="Histórico de consultas por data">
            <TableCaption className="sr-only">Histórico de consultas por data</TableCaption>
            <TableHeader>
              <TableRow className="bg-surface-subtle border-b border-border-subtle">
                <TableHead className={`py-3 px-4 ${textStyle('table-header')}`}>Data / Consulta</TableHead>
                <TableHead className={`py-3 px-4 ${textStyle('table-header')}`}>Tipo de Registro</TableHead>
                <TableHead className={`py-3 px-4 ${textStyle('table-header')}`}>Dados Dietéticos</TableHead>
                <TableHead className={`py-3 px-4 ${textStyle('table-header')}`}>Valores Corporais</TableHead>
                <TableHead className={`py-3 px-4 text-right ${textStyle('table-header')}`}>Ação / Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-subtle/70">
              {updates.map((update) => {
                const isExpanded = expandedRowDate === update.date;
                const isActiveDietRow = update.diet?.status === 'Ativa';

                return (
                  <React.Fragment key={update.date}>
                    <TableRow
                      className={`transition-colors border-l-4 ${
                        isActiveDietRow
                          ? 'border-l-success bg-success/[0.04] hover:bg-success/[0.08]'
                          : 'border-l-transparent hover:bg-surface-hover'
                      }`}
                    >
                      {/* Col 1: Date */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-text-muted shrink-0" />
                          <span className={textStyle('table-cell-strong')}>{update.date}</span>
                        </div>
                      </TableCell>

                      {/* Col 2: Badges */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {update.diet && (
                            <Badge
                              variant="outline"
                              className="pointer-events-none bg-surface text-text-primary border-border-subtle font-semibold text-style-caption px-2 py-0.5 shadow-none"
                            >
                              Dieta
                            </Badge>
                          )}
                          {update.assessment && (
                            <Badge
                              variant="outline"
                              className="pointer-events-none bg-surface text-text-primary border-border-subtle font-semibold text-style-caption px-2 py-0.5 shadow-none"
                            >
                              Avaliação Física
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Col 3: Dietary Data */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap">
                        {update.diet ? (
                          <div className={`flex items-center gap-1.5 ${textStyle('table-number')}`}>
                            <span className="text-macro-protein font-bold">{update.diet.proteinG}g</span>
                            <span className="text-text-muted font-normal">•</span>
                            <span className="text-macro-carbohydrate font-bold">{update.diet.carbsG}g</span>
                            <span className="text-text-muted font-normal">•</span>
                            <span className="text-macro-fat font-bold">{update.diet.fatsG}g</span>
                            <span className="text-text-muted font-normal">•</span>
                            <span className="text-text-muted font-bold">{update.diet.targetKcal} kcal</span>
                          </div>
                        ) : (
                          <span className={`italic ${textStyle('caption')}`}>Sem alteração dietética</span>
                        )}
                      </TableCell>

                      {/* Col 4: Body Values */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap">
                        {update.assessment ? (
                          <div className={`flex items-center gap-1.5 ${textStyle('table-number')}`}>
                            <span>{update.assessment.weightKg} kg</span>
                            <span className="text-text-muted font-normal">•</span>
                            <span>{update.assessment.bodyFatPercent}% BF</span>
                          </div>
                        ) : (
                          <span className={`italic ${textStyle('caption')}`}>Sem medição corporal</span>
                        )}
                      </TableCell>

                      {/* Col 5: Actions */}
                      <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="secondary" size="compact" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/pacientes/${patientId}/consulta/${encodeURIComponent(update.date.replace(/\//g, '-'))}`}
                            >
                              <span>Abrir</span>
                              <ChevronRight size={12} />
                            </Link>
                          </Button>
                          <IconButton
                            aria-label={isExpanded ? 'Recolher consulta' : 'Expandir consulta'}
                            aria-expanded={isExpanded}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(update.date);
                            }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Accordion Expanded Detail View */}
                    {isExpanded && (
                      <TableRow className="bg-surface-subtle/40">
                        <TableCell colSpan={5} className="p-4 border-t border-b border-border-subtle/50">
                          <div className="grid grid-cols-1 gap-4">
                            {/* Diet Detail Card */}
                            {update.diet ? (
                              <div className="p-4 bg-surface border border-border-subtle rounded-surface flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Utensils size={15} className="text-success shrink-0" />
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

                                <div className="pt-2 flex items-center justify-between">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="compact"
                                    onClick={() => onOpenReadOnlyDiet(update.diet!)}
                                  >
                                    <Eye size={14} />
                                    <span>Ver Dieta</span>
                                  </Button>
                                  <Link
                                    href={`/pacientes/${patientId}/dieta/${update.diet.id}`}
                                    title="Editar no Construtor de Dietas"
                                  >
                                    <EditIconButton title="Editar no Construtor de Dietas" />
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-surface-subtle border border-dashed border-border-subtle rounded-surface flex items-center justify-center text-text-muted italic text-style-caption">
                                Nenhuma prescrição dietética foi criada nesta data.
                              </div>
                            )}

                            {/* Body Assessment Detail Card */}
                            {update.assessment ? (
                              <div className="p-4 bg-surface border border-border-subtle rounded-surface flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Scale size={15} className="text-success shrink-0" />
                                    <span className={textStyle('card-title')}>Avaliação Física & Valores</span>
                                  </div>
                                  <span className={`text-success flex items-center gap-1 ${textStyle('caption')}`}>
                                    <TrendingDown size={11} />
                                    <span>Evolução Favorável</span>
                                  </span>
                                </div>

                                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                  <MetricBox size="compact" label="Peso" value={`${update.assessment.weightKg} kg`} />
                                  <MetricBox size="compact" label="% Gordura" value={`${update.assessment.bodyFatPercent}%`} />
                                  <MetricBox size="compact" label="Massa Magra" value={`${update.assessment.muscleMassKg} kg`} />
                                  <MetricBox size="compact" label="Cintura" value={`${update.assessment.waistCm} cm`} />
                                </div>

                                <div className="pt-2 flex justify-end">
                                  <EditIconButton onClick={() => onOpenEditAssessment(update.assessment!)} title="Editar Avaliação Física" />
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-surface-subtle border border-dashed border-border-subtle rounded-surface flex items-center justify-center text-text-muted italic text-style-caption">
                                Nenhuma avaliação física foi realizada nesta data.
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

