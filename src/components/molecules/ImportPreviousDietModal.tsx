'use client';

import React, { useState, useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, Checkbox } from '@/components/atoms';
import { MacroSummary } from './MacroSummary';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { History, Calendar, Utensils, Sparkles, Copy, AlertCircle } from 'lucide-react';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tableId = useId();

  const selectedDiet = diets.find((d) => d.id === selectedId) || null;

  const handleClose = () => {
    setSelectedId(null);
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
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 gap-4">
        <DialogHeader className="border-b border-border-divider pb-3">
          <div className="flex items-center gap-2 text-text-primary">
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <History size={18} aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className={textStyle('dialog-title')}>
                Importar Dieta Anterior
              </DialogTitle>
              <DialogDescription className={cn(textStyle('caption'), 'text-text-secondary mt-0.5')}>
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

        {/* Tabela de Seleção */}
        <div className="flex-1 overflow-y-auto border border-border-divider rounded-control">
          {diets.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2 text-text-muted">
              <AlertCircle size={28} className="text-warning" aria-hidden="true" />
              <p className={textStyle('body-strong')}>Nenhuma dieta anterior encontrada</p>
              <p className={textStyle('caption')}>Este paciente não possui histórico de dietas para importação.</p>
            </div>
          ) : (
            <Table id={tableId} aria-label="Tabela de dietas anteriores">
              <TableHeader>
                <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
                  <TableHead className="w-10 px-3 text-center h-9 bg-surface-subtle" aria-label="Seleção" />
                  <TableHead className="px-3 py-2.5 min-w-[110px]">Data</TableHead>
                  <TableHead className="px-3 py-2.5 min-w-[180px]">Plano Alimentar</TableHead>
                  <TableHead className="px-3 py-2.5 text-center min-w-[100px]">Modo</TableHead>
                  <TableHead className="px-3 py-2.5 min-w-[170px]">Macronutrientes</TableHead>
                  <TableHead className="px-3 py-2.5 text-center min-w-[90px]">Calorias</TableHead>
                  <TableHead className="px-3 py-2.5 text-center min-w-[90px]">Refeições</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diets.map((diet) => {
                  const isSelected = diet.id === selectedId;
                  return (
                    <TableRow
                      key={diet.id}
                      data-state={isSelected ? 'selected' : undefined}
                      onClick={() => setSelectedId(isSelected ? null : diet.id)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setSelectedId(isSelected ? null : diet.id);
                        }
                      }}
                      tabIndex={0}
                      aria-selected={isSelected}
                      className={cn(
                        'cursor-pointer select-none transition-colors focus:outline-none focus:bg-primary-soft/40',
                        isSelected
                          ? 'border-l-4 border-l-primary bg-primary-soft/40 hover:bg-primary-soft/60'
                          : 'hover:bg-surface-hover'
                      )}
                    >
                      {/* Seleção */}
                      <TableCell
                        className="w-10 px-3 py-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(isSelected ? null : diet.id);
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => setSelectedId(isSelected ? null : diet.id)}
                            aria-label={`Selecionar dieta ${diet.name}`}
                          />
                        </div>
                      </TableCell>

                      {/* Data */}
                      <TableCell className="whitespace-nowrap px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="shrink-0 text-text-muted" aria-hidden="true" />
                          <span className={textStyle('table-cell-strong')}>{diet.date || '—'}</span>
                        </div>
                      </TableCell>

                      {/* Nome do Plano */}
                      <TableCell className="px-3 py-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Utensils size={13} className="shrink-0 text-primary" aria-hidden="true" />
                          <span className={cn('font-semibold text-text-primary truncate', textStyle('body-strong'))}>
                            {diet.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Modo */}
                      <TableCell className="text-center px-3 py-3">
                        <Badge variant={diet.mode === 'carb_cycling' ? 'primary' : 'neutral'} className="text-[11px] whitespace-nowrap">
                          {diet.modeLabel}
                        </Badge>
                      </TableCell>

                      {/* Macros */}
                      <TableCell className="px-3 py-3">
                        <MacroSummary
                          protein={diet.proteinG}
                          carbs={diet.carbsG}
                          fats={diet.fatsG}
                          showKcal={false}
                          className={textStyle('table-number')}
                        />
                      </TableCell>

                      {/* Calorias */}
                      <TableCell className="text-center whitespace-nowrap px-3 py-3">
                        <span className={cn('font-bold text-text-primary', textStyle('table-number'))}>
                          {diet.targetKcal} kcal
                        </span>
                      </TableCell>

                      {/* Qtd Refeições */}
                      <TableCell className="text-center whitespace-nowrap px-3 py-3 text-text-secondary">
                        <span className={textStyle('caption')}>
                          {diet.mealsCount} {diet.mealsCount === 1 ? 'refeição' : 'refeições'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer com Ações */}
        <DialogFooter className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 mt-1 sm:justify-between">
          <Button type="button" variant="quiet" onClick={handleClose}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
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
