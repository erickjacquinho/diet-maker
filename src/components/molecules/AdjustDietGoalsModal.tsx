'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Edit3, RotateCcw } from 'lucide-react';
import { calculateMacroDistributionPct } from '@/lib/nutrition/macroCalculations';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';

export interface AdjustDietGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempTargetProt: number;
  setTempTargetProt: (val: number) => void;
  tempTargetCarb: number;
  setTempTargetCarb: (val: number) => void;
  tempTargetFat: number;
  setTempTargetFat: (val: number) => void;
  patientWeightKg?: number;
  mode?: 'simple' | 'carb_cycling';
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
  mode = 'simple',
  variationName,
  onVariationNameChange,
  onSave,
}: AdjustDietGoalsModalProps) {
  const weight = patientWeightKg > 0 ? patientWeightKg : 70;
  const [unitMode, setUnitMode] = useState<'grams' | 'g_per_kg'>('grams');

  const [protGKg, setProtGKg] = useState<number>(Number((tempTargetProt / weight).toFixed(1)));
  const [carbGKg, setCarbGKg] = useState<number>(Number((tempTargetCarb / weight).toFixed(1)));
  const [fatGKg, setFatGKg] = useState<number>(Number((tempTargetFat / weight).toFixed(1)));

  const isSimpleMode = mode === 'simple' || (!variationName && mode !== 'carb_cycling');

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

  const handleResetToZero = () => {
    setTempTargetProt(0);
    setTempTargetCarb(0);
    setTempTargetFat(0);
    setProtGKg(0);
    setCarbGKg(0);
    setFatGKg(0);
  };

  // Cálculo da distribuição energética (% VET) e calorias
  const distribution = useMemo(() => {
    return calculateMacroDistributionPct(tempTargetProt, tempTargetCarb, tempTargetFat);
  }, [tempTargetProt, tempTargetCarb, tempTargetFat]);

  const kcalPerKg = weight > 0 && distribution.totalKcal > 0
    ? (distribution.totalKcal / weight).toFixed(1)
    : '0.0';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-surface sm:max-w-2xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 text-text-primary text-style-body font-bold">
              <Edit3 className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Ajustar Metas Nutricionais</span>
            </DialogTitle>
            <div className="w-40 shrink-0">
              <SelectField
                id="adjust-unit-mode"
                value={unitMode}
                onValueChange={(val) => setUnitMode(val as 'grams' | 'g_per_kg')}
                options={[
                  { value: 'grams', label: 'Gramas (g)' },
                  { value: 'g_per_kg', label: 'g/kg corporal' },
                ]}
                size="compact"
                layer="modal"
                aria-label="Modo de entrada"
              />
            </div>
          </div>
          <DialogDescription className="text-style-legal text-text-muted mt-1">
            Defina os alvos em {unitMode === 'grams' ? 'gramas (g)' : `gramas por quilo (g/kg para ${weight}kg)`}. As calorias e proporções são calculadas em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-4">
          {/* Cabeçalho da Seção / Modo */}
          {isSimpleMode ? (
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <span className="text-style-body font-bold text-text-primary">Dieta Simples</span>
                <span className="text-style-legal text-text-muted">· Metas diárias unificadas</span>
              </div>
            </div>
          ) : (
            onVariationNameChange && (
              <div>
                <label className={cn(textStyle('field-label'), 'mb-1 block')}>Nome da Variação / Dia</label>
                <Input
                  type="text"
                  value={variationName || ''}
                  onChange={(e) => onVariationNameChange(e.target.value)}
                  placeholder="Ex: Dia Alto Carbo"
                  className="bg-surface font-medium"
                />
              </div>
            )
          )}

          {/* Grid de 4 Colunas no mesmo formato: Proteínas -> Carboidratos -> Gorduras -> Calorias */}
          <div className="grid grid-cols-4 gap-3.5">
            {/* 1. Proteínas */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-macro-protein font-bold text-center block')}>
                Proteínas {unitMode === 'grams' ? '(g)' : '(g/kg)'}
              </label>
              <Input
                type="number"
                step={unitMode === 'grams' ? '1' : '0.1'}
                min="0"
                value={unitMode === 'grams' ? (tempTargetProt || '') : (protGKg || '')}
                placeholder="0"
                onChange={(e) =>
                  unitMode === 'grams'
                    ? handleGramsChange('prot', Number(e.target.value))
                    : handleGPerKgChange('prot', Number(e.target.value))
                }
                className="h-10 text-center font-bold text-style-body tabular-nums bg-surface border-border-subtle"
              />
              <span className="text-style-chart-micro text-text-muted text-center block tabular-nums">
                {unitMode === 'grams' ? `${protGKg} g/kg` : `${tempTargetProt}g`}
              </span>
            </div>

            {/* 2. Carboidratos */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-macro-carbohydrate font-bold text-center block')}>
                Carboidratos {unitMode === 'grams' ? '(g)' : '(g/kg)'}
              </label>
              <Input
                type="number"
                step={unitMode === 'grams' ? '1' : '0.1'}
                min="0"
                value={unitMode === 'grams' ? (tempTargetCarb || '') : (carbGKg || '')}
                placeholder="0"
                onChange={(e) =>
                  unitMode === 'grams'
                    ? handleGramsChange('carb', Number(e.target.value))
                    : handleGPerKgChange('carb', Number(e.target.value))
                }
                className="h-10 text-center font-bold text-style-body tabular-nums bg-surface border-border-subtle"
              />
              <span className="text-style-chart-micro text-text-muted text-center block tabular-nums">
                {unitMode === 'grams' ? `${carbGKg} g/kg` : `${tempTargetCarb}g`}
              </span>
            </div>

            {/* 3. Gorduras */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-macro-fat font-bold text-center block')}>
                Gorduras {unitMode === 'grams' ? '(g)' : '(g/kg)'}
              </label>
              <Input
                type="number"
                step={unitMode === 'grams' ? '1' : '0.1'}
                min="0"
                value={unitMode === 'grams' ? (tempTargetFat || '') : (fatGKg || '')}
                placeholder="0"
                onChange={(e) =>
                  unitMode === 'grams'
                    ? handleGramsChange('fat', Number(e.target.value))
                    : handleGPerKgChange('fat', Number(e.target.value))
                }
                className="h-10 text-center font-bold text-style-body tabular-nums bg-surface border-border-subtle"
              />
              <span className="text-style-chart-micro text-text-muted text-center block tabular-nums">
                {unitMode === 'grams' ? `${fatGKg} g/kg` : `${tempTargetFat}g`}
              </span>
            </div>

            {/* 4. Calorias (ao lado dos macros no mesmo formato) */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-text-primary font-bold text-center block')}>
                Calorias (kcal)
              </label>
              <div
                className="h-10 rounded-control border border-border-subtle bg-surface-subtle/80 flex items-center justify-center font-bold text-style-body text-text-primary tabular-nums select-none"
                aria-label="Calorias totais calculadas"
              >
                {distribution.totalKcal}
              </div>
              <span className="text-style-chart-micro text-text-muted text-center block tabular-nums">
                {kcalPerKg} kcal/kg
              </span>
            </div>
          </div>

          {/* Barra de Distribuição Percentual (% VET) */}
          {distribution.totalKcal > 0 ? (
            <div className="flex flex-col gap-2 bg-surface-subtle/40 border border-border-subtle rounded-surface p-3.5">
              <div className="flex items-center justify-between text-style-chart-micro text-text-muted font-semibold">
                <span>Distribuição Calórica (% VET)</span>
                <span className="font-bold text-text-primary">100%</span>
              </div>
              {/* Barra multi-segmentada */}
              <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden flex" role="progressbar" aria-label="Distribuição calórica">
                <div
                  style={{ width: `${distribution.proteinPct}%` }}
                  className="h-full bg-macro-protein transition-all duration-300"
                  title={`Proteínas: ${distribution.proteinPct}% (${distribution.proteinKcal} kcal)`}
                />
                <div
                  style={{ width: `${distribution.carbsPct}%` }}
                  className="h-full bg-macro-carbohydrate transition-all duration-300"
                  title={`Carboidratos: ${distribution.carbsPct}% (${distribution.carbsKcal} kcal)`}
                />
                <div
                  style={{ width: `${distribution.fatsPct}%` }}
                  className="h-full bg-macro-fat transition-all duration-300"
                  title={`Gorduras: ${distribution.fatsPct}% (${distribution.fatsKcal} kcal)`}
                />
              </div>
              {/* Legenda com percentual e kcal por macro */}
              <div className="flex items-center justify-between text-style-chart-micro text-text-muted pt-0.5 tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-macro-protein inline-block shrink-0" aria-hidden="true" />
                  <span>Proteínas: <strong className="text-text-primary">{distribution.proteinPct}%</strong> ({distribution.proteinKcal} kcal)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-macro-carbohydrate inline-block shrink-0" aria-hidden="true" />
                  <span>Carboidratos: <strong className="text-text-primary">{distribution.carbsPct}%</strong> ({distribution.carbsKcal} kcal)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-macro-fat inline-block shrink-0" aria-hidden="true" />
                  <span>Gorduras: <strong className="text-text-primary">{distribution.fatsPct}%</strong> ({distribution.fatsKcal} kcal)</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 text-style-chart-micro text-text-muted italic bg-surface-subtle/30 rounded-surface border border-dashed border-border-subtle">
              Nenhuma meta inserida. Digite os valores para visualizar a distribuição calórica (% VET).
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full gap-2 pt-2">
          <Button
            variant="quiet"
            size="compact"
            onClick={handleResetToZero}
            className="text-text-muted hover:text-error flex items-center gap-1.5"
            title="Zerar todos os macronutrientes"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Zerar Metas</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="compact" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="compact" onClick={onSave}>
              Salvar Metas
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
