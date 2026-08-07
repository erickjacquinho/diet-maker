# Phase 0: Research & Composition Pattern Decisions

**Feature**: [plan.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-composicao-codigo-limpo/plan.md)

---

## 1. Pattern Decision: Avoiding Boolean Prop Proliferation
- **Problem**: Modais e componentes como `EditAssessmentModal.tsx` (410 linhas) e `DietModeSwitcher.tsx` usam múltiplos booleans (`isEditing`, `isReadOnly`, `showChart`, `isCompact`, `hasError`) para alterar o layout.
- **Decision**: Adotar o padrão **Explicit Variants** e **Compound Components**.
- **Rationale**: Em vez de passar 8 props para um único componente gigante, dividir a interface em subcomponentes puros (`AssessmentModal.Header`, `AssessmentModal.Form`, `AssessmentModal.NavySection`, `AssessmentModal.SkinfoldSection`) que leem o contexto compartilhado.

---

## 2. Pattern Decision: Page Decomposition into Hooks & Sub-Organisms
- **Problem**: As páginas de rotas (`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` - 825 linhas, `src/app/alimentos/page.tsx` - 798 linhas, `src/app/pacientes/[id]/page.tsx` - 573 linhas) combinam requisição/leitura de estado, sincronização de URL, form handlers e JSX extenso em um só bloco.
- **Decision**: 
  1. Extrair toda a orquestração de estado para custom hooks em `src/hooks/` (ex: `useDietBuilderPage.ts`, `useFoodSearchPage.ts`, `usePatientProfilePage.ts`).
  2. Dividir o JSX em organismos encapsulados com menos de 150 linhas cada.
- **Rationale**: Torna as rotas do Next.js puramente declarativas, reduzindo drasticamente as linhas de cada `page.tsx` para <200 linhas.

---

## 3. Pattern Decision: Zustand Store Slices & Memoized Selectors
- **Problem**: `patientsStore.ts` (382 linhas) e `patientListView.ts` (348 linhas) concentram estado, sincronização com localStorage, utilitários de busca e cálculos nutricionais/antropométricos.
- **Decision**: Refatorar para Zustand Slice Pattern (`createPatientSlice`, `createAssessmentSlice`, `createConsultationSlice`) concatenados na exportação principal.
- **Rationale**: Mantém 100% da compatibilidade com `usePatientsStore()` e melhora a coesão do código e a isolabilidade dos testes unitários.

---

## 4. Pattern Decision: Test Helpers & Fixture Builders
- **Problem**: `component-catalog.test.mjs` (589 linhas) e `patientsStore.test.ts` (213 linhas) repetem dezenas de linhas de mock data de pacientes.
- **Decision**: Extrair fixtures e construtores de objetos simulados para `tests/fixtures/` e utilitários de asserção visual para `tests/helpers/`.
- **Rationale**: Reduz a duplicação em testes, mantendo foco direto nas asserções sem perder cobertura.
