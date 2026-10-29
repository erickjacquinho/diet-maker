# Implementation Plan: Fundação da migração para o backend Supabase (F0)

**Branch**: execução prevista em `feat/backend-foundation-f0`, criada a partir de `main` (R11). Este SDD foi aberto em `feat/configuracoes-perfil-save` sem criar branch. | **Date**: 2026-10-26 | **Spec**: [spec.md](./spec.md)

**Input**: Especificação clarificada em [spec.md](./spec.md), checklists em [checklists/](./checklists/) e pesquisa em [research.md](./research.md).

**Status**: Proposto. Nada foi implementado, aplicado no remoto ou commitado.

## Summary

A F0 prepara a base de segurança do backend sem mover dado clínico. As entregas são:

- uma migration imperativa que:
  - renomeia `online_runtime` → `app_runtime` com limites de tempo;
  - cria o schema `app`, negado por padrão;
  - cria `app.accounts` com RLS forçada;
  - cria a função `app.current_account_id()` (`SECURITY INVOKER`);
- um módulo de servidor com `withAccountTransaction` e `resolveOrCreateAccount`;
- o carregador do chaveiro da KEK das contas;
- verificações de CI no job `ci` existente: advisors, integração, um script de isolamento do cliente (bundle e prefixo público), lint e grafo de imports;
- um runbook para aplicar a fundação no projeto `diet-maker`, com rollback.

As decisões estão em [research.md](./research.md) (R1–R12).

## Technical Context

**Language/Version**: TypeScript 5.7 (strict) sobre Node 22 na CI; SQL PostgreSQL 17 (Supabase); script de CI em Node ESM (`.mjs`), sem dependências novas.

**Primary Dependencies**:

- Next.js 15 (App Router), `drizzle-orm` 0.45 (`node-postgres`), `pg` 8, `@supabase/ssr` 0.12 (Auth apenas);
- `server-only`;
- Supabase CLI 2.122.0, fixada na CI via `supabase/setup-cli@v1`;
- ESLint 8.57 com flat config (`eslint.config.mjs`).

**Storage**: PostgreSQL do projeto Supabase `diet-maker` (`sa-east-1`) via Supavisor em modo transação; local em `localhost:54322`. Schemas `app` (novo) e `private` (existente, sem mudança de grants ou policies).

**Testing**: Vitest 4 (`tests/**`), com integração de banco em `--pool=forks` contra o Supabase local (guarda `describeLocal` existente), testes de arquitetura por análise estática e um teste de tooling para o script de CI.

**Target Platform**: Servidor Node na Vercel (`gru1`, Hobby) e GitHub Actions `ubuntu-latest` com Docker.

**Project Type**: Aplicação web Next.js full-stack (projeto único).

**Performance Goals**: Nenhuma meta de throughput na F0. `statement_timeout` de 5 s e `idle_in_transaction_session_timeout` de 10 s no papel de runtime.

**Constraints**:

- NFR-002: no máximo +5 min de pipeline;
- janela remota < 10 min entre a migration e a republicação (FR-022a);
- nenhum segredo em log, relatório ou repositório;
- nenhuma ação remota sem confirmação do mantenedor (FR-022b).

**Scale/Scope**:

- 1 migration;
- 2 módulos de servidor;
- 1 script de CI;
- 5 arquivos de teste novos;
- 1 runbook;
- as atualizações de referência de FR-010a.

Não há `NEEDS CLARIFICATION`: as incógnitas técnicas foram resolvidas em [research.md](./research.md). A única verificação empírica pendente (R5: `auth.sessions` no Supabase local mínimo) é a tarefa T002 e tem caminho alternativo definido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Aplicação na F0 | Pré-design | Pós-design |
| :--- | :--- | :--- | :--- |
| I. Atomic Design | Nenhuma interface criada ou alterada. A regra de lint e o teste de grafo reforçam a fronteira cliente/servidor sem mudar a hierarquia. | N/A (passa) | N/A (passa) |
| II. Design System canônico | Sem tokens, componentes ou estilos novos. | N/A (passa) | N/A (passa) |
| III. Desktop e acessibilidade | Sem UI. | N/A (passa) | N/A (passa) |
| IV. Test-first e isolamento | Cada entrega começa por um teste que falha (tasks em ordem RED → GREEN). Os testes ficam em `tests/` e são determinísticos. A integração recusa destino diferente de `localhost:54322` (NFR-001). A CI não toca o remoto (FR-021). Os validadores emitem findings nominais (arquivo + padrão). | Passa | Passa |
| V. Spec-driven | A execução segue `/speckit-implement` com o hook obrigatório. A evidência remota vai para `validation-report.md`. Os docs marcam proposto/implementado/validado (NFR-004). | Passa | Passa |

Nenhuma violação: **Complexity Tracking** fica vazio.

## Architecture

```text
Navegador ──HTTPS──▶ Route handlers / Server Components (Next, Vercel gru1)
                         │  sessão validada (Supabase Auth, F1 integra)
                         ▼
          src/lib/server/online-db/accounts.ts
            resolveOrCreateAccount(userId) → transação interna com set_config('app.user_id', …, true)
            withAccountTransaction(accId)  → set_config('app.account_id', …, true)
                         │  pool único (client.ts), papel app_runtime, TLS com CA e hostname
                         ▼
          Supavisor (transação) ──▶ Postgres: schema app (RLS FORCE) | private (legado)
```

Os papéis `anon` e `authenticated` não alcançam `app` nem `private`, e a Data API está desligada (R1). A KEK das contas vive só nas variáveis da Vercel e é lida por `src/lib/server/crypto/account-kek.ts`. Na F0, nenhum fluxo a consome; o consumo começa na F2.

### Interfaces

- **Banco**: [contracts/database.md](./contracts/database.md), com papéis, privilégios, policies, a função de contexto e as invariantes de catálogo.
- **Módulos de servidor**: [contracts/server-modules.md](./contracts/server-modules.md), com `withAccountTransaction`, `resolveOrCreateAccount` e `loadAccountKeyring`.
- **Verificações de CI**: [contracts/ci-checks.md](./contracts/ci-checks.md), com os passos do job, os padrões, os códigos de saída e o formato do relatório.
- **Variáveis de ambiente**: [contracts/environment.md](./contracts/environment.md), com nomes, escopos, formatos e onde cada uma pode existir.

### Dados

[data-model.md](./data-model.md): `app.accounts`, os contextos de transação, o papel de runtime e o chaveiro da KEK.

## Project Structure

### Documentation (this feature)

```text
specs/25-10-26-fundacao-migracao-backend-supabase/
├── spec.md
├── research.md
├── plan.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── database.md
│   ├── server-modules.md
│   ├── ci-checks.md
│   └── environment.md
├── checklists/
│   ├── requirements.md
│   ├── security.md
│   └── operations.md
├── tasks.md                 # /speckit-tasks
├── implementation-log.md    # /speckit-implement
└── validation-report.md     # evidência do runbook remoto (FR-022)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── <timestamp>_backend_foundation.sql        # NOVO: rename, app, accounts, função, policies, grants

src/lib/server/
├── online-db/
│   ├── client.ts                                 # inalterado (único dono do pool)
│   ├── repository.ts                             # só exporta o uuidPattern existente (withOwnerTransaction legado)
│   └── accounts.ts                               # NOVO: withAccountTransaction, resolveOrCreateAccount
└── crypto/
    └── account-kek.ts                            # NOVO: loadAccountKeyring

scripts/
└── verify-client-isolation.mjs                   # NOVO: prefixo público + bundle (pós-build)

eslint.config.mjs                                 # + no-restricted-imports (error)
package.json                                      # + script verify:client-isolation
.github/workflows/ci-cd.yml                       # job ci: + verify, Supabase local, advisors, integração

tests/
├── server/
│   ├── backend-foundation.integration.test.ts    # NOVO: catálogo, matriz, módulo accounts no banco
│   ├── accounts.test.ts                          # NOVO: validação de UUID antes do banco
│   ├── account-kek.test.ts                       # NOVO: carregador
│   └── (existentes)                              # online_runtime → app_runtime
├── architecture/
│   └── server-boundaries.test.ts                 # NOVO: grafo do cliente, pool, server-only
└── tooling/
    └── verify-client-isolation.test.ts           # NOVO: fixtures positivas e negativas

docs/setup/
├── backend-foundation.md                         # NOVO: runbook remoto + KEK + rollback
└── online-auth.md                                # app_runtime; link para o runbook
.env.example                                      # app_runtime; variáveis ACCOUNT_KEK_* (vazias)
refs/dieta-db/15-esquema-transferencia-backend-supabase.md   # app_runtime; status da F0
```

**Structure Decision**: Projeto Next único. O código novo fica em `src/lib/server/**` (com `server-only`), ao lado do cliente online existente, para que o FR-012 tenha um único diretório a vigiar. O acesso a `app.accounts` usa SQL por `tx.execute`, sem tabela Drizzle nova, porque a F0 só tem duas consultas. O script de CI segue o padrão dos `scripts/*.mjs` existentes, e os testes ficam nas pastas já usadas (`tests/server`, `tests/architecture`, `tests/tooling`).

## Testing Strategy

| Camada | O que prova | Requisitos | Onde roda |
| :--- | :--- | :--- | :--- |
| Integração de banco | Matriz de isolamento M1–M14 (com M6a); atributos e timeouts do papel; ausência de `DELETE`/`TRUNCATE`/`REFERENCES`; catálogo sem privilégio de navegador, incluindo `EXECUTE`; `SECURITY INVOKER` e `search_path` vazio; `RESTRICT`; reaplicação idempotente; estado inválido do rename | FR-001–FR-010, US1, SC-001, SC-004 | Job `ci` (passo de integração) e local com Docker |
| Integração do módulo | No mesmo arquivo: contexto não vaza na mesma conexão (pool `max: 1`), rollback sem contexto residual, resolução idempotente, erro de FK propagado | FR-009, FR-009a, FR-011, US4 | Job `ci` (passo de integração) |
| Unitário | Validação de UUID antes do banco; carregador da KEK (ausente, malformado, igual à master, válido, sem material em mensagem, `JSON.stringify` ou `inspect`) | FR-011, FR-014, US5, NFR-003 | Job `ci` |
| Arquitetura | Grafo do cliente sem módulos proibidos; acesso ao pool só nos módulos permitidos; `server-only` nos módulos novos; fixture de cadeia transitiva | FR-012, FR-013, FR-018 | Job `ci` |
| Tooling | O script detecta cada padrão injetado e não dá falso positivo no código atual; o relatório não traz valores | FR-017, FR-019, SC-002 | Job `ci` |
| Advisors | `security` bloqueia em `warn`; `performance` só registra | FR-020, US3, SC-003 | Job `ci` |
| Regressão | Suíte existente, mais rotas e browser | FR-023, SC-005 | Job `ci` |
| Runbook remoto | Região, Data API, GraphQL, SSL, conexão do runtime, variáveis Vercel, Vault sem KEK, smoke | FR-022–FR-022b, US6 | Manual, registrado em `validation-report.md` |

## Risks and Mitigations

| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| `auth.sessions` ausente no Supabase local mínimo | A migration legada falha na CI | A T002 comprova o `start -x` antes das tarefas de banco (R5). Se falhar, usar `supabase start` com menos exclusões. |
| Advisors acusam objetos legados (ex.: view `private.runtime_auth_sessions`) | O gate falha antes da F0 | A T002 também registra a linha de base. Um achado em objeto legado só é corrigido se a correção não alterar grants, policies ou dados (FR-010). Do contrário, a implementação para e pede decisão ao mantenedor. |
| Supavisor mantém autenticação do nome antigo | Login do runtime falha após o rename | Nova tentativa em até 2 min; depois, rollback de FR-022a (R2). |
| A janela remota passa de 10 min | Indisponibilidade do fluxo online | Os passos 3 e 4 (KEK, nova senha, variável) acontecem antes da migration. A republicação é de um deploy existente, sem build novo. Os tempos ficam registrados. |
| Falso positivo da varredura | CI vermelha sem motivo | Padrões qualificados (R6). O teste de tooling roda contra o build atual. Uma exceção exige uma entrada nominal documentada no script. |
| Segredo impresso por erro ou relatório | Vazamento | Os relatórios citam só arquivo, padrão e contagem. O material da KEK fica em `KeyObject`. Os testes afirmam a ausência do valor na mensagem (NFR-003). |
| Integração pulada em silêncio | Gate inútil | O passo de CI define as duas variáveis literalmente, e o `describeLocal` existente executa os testes quando elas existem (R9). |
| Passos de banco deixam o job `ci` lento | NFR-002 estourado | A duração é medida na T002 e no PR. Se passar de 5 min, os passos de banco viram um job paralelo (R5). |
| Conflito com o SDD em andamento | Mistura de mudanças | Branch própria a partir de `main` (R11). |

## Validation and Rollout

1. **Local**: seguir [quickstart.md](./quickstart.md) §1–§4 (Supabase local, migrations do zero, advisors, testes, build e varredura).
2. **CI**: verde no PR da branch `feat/backend-foundation-f0`.
3. **Remoto**: seguir [quickstart.md](./quickstart.md) §5 e `docs/setup/backend-foundation.md`. São os 8 passos de FR-022a, cada um confirmado pelo mantenedor (FR-022b), com a evidência em `validation-report.md`.
4. **Merge**: pelo fluxo normal. O código da F0 não depende do passo remoto, e o passo remoto não depende do merge.

## Complexity Tracking

Sem violações da constituição.
