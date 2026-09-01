'use client';

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Search, Clock, PlusCircle, Check, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton, DeleteIconButton, EditIconButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreateReadyMealModal, type ReadyMealFormData } from '@/components/molecules/CreateReadyMealModal';
import { MacroProportionBar } from '@/components/molecules';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { toReadyMeal, type ReadyMeal } from '@/lib/library-ui-adapter';
import { ConfirmationAlertDialog } from '@/components/molecules/ConfirmationAlertDialog';
import { toast } from 'sonner';

export default function ReadyMealsPage() {
  const [meals, setMeals] = useState<ReadyMeal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ReadyMeal | null>(null);
  const [mealPendingAction, setMealPendingAction] = useState<{ meal: ReadyMeal; action: 'archive' | 'delete' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshMeals = async () => {
    setIsLoading(true);
    try {
      const application = await getBrowserLibraryApplication();
      setMeals((await application.listReadyMeals()).map(toReadyMeal));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'As refeições prontas não puderam ser carregadas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshMeals();
  }, []);

  const handleCreateMeal = async (formData: ReadyMealFormData) => {
    try {
      const application = await getBrowserLibraryApplication();
      const input = { name: formData.name, description: formData.itemsPreview, suggestedTime: formData.suggestedTime, items: formData.items ?? [] };
      if (formData.id) {
        const current = meals.find((meal) => meal.id === formData.id);
        await application.updateReadyMeal(formData.id, current?.libraryVersion ?? 1, input);
      } else {
        await application.createReadyMeal(input);
      }
      await refreshMeals();
      setIsModalOpen(false);
      setEditingMeal(null);
      toast.success(formData.id ? 'Refeição pronta atualizada com sucesso!' : 'Refeição pronta cadastrada!');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'A refeição pronta não pôde ser salva.');
    }
  };

  const handleConfirmMealAction = async () => {
    if (!mealPendingAction) return;
    const { meal, action } = mealPendingAction;
    try {
      const application = await getBrowserLibraryApplication();
      if (action === 'archive') {
        await application.archiveReadyMeal(meal.id, meal.libraryVersion ?? 1);
        toast.success('Refeição pronta arquivada.');
      } else {
        await application.deleteReadyMeal(meal.id, meal.libraryVersion ?? 1);
        toast.success('Refeição pronta excluída.');
      }
      setMealPendingAction(null);
      await refreshMeals();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'A operação da refeição pronta não pôde ser concluída.');
    }
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
        <CreateButton onClick={() => { setEditingMeal(null); setIsModalOpen(true); }}>
          Criar Bloco de Refeição
        </CreateButton>
      </div>

      {errorMessage && <p role="alert" className="text-style-body-secondary text-error">{errorMessage}</p>}

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
      {isLoading ? (
        <div role="status" className="rounded-control border border-border-subtle bg-surface-subtle p-6 text-text-muted">Carregando refeições prontas…</div>
      ) : filteredMeals.length === 0 ? (
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
            <CreateButton onClick={() => { setEditingMeal(null); setIsModalOpen(true); }}>
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

                {/* Barra de Proporção de Macronutrientes da Refeição Pronta */}
                <MacroProportionBar
                  proteinG={meal.proteinG}
                  carbsG={meal.carbsG}
                  fatsG={meal.fatsG}
                  kcal={meal.kcal}
                />

                <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
                  <span className="text-style-legal text-text-muted font-medium">Bloco de 1 clique</span>
                  <div className="flex items-center gap-1.5">
                    <EditIconButton title="Editar Refeição Pronta" onClick={() => { setEditingMeal(meal); setIsModalOpen(true); }} />
                    <Button type="button" variant="quiet" size="compact" title="Arquivar Refeição Pronta" aria-label="Arquivar Refeição Pronta" onClick={() => setMealPendingAction({ meal, action: 'archive' })}>
                      <Archive size={14} aria-hidden="true" />
                    </Button>
                    <DeleteIconButton title="Excluir Refeição Pronta" onClick={() => setMealPendingAction({ meal, action: 'delete' })} />
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateReadyMealModal
        open={isModalOpen}
        meal={editingMeal}
        onOpenChange={setIsModalOpen}
        onSave={handleCreateMeal}
      />

      <ConfirmationAlertDialog
        open={!!mealPendingAction}
        onOpenChange={(open) => !open && setMealPendingAction(null)}
        title={mealPendingAction?.action === 'archive' ? 'Arquivar refeição pronta?' : 'Excluir refeição pronta?'}
        description={mealPendingAction?.action === 'archive'
          ? `A refeição "${mealPendingAction?.meal.name}" deixará de aparecer nas novas seleções.`
          : `A refeição "${mealPendingAction?.meal.name}" só será excluída se não possuir dependências.`}
        confirmLabel={mealPendingAction?.action === 'archive' ? 'Arquivar' : 'Excluir'}
        confirmVariant={mealPendingAction?.action === 'archive' ? 'primary' : 'destructive'}
        onConfirm={handleConfirmMealAction}
      />
    </div>
  );
}
