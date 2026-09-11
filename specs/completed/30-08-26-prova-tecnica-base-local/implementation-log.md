# Implementation Log: Prova técnica e base local

## Execution metadata

- Feature: `30-08-26-prova-tecnica-base-local`
- Scope: `poc/local-db-proof/`
- Adapter status: approved for the isolated technical gate after Phase 8 remediation and a clean final convergence pass; not a production or product-integration approval.
- Checkpoint before implementation: `4361e39` (`chore(persistence): checkpoint before local db proof`)
- Runtime: Node `22.23.1`, npm `10.9.8`

## Task evidence

As fases T001–T035 abaixo são histórico da execução original, cuja aprovação foi suspensa pela revisão independente. As evidências vigentes e correções dessas afirmações estão na Phase 8 e em `poc-report.md`.

### T001–T003 — Setup

- Added an isolated package with exact dependency versions for PGlite, Drizzle, Vite, Vitest and Playwright.
- Added browser-only Vite harness entry point and local ignore rules.
- Added separate Vitest and Playwright configurations.
- Verification: `npm install` passed in `poc/local-db-proof/`.
- Verification: `npm run type-check` passed.
- Verification: `npm test` passed with no tests present yet.
- Verification: `npx playwright install --dry-run chromium` resolved Chromium `151.0.7922.34`.

### T004–T009 — Foundation

- Added domain-facing contracts and typed PoC errors without importing Drizzle or PGlite into the contract layer.
- Added deterministic multi-account fixture with active/snapshot diets, archived patient, recipes, nutrition snapshots and contextual draft.
- Added relational schema for accounts, patients, recipes, diet plans, meals and meal items, including foreign keys, checks and one-active-plan partial index.
- Generated `drizzle/0000_initial.sql` with Drizzle Kit and added an explicit browser-compatible migration executor.
- Added PGlite client opening with persistent IndexedDB mode for browser runs and explicit persistence errors; memory mode remains test-only.
- Added nominal evidence report serialization with runtime, browser, viewport and diagnostic timing fields.
- Verification: `npm run type-check` passed.
- Verification: `npm run db:generate` reported no schema changes after the generated migration was installed.
- Verification: `npm run build` passed.
- Verification: `npm test -- --run tests/fixture.test.ts` passed (`2` tests).

### T010–T013 — US1

- Wrote the persistence/reopen and explicit-storage-failure tests before adding the repository implementation; the first run was red because `repositories.ts` did not exist.
- Added the repository seam for fixture seed, scoped reads and composed diet writes.
- Added the browser-only harness for initialization, seed, reopen and diagnostic timings.
- Browser evidence: Chromium `151.0.7922.34`, `1280x900`; initial open/migration `3732.60 ms`, query `163.00 ms`, fixture write `58.60 ms`; reopen recovered `3` diets.
- Verification: `npm test -- --run tests/db.integration.test.ts` passed (`2` tests).
- Verification: `npm test` passed (`4` tests).
- Verification: browser run through `with_server.py` and `scripts/us1_browser_check.py` passed.
- Evidence recorded in `poc-report.md`; adapter decision remains `needs re-evaluation` pending US2–US4.

### T014–T021 — US2

- Wrote tests for rollback, cross-account scope, child relation scope, active-plan replacement, draft isolation and two-tab behavior.
- Added explicit aggregate-child relation validation in the repository; transaction rollback covers the previous ACTIVE-to-SNAPSHOT transition as well as new rows.
- Added an IndexedDB draft store with an independent database/object-store namespace, validation, update ordering and removal.
- Added fail-closed Web Locks acquisition before PGlite initialization and released the lock before closing the client.
- Verification: `npm test -- --run tests/transaction.integration.test.ts tests/drafts.integration.test.ts` passed (`6` tests).
- Verification: `npm run test:browser -- tests/browser/single-tab.spec.ts` passed (`1` scenario).
- Evidence recorded in `poc-report.md`; adapter decision remains `needs re-evaluation` pending US3–US4.

### T022–T027 — US3

- Wrote migration and logical portability tests before adding the second migration and transfer module; initial runs exposed the missing migration/version API and transfer module.
- Added additive `0001_add_fixture_metadata.sql` and a migration executor that journals applied IDs and skips re-execution.
- Added a versioned logical JSON envelope with explicit schema/format validation and relationship checks before mutation.
- Added transactional replacement of one account’s confirmed sample while preserving other account scopes.
- Verification: migration tests passed (`2` tests), including applying v2 over a populated v1 database and re-running it.
- Verification: portability tests passed (`2` tests), including round-trip, draft exclusion and invalid relation rejection.
- Verification: `npm run db:generate` reported no schema changes.

### T028–T031 — US4

- Wrote the browser scenario for an unprepared-resource error and prepared-resource offline execution.
- Added an explicit preparation gate and offline workflow that repeats read, composed write, logical round-trip and reopen.
- Integrated controls into the minimal browser harness with keyboard-operable native buttons and no product UI imports.
- Verification: `npm run test:browser -- tests/browser/offline.spec.ts` passed (`1` scenario), including `OFFLINE_RESOURCE_NOT_READY` and successful offline reopen.
- Evidence recorded in `poc-report.md`; adapter decision is now ready for final cross-cutting validation.

### T032–T035 — Polish e validação final

- Consolidated the final report with FR/NFR/SC matrix, explicit `approved` decision, versions, execution mode, diagnostic timings and limitations.
- Added the isolated `lint` script/configuration and pinned TypeScript `5.9.3` so the PoC has a supported ESLint/type-aware lint toolchain.
- Replaced the portable JSON importer's unsafe double type assertion with runtime guards for every persisted collection; drafts now validate on read as well as on write.
- Boundary audit found no `localStorage`/`sessionStorage`, legacy migrator, remote request or root application import in the PoC; engine imports remain confined to `poc/local-db-proof/src/db/` and its isolated package.
- Verification: `npm install`, `npm run db:generate`, `npm run type-check`, `npm run lint`, `npm test`, `npm run test:browser` and `npm run build` passed; Vitest reported 6 files/14 tests and Playwright reported 2 scenarios.
- Verification: `npm audit --omit=dev --audit-level=high` found 0 production vulnerabilities; the full install reported 4 moderate development/transitive advisories.

## Revalidação após revisão independente — Phase 8

- Checkpoint: `3594538` (`chore(persistence): checkpoint before correcting proof gaps`). Checkpoint limitado aos caminhos da PoC já preservados no HEAD para não incluir alterações paralelas da segunda etapa.
- Escopo ativo resolvido com `SPECIFY_FEATURE_DIRECTORY` e `check-prerequisites.ps1 -PathsOnly`; arquivos obrigatórios e checklists verificados separadamente para preservar `.specify/feature.json` da segunda etapa.
- Checklists documentais: requirements 16/16; technical 30/30. Não representam comprovação de execução.
- Achados reproduzidos: reabertura perde lock; seed aceita dieta fora da Conta; erro de reabertura mantém sucesso; round-trip da Conta Beta falha em array vazio; autosave atrasado sobrescreve draft recente.
- Preflight: T036–T041 retomam FR-005/007/008/009/012/013, US1/AC3, NFR-002 e a ordenação prevista no data-model, sem alterar spec/plan ou ampliar escopo.

### T036–T037 — Exclusividade e falhas observáveis

- RED: após reabrir, a segunda aba inicializava em vez de retornar `LOCK_UNAVAILABLE`; erro de storage na reabertura mantinha `data-status=pass`; lease era liberado com motor ainda aberto, inclusive em falha de migration.
- GREEN: `openDatabase` adquire Web Lock por padrão no modo browser persistente; fecha o motor antes de liberar a lease, inclusive ao falhar a inicialização. Falha de cleanup mantém a exclusividade e pede fechamento da aba.
- Harness registra `US1/reopen` com código nominal, limpa referências fechadas e permite reinicialização após storage restaurado.
- Verificação: `npm run test:browser -- tests/browser/reopen.spec.ts tests/browser/single-tab.spec.ts` — 3/3; `npm test -- tests/client-lifecycle.integration.test.ts` — 2/2.

### T038 — Integridade física e evolução segura

- RED: os quatro casos de seed com ownership inválido eram aceitos (6 testes passaram / 4 falharam).
- Adicionadas FKs de Account em Patient, Recipe e DietPlan e FK composta `(account_id, patient_id)` de DietPlan para Patient. Migration nova `0002_account_patient_scope.sql`, schema v3; migrations anteriores preservadas.
- GREEN: `npm test -- tests/transaction.integration.test.ts tests/migration.integration.test.ts` — 14/14. Cobertura inclui os três failpoints do agregado, quatro violações de ownership, upgrade v1/v2 → v3 idempotente e rejeição atômica de v2 inválida sem apagar dados nem registrar v3.

### T039–T040 — Portabilidade vazia e ordem de autosave

- RED: round-trip Beta e Conta sem filhos falhavam em `values([])`; três testes de autosave recuperavam o payload antigo.
- GREEN: inserts opcionais agora respeitam arrays vazios na mesma transação; `npm test -- tests/portability.integration.test.ts` — 6/6, incluindo formato/schema incompatíveis e preservação da outra Conta.
- GREEN: draft faz leitura e escrita condicional na mesma transação IndexedDB; compara instantes válidos de `updatedAt`, ignora revisões antigas e mantém ordem de chegada em timestamps iguais. `npm test -- tests/drafts.integration.test.ts` — 5/5; cenário equivalente também passou no IndexedDB real em Chromium.

### T041 — Ampliação das evidências e revisão

- Acrescentada comparação completa das duas Contas após fechamento de página, com tempos separados de abertura/migration, seed e leitura; não apenas contagem de dietas.
- Acrescentado upgrade persistente v2 → v3 no navegador com comparação de todas as linhas e reexecução idempotente. Teste direcionado aprovado.
- Revisão adicional T036/T037: rejeição assíncrona de Web Locks deixava inicialização pendente; falha real de seed após abertura retinha lease. Ambos reproduzidos antes das correções: observar rejeição da request e fechar handle de inicialização malsucedida.
- Repetições de duas abas detectaram trava retida após fechamento da página reaberta, inclusive aguardando `navigator.locks.query()`. Investigação isolou o comportamento com/sem motor; em validação a retirada do fechamento assíncrono iniciado no `pagehide`, mantendo fechamento explícito ordenado.
- Revisão de entrada/segurança limitada à PoC: JSON passa por guards de envelope, versões e relações antes da transação; valores SQL são parametrizados; FKs e rollback protegem o estado confirmado; texto de erro usa `textContent`. Sem acesso remoto, credenciais, fallback legado ou isolamento de usuários autenticados prometido.

### Encerramento T036/T037/T041 — Resultado definitivo

- Retirar somente o trabalho assíncrono de `pagehide` reduziu, mas não eliminou, a falha (11/12). A solução final mantém fechamento explícito motor → lease e finaliza o callback de lock no término não recuperável da página, sem iniciar nova escrita em disco; `event.persisted=true` mantém a lease.
- GREEN: `npm run test:browser -- tests/browser/single-tab.spec.ts --workers=1 --repeat-each=3` — 12/12. Não houve aumento do timeout para esconder o defeito; a retomada espera o estado observável de liberação via Web Locks.
- GREEN: `npm run test:browser -- --workers=1` — 11/11, incluindo fechamento direto da página sem `close()`, ambas as Contas integralmente preservadas, migration v2 persistente, autosave concorrente real e offline preparado.
- GREEN: rodada final `npm test` — 31/31, 7 arquivos, 101,28 s; `npm run type-check`, `npm run lint`, `npm run db:generate` e `npm run build` — PASS. Geração sem alterações; build manteve avisos do motor (`eval` e chunk ~735 kB).
- Chromium efetivamente lançado: `151.0.7922.34`. Tempos correntes: abertura/migrations 5108,80–5168,30 ms, seed 124,50–141,60 ms e leitura das duas Contas 782,90–798,80 ms. Não são benchmark.
- Quickstart atualizado com comandos npm reais; evidência Python antiga não é mais atribuída a comparação integral/fechamento de página. Os testes de integração são descritos separadamente dos cenários browser.

## Análise final e convergência obrigatória

- `speckit-analyze` aplicado em modo read-only à primeira feature: 26 requisitos/critérios, 41 tarefas, cobertura 26/26, zero conflitos críticos e zero tarefas sem requisito de origem.
- `speckit-converge`, iteração final 1: skill local relida integralmente; hooks consultados antes/depois (nenhum hook de converge); contexto resolvido com `-PathsOnly` para não alterar o ponteiro da segunda etapa.
- Inventário conferido: 13 FR + 5 NFR + 8 SC, 12 cenários de aceite, 5 fronteiras do plano e 5 princípios constitucionais. Código, testes, migrations, comandos, fixture e relatório confrontados com esse inventário, sem usar comparação Git como método de convergência.
- Resultado: `converged`. Zero achados missing/partial/contradicts/unrequested; zero críticos/altos/médios/baixos. Nenhuma tarefa adicionada e nenhum código alterado durante a passada.
- `tasks.md` permaneceu byte a byte intacto durante a passada: SHA-256 antes/depois `A8AE84E8D9583AF1E22FCAD2CE1617EEA5F8E14B924438235F6E13AC6C9E2041`. Depois da passada, o wrapper registrou o resultado e marcou T041 concluída; 41/41 tarefas encerradas.
- Limites: evidência Chromium/fixture pequena, sem certificação de produção/PWA/carga, sem alterar ou validar como parte desta entrega o trabalho paralelo da segunda etapa.
- Checkpoint de recuperação desta remediação: `3594538`. Alterações finais não foram commitadas; spec e plan mantêm a intenção aprovada.
