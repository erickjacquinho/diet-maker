# Tasks: Showcase Visual da Linha de Design System (/design-system)

**Input**: Design documents from `specs/07-08-26-refatoracao-design-system-showcase/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [skill: name] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparação da estrutura de componentes do showcase

- [x] T001 [skill: frontend-design] Criar estrutura de diretórios e contratos em `src/app/design-system/components/`
- [x] T002 [skill: ui-ux-pro-max] [P] Definir tipos e esquemas de dados em `src/app/design-system/components/types.ts`
- [x] T003 [skill: ui-ux-pro-max] [P] Criar dados mockados estáticos e mapeadores de componentes em `src/app/design-system/components/showcase-registry.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura básica do container e layout do Showcase

**⚠️ CRITICAL**: Nenhuma user story pode avançar antes desta fase estar concluída

- [x] T004 [skill: frontend-design] Implementar o componente `ShowcaseHeader.tsx` em `src/app/design-system/components/ShowcaseHeader.tsx` com banner mineral dark e estatísticas
- [x] T005 [skill: ui-ux-pro-max] [P] Implementar o controle `ViewModeToggle.tsx` em `src/app/design-system/components/ViewModeToggle.tsx` para alternar entre "Modo Cliente Showcase" e "Modo Dev Spec"
- [x] T006 [skill: ui-ux-pro-max] [P] Criar a barra de navegação e abas de categorias em `src/app/design-system/components/ShowcaseTabs.tsx`

**Checkpoint**: Estrutura base pronta - as histórias de usuário podem ser desenvolvidas em sequência ou em paralelo.

---

## Phase 3: User Story 1 - Visualização de Tokens de Design (Priority: P1) 🎯 MVP

**Goal**: Exibir gráfica e interativamente todas as camadas de tokens de design (Cores com swatches e verificação de contraste WCAG, Tipografia editável, Spacing, Raios e Sombras).

**Independent Test**: Navegar para a aba "Tokens de Design" em `/design-system`, inspecionar os swatches de cores, testar digitação no espécime de tipografia e verificar as barras de spacing/sombras.

- [x] T007 [skill: ui-ux-pro-max] [P] [US1] Implementar o swatch de cores `TokenColorSwatch.tsx` em `src/app/design-system/components/TokenColorSwatch.tsx` com indicação HSL/HEX e badges de contraste WCAG AA/AAA
- [x] T008 [skill: frontend-design] [P] [US1] Implementar o espécime de tipografia `TypographySpecimen.tsx` em `src/app/design-system/components/TypographySpecimen.tsx` com suporte a texto de teste em tempo real
- [x] T009 [skill: ui-ux-pro-max] [P] [US1] Implementar visualizador de spacing, raios e sombras `StructuralTokensSection.tsx` em `src/app/design-system/components/StructuralTokensSection.tsx`
- [x] T010 [skill: frontend-design] [US1] Integrar a seção completa de tokens `TokenSwatchesSection.tsx` em `src/app/design-system/components/TokenSwatchesSection.tsx`

**Checkpoint**: User Story 1 funcional e independente.

---

## Phase 4: User Story 2 - Galeria Interativa de Componentes & Playground (Priority: P1)

**Goal**: Exibir galeria viva de Átomos, Moléculas e Organismos com controles de variação (Playground / Knobs) e alternância de estados (default, hover, loading, disabled, error).

**Independent Test**: Selecionar um componente na galeria (ex: `Button` ou `MetricBox`), alterar suas variantes através dos controles e verificar a atualização em tempo real.

- [x] T011 [skill: ui-ux-pro-max] [P] [US2] Implementar os knobs de controle de props `PlaygroundControls.tsx` em `src/app/design-system/components/PlaygroundControls.tsx`
- [x] T012 [skill: ui-ux-pro-max] [P] [US2] Implementar o sandbox isolado de preview `ComponentSandbox.tsx` em `src/app/design-system/components/ComponentSandbox.tsx`
- [x] T013 [skill: frontend-design] [US2] Criar a galeria de Átomos (`Button`, `Input`, `Badge`, `Avatar`, `Surface`, `Spinner`, `Skeleton`) em `src/app/design-system/components/AtomsGallery.tsx`
- [x] T014 [skill: frontend-design] [US2] Criar a galeria de Moléculas (`FormField`, `MetricBox`, `TacoSearchInput`, `PatientBadgeHeader`) em `src/app/design-system/components/MoleculesGallery.tsx`
- [x] T015 [skill: frontend-design] [US2] Criar a galeria de Organismos (`DietModeSwitcher`, `MacroTrackerHeader`, `PatientListTable` preview) em `src/app/design-system/components/OrganismsGallery.tsx`
- [x] T016 [skill: ui-animations-motion] [US2] Integrar o visualizador principal da galeria `ComponentPlaygroundSection.tsx` em `src/app/design-system/components/ComponentPlaygroundSection.tsx`

**Checkpoint**: User Stories 1 e 2 totalmente operacionais e testáveis.

---

## Phase 5: User Story 3 - Filtro, Busca e Visão Showcase Cliente (Priority: P2)

**Goal**: Permitir busca instantânea por componentes, filtragem por tags e alternância entre a visão refinada para clientes e o painel de inspeção de código para desenvolvedores.

**Independent Test**: Buscar por um termo na barra de busca, alternar para o "Modo Showcase Cliente" e validar a oculta dos detalhes de código.

- [x] T017 [skill: ui-ux-pro-max] [P] [US3] Implementar campo de busca e filtros dinâmicos em `src/app/design-system/components/ShowcaseSearch.tsx`
- [x] T018 [skill: frontend-design] [US3] Criar a galeria de telas/composições completas `CompositionGallery.tsx` em `src/app/design-system/components/CompositionGallery.tsx`
- [x] T019 [skill: frontend-design] [US3] Refatorar a página principal `/design-system/page.tsx` em `src/app/design-system/page.tsx` integrando todas as seções, filtros e controles de modo de exibição

**Checkpoint**: Todas as histórias de usuário entregues com filtragem e alternância de modos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Refinamentos visuais, animações, acessibilidade e verificação

- [x] T020 [skill: ui-animations-motion] Adicionar micro-interações de hover e transições suaves de abas em `src/app/design-system/components/`
- [x] T021 [skill: ui-ux-pro-max] Validar contraste de cores WCAG AA e atalhos de navegação por teclado em toda a página `/design-system`
- [x] T022 [skill: webapp-testing] Executar verificação visual rápida com guia `quickstart.md` no navegador

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências - início imediato.
- **Foundational (Phase 2)**: Depende do Setup.
- **User Story 1 (Phase 3)**: Depende do Foundational.
- **User Story 2 (Phase 4)**: Depende do Foundational.
- **User Story 3 (Phase 5)**: Depende de US1 e US2.
- **Polish (Phase 6)**: Depende de US1, US2 e US3.

### Skill Assignment Summary
- `frontend-design`: T001, T004, T008, T010, T013, T014, T015, T018, T019 (9 tarefas)
- `ui-ux-pro-max`: T002, T003, T005, T006, T007, T009, T011, T012, T017, T021 (10 tarefas)
- `ui-animations-motion`: T016, T020 (2 tarefas)
- `webapp-testing`: T022 (1 tarefa)
