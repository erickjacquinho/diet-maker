'use client';

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Search, Clock, PlusCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreateReadyMealModal, type ReadyMealFormData } from '@/components/molecules/CreateReadyMealModal';
import { MetricBox } from '@/components/molecules';
import {
  type ReadyMeal,
  getReadyMealsFromStorage,
  saveReadyMealToStorage,
} from '@/lib/readyMealsStore';

export default function ReadyMealsPage() {
  const [meals, setMeals] = useState<ReadyMeal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMeals(getReadyMealsFromStorage());
  }, []);

  const handleCreateMeal = (formData: ReadyMealFormData) => {
    saveReadyMealToStorage(formData);
    setMeals(getReadyMealsFromStorage());
    setIsModalOpen(false);
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
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
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
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar refeição pronta por nome ou ingrediente..."
            className="pl-11 pr-4"
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
                  <MetricBox surface="inline" size="compact" label="Kcal" value={`${meal.kcal}`} />
                  <MetricBox surface="inline" size="compact" tone="protein" label="Prot" value={`${meal.proteinG}g`} />
                  <MetricBox surface="inline" size="compact" tone="warning" label="Carb" value={`${meal.carbsG}g`} />
                  <MetricBox surface="inline" size="compact" tone="success" label="Gord" value={`${meal.fatsG}g`} />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
                  <span className="text-style-legal text-text-muted font-medium">Bloco de 1 clique</span>
                  <Button
                    size="compact"
                    variant="primary"
                    onClick={() => handleInsert(meal.id)}
                    className={`inline-flex items-center gap-1.5 text-style-legal font-bold transition-colors duration-standard ${
                      insertedId === meal.id
                        ? 'bg-success text-on-success hover:bg-success border-transparent shadow-floating'
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

      <CreateReadyMealModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleCreateMeal}
      />
    </div>
  );
}
