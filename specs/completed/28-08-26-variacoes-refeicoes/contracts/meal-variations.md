# UI Contract: Variações de Refeições

**Feature**: [spec.md](../spec.md)  
**Data model**: [data-model.md](../data-model.md)  
**Design system sources**: `design-system/components/categories/selection.md`, `design-system/components/profiles/ui/tabs.md`, `design-system/components/profiles/organisms/meal-card-container.md`

## Scope

This contract defines the user-facing behavior of alternatives inside one meal card. It applies to the Dieta Simples and to meals inside each day of the Ciclo de Carboidratos.

## Visual states

### Single-option state

- The meal card keeps its existing header, food table, actions, empty state and macro summary.
- No variation badge or tab is shown.
- The “Adicionar variação” action remains available until the group reaches five options.

### Multi-option state

- The shared meal name and time remain in the existing header.
- A tab group appears beside the meal name with labels `Variação 1` through the current option count.
- Only the selected option’s foods, amounts and calculated summary are shown in the card.
- The selected tab has a programmatic selected state and the visual treatment prescribed by the selection category.
- The tab group must not introduce a new card, new meal row or alternate name field.

### Limit state

- Once five options exist, adding another is unavailable.
- The unavailable state must be perceivable without relying only on color and must not alter existing options.

## Interaction contract

| Interaction | Required result |
| --- | --- |
| Add variation | Clone the active option, append it, select it and expose it for immediate editing |
| Select tab | Show only that option in the same meal card and update the active totals |
| Edit name/time | Update the shared meal identity for every option in the group |
| Edit food action | Mutate only the currently selected option |
| Delete active option | Remove it, renumber remaining labels and select the last remaining option |
| Duplicate meal | Create a separate meal group containing all existing options and their independent data |
| Reopen diet | Start each group at Variação 1 |

## Accessibility contract

- The tab group has an accessible name that identifies the meal and its options.
- Tabs use the existing tabs primitive and its ARIA relationship between tab and panel.
- Selection is exposed with `aria-selected`/equivalent state; the active panel is associated with its tab.
- Keyboard users can enter the tab group once, move between tabs with arrow keys, reach the first/last option with Home/End and activate the focused option according to the manual tab interaction contract.
- Every tab and the add/delete controls have a visible focus treatment.
- Disabled add action communicates the five-option limit through accessible text or an associated description.
- No interactive control is nested inside a tab trigger.

## Layout and tokens

- Reuse the current meal-card surface and header geometry.
- Use the selection category’s compact tab dimensions, tokens, 1px borders and focus ring.
- Use canonical typography for tab labels/badges and existing action/button tokens.
- Do not add arbitrary colors, spacing, radii, shadows or z-index values.
- Respect reduced motion for any tab/content transition.

## Boundaries

- The contract does not define patient-facing PDF, WhatsApp or other export output.
- Day-level carbohydrate-cycle tabs and meal-level variation tabs are separate selection groups and must not share labels or state.
- This contract does not create or modify a generic primitive in `src/components/ui`.
