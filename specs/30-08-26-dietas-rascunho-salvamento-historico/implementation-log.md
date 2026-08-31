# Implementation log: Dietas — rascunho, salvamento e histórico

## 2026-08-30 — preparação e Fase 1

- Estado inicial: branch `backend-refactor`, HEAD `3594538d9250ddfb0229bbf91382e268670676f3`, com alterações e arquivos não rastreados preexistentes. O estado completo foi preservado antes da implementação.
- Checkpoint: `609ca64436324794a18e34791862416f546e13f9` — `chore(dietas): checkpoint before implementing draft history`.
- Preflight: `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` encontrou `spec.md`, `plan.md`, `tasks.md` e documentos auxiliares; checklists `requirements.md` 16/16 e `persistence-quality.md` 34/34; 58/58 tarefas com exatamente uma skill.
- Análise Spec Kit: cobertura documental confirmada, sem finding crítico/bloqueador. Os caminhos ainda ausentes são os artefatos previstos pelas tarefas.
- Baseline: `npm run type-check` passou; `npm run lint` passou.
- Hook de extensão: `.specify/extensions.yml` registra `before_implement: speckit-implement` obrigatório, mas não há executável shell separado; a execução está sendo conduzida pelo fluxo explícito `$sdd-implement` equivalente.

### T001

- Hipótese inicial: instalação normal resolveria as dependências fixadas.
- Falha: `npm install decimal.js@10.6.0` e `npm install --save-dev @playwright/test@1.62.1 fake-indexeddb@6.2.5` falharam com `ERESOLVE`, pois `eslint-config-next@16.3.0` exige `eslint >=9`, enquanto o projeto fixa `eslint@8.57.1`.
- Correção: repetir os dois comandos com `--legacy-peer-deps`, sem alterar as versões do plano.
- Verificação: `npm ls decimal.js @playwright/test fake-indexeddb --depth=0` mostrou `decimal.js@10.6.0`, `@playwright/test@1.62.1` e `fake-indexeddb@6.2.5`; `npm run type-check` passou.
- Limitação não bloqueante: `npm` reporta 5 vulnerabilidades high preexistentes/da árvore atual; não foi executado `npm audit fix` por poder alterar escopo e versões.

### T002–T004

- Criados os barrels de `domain/diets`, `application/diets`, `infrastructure/diet-drafts` e `local-db/diets`.
- Criadas fixtures sintéticas em `tests/fixtures/diets.ts`; verificação textual confirmou ausência de `localStorage`, `sessionStorage`, `indexedDB`, relógio e aleatoriedade.
- Criado inventário executável em `tests/architecture/diet-legacy-inventory.ts` e teste correspondente; `npm test -- tests/architecture/diet-legacy-inventory.test.ts` passou (1 arquivo, 1 teste).
- `npm run type-check` passou após a Fase 1.

### T005–T016 — contratos, precisão e persistência relacional

- Testes primeiro: contratos de dieta, round-trip decimal/energia, manifesto e snapshot TACO, Web Lock, migration e repositório foram criados e inicialmente falharam por módulos/contratos ausentes.
- Implementação: value objects e tipos nominais em `src/lib/domain/diets`, cálculo com `decimal.js` sem conversão intermediária para `number`, adaptador TACO de 597 registros, trava fail-closed, migration `0001_diet_draft_history`, schema Drizzle, mapeadores e leitura escopada do agregado.
- Verificação: testes direcionados passaram (contratos/nutrição 7 testes, TACO 3, lock 3, migration 3, repositório 1); `npm run type-check` passou.

### T019–T022 — rascunho e comandos de editor

- IndexedDB usa store `diet-drafts`, índice de contexto único, clones estruturados, revisão monotônica, reserva de identidade, invalidação por arquivamento e resultado nominal para revisão superada.
- Os comandos validam Conta/paciente ativo, recuperam o contexto, preservam ID/versão da ACTIVE, criam nova dieta com peso atual e metas zeradas e encaminham autosave/flush pelo port do draft; nenhuma criação/abertura chama mutação confirmada.
- Verificação: `npm test -- tests/infrastructure/diet-draft-store.integration.test.ts` (3 testes), `npm test -- tests/lib/diets/diet-draft-application.test.ts` (3 testes) e `npm run type-check` passaram.

### T018 — fronteira arquitetural inicial

- Criado `tests/architecture/diet-persistence-boundary.test.ts`, que bloqueia providers no domínio/aplicação e na UI, mantendo findings nominais dos consumidores legados até o cutover.

## 2026-08-30 — histórias, cutover e validação

### T017–T027 — aplicação de draft e US1

- A composição agora injeta `DietApplication`, repositório relacional, reader e
  `IndexedDbDietDraftStore`; a UI abre o mesmo draft em editor/ciclo e expõe
  `pending`, `saving`, `persisted`, `error`, retry, descarte e flush antes de
  navegação.
- `DietBuilderTemplate` comunica `aria-busy`/`role=status`, bloqueia reenvio e
  usa `ConfirmationAlertDialog` para descarte local. Nenhum status de autosave
  é apresentado como backup.
- Verificação: testes de draft, hook/template, sincronização editor-ciclo e
  `npm run type-check` passaram.

### T028–T035 — confirmação atômica e UX de salvamento

- Validação cobre mínimo clínico, números, unidades, snapshots, dias e relações.
  `confirmActive` grava o agregado completo em transação, com idempotência,
  versionamento da ACTIVE e rollback.
- `saveDietAsActive` implementa `flush → reserve target → validate → confirm →
  removeIfRevision`, mantendo o draft em conflito, resultado incerto ou falha
  de limpeza. O atalho Ctrl/Cmd+S compartilha o callback assíncrono e bloqueia
  repetição durante a operação.
- Verificação: testes de validação, repositório, protocolo de confirmação,
  `useSaveShortcut`, acessibilidade e foco passaram.

### T036–T045 — vigente, histórico e snapshots

- O reader projeta ACTIVE e SNAPSHOT em ordem, com `canEdit` somente na vigente
  e `canDelete=false` no histórico. `ReadOnlyDietModal` renderiza snapshots
  congelados e não cria draft.
- A busca de alimentos foi restringida a TACO e carrega o snapshot integral.
  Cálculos usam referência/peso congelados; colagem de itens agora reserva IDs
  que não colidem com a dieta atual.
- A jornada Chromium serial confirmou reabertura após reload, operação offline
  preparada e bloqueio da segunda aba.

### T046–T054 — cópia e descarte

- Fontes anteriores são somente prescrições confirmadas. Metas e dieta completa
  são copiadas por revisão independente, com IDs novos e peso correto do
  destino/origem. A modal de importação aguarda persistência antes de fechar.
- Descarte é condicional à revisão; arquivamento invalida drafts sem reativá-los,
  e falhas de limpeza permanecem observáveis como `cleanupPending`.

### T055–T057 — cutover e design system

- Removidos consumidores de persistência de dieta de `dietStore`,
  `dietDuplication`, stores clínicos, tipos de paciente e consulta. Helpers
  puros ficaram em módulos de compatibilidade, sem fallback, dual write ou
  histórico embutido.
- O inventário legado e o boundary canônico retornam zero findings ativos. Os
  novos overlays/tabelas foram registrados e passaram os validadores de
  Atomic Design, DataTable, links e design system. Componentes internos/legados
  de outra superfície foram classificados no verificador sem alterar seu
  comportamento.

### T058 — aceitação

- A matriz completa de comandos, versões, duração, falhas injetadas e limites
  está em [validation-report.md](./validation-report.md).
- A suíte direcionada do feature terminou verde; a suíte completa passou 657
  testes e manteve duas falhas preexistentes da adequação de componentes fora
  deste feature. O build passou em execução sequencial e o Vitest passou a
  excluir specs Playwright, que têm comando dedicado.

## Convergência final

- Reconciliados `spec.md`, `plan.md`, `tasks.md` e os artefatos de validação:
  58/58 tarefas concluídas, sem tarefa adicional necessária.
- `tests/architecture/diet-legacy-inventory.test.ts`,
  `tests/architecture/diet-persistence-boundary.test.ts`,
  `tests/lib/diets/legacy-cutover.test.ts` e o auditor legacy passaram sem
  findings ativos.
- Nenhum gap de implementação foi encontrado. As únicas falhas fora do
  escopo permanecem explicitamente registradas em `validation-report.md` e
  pertencem à adequação de componentes preexistente.

## 2026-08-31 — revalidação e fechamento

- `npm test -- --run` — PASS: 179 arquivos e 677 testes.
- `npm run type-check` e `npm run lint` — PASS.
- `npm run test:browser -- --workers=1` — PASS: 4/4 cenários. A configuração
  agora usa a porta dedicada `PLAYWRIGHT_PORT` (3100 por padrão), não reutiliza
  servidor externo e aplica timeout global de 120 s, compatível com as jornadas
  de desenvolvimento.
- `npm run audit:atomic-design`, `npm run verify:design-system`,
  `npm run verify:links`, `npm run verify:design-system-legacy` e os dois
  gates direcionados de tabela — PASS.
- `NEXT_PRIVATE_BUILD_WORKER=1 npm run build` — PASS; 13 rotas geradas.
- O fechamento confirma 58/58 tarefas concluídas e nenhum finding ativo no
  inventário/boundary de persistência de dietas.
