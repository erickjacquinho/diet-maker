# Implementation Log: Fundação da migração para o backend Supabase (F0)

Execução por `sdd-implement` no worktree `feat/backend-foundation-f0` (de `main`). Checkpoint: `8455d1e`.

## Estado inicial

- Docker Desktop estava parado; foi iniciado localmente.
- `main` tem só a migration `20261011002435_online_account_saves.sql`. As migrations de perfil/settings estão em outra branch e não fazem parte desta base. A linha de base dos advisors (T002) vale para a migration existente.
- `node_modules` instalado com `npm ci` no worktree.

## T001

Worktree criado com `git worktree add ../diet-maker-f0 -b feat/backend-foundation-f0 main`; SDD copiado e `.specify/feature.json` apontado. A branch `feat/configuracoes-perfil-save` ficou intacta.

## T003

`package.json` ganhou `verify:client-isolation`; `npm run` o lista.

## T012 RED / T013 GREEN

- RED: `npx vitest run tests/tooling/verify-client-isolation.test.ts` → 31 falhas (script inexistente, exit 1 do `node`).
- GREEN: após `scripts/verify-client-isolation.mjs` → 31/31 passam.
- `npm run build && npm run verify:client-isolation` → `checked 7 patterns in 538 files (project-ref: skipped)`, exit 0. Nenhum falso positivo; nenhuma exceção nominal necessária.

## T014

- RED (antes de editar `eslint.config.mjs`): os três comandos não citam `no-restricted-imports`.
- GREEN: componente e hook citam `no-restricted-imports`; `src/app/api/z/route.ts` não cita.

## T015 (desvio documentado)

O teste real de grafo acusou 420+ cadeias até `drizzle-orm` e `drizzle-orm/pglite`: o código local-first (PGlite no navegador, `src/lib/infrastructure/local-db/**`) usa o drizzle core legitimamente. Corrigir "o import no próprio arquivo de cliente" não é possível sem remover o banco local. Decisão mínima e reversível: o grafo transitivo proíbe `@supabase/*`, `pg`, `drizzle-orm/node-postgres`, módulos de `src/lib/server/**` e `server-only`; `drizzle-orm` core e `drizzle-orm/pglite` ficam permitidos transitivamente. A regra ESLint (import direto em `src/components/**` e `src/hooks/**`) segue como em K3, e nenhum desses arquivos importa `drizzle-orm` direto (lint limpo). Fixture extra cobre node-postgres proibido e pglite permitido. Contrato K3/K4 e FR-018 devem ser ajustados no texto (follow-up de documentação).

## T002 (spike do Supabase local)

- Comando final (igual ao de R5): `npx supabase start -x realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor` — exit 0, **270 s** na primeira execução (inclui o download das imagens; o tempo de CI será medido no PR, T025).
- `npx supabase db reset --local` — exit 0, 99 s (inclui pull de imagem); `to_regclass('auth.sessions')` = `auth.sessions`, então o conjunto mínimo basta (R5 confirmado, `db start` não é necessário).
- Baseline de advisors sobre a migration atual de `main`:
  - segurança (`--type security --level warn --fail-on warn`): **No issues found**, exit 0, 6 s;
  - desempenho: 4 × `auth_rls_initplan` (WARN, `private.professional_profiles` e `private.saves`, policies `*_owner`). Decisão (R5): não bloqueia (`--fail-on none`) e corrigir exigiria alterar policies legadas, o que FR-010 veda; fica registrado como dívida de desempenho legada.
- Nenhum achado legado exige mudar grants ou policies; não foi necessário pedir decisão ao mantenedor.

## T004 RED

Os seis testes usam `app_runtime`. Com o banco de T002 (papel ainda `online_runtime`), `npx vitest run tests/server --pool=forks`: 9 falhas nos testes de runtime/integração (repository, save-catalog, save-registry, online-db.integration, 503 por falha de login do papel) — o papel `app_runtime` não existe.

## T007 RED / T018 RED

- `tests/server/backend-foundation.integration.test.ts` (C1–C9, M1–M14 com M6a): falha no `beforeAll` (`app.accounts` não existe).
- `tests/server/accounts.test.ts`: falha por módulo inexistente (`@/lib/server/online-db/accounts`).
- `tests/architecture/server-boundaries.test.ts` (parte 3): falha — `accounts.ts` ausente da lista `server-only`.

## T005, T008–T011 GREEN

- `npx supabase migration new backend_foundation` → `supabase/migrations/20261026220111_backend_foundation.sql`.
- Após o rename e os limites (T005): `db reset --local`, senha local do runtime definida a partir de variável fora do repositório; `npx vitest run tests/server --pool=forks` → 58 passed (os testes existentes de `private` com `app_runtime` ficaram verdes; só os testes novos de T007/T018 falhavam, como esperado).
- Após schema, privilégios, tabela, função e policies (T008–T011): `npx vitest run tests/server/backend-foundation.integration.test.ts --pool=forks` → **25/25** (C1–C9, M1–M14 com M6a); `npx supabase db reset --local` duas vezes seguidas, sem erro (FR-010).

## T018 RED → T019 GREEN

- RED: `accounts.test.ts` e o bloco `accounts module` do teste de integração falhavam por módulo inexistente; o teste de arquitetura falhava na parte 3.
- GREEN: `src/lib/server/online-db/accounts.ts` (`server-only` na primeira linha) e `export` do `uuidPattern` em `repository.ts` (única mudança). `npx vitest run tests/server --pool=forks` → 12 arquivos, 94 passed, 1 skipped; `npm run type-check` limpo.
- Nota: o driver (drizzle) embrulha o erro do Postgres em `DrizzleQueryError`; o teste do FK confere `cause.message`. O erro lançado por `run` continua sem alteração.

## T020 RED → T021/T022 GREEN

- RED: `account-kek.test.ts` falhava por módulo inexistente e o teste de arquitetura listava `account-kek.ts` sem `server-only`.
- GREEN: `src/lib/server/crypto/account-kek.ts`; `npx vitest run tests/server/account-kek.test.ts tests/architecture/server-boundaries.test.ts` → 25 passed. Versões não ativas malformadas também falham fechado (mesma mensagem, nomeando a variável).
- `.env.example` ganhou `ACCOUNT_KEK_ACTIVE_ID=` e `ACCOUNT_KEK_V1=` vazias com o comentário do contrato; `npm run build && npm run verify:client-isolation` → `checked 7 patterns in 540 files`, exit 0.

## T016 (prova negativa dos advisors)

1. Migration temporária `CREATE TABLE public.advisor_probe (id int)` sem RLS + `db reset --local` + `db advisors --local --type security --level warn --fail-on warn` → `rls_disabled_in_public` (ERROR), **exit 1**.
2. Migration removida + `db reset --local` + mesmo comando → `No issues found`, **exit 0** (a migration da fundação também passa limpa).
3. `db advisors --local --type performance --fail-on none` → **exit 0** (não bloqueia; só lista os 4 `auth_rls_initplan` legados).
4. `git status` não mostra a migration temporária.

## T017

`.github/workflows/ci-cd.yml` (job `ci`): passos novos depois do build — `verify:client-isolation`, `supabase/setup-cli@v1` 2.122.0, `supabase start -x …` (comando de T002), senha local mascarada (`::add-mask::`, via `GITHUB_ENV`), advisors de segurança (bloqueia) e desempenho (informativo), e `npx vitest run tests/server --pool=forks` com `LOCAL_SUPABASE_DB_URL` e `ONLINE_DATABASE_URL` só nesse passo. `cd` continua com `needs: ci`. `git grep -n "secrets\." .github/workflows/ci-cd.yml` → sem ocorrência; `npx --no-install js-yaml` faz o parse sem erro. Confirmação definitiva: PR (T025).

## T023

`docs/setup/backend-foundation.md` (KEK, passos 0–8, evidência R10, rollback com `migration repair`, R12, modelo de registro), linkado em `docs/setup/online-auth.md`; `validation-report.md` criado com uma seção por passo, status "proposto". `npm run verify:links` → 414 arquivos, 573 links, zero quebrados (o diretório `specs/` é ignorado pelo verificador).

## T026 (auditoria de segurança do diff `main..HEAD`)

Escopo: o checklist da tarefa, aplicado ao diff (a skill `security-audit` completa, com subagentes, não se justifica para ~600 linhas de migration, dois módulos e um script).

- Segredos versionados: busca por prefixos de chave Supabase, JWTs, chaves privadas e connection strings com senha → só ocorrências legítimas (credencial padrão do banco descartável local `postgres:postgres@127.0.0.1:54322` e literais de padrão do script). Nenhum segredo real.
- `server-only` como primeira instrução em `accounts.ts` e `account-kek.ts` (também imposto pelo teste de arquitetura).
- Logs: os módulos novos não logam; o script imprime só arquivo, id do padrão e contagem (testado: o trecho nunca aparece).
- `SECURITY DEFINER`: nenhuma função (C6 verifica no catálogo; a única menção é um comentário).
- KEK: só `ACCOUNT_KEK_ACTIVE_ID=`/`ACCOUNT_KEK_V1=` vazias em `.env.example`; nada nas migrations nem no código. O material fica em `KeyObject`; mensagens de erro não ecoam valores (testado).
- Workflow: nenhum `secrets.*`; senha local gerada no job e mascarada.
- Achados abertos: nenhum.

## T024 (regressão completa)

- `npm run test` → 257 arquivos passed / 5 skipped; 1153 tests passed / 45 skipped.
- `npm run lint` → exit 0. `npm run type-check` → o primeiro run acusou `NodeJS.ProcessEnv` (exige `NODE_ENV`) nos testes de `account-kek`; corrigido relaxando o parâmetro de `loadAccountKeyring` para `Readonly<Record<string, string | undefined>>` (compatível com `process.env`) → exit 0, `account-kek.test.ts` 17/17.
- `npm run build` → exit 0; `npm run verify:client-isolation` → `checked 7 patterns in 540 files (project-ref: skipped)`, exit 0.
- INTEGRAÇÃO (`npx vitest run tests/server --pool=forks`, banco local) → 13 arquivos, 111 passed, 1 skipped.
- Browser: `tests/browser/settings-saves.spec.ts` não existe nesta base (pertence à outra branch). Rodados `online-auth.spec.ts` e `online-saves.spec.ts` contra o Supabase local completo (sem studio/realtime/storage etc.; `.env.local` ignorado pelo git, com valores locais) em `PLAYWRIGHT_PORT=3000` → 2 passed (3.4 min). Um dev server órfão de uma tentativa anterior bloqueou a porta e foi encerrado.

## T030

`refs/dieta-db/15-esquema-transferencia-backend-supabase.md` e `refs/dieta-db/index.md` registram a F0 como implementada na branch (sem merge) e **não validada** no remoto, citando `validation-report.md` (todo "proposto"). `npm run verify:links` limpo.

## Convergência (speckit-converge), iteração 1

Auditoria final (Estado 5) concluída antes: suíte completa, lint, type-check, build, varredura, integração e browser verdes (T024); rastreabilidade FR/SC → tarefa → arquivo/teste conferida; segurança do diff sem achado (T026).

Achado único, `contradicts`, FR-018: o texto do requisito é inatingível com o código existente (ver T031 e a seção T015). Não é corrigível dentro do escopo sem alterar requisito/contrato, que exige decisão humana; `spec.md` e `plan.md` não foram tocados (append-only). Demais itens verificados sem lacuna: FR-001–FR-017, FR-019–FR-021, FR-023, NFR-001, NFR-003, NFR-004, SC-001–SC-005.

Itens que dependem de ação externa e continuam abertos por regra (não são achados de código): T025 (push/PR e duração da CI, NFR-002/SC-006 — pendente do OK do usuário) e T027–T029 (mantenedor; FR-022/FR-022a/FR-022b, SC-007).

Status: **iteração com achado; passada limpa ainda não obtida** (bloqueada por T031).

## T031 e convergência, iteração 2 (passada limpa)

- T031: com a aprovação do mantenedor, FR-018 e a US2-3 em `spec.md`, `contracts/ci-checks.md` (K3/K4) e `research.md` (R7) foram emendados: o grafo transitivo proíbe `@supabase/*`, `pg`, `drizzle-orm/node-postgres`, `src/lib/server/**` e `server-only`; `drizzle-orm` núcleo e `drizzle-orm/pglite` ficam permitidos (banco local PGlite no navegador); o import direto continua proibido pelo lint. O código e os testes já implementavam essa regra.
- Revalidação após a emenda: `check-prerequisites` com `SPECIFY_FEATURE_DIRECTORY` ok; `tests/architecture/server-boundaries.test.ts` + `tests/tooling/verify-client-isolation.test.ts` + `tests/server --pool=forks` → 15 arquivos, 150 passed, 1 skipped; `npm run type-check` exit 0; `npm run verify:client-isolation` → `checked 7 patterns in 480 files`, exit 0; `npm run lint` sem erro.
- `speckit-converge` (iteração 2): spec, plan, tasks e constituição reconfrontados com o código; **zero achados** de código (nenhuma tarefa anexada, `tasks.md` sem nova fase). Restam abertas só por regra: T025 (push/PR e duração da CI, depende do OK do usuário) e T027–T029 (mantenedor, remoto).
- **Passada limpa registrada.**

## T025 (PR e duração da CI)

- Branch enviada e PR aberto: https://github.com/erickjacquinho/diet-maker/pull/11 (`feat/backend-foundation-f0` → `main`), `MERGEABLE`, job `ci` **success** com os passos novos; `cd` ignorado (só roda em push para `main`).
- Duração do job `ci` (início do primeiro passo → fim do último):
  - PR #11 (execução 40442356406): 03:07:08 → 03:17:44 = **10 min 36 s**;
  - última execução de `main` (38182188257, 2026-10-11): 22:53:27 → 23:05:12 = **11 min 45 s**.
  - Diferença: **−1 min 09 s** (≤ 5 min; NFR-002 e SC-006 atendidos). Não foi preciso criar job paralelo (R5).
- Custo dos passos novos no PR: `verify:client-isolation` 3 s; setup da CLI 2 s; `supabase start -x …` 1 min 13 s; senha local, advisors de segurança e de desempenho ≈ 3 s; testes de integração 13 s. Total ≈ 1 min 34 s. Os testes unitários dominam o job (≈ 7 min 48 s) e já existiam.
- Advisors de segurança passaram sem alerta; a integração rodou (não foi pulada) com `app_runtime` local.
