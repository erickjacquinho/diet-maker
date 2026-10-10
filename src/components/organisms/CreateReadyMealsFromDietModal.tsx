'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MealBasicsEditor, type MealBasicsEntry } from '@/components/molecules/MealBasicsEditor';
import { getMealVariationOptions, type MealVariationOption } from '@/lib/mealVariations';
import type { DietMeal } from '@/lib/legacy-diet-types';
import { textStyle } from '@/design-system';

export interface ReadyMealBatchEntry extends MealBasicsEntry {
  items: MealVariationOption['items'];
}

export interface CreateReadyMealsFromDietModalProps {
  open: boolean;
  meal: DietMeal | null;
  activeVariationId?: string;
  isSaving?: boolean;
  confirmOutsideDismiss?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (entries: ReadyMealBatchEntry[]) => void | Promise<void>;
}

function createEntry(meal: DietMeal, option: MealVariationOption, hasVariations = false, suffixName = false): MealBasicsEntry {
  return {
    id: option.id,
    name: suffixName ? `${meal.name} - ${option.label}` : meal.name,
    time: meal.time || '08:00',
    ...(hasVariations ? { label: option.label } : {}),
  };
}

export function CreateReadyMealsFromDietModal({
  open,
  meal,
  activeVariationId,
  isSaving = false,
  confirmOutsideDismiss = false,
  error,
  onOpenChange,
  onConfirm,
}: CreateReadyMealsFromDietModalProps) {
  const options = useMemo(() => meal ? getMealVariationOptions(meal) : [], [meal]);
  const hasVariations = options.length > 1;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [entries, setEntries] = useState<MealBasicsEntry[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);

  useEffect(() => {
    if (!open || !meal || options.length === 0) return;
    const initialOption = options.find((option) => option.id === activeVariationId) ?? options[0];
    setSelectedIds([initialOption.id]);
    setEntries([createEntry(meal, initialOption, hasVariations)]);
    setSubmitError(null);
    setIsExitConfirmationOpen(false);
  }, [activeVariationId, hasVariations, meal, open, options]);

  const toggleOption = (option: MealVariationOption, checked: boolean) => {
    setSubmitError(null);
    setSelectedIds((current) => checked
      ? current.includes(option.id) ? current : [...current, option.id]
      : current.filter((id) => id !== option.id));
    setEntries((current) => {
      if (checked) {
        if (current.some((entry) => entry.id === option.id)) return current;
        const primaryOption = options[0];
        const suffixName = current.length > 0 || option.id !== primaryOption?.id;
        return [...current, createEntry(meal!, option, hasVariations, suffixName)];
      }
      return current.filter((entry) => entry.id !== option.id);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!meal || selectedIds.length === 0) return;

    const selectedOptions = options.filter((option) => selectedIds.includes(option.id));
    if (selectedOptions.some((option) => option.items.length === 0)) {
      setSubmitError('Adicione alimentos às variações selecionadas antes de confirmar.');
      return;
    }

    const entriesToSave: ReadyMealBatchEntry[] = selectedOptions.map((option) => {
      const basics = entries.find((entry) => entry.id === option.id);
      return { ...createEntry(meal, option), ...basics, items: option.items };
    });
    if (entriesToSave.some((entry) => !entry.name.trim())) {
      setSubmitError('Informe um nome para cada refeição pronta.');
      return;
    }

    setSubmitError(null);
    try {
      await onConfirm(entriesToSave.map((entry) => ({ ...entry, name: entry.name.trim() })));
      onOpenChange(false);
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Não foi possível criar as refeições prontas.');
    }
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
              <DialogDescription>As informações desta refeição pronta ainda não foram salvas. Deseja sair desta tela?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" autoFocus variant="secondary" onClick={() => setIsExitConfirmationOpen(false)}>Continuar criando</Button>
              <Button type="button" variant="destructive" onClick={() => { setIsExitConfirmationOpen(false); onOpenChange(false); }}>Sair e descartar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Criar refeição pronta</DialogTitle>
              <DialogDescription>Confirme o nome e o horário sugerido antes de salvar na biblioteca.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
              <div className="min-h-0 overflow-y-auto">
                {hasVariations && (
                  <fieldset className="flex flex-col gap-2 pb-4">
                    <legend className={textStyle('field-label')}>Selecione variações</legend>
                    {options.map((option) => (
                      <label key={option.id} className="flex items-center gap-2 rounded-control border border-border-subtle bg-surface px-3 py-2 text-style-body-small text-text-primary">
                        <Checkbox
                          aria-label={option.label}
                          checked={selectedIds.includes(option.id)}
                          disabled={isSaving || option.items.length === 0}
                          onCheckedChange={(checked) => toggleOption(option, checked)}
                        />
                        <span>{option.label}</span>
                        {option.items.length === 0 && <span className="text-text-muted">(sem alimentos)</span>}
                      </label>
                    ))}
                    <p className={textStyle('helper')}>Cada variação selecionada será criada como uma refeição pronta; nome e horário podem ser ajustados em lote.</p>
                  </fieldset>
                )}
                {entries.length > 0 && (
                  <MealBasicsEditor
                    disabled={isSaving}
                    entries={entries}
                    idPrefix="ready-meal-batch"
                    onChange={setEntries}
                    nameLabel="Nome da refeição pronta"
                  />
                )}
                {(submitError || error) && <p role="alert" className={`${textStyle('validation-error')} mt-3`}>{submitError ?? error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" disabled={isSaving} onClick={() => onOpenChange(false)}>Descartar</Button>
                <Button type="submit" variant="primary" disabled={isSaving || selectedIds.length === 0}>
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
