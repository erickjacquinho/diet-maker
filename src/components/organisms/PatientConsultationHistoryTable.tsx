'use client';

import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { textStyle } from '@/design-system';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import type { BodyAssessment, HistoricalDiet } from '@/lib/patientsStore';
import { ConsultationHistoryRow } from './patient/ConsultationHistoryRow';

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
              {updates.map((update) => (
                <ConsultationHistoryRow
                  key={update.date}
                  patientId={patientId}
                  update={update}
                  isExpanded={expandedRowDate === update.date}
                  onToggleExpand={() => toggleRowExpansion(update.date)}
                  onOpenReadOnlyDiet={onOpenReadOnlyDiet}
                  onOpenEditAssessment={onOpenEditAssessment}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
