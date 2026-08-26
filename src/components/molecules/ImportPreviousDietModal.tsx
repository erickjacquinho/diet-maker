'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { textStyle } from '@/design-system';
import { History, Search, Sparkles, Copy, X, AlertCircle } from 'lucide-react';
import type { PreviousDietSummary } from '@/lib/dietDuplication';

export interface ImportPreviousDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  diets: PreviousDietSummary[];
  onPullMacrosOnly: (selectedDiet: PreviousDietSummary) => void;
  onPullAllMeals: (selectedDiet: PreviousDietSummary) => void;
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
  const [sortState, setSortState] = useState<DataTableSortState | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedId(null);
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
    setQuery('');
    onClose();
  };

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
        headerClassName: 'text-left min-w-[180px] px-3',
        className: 'text-left py-2 px-3 font-bold text-style-legal text-text-primary min-w-[180px]',
        cell: (diet) => (
          <div className="flex flex-col min-w-0">
            <span className="truncate block font-bold text-text-primary" title={diet.name}>
              {diet.name}
            </span>
            <span className="text-style-chart-micro text-text-muted font-normal truncate">
              {diet.date || 'Sem data'}
            </span>
          </div>
        ),
      },
      {
        id: 'mode',
        header: 'Modo',
        sortable: true,
        sortValue: (diet) => diet.modeLabel,
        align: 'center',
        headerClassName: 'w-28 text-center px-3',
        className: 'w-28 text-center py-2 px-3',
        cell: (diet) => (
          <Badge
            variant={diet.mode === 'carb_cycling' ? 'primary' : 'neutral'}
            className="text-[11px] whitespace-nowrap"
          >
            {diet.modeLabel}
          </Badge>
        ),
      },
      {
        id: 'protein',
        header: 'Proteína',
        sortable: true,
        sortValue: (diet) => diet.proteinG,
        align: 'right',
        headerClassName: 'w-20 sm:w-24 text-right px-3 text-macro-protein',
        className: 'w-20 sm:w-24 text-right font-bold text-macro-protein tabular-nums py-2.5 px-3 text-style-legal',
        cell: (diet) => `${diet.proteinG}g`,
      },
      {
        id: 'carbs',
        header: 'Carboidrato',
        sortable: true,
        sortValue: (diet) => diet.carbsG,
        align: 'right',
        headerClassName: 'w-20 sm:w-24 text-right px-3 text-macro-carbohydrate',
        className: 'w-20 sm:w-24 text-right font-bold text-macro-carbohydrate tabular-nums py-2.5 px-3 text-style-legal',
        cell: (diet) => `${diet.carbsG}g`,
      },
      {
        id: 'fats',
        header: 'Gorduras',
        sortable: true,
        sortValue: (diet) => diet.fatsG,
        align: 'right',
        headerClassName: 'w-20 sm:w-24 text-right px-3 text-macro-fat',
        className: 'w-20 sm:w-24 text-right font-bold text-macro-fat tabular-nums py-2.5 px-3 text-style-legal',
        cell: (diet) => `${diet.fatsG}g`,
      },
      {
        id: 'kcal',
        header: 'Calorias',
        sortable: true,
        sortValue: (diet) => diet.targetKcal,
        align: 'right',
        headerClassName: 'w-24 sm:w-28 text-right px-4',
        className: 'w-24 sm:w-28 text-right font-bold text-text-primary tabular-nums py-2.5 px-4 text-style-legal',
        cell: (diet) => `${diet.targetKcal} kcal`,
      },
      {
        id: 'meals',
        header: 'Refeições',
        sortable: true,
        sortValue: (diet) => diet.mealsCount,
        align: 'center',
        headerClassName: 'w-20 sm:w-24 text-center px-3',
        className: 'w-20 sm:w-24 text-center text-text-secondary tabular-nums py-2.5 px-3 text-style-legal',
        cell: (diet) => `${diet.mealsCount} ${diet.mealsCount === 1 ? 'ref.' : 'refs.'}`,
      },
    ],
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 gap-4">
        {/* Header no padrão de modais de seleção */}
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <div className="flex items-center gap-2 text-text-primary">
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <History size={18} aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className={textStyle('dialog-title')}>
                Importar Dieta Anterior
              </DialogTitle>
              <DialogDescription className="text-style-legal text-text-muted mt-0.5">
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
                className="text-text-muted hover:text-text-primary p-0.5 rounded-compact transition-colors cursor-pointer absolute right-16 top-1/2 -translate-y-1/2 h-auto"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </Button>
            )}
            <Badge
              variant="neutral"
              title="Atalho Ctrl+F"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 border-border-divider bg-surface-subtle px-2 py-0.5 text-style-chart-micro text-text-muted font-mono"
            >
              Ctrl+F
            </Badge>
          </div>
        </div>

        {/* Tabela Padronizada DataTable */}
        {filteredDiets.length === 0 ? (
          <div className="flex-1 min-h-[380px] max-h-[450px] flex flex-col items-center justify-center p-8 text-center text-text-muted gap-2 border border-dashed border-border-divider rounded-control my-2 bg-surface-subtle">
            <AlertCircle size={28} className="text-warning" aria-hidden="true" />
            <span className="font-semibold text-text-secondary">
              Nenhuma dieta anterior encontrada
            </span>
            <span className="text-style-caption max-w-sm">
              {query
                ? `Nenhum resultado para "${query}". Tente buscar por outros termos.`
                : 'Este paciente não possui histórico de dietas para importação.'}
            </span>
          </div>
        ) : (
          <div className="my-2 flex-1 min-h-[380px] max-h-[450px] flex flex-col">
            <DataTable
              data={filteredDiets}
              columns={columns}
              getRowId={(diet) => diet.id}
              caption="Histórico de dietas anteriores para importação"
              emptyMessage="Nenhuma dieta anterior encontrada."
              sort={{
                state: sortState,
                onChange: setSortState,
              }}
              selection={{
                mode: 'single',
                selectedRowIds: selectedRowIds,
                onSelectionChange: (nextSet) => {
                  const id = Array.from(nextSet)[0] ?? null;
                  setSelectedId(id);
                },
                selectOnRowClick: true,
                selectRowAriaLabel: (diet) => `Selecionar ${diet.name}`,
              }}
              stickyHeader
              maxHeight="450px"
              tableClassName="table-fixed w-full"
              className="flex-1 min-h-0"
            />
          </div>
        )}

        {/* Footer com Ações */}
        <DialogFooter className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 mt-1 sm:justify-between shrink-0">
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
              className="flex items-center gap-1.5"
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
              className="flex items-center gap-1.5"
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
