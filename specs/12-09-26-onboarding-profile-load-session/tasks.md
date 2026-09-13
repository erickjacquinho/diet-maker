# Tasks: Onboarding de Profile e Sessão por Save

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/onboarding-session.md` e `quickstart.md` desta pasta.

**Organization**: tarefas agrupadas por história; testes vêm antes da implementação. A redução elimina módulos e etapas duplicadas, mas mantém todos os requisitos funcionais e critérios de sucesso.

## Phase 1: Setup

- [ ] T001 [skill: $frontend-architecture-mindset] [P] Inventariar os usos de persistência de domínio em `src/lib/storage.ts`, `src/lib/*Store.ts`, `src/lib/library-ui-adapter.ts`, `src/lib/infrastructure/local-db/client.ts` e `src/lib/application/browser-composition.ts`, separando fontes ativas de código legado.
- [ ] T002 [skill: $tdd] [P] Criar fixtures determinísticos vazio, válido com `Jacques Regiani` e inválido em `tests/fixtures/nutridiet/` para os testes de restore e cross-origin.

## Phase 2: Foundation (bloqueia todas as histórias)

- [ ] T003 [skill: $tdd] [P] Criar testes de runtime memory-only e boundary de host em `tests/lib/infrastructure/local-db/client.test.ts` e `tests/architecture/host-persistence-boundary.test.ts`, cobrindo ausência de `idb://`, IndexedDB, localStorage, sessionStorage, cookies e auto-create de conta.
- [ ] T004 [skill: $tdd] [P] Criar testes de validação/importação atômica em `tests/lib/infrastructure/backup-roundtrip.test.ts`, cobrindo envelope, versões, IDs, relações, preservação de sessão e consulta posterior pelo `accountId`.
- [ ] T005 [skill: $tdd] [P] Criar testes da sessão e da porta de arquivo em `tests/lib/application/profile-session.test.ts`, cobrindo `empty`, `busy`, `active`, `paused`, cancelamento, permissão e falha de escrita.
- [ ] T006 [skill: $backend-patterns] Implementar a base da sessão em `src/lib/infrastructure/local-db/client.ts`, `src/lib/application/browser-composition.ts`, `src/lib/infrastructure/local-db/account-context.ts` e `src/lib/infrastructure/diet-drafts/in-memory-diet-draft-store.ts`: PGlite `memory://`, conta explícita e drafts sem host storage.
- [ ] T007 [skill: $database-migrations-pro] Atualizar telefone opcional, migração, envelope e compatibilidade em `src/lib/domain/account.ts`, `src/lib/infrastructure/local-db/schema.ts`, `src/lib/infrastructure/local-db/migrations.ts`, `src/lib/infrastructure/local-db/logical-export-schema.ts` e `src/lib/infrastructure/local-db/backup-repository.ts`: schema 4 entra como telefone `null`, schema 5 é escrito e versões futuras são rejeitadas.
- [ ] T008 [skill: $frontend-architecture-mindset] Implementar o núcleo mínimo em `src/lib/persistence/save-file.ts`, `src/lib/infrastructure/file-system-access/browser-save-file.ts` e `src/lib/application/profile-session.ts`, concentrando seleção, leitura, escrita, comandos de sessão e status sem expor APIs de browser a SSR/domínio.

**Checkpoint**: runtime, envelope, porta de arquivo e sessão estão prontos; nenhuma rota clínica é liberada ainda.

## Phase 3: User Story 1 — Entrar somente com profile ativo (P1, MVP)

**Goal**: qualquer rota interna exige sessão; `/Home` não tem sidebar; a mesma aba reutiliza a sessão.

**Independent Test**: abrir `/pacientes` sem sessão e verificar `/Home` sem conteúdo/sidebar; ativar uma sessão fake e navegar entre duas rotas sem reinicializar runtime.

- [ ] T009 [skill: $tdd] [P] [US1] Criar testes do gate e da reutilização SPA em `tests/app/session-aware-app-shell.test.tsx` e `tests/browser/profile-session-gate.spec.ts`.
- [ ] T010 [skill: $nextjs-fullstack-master] [US1] Implementar o gate único em `src/app/SessionAwareAppShell.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/Home/page.tsx` e `src/app/PatientApplicationBootstrap.tsx`, mantendo `/Home` público, todas as outras rotas protegidas e o runtime inativo antes da sessão.

**Checkpoint**: nenhum conteúdo interno aparece sem sessão e a navegação da mesma aba mantém o runtime.

## Phase 4: User Story 2 — Criar profile (P1)

**Goal**: nome/telefone, escolha do primeiro arquivo e primeira escrita antes de liberar o app.

**Independent Test**: criar um profile, cancelar/invalidar o seletor sem sessão parcial e, em caso de sucesso, reabrir o arquivo para confirmar profile e telefone.

- [ ] T011 [skill: $tdd] [P] [US2] Criar testes de UI e comando de criação em `tests/components/organisms/profile-onboarding.test.tsx` e `tests/lib/application/profile-session.test.ts`, cobrindo campos exatos, nome obrigatório, loading, duplo submit, cancelamento e primeiro envelope.
- [ ] T012 [skill: $ui-styling] [US2] Implementar `src/components/molecules/profile-create-dialog.tsx`, `src/components/organisms/profile-onboarding.tsx` e o comando de criação em `src/lib/application/profile-session.ts`, usando tokens/estados canônicos, `showSaveFilePicker`, primeira escrita e navegação após sucesso.

## Phase 5: User Story 3 — Carregar profile existente (P1)

**Goal**: carregar um save válido em qualquer origem/porta e mostrar seus pacientes sem consultar base antiga.

**Independent Test**: carregar o fixture com Jacques Regiani em outra porta/origem e confirmar o paciente; arquivo inválido/cancelado mantém a sessão anterior.

- [ ] T013 [skill: $webapp-testing] [US3] Criar teste unitário e browser de load em `tests/lib/application/profile-session.test.ts`, `tests/lib/infrastructure/backup-roundtrip.test.ts` e `tests/browser/profile-save-load.spec.ts`, incluindo cross-origin/porta, Jacques Regiani, arquivo inválido, cancelamento e sessão preservada.
- [ ] T014 [skill: $backend-patterns] [US3] Implementar load atômico, associação do `accountId` e consulta pós-restore em `src/lib/application/profile-session.ts`, `src/lib/infrastructure/local-db/backup-repository.ts` e `src/lib/application/browser-composition.ts`; conectar Carregar e `showOpenFilePicker` em `src/app/Home/page.tsx` e `src/components/organisms/profile-onboarding.tsx`.

## Phase 6: User Story 4 — Sincronizar sem persistência de host (P1)

**Goal**: cada confirmação escreve o envelope completo no arquivo e falhas ficam visíveis sem fallback.

**Independent Test**: confirmar alteração, reabrir arquivo e verificar mudança; provocar falha de permissão e verificar sessão em memória `paused`, sem storage alternativo.

- [ ] T015 [skill: $tdd] [US4] Criar testes de sincronização e ausência de host em `tests/lib/application/profile-session.test.ts`, `tests/architecture/host-persistence-boundary.test.ts` e `tests/browser/profile-save-load.spec.ts`, cobrindo commit → export → write, reload/origem nova e permissão revogada.
- [ ] T016 [skill: $backend-patterns] [US4] Implementar o coordenador único de confirmação em `src/lib/application/composition-root.ts` e `src/lib/application/profile-session.ts`, conectando pacientes, clínica, dietas e biblioteca ao fluxo commit → export → write sem sincronizar drafts/keystrokes.
- [ ] T017 [skill: $frontend-architecture-mindset] [US4] Remover as fontes de domínio em host de `src/app/presets/page.tsx`, `src/lib/recipesStore.ts`, `src/lib/readyMealsStore.ts`, `src/lib/presetsStore.ts`, `src/lib/tacoStore.ts`, `src/lib/library-ui-adapter.ts` e `src/lib/storage.ts`, e mostrar status `synced/paused` em `src/app/navigation/SidebarNavigationAdapter.tsx`.

## Phase 7: Polish e validação

- [ ] T018 [skill: $design-system] [P] Revisar onboarding, gate e status contra `design-system/README.md`, `.agents/rules/` e os perfis/categorias canônicos, verificando teclado, foco, `aria-live`, erro, loading e desktop 1024px+ em `tests/app/session-aware-app-shell.test.tsx` e `tests/components/organisms/profile-onboarding.test.tsx`.
- [ ] T019 [skill: $webapp-testing] Executar `quickstart.md`, `npm run lint`, `npm run test` e `npm run test:browser`; registrar evidências e atualizar `specs/12-09-26-onboarding-profile-load-session/quickstart.md` sem declarar conformidade sem resultados.

## Dependências e paralelismo

- Setup: T001 e T002 podem ocorrer em paralelo.
- Foundation: T003–T005 podem ser escritos em paralelo; T006–T008 dependem deles e bloqueiam as histórias.
- US1 depende da Foundation. US2 e US3 podem avançar em paralelo após US1, mas compartilham `Home/page.tsx` e devem coordenar essa edição.
- US4 depende dos comandos de criar/carregar e das mutações existentes.
- Polish depende dos checkpoints anteriores.

## Estratégia de entrega

MVP: Foundation + US1. Depois, entregar US2, US3 e US4 incrementalmente, validando cada história de forma independente. Não criar backend, middleware, API Drive, provider extra ou camada intermediária sem requisito novo.
