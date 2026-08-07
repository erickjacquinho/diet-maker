'use client';

import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { textStyle } from '@/design-system';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';
import { ConsultationHistoryExpandedRow, ConsultationHistoryRow } from './patient/ConsultationHistoryRow';

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

const columns: DataTableColumnDef<ConsolidatedConsultationUpdate>[] = [
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
  updates,
  onOpenReadOnlyDiet,
  onOpenEditAssessment,
}: PatientConsultationHistoryTableProps) {
  const [expandedRowDate, setExpandedRowDate] = useState<string | null>(null);

  const toggleRowExpansion = (date: string) => {
    setExpandedRowDate((currentDate) => (currentDate === date ? null : date));
  };

  return (
    <section
      role="region"
      aria-labelledby="consultation-history-title"
      className="flex flex-col gap-4 border-t border-border-divider pt-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} className="shrink-0 text-text-secondary" />
          <div>
            <h2 id="consultation-history-title" className={textStyle('subsection-title')}>
              Histórico de consultas
            </h2>
            <p className={textStyle('caption')}>Dietas e avaliações físicas organizadas por data</p>
          </div>
        </div>
        <span className={textStyle('caption')}>
          {updates.length === 1 ? '1 consulta' : `${updates.length} consultas`}
        </span>
      </div>

      {updates.length === 0 ? (
        <div className="rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-6 text-center">
          <p className={textStyle('body-secondary')}>
            Nenhum histórico registrado para este paciente até o momento.
          </p>
        </div>
      ) : (
        <DataTable
          data={updates}
          columns={columns}
          getRowId={(update) => update.date}
          caption="Histórico de consultas por data"
          ariaLabel="Histórico de consultas por data"
          emptyMessage="Nenhum histórico registrado para este paciente até o momento."
          expandedRowId={expandedRowDate}
          renderRow={(update) => (
            <ConsultationHistoryRow
              patientId={patientId}
              update={update}
              isExpanded={expandedRowDate === update.date}
              onToggleExpand={() => toggleRowExpansion(update.date)}
              onOpenReadOnlyDiet={onOpenReadOnlyDiet}
              onOpenEditAssessment={onOpenEditAssessment}
            />
          )}
          renderExpandedRow={(update) => (
            <ConsultationHistoryExpandedRow
              patientId={patientId}
              update={update}
              onOpenReadOnlyDiet={onOpenReadOnlyDiet}
              onOpenEditAssessment={onOpenEditAssessment}
            />
          )}
          className="border border-border-subtle rounded-surface overflow-hidden"
          tableClassName="table-fixed"
        />
      )}
    </section>
  );
}
