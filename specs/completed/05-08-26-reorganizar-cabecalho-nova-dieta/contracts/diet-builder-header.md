# UI Contract: Diet Builder Header

**Feature**: [spec.md](../spec.md)  
**Consumer**: `src/components/templates/DietBuilderTemplate.tsx`  
**Route**: `/pacientes/[id]/dieta/[dietaId]`

## DOM and Reading Order

The rendered page must expose this order to both visual scanning and assistive technology:

1. Page navigation/header.
2. Diet mode selection.
3. Patient context and macro goals.
4. Meals section.

The route-level `main` remains supplied by `AppLayoutShell`; the template must not introduce an additional competing page landmark.

## Header Contract

| Element | Required behavior | Accessible name/role |
| --- | --- | --- |
| Back link | Returns to the current patient's prontuário using the existing patient id | `Voltar ao Prontuário` link |
| Context overline | Identifies the page context without duplicating patient name | Static text |
| Page title | Names the primary task and is the only page `h1` | `Elaboração de Plano Alimentar` heading |
| Save action | Remains the only primary action in page header and calls existing save callback | `Salvar Prescrição` button |
| More actions trigger | Opens the secondary action menu; never relies on hover | `Mais ações` button |

## Action Placement Contract

```text
Page header: Back + context + h1 + Save + More actions
Mode region: DietModeSwitcher
Patient/macros region: MacroTrackerHeader + Scale
Meals region: Refeições + New Meal + list/empty state
```

`WhatsApp` and `PDF` are menu items, not primary or contextual buttons in the page header. `Nova Refeição` is not rendered in the global header. `Escalar` is not rendered in the global header.

## Mode Contract

- `simple` shows the two-mode selection without cycle-only controls.
- `carb_cycling` reveals variation count, variation tabs and optional copy action inside the same mode region.
- The selected mode and active variation remain programmatically exposed.
- Existing `DietModeSwitcherProps` and callbacks remain unchanged.

## State and Focus Contract

- The empty meal state has one clear path to create the first meal.
- Missing optional callbacks omit their controls without placeholder gaps.
- Keyboard order follows DOM order.
- Focus is visible on every interactive control.
- Opening the secondary menu moves focus into the menu; Escape/outside dismissal closes it and returns focus to the trigger through the existing primitive behavior.
- The layout remains usable at 1024px, 1280px and 1440px without overlap or loss of essential controls.
