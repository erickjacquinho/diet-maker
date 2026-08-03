# Tasks: Refatoração da documentação do design-system

**Input**: Design documents from `/specs/02-08-26-refatorar-design-system-rules-plano/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Verificadores do repositório são o mecanismo de validação desta refatoração (FR-007); incluídos como tarefas de verificação por user story.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [skill: <skill>] [P?] [Story] Description`

- **[skill]**: Skill principal atribuída à tarefa (Estado 6 do SDD)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Documentação: `design-system/`, `.agents/rules/`, `docs/plan/`
- Verificação: scripts npm existentes na raiz

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar a estrutura de destino antes de mover conteúdo.

- [ ] T001 [skill: general] Create `docs/plan/` directory (create if missing)
- [ ] T002 [skill: general] Snapshot current `design-system/` layout and file list as migration baseline (output: `docs/plan/migration-plan.md` section, before edits)

**Checkpoint**: Estrutura de destino disponível.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar os documentos consolidados de destino em `docs/plan/`; os novos arquivos das fases seguintes referenciam estes como fonte.

**⚠️ CRITICAL**: Nenhum documento fonte (01–15) pode ser removido antes que seu conteúdo esteja capturado nestes arquivos.

- [ ] T003 [skill: general] Create `docs/plan/tokens-reference.md` consolidating all value tables from docs 03–08 (colors, typography, spacing, radius, borders, dimensions, icons, motion, elevation, z-index, opacity) preserving token names and values
- [ ] T004 [skill: general] Create `docs/plan/fundamentals.md` condensing docs 01 (principles) and 02 (visual language) without inventing new rules
- [ ] T005 [skill: general] Create `docs/plan/governance.md` condensing docs 14 (lifecycle) and 11 (component contract) into process guidance
- [ ] T006 [skill: general] Create `docs/plan/migration-plan.md` preserving the LEG snapshot (doc 13 §§13 and 18.1–18.3, LEG001–LEG017), migration order (doc 13 §15) and Definition of Done (doc 13 §16)

**Checkpoint**: Documentos consolidados de destino existem e cobrem todo o conteúdo dos fontes.

---

## Phase 3: User Story 2 - Regras operacionais acionáveis (Priority: P2)

**Goal**: Extrair restrições operacionais dos documentos canônicos para `.agents/rules/`, no estilo dos arquivos existentes (MUST/NÃO, proibições objetivas, ponteiro para o README).

**Independent Test**: `Get-ChildItem .agents/rules -Filter *.md` retorna 9 arquivos; cada arquivo novo tem seção de proibições/decisões legível e referencia `design-system/README.md`.

### Implementation for User Story 2

- [ ] T007 [skill: general] [P] [US2] Create `.agents/rules/tokens.md` from doc 03 (token naming, prohibited raw values, single theme policy)
- [ ] T008 [skill: general] [P] [US2] Create `.agents/rules/color-semantics.md` from doc 04 + doc 02 §3 (color families, semantic usage, contrast, prohibitions)
- [ ] T009 [skill: general] [P] [US2] Create `.agents/rules/typography.md` from doc 05 (closed catalog via `textStyle()`, weights 400–700, prohibitions)
- [ ] T010 [skill: general] [P] [US2] Create `.agents/rules/geometry-layout.md` from doc 06 (4px scale, radius, 1px borders, dimensions, layout prohibitions)
- [ ] T011 [skill: general] [P] [US2] Create `.agents/rules/icons-motion-layers.md` from doc 07 (Lucide only, durations, easing, z-index, shadows, opacity)
- [ ] T012 [skill: general] [P] [US2] Create `.agents/rules/states-accessibility.md` from doc 08 (focus recipe, states matrix, WCAG 2.2 AA, keyboard, contrast)
- [ ] T013 [skill: general] [P] [US2] Create `.agents/rules/component-decision.md` from docs 09 + 11 §4 (reuse→configure→variant→compose→create, blocking questions, API prohibitions)
- [ ] T014 [skill: general] [US2] Expand `.agents/rules/atomic-design.md` with architecture boundaries from doc 10 (layer dependency rules, generic vs domain, when to use Shadcn/Radix)

**Checkpoint**: Todas as áreas de restrição do FR-001 estão cobertas por regras em `.agents/rules/`.

---

## Phase 4: User Story 1 - Fonte canônica única, navegável e simplificada (Priority: P1) 🎯 MVP

**Goal**: Reescrever o README como índice canônico e remover os documentos redundantes, mantendo a descoberta em ≤2 passos (SC-005).

**Independent Test**: `design-system/` contém exatamente 1 arquivo `.md` na raiz (README) + `components/` intacto; `Get-ChildItem design-system -File -Filter *.md` → 1 arquivo.

### Implementation for User Story 1

- [ ] T015 [skill: general] [US1] Rewrite `design-system/README.md` as canonical index: fixed decisions, vocabulary, routing table to `.agents/rules/*` and `docs/plan/{fundamentals,tokens-reference,governance,migration-plan}.md`, absorbing doc 12 and doc 15 content
- [ ] T016 [skill: general] [US1] Remove docs `design-system/01-principles-and-scope.md` through `design-system/15-component-registry.md` after verifying their content is fully captured in T003–T015

**Checkpoint**: Navegação canônica funciona em ≤2 passos a partir do README.

---

## Phase 5: User Story 3 - Dados executáveis preservados e verificação intacta (Priority: P2)

**Goal**: Garantir que `design-system/components/` permaneça intacto, o roteamento reflita a nova estrutura e todos os verifiers continuem verdes.

**Independent Test**: `npm run verify:design-system` e `npm run verify:design-system-legacy` terminam sem erro.

### Implementation for User Story 3

- [ ] T017 [skill: general] [US3] Update `AGENTS.md` routing table to point design-system topics to `.agents/rules/*`, `design-system/README.md` and `docs/plan/*`
- [ ] T018 [skill: general] [US3] Fix internal cross-links across new files (`design-system/`, `.agents/rules/`, `docs/plan/`) to relative paths
- [ ] T019 [skill: general] [US3] Run `npm run verify:links` and resolve any broken document links
- [ ] T020 [skill: general] [US3] Run `npm run verify:design-system`, `npm run verify:design-system-legacy`, `npm run test`, `npm run lint`, `npm run type-check` and fix any regression

**Checkpoint**: Verificação contínua verde com `components/` intacto.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e entrega conforme SC-006.

- [ ] T021 [skill: general] Run `quickstart.md` validation scenarios end-to-end and record results
- [ ] T022 [skill: git-commit] Commit the refactoring changes to branch `02-08-26-refatorar-design-system-rules-plano`
- [ ] T023 [skill: general] Push branch and open pull request to `main`
- [ ] T024 [skill: general] Monitor CI/CD status; merge to `main` only if CI passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories (source content must be captured before removal)
- **User Stories (Phase 3–5)**: Depend on Foundational
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **US2 (P2, Phase 3)**: Can start after Foundational; independent files ([P] tasks in parallel)
- **US1 (P1, Phase 4)**: Depends on Foundational; removal (T016) must not run before rules (T007–T014) and README (T015) exist
- **US3 (P2, Phase 5)**: Depends on US1 + US2 (routing/links cover all new files)

### Parallel Opportunities

- T001–T002 sequential; T003–T006 sequential (each consolidates different source docs, but all before rules)
- T007–T014 marked [P] can run in parallel (different files)
- T017–T018 sequential; T019–T020 sequential (verification)

### Parallel Example: User Story 2

```bash
Task: "Create .agents/rules/tokens.md"
Task: "Create .agents/rules/color-semantics.md"
Task: "Create .agents/rules/typography.md"
Task: "Create .agents/rules/geometry-layout.md"
Task: "Create .agents/rules/icons-motion-layers.md"
Task: "Create .agents/rules/states-accessibility.md"
Task: "Create .agents/rules/component-decision.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (source capture)
3. Complete Phase 3: US2 (rules) — enables agent compliance
4. Complete Phase 4: US1 (README + removal) — MVP
5. **STOP and VALIDATE**: run verification suite
6. Complete Phase 5: US3 (routing/links) → Phase 6 (delivery)

### Incremental Delivery

1. Setup + Foundational → destination docs ready
2. US2 (rules) → operational constraints live
3. US1 (index + removal) → MVP deliverable
4. US3 (routing + verification) → green suite
5. Polish → commit + PR + CI + merge

---

## Notes

- **CRITICAL**: Never remove a source document (01–15) before its content is captured in the destination files (T003–T015).
- **CRITICAL**: `design-system/components/` must remain untouched (FR-004).
- **CRITICAL**: The LEG snapshot must be preserved verbatim in `migration-plan.md` (FR-006).
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each logical group; stop at any checkpoint to validate independently
