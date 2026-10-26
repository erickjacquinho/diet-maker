# Research: Fundação da migração para o backend Supabase (F0)

Fontes consultadas em 2026-10-26: [Securing your API](https://supabase.com/docs/guides/api/securing-your-api), [GraphQL](https://supabase.com/docs/guides/graphql), [Testing in CI](https://supabase.com/docs/guides/deployment/ci/testing), `npx supabase db advisors --help` (CLI 2.122.0) e o código e as migrations do repositório.

## R1. Exposição da Data API e do GraphQL

- **Decision**: Desabilitar a Data API do projeto `diet-maker` pelo painel (**Enable Data API** off). O GraphQL fica inalcançável pelo mesmo motivo. A extensão `pg_graphql` não é removida. Os `REVOKE` explícitos nos schemas `app` e `private` permanecem como segunda camada.
- **Rationale**: A documentação garante que, com a Data API desligada, nenhum endpoint gerado responde, "regardless of grants or RLS". O app não usa PostgREST: `@supabase/ssr` só chama `/auth/v1`, e não há `.from()`/`.rpc()` em `src/`. O GraphQL é servido pela Data API. A documentação não descreve remover `pg_graphql` como forma de desligar o GraphQL, então removê-la seria um caminho sem suporte.
- **Verification**: O runbook faz um probe HTTP em `/rest/v1/` e `/graphql/v1`, que deve responder com status diferente de 200 e sem documento OpenAPI, e confere visualmente o painel. O `[api] enabled = false` local já reproduz o mesmo estado.
- **Alternatives considered**: (a) manter a Data API e só retirar `app`/`private` da lista de schemas expostos: deixa `public`/`graphql_public` alcançáveis sem necessidade. (b) `DROP EXTENSION pg_graphql`: não é documentado como desligamento.

## R2. Rename do papel e senha

- **Decision**: Uma migration renomeia `online_runtime` → `app_runtime` dentro de um bloco `DO`, tratando os quatro estados de FR-001, e aplica `ALTER ROLE … SET statement_timeout = '5s'` e `idle_in_transaction_session_timeout = '10s'`. Logo depois, o mantenedor define uma senha nova pelo SQL editor do painel. Essa senha não fica em migration nem em arquivo do repositório.
- **Rationale**: O rename preserva o OID do papel, e com ele os grants e as policies (`TO online_runtime` passa a ser exibido como `TO app_runtime`). O rename apaga senhas MD5, e o formato da senha atual não pode ser lido sem superusuário (`pg_authid`). A rotação elimina essa incerteza e renova a credencial. No PG16+, quem tem `CREATEROLE` só altera papéis sobre os quais tem `ADMIN OPTION`; o `postgres` criou o papel e recebeu essa opção automaticamente.
- **Risk**: O Supavisor pode guardar em cache a autenticação do usuário antigo. A janela de < 10 min inclui uma nova tentativa de conexão. Se o login como `app_runtime.<ref>` falhar após 2 minutos, o rollback de FR-022a é acionado.
- **Alternatives considered**: um papel novo convivendo com o antigo foi rejeitado na clarificação; manter o nome antigo, idem.

## R3. Resolução usuário → conta sem `SECURITY DEFINER`

- **Decision**: Usar dois contextos locais à transação: `app.user_id` para a resolução e `app.account_id` para os dados.
  - A policy de `app.accounts` usa `<P>` = `id = app.current_account_id() OR owner_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid`, tanto em `USING` quanto em `WITH CHECK`.
  - O contexto de usuário fica inline na policy, como nas policies legadas de `private`, sem uma segunda função.
  - As tabelas de domínio futuras usam apenas `app.current_account_id()`.
- **Rationale**: Sem o segundo contexto, o servidor precisaria saber o `account_id` para enxergar a linha que o contém. As alternativas exigiriam `SECURITY DEFINER` ou um papel com `BYPASSRLS`, ambos vedados (FR-009a). Como só uma tabela lê `app.user_id`, uma função dedicada seria uma indireção sem segundo consumidor.
- **Creation**: `INSERT … ON CONFLICT (owner_user_id) DO NOTHING`, seguido de `SELECT` na mesma transação de resolução, interna a `accounts.ts`. O `id` da conta é gerado pelo banco (`gen_random_uuid()` default), nunca pelo navegador.
- **Alternatives considered**: `account_id = user_id` (perde o ID próprio previsto para equipes); função `SECURITY DEFINER` em schema não exposto (contraria a Decisão 15 e o FR-007).

## R4. Privilégios padrão e `EXECUTE` de `PUBLIC`

- **Decision**: Usar `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app, private REVOKE ALL ON TABLES, SEQUENCES, FUNCTIONS FROM PUBLIC, anon, authenticated`. A função `app.current_account_id()` recebe um `REVOKE EXECUTE … FROM PUBLIC` explícito. O invariante C4 do teste de catálogo garante a regra (FR-004).
- **Rationale**: O Postgres não permite revogar por schema um privilégio concedido globalmente, e o `EXECUTE` para `PUBLIC` em funções é um padrão global. Alterar esse padrão afetaria todo o projeto. O teste de catálogo cobre o caso que os privilégios padrão não alcançam.

## R5. Supabase local na CI

- **Decision**: Acrescentar ao job `ci` existente os seguintes passos ([ci-checks.md §K1](./contracts/ci-checks.md)):
  - `supabase/setup-cli@v1` com `version: 2.122.0`;
  - `supabase start -x realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor`, que deixa apenas Postgres e GoTrue;
  - os advisors;
  - a integração.

  Um job novo só é criado se o orçamento de NFR-002 estourar.
- **Rationale**: Os passos no job atual herdam gatilhos, checkout, Node e o `cd: needs: ci` sem duplicar configuração. As migrations atuais criam uma view sobre `auth.sessions`, uma tabela criada pelas migrations do GoTrue. O `supabase db start` sozinho pode não criar essa tabela, e o exemplo oficial usa `db start` só para testes que não dependem do Auth.
- **Open verification (T002)**: O Docker local não estava em execução durante o plano. A tarefa T002 comprova localmente que o conjunto mínimo de serviços cria `auth.sessions` e mede o tempo de subida. Se `db start` bastar, ele substitui o `start -x`. Se o tempo passar do orçamento do NFR-002, os passos de banco viram um job paralelo.
- **Advisors**: `supabase db advisors --local --type security --level warn --fail-on warn` (bloqueia) e `--type performance --fail-on none` (só registra).
- **Baseline**: A T002 também roda os advisors de segurança sobre as duas migrations existentes. A migration da fundação só corrige um achado em objeto legado se a correção não alterar grants, policies ou dados de `private` (FR-010). Do contrário, a implementação para e registra a decisão pedida ao mantenedor. Uma candidata é a view `private.runtime_auth_sessions`, que precisa continuar com os privilégios do dono, porque o runtime não tem acesso a `auth`.

## R6. Varredura do bundle e prefixo público

- **Decision**: Um único script Node sem dependências, `scripts/verify-client-isolation.mjs`, roda depois de `next build`. Ele faz as duas verificações com uma lista interna de variáveis sensíveis (FR-019):
  - **Prefixo público**: procura `NEXT_PUBLIC_<nome sensível>` em `src/**`, nos `.env*` versionados, em `next.config.*` e em `.github/workflows/**`.
  - **Bundle**: varre `.next/static/**`, os pré-renderizados em `.next/server/app/**` (`*.html`, `*.rsc`, `*.body`, `*.meta`), `.next/server/pages/**/*.html` e `public/**`.

  O relatório informa arquivo, padrão e contagem, nunca o trecho encontrado.
- **Patterns do bundle**:
  - `\.supabase\.(co|com|in)\b`, mais o ref isolado quando `supabase/.temp/project-ref` existe;
  - `sb_publishable_`, `sb_secret_`, `service_role`;
  - os nomes explícitos das variáveis sensíveis;
  - `\b(app|private)\.<objeto>\b`, com objetos extraídos das migrations (`CREATE TABLE|VIEW|FUNCTION|SEQUENCE`);
  - `\b(app_runtime|online_runtime)\b`.
- **Rationale**:
  - A lista interna mantém uma fonte única sem módulo compartilhado.
  - A verificação de prefixo só lê arquivos versionados, então rodá-la depois do build não muda o resultado.
  - Páginas pré-renderizadas e `public/` também chegam ao navegador; olhar só `.next/static` deixaria lacunas.
  - Derivar os objetos das migrations cobre as tabelas novas das fases F2–F4 sem manter uma lista manual.
- **Alternatives considered**: dois scripts com um módulo de lista compartilhado (mais arquivos para o mesmo resultado); lista fixa de nomes (desatualiza); procurar a palavra "supabase" (gera falsos positivos e não detecta nomes de tabela).

## R7. Restrição de imports do cliente

- **Decision**:
  1. Uma regra ESLint `no-restricted-imports`, com nível `error`, em `src/components/**` e `src/hooks/**`, para `@supabase/*`, `pg`, `pg/*`, `drizzle-orm`, `drizzle-orm/*` e `@/lib/server/**`.
  2. Um teste de arquitetura, `tests/architecture/server-boundaries.test.ts`:
     - percorre o grafo a partir dos arquivos `'use client'`, de `src/components/**` e de `src/hooks/**`;
     - resolve o alias `@/`, os imports relativos e o `import()` literal;
     - falha mostrando a cadeia até o módulo proibido;
     - impõe também o FR-012 (acesso ao pool) e o FR-013 (`server-only`).
- **Rationale**: O lint pega o caso direto no editor, e o grafo pega o caso transitivo (por exemplo, `src/lib/**` importado por um componente). As três regras compartilham a mesma leitura de `src/`, então ficam num arquivo só, no estilo dos testes de fronteira existentes (`readdirSync` + regex). O `server-only` continua como barreira no build, mas não cobre `pg` nem `drizzle-orm`.

## R8. Chaveiro da KEK das contas

- **Decision**: O chaveiro usa duas variáveis:
  - `ACCOUNT_KEK_ACTIVE_ID`, não secreta, no formato `v<N>`;
  - `ACCOUNT_KEK_V<N>`, uma por versão, com 32 bytes em Base64 canônico.

  O carregador `src/lib/server/crypto/account-kek.ts` (`server-only`):
  - valida a presença da versão ativa, o formato e o tamanho;
  - recusa material igual ao da `SERVER_MASTER_KEY`, comparado com `timingSafeEqual`;
  - devolve `{ activeId, keys }`, com o material em `KeyObject` (`crypto.createSecretKey`), que não é exposto por `JSON.stringify` nem por `util.inspect`.

  A impressão digital do procedimento de backup (FR-016, SC-007) é `printf %s "$KEK" | base64 -d | sha256sum | cut -c1-16`, executada pelo mantenedor no runbook.
- **Rationale**:
  - Uma variável por versão permite marcar cada uma como Sensitive na Vercel e adicionar versões sem reescrever as anteriores.
  - O `KeyObject` já esconde o material, sem serialização customizada.
  - A impressão digital só serve para a comparação manual do backup. O SHA-256 truncado de 256 bits aleatórios não é reversível, e uma ferramenta padrão dispensa código e testes no projeto.
- **Alternatives considered**: um JSON único com todas as versões (uma rotação exige reescrever o segredo inteiro); KMS externo (rejeitado na clarificação); HMAC da chave num script do projeto (mesmo resultado prático, com script e teste a manter).

## R9. Testes de integração obrigatórios na CI

- **Decision**: Reutilizar a guarda dos testes de integração existentes:
  - `describeLocal = LOCAL_SUPABASE_DB_URL && ONLINE_DATABASE_URL ? describe : describe.skip`;
  - a recusa de destino diferente de `localhost:54322` e de usuário diferente de `app_runtime`.

  O teste novo segue o mesmo padrão. O passo de CI define as duas variáveis literalmente, só para aquele passo.
- **Rationale**: Com as variáveis definidas, o `describe` roda e qualquer falha bloqueia a pipeline, que é o que o FR-020a exige. Como os valores estão escritos no próprio workflow, o passo não tem como rodar sem eles. O `npm run test` continua pulando a integração em máquinas sem Docker. Um helper ou uma flag extra repetiria essa garantia.

## R10. Conexão do runtime no remoto

- **Decision**: O runbook comprova a conexão do runtime sem script novo.
  - O smoke de produção passa pelo `client.ts` atual. Ele recusa conexão remota sem CA e usa `rejectUnauthorized: true`, com a verificação de hostname do Node, comportamento já coberto por `tests/server/online-db-client.test.ts`.
  - O comando reproduzível dessa prova é `npx vitest run tests/server/online-db-client.test.ts`, contra o código publicado.
  - Depois do smoke, o mantenedor confirma no SQL editor que `pg_stat_activity` mostra sessões de `app_runtime`. Como só a aplicação usa esse papel, isso também prova que ela não está configurada com credencial administrativa (FR-005).
- **Rationale**: Um probe próprio repetiria o caminho que o smoke já exercita e seria mais um script com credencial de produção a manter.

## R11. Estratégia de branch

- **Decision**: Implementar numa branch própria a partir de `main` (sugestão: `feat/backend-foundation-f0`), levando os artefatos deste SDD.
- **Rationale**: A branch atual tem um SDD em andamento (`25-10-26-corrigir-inconsistencias-fluxos`) e mudanças não commitadas sem relação com esta. O passo remoto não publica código novo (FR-022a), então não depende dessa integração.

## R12. Restrição de rede

- **Decision**: A restrição por IP no banco fica **não aplicável** na F0. A decisão é registrada no runbook.
- **Rationale**: A Vercel Hobby não oferece IPs de saída fixos, e a Decisão 15 condiciona esse controle a eles. TLS obrigatório, senha forte e rotacionada e papel restrito continuam valendo.
