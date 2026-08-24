'use client';

import React, { useState, useMemo } from 'react';
import { Layers, Scale, Utensils } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';
import {
  buildConsolidatedConsultations,
  type ConsolidatedConsultation,
  type TimelineFilter,
} from '@/lib/patientProfileConsultations';
import {
  ConsultationHistoryExpandedRow,
  ConsultationHistoryRow,
} from './patient/ConsultationHistoryRow';

export interface ConsolidatedConsultationUpdate {
  id?: string;
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}

export interface PatientConsultationHistoryTableProps {
  patientId: string;
  diets?: HistoricalDiet[];
  assessments?: BodyAssessment[];
  updates?: ConsolidatedConsultationUpdate[];
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onOpenEditAssessment?: (assessment: BodyAssessment) => void;
}

const columns: DataTableColumnDef<ConsolidatedConsultation>[] = [
  {
    id: 'date',
    header: 'Data / Consulta',
    headerClassName: 'px-4 py-3 min-w-[140px]',
    cell: () => null,
  },
  {
    id: 'record-type',
    header: 'Tipo de Atendimento',
    headerClassName: 'px-4 py-3 min-w-[150px]',
    cell: () => null,
  },
  {
    id: 'diet',
    header: 'Prescrição Dietética',
    headerClassName: 'px-4 py-3 min-w-[260px]',
    cell: () => null,
  },
  {
    id: 'assessment',
    header: 'Avaliação Antropométrica',
    headerClassName: 'px-4 py-3 min-w-[200px]',
    cell: () => null,
  },
  {
    id: 'actions',
    header: 'Ações & Detalhes',
    headerClassName: 'px-4 py-3 text-right min-w-[170px]',
    cell: () => null,
  },
];

export function PatientConsultationHistoryTable({
  patientId,
  diets = [],
  assessments = [],
  updates = [],
  onOpenReadOnlyDiet,
  onOpenEditAssessment,
}: PatientConsultationHistoryTableProps) {
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Fallback to extract from updates if direct diets/assessments arrays are not passed
  const resolvedDiets = useMemo(() => {
    if (diets.length > 0) return diets;
    const extracted: HistoricalDiet[] = [];
    updates.forEach((u) => {
      if (u.diet && !extracted.some((d) => d.id === u.diet!.id)) {
        extracted.push(u.diet);
      }
    });
    return extracted;
  }, [diets, updates]);

  const resolvedAssessments = useMemo(() => {
    if (assessments.length > 0) return assessments;
    const extracted: BodyAssessment[] = [];
    updates.forEach((u) => {
      if (u.assessment && !extracted.some((a) => a.id === u.assessment!.id)) {
        extracted.push(u.assessment);
      }
    });
    return extracted;
  }, [assessments, updates]);

  const allConsultations = useMemo(() => {
    return buildConsolidatedConsultations(resolvedDiets, resolvedAssessments);
  }, [resolvedDiets, resolvedAssessments]);

  const totalDiets = resolvedDiets.length;
  const totalAssessments = resolvedAssessments.length;
  const totalAll = allConsultations.length;

  const filteredConsultations = useMemo(() => {
    return allConsultations.filter((c) => {
      if (filter === 'all') return true;
      if (filter === 'assessments') return c.hasAssessment;
      if (filter === 'diets') return c.hasDiet;
      return true;
    });
  }, [allConsultations, filter]);

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRowId((currentId) => (currentId === rowId ? null : rowId));
  };

  return (
    <section
      role="region"
      aria-label="Histórico de consultas"
      className="flex flex-col gap-4 w-full"
    >
      {/* Barra de Filtros Rápidos (Abas) no topo da Tabela */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-divider pb-3">
        <div
          role="tablist"
          aria-label="Filtrar histórico por tipo de atendimento"
          className="flex items-center gap-1.5 rounded-surface border border-border-subtle bg-surface-subtle/60 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`flex items-center gap-1.5 rounded-control px-3 py-1.5 text-style-caption transition-colors duration-fast ease-standard ${
              filter === 'all'
                ? 'bg-surface font-semibold text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers size={13} aria-hidden="true" />
            <span>Todas as Consultas</span>
            <Badge
              variant="secondary"
              className="ml-0.5 px-1.5 py-0 text-style-legal font-bold text-text-secondary"
            >
              {totalAll}
            </Badge>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'assessments'}
            onClick={() => setFilter('assessments')}
            className={`flex items-center gap-1.5 rounded-control px-3 py-1.5 text-style-caption transition-colors duration-fast ease-standard ${
              filter === 'assessments'
                ? 'bg-surface font-semibold text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Scale size={13} aria-hidden="true" />
            <span>Avaliações Físicas</span>
            <Badge
              variant="secondary"
              className="ml-0.5 px-1.5 py-0 text-style-legal font-bold text-text-secondary"
            >
              {totalAssessments}
            </Badge>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'diets'}
            onClick={() => setFilter('diets')}
            className={`flex items-center gap-1.5 rounded-control px-3 py-1.5 text-style-caption transition-colors duration-fast ease-standard ${
              filter === 'diets'
                ? 'bg-surface font-semibold text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Utensils size={13} aria-hidden="true" />
            <span>Prescrições Dietéticas</span>
            <Badge
              variant="secondary"
              className="ml-0.5 px-1.5 py-0 text-style-legal font-bold text-text-secondary"
            >
              {totalDiets}
            </Badge>
          </button>
        </div>

        <span className={textStyle('caption')}>
          {filteredConsultations.length === 1 ? '1 registro exibido' : `${filteredConsultations.length} registros exibidos`}
        </span>
      </div>

      {/* Visualização em Tabela */}
      {filteredConsultations.length === 0 ? (
        <div className="rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-8 text-center">
          <p className={textStyle('body-secondary')}>
            {totalAll === 0
              ? 'Nenhum histórico registrado para este paciente até o momento.'
              : filter === 'assessments'
              ? 'Nenhuma avaliação física registrada para este paciente.'
              : 'Nenhuma prescrição dietética registrada para este paciente.'}
          </p>
        </div>
      ) : (
        <DataTable
          data={filteredConsultations}
          columns={columns}
          getRowId={(consultation) => consultation.id}
          caption="Histórico de consultas por data"
          ariaLabel="Histórico de consultas por data"
          emptyMessage="Nenhum histórico registrado para este paciente até o momento."
          expandedRowId={expandedRowId}
          renderRow={(consultation) => {
            const rowId = consultation.id;
            return (
              <ConsultationHistoryRow
                patientId={patientId}
                consultation={consultation}
                isExpanded={expandedRowId === rowId}
                onToggleExpand={() => toggleRowExpansion(rowId)}
                onOpenReadOnlyDiet={onOpenReadOnlyDiet}
                onOpenEditAssessment={onOpenEditAssessment}
              />
            );
          }}
          renderExpandedRow={(consultation) => (
            <ConsultationHistoryExpandedRow
              patientId={patientId}
              consultation={consultation}
              onOpenReadOnlyDiet={onOpenReadOnlyDiet}
            />
          )}
          className="border border-border-subtle rounded-surface overflow-hidden"
          tableClassName="table-fixed"
        />
      )}
    </section>
  );
}



