'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Eye, Utensils } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { EditIconButton, DeleteIconButton, Badge } from '@/components/atoms';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import type { HistoricalDiet } from '@/lib/patientsStore';
import { DAYS_OF_WEEK } from '@/lib/dietStore';

export interface PatientDietsTableProps {
  patientId: string;
  diets: HistoricalDiet[];
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onDeleteDiet?: (diet: HistoricalDiet) => void;
}

const columns: DataTableColumnDef<HistoricalDiet>[] = [
  {
    id: 'date',
    header: 'Data de Prescrição',
    headerClassName: 'whitespace-nowrap px-4 py-3 min-w-[140px]',
    cell: () => null,
  },
  {
    id: 'name',
    header: 'Plano Alimentar',
    headerClassName: 'whitespace-nowrap px-4 py-3 min-w-[220px]',
    cell: () => null,
  },
  {
    id: 'status',
    header: 'Status',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-center min-w-[120px]',
    cell: () => null,
  },
  {
    id: 'macros',
    header: 'Macronutrientes',
    headerClassName: 'whitespace-nowrap px-4 py-3 min-w-[200px]',
    cell: () => null,
  },
  {
    id: 'calories',
    header: 'Calorias',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-center min-w-[110px]',
    cell: () => null,
  },
  {
    id: 'actions',
    header: 'Ações',
    headerClassName: 'whitespace-nowrap px-4 py-3 text-right min-w-[190px]',
    cell: () => null,
  },
];

function formatAssignedDays(days: string[] = []): string {
  return days
    .map((dayId) => DAYS_OF_WEEK.find((day) => day.id === dayId)?.shortLabel ?? dayId)
    .join(', ');
}

function DietCycleDetails({ diet }: { diet: HistoricalDiet }) {
  const variations = diet.carbCyclingVariations ?? [];
  const daysAssigned = variations.reduce(
    (total, variation) => total + (variation.assignedDays?.length ?? 0),
    0,
  );

  return (
    <TableRow id={`diet-cycle-details-${diet.id}`} className="bg-surface-subtle/40">
      <TableCell colSpan={6} className="border-b border-t border-border-subtle p-4">
        <div className="flex flex-col gap-3" data-testid="diet-cycle-details">
          <div className="flex items-center justify-between gap-3">
            <span className={`flex items-center gap-1.5 ${textStyle('caption-strong')}`}>
              <Calendar size={13} className="text-primary" aria-hidden="true" />
              <span>Variações do ciclo</span>
            </span>
            <span className={textStyle('metadata')}>
              Média semanal ponderada ·{' '}
              {daysAssigned > 0 ? `${daysAssigned} dias atribuídos` : 'dias não atribuídos'}
            </span>
          </div>

          {variations.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {variations.map((variation) => {
                const assignedDays = formatAssignedDays(variation.assignedDays);

                return (
                  <div
                    key={variation.id}
                    className="min-w-0 rounded-control border border-border-subtle bg-surface p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={textStyle('table-cell-strong')}>{variation.name}</span>
                      <span className={textStyle('metadata')}>
                        {variation.assignedDays?.length ?? 0} dias
                      </span>
                    </div>
                    <MacroSummary
                      protein={variation.proteinG}
                      carbs={variation.carbsG}
                      fats={variation.fatsG}
                      kcal={variation.targetKcal}
                      className="mt-2"
                    />
                    <div className={`mt-2 flex items-center gap-1.5 ${textStyle('metadata')}`}>
                      <Calendar size={12} className="shrink-0" aria-hidden="true" />
                      <span>{assignedDays || 'Nenhum dia vinculado'}</span>
                    </div>
                    <div className={`mt-1 flex items-center gap-1.5 ${textStyle('metadata')}`}>
                      <Utensils size={12} className="shrink-0" aria-hidden="true" />
                      <span>
                        {variation.mealsCount}{' '}
                        {variation.mealsCount === 1 ? 'refeição' : 'refeições'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={textStyle('caption')}>Este ciclo não possui variações configuradas.</p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function DietTableRow({
  patientId,
  diet,
  isExpanded,
  onToggleExpand,
  onOpenReadOnlyDiet,
  onDeleteDiet,
}: {
  patientId: string;
  diet: HistoricalDiet;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onDeleteDiet?: (diet: HistoricalDiet) => void;
}) {
  const isActive = diet.status === 'Ativa';
  const isCarbCycling = diet.mode === 'carb_cycling';
  const hasCycleDetails = isCarbCycling && (diet.carbCyclingVariations?.length ?? 0) > 0;

  return (
    <TableRow
      className={`transition-colors ${
        isActive
          ? 'border-l-4 border-l-primary bg-primary-soft/30 hover:bg-primary-soft/50'
          : 'hover:bg-surface-hover'
      }`}
    >
      {/* 1. Data */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="shrink-0 text-text-muted" aria-hidden="true" />
          <span className={textStyle('table-cell-strong')}>{diet.date}</span>
        </div>
      </TableCell>

      {/* 2. Nome do Plano */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-2">
            <Utensils size={14} className="shrink-0 text-primary" aria-hidden="true" />
            <span className={`font-semibold text-text-primary ${textStyle('body-strong')}`}>
              {diet.name}
            </span>
          </div>
          {isCarbCycling && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="primary">Ciclo de Carboidratos</Badge>
              {hasCycleDetails && (
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  aria-expanded={isExpanded}
                  aria-controls={`diet-cycle-details-${diet.id}`}
                  aria-label={
                    isExpanded
                      ? `Recolher variações de ${diet.name}`
                      : `Ver variações de ${diet.name}`
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleExpand();
                  }}
                  className="inline-flex items-center gap-1 px-1 text-text-secondary hover:text-text-primary"
                >
                  <span>{isExpanded ? 'Ocultar variações' : 'Ver variações'}</span>
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={isExpanded ? 'rotate-180' : undefined}
                  />
                </Button>
              )}
            </div>
          )}
        </div>
      </TableCell>

      {/* 3. Status */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-center">
        <Badge variant={isActive ? 'primary' : 'neutral'}>
          {isActive ? 'Plano Ativo' : 'Histórica'}
        </Badge>
      </TableCell>

      {/* 4. Macros */}
      <TableCell className="whitespace-nowrap px-4 py-3.5">
        <MacroSummary
          protein={diet.proteinG}
          carbs={diet.carbsG}
          fats={diet.fatsG}
          showKcal={false}
          className={textStyle('table-number')}
        />
      </TableCell>

      {/* 5. Calorias */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-center">
        <span className={`font-bold text-text-primary ${textStyle('table-number')}`}>
          {diet.targetKcal} kcal
        </span>
      </TableCell>

      {/* 6. Ações */}
      <TableCell className="whitespace-nowrap px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="compact"
            onClick={() => onOpenReadOnlyDiet(diet)}
            className="flex items-center gap-1.5"
            aria-label={`Ver cardápio completo da dieta ${diet.name}`}
          >
            <Eye size={13} aria-hidden="true" />
            <span>Ver Cardápio</span>
          </Button>
          <Link
            href={`/pacientes/${patientId}/dieta/${diet.id}`}
            title={`Editar ${diet.name} no Construtor de Dietas`}
            aria-label={`Editar ${diet.name} no Construtor de Dietas`}
          >
            <EditIconButton title="Editar no Construtor de Dietas" size="compact" />
          </Link>
          {onDeleteDiet && (
            <DeleteIconButton
              title={`Excluir prescrição ${diet.name}`}
              aria-label={`Excluir prescrição ${diet.name}`}
              size="compact"
              onClick={() => onDeleteDiet(diet)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PatientDietsTable({
  patientId,
  diets = [],
  onOpenReadOnlyDiet,
  onDeleteDiet,
}: PatientDietsTableProps) {
  const [expandedDietId, setExpandedDietId] = React.useState<string | null>(null);

  if (diets.length === 0) {
    return (
      <div className="rounded-surface border border-dashed border-border-subtle bg-surface-subtle p-8 text-center">
        <p className={textStyle('body-secondary')}>
          Nenhuma prescrição dietética registrada para este paciente até o momento.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      data={diets}
      columns={columns}
      getRowId={(diet) => diet.id}
      caption="Histórico de prescrições dietéticas e planos alimentares"
      ariaLabel="Histórico de prescrições dietéticas e planos alimentares"
      emptyMessage="Nenhuma prescrição dietética registrada para este paciente até o momento."
      renderRow={(diet) => (
        <DietTableRow
          patientId={patientId}
          diet={diet}
          isExpanded={expandedDietId === diet.id}
          onToggleExpand={() =>
            setExpandedDietId((currentId) => (currentId === diet.id ? null : diet.id))
          }
          onOpenReadOnlyDiet={onOpenReadOnlyDiet}
          onDeleteDiet={onDeleteDiet}
        />
      )}
      expandedRowId={expandedDietId}
      renderExpandedRow={(diet) =>
        diet.mode === 'carb_cycling' && (diet.carbCyclingVariations?.length ?? 0) > 0 ? (
          <DietCycleDetails diet={diet} />
        ) : null
      }
      className="border border-border-subtle rounded-surface overflow-hidden"
      tableClassName="table-fixed"
    />
  );
}
