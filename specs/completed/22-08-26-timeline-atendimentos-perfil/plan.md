# Implementation Plan: Timeline de Atendimentos com Filtros Rápidos

**Feature Branch**: `22-08-26-timeline-atendimentos-perfil`
**Created**: 2026-08-22
**Status**: Approved

## Technical Context

- **Framework**: Next.js App Router (Client Components com design system em React / Tailwind).
- **Storage**: `nutridiet_assessments_*` e `nutridiet_diets_*` no LocalStorage do navegador.
- **Localização de Componentes**:
  - Organisms: `src/components/organisms/PatientConsultationHistoryTable.tsx`
  - Subcomponentes: `src/components/organisms/patient/ConsultationHistoryRow.tsx`
  - Selectors/Adapters: `src/lib/patientProfileConsultations.ts`
  - Página de perfil: `src/app/pacientes/[id]/page.tsx`

## Constitution Check

- [x] **I. Atomic Design**: A timeline reside na camada de Organisms/Molecules, sem violar camadas inferiores de UI/Atoms.
- [x] **II. Canonical Design System**: Utilização de `Surface`, `Badge`, `textStyle`, tokens semânticos e paleta canônica de macronutrientes.
- [x] **III. Desktop Scope & Accessibility**: Resolução desktop >= 1024px, conformidade total com WCAG 2.2 AA, foco visível e teclado.
- [x] **IV. Test-First Quality**: Testes unitários de seletores e renderização cobrindo múltiplos eventos no mesmo dia e filtros.
- [x] **V. Spec-Driven**: Execução controlada via SDD.

## Architecture & Data Flow

1. **Seletores de Dados**:
   - `buildPatientTimelineEvents(diets, assessments)` recebe arrays brutos e produz `TimelineDateGroup[]`.
   - Cada grupo possui `date`, `dateIso`, e `items: TimelineItem[]`.
   - `TimelineItem` é uma união discriminada `{ type: 'diet', diet } | { type: 'assessment', assessment }`.
2. **Componente de Timeline**:
   - Estado local de filtro: `'all' | 'assessments' | 'diets'`.
   - Renderização dos grupos filtrados.
   - Estado local de expansão de dobras por card de avaliação (`expandedAssessmentIds: Set<string>`).
   - Disparo do modal de cardápio (`onOpenReadOnlyDiet`) ao clicar em "Ver Cardápio".

## Phase Organization

- **Phase 1**: Modelagem e seletores de dados em `src/lib/patientProfileConsultations.ts` + testes unitários.
- **Phase 2**: Subcomponentes da timeline (`TimelineDietCard`, `TimelineAssessmentCard`) com progressive disclosure.
- **Phase 3**: Componente principal da Timeline com abas de filtro e contadores.
- **Phase 4**: Integração na página de perfil `src/app/pacientes/[id]/page.tsx` e validação com suíte de testes.
