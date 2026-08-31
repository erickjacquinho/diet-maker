# Tasks: Dietas — rascunho, salvamento e histórico

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/diet-application.md](./contracts/diet-application.md)
e [quickstart.md](./quickstart.md).

**Execution gate**: este arquivo é planejamento aprovado somente após validação
humana. Executar exclusivamente por `/speckit-implement`.

**Tests**: a constituição e a especificação exigem test-first. Em cada fase, as
tarefas de teste precedem a implementação correspondente e precisam falhar
pelo comportamento ausente, não por fixture ou import inválido.

**Task format**: `[ID] [skill] [P?] [Story?] descrição + arquivo + verificação`.
`[P]` indica arquivos distintos e ausência de dependência em tarefa ainda
incompleta da mesma fase.

## Phase 1 — Setup

**Purpose**: congelar dependências, estrutura e fronteiras antes de mudar o
comportamento.

- [x] T001 [skill: $backend-patterns] Adicionar `decimal.js 10.6.0` às dependências de produção e `@playwright/test 1.62.1` e `fake-indexeddb 6.2.5` às dependências de desenvolvimento em `package.json` e `package-lock.json`; verificar versões com `npm ls decimal.js @playwright/test fake-indexeddb`.
- [x] T002 [skill: $backend-architect-ddd] Criar os diretórios e barrels vazios de domínio/aplicação/adaptadores em `src/lib/domain/diets/`, `src/lib/application/diets/`, `src/lib/infrastructure/diet-drafts/` e `src/lib/infrastructure/local-db/diets/`; verificar que `npm run type-check` não ganha erro de import.
- [x] T003 [skill: $tdd] [P] Criar fixtures sintéticas reutilizáveis de draft simples/ciclo, TACO, vigente/histórico, alternativas/substitutos e escopos incompatíveis em `tests/fixtures/diets.ts`; verificar que nenhum fixture acessa storage, relógio ou aleatoriedade globais.
- [x] T004 [skill: $code-reviewer-expert] [P] Registrar o inventário executável das chaves/imports legados de dieta em `tests/architecture/diet-legacy-inventory.ts`, cobrindo `nutridiet_diets_*`, `nutridiet_cycle_configured`, `dietHistory[]`, `dietStore` e `dietDuplication`; verificar que o inventário encontra os consumidores atuais antes do cutover.

**Checkpoint**: dependências e estrutura prontas, sem mudança funcional.

---

## Phase 2 — Foundational contracts and persistence

**Purpose**: criar contratos compartilhados, precisão, runtime exclusivo e
schema que bloqueiam todas as histórias.

**Critical**: nenhuma história começa antes de T018.

- [x] T005 [skill: $tdd] [P] Escrever testes de tipos/validação para `DecimalString`, `DietDraft`, agregado confirmado, item `PRIMARY|SUBSTITUTE`, snapshot e resultados nominais em `tests/lib/diets/diet-contracts.test.ts`; verificar falha por contratos ausentes.
- [x] T006 [skill: $tdd] [P] Escrever testes de precisão, energia e arredondamento em `tests/lib/nutrition/decimal-roundtrip.test.ts` e `tests/lib/nutrition/nutrition-calculation.test.ts`, incluindo 128→64→128 kcal, zero de referência e ausência com 4–4–9; verificar falha antes do módulo decimal.
- [x] T007 [skill: $backend-architect-ddd] Implementar value objects, entidades, enums, falhas e portas definidos no contrato em `src/lib/domain/diets/diet-model.ts`, `src/lib/domain/diets/diet-errors.ts` e `src/lib/application/diets/diet-ports.ts`; verificar T005.
- [x] T008 [skill: $backend-architect-ddd] Implementar cálculo por `decimal.js`, serialização canônica, regras de energia e formatação half-up em `src/lib/domain/diets/nutrition.ts`; verificar T006 e proibir conversão intermediária para `number`.
- [x] T009 [skill: $tdd] [P] Escrever testes de manifesto/mapeamento TACO e snapshot autossuficiente em `tests/lib/nutrition/taco-snapshot.test.ts`, cobrindo os 597 registros, versão, preparo original/normalizado, fibra, base e conversões; verificar falha antes do adaptador.
- [x] T010 [skill: $backend-patterns] Criar `src/data/taco-dataset-manifest.ts` e `src/lib/application/diets/taco-food-adapter.ts` para produzir snapshots `SYSTEM_TACO` sem customizados/receitas/refeições prontas; verificar T009 e busca aquecida representativa abaixo de 100 ms.
- [x] T011 [skill: $tdd] [P] Escrever teste de runtime para aquisição da Web Lock antes do PGlite, falha fechada da segunda aba e liberação após fechamento em `tests/infrastructure/local-runtime-lock.integration.test.ts`; verificar falha na composição atual.
- [x] T012 [skill: $backend-patterns] Portar a trava aprovada para `src/lib/infrastructure/local-db/single-tab-lock.ts` e integrar ordem acquire→open / close→release em `src/lib/infrastructure/local-db/client.ts` e `src/lib/application/browser-composition.ts`; verificar T011 e preservar o runtime de pacientes.
- [x] T013 [skill: $database-migrations-pro] [P] Escrever teste de upgrade/rollback/idempotência, versão lógica futura e constraints das sete relações em `tests/infrastructure/diet-migration.integration.test.ts`, incluindo fixture etapa 2, FK composta, dia único, `numeric` e uma `ACTIVE`; verificar falha sem migration/contrato atualizados.
- [x] T014 [skill: $database-migrations-pro] Acrescentar a migration imutável posterior à atual em `src/lib/infrastructure/local-db/migrations.ts`, os sete mapeamentos Drizzle em `src/lib/infrastructure/local-db/schema.ts` e a versão/shape de dieta para exportação futura em `src/lib/infrastructure/local-db/logical-export-schema.ts`, sem implementar exportador; verificar T013 sem alterar a migration aplicada.
- [x] T015 [skill: $tdd] [P] Escrever testes do contrato relacional de leitura, escopo, snapshot 1:1, versionamento e transação com falha injetada em cada nível em `tests/infrastructure/diet-repository.integration.test.ts`; verificar falha antes do repositório.
- [x] T016 [skill: $database-migrations-pro] Implementar mapeadores `DecimalString ↔ numeric`, queries escopadas e o esqueleto transacional do `DietRepository` em `src/lib/infrastructure/local-db/diets/diet-row-mappers.ts` e `src/lib/infrastructure/local-db/diets/pglite-diet-repository.ts`; verificar as leituras/rollback de T015.
- [ ] T017 [skill: $nextjs-fullstack-master] Criar a factory de `DietApplication` com slots injetáveis de `DietRepository`, `DietDraftStore` e readers em `src/lib/application/diets/diet-application.ts` e registrar somente repositório/readers já disponíveis em `src/lib/application/browser-composition.ts`, sem instanciar o adaptador IndexedDB antes de T020; verificar `npm run type-check`.
- [ ] T018 [skill: $tdd] Criar o teste arquitetural inicial em `tests/architecture/diet-persistence-boundary.test.ts` proibindo React/Next no domínio e PGlite/Drizzle/IndexedDB/storage na UI; verificar que o teste passa para os arquivos novos e mantém findings nominais para consumidores legados ainda inventariados.

**Checkpoint**: contratos, precisão, trava, migration, repositório base e
composition root prontos; histórias podem iniciar.

---

## Phase 3 — User Story 1: montar e retomar sem confirmar (P1) — MVP

**Goal**: editar e recuperar dieta simples/ciclo apenas no draft, com estado de
autosave observável e sem alterar prescrição/histórico.

**Independent Test**: adicionar arroz e alterar modo/metas/ciclo, reabrir a
rota e recuperar todos os campos; contagem, atividade e vigente permanecem
iguais.

- [x] T019 [skill: $tdd] [P] [US1] Escrever testes do IndexedDB para contexto único, clone, `payloadSchemaVersion`, revisão fora de ordem, reserva de ID, flush, quota/abort e reabertura em `tests/infrastructure/diet-draft-store.integration.test.ts`; verificar falha antes do store.
- [x] T020 [skill: $backend-patterns] [US1] Implementar `IndexedDbDietDraftStore` e coordenador de fila/token em `src/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store.ts` e `src/lib/infrastructure/diet-drafts/draft-write-coordinator.ts`; verificar T019, inclusive que callback antigo não vence revisão nova.
- [x] T021 [skill: $tdd] [P] [US1] Escrever testes de `openEditor`, `autosaveDraft` e `flushDraft` para rota `nova`, ACTIVE, SNAPSHOT, paciente arquivado e falha local em `tests/lib/diets/diet-draft-application.test.ts`; verificar falha antes dos casos de uso.
- [x] T022 [skill: $backend-architect-ddd] [US1] Implementar os casos de uso de abertura/autosave/flush em `src/lib/application/diets/diet-draft-commands.ts`, capturando peso atual válido e metas zeradas em nova dieta; verificar T021 e zero chamada de mutação confirmada.
- [ ] T023 [skill: $tdd] [P] [US1] Adaptar/escrever testes do hook e template para estados `pending/saving/persisted/error`, flush antes de navegação, aviso do limite de retenção/edição ainda não persistida e ausência de IDs/storage na UI em `tests/hooks/useDietBuilderPage.test.ts` e `tests/components/templates/DietBuilderTemplate.test.tsx`; verificar falha no fluxo legado.
- [ ] T024 [skill: $frontend-architecture-mindset] [US1] Registrar `IndexedDbDietDraftStore` na composição, refatorar `src/hooks/useDietBuilderPage.ts` para consumir `DietApplication` e expor estado/flush/retry, removendo defaults `pat-1`, geração de ID/data e escrita direta em `src/lib/application/browser-composition.ts`; verificar T023.
- [ ] T025 [skill: $tdd] [P] [US1] Escrever teste de integração do mesmo draft entre editor e ciclo, sem `sessionStorage`, em `tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx` e `tests/app/pacientes/dedicated-carb-cycling-page.test.tsx`; verificar falha no transporte atual.
- [ ] T026 [skill: $nextjs-fullstack-master] [US1] Integrar as páginas `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` e `src/app/pacientes/[id]/dieta/[dietaId]/ciclo/page.tsx` ao mesmo contexto de draft e remover `nutridiet_cycle_configured`; verificar T025.
- [ ] T027 [skill: $ui-styling] [US1] Estender `src/components/templates/DietBuilderTemplate.tsx` com status local, `aria-busy`, `role=status`, alerta persistente e texto claro de que autosave não é backup nem recupera edição ainda pendente, sem alterar largura/layout dos controles; verificar T023 e teclado em 1024 px.

**Checkpoint**: US1 funciona isoladamente; o primeiro alimento permanece apenas
no draft e pode ser retomado.

---

## Phase 4 — User Story 2: confirmar a prescrição integral (P1)

**Goal**: confirmar o último estado visível de forma atômica e idempotente,
respeitando o mínimo de uma refeição com um item principal válido.

**Independent Test**: salvar antes do debounce por botão/atalho e injetar
validação, rollback, conflito, resultado incerto e falha de limpeza.

- [ ] T028 [skill: $tdd] [P] [US2] Escrever testes de mínimo no modo prescrito para simples/ciclo, alternativas, substitutos, conteúdo inativo e edição vigente em `tests/lib/diets/diet-validation.test.ts`; verificar que zero refeição/refeição vazia falham e um item principal válido passa.
- [ ] T029 [skill: $backend-architect-ddd] [US2] Implementar validação completa de confirmação em `src/lib/domain/diets/diet-validation.ts`, incluindo mínimo, números, unidades, snapshots, dias e relações; verificar T028 sem iniciar repositório em erro.
- [ ] T030 [skill: $tdd] [P] [US2] Completar testes transacionais de `COMMITTED_NEW`, `COMMITTED_UPDATE`, `ALREADY_COMMITTED`, única ACTIVE, versão e rollback por filho em `tests/infrastructure/diet-repository.integration.test.ts`; verificar falha nos ramos ainda ausentes.
- [ ] T031 [skill: $database-migrations-pro] [US2] Completar `confirmActive` e reconciliação por ID/versão em `src/lib/infrastructure/local-db/diets/pglite-diet-repository.ts`, gravando plano, variações, dias, refeições, opções, itens e snapshots numa transação; verificar T030.
- [ ] T032 [skill: $tdd] [P] [US2] Escrever testes do protocolo `flush → reserve target ID → validate → confirm → removeIfRevision` e dos resultados rollback/unknown/conflict/cleanup pending em `tests/lib/diets/save-diet-as-active.test.ts`; verificar falha antes da orquestração.
- [ ] T033 [skill: $backend-architect-ddd] [US2] Implementar `saveDietAsActive`, `reconcileUnknownSave` e limpeza isolada em `src/lib/application/diets/save-diet-as-active.ts`; verificar T032 sem retry automático ou ID novo.
- [ ] T034 [skill: $tdd] [P] [US2] Escrever testes de equivalência botão/Ctrl/Cmd+S, bloqueio de repetição/modal, último input e navegação pós-durabilidade em `tests/hooks/useSaveShortcut.test.ts` e `tests/app/pacientes/diet-editor-persistence.test.tsx`; verificar falha antes da integração.
- [ ] T035 [skill: $frontend-architecture-mindset] [US2] Integrar o único callback assíncrono de salvamento em `src/hooks/useDietBuilderPage.ts`, `src/hooks/useSaveShortcut.ts` e `src/components/templates/DietBuilderTemplate.tsx`, congelando edição e mapeando falhas nominais; verificar T034 e foco preservado.

**Checkpoint**: US2 confirma exatamente uma prescrição completa ou preserva o
draft e o estado clínico anterior.

---

## Phase 5 — User Story 3: editar a vigente e preservar histórico (P1)

**Goal**: editar somente ACTIVE e consultar SNAPSHOT sem mutação.

**Independent Test**: criar duas prescrições, editar a vigente e tentar abrir ou
salvar a histórica por rota/aplicação.

- [ ] T036 [skill: $tdd] [P] [US3] Escrever testes dos readers para vigente, histórico ordenado, contagem, capacidades e erro distinto de vazio em `tests/infrastructure/patient-diet-reader.integration.test.ts`; verificar falha antes das projeções.
- [ ] T037 [skill: $database-migrations-pro] [US3] Implementar `PatientDietReader` e `PatientDietSummary` escopados em `src/lib/infrastructure/local-db/diets/pglite-patient-diet-reader.ts`; verificar T036 com `canEdit` apenas na ACTIVE e `canDelete=false`.
- [ ] T038 [skill: $tdd] [P] [US3] Atualizar testes do perfil/tabela para Vigente/Histórico, draft separado, expansão acessível e ausência de excluir/editar histórico em `tests/app/pacientes/patient-profile-history.test.tsx` e `tests/components/organisms/patient-diets-table.test.tsx`; verificar falha no fluxo legado.
- [ ] T039 [skill: $frontend-architecture-mindset] [US3] Integrar o reader canônico e remover `dietHistory[]`/seleção por data em `src/hooks/usePatientProfilePage.ts`, `src/lib/patientProfileSelectors.ts` e `src/components/organisms/patient/PatientDietsTable.tsx`; verificar T038 e não aninhar button em link.
- [ ] T040 [skill: $tdd] [P] [US3] Escrever testes de detalhe histórico para loading/error/read-only, snapshot congelado e zero criação de draft em `tests/components/organisms/read-only-diet-modal.test.tsx`; verificar falha antes da migração do componente.
- [ ] T041 [skill: $design-system] [US3] Mover `src/components/molecules/ReadOnlyDietModal.tsx` para `src/components/organisms/diets/ReadOnlyDietModal.tsx`, carregar por `getDietSnapshot` e atualizar `design-system/components/registry.json` e `design-system/components/profiles/organisms/read-only-diet-modal.md`; verificar T040 e `npm run verify:design-system`.

**Checkpoint**: US3 mantém a vigente versionada e torna prescrições anteriores
estritamente somente leitura.

---

## Phase 6 — User Story 6: reabrir valores congelados e trabalhar offline (P1)

**Goal**: preservar snapshot/peso/metas e operar localmente depois de preparar
os recursos, bloqueando a segunda aba.

**Independent Test**: salvar TACO simples/ciclo, alterar paciente/fonte,
reabrir online/offline e comparar todos os valores.

- [ ] T042 [skill: $tdd] [P] [US6] Escrever testes antes da implementação para round-trip draft→numeric→reader e consumidores de snapshot/peso congelado em `tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts`, `tests/hooks/useDietMealActions.test.ts`, `tests/hooks/useDietCalculations.test.ts` e `tests/components/molecules/food-search-modal.test.tsx`; verificar falha em campo descartado, float, energia substituída ou peso vivo.
- [ ] T043 [skill: $frontend-architecture-mindset] [US6] Refatorar `src/hooks/useDietMealActions.ts` e `src/hooks/useDietCalculations.ts` para comandos/snapshots decimais e `weightReferenceKg` congelado, removendo razão sobre totais arredondados e peso vivo; verificar `tests/hooks/useDietMealActions.test.ts` e `tests/hooks/useDietCalculations.test.ts`.
- [ ] T044 [skill: $ui-styling] [US6] Restringir `src/components/molecules/FoodSearchModal.tsx` à fonte TACO e transportar o snapshot completo sem cálculo 4–4–9 sobre energia informada; verificar `tests/components/molecules/food-search-modal.test.tsx` e T042.
- [ ] T045 [skill: $webapp-testing] [US6] Criar jornada Chromium real para reabertura, offline preparado, busca TACO <100 ms e segunda aba bloqueada em `tests/browser/diet-offline-persistence.spec.ts` e `playwright.config.ts`, adicionando `test:browser` em `package.json`; verificar execução serial `npm run test:browser -- --workers=1`.

**Checkpoint**: US6 reproduz o conteúdo confirmado sem depender de cadastro,
catálogo vivo ou rede.

---

## Phase 7 — User Story 4: reaproveitar prescrição anterior (P2)

**Goal**: copiar metas ou dieta completa de fontes confirmadas sem alterar ou
compartilhar identidades com a origem.

**Independent Test**: copiar simples/ciclo, alterar destino e comparar a origem
campo a campo; histórico não muda antes de Salvar.

- [ ] T046 [skill: $tdd] [P] [US4] Escrever testes de lista exclusiva/ordem, metas da variação ativa e cópia profunda com IDs novos em `tests/lib/diets/diet-copy.test.ts` e `tests/lib/diets/previous-diet-sources.test.ts`; verificar falha antes dos casos de uso.
- [ ] T047 [skill: $backend-architect-ddd] [US4] Implementar `listPreviousDietSources`, `pullTargets` e `pullCompleteDiet` em `src/lib/application/diets/diet-copy-commands.ts`, persistindo nova revisão antes do sucesso; verificar T046, peso do destino em metas e peso da origem na cópia completa.
- [ ] T048 [skill: $tdd] [P] [US4] Atualizar testes da seleção única, estados disabled, cancelamento e persistência antes do feedback em `tests/components/organisms/import-previous-diet-modal.test.tsx`; verificar falha no componente atual.
- [ ] T049 [skill: $proj-table-adequation-v2] [US4] Migrar `src/components/molecules/ImportPreviousDietModal.tsx` para `src/components/organisms/diets/ImportPreviousDietModal.tsx`, preservar o `DataTable` canônico e atualizar registry/perfil em `design-system/components/registry.json` e `design-system/components/profiles/organisms/import-previous-diet-modal.md`; verificar T048 e `npm run verify:table`.

**Checkpoint**: US4 cria apenas uma revisão local independente; a origem e o
histórico ficam intactos.

---

## Phase 8 — User Story 5: descartar e respeitar arquivamento (P2)

**Goal**: remover somente drafts confirmados pelo usuário e bloquear qualquer
mutação de paciente arquivado.

**Independent Test**: descartar com callback atrasado; arquivar com falha de
limpeza; restaurar e confirmar que o draft invalidado não volta.

- [ ] T050 [skill: $tdd] [P] [US5] Escrever testes de descarte, cancelamento, remoção condicional e callback atrasado em `tests/lib/diets/discard-diet-draft.test.ts`; verificar falha antes do caso de uso.
- [ ] T051 [skill: $backend-architect-ddd] [US5] Implementar `discardDietDraft` e invalidação irrecuperável em `src/lib/application/diets/discard-diet-draft.ts` e `src/lib/infrastructure/diet-drafts/draft-write-coordinator.ts`; verificar T050.
- [ ] T052 [skill: $tdd] [P] [US5] Escrever testes de arquivamento canônico seguido de limpeza, `cleanupPending`, revalidação e restauração sem reativação em `tests/lib/patients/archive-patient-drafts.integration.test.ts`; verificar falha antes da integração.
- [ ] T053 [skill: $backend-architect-ddd] [US5] Integrar `invalidatePatientDrafts` após o commit em `src/lib/application/patient-application.ts` e no composition root, mantendo arquivado em falha local; verificar T052.
- [ ] T054 [skill: $shadcn] [US5] Substituir exclusão de prescrição por confirmação de descarte local via `ConfirmationAlertDialog` em `src/components/templates/DietBuilderTemplate.tsx` e remover o fluxo `DeleteDietModal` de `src/components/organisms/patient/PatientProfileModals.tsx` e `PatientDietsTable.tsx`; verificar `tests/components/overlays-accessibility.test.tsx` e ausência de delete confirmado.

**Checkpoint**: US5 nunca apaga prescrição e não permite salvar para paciente
arquivado.

---

## Phase 9 — Polish, cutover and acceptance

**Purpose**: eliminar fontes concorrentes e reunir evidência integrada.

- [ ] T055 [skill: $code-reviewer-expert] Remover consumidores e APIs específicas de dieta em `src/lib/dietStore.ts`, `src/lib/dietDuplication.ts`, `src/hooks/useDietPresets.ts`, `src/lib/legacyClinicalStore.ts`, `src/lib/consultationStorageUtils.ts` e `src/lib/patientsStoreTypes.ts`, movendo apenas helpers puros e ligando `src/app/pacientes/[id]/consulta/[date]/page.tsx` ao snapshot confirmado ou ocultando a seção quando indisponível; verificar que `tests/architecture/diet-legacy-inventory.ts` retorna zero consumidor/chave ativa.
- [ ] T056 [skill: $code-reviewer-expert] Endurecer `tests/architecture/diet-persistence-boundary.test.ts` e adicionar `tests/lib/diets/legacy-cutover.test.ts` para falhar em qualquer fallback, dual write, ID/data de UI ou leitura histórica embutida; verificar ambos após T055.
- [ ] T057 [skill: $design-system] Executar e corrigir regressões introduzidas em `design-system/components/registry.json`, perfis alterados e superfícies de dieta até passarem `npm run audit:atomic-design`, `npm run verify:table`, `npm run verify:design-system` e os testes de acessibilidade; registrar achados preexistentes separadamente.
- [ ] T058 [skill: $webapp-testing] Executar os testes direcionados, `npm test`, `npm run type-check`, `npm run lint`, `npm run verify:links`, `npm run build` e a jornada serial do [quickstart](./quickstart.md); registrar comandos, versões, tempos, falhas injetadas e limites em `specs/30-08-26-dietas-rascunho-salvamento-historico/validation-report.md`.

**Final checkpoint**: todos os bloqueadores do quickstart têm evidência; nenhuma
etapa futura (biblioteca, avaliações ou backup) foi implementada.

---

## Dependencies and execution order

### Phase dependencies

- Phase 1 starts immediately.
- Phase 2 depends on Phase 1 and blocks every user story.
- US1 establishes the editable draft used by US2, US4 and US5.
- US2 establishes confirmed plans used by US3, US6 and US4.
- US3 and US6 may proceed in parallel after US2.
- US4 depends on US1 + US2 readers; US5 depends on US1 + patient application.
- Phase 9 depends on all selected stories and performs the single cutover.

### Story graph

```text
Setup → Foundation → US1 Draft → US2 Save ─┬─→ US3 History ─┐
                              │            ├─→ US6 Snapshot ┤
                              ├─→ US4 Copy ─────────────────┤
                              └─→ US5 Discard/archive ──────┤
                                                           ▼
                                                   Cutover + acceptance
```

### Parallel opportunities

- T003 and T004 can run together after T001–T002.
- T005/T006/T009/T011/T013/T015 are independent failing-test groups before
  their paired implementations.
- Within US1, T019 and T021 can be prepared together; T023 and T025 can be
  prepared after application contracts exist.
- After US2, US3 and US6 use different adapters/UI files and can run in
  parallel.
- US4 tests T046/T048 and US5 tests T050/T052 can run in parallel after their
  prerequisites.

## Parallel execution examples

### US1

```text
T019: DraftStore integration tests
T021: draft application tests
→ T020/T022
→ T023 + T025
→ T024/T026/T027
```

### US2

```text
T028: minimum/domain tests
T030: repository transaction tests
T032: save protocol tests
→ T029/T031/T033
→ T034
→ T035
```

### US3 and US6

```text
US3: T036→T037 and T038→T039, then T040→T041
US6: T042, then T043/T044, then T045
```

### US4 and US5

```text
US4: T046→T047 and T048→T049
US5: T050→T051 and T052→T053, then T054
```

## Implementation strategy

### MVP

1. Complete Setup and Foundation.
2. Complete US1.
3. Validate that editing/reopening never creates confirmed data.

This is the smallest independently demonstrable slice, but it is not a
clinically deliverable release because confirmation/history arrive in US2/US3.

### Clinical vertical slice

1. MVP draft.
2. US2 explicit save.
3. US3 history/read-only.
4. US6 snapshot/offline evidence.
5. US4 reuse and US5 lifecycle protections.
6. Cutover and acceptance.

Do not deploy an intermediate state that writes both legacy and canonical
stores. Stop at each checkpoint if its independent test fails.

## Task counts

| Group | Count |
| --- | ---: |
| Setup | 4 |
| Foundation | 14 |
| US1 | 9 |
| US2 | 8 |
| US3 | 6 |
| US6 | 4 |
| US4 | 4 |
| US5 | 5 |
| Cross-cutting | 4 |
| **Total** | **58** |
