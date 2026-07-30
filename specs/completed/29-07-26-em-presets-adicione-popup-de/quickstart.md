# Quickstart & Verification Guide

## Automated Verification

Run unit tests to verify multiplicative calculations:

```bash
npm test src/lib/__tests__/presetUtils.test.ts
```

## Manual Verification

1. **Backdrop Click Confirmation in `/presets`**:
   - Navigate to `/presets`.
   - Click "Criar Novo Preset".
   - Type a title into the form.
   - Click outside the modal on the background overlay.
   - Verify that the confirmation modal ("Deseja descartar as alterações?") appears.
   - Click "Cancelar" / "Continuar Editando" → Form data remains.
   - Click "Descartar" → Modal closes and form resets.

2. **Patient Multiplicative Macro Recalculation**:
   - Verify `resolvePresetForPatient` utility recalculates `proteinG`, `carbsG`, `fatsG` and total calories correctly when passed `patientWeight`.
