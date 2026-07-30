# Research & Design Decisions: Preset Backdrop Confirmation & Patient Multiplicative Calculation

## Decision 1: Intercepting Backdrop Clicks on Shadcn Dialog

- **Context**: Clicking outside the preset creation modal in `/presets` closes the dialog immediately, risking loss of filled form data.
- **Decision**: Intercept `onInteractOutside` / `onPointerDownOutside` on `DialogContent` in `src/app/presets/page.tsx`.
- **Implementation**:
  ```tsx
  <DialogContent
    onInteractOutside={(e) => {
      e.preventDefault();
      setIsConfirmDiscardOpen(true);
    }}
  >
  ```
- **Rationale**: Prevents accidental modal closure while giving the user a clear choice to confirm discarding their changes or return to editing.

## Decision 2: Multiplicative Preset Resolution for Patient Data

- **Context**: When a preset contains `proteinMode`, `carbsMode`, or `fatsMode` set to `'multiplicativo'`, its total grams depends on body weight in kg.
- **Decision**: Implement `resolvePresetForPatient(preset: DietPreset, patientWeight: number)` in `src/lib/presetUtils.ts`.
- **Logic**:
  - If `proteinMode === 'multiplicativo'`, `proteinG = Math.round((proteinValue ?? 0) * patientWeight * 10) / 10`. Otherwise `proteinG = preset.proteinG`.
  - Same for `carbsG` and `fatsG`.
  - Recalculate total calories using `calculatePresetCalories(proteinG, carbsG, fatsG)`.
- **Rationale**: Ensures exact patient weight response when applying presets, maintaining consistent nutritional accuracy.
