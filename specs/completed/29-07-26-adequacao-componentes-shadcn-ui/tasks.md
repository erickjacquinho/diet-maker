# Tasks: Adequação de 100% dos Componentes de Telas e Modais ao Design System Shadcn

**Input**: Design documents from `specs/29-07-26-adequacao-componentes-shadcn-ui/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [skill: ...] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação dos primitivos Shadcn UI em `src/components/ui/` e configuração de re-exports atômicos.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação dos primitivos Shadcn UI em `src/components/ui/` e configuração de re-exports atômicos.

- [X] T001 [skill: shadcn] Validar a integridade dos 14 componentes Shadcn UI em `src/components/ui/` (`badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `popover.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `table.tsx`, `tabs.tsx`, `tooltip.tsx`)
- [X] T002 [skill: shadcn] [P] Refatorar `src/components/atoms/Button.tsx` para reexportar/encapsular o Shadcn `Button` (`src/components/ui/button.tsx`) mantendo compatibilidade de API
- [X] T003 [skill: shadcn] [P] Refatorar `src/components/atoms/Input.tsx` para reexportar/encapsular o Shadcn `Input` (`src/components/ui/input.tsx`) mantendo compatibilidade de API
- [X] T004 [skill: shadcn] [P] Refatorar `src/components/atoms/Badge.tsx` para reexportar/encapsular o Shadcn `Badge` (`src/components/ui/badge.tsx`) mantendo compatibilidade de API
- [X] T005 [skill: shadcn] [P] Refatorar `src/components/atoms/IconButton.tsx` utilizando o Shadcn `Button` (`src/components/ui/button.tsx`) com variante icon/ghost

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Unificação dos componentes atômicos, moleculares e estruturais do projeto

- [X] T006 [skill: shadcn] Refatorar `src/components/molecules/MacroMetricCard.tsx` para utilizar `Card` e `CardContent` de `src/components/ui/card.tsx`
- [X] T007 [skill: shadcn] Refatorar `src/components/molecules/MealItemRow.tsx` substituindo `<button>` nativo por `Button` de `src/components/ui/button.tsx` e inputs por `Input` de `src/components/ui/input.tsx`
- [X] T008 [skill: shadcn] Refatorar `src/components/molecules/PatientBadgeHeader.tsx` utilizando `Badge` de `src/components/ui/badge.tsx`
- [X] T009 [skill: shadcn] Refatorar `src/components/molecules/TacoSearchInput.tsx` utilizando `Input` de `src/components/ui/input.tsx`
- [X] T010 [skill: shadcn] Refatorar `src/components/organisms/MacroTrackerHeader.tsx` utilizando `Card` de `src/components/ui/card.tsx`
- [X] T011 [skill: shadcn] Refatorar `src/components/organisms/MealCardContainer.tsx` utilizando `Card`, `CardContent`, `CardHeader` e `Button` de `src/components/ui/`
- [X] T012 [skill: shadcn] Refatorar `src/components/organisms/SidebarNav.tsx` utilizando `Sheet` (`src/components/ui/sheet.tsx`), `Button` (`src/components/ui/button.tsx`) e `Tooltip` (`src/components/ui/tooltip.tsx`)
- [X] T013 [skill: frontend-design] Refatorar `src/components/templates/DietBuilderTemplate.tsx` utilizando `Button` (`src/components/ui/button.tsx`) e `Tabs` (`src/components/ui/tabs.tsx`)

---

## Phase 3: User Story 1 - Padronização dos Modais e Overlays da Aplicação (Priority: P1) 🎯 MVP

**Goal**: Substituir 100% dos overlays customizados `div.fixed.inset-0` em páginas por Shadcn `Dialog` ou `Sheet`.

**Independent Test**: Abrir e interagir com todos os modais da aplicação, garantindo fechamento via tecla ESC, overlay escurecido padrão Radix e acessibilidade.

- [X] T014 [skill: shadcn] [US1] Migrar o modal de "Criar Alimento Customizado" em `src/app/alimentos/page.tsx` para `Dialog` de `src/components/ui/dialog.tsx`
- [X] T015 [skill: shadcn] [US1] Migrar o modal de "Novo Paciente" em `src/app/pacientes/page.tsx` para `Dialog` de `src/components/ui/dialog.tsx`
- [X] T016 [skill: shadcn] [US1] Migrar o modal de "Novo Plano Alimentar" em `src/app/pacientes/[id]/page.tsx` para `Dialog` de `src/components/ui/dialog.tsx`
- [X] T017 [skill: shadcn] [US1] Migrar os modais de "Adicionar Refeição", "Busca TACO" e "Ajuste de Porção" em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` para `Dialog` e `Sheet` de `src/components/ui/`
- [X] T018 [skill: shadcn] [US1] Migrar o modal de "Novo Preset" em `src/app/presets/page.tsx` para `Dialog` de `src/components/ui/dialog.tsx`
- [X] T019 [skill: shadcn] [US1] Migrar o modal de "Nova Refeição Pronta" em `src/app/refeicoes-prontas/page.tsx` para `Dialog` de `src/components/ui/dialog.tsx`

---

## Phase 4: User Story 2 - Substituição de Formulários e Botões Nativos nas Telas (Priority: P2)

**Goal**: Eliminar 100% das tags HTML nativas `<button>`, `<input>`, `<select>` e `<table` das telas em `src/app/`.

**Independent Test**: Navegar por todas as 6 rotas da aplicação confirmando a renderização visual unificada de botões, inputs, dropdowns e tabelas com Shadcn UI.

- [X] T020 [skill: shadcn] [P] [US2] Substituir `<input>`, `<select>` e `<table` em `src/app/alimentos/page.tsx` por `Input`, `Select` e `Table` de `src/components/ui/`
- [X] T021 [skill: shadcn] [P] [US2] Substituir `<input>` e `<select>` em `src/app/pacientes/page.tsx` por `Input` e `Select` de `src/components/ui/`
- [X] T022 [skill: shadcn] [P] [US2] Substituir `<input>` e `<button>` em `src/app/pacientes/[id]/page.tsx` por `Input` e `Button` de `src/components/ui/`
- [X] T023 [skill: shadcn] [P] [US2] Substituir `<input>` e `<button>` em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` por `Input` e `Button` de `src/components/ui/`
- [X] T024 [skill: shadcn] [P] [US2] Substituir `<input>` e `<button>` em `src/app/presets/page.tsx` por `Input` e `Button` de `src/components/ui/`
- [X] T025 [skill: shadcn] [P] [US2] Substituir `<input>` e `<button>` em `src/app/refeicoes-prontas/page.tsx` por `Input` e `Button` de `src/components/ui/`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificação global de compilação TypeScript, acessibilidade e validação do fluxo end-to-end.

- [X] T026 [skill: general] Executar o build estático com `npm run build` para garantir zero erros de tipo TypeScript ou imports quebrados em toda a pasta `src/`
- [X] T027 [skill: ui-ux-pro-max] Executar a verificação dos cenários de teste documentados em `quickstart.md` para garantir paridade visual e funcional em 100% da aplicação

---

## Dependencies & Execution Order

1. **Setup (Phase 1)** → Desbloqueia a infraestrutura de componentes atômicos.
2. **Foundational (Phase 2)** → Desbloqueia os componentes reutilizáveis moleculares e estruturais.
3. **User Story 1 (Phase 3)** → Adequação dos modais e overlays.
4. **User Story 2 (Phase 4)** → Adequação de formulários, botões e tabelas.
5. **Polish (Phase 5)** → Validação de compilação e teste final de regressão.
