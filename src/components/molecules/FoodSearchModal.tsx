'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Utensils, Check } from 'lucide-react';
import { searchTacoFoods, getAllFoods, FoodItem } from '@/lib/tacoStore';
import { calculatePresetCalories } from '@/lib/presetUtils';

export interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealTitle?: string;
  onAddFood: (foodItem: {
    foodId?: string;
    name: string;
    quantityGrams: number;
    protein: number;
    carbs: number;
    fats: number;
    kcal: number;
  }) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  mealTitle = 'Refeição',
  onAddFood,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantityGrams, setQuantityGrams] = useState<number>(100);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      // Return top 15 popular foods from database when search is empty
      return getAllFoods().slice(0, 15);
    }
    return searchTacoFoods(query).slice(0, 30);
  }, [query]);

  const calculatedMacros = useMemo(() => {
    if (!selectedFood) return { protein: 0, carbs: 0, fats: 0, kcal: 0 };

    const ratio = Math.max(0, quantityGrams) / 100;
    const protein = Math.round((selectedFood.proteinG * ratio) * 10) / 10;
    const carbs = Math.round((selectedFood.carbsG * ratio) * 10) / 10;
    const fats = Math.round((selectedFood.fatsG * ratio) * 10) / 10;
    const kcal = calculatePresetCalories(protein, carbs, fats);

    return { protein, carbs, fats, kcal };
  }, [selectedFood, quantityGrams]);

  const handleConfirmAdd = () => {
    if (!selectedFood) return;

    onAddFood({
      foodId: selectedFood.id,
      name: `${selectedFood.name} (${selectedFood.preparo || 'Cozido/In Natura'})`,
      quantityGrams: Math.max(1, Number(quantityGrams) || 100),
      protein: calculatedMacros.protein,
      carbs: calculatedMacros.carbs,
      fats: calculatedMacros.fats,
      kcal: calculatedMacros.kcal,
    });

    // Reset selection and close
    setSelectedFood(null);
    setQuantityGrams(100);
    setQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-warm-card border-warm-border p-6 rounded-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-warm-border pb-3 shrink-0">
          <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
            <Utensils size={18} className="text-warm-emerald" />
            <span>Adicionar Alimento em "{mealTitle}"</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-warm-muted">
            Busque na base TACO de alimentos e insira a gramatura desejada.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative pt-3 shrink-0">
          <Input
            type="text"
            placeholder="Digite o nome do alimento (ex: Frango, Arroz, Ovo, Aveia, Banana)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-warm-inner border-warm-border text-xs text-warm-charcoal font-semibold"
            autoFocus
          />
          <Search size={14} className="absolute left-3 top-6 text-warm-muted" />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[300px] border border-warm-border rounded-xl p-2 my-3 space-y-1.5 bg-warm-inner/50">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-warm-muted">
              Nenhum alimento encontrado para "{query}". Tente buscar por termos genéricos como "Frango", "Arroz" ou "Batata".
            </div>
          ) : (
            searchResults.map((food) => {
              const isSelected = selectedFood?.id === food.id;
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-warm-card border-warm-emerald ring-2 ring-warm-emerald/20 shadow-xs'
                      : 'bg-warm-card border-warm-border hover:border-warm-borderDark'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-warm-charcoal flex items-center space-x-2">
                      <span>{food.name}</span>
                      <Badge variant="outline" className="text-[9px] font-semibold border-warm-border text-warm-muted">
                        {food.category}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-warm-muted flex items-center space-x-2">
                      <span className="text-blue-600 font-semibold">P: {food.proteinG}g</span>
                      <span>•</span>
                      <span className="text-amber-600 font-semibold">C: {food.carbsG}g</span>
                      <span>•</span>
                      <span className="text-teal-600 font-semibold">G: {food.fatsG}g</span>
                      <span>•</span>
                      <span>{food.kcal} kcal (por 100g)</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-warm-emerald text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Selected Food Grammage & Confirmation Section */}
        {selectedFood ? (
          <div className="p-4 bg-warm-inner border border-warm-border rounded-xl space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-warm-muted uppercase block">Alimento Selecionado</span>
                <span className="text-xs font-black text-warm-charcoal">{selectedFood.name}</span>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-warm-charcoal whitespace-nowrap">Gramatura:</label>
                <div className="flex items-center space-x-1">
                  <Input
                    type="number"
                    min={1}
                    max={5000}
                    value={quantityGrams}
                    onChange={(e) => setQuantityGrams(Number(e.target.value))}
                    className="w-24 bg-warm-card border-warm-border text-xs font-black text-center"
                  />
                  <span className="text-xs font-bold text-warm-muted">g</span>
                </div>
              </div>
            </div>

            {/* Calculated Macros Preview */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-warm-border text-center">
              <div className="bg-warm-card p-2 rounded-lg border border-warm-border">
                <span className="text-[9px] font-bold text-warm-muted block uppercase">Proteínas</span>
                <span className="font-black text-xs text-blue-600">{calculatedMacros.protein}g</span>
              </div>
              <div className="bg-warm-card p-2 rounded-lg border border-warm-border">
                <span className="text-[9px] font-bold text-warm-muted block uppercase">Carboidratos</span>
                <span className="font-black text-xs text-amber-600">{calculatedMacros.carbs}g</span>
              </div>
              <div className="bg-warm-card p-2 rounded-lg border border-warm-border">
                <span className="text-[9px] font-bold text-warm-muted block uppercase">Gorduras</span>
                <span className="font-black text-xs text-teal-600">{calculatedMacros.fats}g</span>
              </div>
              <div className="bg-warm-card p-2 rounded-lg border border-warm-border">
                <span className="text-[9px] font-bold text-warm-muted block uppercase">Calorias</span>
                <span className="font-black text-xs text-warm-charcoal">{calculatedMacros.kcal} kcal</span>
              </div>
            </div>

            <Button
              onClick={handleConfirmAdd}
              variant="emerald"
              className="w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2"
            >
              <Plus size={15} />
              <span>Adicionar Alimento ({quantityGrams}g)</span>
            </Button>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-warm-muted italic shrink-0">
            Selecione um alimento da lista acima para ajustar a gramatura.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
