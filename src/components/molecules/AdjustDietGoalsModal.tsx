'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/atoms/SelectField';
import { Edit3 } from 'lucide-react';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';

interface AdjustDietGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempTargetProt: number;
  setTempTargetProt: (val: number) => void;
  tempTargetCarb: number;
  setTempTargetCarb: (val: number) => void;
  tempTargetFat: number;
  setTempTargetFat: (val: number) => void;
  patientWeightKg?: number;
  variationName?: string;
  onVariationNameChange?: (name: string) => void;
  onSave: () => void;
}

export function AdjustDietGoalsModal({
  isOpen,
  onClose,
  tempTargetProt,
  setTempTargetProt,
  tempTargetCarb,
  setTempTargetCarb,
  tempTargetFat,
  setTempTargetFat,
  patientWeightKg = 70,
  variationName,
  onVariationNameChange,
  onSave,
}: AdjustDietGoalsModalProps) {
  const weight = patientWeightKg > 0 ? patientWeightKg : 70;
  const [unitMode, setUnitMode] = useState<'grams' | 'g_per_kg'>('grams');

  const [protGKg, setProtGKg] = useState<number>(Number((tempTargetProt / weight).toFixed(1)));
  const [carbGKg, setCarbGKg] = useState<number>(Number((tempTargetCarb / weight).toFixed(1)));
  const [fatGKg, setFatGKg] = useState<number>(Number((tempTargetFat / weight).toFixed(1)));

  useEffect(() => {
    if (isOpen) {
      setProtGKg(Number((tempTargetProt / weight).toFixed(1)));
      setCarbGKg(Number((tempTargetCarb / weight).toFixed(1)));
      setFatGKg(Number((tempTargetFat / weight).toFixed(1)));
    }
  }, [isOpen, tempTargetProt, tempTargetCarb, tempTargetFat, weight]);

  const handleGPerKgChange = (type: 'prot' | 'carb' | 'fat', val: number) => {
    const safeVal = Math.max(0, val);
    if (type === 'prot') {
      setProtGKg(safeVal);
      setTempTargetProt(Math.round(safeVal * weight));
    } else if (type === 'carb') {
      setCarbGKg(safeVal);
      setTempTargetCarb(Math.round(safeVal * weight));
    } else {
      setFatGKg(safeVal);
      setTempTargetFat(Math.round(safeVal * weight));
    }
  };

  const handleGramsChange = (type: 'prot' | 'carb' | 'fat', val: number) => {
    const safeVal = Math.max(0, val);
    if (type === 'prot') {
      setTempTargetProt(safeVal);
      setProtGKg(Number((safeVal / weight).toFixed(1)));
    } else if (type === 'carb') {
      setTempTargetCarb(safeVal);
      setCarbGKg(Number((safeVal / weight).toFixed(1)));
    } else {
      setTempTargetFat(safeVal);
      setFatGKg(Number((safeVal / weight).toFixed(1)));
    }
  };

  const calcKcal = calculatePresetCalories(tempTargetProt, tempTargetCarb, tempTargetFat);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-surface">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-text-primary">
              <Edit3 className="w-5 h-5 text-success" />
              Ajustar Metas Nutricionais
            </DialogTitle>
            <div className="w-36">
              <SelectField
                id="adjust-unit-mode"
                value={unitMode}
                onValueChange={(val) => setUnitMode(val as 'grams' | 'g_per_kg')}
                options={[
                  { value: 'grams', label: 'Gramas (g)' },
                  { value: 'g_per_kg', label: 'g/kg corporal' },
                ]}
                size="compact"
                aria-label="Modo de entrada"
              />
            </div>
          </div>
          <DialogDescription>
            Defina os alvos em {unitMode === 'grams' ? 'gramas (g)' : `gramas por quilo (g/kg para ${weight}kg)`}. As calorias são calculadas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex flex-col gap-4">
          {variationName !== undefined && onVariationNameChange && (
            <div>
              <label className={cn(textStyle('field-label'), 'mb-1 block')}>Nome da Variação / Dia</label>
              <Input
                type="text"
                value={variationName}
                onChange={(e) => onVariationNameChange(e.target.value)}
                placeholder="Ex: Dia de Treino Pesado"
                className="bg-surface font-medium"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={cn(textStyle('field-label'), 'text-macro-protein mb-1 block')}>
                Proteína {unitMode === 'grams' ? '(g)' : '(g/kg)'}
              </label>
              <Input
                type="number"
                step={unitMode === 'grams' ? '1' : '0.1'}
                min="0"
                value={unitMode === 'grams' ? tempTargetProt : protGKg}
                onChange={(e) =>
                  unitMode === 'grams'
                    ? handleGramsChange('prot', Number(e.target.value))
                    : handleGPerKgChange('prot', Number(e.target.value))
                }
                className="bg-surface font-medium"
              />
              <span className="text-style-chart-micro text-text-muted mt-0.5 block">
                {unitMode === 'grams' ? `${protGKg} g/kg` : `${tempTargetProt}g`}
              </span>
            </div>

            <div>
              <label className={cn(textStyle('field-label'), 'text-macro-carbohydrate mb-1 block')}>
                Carboidratos {unitMode === 'grams' ? '(g)' : '(g/kg)'}
              </label>
              <Input
                type="number"
                step={unitMode === 'grams' ? '1' : '0.1'}
                min="0"
                value={unitMode === 'grams' ? tempTargetCarb : carbGKg}
                onChange={(e) =>
                  unitMode === 'grams'
                    ? handleGramsChange('carb', Number(e.target.value))
                    : handleGPerKgChange('carb', Number(e.target.value))
                }
                className="bg-surface font-medium"
              />
              <span className="text-style-chart-micro text-text-muted mt-0.5 block">
                {unitMode === 'grams' ? `${carbGKg} g/kg` : `${tempTargetCarb}g`}
              </span>
            </div>

            <div>
              <label className={cn(textStyle('field-label'), 'text-macro-fat mb-1 block')}>
                Gorduras {unitMode === 'grams' ? '(g)' : '(g/kg)'}
              </label>
              <Input
                type="number"
                step={unitMode === 'grams' ? '1' : '0.1'}
                min="0"
                value={unitMode === 'grams' ? tempTargetFat : fatGKg}
                onChange={(e) =>
                  unitMode === 'grams'
                    ? handleGramsChange('fat', Number(e.target.value))
                    : handleGPerKgChange('fat', Number(e.target.value))
                }
                className="bg-surface font-medium"
              />
              <span className="text-style-chart-micro text-text-muted mt-0.5 block">
                {unitMode === 'grams' ? `${fatGKg} g/kg` : `${tempTargetFat}g`}
              </span>
            </div>
          </div>

          <div className="p-3 bg-surface-subtle border border-border-subtle rounded-control text-center">
            <span className="text-style-chart-micro text-text-muted uppercase block">Total Calórico Calculado</span>
            <span className="text-style-h3 text-text-primary">{calcKcal} kcal</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave}>
            Salvar Metas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
