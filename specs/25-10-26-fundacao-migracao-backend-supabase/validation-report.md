# Validation Report: Fundação do backend Supabase (F0), projeto remoto `diet-maker`

Status geral: **proposto**. Nenhum passo foi executado no remoto. Só o mantenedor preenche este relatório, com confirmação explícita a cada ação (FR-022b). Nunca registre valores secretos: apenas horários, resultados, nomes de variáveis e impressões digitais truncadas. Procedimento: [`docs/setup/backend-foundation.md`](../../docs/setup/backend-foundation.md).

Evidência local e de CI (não substitui o remoto): ver [`implementation-log.md`](./implementation-log.md).

## Passo 0 — Linha de base

Status: proposto. Início/fim: — . Resultado: — . Evidência (região `sa-east-1`, smoke atual): — .

## Passo 1 — Dry-run da migration

Status: proposto. Início/fim: — . Resultado: — . Evidência (lista do `db push --dry-run`): — .

## Passo 2 — Data API desligada e SSL

Status: proposto. Início/fim: — . Resultado: — . Evidência (painel, `ssl-enforcement get`, status de `/rest/v1/` e `/graphql/v1`): — .

## Passo 3 — KEK (Production, Sensitive, backup DPAPI)

Status: proposto. Início/fim: — . Resultado: — . Evidência (impressão digital do original e do restaurado, igualdade, `vercel env ls production`): — .

## Passo 4 — Senha nova do runtime e `ONLINE_DATABASE_URL`

Status: proposto. Início/fim: — . Resultado: — . Evidência (backup DPAPI feito; usuário `app_runtime.<ref>` configurado; sem valores): — .

## Passo 5 — Migration (`db push --linked`)

Status: proposto. Início da janela: — . Resultado: — . Evidência: — .

## Passo 6 — Senha no banco

Status: proposto. Horário: — . Resultado: — .

## Passo 7 — Republicação

Status: proposto. Fim da janela: — . Duração total da janela (meta < 10 min): — . Resultado: — .

## Passo 8 — Smoke e conferências

Status: proposto. Evidência:

- smoke (login, perfil, catálogo, autorização de saves): — ;
- `npx vitest run tests/server/online-db-client.test.ts` (R10): — ;
- `pg_stat_activity` com `app_runtime` > 0: — ;
- `vault.secrets` sem entrada da KEK: — ;
- `vercel env ls` de production, preview e development: — .

## Restrição de rede (R12)

Não aplicável no plano Hobby (sem IPs de saída fixos). Registrado em: — .

## Rollback

Executado: não. Se executado, registrar motivo, horário e resultado: — .
