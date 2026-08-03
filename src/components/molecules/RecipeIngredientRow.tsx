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
    <div className="flex items-center justify-between bg-surface-subtle border border-border-subtle rounded-control p-3 gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-style-legal font-bold text-text-primary truncate">{ingredient.name}</div>
        <div className="text-style-legal text-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-macro-protein font-bold">P: {ingredient.proteinG}g</span>
          <span>•</span>
          <span className="text-warning font-bold">C: {ingredient.carbsG}g</span>
          <span>•</span>
          <span className="text-success font-bold">G: {ingredient.fatsG}g</span>
          <span>•</span>
          <span className="text-success font-bold">{ingredient.kcal} kcal</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            value={ingredient.amountGrams}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-16 h-8 text-center text-style-legal font-bold bg-surface border-border-subtle px-1"
          />
          <span className="text-style-legal font-bold text-text-muted">g</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remover ${ingredient.name}`}
          className="text-text-muted hover:text-error h-7 w-7 p-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
