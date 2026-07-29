'use client';

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Clock, PlusCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    kcal: 400,
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

    const newMeal: ReadyMeal = {
      ...formData,
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
      kcal: 400,
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UtensilsCrossed size={20} className="text-warm-emerald" />
            <h1 className="font-black text-2xl text-warm-charcoal tracking-tight">Refeições Prontas</h1>
          </div>
          <p className="text-xs text-warm-muted mt-1 font-medium">
            Catálogo de blocos de refeição reutilizáveis para inserção direta na prescrição de qualquer paciente.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="flex items-center space-x-2 shrink-0 bg-warm-emerald text-white hover:bg-warm-emerald/90 font-bold"
        >
          <Plus size={16} />
          <span>Criar Bloco de Refeição</span>
        </Button>
      </div>

      {/* Search Input */}
      {meals.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar refeição pronta por nome ou ingrediente..."
            className="pl-11 pr-4 bg-warm-card border-warm-border text-xs"
          />
        </div>
      )}

      {/* Empty State vs Ready Meals Grid */}
      {filteredMeals.length === 0 ? (
        <Card className="bg-warm-card border-warm-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <CardContent className="p-0 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-warm-inner border border-warm-border flex items-center justify-center mx-auto text-warm-muted">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <h3 className="font-black text-base text-warm-charcoal">Nenhuma refeição cadastrada</h3>
              <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                Seu catálogo de blocos de refeições prontas está em branco. Crie seu primeiro bloco de refeição reutilizável.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="inline-flex items-center space-x-2 text-xs font-bold bg-warm-emerald text-white hover:bg-warm-emerald/90"
            >
              <Plus size={16} />
              <span>Criar Primeiro Bloco</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeals.map((meal) => (
            <Card
              key={meal.id}
              className="bg-warm-card border-warm-border rounded-2xl p-5 hover:border-warm-charcoal/30 transition-all flex flex-col justify-between space-y-4"
            >
              <CardContent className="p-0 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-warm-muted flex items-center space-x-1">
                      <Clock size={12} />
                      <span>Horário sugerido: {meal.suggestedTime}</span>
                    </span>
                    <Badge variant="outline" className="text-[9px] font-bold">
                      {meal.itemsCount} alimentos
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-warm-charcoal leading-snug">{meal.name}</h3>
                  <p className="text-xs text-warm-muted leading-relaxed line-clamp-2">{meal.itemsPreview}</p>
                </div>

                {/* Macro Summary */}
                <div className="grid grid-cols-4 gap-1.5 p-3 bg-warm-inner border border-warm-border rounded-xl text-center">
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Kcal</span>
                    <span className="font-black text-xs text-warm-charcoal">{meal.kcal}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Prot</span>
                    <span className="font-black text-xs text-rose-700">{meal.proteinG}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Carb</span>
                    <span className="font-black text-xs text-amber-700">{meal.carbsG}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Gord</span>
                    <span className="font-black text-xs text-emerald-700">{meal.fatsG}g</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-warm-border">
                  <span className="text-[10px] text-warm-muted font-medium">Bloco de 1 clique</span>
                  <Button
                    size="sm"
                    onClick={() => handleInsert(meal.id)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold"
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
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal">Novo Bloco de Refeição</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateMeal} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Nome do Bloco de Refeição</label>
              <Input
                type="text"
                required
                placeholder="Ex: Café da Manhã Proteico Padrão"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Horário Sugerido</label>
              <Input
                type="text"
                placeholder="08:00"
                value={formData.suggestedTime}
                onChange={(e) => setFormData({ ...formData, suggestedTime: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Kcal</label>
                <Input
                  type="number"
                  value={formData.kcal}
                  onChange={(e) => setFormData({ ...formData, kcal: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Prot (g)</label>
                <Input
                  type="number"
                  value={formData.proteinG}
                  onChange={(e) => setFormData({ ...formData, proteinG: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Carb (g)</label>
                <Input
                  type="number"
                  value={formData.carbsG}
                  onChange={(e) => setFormData({ ...formData, carbsG: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Gord (g)</label>
                <Input
                  type="number"
                  value={formData.fatsG}
                  onChange={(e) => setFormData({ ...formData, fatsG: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Alimentos Incluídos (Resumo)</label>
              <textarea
                rows={2}
                placeholder="Ex: Ovo cozido (150g), Aveia em flocos (40g), Banana (100g)"
                value={formData.itemsPreview}
                onChange={(e) => setFormData({ ...formData, itemsPreview: e.target.value })}
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
              <Button type="submit" size="sm" className="flex-1 text-xs font-bold bg-warm-emerald text-white hover:bg-warm-emerald/90">
                Salvar Refeição
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

