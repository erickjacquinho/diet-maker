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
      <DialogContent className="max-w-2xl bg-warm-card border-warm-border p-6 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 border-b border-warm-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-xl bg-warm-emerald/10 text-warm-emerald">
                <Utensils size={20} />
              </div>
              <div>
                <DialogTitle className="font-black text-lg text-warm-charcoal tracking-tight">
                  {diet.name}
                </DialogTitle>
                <div className="flex items-center space-x-2 text-xs text-warm-muted mt-0.5 font-medium">
                  {patientName && <span>Paciente: <strong className="text-warm-charcoal font-bold">{patientName}</strong> •</span>}
                  <span>Prescrito em {diet.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-warm-inner text-warm-muted border-warm-border font-extrabold text-[10px] uppercase flex items-center space-x-1 px-2.5 py-1">
                <Lock size={10} className="mr-1" />
                Modo Somente Leitura
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-black uppercase">
                {diet.status}
              </Badge>
            </div>
          </div>

          {/* Macro Summary Header */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            <div className="p-2.5 bg-warm-inner/60 border border-warm-border/60 rounded-xl">
              <span className="text-[9px] font-extrabold text-warm-muted block uppercase tracking-wider">Calorias</span>
              <span className="font-black text-sm text-warm-charcoal">{displayKcal} kcal</span>
            </div>
            <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl">
              <span className="text-[9px] font-extrabold text-blue-600 block uppercase tracking-wider">Proteínas</span>
              <span className="font-black text-sm text-blue-600">{diet.proteinG}g</span>
            </div>
            <div className="p-2.5 bg-orange-50/50 border border-orange-100 rounded-xl">
              <span className="text-[9px] font-extrabold text-orange-500 block uppercase tracking-wider">Carboidratos</span>
              <span className="font-black text-sm text-orange-500">{diet.carbsG}g</span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <span className="text-[9px] font-extrabold text-emerald-700 block uppercase tracking-wider">Gorduras</span>
              <span className="font-black text-sm text-emerald-700">{diet.fatsG}g</span>
            </div>
          </div>
        </DialogHeader>

        {/* Refeições Lista */}
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-warm-muted uppercase tracking-wider flex items-center space-x-1.5">
              <Eye size={14} className="text-warm-emerald" />
              <span>Plano Alimentar Prescrito ({displayMeals.length} Refeições)</span>
            </h3>
          </div>

          {displayMeals.length === 0 ? (
            <div className="p-8 text-center bg-warm-inner border border-dashed border-warm-border rounded-xl space-y-2">
              <Utensils size={24} className="mx-auto text-warm-muted/50" />
              <p className="text-xs text-warm-muted font-medium">Nenhuma refeição cadastrada neste plano alimentar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayMeals.map((meal, idx) => {
                const mealKcal = calculatePresetCalories(meal.proteinG, meal.carbsG, meal.fatsG) || meal.kcal;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-warm-card border border-warm-border rounded-xl space-y-2 shadow-xs transition-colors hover:border-warm-emerald/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-warm-inner rounded-lg text-warm-charcoal">
                          <Clock size={13} />
                        </div>
                        <span className="font-black text-xs text-warm-charcoal">{meal.time}</span>
                        <span className="text-xs font-bold text-warm-charcoal">• {meal.name}</span>
                      </div>
                      <span className="text-xs font-black text-warm-emerald bg-warm-emerald/10 px-2 py-0.5 rounded-md">
                        {mealKcal} kcal
                      </span>
                    </div>

                    {meal.itemsSummary && (
                      <p className="text-xs text-warm-charcoal/90 leading-relaxed font-medium bg-warm-inner/40 p-2.5 rounded-lg border border-warm-border/40">
                        {meal.itemsSummary}
                      </p>
                    )}

                    <div className="flex items-center justify-end space-x-3 text-[11px] text-warm-muted pt-1">
                      <span>P: <strong className="text-blue-600 font-bold">{meal.proteinG}g</strong></span>
                      <span>C: <strong className="text-orange-500 font-bold">{meal.carbsG}g</strong></span>
                      <span>G: <strong className="text-emerald-700 font-bold">{meal.fatsG}g</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-warm-border pt-4 flex items-center justify-between">
          <SecondaryActionButton
            onClick={() => toast.info('Impressão/Exportação da dieta acionada')}
            icon={<Printer size={14} />}
          >
            Imprimir Plano Alimentar
          </SecondaryActionButton>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-warm-inner hover:bg-warm-border text-warm-charcoal rounded-xl text-xs font-bold transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
