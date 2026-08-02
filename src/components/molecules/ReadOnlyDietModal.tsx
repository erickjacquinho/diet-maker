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
      <DialogContent className="max-w-2xl bg-surface border-border-subtle p-6 shadow-overlay rounded-surface max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 border-b border-border-subtle pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-control bg-success/10 text-success">
                <Utensils size={20} />
              </div>
              <div>
                <DialogTitle className="font-bold text-lg text-text-primary tracking-tight">
                  {diet.name}
                </DialogTitle>
                <div className="flex items-center space-x-2 text-xs text-text-muted mt-0.5 font-medium">
                  {patientName && <span>Paciente: <strong className="text-text-primary font-bold">{patientName}</strong> •</span>}
                  <span>Prescrito em {diet.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-surface-subtle text-text-muted border-border-subtle font-bold text-style-legal uppercase flex items-center space-x-1 px-2.5 py-1">
                <Lock size={10} className="mr-1" />
                Modo Somente Leitura
              </Badge>
              <Badge variant="secondary" className="text-style-legal font-bold uppercase">
                {diet.status}
              </Badge>
            </div>
          </div>

          {/* Macro Summary Header */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            <div className="p-2.5 bg-surface-subtle/60 border border-border-subtle/60 rounded-control">
              <span className="text-style-chart-micro font-bold text-text-muted block uppercase tracking-wider">Calorias</span>
              <span className="font-bold text-sm text-text-primary">{displayKcal} kcal</span>
            </div>
            <div className="p-2.5 bg-primary-soft/50 border border-primary-border rounded-control">
              <span className="text-style-chart-micro font-bold text-macro-protein block uppercase tracking-wider">Proteínas</span>
              <span className="font-bold text-sm text-macro-protein">{diet.proteinG}g</span>
            </div>
            <div className="p-2.5 bg-orange-50/50 border border-orange-100 rounded-control">
              <span className="text-style-chart-micro font-bold text-orange-500 block uppercase tracking-wider">Carboidratos</span>
              <span className="font-bold text-sm text-orange-500">{diet.carbsG}g</span>
            </div>
            <div className="p-2.5 bg-success-soft/50 border border-success-border rounded-control">
              <span className="text-style-chart-micro font-bold text-success block uppercase tracking-wider">Gorduras</span>
              <span className="font-bold text-sm text-success">{diet.fatsG}g</span>
            </div>
          </div>
        </DialogHeader>

        {/* Refeições Lista */}
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
              <Eye size={14} className="text-success" />
              <span>Plano Alimentar Prescrito ({displayMeals.length} Refeições)</span>
            </h3>
          </div>

          {displayMeals.length === 0 ? (
            <div className="p-8 text-center bg-surface-subtle border border-dashed border-border-subtle rounded-control space-y-2">
              <Utensils size={24} className="mx-auto text-text-muted/50" />
              <p className="text-xs text-text-muted font-medium">Nenhuma refeição cadastrada neste plano alimentar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayMeals.map((meal, idx) => {
                const mealKcal = calculatePresetCalories(meal.proteinG, meal.carbsG, meal.fatsG) || meal.kcal;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-surface border border-border-subtle rounded-control space-y-2 shadow-floating transition-colors hover:border-success/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-surface-subtle rounded-lg text-text-primary">
                          <Clock size={13} />
                        </div>
                        <span className="font-bold text-xs text-text-primary">{meal.time}</span>
                        <span className="text-xs font-bold text-text-primary">• {meal.name}</span>
                      </div>
                      <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-md">
                        {mealKcal} kcal
                      </span>
                    </div>

                    {meal.itemsSummary && (
                      <p className="text-xs text-text-primary/90 leading-relaxed font-medium bg-surface-subtle/40 p-2.5 rounded-lg border border-border-subtle/40">
                        {meal.itemsSummary}
                      </p>
                    )}

                    <div className="flex items-center justify-end space-x-3 text-style-legal text-text-muted pt-1">
                      <span>P: <strong className="text-macro-protein font-bold">{meal.proteinG}g</strong></span>
                      <span>C: <strong className="text-orange-500 font-bold">{meal.carbsG}g</strong></span>
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
            className="px-4 py-2 bg-surface-subtle hover:bg-border-subtle text-text-primary rounded-control text-xs font-bold transition-colors"
          >
            Fechar Visualização
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
