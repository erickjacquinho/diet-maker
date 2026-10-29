# Contract: Verificações de CI

Status: proposto. Arquivo afetado: `.github/workflows/ci-cd.yml`. Os passos novos entram no job `ci` existente, com os mesmos gatilhos (`push` e `pull_request` para `main`) e o mesmo `cd: needs: ci` (FR-020). Nenhum `secrets.*` é usado nesses passos (FR-021).

## K1. Ordem do job `ci`

1. install;
2. testes unitários;
3. ESLint;
4. `tsc`;
5. `next build`;
6. `npm run verify:client-isolation` (K2);
7. `supabase/setup-cli@v1` com `version: 2.122.0`;
8. `supabase start -x realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor` (comando confirmado em T002). Se o Docker estiver ausente ou uma migration falhar, o passo falha;
9. senha local: `openssl rand -hex 24`, mascarada com `::add-mask::`, e `psql` como `postgres` local: `ALTER ROLE app_runtime PASSWORD …`;
10. `supabase db advisors --local --type security --level warn --fail-on warn`, que bloqueia;
11. `supabase db advisors --local --type performance --fail-on none`, que só registra;
12. `npx vitest run tests/server --pool=forks`, com `LOCAL_SUPABASE_DB_URL` (`postgres` local) e `ONLINE_DATABASE_URL` (`app_runtime` local) definidos só nesse passo. Com as duas variáveis definidas, o `describeLocal` existente executa os testes em vez de pulá-los (FR-020a).

Orçamento: no máximo +5 min (NFR-002), medido em T002 e confirmado no PR. Se estourar, os passos 7–12 viram um job paralelo, e o `cd` passa a usar `needs: [ci, <job>]`.

## K2. `scripts/verify-client-isolation.mjs`

Um script, sem dependências, executado depois do build. Ele faz as duas verificações e soma os achados.

**Variáveis sensíveis** (constante interna do script, FR-019):

- nomes explícitos: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ONLINE_DATABASE_URL`, `ONLINE_DATABASE_SSL_CA_B64`, `SERVER_MASTER_KEY`, `SERVER_MASTER_KEY_ID`, `ACCOUNT_KEK_ACTIVE_ID` e o padrão `ACCOUNT_KEK_V[1-9][0-9]*`;
- fragmentos: `KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `DATABASE`, `SUPABASE`.

**A. Prefixo público** (FR-019): qualquer `NEXT_PUBLIC_<NOME>` em que `NOME` é sensível (nome explícito ou fragmento) gera achado. Arquivos varridos: `src/**`, `.env*` versionados (`git ls-files`), `next.config.*` e `.github/workflows/**`.

**B. Bundle** (FR-017). Arquivos varridos:

- `.next/static/**`;
- `.next/server/app/**/*.{html,rsc,body,meta}`;
- `.next/server/pages/**/*.html`;
- `public/**`.

Sem `.next/`, o script sai com código 2.

| Id | Regra |
| :--- | :--- |
| `supabase-host` | `/[a-z0-9-]+\.supabase\.(co\|com\|in)\b/i` |
| `project-ref` | conteúdo de `supabase/.temp/project-ref`, quando o arquivo existe (local, depois do `supabase link`). Sem ele, o relatório diz `project-ref: skipped`, e `supabase-host` cobre a URL, que contém o ref |
| `key-prefix` | `sb_publishable_`, `sb_secret_`, `service_role` |
| `env-name` | nomes explícitos, como palavra inteira. Os fragmentos ficam de fora, para não gerar falsos positivos em código de terceiros |
| `db-object` | `\b(app\|private)\.(<objetos>)\b`, em que `<objetos>` sai de `CREATE (TABLE\|VIEW\|FUNCTION\|SEQUENCE)… (app\|private).<nome>` em `supabase/migrations/*.sql` |
| `db-role` | `\b(app_runtime\|online_runtime)\b` |

**Saída**: o script aceita `--root <dir>` para os testes.

```text
verify-client-isolation: checked 7 patterns in 214 files (project-ref: skipped)
FAIL .next/static/chunks/app/page-abc.js  db-object  x2
1 finding. Remove the reference or move the code to a server module.
```

O código de saída é `0` sem achados, `1` com achados e `2` com entrada inválida. O trecho encontrado nunca é impresso (NFR-003, SC-002).

## K3. Lint (FR-018)

Bloco em `eslint.config.mjs` para `src/components/**/*.{ts,tsx}` e `src/hooks/**/*.{ts,tsx}`: `no-restricted-imports` como `error` para `@supabase/*`, `pg`, `pg/*`, `drizzle-orm`, `drizzle-orm/*` e `@/lib/server/**`. A regra vale para import direto; o alcance transitivo é tratado em K4.

## K4. Teste de fronteiras (FR-012, FR-013, FR-018)

`tests/architecture/server-boundaries.test.ts` segue o estilo dos testes de fronteira existentes (`readdirSync` + regex):

1. **Cliente**:
   - as raízes são os arquivos com `'use client'`, `src/components/**` e `src/hooks/**`;
   - o teste segue imports estáticos, `export … from` e `import()` literal, resolvendo `@/` e caminhos relativos e ignorando `import type`;
   - ele falha se alcançar `@supabase/*`, `pg`, `drizzle-orm/node-postgres`, `src/lib/server/**` ou um arquivo com `import 'server-only'`, mostrando a cadeia. `drizzle-orm` núcleo e `drizzle-orm/pglite` são permitidos transitivamente (banco local PGlite no navegador).
2. **Pool**: só os arquivos de [server-modules.md §S2](./server-modules.md#s2-regra-de-acesso-ao-pool-fr-012) importam o cliente do banco, `pg` ou `drizzle-orm/node-postgres`.
3. **`server-only`**: `accounts.ts` e `account-kek.ts` começam com `import 'server-only'`.
4. **Fixture**: um caso em memória com a cadeia `componente → lib → lib/server` precisa ser detectado. Esse é o cenário de falha que antecede o validador (Princípio IV).
