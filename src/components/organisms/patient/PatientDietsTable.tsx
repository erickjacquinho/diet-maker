'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Eye } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditIconButton, DeleteIconButton, Badge } from '@/components/atoms';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import type { HistoricalDiet, HistoricalDietVariation } from '@/lib/patientsStore';
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
    headerClassName: 'w-1/6 whitespace-nowrap px-2 py-3',
    cell: () => null,
  },
  {
    id: 'name',
    header: 'Plano Alimentar',
    headerClassName: 'w-1/4 whitespace-nowrap px-2 py-3',
    cell: () => null,
  },
  {
    id: 'status',
    header: 'Status',
    headerClassName: 'w-1/12 whitespace-nowrap px-2 py-3 text-center',
    cell: () => null,
  },
  {
    id: 'macros',
    header: 'Macronutrientes',
    headerClassName: 'w-1/4 whitespace-nowrap px-2 py-3',
    cell: () => null,
  },
  {
    id: 'calories',
    header: 'Calorias',
    headerClassName: 'w-1/12 whitespace-nowrap px-2 py-3 text-center',
    cell: () => null,
  },
  {
    id: 'actions',
    header: 'Ações',
    headerClassName: 'w-1/6 whitespace-nowrap px-2 py-3 text-right',
    cell: () => null,
  },
];

function formatDietType(diet: HistoricalDiet): string {
  return diet.mode === 'carb_cycling' ? 'Ciclo de carboidratos' : 'Simples';
}

function formatAssignedDays(days: string[] = []): string {
  const uniqueDays = Array.from(new Set(days));
  const orderedKnownDays = DAYS_OF_WEEK
    .filter((day) => uniqueDays.includes(day.id))
    .map((day) => day.shortLabel);
  const unknownDays = uniqueDays.filter((dayId) => !DAYS_OF_WEEK.some((day) => day.id === dayId));

  return [...orderedKnownDays, ...unknownDays].join(', ');
}

function formatVariationDays(days: string[] = []): string {
  return formatAssignedDays(days) || 'Nenhum dia atribuído';
}

function formatVariationMeals(mealsCount: number): string {
  if (mealsCount <= 0) return 'Nenhuma refeição';
  return `${mealsCount} ${mealsCount === 1 ? 'refeição' : 'refeições'}`;
}

function formatVariationType(variation: HistoricalDietVariation): string {
  const labels: Record<HistoricalDietVariation['type'], string> = {
    high: 'Alto',
    medium: 'Moderado',
    low: 'Baixo',
    zero: 'Zero',
    custom: 'Personalizado',
  };

  return labels[variation.type] ?? variation.type;
}

function DietCycleDetails({ diet }: { diet: HistoricalDiet }) {
  const variations = diet.carbCyclingVariations ?? [];
  const daysAssigned = variations.reduce(
    (total, variation) => total + (variation.assignedDays?.length ?? 0),
    0,
  );

  return (
    <TableRow
      id={`diet-cycle-details-${diet.id}`}
      className="bg-surface-subtle/40 hover:bg-surface-subtle/40"
    >
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
            <Table
              aria-label={`Variações do ciclo de ${diet.name}`}
              containerClassName="overflow-hidden rounded-surface border border-border-subtle"
              className="w-full table-fixed bg-surface"
            >
              <TableCaption className="sr-only">
                Variações históricas do ciclo de {diet.name}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
                  <TableHead scope="col" className="h-table-row w-1/3 px-2 py-1">Variação</TableHead>
                  <TableHead scope="col" className="h-table-row w-1/6 px-2 py-1">Dias</TableHead>
                  <TableHead scope="col" className="h-table-row w-1/4 px-2 py-1">Macronutrientes</TableHead>
                  <TableHead scope="col" className="h-table-row w-1/12 px-2 py-1 text-center">Calorias</TableHead>
                  <TableHead scope="col" className="h-table-row w-1/6 px-2 py-1">Refeições</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation) => {
                  const assignedDays = formatVariationDays(variation.assignedDays);
                  const variationType = formatVariationType(variation);

                  return (
                    <TableRow key={variation.id} className="h-table-row bg-surface hover:bg-surface">
                      <TableCell className="h-table-row max-w-0 whitespace-nowrap px-2 py-1">
                        <div className="flex min-w-0 items-center gap-1">
                          <span
                            className={`min-w-0 truncate ${textStyle('table-cell-strong')}`}
                            title={variation.name}
                          >
                            {variation.name}
                          </span>
                          <span className={`shrink-0 ${textStyle('table-cell-strong')}`}>
                            · Tipo {variationType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`h-table-row max-w-0 whitespace-nowrap px-2 py-1 ${textStyle('metadata')}`}
                        title={assignedDays}
                      >
                        <span className="block truncate">{assignedDays}</span>
                      </TableCell>
                      <TableCell className="h-table-row min-w-0 whitespace-nowrap px-2 py-1">
                        <MacroSummary
                          protein={variation.proteinG}
                          carbs={variation.carbsG}
                          fats={variation.fatsG}
                          showKcal={false}
                          className={textStyle('table-number')}
                        />
                      </TableCell>
                      <TableCell className="h-table-row whitespace-nowrap px-2 py-1 text-center tabular-nums">
                        <span className={`font-bold text-text-primary ${textStyle('table-number')}`}>
                          {variation.targetKcal} kcal
                        </span>
                      </TableCell>
                      <TableCell
                        className={`h-table-row whitespace-nowrap px-2 py-1 ${textStyle('metadata')}`}
                      >
                        {formatVariationMeals(variation.mealsCount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className={textStyle('caption')}>
              Este ciclo não possui variações configuradas.
            </p>
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
  const hasCycleDetails = isCarbCycling;

  return (
    <TableRow
      className={`group h-table-row transition-colors ${
        isActive
        ? 'border-l-4 border-l-primary bg-primary-soft/30 hover:bg-primary-soft/30'
          : 'bg-transparent hover:bg-transparent'
      }`}
    >
      {/* 1. Data */}
      <TableCell className="whitespace-nowrap px-1 py-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="shrink-0 text-text-muted" aria-hidden="true" />
          <span className={textStyle('table-cell-strong')}>{diet.date}</span>
        </div>
      </TableCell>

      {/* 2. Tipo do Plano */}
      <TableCell className="min-w-0 whitespace-nowrap px-1 py-1">
        <div className="flex min-w-0 items-center gap-1">
          <span
            className={`min-w-0 whitespace-nowrap font-semibold text-text-primary ${textStyle('body-strong')}`}
          >
            {formatDietType(diet)}
          </span>
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
              title={isExpanded ? 'Ocultar variações' : 'Ver variações'}
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpand();
              }}
              className="shrink-0 p-0 text-text-secondary hover:text-text-primary"
            >
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={isExpanded ? 'rotate-180' : undefined}
              />
            </Button>
          )}
        </div>
      </TableCell>

      {/* 3. Status */}
      <TableCell className="whitespace-nowrap px-1 py-1 text-center">
        <Badge variant={isActive ? 'primary' : 'neutral'} className="px-1">
          {isActive ? 'Ativo' : 'Histórico'}
        </Badge>
      </TableCell>

      {/* 4. Macros */}
      <TableCell className="min-w-0 whitespace-nowrap px-1 py-1">
        <MacroSummary
          protein={diet.proteinG}
          carbs={diet.carbsG}
          fats={diet.fatsG}
          showKcal={false}
          className={textStyle('table-number')}
        />
      </TableCell>

      {/* 5. Calorias */}
      <TableCell className="whitespace-nowrap px-1 py-1 text-center">
        <span className={`font-bold text-text-primary ${textStyle('table-number')}`}>
          {diet.targetKcal} kcal
        </span>
      </TableCell>

      {/* 6. Ações */}
      <TableCell className="whitespace-nowrap px-1 py-1 text-right">
        <div className="pointer-events-none flex items-center justify-end gap-1 invisible group-hover:pointer-events-auto group-hover:visible group-focus-within:pointer-events-auto group-focus-within:visible">
          <Button
            type="button"
            variant="secondary"
            size="compact"
            iconOnly
            onClick={() => onOpenReadOnlyDiet(diet)}
            aria-label={`Ver cardápio completo da dieta ${diet.name}`}
            title={`Ver cardápio completo da dieta ${diet.name}`}
          >
            <Eye size={13} aria-hidden="true" />
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
        diet.mode === 'carb_cycling' ? (
          <DietCycleDetails diet={diet} />
        ) : null
      }
      tableClassName="table-fixed"
      className="border border-border-subtle rounded-surface overflow-hidden"
    />
  );
}
