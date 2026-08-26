'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { normalizeDateToISO } from '@/lib/date-only';
import {
  History,
  Search,
  Sparkles,
  Copy,
  Check,
  X,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { PreviousDietSummary } from '@/lib/dietDuplication';

export type DietSortField = 'name' | 'date' | 'mode' | 'protein' | 'carbs' | 'fats' | 'kcal' | 'meals';
export type DietSortDirection = 'asc' | 'desc';

export interface DietSortConfig {
  field: DietSortField;
  direction: DietSortDirection;
}

export interface ImportPreviousDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  diets: PreviousDietSummary[];
  onPullMacrosOnly: (selectedDiet: PreviousDietSummary) => void;
  onPullAllMeals: (selectedDiet: PreviousDietSummary) => void;
}

function sortDiets(diets: PreviousDietSummary[], config: DietSortConfig | null): PreviousDietSummary[] {
  if (!config) return diets;
  return [...diets].sort((left, right) => {
    let comparison = 0;
    switch (config.field) {
      case 'name':
        comparison = left.name.localeCompare(right.name, 'pt-BR');
        break;
      case 'date': {
        const keyA = normalizeDateToISO(left.date) || '';
        const keyB = normalizeDateToISO(right.date) || '';
        comparison = keyA.localeCompare(keyB);
        break;
      }
      case 'mode':
        comparison = left.modeLabel.localeCompare(right.modeLabel, 'pt-BR');
        break;
      case 'protein':
        comparison = left.proteinG - right.proteinG;
        break;
      case 'carbs':
        comparison = left.carbsG - right.carbsG;
        break;
      case 'fats':
        comparison = left.fatsG - right.fatsG;
        break;
      case 'kcal':
        comparison = left.targetKcal - right.targetKcal;
        break;
      case 'meals':
        comparison = left.mealsCount - right.mealsCount;
        break;
    }
    return config.direction === 'asc' ? comparison : -comparison;
  });
}

function SortHeaderButton({
  field,
  label,
  currentSort,
  onSort,
  align = 'left',
  className,
}: {
  field: DietSortField;
  label: string;
  currentSort?: DietSortConfig | null;
  onSort?: (field: DietSortField) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const isSorted = currentSort?.field === field;
  const direction = currentSort?.direction;

  return (
    <Button
      type="button"
      variant="quiet"
      size="compact"
      onClick={() => onSort?.(field)}
      className={cn(
        'group inline-flex items-center gap-1.5 font-bold text-style-chart-micro uppercase tracking-wider transition-colors select-none cursor-pointer py-1 h-auto px-1',
        align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start',
        isSorted ? 'text-text-primary font-black' : 'text-text-secondary hover:text-text-primary',
        className
      )}
      title={`Ordenar por ${label} (${isSorted ? (direction === 'desc' ? 'maior para menor' : 'menor para maior') : 'clique para ordenar'})`}
    >
      <span>{label}</span>
      {isSorted ? (
        direction === 'desc' ? (
          <ArrowDown size={12} strokeWidth={2.5} className="text-primary shrink-0" aria-label="Ordenado decrescente" />
        ) : (
          <ArrowUp size={12} strokeWidth={2.5} className="text-primary shrink-0" aria-label="Ordenado crescente" />
        )
      ) : (
        <ArrowUpDown
          size={12}
          className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0"
          aria-hidden="true"
        />
      )}
    </Button>
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
  const [sortConfig, setSortConfig] = useState<DietSortConfig | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedId(null);
      setSortConfig(null);
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
    const filtered = q
      ? diets.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.date.toLowerCase().includes(q) ||
            d.modeLabel.toLowerCase().includes(q)
        )
      : diets;

    return sortDiets(filtered, sortConfig);
  }, [diets, query, sortConfig]);

  const selectedDiet = diets.find((d) => d.id === selectedId) || null;

  const handleSort = (field: DietSortField) => {
    setSortConfig((current) =>
      current?.field === field
        ? { field, direction: current.direction === 'desc' ? 'asc' : 'desc' }
        : { field, direction: 'desc' }
    );
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header no padrão da modal de alimentos */}
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <History size={18} className="text-primary" />
            <span>Importar Dieta Anterior</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            {patientName ? (
              <span>
                Histórico de dietas de <strong>{patientName}</strong>. Selecione uma dieta para importar metas ou duplicar refeições.
              </span>
            ) : (
              'Selecione uma dieta anterior do paciente para importar suas metas ou duplicar sua estrutura completa de refeições.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Barra de Busca com Atalho Ctrl+F */}
        <div className="flex items-center gap-2 pt-3 shrink-0">
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
              className="pl-9 pr-20 text-style-field-value"
              autoFocus
            />
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <Badge
              variant="neutral"
              title="Atalho Ctrl+F"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 border-border-divider bg-surface-subtle px-2 py-0.5 text-style-chart-micro text-text-muted"
            >
              Ctrl+F
            </Badge>
          </div>
        </div>

        {/* Tabela com Cabeçalho Fixo e Corpo Rolável idêntica à UI de Adicionar Alimentos */}
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
          <div className="my-2 flex-1 min-h-[380px] max-h-[450px] flex flex-col rounded-control border border-border-divider bg-surface overflow-hidden">
            {/* 1. Header Fixo (fora da área de rolagem) */}
            <div className="bg-surface-subtle border-b border-border-divider shrink-0">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-surface-subtle">
                  <TableRow className="hover:bg-surface-subtle border-0">
                    {/* 1. Checkbox / Rádio da Linha */}
                    <TableHead className="w-10 px-3 text-center h-9 bg-surface-subtle">
                      <span className="sr-only">Seleção</span>
                    </TableHead>

                    {/* 2. Nome do Plano / Data */}
                    <TableHead className="text-left font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary h-9 bg-surface-subtle px-3">
                      <SortHeaderButton
                        field="name"
                        label="Plano Alimentar"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="left"
                      />
                    </TableHead>

                    {/* 3. Modo */}
                    <TableHead className="w-28 text-center font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary h-9 bg-surface-subtle px-3">
                      <SortHeaderButton
                        field="mode"
                        label="Modo"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="center"
                      />
                    </TableHead>

                    {/* 4. Proteína (P) */}
                    <TableHead className="w-20 sm:w-24 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-protein h-9 bg-surface-subtle px-3">
                      <SortHeaderButton
                        field="protein"
                        label="Proteína"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="right"
                        className="text-macro-protein hover:text-macro-protein"
                      />
                    </TableHead>

                    {/* 5. Carboidrato (C) */}
                    <TableHead className="w-20 sm:w-24 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-carbohydrate h-9 bg-surface-subtle px-3">
                      <SortHeaderButton
                        field="carbs"
                        label="Carboidrato"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="right"
                        className="text-macro-carbohydrate hover:text-macro-carbohydrate"
                      />
                    </TableHead>

                    {/* 6. Gorduras (G) */}
                    <TableHead className="w-20 sm:w-24 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-fat h-9 bg-surface-subtle px-3">
                      <SortHeaderButton
                        field="fats"
                        label="Gorduras"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="right"
                        className="text-macro-fat hover:text-macro-fat"
                      />
                    </TableHead>

                    {/* 7. Calorias (kcal) */}
                    <TableHead className="w-24 sm:w-28 text-right font-bold text-style-chart-micro uppercase tracking-wider text-text-primary h-9 bg-surface-subtle px-4">
                      <SortHeaderButton
                        field="kcal"
                        label="Calorias"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="right"
                      />
                    </TableHead>

                    {/* 8. Qtd Refeições */}
                    <TableHead className="w-20 sm:w-24 text-center font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary h-9 bg-surface-subtle px-3">
                      <SortHeaderButton
                        field="meals"
                        label="Refeições"
                        currentSort={sortConfig}
                        onSort={handleSort}
                        align="center"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* 2. Corpo Rolável (apenas as linhas rolam) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <Table className="table-fixed w-full" aria-label="Tabela de dietas anteriores">
                <TableBody>
                  {filteredDiets.map((diet) => {
                    const isSelected = diet.id === selectedId;
                    return (
                      <TableRow
                        key={diet.id}
                        data-state={isSelected ? 'selected' : undefined}
                        onClick={() => setSelectedId(diet.id)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setSelectedId(diet.id);
                          }
                        }}
                        tabIndex={0}
                        role="radio"
                        aria-checked={isSelected}
                        className={cn(
                          'cursor-pointer select-none transition-colors border-b border-border-divider hover:bg-surface-hover',
                          isSelected && 'bg-primary-soft/30 hover:bg-primary-soft/40'
                        )}
                      >
                        {/* 1. Checkbox / Rádio da Linha */}
                        <TableCell
                          className="w-10 px-3 py-2 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(diet.id);
                          }}
                        >
                          <Button
                            type="button"
                            variant="quiet"
                            size="compact"
                            iconOnly
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`Selecionar ${diet.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(diet.id);
                            }}
                            className={cn(
                              'size-4 rounded-compact border flex items-center justify-center transition-colors duration-fast mx-auto p-0 h-4 min-w-4',
                              isSelected
                                ? 'bg-primary border-primary text-on-primary'
                                : 'border-border-subtle bg-surface hover:border-border-hover'
                            )}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </Button>
                        </TableCell>

                        {/* 2. Nome + Data */}
                        <TableCell className="text-left py-2 px-3 font-bold text-style-legal text-text-primary min-w-[160px]">
                          <div className="flex flex-col min-w-0">
                            <span className="truncate block font-bold text-text-primary" title={diet.name}>
                              {diet.name}
                            </span>
                            <span className="text-style-chart-micro text-text-muted font-normal truncate">
                              {diet.date || 'Sem data'}
                            </span>
                          </div>
                        </TableCell>

                        {/* 3. Modo */}
                        <TableCell className="w-28 text-center py-2 px-3">
                          <Badge
                            variant={diet.mode === 'carb_cycling' ? 'primary' : 'neutral'}
                            className="text-[11px] whitespace-nowrap"
                          >
                            {diet.modeLabel}
                          </Badge>
                        </TableCell>

                        {/* 4. Proteína */}
                        <TableCell className="w-20 sm:w-24 text-right font-bold text-macro-protein tabular-nums py-2.5 px-3 text-style-legal">
                          {diet.proteinG}g
                        </TableCell>

                        {/* 5. Carboidrato */}
                        <TableCell className="w-20 sm:w-24 text-right font-bold text-macro-carbohydrate tabular-nums py-2.5 px-3 text-style-legal">
                          {diet.carbsG}g
                        </TableCell>

                        {/* 6. Gorduras */}
                        <TableCell className="w-20 sm:w-24 text-right font-bold text-macro-fat tabular-nums py-2.5 px-3 text-style-legal">
                          {diet.fatsG}g
                        </TableCell>

                        {/* 7. Calorias */}
                        <TableCell className="w-24 sm:w-28 text-right font-bold text-text-primary tabular-nums py-2.5 px-4 text-style-legal">
                          {diet.targetKcal} kcal
                        </TableCell>

                        {/* 8. Refeições */}
                        <TableCell className="w-20 sm:w-24 text-center text-text-secondary tabular-nums py-2.5 px-3 text-style-legal">
                          {diet.mealsCount} {diet.mealsCount === 1 ? 'ref.' : 'refs.'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Footer com Ações idêntico ao FoodSearchModal */}
        <div className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 shrink-0">
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

          <div className="flex items-center gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
