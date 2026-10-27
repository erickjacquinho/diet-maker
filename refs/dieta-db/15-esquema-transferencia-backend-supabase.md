# Decisão 15 — Esquema de transferência para o backend Supabase

- **Status:** Proposta técnica. Não autoriza implementação, migration remota,
  criação de chaves ou publicação; a execução segue o fluxo SDD e `/speckit-implement`.
- **Data:** 2026-10-25
- **Escopo:** Topologia, comunicação navegador ↔ servidor, isolamento por conta,
  criptografia de dados sensíveis, chaves, transferência dos dados locais e validação.
- **Origem:** [Proposta do MVP online](./proposta-mvp-online-supabase.md). Quando
  aprovada e executada, substitui as Decisões [09](./09-topologia-v1-local-first-e-conta-local.md)–[13](./13-protecao-local-e-backup-simples.md)
  e o [ADR-009](../../docs/adr/ADR-009-nutridiet-principal.md); até lá, os contratos locais seguem vigentes.

## 1. Invariantes

1. **O navegador não conhece o banco.** O bundle do cliente não contém URL do
   Supabase, chave publishable/secret, nome de schema, tabela ou coluna, SQL,
   `account_id`, versões de chave nem mensagens do Postgres. Ele fala apenas com
   `/api/v1/*` no mesmo origin.
2. **A conta vem da sessão, nunca da requisição.** Corpo, query, path, header ou
   estado da UI não escolhem conta. O servidor resolve `account_id` a partir do
   usuário autenticado.
3. **Defesa em profundidade.** Guard da rota + RLS `FORCE` + papel sem
   `BYPASSRLS` + PK/FK compostas por conta + grants mínimos. Uma camada falhar
   não expõe outra conta.
4. **Saída por allowlist.** Toda resposta passa por um schema de saída (DTO);
   linhas do banco nunca são serializadas diretamente.
5. **Dados sensíveis cifrados antes do Postgres**, com chave fora do banco.
6. **Fail closed.** Falta de sessão, conta, versão, CSRF ou chave nega a operação
   com erro genérico e `requestId`.

Esses padrões já existem no código online atual e passam a valer para todo o
domínio: [`request-security.ts`](../../src/lib/server/request-security.ts),
[`session.ts`](../../src/lib/server/auth/session.ts) (`getUser` + `getClaims` +
conferência em `auth.sessions`), cookies `HttpOnly` com PKCE em
[`supabase.ts`](../../src/lib/server/auth/supabase.ts), papel `app_runtime`
`NOBYPASSRLS` com RLS `FORCE`, e AES-256-GCM com AAD em
[`save-keys.ts`](../../src/lib/server/save-keys.ts).

## 2. Topologia

```text
Navegador (React, TanStack Query)
  │  HTTPS same-origin · cookies HttpOnly · CSRF · JSON validado
  ▼
Next.js — BFF (runtime nodejs, módulos `server-only`)
  ├─ Borda      origin, CSRF, content-type, tamanho, rate limit, headers
  ├─ Sessão     Supabase Auth (getUser + getClaims + auth.sessions)
  ├─ Conta      owner_user_id → account_id (+ gancho de assinatura)
  ├─ Casos de uso  domínio existente (src/lib/domain), uma transação por caso
  ├─ Cripto     DEK por conta ← KEK no secret manager da hospedagem
  └─ Repositórios  Drizzle → pg Pool (papel app_runtime, TLS verify-full)
        │
        ▼
Supabase (região sa-east-1)
  ├─ Auth (GoTrue)      chamado apenas pelo servidor
  ├─ schema app         dados da conta — fora da Data API, RLS FORCE
  ├─ schema private     chaves envolvidas, auditoria, rate limit, perfil
  └─ Data API / GraphQL sem schemas da aplicação expostos
```

- O Next.js roda na mesma região (São Paulo) para latência e residência dos dados.
- Supabase Storage, Realtime, Edge Functions e o `supabase-js` no cliente não
  fazem parte desse escopo.
- A TACO continua no bundle; é dado público de referência, sem conta.

## 3. Comunicação navegador ↔ BFF

### 3.1 Transporte e headers

| Item | Regra |
| --- | --- |
| TLS | Somente HTTPS; `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` |
| CORS | Nenhum `Access-Control-Allow-Origin`; API exclusiva do próprio origin |
| CSP | `default-src 'self'`; scripts com nonce; `frame-ancestors 'none'`; `connect-src 'self'` (o navegador não alcança `*.supabase.co`) |
| Outros | `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restritiva, `Cross-Origin-Opener-Policy: same-origin` |
| Cache | Respostas da API com `Cache-Control: private, no-store`; rotas `dynamic = 'force-dynamic'` |

### 3.2 Sessão e cookies

- Os cookies do Supabase Auth são definidos só pelo servidor: `HttpOnly`,
  `Secure`, `SameSite=Lax`, `path=/` (já configurado). JavaScript da página
  não lê o token.
- Cookie CSRF com prefixo `__Host-` e double-submit no header `X-CSRF-Token`
  em toda requisição que altera estado, além da conferência de `Origin`.
- Access token curto (≤ 15 min) com refresh rotativo. Logout revoga a sessão em
  `auth.sessions`, e a conferência por `session_id` invalida tokens já emitidos.
- E-mail confirmado obrigatório, proteção contra senhas vazadas ativa e MFA TOTP
  disponível. A exigência de AAL2 nas rotas clínicas fica como decisão de
  produto antes do lançamento.

### 3.3 Contrato das rotas

- **Rotas por recurso, versionadas:** `/api/v1/...`. Route Handlers, não Server
  Actions: uma borda única e explícita, testável por matriz e igual às rotas atuais.
- **Entrada:** apenas `application/json`, limite de tamanho por rota e zod
  `.strict()`. O servidor ignora e recusa `accountId`, `version`, timestamps ou
  status enviados como campos livres (proteção contra mass assignment).
- **PII fora da URL:** a busca por nome usa `POST /patients/search` com corpo.
  Paths levam apenas UUIDs.
- **Criação idempotente:** o cliente gera o UUID do recurso (o "ID estável"
  atual). Repetir a requisição devolve o mesmo resultado, sem duplicar.
- **Concorrência otimista:** atualização exige `If-Match: <version>`. Divergência
  retorna `409 VERSION_CONFLICT` com a versão atual, sem sobrescrever.
- **Saída:** schema de saída zod aplicado em toda resposta. Não saem
  `account_id`, `key_version`, ciphertext, nomes de coluna ou campos internos.
- **Erros:** `{ "error": { "code": "…", "requestId": "…" } }`. Erros do Postgres
  são mapeados (`23505 → 409`, `23503/P0001 → 422`) sem repassar mensagem,
  constraint ou stack. Recurso de outra conta e recurso inexistente retornam o
  mesmo `404`.
- **Abuso:** rate limit por usuário e por IP, `statement_timeout` no papel e
  paginação por cursor com tamanho máximo fixo.

### 3.4 Wrapper único da borda

Toda rota é declarada por um único wrapper; não existem handlers soltos:

```ts
export const PATCH = defineEndpoint({
  input: patientUpdateInput,     // zod .strict()
  output: patientDto,            // allowlist da resposta
  requireVersion: true,          // If-Match obrigatório
  rateLimit: 'mutation',
  async handler({ account, input, version, tx, sealer }) {
    return updatePatient({ tx, sealer, accountId: account.id }, input, version);
  },
});
```

Ordem fixa dentro de `defineEndpoint`: origin → CSRF (métodos mutáveis) →
content-type/tamanho → rate limit → sessão → resolução da conta → gancho de
assinatura → `withAccountTransaction` → handler → schema de saída → headers. O
gancho de assinatura é o ponto onde futuras travas de plano entram, sem
espalhar verificações pelo domínio.

### 3.5 Isolamento do código do cliente

- Todo módulo de servidor importa `server-only`.
- Regra de lint `no-restricted-imports` em `src/app/**` client, `src/components/**`
  e `src/hooks/**` para `@supabase/*`, `pg`, `drizzle-orm` e `@/lib/server/**`.
- Contratos compartilhados ficam em `src/lib/contracts/*` (zod de entrada e saída),
  sem importar servidor ou schema do banco.
- O cliente usa um adapter tipado (`src/lib/api-client/*`) com
  `credentials: 'same-origin'` e o header CSRF. As telas continuam consumindo
  casos de uso por interface, como hoje.
- Teste de arquitetura e varredura do build: `.next/static` não pode conter
  `supabase`, `sb_publishable_`, `sb_secret_`, `ONLINE_DATABASE_URL`,
  `SERVER_MASTER_KEY` nem nomes de tabela do schema `app`.

## 4. Banco: papéis, schemas e RLS

### 4.1 Papéis

| Papel | Uso | Restrições |
| --- | --- | --- |
| `app_runtime` (evolução do `online_runtime`) | Único papel das requisições | `LOGIN NOINHERIT NOBYPASSRLS`; `statement_timeout=5s`; `idle_in_transaction_session_timeout=10s`; sem `DELETE` nas tabelas clínicas; sem `TRUNCATE`/`REFERENCES` |
| `postgres` (ou um migrador dedicado) | Apenas migrations via CLI/CI | Nunca configurado na aplicação |
| Secret key do Supabase | Apenas jobs administrativos de Auth (ex.: excluir usuário) | Fora do caminho das requisições; uma chave por componente; nunca `NEXT_PUBLIC_` |
| `anon` / `authenticated` | Nenhum acesso a `app` ou `private` | `REVOKE ALL` nos dois schemas |

A conexão do runtime usa `verify-full` com a CA do Supabase (já exigida em
[`client.ts`](../../src/lib/server/online-db/client.ts)), "Enforce SSL" ativo e
restrição de rede quando a hospedagem tiver IPs de saída fixos. Pelo pooler
Supavisor em modo transação, o contexto da conta usa somente
`set_config(..., true)`, local à transação, para nunca vazar entre conexões
reaproveitadas.

### 4.2 Configuração do Supabase

- Data API: nenhum schema da aplicação exposto; GraphQL desabilitado. A partir
  de 2026-10-30, o Supabase deixa de expor automaticamente tabelas novas do
  `public`; mesmo assim, `app` e `private` nunca entram na lista de schemas
  expostos e o `REVOKE` explícito permanece.
- Rodar `supabase db advisors` (lints de segurança) na CI a cada migration.
- PITR ativo e restauração testada antes do lançamento.
- Vault **não** guarda a KEK (ver 5.3). pgsodium e Transparent Column Encryption
  não são usados: o Supabase não os recomenda para uso novo.

### 4.3 Modelo multi-conta

- `app.accounts (id uuid, owner_user_id uuid UNIQUE → auth.users)`: uma conta
  por usuário agora, com ID próprio para permitir equipes no futuro.
- **Toda** tabela do schema `app` tem `account_id`, inclusive as filhas que hoje
  não têm (`diet_meal_options`, `diet_meal_items`, `diet_item_snapshots`,
  `diet_variation_history_summaries`). Assim a policy é uma comparação direta,
  sem joins.
- PK `(account_id, id)` e FKs compostas `(account_id, parent_id)`. Um filho não
  referencia um pai de outra conta, e IDs gerados pelo cliente não revelam
  colisão entre contas.
- Tipos corretos: `timestamptz` e `date` no lugar dos textos atuais; `numeric`
  para valores nutricionais e medidas.

### 4.4 Esqueleto SQL

```sql
CREATE SCHEMA app AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA app FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app TO app_runtime;

CREATE FUNCTION app.current_account_id() RETURNS uuid
  LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
  AS $$ SELECT NULLIF(current_setting('app.account_id', true), '')::uuid $$;
REVOKE ALL ON FUNCTION app.current_account_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.current_account_id() TO app_runtime;

CREATE TABLE app.patients (
  account_id            uuid NOT NULL REFERENCES app.accounts (id),
  id                    uuid NOT NULL,
  display_code          text NOT NULL,
  sensitive             bytea NOT NULL,   -- envelope cifrado (seção 5)
  sensitive_key_version integer NOT NULL,
  gender                text NOT NULL,
  height_cm             numeric,
  weight_kg             numeric,
  version               integer NOT NULL CHECK (version > 0),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  archived_at           timestamptz,
  PRIMARY KEY (account_id, id)
);

ALTER TABLE app.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.patients FORCE ROW LEVEL SECURITY;
CREATE POLICY patients_tenant ON app.patients FOR ALL TO app_runtime
  USING      (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));
GRANT SELECT, INSERT, UPDATE ON app.patients TO app_runtime;

CREATE TABLE app.diet_plans (
  account_id uuid NOT NULL,
  id         uuid NOT NULL,
  patient_id uuid NOT NULL,
  status     text NOT NULL CHECK (status IN ('ACTIVE', 'SNAPSHOT')),
  -- ...
  PRIMARY KEY (account_id, id),
  FOREIGN KEY (account_id, patient_id) REFERENCES app.patients (account_id, id)
);
CREATE UNIQUE INDEX diet_plans_one_active
  ON app.diet_plans (account_id, patient_id) WHERE status = 'ACTIVE';
```

### 4.5 Invariantes clínicas no banco

| Regra | Garantia |
| --- | --- |
| Uma dieta vigente por paciente | Índice único parcial `WHERE status = 'ACTIVE'` |
| Histórico somente leitura | Trigger `BEFORE UPDATE OR DELETE` rejeita linhas `SNAPSHOT` e seus filhos |
| Snapshot nutricional imutável | Sem `UPDATE` concedido nas tabelas de snapshot |
| Arquivar em vez de apagar | Sem `DELETE` para `app_runtime` em tabelas clínicas |
| Valores válidos | `CHECK` de unidades, faixas, status e JSON objeto (já existentes no schema local) |

### 4.6 Transações e concorrência

- `withAccountTransaction(accountId, fn)` abre a transação, executa
  `set_config('app.account_id', $1, true)` e entrega `tx` ao caso de uso. O pool
  não oferece outro caminho de consulta.
- O `TransactionRunner` deixa de ser no-op: todos os repositórios recebem `tx`, e
  um caso de uso confirma em uma transação.
- Atualizações usam `WHERE account_id = $1 AND id = $2 AND version = $3`; zero
  linhas resultam em `VERSION_CONFLICT`. A ativação de uma dieta bloqueia o
  paciente com `SELECT … FOR UPDATE`.

### 4.7 Auditoria

`private.audit_events (id, account_id, actor_user_id, action, entity, entity_id,
request_id, at)`, somente `INSERT` para `app_runtime`. Não registra PII nem
conteúdo, apenas quem fez o quê e quando. A retenção segue a política jurídica.

## 5. Criptografia de dados sensíveis

### 5.1 Classificação

| Classe | Dados | Tratamento |
| --- | --- | --- |
| **S1 — identificação e texto clínico livre** | Paciente: nome, telefone, WhatsApp, data de nascimento, estado civil, gestação e data prevista. Comentários de acompanhamento. Nome da dieta e textos livres ligados ao paciente. Rascunhos de dieta. Perfil profissional e logotipo | Cifrados na aplicação (AES-256-GCM, DEK da conta) |
| **S2 — saúde pseudonimizada** | Medidas e composição corporal, metas, dietas, refeições, itens e snapshots | Em claro no banco, ligados apenas a UUID; protegidos por RLS, papel restrito e cifra de disco do provedor |
| **S3 — biblioteca da conta** | Alimentos customizados, receitas, refeições e dietas prontas | Em claro; sem dado de paciente |
| **Público** | TACO | Bundle |

S2 fica em claro porque o servidor precisa calcular, ordenar e agregar esses
dados. Sem os identificadores de S1, eles são dados pseudonimizados. Se um
campo S2 passar a aceitar texto livre que possa identificar o paciente, ele
sobe para S1.

### 5.2 Formato do campo cifrado

- Uma coluna `bytea` por linha (`sensitive`) contém um JSON com os campos S1
  daquela entidade, validado por zod depois de decifrar. Atualizar um campo
  recifra o blob inteiro.
- Layout: `0x01 (versão) ‖ key_version (u32) ‖ IV (12 bytes aleatórios) ‖ ciphertext ‖ tag (16)`.
- AAD: `nutridiet:v1|<tabela>.<coluna>|<account_id>|<row_id>|<key_version>`. Um
  ciphertext copiado para outra linha, coluna ou conta falha a autenticação.
- Implementação com `node:crypto`, reaproveitando o padrão de
  `encryptServerValue` (finalidade + contexto na AAD).

### 5.3 Hierarquia de chaves

```text
KEK (32 bytes, versionada: kek_id)
  └─ fica no secret manager da hospedagem (idealmente um KMS); nunca no banco
       │ envolve (AES-256-GCM, AAD = account_id + key_version)
       ▼
DEK por conta — private.account_keys (account_id, key_version, wrapped_dek, iv, kek_id, created_at, retired_at)
       │ cifra
       ▼
campos S1 de todas as tabelas da conta
```

- **KEK fora do banco:** quem obtém um dump, backup ou acesso SQL não obtém a
  chave. Por isso a KEK não vai para o Vault, que fica no mesmo projeto dos dados.
- **Cache da DEK** em memória do servidor, LRU com TTL curto (5 min) e buffers
  zerados ao sair. A DEK nunca sai do servidor.
- **Rotação da KEK:** re-envolver apenas as DEKs (tabela pequena), aceitando
  `kek_id` antigos até concluir. Isso resolve a pendência de rotação registrada
  na Decisão 12.
- **Rotação da DEK:** nova `key_version`, recifra em lote em segundo plano,
  leitura aceita as duas versões até concluir.
- **Crypto-shredding:** excluir a conta destrói `wrapped_dek`. Os dados S1 que
  restarem em backups passam a ser ilegíveis, o que ajuda a cumprir pedidos de
  exclusão durante a retenção dos backups.
- **Backup da KEK:** cópia restrita e separada, com procedimento de recuperação
  testado. Perder a KEK torna S1 irrecuperável.

### 5.4 Busca com campos cifrados

- **Nome:** o servidor carrega os pacientes da conta, decifra e filtra ou ordena
  em memória. Para centenas de pacientes isso custa milissegundos. A estratégia
  deve ser revista acima de alguns milhares por conta.
- **Telefone/WhatsApp:** índice cego `HMAC-SHA256(chave de índice da conta,
  valor normalizado)`, só se houver busca exata ou deduplicação. A chave de
  índice é derivada por HKDF e é distinta da DEK.
- **Biblioteca da conta:** carregada uma vez no cliente; a busca roda em memória
  junto da TACO, mantendo a meta de menos de 100 ms.

### 5.5 Rascunhos

Rascunhos de dieta passam para `app.diet_drafts (account_id, diet_id, document
bytea cifrado, base_version, version, updated_at)`. Autosave com debounce
(~2 s), limite de tamanho e `If-Match`. Isso elimina o último estado clínico
local e habilita vários dispositivos. Sem rede não há autosave; a UI mostra
esse estado explicitamente.

## 6. Superfície da API (v1)

| Recurso | Operações |
| --- | --- |
| `session` | `GET /session` (já existe em `/api/auth/*`) |
| `patients` | `GET /patients?cursor=` · `POST /patients` · `POST /patients/search` · `GET/PATCH /patients/:id` · `POST /patients/:id/archive` |
| `assessments` | `GET/POST /patients/:id/assessments` · `GET/PATCH /assessments/:id` |
| `follow-ups` | `GET/PUT /patients/:id/follow-up` |
| `diets` | `GET /patients/:id/diets` · `GET /diets/:id` · `PUT /diets/:id/draft` · `POST /diets/:id/commit` (ID estável + versão esperada) · `POST /diets/:id/copy` |
| `library` | CRUD em `/library/foods`, `/library/recipes`, `/library/ready-meals`, `/library/ready-diets` |
| `agenda`, `favorites` | `GET/PUT /agenda/reminders` · `GET/PUT /favorites` (hoje em localStorage) |
| `profile` | `GET/PUT /profile` (perfil profissional, já cifrado) |
| `imports` | `POST /imports/nutridiet` (seção 7) |

Cada operação de escrita corresponde a um caso de uso existente em
`src/lib/application`, agora executado no servidor.

## 7. Transferência dos dados locais

Não há usuários em produção. Mesmo assim, a importação do `.nutridiet` cumpre a
regra de retrocompatibilidade do save e evita descartar dados de teste ou de
piloto sem decisão explícita.

1. A aplicação local conclui um checkpoint final do `.nutridiet` (fluxo atual),
   para que o arquivo contenha tudo o que foi confirmado.
2. O navegador envia o **arquivo como está** (`application/octet-stream`, limite
   de tamanho) para `POST /api/v1/imports/nutridiet`, com CSRF e `Idempotency-Key`
   = SHA-256 do arquivo.
3. O servidor:
   - para envelope v2, localiza o save em `private.saves` pelo dono da sessão,
     confere a prova de vínculo, desembrulha a DEK e decifra **no servidor**; o
     navegador não precisa de grant nem de chave;
   - para legado v1 em plaintext, aceita o arquivo apenas com confirmação
     explícita do usuário;
   - valida pelo schema lógico versionado
     ([`logical-export-schema.ts`](../../src/lib/infrastructure/local-db/logical-export-schema.ts))
     e pela migração determinística em memória já existente;
   - grava tudo em uma transação, numa conta vazia, sem mesclagem (mesma regra
     da restauração na Decisão 11), cifrando S1 com a DEK da conta;
   - devolve um resumo (contagens por entidade) e registra o evento de auditoria.
4. Após a confirmação, a UI oferece limpar o IndexedDB/PGlite e os drafts locais.
   Nada é apagado sem confirmação.
5. A DEK do save importado é destruída após um período de retenção definido, e
   `private.saves` é desativado ao fim da transição.

## 8. Modelo de ameaças

| Ameaça | Controle | Limite honesto |
| --- | --- | --- |
| Dump ou backup vazado | S1 cifrado com chave fora do banco; crypto-shredding | S2 legível, mas pseudonimizado |
| Credencial `app_runtime` vazada | TLS obrigatório, restrição de rede, rotação | Quem tem a credencial pode definir `app.account_id`: a RLS protege contra bugs da aplicação, não contra roubo de credencial; S1 continua cifrado |
| IDOR/BOLA | Conta derivada da sessão, PK composta, RLS, `404` uniforme, matriz de testes entre contas | — |
| CSRF | `SameSite=Lax`, Origin, token `__Host-` | — |
| XSS | CSP com nonce, escape do React, sem `dangerouslySetInnerHTML`, token `HttpOnly` | XSS ainda age como o usuário enquanto a página está aberta |
| Sessão roubada | Token curto, conferência em `auth.sessions`, revogação no logout, MFA | — |
| Mass assignment | zod `.strict()`; servidor define conta, versão e datas | — |
| Injeção SQL | Drizzle parametrizado; lint proíbe `sql.raw` com entrada | — |
| Requisição repetida ou concorrente | ID estável, `If-Match`, índice parcial, `FOR UPDATE` | — |
| Operador do provedor | S1 cifrado | S2 e metadados visíveis ao provedor |
| Runtime Next.js comprometido | Menor privilégio, secrets fora do repositório, auditoria | Acesso total enquanto comprometido; não é E2EE |
| Abuso ou DoS | Rate limit, limite de corpo, `statement_timeout`, paginação | — |
| Vazamento em logs | Logs estruturados com `requestId`, sem corpo, sem PII | — |

## 9. Segredos e configuração

| Variável | Onde | Observação |
| --- | --- | --- |
| `APP_ORIGIN` | Servidor | Origin HTTPS exato |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Servidor | Embora "publishable", ficam no servidor: o cliente não conhece o projeto |
| `ONLINE_DATABASE_URL` | Servidor | Papel `app_runtime`, nunca `postgres`/`service_role` |
| `ONLINE_DATABASE_SSL_CA_B64` | Servidor | CA oficial do Supabase |
| `SERVER_MASTER_KEY` / `_ID` → `KEK_<id>` | Secret manager | Versionadas; backup separado |
| `SUPABASE_SECRET_KEY` | Somente jobs administrativos | Uma chave por componente |

Nenhuma variável usa o prefixo `NEXT_PUBLIC_`; a CI falha se alguma variável
sensível tiver esse prefixo.

## 10. LGPD e operação

- Dados de saúde são dados pessoais sensíveis. O profissional é controlador dos
  dados dos pacientes; o NutriDiet é operador. São necessários termos de uso,
  contrato de tratamento, lista de suboperadores (Supabase, hospedagem), região
  e política de retenção. A retenção de prontuário segue a norma profissional,
  a confirmar com o jurídico.
- Direitos do titular: exportação da conta (formato lógico versionado) e
  exclusão com crypto-shredding.
- Plano de incidentes: rotação de KEK, de credenciais e de chaves do Supabase,
  com responsáveis definidos.

## 11. Fases de execução

| Fase | Entrega | Saída verificável |
| --- | --- | --- |
| F0 Fundação | Projeto sa-east-1, papéis, schemas `app`/`private`, Data API sem schemas, KEK no secret manager, CI (advisors, varredura do bundle, lint de imports) | RLS nega tudo sem `app.account_id`; bundle limpo |
| F1 Borda | `defineEndpoint`, headers, mapeamento de erros, rate limit, adapter do cliente | Testes de header, CSRF, origin e `404` uniforme |
| F2 Cripto | `account_keys`, codec de campo, cache da DEK, rotação de KEK | Adulteração e troca de linha falham; rewrap preserva leitura |
| F3 Domínio, por módulo | Pacientes → avaliações/acompanhamento → dietas + rascunhos → biblioteca → agenda/favoritos | Matriz entre contas por rota; invariantes clínicas no banco |
| F4 Transferência | `POST /imports/nutridiet` | v1 e v2 importados; arquivo inválido não altera a conta |
| F5 Remoção do local | PGlite, `.nutridiet` como save, grant de 8 h, saves e bloqueio de aba; documentação | Nenhum import de `local-db` ou `file-system-access` em runtime |
| F6 Homologação | Revisão de segurança, teste de restauração do PITR, latência, falhas de rede | Checklist abaixo completo |

## 12. Checklist de homologação

- [ ] `.next/static` sem URL/chave do Supabase, nomes de tabela ou variáveis sensíveis.
- [ ] Para cada rota: sessão de outra conta com IDs válidos recebe `404`, e nenhuma escrita ocorre.
- [ ] `app_runtime` sem `app.account_id` lê zero linhas; insert com conta divergente é rejeitado.
- [ ] `anon`/`authenticated` sem acesso a `app` e `private`; advisors sem alertas de segurança.
- [ ] Ciphertext adulterado ou movido de linha falha a decifragem.
- [ ] KEK rotacionada sem perda de leitura; crypto-shredding torna S1 ilegível.
- [ ] Respostas com `no-store`, CSP, HSTS e sem campos fora do DTO.
- [ ] Repetição após timeout não duplica; conflito de versão retorna `409`.
- [ ] Logs sem PII ou corpo de requisição.
- [ ] Restauração do PITR testada em projeto separado.
