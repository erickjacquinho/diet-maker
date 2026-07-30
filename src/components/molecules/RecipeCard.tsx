import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, Badge, EditIconButton, DeleteIconButton } from '@/components/atoms';
import { Users, PlusCircle, Check } from 'lucide-react';
import { Recipe, calculateRecipeNutrients } from '@/lib/recipesStore';



export interface RecipeCardProps {
  recipe: Recipe;
  isInserted?: boolean;
  onInsert?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isInserted = false,
  onInsert,
  onEdit,
  onDelete,
}) => {
  const summary = calculateRecipeNutrients(recipe.ingredients, recipe.servings);

  return (
    <Card className="bg-warm-card border-warm-border rounded-2xl p-5 hover:border-warm-emerald/40 transition-all flex flex-col justify-between space-y-4">
      <CardContent className="p-0 space-y-3.5 flex flex-col justify-between h-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] font-bold bg-warm-inner border-warm-border text-warm-charcoal">
              {recipe.category}
            </Badge>
            <div className="flex items-center space-x-1 text-[11px] text-warm-muted font-medium">
              <Users size={12} />
              <span>{recipe.servings} porções</span>
            </div>

          </div>

          <h3 className="font-bold text-sm text-warm-charcoal leading-snug">{recipe.name}</h3>

          {recipe.instructions && (
            <p className="text-xs text-warm-muted leading-relaxed line-clamp-2 italic">
              "{recipe.instructions}"
            </p>
          )}
        </div>

        {/* Macros Per Portion */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-extrabold text-warm-muted uppercase tracking-wider">
            Valores por 1 porção ({recipe.ingredients.length} ingredientes)
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-warm-inner border border-warm-border rounded-xl text-center">
            <div>
              <span className="text-[9px] font-bold text-warm-muted block uppercase">Kcal</span>
              <span className="font-black text-xs text-warm-emerald">{summary.portionKcal}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-warm-muted block uppercase">Prot</span>
              <span className="font-black text-xs text-blue-600">{summary.portionProteinG}g</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-warm-muted block uppercase">Carb</span>
              <span className="font-black text-xs text-amber-600">{summary.portionCarbsG}g</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-warm-muted block uppercase">Gord</span>
              <span className="font-black text-xs text-emerald-600">{summary.portionFatsG}g</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-warm-border text-xs gap-2">
          {onInsert && (
            <Button
              type="button"
              onClick={onInsert}
              variant="emerald"
              size="sm"
              className="flex-1 font-bold text-xs flex items-center justify-center space-x-1.5 h-8"
            >
              {isInserted ? <Check size={14} /> : <PlusCircle size={14} />}
              <span>{isInserted ? 'Inserido!' : 'Prescrever'}</span>
            </Button>
          )}

          <div className="flex items-center space-x-1.5">
            {onEdit && <EditIconButton title="Editar Receita" onClick={onEdit} />}
            {onDelete && <DeleteIconButton title="Excluir Receita" onClick={onDelete} />}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
