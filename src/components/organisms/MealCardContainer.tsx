'use client';

import React, { useEffect, useState } from 'react';
import { Button, Surface, DeleteIconButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MealItemRow, MealItemRowProps, MacroProportionBar } from '../molecules';
import { ClipboardCopy, ClipboardPaste, Clock, Copy, Percent, Plus } from 'lucide-react';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';

export const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
export const MINUTES_OPTIONS = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

export const enforceValidTimeFormat = (value: string, fallback = '08:00'): string => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const normalized = trimmed.replace(/h/i, ':');

  let hours = 8;
  let minutes = 0;

  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    const hPart = parts[0].replace(/\D/g, '');
    const mPart = parts[1] ? parts[1].replace(/\D/g, '') : '';
    hours = hPart ? parseInt(hPart, 10) : 0;
    minutes = mPart ? parseInt(mPart.slice(0, 2), 10) : 0;
  } else {
    const digits = normalized.replace(/\D/g, '');
    if (digits.length === 0) return fallback;
    if (digits.length === 1 || digits.length === 2) {
      hours = parseInt(digits, 10);
      minutes = 0;
    } else if (digits.length === 3) {
      hours = parseInt(digits.slice(0, 1), 10);
      minutes = parseInt(digits.slice(1), 10);
    } else {
      hours = parseInt(digits.slice(0, 2), 10);
      minutes = parseInt(digits.slice(2, 4), 10);
    }
  }

  if (isNaN(hours) || hours < 0) hours = 0;
  if (hours > 23) hours = 23;
  if (isNaN(minutes) || minutes < 0) minutes = 0;
  if (minutes > 59) minutes = 59;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatMealTimeInput = enforceValidTimeFormat;

export const parseHourAndMinute = (value: string): { hour: string; minute: string } => {
  const formatted = enforceValidTimeFormat(value);
  const [h, m] = formatted.split(':');
  return { hour: h, minute: m };
};

export interface MealCardContainerProps {
  id?: string;
  title: string;
  time: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  items: MealItemRowProps[];
  onTitleChange?: (newTitle: string) => void;
  onTimeChange?: (newTime: string) => void;
  onAddFoodClick?: () => void;
  onDuplicate?: () => void;
  onCopyMeal?: () => void;
  onPasteMeal?: () => void;
  canPasteMeal?: boolean;
  onScale?: () => void;
  scaleDisabled?: boolean;
  onDeleteMeal?: () => void;
  onRemoveItem?: (index: number) => void;
  onSubstituteItem?: (index: number) => void;
  onDuplicateItem?: (index: number) => void;
  onQuantityChange?: (index: number, newGrams: number) => void;
  onReorderItems?: (sourceIndex: number, targetIndex: number) => void;
}

export const MealCardContainer: React.FC<MealCardContainerProps> = ({
  title,
  time,
  kcal,
  proteinG,
  carbsG,
  fatsG,
  items,
  onTitleChange,
  onTimeChange,
  onAddFoodClick,
  onDuplicate,
  onCopyMeal,
  onPasteMeal,
  canPasteMeal = false,
  onScale,
  scaleDisabled = false,
  onDeleteMeal,
  onRemoveItem,
  onSubstituteItem,
  onDuplicateItem,
  onQuantityChange,
  onReorderItems,
}) => {

  const [draftTitle, setDraftTitle] = useState(title);
  const [draftTime, setDraftTime] = useState(time);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverState, setDragOverState] = useState<{ index: number; position: 'top' | 'bottom' } | null>(null);

  useEffect(() => setDraftTitle(title), [title]);
  useEffect(() => setDraftTime(time), [time]);

  const computedKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
  const displayKcal = computedKcal > 0 ? computedKcal : kcal;

  const handleCommitTitle = () => {
    const nextTitle = draftTitle.trim();

    if (!nextTitle) {
      setDraftTitle(title);
      return;
    }

    setDraftTitle(nextTitle);
    if (nextTitle !== title) onTitleChange?.(nextTitle);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^\d:]/g, '').slice(0, 5);

    if (!clean.includes(':') && clean.length > 2) {
      if (clean.length === 3) {
        setDraftTime(`0${clean.slice(0, 1)}:${clean.slice(1)}`);
      } else {
        setDraftTime(`${clean.slice(0, 2)}:${clean.slice(2, 4)}`);
      }
    } else {
      setDraftTime(clean);
    }
  };

  const handleCommitTime = () => {
    const nextTime = enforceValidTimeFormat(draftTime, time);

    setDraftTime(nextTime);
    if (nextTime !== time) onTimeChange?.(nextTime);
  };

  const { hour: currentHour, minute: currentMinute } = parseHourAndMinute(draftTime);

  const handleSelectHour = (newHour: string) => {
    const nextTime = `${newHour}:${currentMinute}`;
    setDraftTime(nextTime);
    if (nextTime !== time) onTimeChange?.(nextTime);
  };

  const handleSelectMinute = (newMinute: string) => {
    const nextTime = `${currentHour}:${newMinute}`;
    setDraftTime(nextTime);
    if (nextTime !== time) onTimeChange?.(nextTime);
  };

  return (
    <Surface variant="default" density="highlight" className="flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-4 flex-1">
        {/* Meal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <Input
              type="text"
              size="compact"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleCommitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCommitTitle();
                  e.currentTarget.blur();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setDraftTitle(title);
                }
              }}
              className="w-meal-title text-style-field-value font-bold"
              placeholder="Nome da refeição"
              aria-label="Nome da refeição"
            />
            <div className="relative shrink-0 flex items-center">
              <Input
                type="text"
                size="compact"
                maxLength={5}
                value={draftTime}
                onChange={handleTimeInputChange}
                onBlur={handleCommitTime}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCommitTime();
                    e.currentTarget.blur();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setDraftTime(time);
                  }
                }}
                className="w-24 justify-center pr-7 text-center font-bold text-style-field-value"
                placeholder="08:00"
                aria-label="Horário da refeição"
              />
              <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="quiet"
                    size="compact"
                    iconOnly
                    aria-label="Selecionar horário"
                    title="Selecionar horário"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto w-auto min-w-0 border-transparent bg-transparent text-text-muted hover:bg-transparent hover:border-transparent hover:text-text-muted active:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer shadow-none p-0"
                  >
                    <Clock size={13} aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  className="w-auto p-3 shadow-floating bg-surface border-border-subtle"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-1.5 px-1 gap-4">
                      <span className={cn(textStyle('field-label'), 'font-semibold text-text-secondary')}>
                        Selecionar horário
                      </span>
                      <span className={cn(textStyle('legal'), 'font-bold text-text-primary bg-surface-subtle px-1.5 py-0.5 rounded')}>
                        {draftTime || '00:00'}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      {/* Coluna de Horas */}
                      <div className="flex flex-col gap-1 items-center">
                        <span className={cn(textStyle('legal'), 'text-text-muted font-medium')}>
                          Hora
                        </span>
                        <div
                          role="listbox"
                          aria-label="Horas"
                          className="flex flex-col gap-0.5 max-h-44 overflow-y-auto w-14 pr-1"
                        >
                          {HOURS_OPTIONS.map((h) => {
                            const isSelected = currentHour === h;
                            return (
                              <Button
                                key={h}
                                type="button"
                                variant={isSelected ? 'primary' : 'quiet'}
                                size="compact"
                                aria-label={`Hora ${h}`}
                                onClick={() => handleSelectHour(h)}
                                className={cn(
                                  'h-7 w-full text-center justify-center text-style-legal font-medium px-1',
                                  isSelected && 'font-bold'
                                )}
                              >
                                {h}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="w-px h-44 bg-border-subtle self-center" />

                      {/* Coluna de Minutos */}
                      <div className="flex flex-col gap-1 items-center">
                        <span className={cn(textStyle('legal'), 'text-text-muted font-medium')}>
                          Min
                        </span>
                        <div
                          role="listbox"
                          aria-label="Minutos"
                          className="flex flex-col gap-0.5 max-h-44 overflow-y-auto w-14 pr-1"
                        >
                          {MINUTES_OPTIONS.map((m) => {
                            const isSelected = currentMinute === m;
                            return (
                              <Button
                                key={m}
                                type="button"
                                variant={isSelected ? 'primary' : 'quiet'}
                                size="compact"
                                aria-label={`Minuto ${m}`}
                                onClick={() => handleSelectMinute(m)}
                                className={cn(
                                  'h-7 w-full text-center justify-center text-style-legal font-medium px-1',
                                  isSelected && 'font-bold'
                                )}
                              >
                                {m}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div
            role="group"
            aria-label="Ações da refeição"
            className="flex items-center gap-2 shrink-0"
          >
            <div role="group" aria-label="Transferir alimentos da refeição" className="flex items-center gap-1.5">
              <Button
                onClick={onCopyMeal}
                disabled={items.length === 0}
                variant="secondary"
                size="compact"
                className="flex items-center gap-1 text-style-legal"
              >
                <ClipboardCopy size={12} />
                <span>Copiar</span>
              </Button>
              <Button
                onClick={onPasteMeal}
                disabled={!canPasteMeal}
                variant="secondary"
                size="compact"
                className="flex items-center gap-1 text-style-legal"
              >
                <ClipboardPaste size={12} />
                <span>Colar</span>
              </Button>
            </div>
            <div role="separator" aria-orientation="vertical" className="h-5 w-px bg-border-divider" />
            <div className="flex items-center gap-1.5">
              <Button onClick={onDuplicate} variant="secondary" size="compact" className="flex items-center gap-1 text-style-legal">
                <Copy size={12} />
                <span>Duplicar</span>
              </Button>
              <Button onClick={onScale} disabled={scaleDisabled} variant="secondary" size="compact" className="flex items-center gap-1 text-style-legal">
                <Percent size={12} />
                <span>Escalar</span>
              </Button>
              <DeleteIconButton
                size="compact"
                onClick={onDeleteMeal}
                title="Excluir refeição"
              />
            </div>
          </div>
        </div>

        {/* Items List - Table View */}
        <div className="min-h-[48px]">
          {items.length === 0 ? (
            <Surface
              variant="subtle"
              density="compact"
              className="p-4 text-center text-text-muted flex flex-col items-center justify-center gap-1 border-dashed border-border-divider"
            >
              <span className="text-style-legal font-medium">Nenhum alimento nesta refeição.</span>
              <span className="text-style-caption text-text-muted">Clique em "+ Adicionar Alimento" para incluir itens da tabela TACO.</span>
            </Surface>
          ) : (
            <div className="overflow-hidden rounded-control border border-border-divider bg-surface">
              <Table>
                <TableHeader className="bg-surface-subtle">
                  <TableRow className="hover:bg-surface-subtle border-b border-border-divider">
                    <TableHead className="w-10 px-2 text-center h-8" aria-label="Reordenar" />
                    <TableHead className="text-left font-bold text-style-chart-micro tracking-overline text-text-secondary h-8">
                      Nome
                    </TableHead>
                    <TableHead className="w-20 px-2 text-center h-8" aria-label="Ações do alimento" />
                    <TableHead className="w-24 text-center font-bold text-style-chart-micro tracking-overline text-text-secondary h-8">
                      Quantidade
                    </TableHead>
                    <TableHead className="w-20 text-right font-bold text-style-chart-micro tracking-overline text-macro-protein h-8">
                      Proteína
                    </TableHead>
                    <TableHead className="w-24 text-right font-bold text-style-chart-micro tracking-overline text-macro-carbohydrate h-8">
                      Carboidrato
                    </TableHead>
                    <TableHead className="w-20 text-right font-bold text-style-chart-micro tracking-overline text-macro-fat h-8">
                      Gorduras
                    </TableHead>
                    <TableHead className="w-24 text-right font-bold text-style-chart-micro tracking-overline text-text-primary h-8">
                      Calorias
                    </TableHead>
                    <TableHead className="w-12 px-2 text-center h-8" aria-label="Remover alimento" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <MealItemRow
                      key={item.id || idx}
                      index={idx}
                      {...item}
                      isDragging={draggedIndex === idx}
                      isDragOver={dragOverState?.index === idx && draggedIndex !== idx}
                      dragOverPosition={dragOverState?.index === idx && draggedIndex !== idx ? dragOverState.position : null}
                      onDragStart={(index) => setDraggedIndex(index)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverState(null);
                      }}
                      onDragOver={(e, index) => {
                        e.preventDefault();
                        if (e.dataTransfer) {
                          e.dataTransfer.dropEffect = 'move';
                        }
                        if (draggedIndex === null || draggedIndex === index) {
                          setDragOverState(null);
                          return;
                        }
                        const clientY = typeof e.clientY === 'number' ? e.clientY : (e.nativeEvent as MouseEvent)?.clientY ?? 0;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isBottomHalf = (clientY - rect.top) > (rect.height / 2);
                        const position = isBottomHalf ? 'bottom' : 'top';
                        setDragOverState({ index, position });
                      }}
                      onDragLeave={(e, index) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          if (dragOverState?.index === index) {
                            setDragOverState(null);
                          }
                        }
                      }}
                      onDrop={(e, index) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const source = draggedIndex !== null
                          ? draggedIndex
                          : (e.dataTransfer && e.dataTransfer.getData('text/plain') ? Number(e.dataTransfer.getData('text/plain')) : null);

                        if (source !== null && !isNaN(source)) {
                          const clientY = typeof e.clientY === 'number' ? e.clientY : (e.nativeEvent as MouseEvent)?.clientY ?? 0;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const isBottomHalf = (clientY - rect.top) > (rect.height / 2);
                          let target = isBottomHalf ? index + 1 : index;
                          if (source < target) {
                            target -= 1;
                          }
                          if (source !== target) {
                            onReorderItems?.(source, target);
                          }
                        }
                        setDraggedIndex(null);
                        setDragOverState(null);
                      }}
                      onQuantityChange={(newGrams) => onQuantityChange && onQuantityChange(idx, newGrams)}
                      onSubstitute={() => onSubstituteItem && onSubstituteItem(idx)}
                      onDuplicate={() => onDuplicateItem && onDuplicateItem(idx)}
                      onRemove={() => onRemoveItem && onRemoveItem(idx)}
                    />
                  ))}
                </TableBody>

              </Table>
            </div>
          )}
        </div>

        {/* Add Food Button */}
        <Button
          type="button"
          variant="secondary"
          size="standard"
          onClick={onAddFoodClick}
          className="w-full border-dashed border-border-control hover:border-primary/60 hover:bg-surface-hover text-text-primary font-semibold text-style-button-label-compact flex items-center justify-center gap-1.5"
        >
          <Plus size={14} className="text-success" />
          <span>Adicionar Alimento</span>
        </Button>

        {/* Barra de Proporção de Macronutrientes e Calorias da Refeição */}
        <MacroProportionBar
          proteinG={proteinG}
          carbsG={carbsG}
          fatsG={fatsG}
          kcal={displayKcal}
        />
      </div>

    </Surface>
  );
};

