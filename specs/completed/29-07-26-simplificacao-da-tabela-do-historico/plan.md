# Implementation Plan: Simplificação da Tabela do Histórico do Paciente e Novos Dropdowns em Editar Paciente

**Feature Directory**: `specs/29-07-26-simplificacao-da-tabela-do-historico`  
**Spec Reference**: [spec.md](./spec.md)  
**Created**: 29/07/2026  

---

## 1. Technical Context & Stack Alignment

- **Framework**: Next.js (App Router, React 19 Client Components).
- **Styling**: TailwindCSS com Design System baseado nos tokens `warm-*` (`warm-emerald`, `warm-charcoal`, `warm-inner`, `warm-card`, `warm-border`, `warm-muted`).
- **UI Primitives**: Radix UI (`@radix-ui/react-select`, `@radix-ui/react-dialog`), Lucide React Icons.
- **State Management & Persistence**: React Local State (`useState`, `useMemo`), `localStorage` (`nutridiet_custom_objectives`, `nutridiet_patients`).
- **Feedback & Toasts**: `sonner` (`toast.success`).

---

## 2. Architecture & Design Principles

1. **Progressive Disclosure Architecture**:
   - Level 1: Clean high-level table rows (Kcal/Macros in single line, Weight/%BF in single line).
   - Level 2: Inline accordion summary on row/chevron click (`toggleRowExpansion`).
   - Level 3: Full dedicated page view on "Abrir >" click (`/pacientes/[id]/dieta/[dietaId]`).

2. **Component Integration**:
   - `src/app/pacientes/[id]/page.tsx`: Single component containing patient profile header, unified consultation history table with accordion, patient edit dialog, custom objective creation popup, and delete confirmation dialog.

3. **Data Model Alignment**:
   - `Patient`: `{ id, name, age, gender, heightCm, weightKg, targetKcal, targetProtein, targetCarbs, targetFats, objective, lastConsultation, initials }`.
   - `customObjectives`: persistent string array in `localStorage`.

---

## 3. Risk Assessment & Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Hover state leak on non-interactive status badges | Low | Explicitly add `pointer-events-none` and fix `hover:bg-...` matches in badge classes |
| Existing custom gender/objective values breaking Select component | Medium | Dynamically append current values to Select options list if not present in default options |
| Nested dialog state conflict (Popup inside Edit Dialog) | Low | Manage `isAddObjectiveModalOpen` independently from `isEditModalOpen` |
