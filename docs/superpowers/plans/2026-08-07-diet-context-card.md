# Diet Context Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compact only the internal diet context surface so patient information remains on the left and the diet mode choice remains on the right.

**Architecture:** Reuse `PatientBadgeHeader` and `DietModeSwitcher` inside the existing `DietBuilderTemplate` surface. The embedded mode switcher receives a tighter presentation with a short heading and inline segmented control; no new primitive or public component is introduced.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS tokens, shadcn/Radix primitives, Vitest, Testing Library, Playwright browser validation.

## Global Constraints

- Modify only the internal `diet-context-card`; leave the external `PageContextHeader`, metrics, meals, and actions unchanged.
- Use existing design tokens and semantic classes; do not add hex colors, arbitrary spacing, mobile breakpoints, or new `src/components/ui` primitives.
- Preserve accessible radio semantics, arrow-key navigation, focus-visible states, and conditional carb-cycling controls.
- Keep the patient weight visible once and do not repeat it in the objective line.
- Desktop-only layout remains the supported platform, starting at 1024px.

---

### Task 1: Update template behavior assertions

**Files:**
- Modify: `tests/components/templates/diet-builder-template.test.tsx:38-68`
- Test: `tests/components/molecules/diet-mode-switcher.test.tsx`

**Interfaces:**
- Consumes: Existing `DietBuilderTemplate` and `DietModeSwitcher` public props.
- Produces: Regression coverage for the short diet heading and preserved radio behavior.

- [ ] **Step 1: Update the template heading assertion**

Change the template test lookup from:

```tsx
within(contextCard).getByRole('heading', { name: 'Modelo de Dieta Prescrita' });
```

to:

```tsx
within(contextCard).getByRole('heading', { name: 'Modelo de dieta' });
```

- [ ] **Step 2: Run the focused template and mode tests before implementation**

Run: `npm test -- --run tests/components/templates/diet-builder-template.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx`

Expected: the template assertion fails because the current embedded heading is still `Modelo de Dieta Prescrita`; the existing mode behavior tests continue to pass.

### Task 2: Compact the embedded diet mode presentation

**Files:**
- Modify: `src/components/molecules/DietModeSwitcher.tsx:54-96`
- Test: `tests/components/templates/diet-builder-template.test.tsx`

**Interfaces:**
- Consumes: Existing `embedded` presentation flag and all existing callbacks.
- Produces: The same `DietModeSwitcherProps` API with a compact embedded layout.

- [ ] **Step 1: Replace only the embedded header layout and copy**

Use a row-oriented embedded header while retaining the standalone presentation:

```tsx
<div className={embedded
  ? 'flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-3'
  : 'flex flex-row items-center justify-between gap-3 border-b border-border-subtle pb-3'}>
  <div>
    <h3 className="font-bold text-style-body-small text-text-primary tracking-overline flex items-center gap-2">
      <Repeat size={16} className="text-success" aria-hidden="true" />
      <span>Modelo de dieta</span>
    </h3>
  </div>

  <div className="flex items-center self-auto p-1 bg-surface-subtle border border-border-subtle rounded-control">
    {/* existing radio buttons remain unchanged */}
  </div>
</div>
```

Remove only the explanatory paragraph from the embedded header. Keep both radio buttons, their labels, `aria-checked`, roving `tabIndex`, callbacks, icons, and keyboard handlers unchanged.

- [ ] **Step 2: Run the focused tests after the mode presentation change**

Run: `npm test -- --run tests/components/templates/diet-builder-template.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx`

Expected: PASS, including the updated short heading and existing keyboard/cycle-control behavior.

### Task 3: Tighten the existing context surface and patient copy

**Files:**
- Modify: `src/components/templates/DietBuilderTemplate.tsx:135-153`
- Modify: `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx:584-589`

**Interfaces:**
- Consumes: Existing `macroTrackerData`, `PatientBadgeHeader`, and `DietModeSwitcher` props.
- Produces: A compact two-column context surface with a single visible weight value.

- [ ] **Step 1: Reduce only the context surface spacing**

Update the existing inner surface layout to use the approved token scale:

```tsx
<div className="p-4 lg:p-6">
  <div className="grid grid-cols-12 items-center gap-4">
    <div className="col-span-5 flex min-w-0 items-center border-r border-border-subtle pr-4">
      {/* existing PatientBadgeHeader */}
    </div>
    <div className="col-span-7 min-w-0">
      {/* existing DietModeSwitcher */}
    </div>
  </div>
</div>
```

Do not change the surface component, its `data-testid`, or the DOM order of patient before diet mode.

- [ ] **Step 2: Stop passing the weight twice in the patient goal description**

Replace the diet page data passed to the template:

```tsx
patientGoalDescription: `${patient.objective || 'Prescrição Alimentar'} • Peso: ${patient.weightKg}kg`,
```

with:

```tsx
patientGoalDescription: patient.objective || 'Prescrição Alimentar',
```

The `PatientBadgeHeader` weight badge remains the single visible weight value.

- [ ] **Step 3: Run focused tests**

Run: `npm test -- --run tests/components/templates/diet-builder-template.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx`

Expected: PASS with patient and diet mode still inside one surface and all callbacks preserved.

### Task 4: Verify the implementation

**Files:**
- Verify: `src/components/templates/DietBuilderTemplate.tsx`
- Verify: `src/components/molecules/DietModeSwitcher.tsx`
- Verify: `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`

**Interfaces:**
- Consumes: The completed context card implementation.
- Produces: Verified code and visual behavior for `/pacientes/pat-1786033492617-8xcc5/dieta/nova`.

- [ ] **Step 1: Run type-check**

Run: `npm run type-check`

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0 with no new lint errors.

- [ ] **Step 3: Run the focused test suite**

Run: `npm test -- --run tests/components/templates/diet-builder-template.test.tsx tests/components/templates/diet-builder-template.surface.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx`

Expected: all focused tests pass.

- [ ] **Step 4: Inspect the route in a desktop browser**

Start the app with `npm run dev`, open `/pacientes/pat-1786033492617-8xcc5/dieta/nova`, and verify:

1. The external breadcrumb/header is unchanged.
2. The internal surface has patient content on the left and diet mode on the right.
3. The objective line does not repeat the weight.
4. Switching to carb cycling reveals the existing variation controls.
5. Tab and arrow-key navigation still exposes visible focus.
