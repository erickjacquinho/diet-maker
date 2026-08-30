import React from 'react';
import { DeleteIconButton } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          <Badge variant="outline" className="border-macro-protein-border bg-macro-protein-soft text-macro-protein font-bold text-style-legal px-1.5 py-0">P: {ingredient.proteinG}g</Badge>
          <Badge variant="outline" className="border-macro-carbohydrate-border bg-macro-carbohydrate-soft text-macro-carbohydrate font-bold text-style-legal px-1.5 py-0">C: {ingredient.carbsG}g</Badge>
          <Badge variant="outline" className="border-macro-fat-border bg-macro-fat-soft text-macro-fat font-bold text-style-legal px-1.5 py-0">G: {ingredient.fatsG}g</Badge>
          <Badge variant="outline" className="border-border-subtle bg-surface-subtle text-text-muted font-bold text-style-legal px-1.5 py-0">{ingredient.kcal} kcal</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            size="compact"
            value={ingredient.amountGrams}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-16 text-center text-style-field-value font-bold px-1"
          />
          <span className="text-style-legal font-bold text-text-muted">g</span>
        </div>

        <DeleteIconButton
          size="compact"
          onClick={onRemove}
          title={`Remover ${ingredient.name}`}
          aria-label={`Remover ${ingredient.name}`}
        />
      </div>
    </div>
  );
};
