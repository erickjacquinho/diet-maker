# Implementation Plan: Refatoração, Componentização e Limpeza de Código (>200 Linhas)

**Branch**: `refatoracao-arquivos-200-linhas` | **Date**: 2026-08-07 | **Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-arquivos-200-linhas/spec.md)

**Input**: Feature specification from `specs/07-08-26-refatoracao-arquivos-200-linhas/spec.md`

## Summary

Refatoração abrangente, limpeza de código e componentização dos 20 arquivos fonte com mais de 200 linhas de código no diretório `src/`. A abordagem técnica é guiada pela skill `vercel-composition-patterns` para aplicar:
- **Compound Components** (para decompor organismos e modais gigantes em subcomponentes com escopo limpo).
- **Evitar Props Booleanas** (substituir múltiplas flags condicionais por composição de slots ou subcomponentes explícitos).
- **Desacoplamento de Estado** (separar estado UI de regras de negócio de cálculo/mutação em hooks/slices dedicados).
- **Manutenção dos Contratos Públicos** (preservação total das rotas, props públicas e comportamento nos testes automatizados).

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 14 (App Router) / React 18+
**Primary Dependencies**: React, Zustand, Radix UI, Tailwind CSS, Lucide React
**Storage**: Zustand local storage persistence / React State
**Testing**: Vitest / Testing Library / Playwright
**Target Platform**: Web Browsers
**Project Type**: Next.js Fullstack Nutritionist Application
**Performance Goals**: <150 linhas por arquivo refatorado, renderização rápida sem excesso de re-renders
**Constraints**: 0 regressões de funcionalidades, 100% de testes automatizados aprovados

## Constitution Check

- [x] Respeita o contrato de Atomic Design do projeto (Primitivos UI → Molecules → Organisms → Templates → Pages).
- [x] Não quebra compatibilidade com shadcn/ui.
- [x] Não modifica assinaturas públicas de hooks ou componentes exportados usados em outros pontos do projeto.
- [x] Zero regressões no build (`npm run build`) e nos testes unitários.

## Architecture & Decomposition Map

Abaixo está o mapa de refatoração para os 20 arquivos principais com mais de 200 linhas:

### 1. Páginas & Showcase (`src/app`)
- [`DesignSystemShowcase.tsx`](file:///c:/Programmer/diet-maker/src/app/design-system/components/DesignSystemShowcase.tsx) (567 L) → Decompor por abas/categorias em `sections/` (`TypographySection`, `ColorTokensSection`, `ButtonShowcaseSection`, `InputShowcaseSection`).
- [`src/app/pacientes/[id]/consulta/[date]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/consulta/[date]/page.tsx) (366 L) → Extrair subviews de consulta (`ConsultationHeader`, `AnthropometrySection`, `DietPlanSection`).
- [`src/app/pacientes/[id]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/page.tsx) (208 L) → Extrair abas de perfil (`PatientOverviewTab`, `PatientAssessmentsTab`, `PatientDietsTab`).
- [`src/app/presets/page.tsx`](file:///c:/Programmer/diet-maker/src/app/presets/page.tsx) (202 L) → Extrair gerenciador de presets em subcomponentes (`PresetGrid`, `PresetFilterBar`).
- [`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/dieta/[dietaId]/page.tsx) (200 L) → Extrair visualização de dieta em subcomponentes (`DietViewHeader`, `MealAccordionList`).

### 2. Custom Hooks & Lógica de Estado (`src/hooks` & `src/lib`)
- [`useDietBuilderPage.ts`](file:///c:/Programmer/diet-maker/src/hooks/useDietBuilderPage.ts) (471 L) → Quebrar em `useDietCalculations.ts`, `useMealManagement.ts`, `useDietPresets.ts`.
- [`patientsStore.ts`](file:///c:/Programmer/diet-maker/src/lib/patientsStore.ts) (385 L) → Separar slices (`patientCrudSlice`, `assessmentSlice`, `patientSearchSlice`).
- [`patientListView.ts`](file:///c:/Programmer/diet-maker/src/lib/patientListView.ts) (348 L) → Extrair rotinas de cálculo de status/filtro para helpers utilitários puros (`patientFilterHelpers.ts`).
- [`dietStore.ts`](file:///c:/Programmer/diet-maker/src/lib/dietStore.ts) (205 L) → Extrair cálculo de macronutrientes para utilitário puro (`macroCalculations.ts`).

### 3. Modais & Molecules (`src/components/molecules`)
- [`EditAssessmentModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx) (410 L) → Quebrar o formulário de avaliação física em etapas (`SkinfoldFields`, `CircumferenceFields`, `BodyFatResultSummary`).
- [`FoodSearchModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/FoodSearchModal.tsx) (215 L) → Decompor em `FoodSearchInput`, `FoodSearchResultsList`, `PortionQuantitySelector`.
- [`CustomFoodModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/CustomFoodModal.tsx) (206 L) → Extrair `NutrientInputGrid`.

### 4. Organisms & Templates (`src/components/organisms` & `src/components/templates`)
- [`PatientConsultationHistoryTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientConsultationHistoryTable.tsx) (292 L) → Extrair `ConsultationRow`, `ConsultationActionsMenu`.
- [`DietBuilderTemplate.tsx`](file:///c:/Programmer/diet-maker/src/components/templates/DietBuilderTemplate.tsx) (286 L) → Quebrar em `DietHeaderSlot`, `DietSummaryPanel`, `MealListSlot`.
- [`SidebarNav.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/SidebarNav.tsx) (279 L) → Decompor itens de navegação e grupos com Compound Components (`SidebarNav.Group`, `SidebarNav.Item`).
- [`FoodTableSection.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/foods/FoodTableSection.tsx) (233 L) → Extrair `FoodTableRow`, `FoodTablePagination`.
- [`PatientProfileHeader.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientProfileHeader.tsx) (227 L) → Extrair `PatientAvatarGroup`, `PatientQuickStats`.
- [`PatientListTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientListTable.tsx) (207 L) → Extrair `PatientTableRow`, `PatientTableFilters`.

### 5. Primitivos UI (`src/components/ui`)
- [`sidebar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/sidebar.tsx) (380 L) → Modularizar componentes de apoio da Sidebar mantendo os exportes shadcn.
- [`calendar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/calendar.tsx) (201 L) → Simplificar formatação interna mantendo API do React Day Picker.

## Project Structure

```text
specs/07-08-26-refatoracao-arquivos-200-linhas/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md
```
