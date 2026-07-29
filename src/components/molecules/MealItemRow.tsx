import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MealItemRowProps {
  id?: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  quantityGrams: number;
  onQuantityChange?: (newGrams: number) => void;
  onRemove?: () => void;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  name,
  kcal,
  protein,
  carbs,
  fats,
  quantityGrams,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between bg-warm-inner border border-warm-border rounded-xl p-3">
      <div>
        <div className="text-xs font-bold text-warm-charcoal">{name}</div>
        <div className="text-[11px] text-warm-secondary mt-0.5">
          {kcal} kcal • <span className="text-warm-rose font-bold">P: {protein}g</span> •{' '}
          <span className="text-warm-amber font-bold">C: {carbs}g</span> •{' '}
          <span className="text-warm-teal font-bold">G: {fats}g</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="bg-warm-card border border-warm-borderDark rounded-xl px-2.5 py-1 text-xs font-bold text-warm-charcoal">
          {quantityGrams} <span className="text-warm-muted font-normal">g</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remover ${name}`}
          className="text-warm-muted hover:text-warm-rose h-7 w-7 p-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

