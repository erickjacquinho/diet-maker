# Implementation Plan: Duas Tabelas Especializadas (Avaliações e Dietas)

**Feature Branch**: `23-08-26-tabelas-isoladas-dietas-avaliacoes`
**Created**: 2026-08-23
**Status**: Approved

## Technical Context
- **Framework**: Next.js App Router (Client Components).
- **Componente Base**: `src/components/molecules/DataTable.tsx` (molécula canônica reutilizada para ambas as tabelas).
- **Componentes Especializados**:
  - `src/components/organisms/patient/PatientAssessmentsTable.tsx` (Tabela de Avaliações Físicas).
  - `src/components/organisms/patient/PatientDietsTable.tsx` (Tabela de Prescrições Dietéticas).
  - Subcomponentes de linha: `AssessmentTableRow.tsx`, `DietTableRow.tsx`.
  - Exportação em `src/components/organisms/index.ts`.
- **Página de Perfil**: `src/app/pacientes/[id]/page.tsx`.

## Architecture & Data Flow

1. **PatientAssessmentsTable**:
   - Consome `BodyAssessment[]` ordenado por data decrescente.
   - Colunas: `date`, `weight`, `bodyFat`, `muscleMass`, `waist`, `evolution`, `actions`.
   - Renderiza expansão inline para dobras e perímetros quando acionado o chevron de detalhes.
2. **PatientDietsTable**:
   - Consome `HistoricalDiet[]` ordenado por data decrescente.
   - Colunas: `date`, `name`, `status`, `calories`, `macros`, `actions`.
   - Renderiza botão "Ver Cardápio" que dispara `onOpenReadOnlyDiet(diet)`.
3. **Composição em `page.tsx`**:
   - Dois blocos `<Surface>` empilhados:
     * Card 1 (Superior): Avaliações Físicas com botão "Nova Avaliação".
     * Card 2 (Inferior): Prescrições Dietéticas com botão "Nova Dieta".

## Phase Organization
- **Phase 1**: Componente `PatientAssessmentsTable` com colunas de antropometria e expansão de perímetros.
- **Phase 2**: Componente `PatientDietsTable` com colunas de macros, status e botão de cardápio.
- **Phase 3**: Integração no perfil do paciente (`src/app/pacientes/[id]/page.tsx`).
- **Phase 4**: Testes unitários e de integração validando ambas as tabelas.
