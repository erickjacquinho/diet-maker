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
