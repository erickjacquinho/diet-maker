# Validation Report: Fundação do backend Supabase (F0), projeto remoto `diet-maker`

Status geral: **proposto**. Apenas leituras dos passos 0–2 foram tentadas (2026-10-26/27, autorizadas pelo mantenedor); **nenhuma escrita** foi feita no remoto e nenhum passo foi validado. O projeto `diet-maker` está **INACTIVE (pausado)**, o que bloqueia os passos 1–2 até ser restaurado. Só o mantenedor preenche este relatório, com confirmação explícita a cada ação (FR-022b). Nunca registre valores secretos: apenas horários, resultados, nomes de variáveis e impressões digitais truncadas. Procedimento: [`docs/setup/backend-foundation.md`](../../docs/setup/backend-foundation.md).

Evidência local e de CI (não substitui o remoto): ver [`implementation-log.md`](./implementation-log.md).

## Passo 0 — Linha de base

Status: **leitura feita; bloqueado**. Comando: `npx supabase projects list` (leitura). Resultado: projeto `diet-maker`, região **`sa-east-1`** (confere), criado em 2026-10-10, status **`INACTIVE` (pausado)**; o `supabase/.temp/project-ref` do checkout corresponde a esse projeto. O smoke atual do fluxo online **não foi executado** (exige login em produção, do mantenedor, e o projeto está pausado). Ação do mantenedor: restaurar o projeto no painel antes de seguir.

## Passo 1 — Dry-run da migration

Status: **tentado; sem evidência válida**. Comando: `npx supabase db push --linked --dry-run`. Resultado: erro `DbConfigIpv6Error` (a rede local não suporta IPv6 e o CLI sugere `supabase link` para o pooler IPv4); com o projeto pausado a conexão também não seria possível. A lista do dry-run **não foi obtida**. Seguir exige restaurar o projeto e refazer o link (ação do mantenedor); não foi usada nenhuma senha.

## Passo 2 — Data API desligada e SSL

Status: **tentado; sem evidência válida**. `npx supabase --experimental ssl-enforcement get --project-ref <ref>` → erro 500 `fetch failed` (projeto pausado). Probes `curl` em `/rest/v1/` e `/graphql/v1` → status `000` (sem conexão/DNS), **não** é um status ≠ 200 do projeto ativo, então **não prova** a Data API desligada. O painel (**Enable Data API**) não foi conferido. Refazer com o projeto ativo.

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
