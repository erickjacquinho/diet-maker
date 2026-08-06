'use client';

import React from 'react';
import { HistoricalDiet } from '@/lib/patientsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SecondaryActionButton } from '@/components/atoms';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col gap-3 border-b border-border-subtle pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-control bg-success-soft text-success">
                <Utensils size={20} />
              </div>
              <div>
                <DialogTitle className="font-bold text-style-body-large text-text-primary tracking-tight">
                  {diet.name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-style-legal text-text-muted mt-0.5 font-medium">
                  {patientName && <span>Paciente: <strong className="text-text-primary font-bold">{patientName}</strong> •</span>}
                  <span>Prescrito em {diet.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-surface-subtle text-text-muted border-border-subtle font-bold text-style-legal tracking-label flex items-center gap-1 px-2.5 py-1">
                <Lock size={10} className="mr-1" />
                Modo Somente Leitura
              </Badge>
              <Badge variant="secondary" className="text-style-legal font-bold tracking-label">
                {diet.status}
              </Badge>
            </div>
          </div>

          {/* Macro Summary Header */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
          <div className="p-2.5 bg-surface-subtle border border-border-subtle rounded-control">
              <span className="text-style-chart-micro font-bold text-text-muted block tracking-overline">Calorias</span>
              <span className="font-bold text-style-body-small text-text-primary">{displayKcal} kcal</span>
            </div>
          <div className="p-2.5 bg-primary-soft border border-primary-border rounded-control">
              <span className="text-style-chart-micro font-bold text-macro-protein block tracking-overline">Proteínas</span>
              <span className="font-bold text-style-body-small text-macro-protein">{diet.proteinG}g</span>
            </div>
          <div className="p-2.5 bg-warning-soft border border-warning-border rounded-control">
              <span className="text-style-chart-micro font-bold text-warning block tracking-overline">Carboidratos</span>
              <span className="font-bold text-style-body-small text-warning">{diet.carbsG}g</span>
            </div>
          <div className="p-2.5 bg-success-soft border border-success-border rounded-control">
              <span className="text-style-chart-micro font-bold text-success block tracking-overline">Gorduras</span>
              <span className="font-bold text-style-body-small text-success">{diet.fatsG}g</span>
            </div>
          </div>
        </DialogHeader>

        {/* Refeições Lista */}
        <div className="py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-style-legal text-text-muted tracking-overline flex items-center gap-1.5">
              <Eye size={14} className="text-success" />
              <span>Plano Alimentar Prescrito ({displayMeals.length} Refeições)</span>
            </h3>
          </div>

          {displayMeals.length === 0 ? (
            <div className="p-8 text-center bg-surface-subtle border border-dashed border-border-subtle rounded-control flex flex-col gap-2">
            <Utensils size={24} className="mx-auto text-text-muted opacity-subdued" />
              <p className="text-style-legal text-text-muted font-medium">Nenhuma refeição cadastrada neste plano alimentar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayMeals.map((meal, idx) => {
                const mealKcal = calculatePresetCalories(meal.proteinG, meal.carbsG, meal.fatsG) || meal.kcal;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-surface border border-border-subtle rounded-control flex flex-col gap-2 shadow-floating transition-colors hover:border-success/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-surface-subtle rounded-surface text-text-primary">
                          <Clock size={13} />
                        </div>
                        <span className="font-bold text-style-legal text-text-primary">{meal.time}</span>
                        <span className="text-style-legal font-bold text-text-primary">• {meal.name}</span>
                      </div>
                  <span className="text-style-legal font-bold text-success bg-success-soft px-2 py-0.5 rounded-control">
                        {mealKcal} kcal
                      </span>
                    </div>

                    {meal.itemsSummary && (
              <p className="text-style-legal text-text-primary font-medium bg-surface-subtle p-2.5 rounded-surface border border-border-subtle">
                        {meal.itemsSummary}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-3 text-style-legal text-text-muted pt-1">
                      <span>P: <strong className="text-macro-protein font-bold">{meal.proteinG}g</strong></span>
                      <span>C: <strong className="text-warning font-bold">{meal.carbsG}g</strong></span>
                      <span>G: <strong className="text-success font-bold">{meal.fatsG}g</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
          <SecondaryActionButton
            onClick={() => toast.info('Impressão/Exportação da dieta acionada')}
            icon={<Printer size={14} />}
          >
            Imprimir Plano Alimentar
          </SecondaryActionButton>

          <Button
            onClick={onClose}
            className="px-4 py-2 bg-surface-subtle hover:bg-surface-hover text-text-primary rounded-control text-style-legal font-bold transition-colors"
          >
            Fechar Visualização
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
