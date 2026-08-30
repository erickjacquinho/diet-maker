'use client';

import React from 'react';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { HistoricalDiet } from '@/lib/patientsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, SecondaryActionButton } from '@/components/atoms';
import { Card } from '@/components/ui/card';
import { MacroSummary } from './MacroSummary';
import { MetricBox } from './MetricBox';
import { MacroProportionBar } from './MacroProportionBar';
import { Utensils, Clock, Printer, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { calculatePresetCalories } from '@/lib/presetUtils';

export interface ReadOnlyDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  diet: HistoricalDiet | null;
  patientName?: string;
}

export const ReadOnlyDietModal: React.FC<ReadOnlyDietModalProps> = ({
  isOpen,
  onClose,
  diet,
  patientName,
}) => {
  if (!diet) return null;

  const displayKcal = calculatePresetCalories(diet.proteinG, diet.carbsG, diet.fatsG) || diet.targetKcal || 0;
  const displayMeals = diet.meals || [];
  const isActive = diet.status === 'Ativa';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-dialog overflow-y-auto p-6 flex flex-col gap-5">
        <DialogHeader className="pr-0 flex flex-col gap-4 border-b border-border-divider pb-4">
          <div className="flex items-start gap-3 min-w-0 pr-10">
            <div className="p-2.5 rounded-control bg-primary-soft text-primary shrink-0 mt-0.5">
              <Utensils size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DialogTitle className={textStyle('dialog-title')}>
                  {diet.name}
                </DialogTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="neutral" className="flex items-center gap-1 whitespace-nowrap">
                    <Lock size={10} className="mr-0.5" aria-hidden="true" />
                    <span>Somente Leitura</span>
                  </Badge>
                  <Badge variant={isActive ? 'primary' : 'neutral'} className="whitespace-nowrap">
                    {isActive ? 'Plano Ativo' : diet.status}
                  </Badge>
                </div>
              </div>
              <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-text-secondary', textStyle('caption'))}>
                {patientName && (
                  <span className="whitespace-nowrap">
                    Paciente: <strong className={textStyle('caption-strong')}>{patientName}</strong>
                  </span>
                )}
                {patientName && diet.date && (
                  <span className="text-text-muted select-none" aria-hidden="true">
                    •
                  </span>
                )}
                {diet.date && <span className="whitespace-nowrap">{diet.date}</span>}
              </div>
            </div>
          </div>

          {/* Macro Summary Header with divider */}
          <Card className="p-0 grid grid-cols-4 divide-x divide-border-divider overflow-hidden rounded-control border-border-divider bg-surface">
            <MetricBox
              size="standard"
              tone="muted"
              label="Calorias"
              value={`${displayKcal} kcal`}
              layout="stack"
              surface="inline"
              className="min-w-0 px-3 py-3"
            />
            <MetricBox
              size="standard"
              tone="protein"
              label="Proteínas"
              value={`${diet.proteinG}g`}
              layout="stack"
              surface="inline"
              className="min-w-0 px-3 py-3"
            />
            <MetricBox
              size="standard"
              tone="carbohydrate"
              label="Carboidratos"
              value={`${diet.carbsG}g`}
              layout="stack"
              surface="inline"
              className="min-w-0 px-3 py-3"
            />
            <MetricBox
              size="standard"
              tone="fat"
              label="Gorduras"
              value={`${diet.fatsG}g`}
              layout="stack"
              surface="inline"
              className="min-w-0 px-3 py-3"
            />
          </Card>
        </DialogHeader>

        {/* Refeições Lista */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={cn('flex items-center gap-2 text-text-primary', textStyle('subsection-title'))}>
              <Eye size={15} className="text-primary shrink-0" aria-hidden="true" />
              <span>Plano Alimentar Prescrito ({displayMeals.length} Refeições)</span>
            </h3>
          </div>

          {displayMeals.length === 0 ? (
            <div className="p-8 text-center bg-surface-subtle border border-dashed border-border-subtle rounded-control flex flex-col gap-2">
              <Utensils size={24} className="mx-auto text-text-muted opacity-subdued" aria-hidden="true" />
              <p className={textStyle('body-secondary')}>Nenhuma refeição cadastrada neste plano alimentar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayMeals.map((meal, idx) => {
                const mealKcal = calculatePresetCalories(meal.proteinG, meal.carbsG, meal.fatsG) || meal.kcal;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-surface border border-border-subtle rounded-control flex flex-col gap-3 transition-colors hover:border-border-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-surface-subtle rounded-control text-text-muted shrink-0">
                          <Clock size={13} aria-hidden="true" />
                        </div>
                        <span className={textStyle('body-strong')}>{meal.time}</span>
                        <span className={textStyle('body-strong')}>• {meal.name}</span>
                      </div>
                      <span className={cn('font-semibold text-text-muted bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-control', textStyle('caption'))}>
                        {mealKcal} kcal
                      </span>
                    </div>

                    {meal.itemsSummary && (
                      <p className={cn('bg-surface-subtle p-3 rounded-control border border-border-subtle leading-relaxed text-text-primary', textStyle('body-small'))}>
                        {meal.itemsSummary}
                      </p>
                    )}

                    <MacroProportionBar
                      proteinG={meal.proteinG}
                      carbsG={meal.carbsG}
                      fatsG={meal.fatsG}
                      kcal={mealKcal}
                      size="compact"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-divider pt-4 flex items-center justify-between gap-3">
          <SecondaryActionButton
            onClick={() => toast.info('Impressão/Exportação da dieta acionada')}
            icon={<Printer size={14} aria-hidden="true" />}
          >
            Imprimir Plano Alimentar
          </SecondaryActionButton>

          <Button
            onClick={onClose}
            variant="secondary"
            size="compact"
          >
            Fechar Visualização
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
