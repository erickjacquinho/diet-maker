# Contract: Library Application Boundary

**Feature**: [Biblioteca reutilizável por Conta](../spec.md)
**Status**: Proposed for implementation

This contract describes the application boundary used by pages, hooks and diet
insertion flows. It intentionally does not expose PGlite, Drizzle, IndexedDB or
legacy storage details to the UI.

## Context and errors

Every operation resolves the active Account before accessing a repository. The
application MUST return typed, user-actionable errors for:

- `LIBRARY_CONTEXT_MISSING`: no active Account is available;
- `LIBRARY_NOT_FOUND`: the requested entity is absent in the Account;
- `LIBRARY_SCOPE_VIOLATION`: an ID belongs to another Account;
- `LIBRARY_VALIDATION_FAILED`: a field, quantity, source or nutrient is invalid;
- `LIBRARY_VERSION_CONFLICT`: the expected version is stale;
- `LIBRARY_DEPENDENCY_EXISTS`: physical deletion is not permitted;
- `LIBRARY_COMPOSITION_CYCLE`: an invalid recursive composition was requested;
- `LIBRARY_TRANSACTION_FAILED`: the aggregate save rolled back.

No error may fall back to a legacy store or disclose records from another
Account.

## Repository ports

The domain/application layer defines provider-independent ports equivalent to
the following operations:

```text
FoodCatalogRepository
  getById(accountId, foodId)
  list(accountId, filter)
  create(accountId, input)
  update(accountId, foodId, expectedVersion, input)
  duplicate(accountId, foodId)
  archive(accountId, foodId, expectedVersion)
  restore(accountId, foodId, expectedVersion)
  deleteIfUnreferenced(accountId, foodId, expectedVersion)

RecipeRepository
  getById(accountId, recipeId)
  list(accountId, filter)
  create(accountId, input)
  update(accountId, recipeId, expectedVersion, input)
  duplicate(accountId, recipeId)
  archive(accountId, recipeId, expectedVersion)
  restore(accountId, recipeId, expectedVersion)
  deleteIfUnreferenced(accountId, recipeId, expectedVersion)

ReadyMealRepository
  getById(accountId, readyMealId)
  list(accountId, filter)
  create(accountId, input)
  update(accountId, readyMealId, expectedVersion, input)
  duplicate(accountId, readyMealId)
  archive(accountId, readyMealId, expectedVersion)
  restore(accountId, readyMealId, expectedVersion)
  deleteIfUnreferenced(accountId, readyMealId, expectedVersion)
```

List operations exclude archived records by default and accept a normalized
search term. Maintenance views may request archived records explicitly.

## Library application

The application facade exposes use cases equivalent to:

```text
createCustomFood(input)
updateCustomFood(foodId, expectedVersion, input)
listCustomFoods(filter)
archiveCustomFood(foodId, expectedVersion)
deleteCustomFood(foodId, expectedVersion)

createRecipe(input)
updateRecipe(recipeId, expectedVersion, input)
listRecipes(filter)
getRecipe(recipeId)
duplicateRecipe(recipeId)
archiveRecipe(recipeId, expectedVersion)
deleteRecipe(recipeId, expectedVersion)

createReadyMeal(input)
updateReadyMeal(readyMealId, expectedVersion, input)
listReadyMeals(filter)
getReadyMeal(readyMealId)
duplicateReadyMeal(readyMealId)
archiveReadyMeal(readyMealId, expectedVersion)
deleteReadyMeal(readyMealId, expectedVersion)
```

Create/update operations validate all children and persist the complete
aggregate atomically. Update operations require the version visible to the
caller; stale versions return `LIBRARY_VERSION_CONFLICT` without mutation.

## Diet insertion boundary

The diet application adds operations equivalent to:

```text
insertRecipeIntoDietDraft(
  draftId,
  expectedRevision,
  recipeId,
  variationId,
  mealId,
): DietDraft

insertReadyMealIntoDietDraft(
  draftId,
  expectedRevision,
  readyMealId,
  variationId,
  mealId,
): DietDraft
```

The operation reads an active Account-owned source, deep-copies its content
into the selected draft meal, creates fresh draft item/option IDs, stores the
source ID/version and snapshot, and increments the draft revision. It MUST NOT
call `DietRepository.confirmActive`, update patient activity, or delete the
library source.

If the source is archived between listing and insertion, the operation returns
an actionable blocked-state error. If the source has an existing snapshot in
the draft, editing the source does not replace it automatically.

## UI state contract

Library pages and dialogs expose the following states to their consumers:

```text
idle → loading → ready | empty | error
ready → saving → saved | validation-error | conflict | transaction-error
ready → archiving/deleting → saved | dependency-error | conflict | error
```

The UI must retain unsaved form input after validation or transaction errors,
show a retry/action where recovery is possible, and never display success for a
rolled-back operation. Dialogs preserve focus and support keyboard submission,
cancellation and escape according to the existing design-system contracts.

## Legacy cutover contract

After the cutover:

- `nutridiet_custom_foods`, `nutridiet_recipes` and `nutridiet_ready_meals` are
  not read or written by canonical pages, hooks, application code or diet
  insertion code;
- no adapter or migration translates those keys;
- TACO search uses the static dataset adapter only;
- all persisted library mutations pass through the application ports above.
