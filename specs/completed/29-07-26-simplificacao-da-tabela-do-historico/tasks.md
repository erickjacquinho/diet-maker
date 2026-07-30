# Implementation Tasks: Simplificação da Tabela do Histórico do Paciente e Novos Dropdowns

**Feature Directory**: `specs/29-07-26-simplificacao-da-tabela-do-historico`  
**Spec Reference**: [spec.md](./spec.md)  
**Plan Reference**: [plan.md](./plan.md)  
**Created**: 29/07/2026  

---

## Task Dependencies & Flow

```
[Phase 1: Setup] -> [Phase 2: User Story 1 (Table Simplification)] -> [Phase 3: User Story 2 (Patient Edit Modal Dropdowns & Popup)] -> [Phase 4: Polish & Verification]
```

---

## Phase 1: Setup & Environment Check

- [x] T001 [skill: general] Confirm Next.js environment, dependencies (Radix UI, Lucide icons, Sonner) and test suite baseline in `package.json`

---

## Phase 2: User Story 1 - Simplificação da Tabela de Histórico (`/pacientes/[id]`)

**Goal**: Reduzir a densidade da tabela do histórico de consultas do paciente, simplificar visualmente os badges e garantir navegação dedicada limpa.  
**Independent Test Criteria**: Acessar `/pacientes/[id]`, verificar que Dados Dietéticos e Valores Corporais exibem exatamente 1 linha por célula, os badges não reagem ao hover, o chevron expande o resumo inline e o botão "Abrir >" navega para a rota da dieta.

- [x] T002 [P] [US1] [skill: ui-ux-pro-max] Formatar a coluna "Dados Dietéticos" na tabela para exibir unicamente calorias e macros em uma linha em `src/app/pacientes/[id]/page.tsx`
- [x] T003 [P] [US1] [skill: ui-ux-pro-max] Formatar a coluna "Valores Corporais" na tabela para exibir unicamente peso e percentual de gordura corporal em uma linha em `src/app/pacientes/[id]/page.tsx`
- [x] T004 [P] [US1] [skill: ui-ux-pro-max] Aplicar `pointer-events-none` e padronizar paleta de cores dos badges em "Tipo de Registro" em `src/app/pacientes/[id]/page.tsx`
- [x] T005 [US1] [skill: ui-ux-pro-max] Garantir que o ícone Chevron acione o resumo inline (accordion) e que o botão "Abrir >" direcione para `/pacientes/[id]/dieta/[dietaId]` em `src/app/pacientes/[id]/page.tsx`

---

## Phase 3: User Story 2 - Dropdowns de Gênero e Objetivo com Popup de Adição (`/pacientes/[id]`)

**Goal**: Converter os campos de Gênero e Objetivo do modal "Editar Dados do Paciente" em componentes Select e adicionar botão para cadastro de novos objetivos via popup.  
**Independent Test Criteria**: Abrir o modal "Editar Dados do Paciente", selecionar Gênero e Objetivo nos dropdowns, clicar em `+ Novo`, cadastrar um novo objetivo no popup e confirmar a seleção e salvamento automático.

- [x] T006 [P] [US2] [skill: ui-ux-pro-max] Substituir o campo de entrada de texto de Gênero por componente Select com opções ("Masculino", "Feminino", "Outro") em `src/app/pacientes/[id]/page.tsx`
- [x] T007 [P] [US2] [skill: ui-ux-pro-max] Substituir o campo de entrada de texto de Objetivo por componente Select alimentado por opções padrão e customizadas em `src/app/pacientes/[id]/page.tsx`
- [x] T008 [US2] [skill: ui-ux-pro-max] Implementar botão `+ Novo` acoplado ao campo Objetivo para acionar o popup modal de cadastro em `src/app/pacientes/[id]/page.tsx`
- [x] T009 [US2] [skill: ui-ux-pro-max] Criar popup modal `Dialog` "Novo Objetivo" com persistência em `localStorage` (`nutridiet_custom_objectives`), seleção automática e toast de confirmação em `src/app/pacientes/[id]/page.tsx`

---

## Phase 4: Polish, Type-Checking & Verification

- [x] T010 [skill: general] Executar checagem de tipos estáticos TypeScript sem erros via `npm run type-check`
- [x] T011 [skill: general] Executar suíte completa de testes automatizados com 100% de aprovação via `npm run test`
