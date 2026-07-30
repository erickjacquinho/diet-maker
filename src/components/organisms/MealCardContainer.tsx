'use client';

import React, { useState } from 'react';
import { Badge } from '../atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MealItemRow, MealItemRowProps } from '../molecules';
import { Copy, Percent, Trash2, Plus, Clock, Pencil, Check } from 'lucide-react';
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
    <Card className="bg-warm-card border-warm-border rounded-2xl p-0 shadow-xs flex flex-col justify-between">
      <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Meal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-warm-border gap-2">
            {isEditingTitle ? (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="h-8 text-xs font-bold bg-warm-inner border-warm-border w-36"
                  placeholder="Nome da refeição"
                />
                <Input
                  type="text"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="h-8 text-xs font-bold bg-warm-inner border-warm-border w-20 text-center"
                  placeholder="08:00"
                />
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={handleSaveTitleTime}
                  className="h-8 px-2"
                >
                  <Check size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <h4 className="text-base font-black text-warm-charcoal">{title}</h4>
                <span className="text-xs text-warm-muted bg-warm-inner border border-warm-border px-2.5 py-0.5 rounded-full font-mono flex items-center space-x-1">
                  <Clock size={11} />
                  <span>{time}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempTitle(title);
                    setTempTime(time);
                    setIsEditingTitle(true);
                  }}
                  className="text-warm-muted hover:text-warm-charcoal p-1 rounded-md transition-colors"
                  title="Editar nome e horário"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-xs font-bold shrink-0">
              <Badge variant="blue">P: {proteinG}g</Badge>
              <Badge variant="amber">C: {carbsG}g</Badge>
              <Badge variant="teal">G: {fatsG}g</Badge>
              <Badge variant="amber">{displayKcal} kcal</Badge>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 min-h-[50px]">
            {items.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-warm-border rounded-xl text-warm-muted text-xs italic">
                Nenhum alimento nesta refeição. Clique em "+ Adicionar Alimento" abaixo.
              </div>
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
            variant="outline"
            onClick={onAddFoodClick}
            className="w-full border-dashed border-warm-borderDark bg-warm-inner/60 hover:bg-warm-inner text-warm-charcoal font-bold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5"
          >
            <Plus size={14} className="text-warm-emerald" />
            <span>+ Adicionar Alimento da Base TACO</span>
          </Button>
        </div>

        {/* Meal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-warm-border text-xs">
          <div className="flex space-x-2">
            <Button onClick={onDuplicate} variant="secondary" size="sm" className="flex items-center space-x-1 text-xs">
              <Copy size={12} />
              <span>Duplicar</span>
            </Button>
            <Button onClick={onScale} variant="secondary" size="sm" className="flex items-center space-x-1 text-xs">
              <Percent size={12} />
              <span>Escalar</span>
            </Button>
          </div>
          <Button onClick={onDeleteMeal} variant="destructive" size="sm" className="flex items-center space-x-1 text-xs">
            <Trash2 size={12} />
            <span>Excluir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
