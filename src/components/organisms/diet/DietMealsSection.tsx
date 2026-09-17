'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { GripVertical, Plus, Shuffle, Utensils } from 'lucide-react';
import { Badge, Button, MacroSummary, Surface } from '@/components/atoms';
import {
  ConfirmationAlertDialog,
  SortableItemRenderContext,
  SortableList,
} from '@/components/molecules';
import { MealCardContainer, MealCardContainerProps } from '../MealCardContainer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface DietMealsSectionProps {
  mealsData: MealCardContainerProps[];
  onAddMeal?: () => void;
  onReorderMeals?: (mealIds: string[]) => void;
}

function mealId(meal: MealCardContainerProps, index: number) {
  return meal.id || `meal-${index}`;
}

export function DietMealsSection({ mealsData = [], onAddMeal, onReorderMeals }: DietMealsSectionProps) {
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [draftMeals, setDraftMeals] = useState<MealCardContainerProps[]>([]);
  const [initialMealIds, setInitialMealIds] = useState<string[]>([]);
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);

  const draftMealIds = useMemo(
    () => draftMeals.map((meal, index) => mealId(meal, index)),
    [draftMeals]
  );
  const isDirty = draftMealIds.length !== initialMealIds.length
    || draftMealIds.some((id, index) => id !== initialMealIds[index]);

  const resetReorderState = useCallback(() => {
    setIsReorderOpen(false);
    setIsDiscardAlertOpen(false);
    setDraftMeals([]);
    setInitialMealIds([]);
  }, []);

  const openReorder = () => {
    setDraftMeals([...mealsData]);
    setInitialMealIds(mealsData.map((meal, index) => mealId(meal, index)));
    setIsReorderOpen(true);
  };

  const requestClose = useCallback(() => {
    if (isDirty) {
      setIsDiscardAlertOpen(true);
      return;
    }
    resetReorderState();
  }, [isDirty, resetReorderState]);

  const handleDraftReorder = useCallback((nextMeals: MealCardContainerProps[]) => {
    setDraftMeals(nextMeals);
  }, []);

  const handleConfirm = () => {
    if (isDirty) onReorderMeals?.(draftMealIds);
    resetReorderState();
  };

  const renderReorderMeal = useCallback((meal: MealCardContainerProps, context: SortableItemRenderContext) => {
    const items = meal.items || [];

    return (
      <Surface
        data-testid={`reorder-meal-${context.id}`}
        data-meal-id={context.id}
        className="flex w-full items-center gap-3 border-border-subtle p-3"
      >
        <GripVertical className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-style-body-small font-semibold text-text-primary">{meal.title}</p>
          <MacroSummary
            protein={meal.proteinG}
            carbs={meal.carbsG}
            fats={meal.fatsG}
            kcal={meal.kcal}
            className="mt-1"
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="neutral"
              role="status"
              tabIndex={0}
              aria-label={`${items.length} ${items.length === 1 ? 'item' : 'itens'}; ver alimentos de ${meal.title}`}
              className="shrink-0 cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2"
            >
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="max-w-md p-3">
            <div className="flex flex-col gap-2">
              <p className="text-style-legal font-bold text-text-primary">Alimentos de {meal.title}</p>
              {items.length === 0 ? (
                <p className="text-style-legal text-text-muted">Nenhum alimento prescrito.</p>
              ) : (
                <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                  {items.map((item, itemIndex) => (
                    <li
                      key={item.id || `${context.id}-item-${itemIndex}`}
                      className="border-t border-border-divider pt-2 first:border-t-0 first:pt-0"
                    >
                      <p className="text-style-legal font-semibold text-text-primary">{item.name}</p>
                      <p className="text-style-chart-micro text-text-muted">
                        {item.quantityGrams}g · P {item.protein}g · C {item.carbs}g · G {item.fats}g · {item.kcal} kcal
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </Surface>
    );
  }, []);

  return (
    <section aria-labelledby="meals-heading" className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h2 id="meals-heading" className="text-style-subsection-title font-bold tracking-tight text-text-primary">
            Refeições
          </h2>
          <p className="text-style-legal text-text-muted">Organize as refeições e alimentos prescritos para o paciente.</p>
        </div>
        {mealsData.length >= 2 && (
          <Button
            type="button"
            onClick={openReorder}
            variant="secondary"
            size="compact"
            aria-haspopup="dialog"
            className="flex items-center gap-1.5"
          >
            <Shuffle size={14} aria-hidden="true" />
            <span>Reordenar</span>
          </Button>
        )}
      </div>

      {mealsData.length === 0 ? (
        <Surface variant="subtle" className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-surface bg-success-soft text-success">
            <Utensils size={24} aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-style-body font-bold text-text-primary">Nenhuma Refeição Cadastrada</h3>
            <p className="mx-auto max-w-md text-style-legal text-text-muted">
              Use “Nova Refeição” para começar a prescrição e adicionar alimentos diretamente da base TACO.
            </p>
          </div>
          {onAddMeal && (
            <Button onClick={onAddMeal} variant="secondary" size="compact" className="flex w-48 items-center justify-center gap-1.5">
              <Plus size={14} aria-hidden="true" />
              <span>Nova Refeição</span>
            </Button>
          )}
        </Surface>
      ) : (
        <div className="flex flex-col gap-6">
          {mealsData.map((meal, index) => (
            <MealCardContainer key={meal.id || index} {...meal} />
          ))}
          {onAddMeal && (
            <Button onClick={onAddMeal} variant="secondary" size="compact" className="flex w-48 items-center justify-center gap-1.5 self-center">
              <Plus size={14} aria-hidden="true" />
              <span>Nova Refeição</span>
            </Button>
          )}
        </div>
      )}

      <TooltipProvider delayDuration={200}>
        <Dialog open={isReorderOpen} onOpenChange={(open) => !open && requestClose()}>
          <DialogContent className="flex max-h-dialog max-w-2xl flex-col gap-4 p-6">
            <DialogHeader>
              <DialogTitle>Reordenar refeições</DialogTitle>
              <DialogDescription>
                Arraste os cards ou use as setas do teclado para ajustar a sequência da prescrição.
              </DialogDescription>
            </DialogHeader>

            <SortableList
              items={draftMeals}
              getItemId={(meal, index) => mealId(meal, index)}
              getItemLabel={(meal) => meal.title}
              renderItem={renderReorderMeal}
              onReorder={handleDraftReorder}
              ariaLabel="Refeições para reordenar"
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1"
            />

            <DialogFooter className="border-t border-border-subtle pt-3">
              <Button type="button" variant="quiet" size="compact" onClick={resetReorderState}>
                Descartar
              </Button>
              <Button type="button" variant="primary" size="compact" onClick={handleConfirm} disabled={!isDirty}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>

      <ConfirmationAlertDialog
        open={isDiscardAlertOpen}
        onOpenChange={setIsDiscardAlertOpen}
        overlayLayer="modal"
        title="Descartar alterações de ordem?"
        description="A sequência ajustada será perdida e a ordem original será restaurada."
        confirmLabel="Descartar"
        confirmVariant="destructive"
        onConfirm={resetReorderState}
      />
    </section>
  );
}
