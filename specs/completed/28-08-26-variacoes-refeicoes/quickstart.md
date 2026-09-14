# Quickstart: Validar Variações de Refeições

**Feature**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)

## Prerequisites

- Node.js and npm available in the project environment.
- A local patient record that can open the diet builder.
- The feature branch implementation completed before running the manual scenarios.

## Automated validation

Run from `C:\Programmer\diet-maker`:

```powershell
npm run type-check
npm test -- --run
npm run lint
npm run verify:design-system
```

The checks should finish without type, lint or design-system violations. The focused tests should cover the data transitions, active-option calculations and card interaction contract described in [data-model.md](data-model.md) and [contracts/meal-variations.md](contracts/meal-variations.md).

## Manual validation matrix

1. Open a new Dieta Simples with one meal and confirm the card is visually unchanged and has no variation badge.
2. Add a variation. Confirm the original is Variação 1, a copied Variação 2 is appended, and Variação 2 opens automatically.
3. Add a third variation while Variação 2 is open. Confirm the new Variação 3 copies Variação 2 and opens immediately.
4. Change an item, amount and order in Variação 3. Switch to Variação 1 and confirm its content is unchanged.
5. Give two options intentionally different macros. Switch tabs and confirm only the open option contributes to the meal and diet totals.
6. Add options up to Variação 5. Confirm the sixth-add action is unavailable and existing data is unchanged.
7. Delete the active option. Confirm the remaining badges are sequential and the last remaining option is selected. Delete until one remains and confirm badges/tabs disappear.
8. Change the meal name and time from an option. Confirm the shared identity changes for every option.
9. Duplicate a meal with multiple options. Confirm the duplicate contains every option, opens at Variação 1, and later edits do not cross-update the source.
10. Repeat the creation, isolation and deletion checks inside a day of the Ciclo de Carboidratos, then switch to another day and confirm the groups remain independent.
11. Reload an existing diet without variations. Confirm it opens as the existing single-option meal with all original data intact and Variação 1 is the default where alternatives exist.
12. Navigate the variation tabs and actions with keyboard only. Confirm focus is visible, selected state is announced and no action requires pointer input.

## Performance validation

With up to five options in a meal group, measure the time from selecting a tab to updated food content and totals. At least 95% of observed selections should complete within 500ms, as defined by `SC-011`.
