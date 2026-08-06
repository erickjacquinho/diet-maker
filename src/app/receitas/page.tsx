'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Utensils, Plus, Search, Clock, Users, Check, BookOpen, Trash2, PlusCircle } from 'lucide-react';
import { CreateButton, Button, Badge } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreateRecipeModal } from '@/components/molecules/CreateRecipeModal';
import { RecipeCard } from '@/components/molecules/RecipeCard';

import {
  Recipe,
  getRecipesFromStorage,
  saveRecipeToStorage,
  deleteRecipeFromStorage,
} from '@/lib/recipesStore';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(getRecipesFromStorage());
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleSaveRecipe = (data: { id?: string; name: string; category: string; servings: number; instructions: string; ingredients: Recipe['ingredients'] }) => {
    saveRecipeToStorage(data);
    setRecipes(getRecipesFromStorage());
    setIsModalOpen(false);
    toast.success(data.id ? 'Receita atualizada com sucesso!' : 'Nova receita cadastrada!');
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      deleteRecipeFromStorage(id);
      setRecipes(getRecipesFromStorage());
      toast.success('Receita excluída do catálogo');
    }
  };

  const handleInsertInDiet = (recipeId: string) => {
    setInsertedId(recipeId);
    toast.success('Porção da receita pronta para inserção na prescrição!');
    setTimeout(() => setInsertedId(null), 2500);
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
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
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
        <CreateButton onClick={handleOpenCreateModal}>
          Criar Nova Receita
        </CreateButton>
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
            className="pl-11 pr-4 bg-surface border-border-subtle text-style-legal w-full"
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
      {filteredRecipes.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-12 text-center max-w-md mx-auto flex flex-col gap-4 my-8">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhuma receita encontrada</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                Crie receitas culinárias personalizadas agrupando alimentos da TACO e calculando as calorias por porção.
              </p>
            </div>
            <CreateButton onClick={handleOpenCreateModal}>
              Criar Primeira Receita
            </CreateButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isInserted={insertedId === recipe.id}
              onInsert={() => handleInsertInDiet(recipe.id)}
              onEdit={() => handleOpenEditModal(recipe)}
              onDelete={() => handleDeleteRecipe(recipe.id)}
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
    </div>
  );
}
