---

description: "Task list template for feature implementation"
---

# Tasks: Eliminação Total dos Débitos do Design System

**Input**: Design documents from `/specs/02-08-26-eliminacao-debitos-design-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/audit-contract.md, quickstart.md

**Tests**: Sim — este SDD é test-first (constituição IV): fixtures e teste de 17 regras antecedem toda migração.

**Organization**: Tarefas agrupadas por user story. US1 (detecção) é BLOCKING para US2 (migração); US3 (documentação) depende de US2 zerada.

**Formato**: `[ID] [skill: $nome] [P?] [Story] Descrição`

## Path Conventions

- Projeto único: `src/`, `tests/` na raiz do repositório.
- Auditoria: `scripts/verify-design-system-legacy.mjs` (CLI `--strict`), regras em `scripts/design-system-legacy-rules.mjs`.
- Gates: `npm run verify:design-system-legacy`, `npm run type-check`, `npm run test`, `npm run verify:design-system`, `npm run audit:atomic-design`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Congelar o estado T0 e garantir gates verdes antes de qualquer mudança

- [X] T001 [skill: general] Capturar baseline T0: `node scripts/verify-design-system-legacy.mjs --strict --json` + varredura das 7 categorias (gap-scan) salvos em `specs/02-08-26-eliminacao-debitos-design-system/baseline/t0.json` (esperado: 86 findings regras + ~712 categorias; 20 arquivos)
- [X] T002 [skill: general] Confirmar gates no estado T0: `npm run type-check` e `npm run test` verdes; o teste "zero findings" de `tests/design-system/legacy-audit.test.ts` falha (esperado)

---

## Phase 2: User Story 1 - Detecção Completa de Desvios (Priority: P1) ⚠️ FOUNDATIONAL / BLOCKING

**Goal**: As 7 categorias invisíveis viram regras nomeadas LEG011–LEG017 com fixtures e exceções registradas; nenhuma migração pode começar antes (constituição IV)

**Independent Test**: `npm run test` — cobertura de 17 regras passa; isenção de `src/components/ui/**` e `src/design-system/**` retorna 0 findings; "zero findings" global ainda falha (dívida presente, estado de partida)

### Tests for User Story 1

> **NOTE: Escrever os testes/fixtures ANTES de considerar a US1 concluída**

- [X] T003 [skill: general] [P] [US1] Adicionar regra LEG011 (`named-text-size`) em `scripts/design-system-legacy-rules.mjs` com matcher de `text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)` ancorado em token (sem `\b` após `]`, sem casar `text-style-*`)
- [X] T004 [skill: general] [P] [US1] Adicionar regra LEG012 (`space-x-y`) em `scripts/design-system-legacy-rules.mjs` com matcher `space-[xy]-*` (canônico: `gap-*` com escala `space-*`, norma 06-geometry)
- [X] T005 [skill: general] [P] [US1] Adicionar regra LEG013 (`text-transform`) em `scripts/design-system-legacy-rules.mjs` com matcher `uppercase|lowercase|capitalize` (canônico: `tracking-label/overline` ou remoção)
- [X] T006 [skill: general] [P] [US1] Adicionar regra LEG014 (`tracking-wide`) em `scripts/design-system-legacy-rules.mjs` com matcher `tracking-(wide|wider|widest)` (norma 05-typography: só tight/normal/label/overline)
- [X] T007 [skill: general] [P] [US1] Adicionar regra LEG015 (`opacity`) em `scripts/design-system-legacy-rules.mjs` (permite `opacity-disabled|subdued|full`; norma 07-icons)
- [X] T008 [skill: general] [P] [US1] Adicionar regra LEG016 (`leading-named`) em `scripts/design-system-legacy-rules.mjs` (line-height vem do text style; norma 05-typography)
- [X] T009 [skill: general] [P] [US1] Adicionar regra LEG017 (`size-arbitrary`) em `scripts/design-system-legacy-rules.mjs` (canônico: tokens `icon-*`)
- [X] T010 [skill: general] [US1] Implementar PATH_EXEMPTIONS em `scripts/verify-design-system-legacy.mjs`: isentar prefixos `src/components/ui/` e `src/design-system/` (todas as regras); REMOVER as exceções por arquivo (`tokens.css` → LEG001/005/007 e `text-styles.ts` → LEG002/004); garantir que `tests/fixtures/**` nunca é isento
- [X] T011 [skill: tdd] [P] [US1] Criar fixtures `tests/fixtures/design-system-legacy/LEG011.fixture.tsx` … `LEG017.fixture.tsx` (uma ocorrência mínima por categoria, formato dos fixtures existentes)
- [X] T012 [skill: tdd] [P] [US1] Adicionar fixture de REJEIÇÃO por regra nova (ex.: LEG011 não casa `text-style-body`; LEG015 não casa `opacity-disabled`) em `tests/fixtures/design-system-legacy/rejections.fixture.tsx`
- [X] T013 [skill: tdd] [US1] Atualizar `tests/design-system/legacy-audit.test.ts`: cobertura passa a exigir exatamente `{LEG001..LEG017}`; adicionar testes de isenção (`paths: ["src/components/ui"]` e `paths: ["src/design-system"]` → 0 findings)
- [X] T014 [skill: general] [US1] Rodar `npm run test`: cobertura 17 regras PASS, isenções PASS, zero-findings global FAIL (esperado); corrigir matchers até sem falsos positivos/negativos

**Checkpoint**: US1 completa — a auditoria detecta TODAS as categorias; baseline congelado.

---

## Phase 3: User Story 2 - Runtime 100% Canônico (Priority: P1)

**Goal**: Eliminar os ~712+86 findings nos 20 arquivos migrando para `textStyle()`/tokens canônicos (ConversionMap em `research.md` U-03) e removendo `sm:`/`md:` (código morto, constituição III)

**Independent Test**: `npm run verify:design-system-legacy` retorna 0 findings; contagem decrescente a cada arquivo; `npm run type-check` sem novos erros

### Migração — Páginas (8)

- [X] T015 [skill: frontend-design] [P] [US2] Migrar `src/app/pacientes/[id]/page.tsx` (121 ocorrências: text-named-size 59, space-x-y 38, text-transform 16, tracking 5, leading 3)
- [X] T016 [skill: frontend-design] [P] [US2] Migrar `src/app/pacientes/[id]/consulta/[date]/page.tsx` (105: text 36, space 42, transform 12, tracking 12, leading 3)
- [X] T017 [skill: frontend-design] [P] [US2] Migrar `src/app/alimentos/page.tsx` (77: text 46, space 16, transform 3, tracking 3, opacity 9)
- [X] T018 [skill: frontend-design] [P] [US2] Migrar `src/app/presets/page.tsx` (63: text 35, space 20, transform 4, leading 3, size 1)
- [X] T019 [skill: frontend-design] [P] [US2] Migrar `src/app/refeicoes-prontas/page.tsx` (37: text 19, space 11, transform 4, leading 3)
- [X] T020 [skill: frontend-design] [P] [US2] Migrar `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` (34: text 24, space 9, transform 1)
- [X] T021 [skill: frontend-design] [P] [US2] Migrar `src/app/pacientes/page.tsx` (31: text 18, space 10, leading 2, size 1)
- [X] T022 [skill: frontend-design] [P] [US2] Migrar `src/app/receitas/page.tsx` (30: text 15, space 11, transform 1, tracking 1, leading 1, size 1)

### Migração — Componentes (12)

- [X] T023 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/ReadOnlyDietModal.tsx` (39: text 13, space 12, transform 7, tracking 5, leading 1, size 1)
- [X] T024 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/FoodSearchModal.tsx` (32: text 15, space 9, transform 5, size 3)
- [X] T025 [skill: frontend-design] [P] [US2] Migrar `src/components/organisms/MealCardContainer.tsx` (24: text 11, space 12, size 1)
- [X] T026 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/RecipeCard.tsx` (23: text 8, space 7, transform 5, tracking 1, leading 2)
- [X] T027 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/DietModeSwitcher.tsx` (22: text 9, space 9, transform 2, tracking 1, size 1)
- [X] T028 [skill: frontend-design] [P] [US2] Migrar `src/components/templates/DietBuilderTemplate.tsx` (19: text 7, space 12)
- [X] T029 [skill: frontend-design] [P] [US2] Migrar `src/components/organisms/SidebarNav.tsx` (17: text 11, space 3, transform 1, tracking 1, leading 1)
- [X] T030 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/AutoKcalSection.tsx` (13: text 7, space 1, transform 4, tracking 1)
- [X] T031 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/MealItemRow.tsx` (9: text 4, space 4, opacity 1)
- [X] T032 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/PatientBadgeHeader.tsx` (6: text 3, space 3)
- [X] T033 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/RecipeIngredientRow.tsx` (6: text 3, space 3)
- [X] T034 [skill: frontend-design] [P] [US2] Migrar `src/components/molecules/MacroMetricCard.tsx` (4: text 4)

### Validação US2

- [X] T035 [skill: general] [US2] Rodar auditoria full `npm run verify:design-system-legacy`: 0 findings em todo o runtime fora das exceções; conferir que `src/components/ui/**` e `src/design-system/**` seguem isentos (0 findings) e fixtures continuam detectando as 17 regras
- [X] T036 [skill: general] [US2] Rodar `npm run type-check` e `npm run test` completos: sem regressões; o teste "zero findings" passa agora

**Checkpoint**: US2 completa — auditoria zerada e gates verdes.

---

## Phase 4: User Story 3 - Documentação Fiel à Realidade (Priority: P2)

**Goal**: Atualizar registry e doc de conformidade SOMENTE com evidência (auditoria zerada), conforme constituição V

**Independent Test**: Re-rodar a Etapa C do `quickstart.md` após a atualização documental — todos os comandos terminam com código 0; auditoria permanece zerada (a doc não mascara código)

### Implementation for User Story 3

- [X] T037 [skill: general] [US3] Atualizar `design-system/components/registry.json`: `baseline` → zero findings; registrar a exceção `src/components/ui/**` (justificativa: "primitivos shadcn preservados por design" — spec §Clarifications) nos componentes `ui-*` afetados e/ou no baseline
- [X] T038 [skill: general] [US3] Atualizar `design-system/13-implementation-and-compliance.md`: descrever as 17 regras LEG001–LEG017, as exceções de caminho (`src/components/ui/`, `src/design-system/`) e o estado verificado, sem declarar conformidade além da evidência
- [X] T039 [skill: general] [US3] Rodar validação final conforme `quickstart.md` Etapa C: `verify:design-system-legacy` (0 findings), `npm run test` (verde, 17 regras + zero-findings), `npm run type-check`, `npm run verify:design-system`, `npm run audit:atomic-design` (≥96%), `npm run build`

**Checkpoint**: US3 completa — documentação reflete o estado real.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Consolidação e não-regressão

- [X] T040 [skill: general] Confirmar que `src/design-system/**` e `src/app/design-system/page.tsx` não sofreram alterações (git status/diff) e que `tests/fixtures/design-system-legacy/` cobre as 17 regras

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; captura o estado T0
- **US1 (Phase 2)**: depende do Setup; **BLOCKS** US2/US3
- **US2 (Phase 3)**: depende de US1 (as regras novas são a régua da migração)
- **US3 (Phase 4)**: depende de US2 zerada (documentação só com evidência)
- **Polish (Phase 5)**: depende de US3

### User Story Dependencies

- **US1 (P1)**: após Setup — detecta todas as categorias (independente)
- **US2 (P1)**: após US1 — as 20 migrações de arquivo são independentes entre si ([P])
- **US3 (P2)**: após US2 — documentação com evidência

### Within Each Phase

- US1: regras (T003–T009) → exceções (T010) → fixtures (T011–T012) → teste (T013) → verificação (T014)
- US2: migrações por arquivo (T015–T034, [P]) → re-auditoria (T035) → gates (T036)
- US3: registry (T037) → doc (T038) → validação final (T039)

### Parallel Opportunities

- T003–T009 (regras) e T011–T012 (fixtures) são paralelizáveis entre si
- As 20 migrações T015–T034 são paralelizáveis (arquivos distintos)
- Depois de US1, a migração pode ser distribuída em paralelo

---

## Parallel Example: US2

```bash
# Migrações paralelas (arquivos distintos):
Task: "Migrar src/app/pacientes/[id]/page.tsx"
Task: "Migrar src/components/molecules/ReadOnlyDietModal.tsx"
Task: "Migrar src/app/alimentos/page.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 em sequência estrita)

1. Phase 1: Setup (baseline T0)
2. Phase 2: US1 (instrumentação) — **CRITICAL, bloqueia tudo**
3. Phase 3: US2 (migração) — 20 arquivos, auditando a cada grupo
4. **STOP e VALIDE**: auditoria zerada + gates verdes (T035/T036)
5. Phase 4: US3 (docs) — só com evidência

### Incremental Delivery

1. Setup + US1 → detecção completa (MVP parcial: visibilidade total)
2. US2 páginas → re-auditoria decrescente → US2 componentes → auditoria zerada
3. US3 docs → conformidade documentada
4. Polish → não-regressão confirmada

### Parallel Team Strategy

- T003–T012 distribuídos entre devs após Setup
- T015–T034 (20 arquivos) distribuídos em paralelo após US1
- Cada dev valida: `npm run verify:design-system-legacy` (contagem < atual para o arquivo) + `npm run type-check`

---

## Notes

- [P] = arquivos distintos, sem dependências
- [Story] = rastreabilidade à spec (US1/US2/US3)
- [skill] = skill principal atribuída (Estado 6 do SDD); `general` quando não há especializada
- Cada arquivo migrado deve: usar `textStyle()` de `@/design-system` e tokens canônicos (ConversionMap em `research.md` U-03); remover `sm:`/`md:`; não tocar `src/design-system/**` nem `src/app/design-system/page.tsx`
- Fixtures/testes ANTES da migração (constituição IV)
- Commitar por tarefa ou grupo lógico
- Ao concluir cada arquivo: re-rodar auditoria e confirmar decréscimo

## Phase 6: Convergence

- [ ] T041 [skill: general] [US2] Diagnosticar e corrigir o timeout da suíte global `npm run test`, garantindo término determinístico e todos os testes verdes per FR-008 / SC-004 (partial)
