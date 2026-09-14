'use client';

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Search, Archive, ArchiveRestore, Clock } from 'lucide-react';
import { Badge, Button, CreateButton, DeleteIconButton, EditIconButton, IconButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateReadyMealModal, type ReadyMealFormData } from '@/components/molecules/CreateReadyMealModal';
import { MacroSummary } from '@/components/molecules';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { toReadyMeal, type ReadyMeal } from '@/lib/library-ui-adapter';
import { ConfirmationAlertDialog } from '@/components/molecules/ConfirmationAlertDialog';
import { toast } from 'sonner';

export default function ReadyMealsPage() {
  const [meals, setMeals] = useState<ReadyMeal[]>([]);
  const [archivedMealCount, setArchivedMealCount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ReadyMeal | null>(null);
  const [mealPendingAction, setMealPendingAction] = useState<{ meal: ReadyMeal; action: 'archive' | 'restore' | 'delete' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshMeals = async (includeArchived = showArchived): Promise<number | null> => {
    setIsLoading(true);
    try {
      const application = await getBrowserLibraryApplication();
      const allMeals = (await application.listReadyMeals({ includeArchived: true })).map(toReadyMeal);
      const nextMeals = allMeals
        .filter((meal) => includeArchived ? meal.status === 'ARCHIVED' : meal.status !== 'ARCHIVED');
      setMeals(nextMeals);
      setArchivedMealCount(allMeals.filter((meal) => meal.status === 'ARCHIVED').length);
      setErrorMessage(null);
      return nextMeals.length;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'As refeições prontas não puderam ser carregadas.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshMeals(showArchived);
  }, [showArchived]);

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
      await refreshMeals(showArchived);
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
      } else if (action === 'restore') {
        await application.restoreReadyMeal(meal.id, meal.libraryVersion ?? 1);
        toast.success('Refeição pronta restaurada.');
      } else {
        await application.deleteReadyMeal(meal.id, meal.libraryVersion ?? 1);
        setMealPendingAction(null);
        await refreshMeals(showArchived);
        toast.success('Refeição pronta excluída.', {
          duration: 6000,
          action: {
            label: 'Desfazer',
            onClick: () => {
              void (async () => {
                try {
                  const restoredMeal = await application.createReadyMeal({
                    name: meal.name,
                    description: meal.itemsPreview,
                    suggestedTime: meal.suggestedTime,
                    items: meal.items ?? [],
                  });
                  if (meal.status === 'ARCHIVED') {
                    await application.archiveReadyMeal(restoredMeal.id, restoredMeal.version);
                  }
                  await refreshMeals(showArchived);
                  toast.success('Refeição pronta restaurada.');
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : 'A refeição pronta não pôde ser restaurada.');
                }
              })();
            },
          },
        });
        return;
      }
      setMealPendingAction(null);
      const remainingMeals = await refreshMeals(showArchived);
      if (action === 'restore' && showArchived && remainingMeals === 0) {
        setShowArchived(false);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'A operação da refeição pronta não pôde ser concluída.');
    }
  };

  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.itemsPreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Catálogo de blocos de refeição reutilizáveis na montagem de novas prescrições.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="standard"
            aria-pressed={showArchived}
            disabled={!showArchived && archivedMealCount === 0}
            onClick={() => setShowArchived((current) => !current)}
            className="gap-1.5"
          >
            <Archive size={14} aria-hidden="true" />
            <span>{showArchived ? 'Ver ativos' : 'Arquivados'}</span>
          </Button>
          <CreateButton onClick={() => { setEditingMeal(null); setIsModalOpen(true); }}>
            Nova Refeição
          </CreateButton>
        </div>
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
              <h3 className="font-bold text-style-body text-text-primary">
                {showArchived ? 'Nenhuma refeição arquivada' : 'Nenhuma refeição cadastrada'}
              </h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                {showArchived
                  ? 'Não há refeições arquivadas neste catálogo.'
                  : 'Seu catálogo de blocos de refeições prontas está em branco. Crie seu primeiro bloco de refeição reutilizável.'}
              </p>
            </div>
            {!showArchived && (
              <CreateButton onClick={() => { setEditingMeal(null); setIsModalOpen(true); }}>
                Criar Primeiro Bloco
              </CreateButton>
            )}
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
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="min-w-0 truncate font-bold text-style-body-small text-text-primary leading-snug" title={meal.name}>
                      {meal.name}
                    </h3>
                    {meal.suggestedTime && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-style-legal text-text-muted" aria-label={`Horário ${meal.suggestedTime}`}>
                        <Clock size={13} aria-hidden="true" />
                        <span>{meal.suggestedTime}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-style-legal text-text-muted leading-relaxed line-clamp-2" title={meal.itemsPreview}>
                    {meal.itemsPreview}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="neutral"
                          tabIndex={0}
                          className="shrink-0 cursor-help text-style-chart-micro font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {meal.itemsCount} {meal.itemsCount === 1 ? 'item' : 'itens'}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="max-w-md whitespace-normal p-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-baseline justify-between gap-3 border-b border-border-divider pb-2">
                            <p className="text-style-caption font-semibold text-text-primary">Alimentos da refeição</p>
                            <p className="shrink-0 text-style-chart-micro font-medium text-text-muted">Macros da porção</p>
                          </div>
                          <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pt-1">
                            {(meal.itemsDetails ?? []).map((item) => (
                              <li key={`meal-item-${item.id}`} className="flex min-w-0 items-center justify-between gap-2">
                                <span className="min-w-0 truncate text-style-legal font-semibold text-text-primary" title={item.name}>
                                  {item.name}
                                </span>
                                <MacroSummary
                                  protein={item.proteinG}
                                  carbs={item.carbsG}
                                  fats={item.fatsG}
                                  kcal={item.kcal}
                                  data-testid={`meal-item-macros-${item.id}`}
                                  className="shrink-0 text-style-chart-micro"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <MacroSummary
                    protein={meal.proteinG}
                    carbs={meal.carbsG}
                    fats={meal.fatsG}
                    kcal={meal.kcal}
                    className="min-w-0"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
                  {showArchived ? (
                    <IconButton
                      variant="secondary"
                      title="Restaurar Refeição Pronta"
                      aria-label="Restaurar Refeição Pronta"
                      icon={<ArchiveRestore size={14} aria-hidden="true" />}
                      onClick={() => setMealPendingAction({ meal, action: 'restore' })}
                    />
                  ) : (
                    <>
                      <EditIconButton title="Editar Refeição Pronta" onClick={() => { setEditingMeal(meal); setIsModalOpen(true); }} />
                      <IconButton
                        variant="secondary"
                        title="Arquivar Refeição Pronta"
                        aria-label="Arquivar Refeição Pronta"
                        icon={<Archive size={14} aria-hidden="true" />}
                        onClick={() => setMealPendingAction({ meal, action: 'archive' })}
                      />
                    </>
                  )}
                  <DeleteIconButton title="Excluir Refeição Pronta" onClick={() => setMealPendingAction({ meal, action: 'delete' })} />
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
        title={mealPendingAction?.action === 'archive'
          ? 'Arquivar refeição pronta?'
          : mealPendingAction?.action === 'restore'
            ? 'Restaurar refeição pronta?'
            : 'Excluir refeição pronta?'}
        description={mealPendingAction?.action === 'archive'
          ? `A refeição "${mealPendingAction?.meal.name}" deixará de aparecer nas novas seleções.`
          : mealPendingAction?.action === 'restore'
            ? `A refeição "${mealPendingAction?.meal.name}" voltará a aparecer nas refeições ativas.`
            : `A refeição "${mealPendingAction?.meal.name}" só será excluída se não possuir dependências.`}
        confirmLabel={mealPendingAction?.action === 'archive' ? 'Arquivar' : mealPendingAction?.action === 'restore' ? 'Restaurar' : 'Excluir'}
        confirmVariant={mealPendingAction?.action === 'delete' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmMealAction}
      />
    </div>
  );
}
