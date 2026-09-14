'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Utensils, Search, BookOpen, Archive } from 'lucide-react';
import { CreateButton, Button, HoldToDeleteButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CreateRecipeModal } from '@/components/molecules/CreateRecipeModal';
import { RecipeCard } from '@/components/molecules/RecipeCard';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { toRecipe, type Recipe } from '@/lib/library-ui-adapter';
import { toast } from 'sonner';

const CATEGORIES = [
  'Todas',
  'Café da Manhã',
  'Almoço & Jantar',
  'Lanches & Snacks',
  'Sobremesas Fit',
  'Bebidas & Shakes',
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [archivedRecipeCount, setArchivedRecipeCount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipePendingAction, setRecipePendingAction] = useState<{ recipe: Recipe; action: 'restore' | 'delete' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshRecipes = async (includeArchived = showArchived): Promise<number | null> => {
    setIsLoading(true);
    try {
      const application = await getBrowserLibraryApplication();
      const allRecipes = (await application.listRecipes({ includeArchived: true })).map(toRecipe);
      const nextRecipes = allRecipes
        .filter((recipe) => includeArchived ? recipe.status === 'ARCHIVED' : recipe.status !== 'ARCHIVED');
      setRecipes(nextRecipes);
      setArchivedRecipeCount(allRecipes.filter((recipe) => recipe.status === 'ARCHIVED').length);
      setErrorMessage(null);
      return nextRecipes.length;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'As receitas não puderam ser carregadas.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshRecipes(showArchived);
  }, [showArchived]);

  const handleOpenCreateModal = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleSaveRecipe = async (data: { id?: string; name: string; category: string; servings: number; instructions: string; ingredients: Recipe['ingredients'] }) => {
    try {
      const application = await getBrowserLibraryApplication();
      const input = {
        name: data.name,
        category: data.category,
        instructions: data.instructions,
        yieldPortions: String(data.servings),
        ingredients: data.ingredients.map((ingredient) => ({ sourceType: ingredient.foodId.startsWith('taco-') ? 'SYSTEM_TACO' as const : 'ACCOUNT_CUSTOM' as const, sourceId: ingredient.foodId, quantity: String(ingredient.amountGrams), unit: 'g' as const })),
      };
      if (data.id) {
        const current = recipes.find((recipe) => recipe.id === data.id);
        await application.updateRecipe(data.id, current?.libraryVersion ?? 1, input);
      } else {
        await application.createRecipe(input);
      }
      await refreshRecipes(showArchived);
      setIsModalOpen(false);
      toast.success(data.id ? 'Receita atualizada com sucesso!' : 'Nova receita cadastrada!');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'A receita não pôde ser salva.');
    }
  };

  const handleConfirmRecipeAction = async () => {
    if (!recipePendingAction) return;
    const { recipe, action } = recipePendingAction;
    try {
      const application = await getBrowserLibraryApplication();
      if (action === 'restore') {
        await application.restoreRecipe(recipe.id, recipe.libraryVersion ?? 1);
        toast.success('Receita restaurada.');
      } else {
        await application.deleteRecipe(recipe.id, recipe.libraryVersion ?? 1);
        setRecipePendingAction(null);
        await refreshRecipes(showArchived);
        toast.success('Receita excluída do catálogo', {
          duration: 6000,
          action: {
            label: 'Desfazer',
            onClick: () => {
              void (async () => {
                try {
                  const restoredRecipe = await application.createRecipe({
                    name: recipe.name,
                    category: recipe.category,
                    instructions: recipe.instructions,
                    prepTimeMinutes: recipe.prepTimeMinutes,
                    yieldPortions: String(recipe.servings),
                    ingredients: recipe.ingredients.map((ingredient) => ({
                      sourceType: ingredient.foodId.startsWith('taco-') ? 'SYSTEM_TACO' as const : 'ACCOUNT_CUSTOM' as const,
                      sourceId: ingredient.foodId,
                      quantity: String(ingredient.amountGrams),
                      unit: 'g' as const,
                    })),
                  });
                  if (recipe.status === 'ARCHIVED') {
                    await application.archiveRecipe(restoredRecipe.id, restoredRecipe.version);
                  }
                  await refreshRecipes(showArchived);
                  toast.success('Receita restaurada.');
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : 'A receita não pôde ser restaurada.');
                }
              })();
            },
          },
        });
        return;
      }
      const remainingRecipes = await refreshRecipes(showArchived);
      if (action === 'restore' && showArchived && remainingRecipes === 0) {
        setShowArchived(false);
      }
      setRecipePendingAction(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'A receita não pôde ser excluída.');
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'Todas' || r.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [recipes, searchTerm, selectedCategory]);

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Utensils size={22} className="text-success" />
            <h1 className="font-bold text-style-section-title text-text-primary tracking-tight">Receitas Culinárias</h1>
          </div>
          <p className="text-style-legal text-text-muted mt-1 font-medium">
            Catálogo de receitas preparadas com cálculo automático de macronutrientes por porção.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="standard"
            aria-pressed={showArchived}
            disabled={!showArchived && archivedRecipeCount === 0}
            onClick={() => setShowArchived((current) => !current)}
            className="gap-1.5"
          >
            <Archive size={14} aria-hidden="true" />
            <span>{showArchived ? 'Ver ativas' : 'Arquivados'}</span>
          </Button>
          <CreateButton onClick={handleOpenCreateModal}>
            Criar Nova Receita
          </CreateButton>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar receita por nome ou ingrediente..."
            className="pl-11 pr-4 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-auto">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'secondary'}
              size="compact"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap cursor-pointer"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {errorMessage && <p role="alert" className="text-style-body-secondary text-error">{errorMessage}</p>}
      {isLoading ? (
        <div role="status" className="rounded-control border border-border-subtle bg-surface-subtle p-6 text-text-muted">Carregando receitas…</div>
      ) : filteredRecipes.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-12 text-center max-w-md mx-auto flex flex-col gap-4 my-8">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">
                {showArchived ? 'Nenhuma receita arquivada' : 'Nenhuma receita encontrada'}
              </h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                {showArchived
                  ? 'Não há receitas arquivadas neste catálogo.'
                  : 'Crie receitas culinárias personalizadas agrupando alimentos da TACO e calculando as calorias por porção.'}
              </p>
            </div>
            {!showArchived && (
              <CreateButton onClick={handleOpenCreateModal}>
                Criar Primeira Receita
              </CreateButton>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={showArchived ? undefined : () => handleOpenEditModal(recipe)}
              onRestore={showArchived ? () => setRecipePendingAction({ recipe, action: 'restore' }) : undefined}
              onDelete={() => setRecipePendingAction({ recipe, action: 'delete' })}
            />
          ))}
        </div>
      )}

      <CreateRecipeModal
        open={isModalOpen}
        recipe={editingRecipe}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveRecipe}
      />

      <Dialog open={!!recipePendingAction} onOpenChange={(open) => !open && setRecipePendingAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{recipePendingAction?.action === 'restore' ? 'Restaurar Receita' : 'Excluir Receita'}</DialogTitle>
            <DialogDescription>
              {recipePendingAction?.action === 'restore'
                ? `A receita "${recipePendingAction.recipe.name}" voltará a aparecer nas receitas ativas.`
                : `Tem certeza que deseja excluir a receita "${recipePendingAction?.recipe.name}"? Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRecipePendingAction(null)}>
              Cancelar
            </Button>
            {recipePendingAction?.action === 'restore' ? (
              <Button variant="primary" onClick={handleConfirmRecipeAction}>
                Restaurar Receita
              </Button>
            ) : (
              <HoldToDeleteButton onConfirm={handleConfirmRecipeAction} size="compact">
                Excluir Receita
              </HoldToDeleteButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
