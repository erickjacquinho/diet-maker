# Tasks: Button Group Diet Mode Switcher

**Input**: Design documents from `specs/09-08-26-button-group-diet-mode-switcher/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories)

## Phase 1: Setup & Prereqs

**Purpose**: Verificação dos componentes base shadcn e tokens de design

- [x] T001 [skill: shadcn] Verificar a disponibilidade e suporte ao componente `ToggleGroup` / `ToggleGroupItem` (ou equivalente `Tabs` / `Button` vanilla shadcn) em `src/components/ui/` ou dependências do projeto.
- [x] T002 [skill: frontend-design] Confirmar o mapeamento dos tokens de cores do design system (`bg-surface`, `border-border-subtle`, `text-text-primary`, `bg-primary`, `hover:bg-surface-hover`, `border-success`) para suporte ao estado selecionado (`state selected`).

---

## Phase 2: User Story 1 - Seleção de Modelo de Dieta via Button Group (Priority: P1) 🎯 MVP

**Goal**: Substituir a seleção entre "Dieta Simples" e "Ciclo de Carboidratos" por um Button Group alternador (`type="single"`).

**Independent Test**: Clicar nos botões "Dieta Simples" e "Ciclo de Carboidratos" e verificar a alternância imediata do estado selecionado e acionamento de `onModeChange`.

- [x] T003 [US1] [skill: shadcn] Refatorar a seção de seleção de modo (`mode`) em `src/components/molecules/DietModeSwitcher.tsx` para utilizar o `ToggleGroup` / Button Group shadcn mantendo a aparência vanilla e aplicando as classes de estilo para hover e selecionado.
- [x] T004 [US1] [skill: ui-ux-pro-max] Adicionar acessibilidade (`aria-pressed`, `aria-label`) e suporte à navegação por teclado no Button Group de modo de dieta em `src/components/molecules/DietModeSwitcher.tsx`.

---

## Phase 3: User Story 2 - Seleção de Quantidade de Variações via Button Group (Priority: P2)

**Goal**: Substituir a seleção entre 2 Variações e 3 Variações por um Button Group segmentado compacto.

**Independent Test**: Alternar entre "2 Variações" e "3 Variações" e confirmar o disparo de `onVariationsCountChange`.

- [x] T005 [US2] [skill: shadcn] Implementar o Button Group de quantidade de variações (`variationsCount`) em `src/components/molecules/DietModeSwitcher.tsx` com estilo vanilla shadcn, estado selecionado ativo e atalho visual para 2 vs 3 dias.

---

## Phase 4: User Story 3 - Alternância de Variação Ativa via Button Group Segmentado (Priority: P3)

**Goal**: Substituir o grid de cards pesados das variações por um Button Group / Tab Bar segmentado informativo com meta de kcal e carbos.

**Independent Test**: Clicar nas abas segmentadas (Dia A, Dia B, Dia C) e verificar a seleção visual ativa e o acionamento de `onSelectVariation(id)`.

- [x] T006 [US3] [skill: shadcn] Converter os cards de seleção de variações (`variations`) em `src/components/molecules/DietModeSwitcher.tsx` em um Button Group segmentado horizontal, com indicação visual clara de variação ativa e badges das metas.
- [x] T007 [US3] [skill: frontend-design] Ajustar o layout do botão "Copiar Refeições entre Dias" para manter alinhamento limpo ao lado do Button Group de variações.

---

## Phase 5: Polish & Validation

**Purpose**: Verificação de responsividade, integridade de tipos e ausência de regressão.

- [x] T008 [skill: speckit-analyze] Executar a análise de consistência entre `spec.md`, `plan.md` e `tasks.md` garantindo rastreabilidade total de requisitos e skills.
- [x] T009 [skill: ui-ux-pro-max] Validar a renderização do Button Group em breakpoints desktop (1440px) e mobile (375px), garantindo foco visual, contraste 4.5:1 e ausência de estouro de layout.
