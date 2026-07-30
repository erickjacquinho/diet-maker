'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Utensils, Plus, Search, Clock, Users, Check, BookOpen, Trash2, PlusCircle } from 'lucide-react';
import { CreateButton, Button, Input, Badge } from '@/components/atoms';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AutoKcalSection, TacoSearchInput, RecipeCard, RecipeIngredientRow } from '@/components/molecules';

import {
  Recipe,
  RecipeIngredient,
  getRecipesFromStorage,
  saveRecipeToStorage,
  deleteRecipeFromStorage,
  calculateRecipeNutrients,
} from '@/lib/recipesStore';
import { searchTacoFoods, FoodItem } from '@/lib/tacoStore';
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
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // TACO Search State inside Modal
  const [foodQuery, setFoodQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

  // Recipe Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Café da Manhã',
    servings: 2,
    instructions: '',
    ingredients: [] as RecipeIngredient[],
  });


  useEffect(() => {
    setRecipes(getRecipesFromStorage());
  }, []);

  const handleSearchFoods = (query: string) => {
    setFoodQuery(query);
    if (query.trim().length >= 2) {
      setSearchResults(searchTacoFoods(query).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleAddIngredient = (food: FoodItem) => {
    const defaultGrams = 100;
    const ratio = defaultGrams / 100;

    const newIng: RecipeIngredient = {
      foodId: food.id,
      name: food.name,
      amountGrams: defaultGrams,
      proteinG: Math.round((food.proteinG * ratio) * 10) / 10,
      carbsG: Math.round((food.carbsG * ratio) * 10) / 10,
      fatsG: Math.round((food.fatsG * ratio) * 10) / 10,
      kcal: Math.round(food.kcal * ratio),
    };

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIng],
    }));
    setFoodQuery('');
    setSearchResults([]);
  };

  const handleIngredientAmountChange = (index: number, newGrams: number) => {
    const safeGrams = Math.max(1, newGrams || 1);
    setFormData((prev) => {
      const updated = [...prev.ingredients];
      const ing = updated[index];
      const tacoRef = searchTacoFoods(ing.name)[0];

      if (tacoRef) {
        const ratio = safeGrams / 100;
        ing.amountGrams = safeGrams;
        ing.proteinG = Math.round((tacoRef.proteinG * ratio) * 10) / 10;
        ing.carbsG = Math.round((tacoRef.carbsG * ratio) * 10) / 10;
        ing.fatsG = Math.round((tacoRef.fatsG * ratio) * 10) / 10;
        ing.kcal = Math.round(tacoRef.kcal * ratio);
      } else {
        const ratio = safeGrams / (ing.amountGrams || 100);
        ing.amountGrams = safeGrams;
        ing.proteinG = Math.round((ing.proteinG * ratio) * 10) / 10;
        ing.carbsG = Math.round((ing.carbsG * ratio) * 10) / 10;
        ing.fatsG = Math.round((ing.fatsG * ratio) * 10) / 10;
        ing.kcal = Math.round(ing.kcal * ratio);
      }
      return { ...prev, ingredients: updated };
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingRecipeId(null);
    setFormData({
      name: '',
      category: 'Café da Manhã',
      servings: 2,
      instructions: '',
      ingredients: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setFormData({
      name: recipe.name,
      category: recipe.category,
      servings: recipe.servings,
      instructions: recipe.instructions,
      ingredients: [...recipe.ingredients],
    });
    setIsModalOpen(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Digite o nome da receita');
      return;
    }
    if (formData.ingredients.length === 0) {
      toast.error('Adicione pelo menos 1 ingrediente à receita');
      return;
    }

    const saved = saveRecipeToStorage({
      id: editingRecipeId || undefined,
      name: formData.name.trim(),
      category: formData.category,
      servings: Math.max(1, Number(formData.servings) || 1),
      instructions: formData.instructions.trim(),
      ingredients: formData.ingredients,
    });

    setRecipes(getRecipesFromStorage());
    setIsModalOpen(false);
    toast.success(editingRecipeId ? 'Receita atualizada com sucesso!' : 'Nova receita cadastrada!');
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

  // Calculate per-portion summary for current modal form
  const currentSummary = useMemo(() => {
    return calculateRecipeNutrients(formData.ingredients, formData.servings);
  }, [formData.ingredients, formData.servings]);

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Utensils size={22} className="text-warm-emerald" />
            <h1 className="font-black text-2xl text-warm-charcoal tracking-tight">Receitas Culinárias</h1>
          </div>
          <p className="text-xs text-warm-muted mt-1 font-medium">
            Catálogo de receitas preparadas com cálculo automático de macronutrientes por porção.
          </p>
        </div>
        <CreateButton onClick={handleOpenCreateModal}>
          Criar Nova Receita
        </CreateButton>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar receita por nome ou ingrediente..."
            className="pl-11 pr-4 bg-warm-card border-warm-border text-xs w-full"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-warm-charcoal text-white'
                  : 'bg-warm-card border border-warm-border text-warm-muted hover:text-warm-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredRecipes.length === 0 ? (
        <Card className="bg-warm-card border-warm-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <CardContent className="p-0 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-warm-inner border border-warm-border flex items-center justify-center mx-auto text-warm-muted">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-black text-base text-warm-charcoal">Nenhuma receita encontrada</h3>
              <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                Crie receitas culinárias personalizadas agrupando alimentos da TACO e calculando as calorias por porção.
              </p>
            </div>
            <CreateButton onClick={handleOpenCreateModal}>
              Criar Primeira Receita
            </CreateButton>

          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Modal Criar/Editar Receita */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-warm-card border-warm-border p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal">
              {editingRecipeId ? 'Editar Receita Culinária' : 'Nova Receita Culinária'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveRecipe} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Nome da Receita</label>
              <Input
                type="text"
                required
                placeholder="Ex: Bolo de Banana com Aveia e Whey"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-warm-muted block mb-1">Categoria</label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== 'Todas').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-warm-muted block mb-1">Rendimento (Porções)</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold"
                />
              </div>
            </div>

            {/* Ingredient Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-warm-charcoal block">Adicionar Ingredientes</label>
              <div className="relative">
                <TacoSearchInput
                  value={foodQuery}
                  onChange={(e) => handleSearchFoods(e.target.value)}
                  placeholder="Buscar ingrediente (ex: ovo, frango, aveia)..."
                  className="bg-warm-inner border-warm-border text-xs"
                />

                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-warm-card border border-warm-border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto p-1 space-y-1">
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleAddIngredient(food)}
                        className="w-full text-left p-2 hover:bg-warm-inner rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-warm-charcoal truncate">{food.name}</span>
                        <span className="text-[10px] text-warm-emerald font-bold shrink-0">{food.kcal} kcal/100g</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* Ingredients List */}
            {formData.ingredients.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-warm-charcoal uppercase tracking-wider block">
                  Ingredientes Adicionados ({formData.ingredients.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.ingredients.map((ing, idx) => (
                    <RecipeIngredientRow
                      key={idx}
                      ingredient={ing}
                      onAmountChange={(amt) => handleIngredientAmountChange(idx, amt)}
                      onRemove={() => handleRemoveIngredient(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Auto Kcal Section (Per Portion Summary - Read Only Display) */}
            <AutoKcalSection
              title={`Macros Calculados por Porção (1 de ${formData.servings})`}
              proteinG={currentSummary.portionProteinG}
              carbsG={currentSummary.portionCarbsG}
              fatsG={currentSummary.portionFatsG}
              readOnly
            />


            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Modo de Preparo / Orientações</label>
              <textarea
                rows={3}
                placeholder="Descreva o passo a passo do preparo da receita..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 bg-warm-inner border border-warm-border rounded-xl text-xs text-warm-charcoal focus:outline-none focus:ring-2 focus:ring-warm-charcoal resize-none"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="emerald" size="sm" className="flex-1 text-xs font-bold">
                Salvar Receita
              </Button>

            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
