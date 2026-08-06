# Quickstart: Validar o cabeçalho da criação de dieta

**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js disponível no ambiente do projeto.
- Dependências instaladas com `npm install`.
- Um paciente de fixture ou registro local que permita abrir `/pacientes/[id]/dieta/nova`.

## Automated Validation

Run from `C:\Programmer\diet-maker`:

```powershell
npm run type-check
npm test -- tests/components/templates/diet-builder-template.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx
npm test
npm run verify:design-system-legacy
npm run audit:atomic-design
```

Expected outcomes:

- TypeScript exits with zero errors.
- Directed tests cover order, action placement, callbacks, simple mode, cycle mode, empty meals and menu keyboard behavior.
- The full suite remains green.
- Design-system legacy audit reports zero new findings.
- Atomic audit reports no new dependency violation.

## Manual Visual Validation

Start the application:

```powershell
npm run dev
```

Open `/pacientes/{patientId}/dieta/nova` at each viewport width: 1024px, 1280px and 1440px.

### Scenario A: Simple diet

1. Confirm the top order is back/context/title on the left and `Salvar Prescrição` on the right.
2. Confirm `Mais ações` is the only secondary group in the page header.
3. Confirm the compact mode selector appears before patient/macros.
4. Confirm the patient context appears once and `Escalar` is adjacent to the macros region.
5. Confirm `Nova Refeição` appears with the `Refeições` section.

### Scenario B: Carb cycling

1. Select `Ciclo de Carboidratos`.
2. Confirm variation count, active variation tabs and optional copy action appear inside the same mode surface.
3. Confirm the page header and patient context do not move into an overlapping layout.
4. Use Tab, Arrow keys, Enter/Space and Escape to verify visible focus and selection behavior.

### Scenario C: Empty meals

1. Open a diet with no meals.
2. Confirm the empty state explains the next step and exposes only one clear action path to create a meal.
3. Confirm no empty optional action slot is visible.

### Scenario D: Secondary actions

1. Open `Mais ações` with mouse and keyboard.
2. Confirm the menu exposes text labels `WhatsApp` and `PDF` with their icons.
3. Confirm Escape and outside dismissal return focus to the trigger.
4. Confirm selecting either item preserves the existing callback behavior.

## Regression Checklist

- Saving still persists the diet and shows the existing feedback.
- Mode switching still updates the same diet state.
- Adjusting goals, scaling, adding meals, sharing and exporting keep their existing behavior.
- No new mobile/tablet layout or dark-mode branch was introduced.

## Validation Record (2026-08-05)

- `npm run type-check`: PASS.
- `npx vitest run tests/components/templates/diet-builder-template.test.tsx --pool=threads --maxWorkers=1`: PASS, 5/5 tests.
- `npx vitest run tests/components/molecules/diet-mode-switcher.test.tsx --pool=threads --maxWorkers=1`: PASS, 3/3 tests.
- `npm run verify:design-system-legacy`: PASS, 0 findings.
- `npm run audit:atomic-design`: PASS, 100% conformity, 0 violations.
- `npm run build`: PASS; the build recognized `/pacientes/[id]/dieta/[dietaId]`. It emitted the existing Next/ESLint compatibility warning (`useEslintrc`, `extensions`) but exited with code 0.
- Playwright production smoke check with `next start -p 3001 -H 127.0.0.1`: PASS at 1024px, 1280px and 1440px for header hierarchy, action placement, keyboard menu, simple/cycle mode, overflow and contextual meal/macro actions.
- Full `npm test` was attempted with the repository's 42 test files both in the configured single-worker mode and with four workers; the runner exceeded the timeout without reporting assertion failures. The feature's affected tests pass independently as recorded above; this runner limitation should be rechecked in a clean CI process.
