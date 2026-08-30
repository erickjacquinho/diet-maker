'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button, Badge } from '@/components/atoms';
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableSortState,
} from '@/components/molecules/DataTable';
import { MacroSummary } from './MacroSummary';
import { TableCell, TableRow } from '@/components/ui/table';
import { DAYS_OF_WEEK, type CarbCyclingVariation } from '@/lib/dietStore';
import { textStyle } from '@/design-system';
import { Calendar, ChevronDown, History, Search, Sparkles, Copy, X, AlertCircle, Utensils } from 'lucide-react';
import type { PreviousDietSummary } from '@/lib/dietDuplication';

export interface ImportPreviousDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  diets: PreviousDietSummary[];
  onPullMacrosOnly: (selectedDiet: PreviousDietSummary) => void;
  onPullAllMeals: (selectedDiet: PreviousDietSummary) => void;
}

function formatAssignedDays(variation: CarbCyclingVariation) {
  return (variation.assignedDays || [])
    .map((dayId) => DAYS_OF_WEEK.find((day) => day.id === dayId)?.shortLabel || dayId)
    .join(', ');
}

function PreviousDietCycleDetails({ diet }: { diet: PreviousDietSummary }) {
  const variations = diet.fullPlan?.carbCyclingVariations || [];
  const assignedDays = diet.daysAssignedCount || 0;

  return (
    <TableRow className="bg-surface-subtle/40" data-expanded-row-id={diet.id} id={`previous-diet-cycle-${diet.id}`}>
      <TableCell colSpan={7} className="border-b border-t border-border-subtle p-4">
        <div className="flex flex-col gap-3 animate-in fade-in-50 slide-in-from-top-2 duration-fast">
          <div className="flex items-center justify-between gap-3">
            <span className={`flex items-center gap-1.5 ${textStyle('caption-strong')}`}>
              <Calendar size={13} className="text-primary" aria-hidden="true" />
              <span>Variações do ciclo</span>
            </span>
            <span className={textStyle('metadata')}>
              Média semanal ponderada · {assignedDays > 0 ? `${assignedDays} dias atribuídos` : 'dias não atribuídos'}
            </span>
          </div>

          {variations.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {variations.map((variation) => {
                const assignedDaysLabel = formatAssignedDays(variation);
                const mealsCount = variation.meals?.length || 0;

                return (
                  <div key={variation.id} className="min-w-0 border border-border-subtle bg-surface p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={textStyle('table-cell-strong')} title={variation.name}>
                        {variation.name}
                      </span>
                      <span className={textStyle('metadata')}>
                        {assignedDaysLabel || 'Sem dias'}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-1.5">
                      <MacroSummary
                        protein={variation.targetProtein}
                        carbs={variation.targetCarbs}
                        fats={variation.targetFats}
                        showKcal={false}
                        className={textStyle('table-number')}
                      />
                      <span className={`font-bold text-text-primary ${textStyle('table-number')}`}>
                        {variation.targetKcal} <span className="text-style-legal font-normal text-text-muted">kcal</span>
                      </span>
                    </div>

                    <div className={`mt-2 flex items-center gap-1.5 ${textStyle('metadata')}`}>
                      <Calendar size={12} className="shrink-0" aria-hidden="true" />
                      <span className="truncate" title={assignedDaysLabel || 'Nenhum dia vinculado'}>
                        {assignedDaysLabel || 'Nenhum dia vinculado'}
                      </span>
                    </div>
                    <div className={`mt-1 flex items-center gap-1.5 ${textStyle('metadata')}`}>
                      <Utensils size={12} className="shrink-0" aria-hidden="true" />
                      <span>{mealsCount} {mealsCount === 1 ? 'refeição' : 'refeições'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`${textStyle('caption')} py-2 text-center italic text-text-muted`}>
              Esta dieta está marcada como ciclo, mas não possui variações configuradas.
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export const ImportPreviousDietModal: React.FC<ImportPreviousDietModalProps> = ({
  isOpen,
  onClose,
  patientName,
  diets = [],
  onPullMacrosOnly,
  onPullAllMeals,
}) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedDietId, setExpandedDietId] = useState<string | null>(null);
  const [sortState, setSortState] = useState<DataTableSortState | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedId(null);
      setExpandedDietId(null);
      setSortState(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isOpen]);

  const filteredDiets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return diets;
    return diets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.date.toLowerCase().includes(q) ||
        d.modeLabel.toLowerCase().includes(q)
    );
  }, [diets, query]);

  const selectedDiet = useMemo(
    () => diets.find((d) => d.id === selectedId) || null,
    [diets, selectedId]
  );

  const selectedRowIds = useMemo(
    () => (selectedId ? new Set([selectedId]) : new Set<string>()),
    [selectedId]
  );

  const handleClose = () => {
    setSelectedId(null);
    setExpandedDietId(null);
    setQuery('');
    onClose();
  };

  const handleToggleExpanded = useCallback((dietId: string) => {
    setExpandedDietId((currentId) => (currentId === dietId ? null : dietId));
  }, []);

  const handleMacrosClick = () => {
    if (!selectedDiet) return;
    onPullMacrosOnly(selectedDiet);
    handleClose();
  };

  const handleMealsClick = () => {
    if (!selectedDiet) return;
    onPullAllMeals(selectedDiet);
    handleClose();
  };

  const columns: DataTableColumnDef<PreviousDietSummary>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Plano Alimentar',
        sortable: true,
        sortValue: (diet) => diet.name,
        headerClassName: 'text-left w-64 px-3',
        className: 'text-left py-2.5 px-3 text-style-body-small text-text-primary w-64',
        cell: (diet) => (
          <span className="block whitespace-normal break-words text-style-body-small font-bold text-text-primary" title={diet.name}>
            {diet.name}
          </span>
        ),
      },
      {
        id: 'date',
        header: 'Data',
        sortable: true,
        sortValue: (diet) => {
          if (!diet.date) return 0;
          const parts = diet.date.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`).getTime() || 0;
          }
          return new Date(diet.date).getTime() || 0;
        },
        align: 'left',
        headerClassName: 'text-left w-28 px-3',
        className: 'text-left py-2.5 px-3 text-style-legal text-text-muted w-28',
        cell: (diet) => (
          <span className="text-style-legal font-medium text-text-muted">
            {diet.date || 'Sem data'}
          </span>
        ),
      },
      {
        id: 'mode',
        header: 'Modo',
        sortable: true,
        sortValue: (diet) => diet.modeLabel,
        align: 'center',
        headerClassName: 'w-24 text-center px-3',
        className: 'w-24 text-center py-2.5 px-3',
        cell: (diet) => {
          const isCycling = diet.mode === 'carb_cycling';
          const variationsCount = diet.variationsCount || diet.fullPlan?.carbCyclingVariations?.length || 0;
          const isExpanded = expandedDietId === diet.id;

          return (
            <div className="inline-flex items-center justify-center gap-1">
              <Badge variant={isCycling ? 'primary' : 'neutral'}>{diet.modeLabel}</Badge>
              {isCycling && variationsCount > 0 && (
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleExpanded(diet.id);
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={`previous-diet-cycle-${diet.id}`}
                  aria-label={isExpanded ? `Recolher variações de ${diet.name}` : `Ver variações de ${diet.name}`}
                  title={isExpanded ? 'Recolher variações' : 'Ver variações do ciclo'}
                  className="inline-flex h-control-compact items-center gap-1 px-1 text-text-secondary hover:text-text-primary"
                >
                  <span className="text-style-chart-micro">{variationsCount} var.</span>
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={`transition-transform duration-standard ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        id: 'macros',
        header: 'Macros',
        align: 'center',
        headerClassName: 'w-56 px-3 text-center',
        className: 'w-56 px-3 py-2.5 text-center align-middle',
        cell: (diet) => (
          <MacroSummary
            protein={diet.proteinG}
            carbs={diet.carbsG}
            fats={diet.fatsG}
            showKcal={false}
            className={textStyle('table-number')}
          />
        ),
      },
      {
        id: 'kcal',
        header: 'Calorias',
        sortable: true,
        sortValue: (diet) => diet.targetKcal,
        align: 'right',
        headerClassName: 'w-24 text-right px-3',
        className: 'w-24 text-right font-bold text-text-primary tabular-nums py-2.5 px-3 text-style-legal',
        cell: (diet) => (
          <>
            {diet.targetKcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
          </>
        ),
      },
      {
        id: 'structure',
        header: 'Estrutura',
        align: 'right',
        headerClassName: 'w-32 text-right pr-6',
        className: 'w-32 text-right tabular-nums py-2.5 pr-6 text-style-legal',
        cell: (diet) => diet.mode === 'carb_cycling' ? (
          <>
            {diet.variationsCount || diet.fullPlan?.carbCyclingVariations?.length || 0}{' '}
            <span className="text-style-chart-micro text-text-muted font-normal">var.</span>
          </>
        ) : (
          <>
            {diet.mealsCount}{' '}
            <span className="text-style-chart-micro text-text-muted font-normal">
              {diet.mealsCount === 1 ? 'ref.' : 'refs.'}
            </span>
          </>
        ),
      },
    ],
    [expandedDietId, handleToggleExpanded]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl max-h-dialog flex flex-col p-6 gap-4">
        {/* Header no padrão de modais de seleção */}
        <DialogHeader className="border-b border-border-divider pb-3 shrink-0">
          <div className="flex items-center gap-2 text-text-primary">
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <History size={18} aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className={textStyle('dialog-title')}>
                Importar Dieta Anterior
              </DialogTitle>
              <DialogDescription className="text-style-legal text-text-muted mt-1">
                {patientName ? (
                  <span>
                    Histórico de dietas de <strong>{patientName}</strong>. Selecione uma dieta para importar metas ou duplicar refeições.
                  </span>
                ) : (
                  'Selecione uma dieta anterior do paciente para importar suas metas ou duplicar sua estrutura completa de refeições.'
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Barra de Busca com Atalho Ctrl+F */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="previous-diet-search-input" className="sr-only">
            Buscar por nome ou data da dieta
          </label>
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              id="previous-diet-search-input"
              type="search"
              placeholder="Buscar por nome da dieta ou data..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9 pr-20 text-style-field-value h-9"
              autoFocus
            />
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            {query && (
              <Button
                type="button"
                variant="quiet"
                size="compact"
                iconOnly
                onClick={() => setQuery('')}
                className="text-text-muted hover:text-text-primary p-1 rounded-compact transition-colors cursor-pointer absolute right-16 top-1/2 -translate-y-1/2 h-auto"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </Button>
            )}
            <Badge
              variant="neutral"
              title="Atalho Ctrl+F"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 border-border-divider bg-surface-subtle px-2 py-1 text-style-chart-micro text-text-muted"
            >
              Ctrl+F
            </Badge>
          </div>
        </div>

        {/* Tabela Padronizada DataTable */}
        <div className="my-2 flex-1 min-h-table-modal max-h-table-modal flex flex-col bg-surface overflow-hidden">
          <DataTable
            data={filteredDiets}
            columns={columns}
            getRowId={(diet) => diet.id}
            caption="Histórico de dietas anteriores para importação"
            emptyMessage={
              <span className="inline-flex flex-col items-center justify-center gap-2 py-8 text-center">
                <AlertCircle size={28} className="text-warning" aria-hidden="true" />
                <span className={textStyle('caption-strong')}>Nenhuma dieta anterior encontrada</span>
                <span className="text-style-caption text-text-secondary max-w-sm">
                  {query
                    ? `Nenhum resultado para "${query}". Tente buscar por outros termos.`
                    : 'Este paciente não possui histórico de dietas para importação.'}
                </span>
              </span>
            }
            sort={{
              state: sortState,
              onChange: setSortState,
            }}
            expandedRowId={expandedDietId}
            renderExpandedRow={(diet) =>
              diet.mode === 'carb_cycling' ? <PreviousDietCycleDetails diet={diet} /> : null
            }
            selection={{
              mode: 'single',
              selectedRowIds: selectedRowIds,
              onSelectionChange: (nextSet) => {
                const id = Array.from(nextSet)[0] ?? null;
                setSelectedId(id);
              },
              selectOnRowClick: true,
              selectAllAriaLabel: 'Alternar seleção de dieta',
              selectRowAriaLabel: (diet) => `Selecionar ${diet.name}`,
            }}
            stickyHeader
            maxHeight="table-modal"
            tableClassName="table-fixed w-full"
            className="flex-1 min-h-0"
          />
        </div>

        {/* Footer com Ações */}
        <DialogFooter className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 mt-1 shrink-0">
          <div className="flex items-center gap-2 text-style-legal text-text-secondary" aria-live="polite">
            {selectedDiet ? (
              <>
                <span>
                  1 dieta selecionada (<strong>{selectedDiet.name}</strong>)
                </span>
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-1 text-primary hover:underline h-auto p-0"
                  aria-label="Limpar seleção"
                >
                  <X size={13} aria-hidden="true" /> Limpar seleção
                </Button>
              </>
            ) : (
              'Nenhuma dieta selecionada'
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" variant="quiet" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="standard"
              disabled={!selectedDiet}
              onClick={handleMacrosClick}
              className="flex items-center gap-2"
              title={!selectedDiet ? 'Selecione uma dieta na tabela' : 'Importar apenas metas nutricionais'}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Puxar apenas os macros</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="standard"
              disabled={!selectedDiet}
              onClick={handleMealsClick}
              className="flex items-center gap-2"
              title={!selectedDiet ? 'Selecione uma dieta na tabela' : 'Duplicar todas as refeições para o novo plano'}
            >
              <Copy size={14} aria-hidden="true" />
              <span>Puxar todas as refeições</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
