'use client';

import React, { useState } from 'react';
import { Badge, Button, Surface, EditIconButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { MealItemRow, MealItemRowProps } from '../molecules';
import { Copy, Percent, Trash2, Plus, Clock, Check } from 'lucide-react';
import { calculatePresetCalories } from '@/lib/presetUtils';

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
  onScale?: () => void;
  onDeleteMeal?: () => void;
  onRemoveItem?: (index: number) => void;
  onQuantityChange?: (index: number, newGrams: number) => void;
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
  onScale,
  onDeleteMeal,
  onRemoveItem,
  onQuantityChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempTime, setTempTime] = useState(time);

  const computedKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
  const displayKcal = computedKcal > 0 ? computedKcal : kcal;

  const handleSaveTitleTime = () => {
    if (onTitleChange && tempTitle.trim()) onTitleChange(tempTitle.trim());
    if (onTimeChange && tempTime.trim()) onTimeChange(tempTime.trim());
    setIsEditingTitle(false);
  };

  return (
    <Surface variant="default" className="p-6 flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-4 flex-1">
        {/* Meal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                size="compact"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="w-36 text-style-field-value font-bold"
                placeholder="Nome da refeição"
              />
              <Input
                type="text"
                size="compact"
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                className="w-20 text-style-field-value font-bold text-center"
                placeholder="08:00"
              />
              <Button
                size="compact"
                variant="primary"
                onClick={handleSaveTitleTime}
                className="h-8 px-2"
              >
                <Check size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <h4 className="text-style-body font-bold text-text-primary">{title}</h4>
              <span className="text-style-legal text-text-muted bg-surface-subtle border border-border-subtle px-2.5 py-0.5 rounded-round font-mono flex items-center gap-1">
                <Clock size={11} />
                <span>{time}</span>
              </span>
              <EditIconButton
                size="compact"
                onClick={() => {
                  setTempTitle(title);
                  setTempTime(time);
                  setIsEditingTitle(true);
                }}
                title="Editar nome e horário"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-style-legal font-bold shrink-0">
            <Badge variant="protein">P: {proteinG}g</Badge>
            <Badge variant="carbohydrate">C: {carbsG}g</Badge>
            <Badge variant="fat">G: {fatsG}g</Badge>
            <Badge variant="kcal">{displayKcal} kcal</Badge>
          </div>
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-2 min-h-[50px]">
          {items.length === 0 ? (
            <Surface variant="subtle" className="p-4 text-center text-text-muted text-style-legal italic">
              Nenhum alimento nesta refeição. Clique em "+ Adicionar Alimento" abaixo.
            </Surface>
          ) : (
            items.map((item, idx) => (
              <MealItemRow
                key={idx}
                {...item}
                onQuantityChange={(newGrams) => onQuantityChange && onQuantityChange(idx, newGrams)}
                onRemove={() => onRemoveItem && onRemoveItem(idx)}
              />
            ))
          )}
        </div>

        {/* Add Food Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={onAddFoodClick}
          className="w-full border-dashed border-border-hover bg-surface-subtle hover:bg-surface-hover text-text-primary font-bold text-style-legal py-2 rounded-control flex items-center justify-center gap-1.5"
        >
          <Plus size={14} className="text-success" />
          <span>Adicionar Alimento da Base TACO</span>
        </Button>
      </div>

      {/* Meal Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-style-legal">
        <div className="flex gap-2">
          <Button onClick={onDuplicate} variant="secondary" size="compact" className="flex items-center gap-1 text-style-legal">
            <Copy size={12} />
            <span>Duplicar</span>
          </Button>
          <Button onClick={onScale} variant="secondary" size="compact" className="flex items-center gap-1 text-style-legal">
            <Percent size={12} />
            <span>Escalar</span>
          </Button>
        </div>
        <Button onClick={onDeleteMeal} variant="destructive" size="compact" className="flex items-center gap-1 text-style-legal">
          <Trash2 size={12} />
          <span>Excluir</span>
        </Button>
      </div>
    </Surface>
  );
};

