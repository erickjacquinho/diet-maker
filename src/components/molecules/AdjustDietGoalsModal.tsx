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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Edit3, RotateCcw, Flame } from 'lucide-react';
import { calculateMacroDistributionPct } from '@/lib/nutrition/macroCalculations';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';
import { MacroProportionBar } from './MacroProportionBar';

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
  useSaveShortcut({
    onSave,
    enabled: isOpen,
    priority: 10,
  });
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
          <DialogTitle className="flex items-center gap-2 text-text-primary text-style-body font-bold">
            <Edit3 className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Ajustar Metas Nutricionais</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted mt-1">
            Defina os alvos em {unitMode === 'grams' ? 'gramas (g)' : `gramas por quilo (g/kg para ${weight}kg)`}. As calorias e proporções são calculadas em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-4">
          {/* Cabeçalho da Seção / Modo com Button Group alinhado à direita na mesma linha */}
          {isSimpleMode ? (
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="text-style-body font-bold text-text-primary">Dieta Simples</span>
                <span className="text-style-legal text-text-muted">· Metas diárias unificadas</span>
              </div>
              <ToggleGroup
                type="single"
                value={unitMode}
                onValueChange={(val) => {
                  if (val) setUnitMode(val as 'grams' | 'g_per_kg');
                }}
                className="bg-surface-subtle border border-border-subtle p-0.5 rounded-control"
              >
                <ToggleGroupItem
                  value="grams"
                  className="w-24 h-7 text-xs font-semibold"
                  aria-label="Definir em Gramas"
                >
                  Gramas (g)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="g_per_kg"
                  className="w-24 h-7 text-xs font-semibold"
                  aria-label="Definir em g/kg corporal"
                >
                  g/kg
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3">
              <div className="flex-1">
                <label className={cn(textStyle('field-label'), 'mb-1 block')}>Nome da Variação / Dia</label>
                <Input
                  type="text"
                  value={variationName || ''}
                  onChange={(e) => onVariationNameChange?.(e.target.value)}
                  placeholder="Ex: Dia Alto Carbo"
                  className="bg-surface font-medium"
                />
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <label className={cn(textStyle('field-label'), 'mb-1 block')}>Unidade</label>
                <ToggleGroup
                  type="single"
                  value={unitMode}
                  onValueChange={(val) => {
                    if (val) setUnitMode(val as 'grams' | 'g_per_kg');
                  }}
                  className="bg-surface-subtle border border-border-subtle p-0.5 rounded-control"
                >
                  <ToggleGroupItem
                    value="grams"
                    className="w-24 h-7 text-xs font-semibold"
                    aria-label="Definir em Gramas"
                  >
                    Gramas (g)
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="g_per_kg"
                    className="w-24 h-7 text-xs font-semibold"
                    aria-label="Definir em g/kg corporal"
                  >
                    g/kg
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          )}

          {/* Grid de 4 Colunas no mesmo formato: Proteínas -> Carboidratos -> Gorduras -> Calorias */}
          <div className="grid grid-cols-4 gap-3.5">
            {/* 1. Proteínas */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-macro-protein font-bold text-left block')}>
                Proteínas
              </label>
              <div className="relative flex items-center">
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
                  className="h-10 pl-3 pr-16 text-left font-bold text-style-body tabular-nums bg-surface border-border-subtle focus:ring-1 focus:ring-primary w-full"
                />
                <span className="pointer-events-none absolute right-3 text-style-legal font-medium text-text-muted select-none tabular-nums">
                  {unitMode === 'grams' ? `${protGKg} g/kg` : `${tempTargetProt}g`}
                </span>
              </div>
            </div>

            {/* 2. Carboidratos */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-macro-carbohydrate font-bold text-left block')}>
                Carboidratos
              </label>
              <div className="relative flex items-center">
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
                  className="h-10 pl-3 pr-16 text-left font-bold text-style-body tabular-nums bg-surface border-border-subtle focus:ring-1 focus:ring-primary w-full"
                />
                <span className="pointer-events-none absolute right-3 text-style-legal font-medium text-text-muted select-none tabular-nums">
                  {unitMode === 'grams' ? `${carbGKg} g/kg` : `${tempTargetCarb}g`}
                </span>
              </div>
            </div>

            {/* 3. Gorduras */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-macro-fat font-bold text-left block')}>
                Gorduras
              </label>
              <div className="relative flex items-center">
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
                  className="h-10 pl-3 pr-16 text-left font-bold text-style-body tabular-nums bg-surface border-border-subtle focus:ring-1 focus:ring-primary w-full"
                />
                <span className="pointer-events-none absolute right-3 text-style-legal font-medium text-text-muted select-none tabular-nums">
                  {unitMode === 'grams' ? `${fatGKg} g/kg` : `${tempTargetFat}g`}
                </span>
              </div>
            </div>

            {/* 4. Total Calórico (Sem box/borda, texto left e kcal/kg right) */}
            <div className="flex flex-col gap-1.5">
              <label className={cn(textStyle('field-label'), 'text-text-secondary font-bold text-left block')}>
                Total Calórico
              </label>
              <div
                className="h-10 px-1 flex items-center justify-between select-none"
                aria-label="Calorias totais calculadas"
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
                  <span className="text-style-body font-bold text-text-primary tabular-nums text-base">
                    {distribution.totalKcal}
                  </span>
                  <span className="text-style-legal text-text-muted font-medium">kcal</span>
                </div>
                <span className="text-style-legal font-medium text-text-muted select-none tabular-nums">
                  {kcalPerKg} kcal/kg
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Distribuição Percentual (% VET) — Componente Modularizado */}
          <MacroProportionBar
            proteinG={tempTargetProt}
            carbsG={tempTargetCarb}
            fatsG={tempTargetFat}
            title="Distribuição Calórica (% VET)"
            showTotalPct
            showKcalPerMacro
            showGrams={false}
            showCalories={false}
            size="standard"
            emptyMessage="Nenhuma meta inserida. Digite os valores para visualizar a distribuição calórica (% VET)."
            className="bg-surface-subtle/40 border-border-subtle"
          />
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
            <Button
              variant="primary"
              size="compact"
              onClick={onSave}
              aria-keyshortcuts="Control+s Meta+s"
              title="Salvar Metas (Ctrl+S)"
            >
              Salvar Metas <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
