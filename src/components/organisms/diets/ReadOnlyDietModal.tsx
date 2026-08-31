'use client';

import React from 'react';
import { Clock, Lock, Utensils } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Badge } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { DietPlan } from '@/lib/domain/diets/diet-model';

export interface ReadOnlyDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  diet: DietPlan | null;
  patientName?: string;
}

export function ReadOnlyDietModal({ isOpen, onClose, diet, patientName }: ReadOnlyDietModalProps) {
  if (!diet) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-dialog flex flex-col gap-4 p-6">
        <DialogHeader className="flex shrink-0 flex-col gap-2 border-b border-border-divider pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Utensils className="text-primary" aria-hidden="true" />
              <div>
                <DialogTitle className={textStyle('dialog-title')}>{diet.name}</DialogTitle>
                <DialogDescription>{patientName ? `Paciente: ${patientName} · ` : ''}Prescrição congelada para consulta</DialogDescription>
              </div>
            </div>
            <Badge variant="neutral" className="flex items-center gap-1"><Lock size={14} aria-hidden="true" /> Somente leitura</Badge>
          </div>
        </DialogHeader>

        <div
          role="region"
          aria-label="Conteúdo da prescrição"
          className="min-h-0 flex-1 overflow-y-auto pr-1"
        >
          <div className="flex flex-col gap-4">
          {diet.variations.map((variation) => (
            <section key={variation.id} aria-label={`Variação ${variation.name}`} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className={textStyle('subsection-title')}>{variation.name}</h2>
                <span className={textStyle('metadata')}>{variation.targets.energyKcal} kcal de meta</span>
              </div>
              {variation.meals.map((meal) => (
                <article key={meal.id} className="flex flex-col gap-3 rounded-control border border-border-subtle bg-surface p-4">
                  <div className="flex items-center gap-2"><Clock size={14} aria-hidden="true" /><h3 className={textStyle('body-strong')}>{meal.name}</h3>{meal.time && <span className={textStyle('metadata')}>{meal.time}</span>}</div>
                  {meal.options.map((option) => (
                    <div key={option.id} className="flex flex-col gap-2 border-l-2 border-primary-soft pl-3">
                      <span className={textStyle('caption-strong')}>{option.label}</span>
                      {option.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-style-body-small"><span className="text-style-body-small">{item.name}</span><span className="text-style-body-small text-text-secondary tabular-nums">{item.snapshot.prescribedQuantity}{item.snapshot.prescribedUnit} · {item.snapshot.prescribedNutrients.energyKcal ?? '—'} kcal</span></div>)}
                    </div>
                  ))}
                </article>
              ))}
            </section>
          ))}
          </div>
        </div>
        <DialogFooter className="shrink-0 border-t border-border-divider pt-4"><Button onClick={onClose} variant="secondary" size="compact">Fechar Visualização</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
