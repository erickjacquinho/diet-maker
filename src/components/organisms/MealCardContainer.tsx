import React from 'react';
import { Badge } from '../atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MealItemRow, MealItemRowProps, TacoSearchInput } from '../molecules';
import { Copy, Percent, Trash2 } from 'lucide-react';

export interface MealCardContainerProps {
  id?: string;
  title: string;
  time: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  items: MealItemRowProps[];
  onDuplicate?: () => void;
  onScale?: () => void;
  onDeleteMeal?: () => void;
  onRemoveItem?: (index: number) => void;
}

export const MealCardContainer: React.FC<MealCardContainerProps> = ({
  title,
  time,
  kcal,
  proteinG,
  carbsG,
  fatsG,
  items,
  onDuplicate,
  onScale,
  onDeleteMeal,
  onRemoveItem,
}) => {
  return (
    <Card className="bg-warm-card border-warm-border rounded-2xl p-0">
      <CardContent className="p-6 space-y-4">
        {/* Meal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-warm-border">
          <div className="flex items-center space-x-2.5">
            <h4 className="text-base font-black text-warm-charcoal">{title}</h4>
            <span className="text-xs text-warm-muted bg-warm-inner border border-warm-border px-2.5 py-0.5 rounded-full font-mono">
              {time}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold">
            <Badge variant="amber">{kcal} kcal</Badge>
            <Badge variant="rose">P: {proteinG}g</Badge>
            <Badge variant="amber">C: {carbsG}g</Badge>
            <Badge variant="teal">G: {fatsG}g</Badge>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <MealItemRow
              key={idx}
              {...item}
              onRemove={() => onRemoveItem && onRemoveItem(idx)}
            />
          ))}
        </div>

        {/* Search Input */}
        <TacoSearchInput />

        {/* Meal Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-warm-border text-xs">
          <div className="flex space-x-2">
            <Button onClick={onDuplicate} variant="secondary" size="sm" className="flex items-center space-x-1">
              <Copy size={12} />
              <span>Duplicar</span>
            </Button>
            <Button onClick={onScale} variant="secondary" size="sm" className="flex items-center space-x-1">
              <Percent size={12} />
              <span>Escalar</span>
            </Button>
          </div>
          <Button onClick={onDeleteMeal} variant="destructive" size="sm" className="flex items-center space-x-1">
            <Trash2 size={12} />
            <span>Excluir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

