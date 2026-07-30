# Implementation Plan: Preset Backdrop Confirmation & Patient Multiplicative Macro Recalculation

**Branch**: `specs/29-07-26-em-presets-adicione-popup-de` | **Date**: 2026-07-29 | **Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/29-07-26-em-presets-adicione-popup-de/spec.md)

**Input**: Feature specification from `/specs/29-07-26-em-presets-adicione-popup-de/spec.md`

## Summary

Implement backdrop click confirmation when closing the preset dialog in `/presets` to prevent accidental loss of user data, and update multiplicative macro logic (`resolvePresetForPatient`) so that when presets with `multiplicativo` (`g/kg`) macros are loaded/applied to a patient, they calculate total macro grams and calories using the target patient's weight (`weightKg`).

## Technical Context

**Language/Version**: TypeScript / Next.js App Router (React 19)
**Primary Dependencies**: Tailwind CSS, Shadcn UI (Dialog, Select, Input, Button), Lucide Icons
**Storage**: localStorage (`nutridiet_presets`, `nutridiet_patients`)
**Testing**: Jest / React Testing Library (`src/lib/__tests__/presetUtils.test.ts`)
**Target Platform**: Web Browsers
**Project Type**: Next.js Web Application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- All changes maintain clean separation of concerns and existing UI styling tokens.
- Confirmation dialog uses accessible modal patterns without breaking existing UI.

## Project Structure

### Documentation (this feature)

```text
specs/29-07-26-em-presets-adicione-popup-de/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/
    ├── requirements.md
    └── ux.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── presets/
│       └── page.tsx           # Backdrop click interception & confirmation dialog
├── lib/
│   ├── presetUtils.ts         # Macro calculation & resolvePresetForPatient utility
│   └── __tests__/
│       └── presetUtils.test.ts # Unit tests for multiplicative macro calculations
```

**Structure Decision**: Single project Next.js web application structure.

## Phase 0: Research & Key Decisions

1. **Backdrop Interception in Shadcn Dialog**:
   - Shadcn `DialogContent` accepts `onInteractOutside` / `onPointerDownOutside` events.
   - By calling `e.preventDefault()`, we prevent the Dialog from closing directly when clicking outside, and set state to open a confirmation dialog (`isDiscardConfirmOpen`).
   - If confirmed, reset form state and close both modals.

2. **Patient Weight Resolution**:
   - `resolvePresetForPatient(preset: DietPreset, patientWeight: number)` calculates macro grams for `protein`, `carbs`, and `fats` based on whether their mode is `multiplicativo` (`value * patientWeight`) or `absoluto` (`value` or `proteinG`).
   - Also calculates the updated `targetKcal` using `calculatePresetCalories`.

## Phase 1: Artifacts

- [research.md](file:///c:/Programmer/diet-maker/specs/29-07-26-em-presets-adicione-popup-de/research.md)
- [data-model.md](file:///c:/Programmer/diet-maker/specs/29-07-26-em-presets-adicione-popup-de/data-model.md)
- [quickstart.md](file:///c:/Programmer/diet-maker/specs/29-07-26-em-presets-adicione-popup-de/quickstart.md)
