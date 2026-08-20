'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Utensils } from 'lucide-react';
import { searchTacoFoods, getAllFoods, FoodItem } from '@/lib/tacoStore';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { FoodSearchResultsList } from './food-search/FoodSearchResultsList';

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

    setSelectedFood(null);
    setQuantityGrams(100);
    setQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <Utensils size={18} className="text-success" />
            <span>Adicionar Alimento em "{mealTitle}"</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            Busque na base TACO de alimentos e insira a gramatura desejada.
          </DialogDescription>
        </DialogHeader>

        <div className="relative pt-3 shrink-0">
          <Input
            type="text"
            placeholder="Digite o nome do alimento (ex: Frango, Arroz, Ovo, Aveia, Banana)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 text-style-field-value"
            autoFocus
          />
          <Search size={14} className="absolute left-3 top-6 text-text-muted" />
        </div>

        <FoodSearchResultsList
          searchResults={searchResults}
          selectedFood={selectedFood}
          query={query}
          onSelectFood={setSelectedFood}
        />

        {selectedFood ? (
          <div className="p-4 bg-surface-subtle border border-border-subtle rounded-control flex flex-col gap-3 shrink-0">
            <div className="flex flex-col flex-row items-center justify-between gap-3">
              <div>
                <span className="text-style-legal font-bold text-text-muted tracking-label block">Alimento Selecionado</span>
                <span className="text-style-legal font-bold text-text-primary">{selectedFood.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-style-legal font-bold text-text-primary whitespace-nowrap">Gramatura:</label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={5000}
                    size="compact"
                    value={quantityGrams}
                    onChange={(e) => setQuantityGrams(Number(e.target.value))}
                    className="w-24 text-style-field-value font-bold text-center"
                  />
                  <span className="text-style-legal font-bold text-text-muted">g</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border-subtle text-center">
              <div className="bg-surface p-2 rounded-control border border-border-subtle">
                <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Proteínas</span>
                <span className="font-bold text-style-legal text-macro-protein">{calculatedMacros.protein}g</span>
              </div>
              <div className="bg-surface p-2 rounded-control border border-border-subtle">
                <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Carboidratos</span>
                <span className="font-bold text-style-legal text-macro-carbohydrate">{calculatedMacros.carbs}g</span>
              </div>
              <div className="bg-surface p-2 rounded-control border border-border-subtle">
                <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Gorduras</span>
                <span className="font-bold text-style-legal text-macro-fat">{calculatedMacros.fats}g</span>
              </div>
              <div className="bg-surface p-2 rounded-control border border-border-subtle">
                <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Calorias</span>
                <span className="font-bold text-style-legal text-text-primary">{calculatedMacros.kcal} kcal</span>
              </div>
            </div>

            <Button
              onClick={handleConfirmAdd}
              variant="primary"
              className="w-full text-style-legal font-bold py-2.5 rounded-control flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              <span>Adicionar Alimento ({calculatedMacros.kcal} kcal)</span>
            </Button>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-border-subtle rounded-control text-center text-style-legal text-text-muted italic shrink-0">
            Selecione um alimento da lista acima para configurar a quantidade em gramas.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
