# Quickstart: Validação da adequação z-index

## Prerequisites

- Node.js and the repository dependencies installed.
- Browser desktop with viewport at least 1024px.
- The implementation branch must contain the files produced by `/speckit-implement` for this feature.

## 1. Static inventory and gate

Run from `C:\Programmer\diet-maker`:

```powershell
npm run verify:design-system-z-index
```

Expected outcome:

- zero numeric `z-*`, `z-[N]`, inline static `zIndex` or local overrides;
- all explicit and semantic usages classified;
- no mismatch between primitive family, context and canonical token;
- exit code `0`.

The baseline inventory before implementation is 19 explicit utility matches and 10 `SelectContent layer="modal"` consumers.

## 2. Existing project gates

```powershell
npm run verify:design-system
npm run verify:design-system-legacy
npm run type-check
npm run lint
git diff --check
```

Expected outcome: all commands exit `0`; the catalog remains fully covered and the existing legacy audit remains at zero findings.

## 3. Focused automated tests

```powershell
npm test -- tests/design-system/z-index-audit.test.ts tests/components/ui/overlay-layer.test.tsx tests/components/molecules/date-picker-field.test.tsx tests/components/molecules/create-recipe-modal.test.tsx tests/components/organisms/patient-list-table.test.tsx
```

Expected coverage:

- official token resolution and rejection of numeric/arbitrary values;
- Dialog/Sheet backdrop versus content order;
- Select/Popover default versus modal context;
- DatePicker focus, Escape and return focus;
- ingredient results with no result, one result, many results, keyboard selection and scroll;
- local `z-raised` use in search icons and PatientListTable.

## 4. Manual desktop matrix

1. Open `/pacientes`, `/alimentos`, `/presets`, `/receitas` and `/refeicoes-prontas`; inspect each search icon over its input and ensure it does not intercept pointer events.
2. Open each modal containing a Select (`CreatePatientModal`, `CustomFoodModal`, `CreatePresetModal`, `CreateRecipeModal`, `EditPatientModal`) and open every Select. The list must be above the modal content, remain keyboard-operable and return focus to its trigger.
3. Open `DatePickerField` inside the patient next-event dialog. Open the calendar, navigate with the keyboard, press Escape and select a date; the parent dialog must remain stable.
4. Open the ingredient search in `CreateRecipeModal` with zero, one and many results. Confirm that the results remain attached to the field, scroll when needed and close predictably.
5. Open the discard-confirmation dialog over the edit-patient dialog. Confirm backdrop/content order, safe initial focus, Escape behavior and return focus.
6. Repeat the critical cases at browser zoom 200% and with reduced motion enabled.

Expected outcome: no overlay appears behind its backdrop or parent modal, no lower content is interactable while blocked, focus order and accessible names remain intact, and no clipping prevents access to active content.

## 5. Documentation and traceability

Review [data-model.md](./data-model.md), [contracts/stacking-contract.md](./contracts/stacking-contract.md), the updated design-system category/profile documents and the generated audit output. Every record must end in `validated` or reference a complete, unexpired `ExceptionRecord`.
