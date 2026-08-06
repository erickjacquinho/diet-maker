import React from 'react';
import { Button, Badge, EditIconButton, DeleteIconButton, Surface } from '@/components/atoms';
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
    <Surface variant="default" density="highlight" className="hover:border-success/40 transition-colors duration-standard flex flex-col justify-between gap-4">
      <div className="p-0 gap-3.5 flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-style-legal font-bold bg-surface-subtle border-border-subtle text-text-primary">
              {recipe.category}
            </Badge>
            <div className="flex items-center gap-1 text-style-legal text-text-muted font-medium">
              <Users size={12} />
              <span>{recipe.servings} porções</span>
            </div>

          </div>

          <h3 className="font-bold text-style-body-small text-text-primary leading-snug">{recipe.name}</h3>

          {recipe.instructions && (
            <p className="text-style-legal text-text-muted leading-relaxed line-clamp-2 italic">
              "{recipe.instructions}"
            </p>
          )}
        </div>

        {/* Macros Per Portion */}
        <div className="flex flex-col gap-1.5">
          <div className="text-style-legal font-bold text-text-muted tracking-overline">
            Valores por 1 porção ({recipe.ingredients.length} ingredientes)
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-surface-subtle border border-border-subtle rounded-control text-center">
            <div>
              <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Kcal</span>
              <span className="font-bold text-style-legal text-success">{summary.portionKcal}</span>
            </div>
            <div>
              <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Prot</span>
              <span className="font-bold text-style-legal text-macro-protein">{summary.portionProteinG}g</span>
            </div>
            <div>
              <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Carb</span>
              <span className="font-bold text-style-legal text-warning">{summary.portionCarbsG}g</span>
            </div>
            <div>
              <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Gord</span>
              <span className="font-bold text-style-legal text-success">{summary.portionFatsG}g</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-style-legal gap-2">
          {onInsert && (
            <Button
              type="button"
              onClick={onInsert}
              variant="primary"
              size="compact"
              className="flex-1 font-bold text-style-legal flex items-center justify-center gap-1.5 h-8"
            >
              {isInserted ? <Check size={14} /> : <PlusCircle size={14} />}
              <span>{isInserted ? 'Inserido!' : 'Prescrever'}</span>
            </Button>
          )}

          <div className="flex items-center gap-1.5">
            {onEdit && <EditIconButton title="Editar Receita" onClick={onEdit} />}
            {onDelete && <DeleteIconButton title="Excluir Receita" onClick={onDelete} />}
          </div>

        </div>
      </div>
    </Surface>
  );
};
