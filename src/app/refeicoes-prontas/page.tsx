'use client';

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Clock, PlusCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AutoKcalSection } from '@/components/molecules/AutoKcalSection';
import { calculatePresetCalories } from '@/lib/presetUtils';

interface ReadyMeal {
  id: string;
  name: string;
  suggestedTime: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  itemsCount: number;
  itemsPreview: string;
}

const MEALS_KEY = 'nutridiet_ready_meals';

export default function ReadyMealsPage() {
  const [meals, setMeals] = useState<ReadyMeal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    suggestedTime: '08:00',
    proteinG: 30,
    carbsG: 40,
    fatsG: 12,
    itemsCount: 3,
    itemsPreview: '',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MEALS_KEY);
      if (saved) setMeals(JSON.parse(saved));
    } catch {
      setMeals([]);
    }
  }, []);

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const calculatedKcal = calculatePresetCalories(
      Number(formData.proteinG),
      Number(formData.carbsG),
      Number(formData.fatsG)
    );

    const newMeal: ReadyMeal = {
      ...formData,
      kcal: calculatedKcal,
      id: `meal-block-${Date.now()}`,
      name: formData.name.trim(),
      itemsPreview: formData.itemsPreview.trim() || 'Itens cadastrados no bloco',
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    localStorage.setItem(MEALS_KEY, JSON.stringify(updated));
    setIsModalOpen(false);
    setFormData({
      name: '',
      suggestedTime: '08:00',
      proteinG: 30,
      carbsG: 40,
      fatsG: 12,
      itemsCount: 3,
      itemsPreview: '',
    });
  };


  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.itemsPreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInsert = (id: string) => {
    setInsertedId(id);
    setTimeout(() => setInsertedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-success" />
            <h1 className="font-bold text-style-section-title text-text-primary tracking-tight">Refeições Prontas</h1>
          </div>
          <p className="text-style-legal text-text-muted mt-1 font-medium">
            Catálogo de blocos de refeição reutilizáveis para inserção direta na prescrição de qualquer paciente.
          </p>
        </div>
        <CreateButton onClick={() => setIsModalOpen(true)}>
          Criar Bloco de Refeição
        </CreateButton>
      </div>

      {/* Search Input */}
      {meals.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar refeição pronta por nome ou ingrediente..."
            className="pl-11 pr-4 bg-surface border-border-subtle text-style-legal"
          />
        </div>
      )}

      {/* Empty State vs Ready Meals Grid */}
      {filteredMeals.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-12 text-center max-w-md mx-auto flex flex-col gap-4 my-8">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhuma refeição cadastrada</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                Seu catálogo de blocos de refeições prontas está em branco. Crie seu primeiro bloco de refeição reutilizável.
              </p>
            </div>
            <CreateButton onClick={() => setIsModalOpen(true)}>
              Criar Primeiro Bloco
            </CreateButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filteredMeals.map((meal) => (
            <Card
              key={meal.id}
              className="bg-surface border-border-subtle rounded-surface p-5 hover:border-border-hover transition-colors duration-standard flex flex-col justify-between gap-4"
            >
              <CardContent className="p-0 gap-4 flex flex-col justify-between h-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-style-legal font-semibold text-text-muted flex items-center gap-1">
                      <Clock size={12} />
                      <span>Horário sugerido: {meal.suggestedTime}</span>
                    </span>
                    <Badge variant="outline" className="text-style-chart-micro font-bold">
                      {meal.itemsCount} alimentos
                    </Badge>
                  </div>
                  <h3 className="font-bold text-style-body-small text-text-primary leading-snug">{meal.name}</h3>
                  <p className="text-style-legal text-text-muted leading-relaxed line-clamp-2">{meal.itemsPreview}</p>
                </div>

                {/* Macro Summary */}
                <div className="grid grid-cols-4 gap-1.5 p-3 bg-surface-subtle border border-border-subtle rounded-control text-center">
                  <div>
                    <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Kcal</span>
                    <span className="font-bold text-style-legal text-text-primary">{meal.kcal}</span>
                  </div>
                  <div>
                    <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Prot</span>
                    <span className="font-bold text-style-legal text-macro-protein">{meal.proteinG}g</span>
                  </div>
                  <div>
                    <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Carb</span>
                    <span className="font-bold text-style-legal text-warning">{meal.carbsG}g</span>
                  </div>
                  <div>
                    <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Gord</span>
                    <span className="font-bold text-style-legal text-success">{meal.fatsG}g</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
                  <span className="text-style-legal text-text-muted font-medium">Bloco de 1 clique</span>
                  <Button
                    size="sm"
                    variant={insertedId === meal.id ? 'default' : 'primary'}
                    onClick={() => handleInsert(meal.id)}
                    className={`inline-flex items-center gap-1.5 text-style-legal font-bold transition-colors duration-standard ${
                      insertedId === meal.id
                        ? 'bg-success text-on-success hover:bg-success border-transparent shadow-floating scale-[1.02]'
                        : ''
                    }`}
                  >
                    {insertedId === meal.id ? <Check size={14} /> : <PlusCircle size={14} />}
                    <span>{insertedId === meal.id ? 'Inserido!' : 'Inserir na Dieta'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Criar Refeição Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary">Novo Bloco de Refeição</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateMeal} className="flex flex-col gap-3 pt-2">
            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Nome do Bloco de Refeição</label>
              <Input
                type="text"
                required
                placeholder="Ex: Café da Manhã Proteico Padrão"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-subtle border-border-subtle text-style-legal"
              />
            </div>

            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Horário Sugerido</label>
              <Input
                type="text"
                placeholder="08:00"
                value={formData.suggestedTime}
                onChange={(e) => setFormData({ ...formData, suggestedTime: e.target.value })}
                className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
              />
            </div>

            <AutoKcalSection
              title="Macronutrientes & Calorias Calculadas"
              proteinG={formData.proteinG}
              carbsG={formData.carbsG}
              fatsG={formData.fatsG}
              onProteinChange={(val) => setFormData({ ...formData, proteinG: val })}
              onCarbsChange={(val) => setFormData({ ...formData, carbsG: val })}
              onFatsChange={(val) => setFormData({ ...formData, fatsG: val })}
            />

            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Alimentos Incluídos (Resumo)</label>
              <textarea
                rows={2}
                placeholder="Ex: Ovo cozido (150g), Aveia em flocos (40g), Banana (100g)"
                value={formData.itemsPreview}
                onChange={(e) => setFormData({ ...formData, itemsPreview: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border-subtle rounded-control text-style-legal text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" className="flex-1">
                Salvar Refeição
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

