'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Ruler,
  Scale,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { EditIconButton, IconButton } from '@/components/atoms';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { MetricBoxGroup, type MetricBoxGroupItem } from '@/components/organisms/MetricBoxGroup';
import type { BodyAssessment } from '@/lib/patientsStore';

export interface PatientAssessmentsTableProps {
  patientId: string;
  assessments: BodyAssessment[];
  onOpenEditAssessment?: (assessment: BodyAssessment) => void;
}

const columns: DataTableColumnDef<BodyAssessment>[] = [
  {
    id: 'date',
    header: 'Data / Consulta',
    headerClassName: 'whitespace-nowrap px-4 py-3 min-w-[130px]',
    cell: () => null,
  },
  {
    id: 'weight',
    header: 'Peso (kg)',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-center min-w-[100px]',
    cell: () => null,
  },
  {
    id: 'bodyFat',
    header: '% Gordura (BF)',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-center min-w-[120px]',
    cell: () => null,
  },
  {
    id: 'muscleMass',
    header: 'Massa Magra',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-center min-w-[110px]',
    cell: () => null,
  },
  {
    id: 'waist',
    header: 'Cintura',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-center min-w-[100px]',
    cell: () => null,
  },
  {
    id: 'evolution',
    header: 'Evolução',
    headerClassName: 'whitespace-nowrap px-4 py-3 min-w-[130px]',
    cell: () => null,
  },
  {
    id: 'actions',
    header: 'Ações & Detalhes',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-right min-w-[150px]',
    cell: () => null,
  },
];

export function AssessmentTableRow({
  patientId,
  assessment,
  isExpanded,
  onToggleExpand,
}: {
  patientId: string;
  assessment: BodyAssessment;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const hasPerimeters = Boolean(
    assessment.bustCm ||
    assessment.leftArmCm ||
    assessment.rightArmCm ||
    assessment.abdomenCm ||
    assessment.hipCm ||
    assessment.leftProximalThighCm ||
    assessment.rightProximalThighCm ||
    assessment.leftDistalThighCm ||
    assessment.rightDistalThighCm ||
    assessment.leftCalfCm ||
    assessment.rightCalfCm ||
    assessment.neckCm ||
    assessment.scapulaCm
  );

  return (
    <TableRow className="hover:bg-surface-hover transition-colors">
      {/* 1. Data */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="shrink-0 text-text-muted" aria-hidden="true" />
          <span className={textStyle('table-cell-strong')}>{assessment.date}</span>
        </div>
      </TableCell>

      {/* 2. Peso */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-center">
        <span className={`font-bold text-text-primary ${textStyle('table-number')}`}>
          {assessment.weightKg !== undefined ? `${assessment.weightKg} kg` : '—'}
        </span>
      </TableCell>

      {/* 3. % Gordura */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-center">
        <span className={`text-text-secondary ${textStyle('table-number')}`}>
          {assessment.bodyFatPercent !== undefined ? `${assessment.bodyFatPercent}%` : '—'}
        </span>
      </TableCell>

      {/* 4. Massa Magra */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-center">
        <span className={`text-text-secondary ${textStyle('table-number')}`}>
          {assessment.muscleMassKg !== undefined ? `${assessment.muscleMassKg} kg` : '—'}
        </span>
      </TableCell>

      {/* 5. Cintura */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-center">
        <span className={`text-text-secondary ${textStyle('table-number')}`}>
          {assessment.waistCm !== undefined ? `${assessment.waistCm} cm` : '—'}
        </span>
      </TableCell>

      {/* 6. Evolução */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <span className={`inline-flex items-center gap-1 text-success ${textStyle('caption')}`}>
          <TrendingDown size={12} aria-hidden="true" />
          <span>Evolução Favorável</span>
        </span>
      </TableCell>

      {/* 7. Ações & Detalhes */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          {hasPerimeters && (
            <Button
              type="button"
              variant="quiet"
              size="compact"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              aria-expanded={isExpanded}
              title={isExpanded ? 'Recolher detalhes das medidas' : 'Ver perímetros e medidas complementares'}
              className={`flex items-center gap-1 text-text-secondary hover:text-text-primary ${textStyle('caption')}`}
            >
              <span>{isExpanded ? 'Ocultar' : 'Detalhes'}</span>
              <ChevronDown
                size={13}
                aria-hidden="true"
                className={cn('transition-transform duration-standard shrink-0', isExpanded && 'rotate-180')}
              />
            </Button>
          )}
          <Link
            href={`/pacientes/${patientId}/avaliacao/${assessment.id}`}
            title="Editar Avaliação Física"
            aria-label="Editar Avaliação Física"
          >
            <EditIconButton title="Editar Avaliação Física" size="compact" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AssessmentTableExpandedRow({
  assessment,
}: {
  assessment: BodyAssessment;
}) {
  const perimeterItems: MetricBoxGroupItem[] = [];

  if (assessment.abdomenCm !== undefined) {
    perimeterItems.push({
      label: 'Abdômen',
      value: `${assessment.abdomenCm} cm`,
      size: 'compact',
      layout: 'stack',
      surface: 'inline',
    });
  }
  if (assessment.hipCm !== undefined) {
    perimeterItems.push({
      label: 'Quadril',
      value: `${assessment.hipCm} cm`,
      size: 'compact',
      layout: 'stack',
      surface: 'inline',
    });
  }
  if (assessment.bustCm !== undefined) {
    perimeterItems.push({
      label: 'Tórax/Busto',
      value: `${assessment.bustCm} cm`,
      size: 'compact',
      layout: 'stack',
      surface: 'inline',
    });
  }
  if (assessment.leftArmCm !== undefined) {
    const armValue =
      assessment.rightArmCm && assessment.rightArmCm !== assessment.leftArmCm
        ? `${assessment.leftArmCm} / ${assessment.rightArmCm} cm`
        : `${assessment.leftArmCm} cm`;
    perimeterItems.push({
      label: 'Braço (E/D)',
      value: armValue,
      size: 'compact',
      layout: 'stack',
      surface: 'inline',
    });
  }
  if (assessment.leftProximalThighCm !== undefined) {
    const thighValue =
      assessment.rightProximalThighCm && assessment.rightProximalThighCm !== assessment.leftProximalThighCm
        ? `${assessment.leftProximalThighCm} / ${assessment.rightProximalThighCm} cm`
        : `${assessment.leftProximalThighCm} cm`;
    perimeterItems.push({
      label: 'Coxa Prox.',
      value: thighValue,
      size: 'compact',
      layout: 'stack',
      surface: 'inline',
    });
  }
  if (assessment.leftCalfCm !== undefined) {
    const calfValue =
      assessment.rightCalfCm && assessment.rightCalfCm !== assessment.leftCalfCm
        ? `${assessment.leftCalfCm} / ${assessment.rightCalfCm} cm`
        : `${assessment.leftCalfCm} cm`;
    perimeterItems.push({
      label: 'Panturrilha',
      value: calfValue,
      size: 'compact',
      layout: 'stack',
      surface: 'inline',
    });
  }

  return (
    <TableRow className="bg-surface-subtle" data-expanded-assessment-id={assessment.id}>
      <TableCell colSpan={7} className="border-b border-t border-border-subtle p-4">
        <div className="flex flex-col gap-3 rounded-surface border border-border-subtle bg-surface p-4 animate-in fade-in-50 slide-in-from-top-2 duration-fast">
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 ${textStyle('caption-strong')}`}>
              <Ruler size={13} className="text-primary" aria-hidden="true" />
              <span>Circunferências & Perímetros Corporais</span>
            </span>
            {assessment.autoFilledFields && assessment.autoFilledFields.length > 0 && (
              <span className={`text-text-muted flex items-center gap-1 ${textStyle('legal')}`}>
                <CheckCircle2 size={11} className="text-primary" aria-hidden="true" />
                <span>{assessment.autoFilledFields.length} medidas mantidas da avaliação anterior</span>
              </span>
            )}
          </div>

          {perimeterItems.length > 0 ? (
            <MetricBoxGroup items={perimeterItems} />
          ) : (
            <p className={cn(textStyle('caption'), 'italic text-text-muted text-center py-2')}>
              Nenhum perímetro complementar registrado para esta avaliação.
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PatientAssessmentsTable({
  patientId,
  assessments = [],
}: PatientAssessmentsTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRowId((currentId) => (currentId === rowId ? null : rowId));
  };

  if (assessments.length === 0) {
    return (
      <div className="rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-8 text-center">
        <p className={textStyle('body-secondary')}>
          Nenhuma avaliação física registrada para este paciente até o momento.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      data={assessments}
      columns={columns}
      getRowId={(assessment) => assessment.id}
      caption="Histórico de avaliações físicas e composição corporal"
      ariaLabel="Histórico de avaliações físicas e composição corporal"
      emptyMessage="Nenhuma avaliação física registrada para este paciente até o momento."
      expandedRowId={expandedRowId}
      renderRow={(assessment) => {
        const rowId = assessment.id;
        return (
          <AssessmentTableRow
            patientId={patientId}
            assessment={assessment}
            isExpanded={expandedRowId === rowId}
            onToggleExpand={() => toggleRowExpansion(rowId)}
          />
        );
      }}
      renderExpandedRow={(assessment) => (
        <AssessmentTableExpandedRow assessment={assessment} />
      )}
      className="border border-border-subtle rounded-surface overflow-hidden"
      tableClassName="table-fixed"
    />
  );
}
