import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Input } from '@/components/atoms';
import { RecipeIngredient } from '@/lib/recipesStore';


export interface RecipeIngredientRowProps {
  ingredient: RecipeIngredient;
  onAmountChange: (amountGrams: number) => void;
  onRemove: () => void;
}

export const RecipeIngredientRow: React.FC<RecipeIngredientRowProps> = ({
  ingredient,
  onAmountChange,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between bg-warm-inner border border-warm-border rounded-xl p-3 gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-warm-charcoal truncate">{ingredient.name}</div>
        <div className="text-[10px] text-warm-muted mt-0.5 flex items-center space-x-1.5 flex-wrap">
          <span className="text-blue-600 font-bold">P: {ingredient.proteinG}g</span>
          <span>•</span>
          <span className="text-amber-600 font-bold">C: {ingredient.carbsG}g</span>
          <span>•</span>
          <span className="text-emerald-600 font-bold">G: {ingredient.fatsG}g</span>
          <span>•</span>
          <span className="text-warm-emerald font-black">{ingredient.kcal} kcal</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            min={1}
            value={ingredient.amountGrams}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-16 h-8 text-center text-xs font-bold bg-warm-card border-warm-border px-1"
          />
          <span className="text-xs font-bold text-warm-muted">g</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remover ${ingredient.name}`}
          className="text-warm-muted hover:text-rose-600 h-7 w-7 p-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
