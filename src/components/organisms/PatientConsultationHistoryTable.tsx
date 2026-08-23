'use client';

import React, { useState, useMemo } from 'react';
import { textStyle } from '@/design-system';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';
import {
  buildConsolidatedConsultations,
  type ConsolidatedConsultation,
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
    headerClassName: 'px-4 py-3',
    cell: () => null,
  },
  {
    id: 'record-type',
    header: 'Tipo de Registro',
    headerClassName: 'px-4 py-3',
    cell: () => null,
  },
  {
    id: 'diet',
    header: 'Dados Dietéticos',
    headerClassName: 'px-4 py-3',
    cell: () => null,
  },
  {
    id: 'assessment',
    header: 'Valores Corporais',
    headerClassName: 'px-4 py-3',
    cell: () => null,
  },
  {
    id: 'actions',
    header: 'Ação / Detalhes',
    headerClassName: 'px-4 py-3 text-right',
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

  const consultations = useMemo(() => {
    return buildConsolidatedConsultations(resolvedDiets, resolvedAssessments);
  }, [resolvedDiets, resolvedAssessments]);

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRowId((currentId) => (currentId === rowId ? null : rowId));
  };

  return (
    <section
      role="region"
      aria-label="Histórico de consultas"
      className="flex flex-col gap-4"
    >
      {consultations.length === 0 ? (
        <div className="rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-6 text-center">
          <p className={textStyle('body-secondary')}>
            Nenhum histórico registrado para este paciente até o momento.
          </p>
        </div>
      ) : (
        <DataTable
          data={consultations}
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


