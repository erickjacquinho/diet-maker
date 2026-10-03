'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MealBasicsEditor, type MealBasicsEntry } from '@/components/molecules/MealBasicsEditor';
import { textStyle } from '@/design-system';

export interface ReadyDietMealBasicsEntry extends MealBasicsEntry {
  variationId: string;
  mealId: string;
}

export interface ReadyDietSaveData {
  name: string;
  meals: ReadyDietMealBasicsEntry[];
}

export interface SaveReadyDietModalProps {
  open: boolean;
  initialName: string;
  meals: ReadyDietMealBasicsEntry[];
  isSaving?: boolean;
  confirmOutsideDismiss?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ReadyDietSaveData) => void | Promise<void>;
}

export function SaveReadyDietModal({
  open,
  initialName,
  meals,
  isSaving = false,
  confirmOutsideDismiss = false,
  onOpenChange,
  onConfirm,
}: SaveReadyDietModalProps) {
  const [name, setName] = useState(initialName);
  const [draftMeals, setDraftMeals] = useState(meals);
  const [error, setError] = useState<string | null>(null);
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDraftMeals(meals.map((meal) => ({ ...meal })));
    setError(null);
    setIsExitConfirmationOpen(false);
  }, [initialName, meals, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da dieta pronta.');
      return;
    }
    if (draftMeals.length === 0) {
      setError('Adicione ao menos uma refeição antes de salvar a dieta pronta.');
      return;
    }
    if (draftMeals.some((meal) => !meal.name.trim())) {
      setError('Informe o nome de cada refeição.');
      return;
    }

    setError(null);
    try {
      await onConfirm({ name: name.trim(), meals: draftMeals.map((meal) => ({ ...meal, name: meal.name.trim() })) });
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a dieta pronta.');
    }
  };

  const updateMealBasics = (entries: MealBasicsEntry[]) => {
    setDraftMeals((current) => current.map((meal) => {
      const updated = entries.find((entry) => entry.id === meal.id);
      return updated ? { ...meal, name: updated.name, time: updated.time, label: updated.label } : meal;
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (isSaving) return;
      if (!nextOpen && confirmOutsideDismiss) {
        setIsExitConfirmationOpen((current) => !current);
        return;
      }
      onOpenChange(nextOpen);
    }}>
      <DialogContent
        className="flex max-h-dialog max-w-2xl flex-col gap-4"
        onEscapeKeyDown={(event) => {
          if (!isExitConfirmationOpen) return;
          event.preventDefault();
          setIsExitConfirmationOpen(false);
        }}
        onPointerDownOutside={(event) => {
          if (!confirmOutsideDismiss) return;
          event.preventDefault();
          if (!isSaving) setIsExitConfirmationOpen(true);
        }}
      >
        {isExitConfirmationOpen ? (
          <>
            <DialogHeader>
              <DialogTitle>Sair da criação?</DialogTitle>
              <DialogDescription>As informações desta dieta pronta ainda não foram salvas. Deseja sair desta tela?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" autoFocus variant="secondary" onClick={() => setIsExitConfirmationOpen(false)}>Continuar criando</Button>
              <Button type="button" variant="destructive" onClick={() => { setIsExitConfirmationOpen(false); onOpenChange(false); }}>Sair e descartar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Salvar dieta pronta</DialogTitle>
              <DialogDescription>Salve a composição atual e ajuste os nomes e horários das refeições antes de confirmar.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
              <div className="min-h-0 space-y-4 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ready-diet-name" className={textStyle('field-label')}>Nome da dieta pronta</label>
                  <Input id="ready-diet-name" required value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                {draftMeals.length > 0 ? (
                  <MealBasicsEditor
                    entries={draftMeals}
                    idPrefix="ready-diet-meal"
                    onChange={updateMealBasics}
                    nameLabel="Nome da refeição"
                    timeLabel="Horário"
                  />
                ) : (
                  <p className={textStyle('helper')}>Adicione ao menos uma refeição à dieta para salvá-la como pronta.</p>
                )}
                {error && <p role="alert" className="text-style-legal text-error">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" disabled={isSaving} onClick={() => onOpenChange(false)}>Descartar</Button>
                <Button type="submit" variant="primary" disabled={isSaving || draftMeals.length === 0}>
                  {isSaving ? 'Salvando…' : 'Confirmar'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
