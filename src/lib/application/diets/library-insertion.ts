import { nanoid } from 'nanoid';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietDraftStore } from './diet-ports';
import type { DietDraft, JsonValue } from '@/lib/domain/diets/diet-model';
import type { AccountContext } from '@/lib/persistence/account-context';
import type { ReadyMeal, Recipe } from '@/lib/domain/library/library-model';
import type { DietItem, DietEditableDocument, NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { calculateEnergyFromNutrition, scaleNutrition } from '@/lib/domain/library/library-nutrition';

export interface LibraryDietSourceReader {
  getRecipe(accountId: string, recipeId: string): Promise<Recipe | null>;
  getReadyMeal(accountId: string, readyMealId: string): Promise<ReadyMeal | null>;
}

export interface LibraryInsertionDependencies {
  accountContext: AccountContext;
  draftStore: DietDraftStore;
  sourceReader: LibraryDietSourceReader;
  idFactory?: () => string;
  now?: () => string;
}

export interface RecipeInsertionCommand {
  draftId: string;
  expectedRevision: number;
  recipeId: string;
  variationId: string;
  mealId: string;
}

export interface ReadyMealInsertionCommand {
  draftId: string;
  expectedRevision: number;
  readyMealId: string;
  variationId: string;
  mealId: string;
  optionId?: string;
}

function recipeSnapshot(recipe: Recipe): NutritionSnapshot {
  const energy = calculateEnergyFromNutrition(recipe.nutrition.perPortion);
  const referenceNutrients = { ...recipe.nutrition.perPortion, energyKcal: energy.value };
  return {
    sourceType: 'RECIPE', sourceId: recipe.id, sourceVersion: String(recipe.version), displayName: recipe.name, description: recipe.instructions,
    measurementBasis: 'PER_UNIT', foodState: 'PREPARED', referenceQuantity: createDecimalString('1'), referenceUnit: 'unit', referenceNutrients,
    prescribedQuantity: createDecimalString('1'), prescribedUnit: 'unit', prescribedNutrients: scaleNutrition(referenceNutrients, '1', '1'),
    energySource: energy.source, calculationVersion: 'recipe-decimal-v1', conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'RECIPE', sourceVersion: recipe.version, ingredientCount: recipe.ingredients.length },
  };
}

function withReadyMealProvenance(snapshot: NutritionSnapshot, readyMeal: ReadyMeal): NutritionSnapshot {
  const composition = snapshot.compositionSnapshot !== null
    && typeof snapshot.compositionSnapshot === 'object'
    && !Array.isArray(snapshot.compositionSnapshot)
    ? snapshot.compositionSnapshot as { [key: string]: JsonValue }
    : {};
  return {
    ...snapshot,
    compositionSnapshot: {
      ...composition,
      readyMealSource: { sourceType: 'READY_MEAL', sourceId: readyMeal.id, sourceVersion: readyMeal.version },
    },
  };
}

async function editableDraft(dependencies: LibraryInsertionDependencies, draftId: string, expectedRevision: number): Promise<DietDraft> {
  const account = await dependencies.accountContext.requireActive();
  const draft = await dependencies.draftStore.get(draftId);
  if (!draft || draft.accountId !== account.accountId) throw new DietDomainError('CONTEXT_MISSING', 'Rascunho não pertence à Conta ativa.');
  if (draft.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho não está disponível para edição.');
  if (draft.draftRevision !== expectedRevision) throw new DietDomainError('VERSION_CONFLICT', 'O rascunho mudou antes da inserção da biblioteca.');
  return draft;
}

function appendOption(document: DietEditableDocument, variationId: string, mealId: string, label: string, items: DietItem[], idFactory: () => string): DietEditableDocument {
  let foundMeal = false;
  const variations = document.variations.map((variation) => {
    if (variation.id !== variationId) return variation;
    const meals = variation.meals.map((meal) => {
      if (meal.id !== mealId) return meal;
      foundMeal = true;
      const option = { id: idFactory(), position: meal.options.length, label, countsTowardTotals: true, items: items.map((item, position) => ({ ...structuredClone(item), id: idFactory(), position })) };
      return { ...meal, options: [...meal.options, option] };
    });
    return { ...variation, meals };
  });
  if (!foundMeal) throw new DietDomainError('INVALID_DIET', 'A refeição de destino não foi encontrada no rascunho.');
  return { ...document, variations };
}

function appendItems(document: DietEditableDocument, variationId: string, mealId: string, optionId: string | undefined, items: DietItem[], name: string, suggestedTime?: string): DietEditableDocument {
  let foundOption = false;
  const variations = document.variations.map((variation) => variation.id !== variationId ? variation : {
    ...variation,
    meals: variation.meals.map((meal) => meal.id !== mealId ? meal : {
      ...meal,
      name,
      time: suggestedTime ?? meal.time,
      options: meal.options.map((option) => {
        if (option.id !== (optionId ?? meal.options[0]?.id)) return option;
        foundOption = true;
        return { ...option, items: [...option.items, ...items.map((item, index) => ({ ...item, position: option.items.length + index }))] };
      }),
    }),
  });
  if (!foundOption) throw new DietDomainError('INVALID_DIET', 'A variação da refeição de destino não foi encontrada no rascunho.');
  return { ...document, variations };
}

async function persist(dependencies: LibraryInsertionDependencies, draft: DietDraft, payload: DietEditableDocument): Promise<DietDraft> {
  const saved = await dependencies.draftStore.putIfNewer({ ...draft, payload: structuredClone(payload), draftRevision: draft.draftRevision + 1, updatedAt: (dependencies.now ?? (() => new Date().toISOString()))() }, draft.draftRevision);
  if (saved.status !== 'SAVED') throw new DietDomainError(saved.status === 'INVALIDATED' ? 'ARCHIVED_PATIENT' : 'VERSION_CONFLICT', 'O rascunho mudou antes da inserção da biblioteca.');
  const result = await dependencies.draftStore.get(draft.draftId);
  if (!result) throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'A inserção foi salva, mas o rascunho não pôde ser relido.');
  return result;
}

export async function insertRecipeIntoDietDraft(dependencies: LibraryInsertionDependencies, command: RecipeInsertionCommand): Promise<DietDraft> {
  const draft = await editableDraft(dependencies, command.draftId, command.expectedRevision);
  const recipe = await dependencies.sourceReader.getRecipe(draft.accountId, command.recipeId);
  if (!recipe || recipe.status !== 'ACTIVE') throw new DietDomainError('CONTEXT_MISSING', 'A receita não está ativa ou não pertence à Conta atual.');
  const makeId = dependencies.idFactory ?? (() => nanoid(12));
  const item: DietItem = { id: '', position: 0, role: 'PRIMARY', name: recipe.name, snapshot: recipeSnapshot(recipe) };
  const payload = appendOption(draft.payload, command.variationId, command.mealId, recipe.name, [item], makeId);
  return persist(dependencies, draft, payload);
}

export async function insertReadyMealIntoDietDraft(dependencies: LibraryInsertionDependencies, command: ReadyMealInsertionCommand): Promise<DietDraft> {
  const draft = await editableDraft(dependencies, command.draftId, command.expectedRevision);
  const readyMeal = await dependencies.sourceReader.getReadyMeal(draft.accountId, command.readyMealId);
  if (!readyMeal || readyMeal.status !== 'ACTIVE') throw new DietDomainError('CONTEXT_MISSING', 'A refeição pronta não está ativa ou não pertence à Conta atual.');
  const makeId = dependencies.idFactory ?? (() => nanoid(12));
  const items: DietItem[] = readyMeal.items.map((item, position) => ({
    id: makeId(), position, role: 'PRIMARY', name: item.itemSnapshot.displayName,
    snapshot: withReadyMealProvenance(item.itemSnapshot, readyMeal),
  }));
  const payload = appendItems(draft.payload, command.variationId, command.mealId, command.optionId, items, readyMeal.name, readyMeal.suggestedTime);
  return persist(dependencies, draft, payload);
}
