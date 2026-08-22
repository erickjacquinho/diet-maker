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
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Copy,
  ClipboardPaste,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  CheckCheck,
  GripVertical,
} from 'lucide-react';
import {
  CarbCyclingVariation,
  DayOfWeek,
  DAYS_OF_WEEK,
  calculateWeeklyCycleAverage,
} from '@/lib/dietStore';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface CycleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  variations: CarbCyclingVariation[];
  patientWeightKg: number;
  onSave: (updatedVariations: CarbCyclingVariation[]) => void;
}

interface EditableVariationItem {
  id: string;
  name: string;
  assignedDays: DayOfWeek[];
  proteinG: number;
  carbsG: number;
  fatsG: number;
  proteinGPerKg: number;
  carbsGPerKg: number;
  fatsGPerKg: number;
  kcal: number;
  mealsCount: number;
}

const ALL_WEEK_DAYS: DayOfWeek[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

export function CycleMatrixModal({
  isOpen,
  onClose,
  variations,
  patientWeightKg,
  onSave,
}: CycleMatrixModalProps) {
  const weight = patientWeightKg > 0 ? patientWeightKg : 70;
  const [unitMode, setUnitMode] = useState<'grams' | 'g_per_kg'>('grams');
  const [items, setItems] = useState<EditableVariationItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [copiedValues, setCopiedValues] = useState<{
    proteinG: number;
    carbsG: number;
    fatsG: number;
    proteinGPerKg: number;
    carbsGPerKg: number;
    fatsGPerKg: number;
    kcal: number;
    sourceName: string;
  } | null>(null);

  // Initialize state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initialItems: EditableVariationItem[] = variations.map((v, index) => {
      const p = v.targetProtein;
      const c = v.targetCarbs;
      const f = v.targetFats;
      const kcal = v.targetKcal || calculatePresetCalories(p, c, f);

      return {
        id: v.id || `var-${Date.now()}-${index}`,
        name: v.name,
        assignedDays: v.assignedDays ? [...v.assignedDays] : [],
        proteinG: p,
        carbsG: c,
        fatsG: f,
        proteinGPerKg: v.gPerKg?.protein ?? Number((p / weight).toFixed(1)),
        carbsGPerKg: v.gPerKg?.carbs ?? Number((c / weight).toFixed(1)),
        fatsGPerKg: v.gPerKg?.fats ?? Number((f / weight).toFixed(1)),
        kcal,
        mealsCount: v.meals?.length || 0,
      };
    });

    setItems(initialItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [isOpen, variations, weight]);

  const handleUpdateField = (
    id: string,
    field: 'name' | 'protein' | 'carbs' | 'fats',
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === 'name') {
          return { ...item, name: String(value) };
        }

        const numVal = Math.max(0, Number(value) || 0);

        if (unitMode === 'grams') {
          const newP = field === 'protein' ? numVal : item.proteinG;
          const newC = field === 'carbs' ? numVal : item.carbsG;
          const newF = field === 'fats' ? numVal : item.fatsG;
          const newKcal = calculatePresetCalories(newP, newC, newF);

          return {
            ...item,
            proteinG: newP,
            carbsG: newC,
            fatsG: newF,
            proteinGPerKg: Number((newP / weight).toFixed(1)),
            carbsGPerKg: Number((newC / weight).toFixed(1)),
            fatsGPerKg: Number((newF / weight).toFixed(1)),
            kcal: newKcal,
          };
        } else {
          // g_per_kg mode
          const newPKg = field === 'protein' ? numVal : item.proteinGPerKg;
          const newCKg = field === 'carbs' ? numVal : item.carbsGPerKg;
          const newFKg = field === 'fats' ? numVal : item.fatsGPerKg;

          const newP = Math.round(newPKg * weight);
          const newC = Math.round(newCKg * weight);
          const newF = Math.round(newFKg * weight);
          const newKcal = calculatePresetCalories(newP, newC, newF);

          return {
            ...item,
            proteinG: newP,
            carbsG: newC,
            fatsG: newF,
            proteinGPerKg: newPKg,
            carbsGPerKg: newCKg,
            fatsGPerKg: newFKg,
            kcal: newKcal,
          };
        }
      })
    );
  };

  const handleToggleDay = (itemId: string, day: DayOfWeek) => {
    setItems((prev) =>
      prev.map((item) => {
        const hasDay = item.assignedDays.includes(day);

        if (item.id === itemId) {
          const newDays = hasDay
            ? item.assignedDays.filter((d) => d !== day)
            : [...item.assignedDays, day];
          return { ...item, assignedDays: newDays };
        } else {
          if (!hasDay) return item;
          const targetItem = prev.find((i) => i.id === itemId);
          if (targetItem && !targetItem.assignedDays.includes(day)) {
            return { ...item, assignedDays: item.assignedDays.filter((d) => d !== day) };
          }
          return item;
        }
      })
    );
  };

  const handleSelectAllDays = (itemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      const isAllSelected = target && target.assignedDays.length === 7;

      return prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            assignedDays: isAllSelected ? [] : [...ALL_WEEK_DAYS],
          };
        } else {
          // Desmarca dos outros caso esteja atribuindo todos para este item
          return {
            ...item,
            assignedDays: isAllSelected ? item.assignedDays : [],
          };
        }
      });
    });
  };

  const handleAddVariation = () => {
    const nextIdx = items.length + 1;
    const defaultProt = Math.round(weight * 2.0);
    const defaultCarb = Math.round(weight * 2.5);
    const defaultFat = Math.round(weight * 0.8);
    const kcal = calculatePresetCalories(defaultProt, defaultCarb, defaultFat);

    const newItem: EditableVariationItem = {
      id: `var-custom-${Date.now()}`,
      name: `Variação ${nextIdx}`,
      assignedDays: [],
      proteinG: defaultProt,
      carbsG: defaultCarb,
      fatsG: defaultFat,
      proteinGPerKg: Number((defaultProt / weight).toFixed(1)),
      carbsGPerKg: Number((defaultCarb / weight).toFixed(1)),
      fatsGPerKg: Number((defaultFat / weight).toFixed(1)),
      kcal,
      mealsCount: 0,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleCopyValues = (item: EditableVariationItem) => {
    setCopiedValues({
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatsG: item.fatsG,
      proteinGPerKg: item.proteinGPerKg,
      carbsGPerKg: item.carbsGPerKg,
      fatsGPerKg: item.fatsGPerKg,
      kcal: item.kcal,
      sourceName: item.name,
    });
    toast.success(`Valores de "${item.name}" copiados!`);
  };

  const handlePasteValues = (targetId: string) => {
    if (!copiedValues) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== targetId) return item;
        return {
          ...item,
          proteinG: copiedValues.proteinG,
          carbsG: copiedValues.carbsG,
          fatsG: copiedValues.fatsG,
          proteinGPerKg: copiedValues.proteinGPerKg,
          carbsGPerKg: copiedValues.carbsGPerKg,
          fatsGPerKg: copiedValues.fatsGPerKg,
          kcal: copiedValues.kcal,
        };
      })
    );
    toast.success(`Valores colados na variação!`);
  };

  const handleDuplicateItem = (itemId: string) => {
    const source = items.find((i) => i.id === itemId);
    if (!source) return;

    const newItem: EditableVariationItem = {
      ...source,
      id: `var-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      assignedDays: [],
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length <= 1) {
      toast.error('O plano precisa ter pelo menos 1 variação.');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Drag and drop edge-case safe handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIdx = draggedIndex ?? Number(e.dataTransfer.getData('text/plain'));

    if (
      Number.isInteger(sourceIdx) &&
      sourceIdx >= 0 &&
      sourceIdx < items.length &&
      sourceIdx !== targetIndex
    ) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(sourceIdx, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      setItems(newItems);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Suporte a teclado Alt + Setas
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < items.length) {
        const newItems = [...items];
        const [movedItem] = newItems.splice(index, 1);
        newItems.splice(targetIndex, 0, movedItem);
        setItems(newItems);
      }
    }
  };

  // Weekly Stats
  const weeklyAverage = useMemo(() => {
    const mappedVars: CarbCyclingVariation[] = items.map((i) => ({
      id: i.id,
      name: i.name,
      type: 'custom',
      assignedDays: i.assignedDays,
      targetKcal: i.kcal,
      targetProtein: i.proteinG,
      targetCarbs: i.carbsG,
      targetFats: i.fatsG,
      meals: [],
    }));
    return calculateWeeklyCycleAverage(mappedVars);
  }, [items]);

  const assignedDaysSet = useMemo(() => {
    const set = new Set<DayOfWeek>();
    items.forEach((i) => i.assignedDays.forEach((d) => set.add(d)));
    return set;
  }, [items]);

  const all7DaysAssigned = assignedDaysSet.size === 7;

  const handleSave = () => {
    const updatedVariations: CarbCyclingVariation[] = items.map((i) => {
      const original = variations.find((v) => v.id === i.id);
      return {
        id: i.id,
        name: i.name.trim() || 'Variação Sem Nome',
        type: original?.type || 'custom',
        assignedDays: i.assignedDays,
        targetKcal: i.kcal,
        targetProtein: i.proteinG,
        targetCarbs: i.carbsG,
        targetFats: i.fatsG,
        inputMode: unitMode,
        gPerKg: {
          protein: i.proteinGPerKg,
          carbs: i.carbsGPerKg,
          fats: i.fatsGPerKg,
        },
        meals: original?.meals || [],
      };
    });

    onSave(updatedVariations);
    toast.success('Configuração do ciclo salva com sucesso!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-surface border-border-subtle shadow-xl">
        {/* Header Superior Dedicado */}
        <DialogHeader className="p-6 pb-4 border-b border-border-subtle bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-control bg-success-soft text-success flex items-center justify-center shrink-0">
                <SlidersHorizontal size={20} aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-style-h3 text-text-primary">
                  Configuração do Ciclo de Carboidratos
                </DialogTitle>
                <DialogDescription className="text-style-legal text-text-muted mt-0.5">
                  Configure os nomes, metas de macronutrientes e dias da semana de cada variação.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Seletor de Unidade */}
              <div className="w-48">
                <SelectField
                  id="cycle-matrix-unit-mode"
                  value={unitMode}
                  onValueChange={(val) => setUnitMode(val as 'grams' | 'g_per_kg')}
                  options={[
                    { value: 'grams', label: 'gramas (g)' },
                    { value: 'g_per_kg', label: `g/kg (${weight}kg)` },
                  ]}
                  size="compact"
                  aria-label="Unidade de entrada dos macros"
                />
              </div>

              {/* Botão Adicionar */}
              <Button
                type="button"
                variant="secondary"
                size="compact"
                onClick={handleAddVariation}
                className="flex items-center gap-1.5 font-bold text-style-legal bg-surface hover:bg-surface-hover h-9"
              >
                <Plus size={14} className="text-success" aria-hidden="true" />
                <span>Adicionar Variação</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Lista Vertical de Variações em 2 Linhas com Drag & Drop */}
        <div
          className="flex-1 overflow-y-auto p-6 bg-surface-subtle/50 flex flex-col gap-3"
          onDragOver={(e) => e.preventDefault()}
        >
          {items.map((item, index) => {
            const isDraggingThis = draggedIndex === index;
            const isDragOverThis = dragOverIndex === index && draggedIndex !== index;
            const isAllDaysSelected = item.assignedDays.length === 7;

            return (
              <div
                key={item.id}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={(e) => handleDragLeave(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  'bg-surface rounded-control border border-border-subtle p-4 flex flex-col gap-3 shadow-subtle hover:border-border-hover transition-all',
                  isDraggingThis && 'opacity-40 border-dashed border-success',
                  isDragOverThis && 'border-t-2 border-t-success ring-2 ring-success/20 bg-surface'
                )}
              >
                {/* Linha 1: Handle, Nome, Prot, Carbo, Gordura, Kcal (Texto Limpo) e Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                  {/* Handle + Ordem + Nome */}
                  <div className="flex items-center gap-2 flex-1 min-w-56">
                    <div
                      className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing shrink-0"
                      title="Arrastar para reordenar (ou use Alt + Setas no teclado)"
                    >
                      <GripVertical size={16} aria-hidden="true" />
                    </div>

                    <span className="size-6 rounded-round bg-surface-subtle border border-border-subtle text-text-muted flex items-center justify-center font-bold text-style-chart-micro shrink-0">
                      {index + 1}
                    </span>

                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                      placeholder="Nome da Variação"
                      draggable={false}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-8 font-bold text-style-body-small bg-surface-subtle max-w-xs"
                    />
                  </div>

                  {/* Inputs de Macros (Prot, Carbo, Gordura) e Kcal em Texto Limpo */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Proteína */}
                    <div className="flex items-center gap-1.5">
                      <label className={cn(textStyle('field-label'), 'text-macro-protein font-bold text-style-chart-micro whitespace-nowrap')}>
                        Prot:
                      </label>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          step={unitMode === 'grams' ? '1' : '0.1'}
                          min="0"
                          value={unitMode === 'grams' ? item.proteinG : item.proteinGPerKg}
                          onChange={(e) => handleUpdateField(item.id, 'protein', e.target.value)}
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="h-8 bg-surface-subtle border-border-subtle focus:border-macro-protein font-bold text-text-primary pr-8 text-style-chart-micro"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-style-chart-micro font-bold text-text-muted pointer-events-none">
                          {unitMode === 'grams' ? 'g' : 'g/k'}
                        </span>
                      </div>
                    </div>

                    {/* Carboidrato */}
                    <div className="flex items-center gap-1.5">
                      <label className={cn(textStyle('field-label'), 'text-macro-carbohydrate font-bold text-style-chart-micro whitespace-nowrap')}>
                        Carb:
                      </label>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          step={unitMode === 'grams' ? '1' : '0.1'}
                          min="0"
                          value={unitMode === 'grams' ? item.carbsG : item.carbsGPerKg}
                          onChange={(e) => handleUpdateField(item.id, 'carbs', e.target.value)}
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="h-8 bg-surface-subtle border-border-subtle focus:border-macro-carbohydrate font-bold text-text-primary pr-8 text-style-chart-micro"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-style-chart-micro font-bold text-text-muted pointer-events-none">
                          {unitMode === 'grams' ? 'g' : 'g/k'}
                        </span>
                      </div>
                    </div>

                    {/* Gordura */}
                    <div className="flex items-center gap-1.5">
                      <label className={cn(textStyle('field-label'), 'text-macro-fat font-bold text-style-chart-micro whitespace-nowrap')}>
                        Gord:
                      </label>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          step={unitMode === 'grams' ? '1' : '0.1'}
                          min="0"
                          value={unitMode === 'grams' ? item.fatsG : item.fatsGPerKg}
                          onChange={(e) => handleUpdateField(item.id, 'fats', e.target.value)}
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="h-8 bg-surface-subtle border-border-subtle focus:border-macro-fat font-bold text-text-primary pr-8 text-style-chart-micro"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-style-chart-micro font-bold text-text-muted pointer-events-none">
                          {unitMode === 'grams' ? 'g' : 'g/k'}
                        </span>
                      </div>
                    </div>

                    {/* Total Calórico em Texto Limpo (Sem badge) */}
                    <div className="text-style-body-small font-bold text-text-primary whitespace-nowrap pl-1">
                      {item.kcal} <span className="font-normal text-text-muted text-style-chart-micro">kcal</span>
                    </div>
                  </div>

                  {/* Ações: Copiar (ícone apenas), Colar (ícone apenas), Excluir */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyValues(item)}
                      title="Copiar valores da variação"
                      aria-label="Copiar valores da variação"
                      className="size-7 rounded-control text-text-muted hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Copy size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={!copiedValues}
                      onClick={() => handlePasteValues(item.id)}
                      title={copiedValues ? `Colar valores copiados de "${copiedValues.sourceName}"` : 'Nenhum valor copiado'}
                      aria-label="Colar valores na variação"
                      className="size-7 rounded-control text-text-muted hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ClipboardPaste size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length <= 1}
                      title="Excluir variação"
                      aria-label="Excluir variação"
                      className="size-7 rounded-control text-error hover:bg-error-soft flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Linha 2: Escala Semanal Alinhada à Esquerda + Divisor + Botão Selecionar Todos */}
                <div className="flex flex-wrap items-center justify-start gap-3 pt-2 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5 text-style-chart-micro font-bold text-text-muted uppercase shrink-0">
                    <Calendar size={12} aria-hidden="true" />
                    <span>Escala:</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const isAssigned = item.assignedDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => handleToggleDay(item.id, day.id)}
                          aria-pressed={isAssigned}
                          className={cn(
                            'h-7 w-9 flex items-center justify-center rounded-control text-style-chart-micro font-bold transition-all cursor-pointer text-center border box-border select-none shrink-0',
                            isAssigned
                              ? 'bg-primary text-on-primary border-primary shadow-xs'
                              : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface border-border-subtle'
                          )}
                        >
                          {day.shortLabel}
                        </button>
                      );
                    })}

                    {/* Divisor vertical sutil entre o Domingo e o botão Todos */}
                    <div className="h-4 w-px bg-border-divider mx-1.5 shrink-0" aria-hidden="true" />

                    {/* Botão Selecionar Todos à Direita do Divisor */}
                    <button
                      type="button"
                      onClick={() => handleSelectAllDays(item.id)}
                      title={isAllDaysSelected ? "Desmarcar todos os dias desta variação" : "Selecionar todos os dias da semana para esta variação"}
                      aria-pressed={isAllDaysSelected}
                      className={cn(
                        'h-7 px-2.5 flex items-center justify-center gap-1.5 rounded-control text-style-chart-micro font-bold transition-all cursor-pointer border box-border select-none shrink-0',
                        isAllDaysSelected
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface border-border-subtle'
                      )}
                    >
                      <CheckCheck size={13} aria-hidden="true" />
                      <span>Todos</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Botão Adicionar no fim da lista */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddVariation}
            className="w-full border-dashed border-border-hover py-3 flex items-center justify-center gap-2 font-bold text-style-body-small hover:bg-surface-subtle mt-1"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Adicionar Nova Variação ao Ciclo</span>
          </Button>
        </div>

        {/* Rodapé da Tela: Resumo Semanal e Salvar */}
        <DialogFooter className="p-4 px-6 border-t border-border-subtle bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-success shrink-0" aria-hidden="true" />
              <span className="text-style-body-small font-bold text-text-primary">
                Média Semanal: {weeklyAverage.avgKcal} kcal/dia
              </span>
            </div>

            <div className="flex items-center gap-2 text-style-chart-micro font-bold">
              <span className="text-macro-protein">{weeklyAverage.avgProtein}g P</span>
              <span className="text-text-muted">•</span>
              <span className="text-macro-carbohydrate">{weeklyAverage.avgCarbs}g C</span>
              <span className="text-text-muted">•</span>
              <span className="text-macro-fat">{weeklyAverage.avgFats}g G</span>
            </div>

            <div className="text-style-chart-micro font-bold">
              {all7DaysAssigned ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 size={13} /> 7/7 dias distribuídos
                </span>
              ) : (
                <span className="text-warning flex items-center gap-1">
                  <AlertCircle size={13} /> {assignedDaysSet.size}/7 dias distribuídos
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex items-center gap-1.5">
              <span>Salvar Configurações</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
