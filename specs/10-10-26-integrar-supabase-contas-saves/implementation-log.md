# Implementation log — Contas Supabase e saves locais protegidos

## Baseline e checkpoint (2026-10-10, America/Sao_Paulo)

- Aprovação: a solicitação atual invocou explicitamente `$sdd-implement` para esta feature. Isto valida o pacote SDD para execução local dentro do escopo de `tasks.md`; não autoriza publicação, criação ou mutação de projeto remoto sem alvo/organização/custo confirmados.
- Branch preservada: `codex/diet-pdf-export`; HEAD anterior: `b245aa3584a87da1b3a25cfa16c2fb9a3c431cf8`.
- Estado antes da execução: nenhuma mudança staged, 123 arquivos rastreados alterados e 8 arquivos não rastreados fora do ignore (131 caminhos no total); `git diff --stat`: 2.027 inserções e 1.336 remoções rastreadas. O working tree foi revisado; busca por nomes/padrões de credenciais não encontrou valores suspeitos nem arquivos `.env`, `.pem`, `.key` ou de credenciais no conjunto.
- Checkpoint obrigatório desta execução: `ac8b9c9013c3290df4ff62141ced9987e79aaebb` — `chore(diet): checkpoint before integrating online saves`. Inclui os 131 caminhos anteriores (3.771 inserções e 1.336 remoções ao incluir os oito arquivos não rastreados). O branch aparece `ahead 1, behind 3` em relação ao tracking local; nenhum fetch, push, reset ou troca de branch foi feito.
- Após checkpoint, o working tree estava limpo. Os 31 processos `node` preexistentes foram observados e preservados (PIDs: 41788, 84872, 108932, 109676, 133784, 190176, 203752, 204124, 243924, 268272, 283324, 285776, 319748, 341700, 341976, 363436, 367112, 383380, 460076, 462764, 507660, 534036, 547884, 554336, 558984, 573204, 641864, 672032, 672816, 691108, 714248).
- Nenhum teste, build, processo ou serviço externo foi iniciado/alterado antes do checkpoint.

## Preflight SDD

- `.specify/feature.json` resolve para `specs/10-10-26-integrar-supabase-contas-saves`.
- `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` passou e retornou `spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`, `contracts/` e `quickstart.md` disponíveis.
- `tasks.md`: 29 tarefas executáveis, todas abertas inicialmente e cada uma com exatamente uma atribuição `[skill: ...]`. Os 42 identificadores FR/NFR/SC estão cobertos. Checklists: `requirements.md` 16/16 e `security-and-save.md` 24/24. A conferência Spec Kit não encontrou placeholder aberto, requisito sem tarefa, tarefa órfã ou conflito constitucional; `analysis-report.md` registra 42/42 e zero findings documentais.
- O helper regravou a barra de caminho de `.specify/feature.json` no formato Windows; essa alteração mecânica foi restaurada ao conteúdo original. Não houve mudança semântica na âncora.
- Comandos descobertos: `npm run type-check`, `npm run lint`, `npm test`/`npx vitest run`, `npm run test:browser`, `npm run build`, além das auditorias `npm run audit:atomic-design`, `npm run audit:z-index`, `npm run verify:design-system` e `npm run verify:table`. `quickstart.md` prevê Supabase CLI e Docker para banco/Auth local descartável. Não existe script de lint/migration específico para Supabase em `package.json`.
- Resultado: T001 aprovado; nenhum alvo Supabase/SMTP remoto foi escolhido; nenhuma migration, DDL ou deploy remoto foi executado.

## Execução de tarefas

### T002 — fundação local preparada

- Fontes oficiais conferidas em 2026-10-10: o guia atual indica `@supabase/ssr` para sessões em cookies; o guia de configuração define `api.enabled=false` como desativação do PostgREST local; templates de confirmação/recovery aceitam `{{ .TokenHash }}` e configuração via TOML/HTML local. Changelog sem mudança recente que invalide essa escolha; Node local é v22, acima do requisito atual dos clientes JS.
- Tentativa inicial `npm install --save-exact --ignore-scripts --no-audit --no-fund ...` falhou com `ERESOLVE`: o estado anterior já combinava ESLint 8.57.1 com `eslint-config-next` 16.3.0, cujo peer exige ESLint >=9. A causa foi confirmada nos metadados instalados/lockfile; não alterei a cadeia de lint fora do escopo. Repeti com `--legacy-peer-deps`, preservando essas versões existentes.
- Dependências runtime inicialmente fixadas em `package.json`/lock: `@supabase/supabase-js` 2.117.3, `@supabase/ssr` 0.12.7, `postgres` 3.4.9 e `server-only` 0.0.1. A escolha de driver foi revista em T004 após a análise documentada abaixo; `postgres` já não consta no lock final.
- `npm run type-check` passou após a instalação.
- Como a CLI global não existe, usei `npx --yes supabase@2.120.0`; `--help`, `init --help`, `init --yes` e `--version` passaram. `init` só criou os arquivos locais; não houve login, link ou chamada de projeto remoto.
- `supabase/config.toml` desativa PostgREST/Data API local, exige confirmação de e-mail, usa OTP de 900 segundos, define apenas callbacks localhost e habilita o Mailpit local. Templates em `supabase/templates/` usam `TokenHash` nos endpoints planejados. `.env.example` contém apenas nomes/valores locais não secretos em branco; não há `NEXT_PUBLIC_`, chave real ou URL de projeto remoto.
- Python `tomllib` validou o TOML e as opções/arquivos dos templates; scan de credenciais em `.env.example` não encontrou correspondências; `git diff --check` não encontrou erro de whitespace. T002 marcado concluído.

### Bloqueio antes de T003

- T003 começa pelos testes de integração contra Supabase local. `docker --version` responde 29.6.2, mas `docker info` falha porque o endpoint `npipe:////./pipe/dockerDesktopLinuxEngine` não existe. `com.docker.service` está parado e seu executável configurado `C:\Program Files\Docker\Docker\com.docker.service` não existe; não há Podman, Rancher ou nerdctl instalados/disponíveis.
- A inicialização de Supabase exige um runtime de contêiner; não iniciei instalação de Docker/desktop ou mutação de máquina e não tentei simular RLS/Auth com PGlite. Sem esse serviço não posso produzir a prova de owner/RLS/Auth local exigida por T003, então as tarefas dependentes ficam abertas.
- Retomada: restaurar/instalar Docker Desktop com o serviço funcional; conferir `docker info`; executar `npx --yes supabase@2.120.0 start` com os serviços mínimos e a mailbox local; então iniciar T003 pelo teste, antes da migration/código. Nenhum dado remoto é necessário para essa retomada.
- Reanálise após T001/T002: helper de pré-requisitos passou; 42/42 identificadores continuam cobertos, 29 tarefas com uma atribuição cada (2 concluídas, 27 abertas), checklists 16/16 e 24/24, nenhum placeholder ou conflito documental novo. Type-check permanece aprovado; nenhuma prova de integração foi alegada.

## Retomada autorizada — 2026-10-10

- O usuário autorizou diretamente executar a implementação e criar um projeto novo na conta Supabase já autenticada, incluindo o trabalho necessário para preparar a integração. Isso substitui a pausa anterior para escolher um alvo remoto; não autoriza publicar o aplicativo, fazer deploy, usar o projeto de outro produto nem enviar dados clínicos reais.
- CLI mostrou uma única organização, `Jacquinho` (`dnfabgumifnjctlwqcxq`), plano `free`, e somente o projeto ativo `cardapio-app`. Plano e lista foram conferidos pela sessão autenticada; o projeto existente foi preservado.
- Criado `diet-maker`, projeto `mxmamolgulbljcocaonl`, em `sa-east-1` (São Paulo), com tamanho mínimo por omissão da CLI e estado `ACTIVE_HEALTHY`. No plano Free, esse projeto usa compute Nano gratuito; nenhum add-on foi selecionado. A senha de banco foi gerada aleatoriamente e entregue à CLI sem registrá-la em arquivo ou log.
- O checkout foi vinculado ao projeto novo com `supabase link`; nenhum schema/migration foi aplicado ainda. O alvo remoto só receberá migration depois de ela passar na pilha local descartável e de ser revisada.
- Docker Desktop estava instalado, mas o engine não respondia. `docker desktop start` iniciou o engine; `docker info` confirmou Docker Desktop 29.6.2. A primeira inicialização de `npx --yes supabase@2.120.0 start` está baixando as imagens oficiais; a prova local ainda está pendente.
- O SMTP próprio/remetente de produção não foi fornecido. A pilha local usa Mailpit; não enviar mensagens a endereços reais durante testes. A configuração de SMTP remoto e o teste de entrega permanecem pendentes até haver credenciais/destinatário sintético apropriado.

### T003 — banco privado, migration e RLS local

- `tests/server/online-db.integration.test.ts` foi escrito antes da migration e falhou inicialmente pela ausência esperada de `private.professional_profiles`.
- `npx --yes supabase@2.120.0 migration new online_account_saves` gerou a migration local `supabase/migrations/20261011002435_online_account_saves.sql`. Ela cria `private.professional_profiles`, `private.saves` e `private.auth_rate_limits`; o identificador clínico é TEXT/único e o vínculo, a chave e a idempotência têm chaves únicas. Não contém dados clínicos.
- O primeiro reset local revelou que a identidade da migration não pode alterar os atributos de superusuário de um role. Removi o `ALTER ROLE`; `online_runtime` nasce como login sem herança e sem `BYPASSRLS`, e senha será fornecida fora da migration. `npx --yes supabase@2.120.0 db reset --local` então aplicou a migration com sucesso.
- Postgres 17 local: três testes passaram — sem owner nenhum registro é visível; owner 1 não pode inserir registro com owner 2; duas reivindicações concorrentes do mesmo `local_account_id` terminam com um único dono. A matriz também verifica papéis browser sem acesso, runtime não owner/NOBYPASSRLS, perfil/save sem UPDATE/DELETE, buckets privados e leitura apenas das colunas `auth.sessions.id/user_id`.
- O teste conecta somente a `127.0.0.1:54322`, concede `online_runtime` ao role de teste `postgres` durante a suíte e revoga no cleanup. A suíte é pulada sem `LOCAL_SUPABASE_DB_URL`; não lê nem limpa projeto remoto.
- `supabase/config.toml` mantém `[api].enabled=false`; o stack local não iniciou um container PostgREST. O Mailpit e Auth locais estão saudáveis. `npm run type-check`, a suíte T003 (3/3) e `git diff --check` passaram. O alvo remoto segue sem schema/migration aplicada até implementação e validação concluídas.

### T004 — ajuste do driver e ambiente local

- A revisão das referências oficiais atuais revelou que Supavisor transaction mode não suporta pipelining; Postgres.js o ativa por padrão e não tem desligamento funcional junto a `sql.begin()`. `node-postgres` mantém pipeline desativado por padrão, e Drizzle suporta ambos. Usei Jev com a menor superfície de alternativas; confiança foi 0,28, então a resposta não foi tratada como mandato. A decisão aplicada é `pg` + Drizzle + transaction pooler, pool local/serverless máximo 1, TLS e sem prepared statements nomeados, mantendo `SET LOCAL` na mesma transação. `plan.md`, `research.md` e T004 em `tasks.md` foram atualizados.
- Troquei a dependência runtime `postgres@3.4.9` por `pg@8.23.1` e adicionei `@types/pg@8.23.1`; Node local é v22. A prova T003 foi reescrita com o mesmo driver escolhido e voltou a passar (3/3), além de `npm run type-check`.
- Gerei senha aleatória exclusiva para o login local `online_runtime`, configurei-a somente no Supabase local e gravei as URLs/chaves locais necessárias em `.env.local` (ignorado pelo Git), junto de uma master key de desenvolvimento aleatória. Nenhum valor foi escrito neste log. O projeto remoto ainda não recebeu grants alterados, role password ou migration.

#### Conclusão T003/T004 após restringir a leitura de sessões

- A tentativa local de conceder `USAGE` no schema gerido `auth` não produziu essa permissão. Para não abrir acesso direto ao schema/tabela, a migration expõe apenas `id,user_id` por `private.runtime_auth_sessions`; a view é do owner da migration, e `online_runtime` recebe SELECT somente nela. O teste confere que não há `USAGE` em `auth`, grants diretos em `auth.sessions` ou acesso a outras colunas.
- Antes de reexecutar `db reset --local`, confirmei zero usuários, perfis e saves na base local. A migration foi reaplicada, a senha aleatória local do runtime foi restaurada sem registrar o valor, e `tests/server/online-db.integration.test.ts` + `tests/server/online-db.repository.test.ts` passaram (5/5). O teste do repository confirma a sessão pela view, bootstrap INSERT-only, isolamento de proprietário e reutilização de uma conexão física.
- `npm run type-check` passou. `T003` e `T004` concluídas com prova apenas na pilha local; nenhuma migration, grant ou configuração Auth foi aplicada ao projeto remoto.

### T005 — chaves e perfil cifrado

- Escrevi `tests/server/save-keys.test.ts` antes de `src/lib/server/save-keys.ts`; a primeira execução falhou porque o módulo ainda não existia. A implementação usa apenas `node:crypto`: DEK de 32 bytes aleatória, AES-256-GCM com IV de 12 bytes e AAD determinística que inclui propósito e tuple, prova HMAC-SHA256 com chave derivada por HKDF, e perfil profissional cifrado com AAD vinculada ao owner.
- A KEK ativa é lida exclusivamente de `SERVER_MASTER_KEY` (base64 canônico de 32 bytes) e identificada por `SERVER_MASTER_KEY_ID`. Ausência, formato inválido ou versão incompatível falham; não há fallback nem log de conteúdo/chaves. A lógica de retry usa unwrap do envelope já persistido, conservando a mesma DEK.
- `tests/server/save-keys.test.ts` passou (5/5): DEKs distintas, retry conserva bytes, AAD/tamper rejeitados, prova tuple-bound, segredo de perfil ausente no ciphertext, owner incorreto recusado, configuração ausente recusada e funções não escrevem segredo em logs. `npm run type-check` passou.

### T006 — origem, CSRF, corpo e limite persistente

- Escrevi `tests/server/request-security.test.ts` antes dos módulos; a primeira execução falhou pela ausência de `request-security.ts`, como esperado. O helper valida Origin exata, cookie/token CSRF com comparação em tempo constante, JSON por schema injetado e limite durante leitura em stream (não só `Content-Length`). Erros expõem somente código/mensagem fixa/requestId e respostas privadas usam `no-store`/`no-referrer`.
- `GET /api/auth/csrf` é dinâmico no runtime Node; gera token aleatório de 32 bytes, cookie HttpOnly/SameSite Strict com validade de 15 minutos e resposta sem cache. Cookie Secure acompanha HTTPS/produção.
- Baldes usam HMAC-SHA256 de chave separada por HKDF; endereço/e-mail legíveis não entram no banco. `consumeAuthRateLimit` faz incremento UPSERT em transação e apaga no máximo 100 buckets expirados por request. Um primeiro teste encontrou que Drizzle retornava timestamps como strings; a consulta agora calcula o `Retry-After` diretamente no Postgres.
- `tests/server/request-security.test.ts` passou (7/7), incluindo 12 chamadas concorrentes com limite 5 (cinco aceitas, sete limitadas), registro persistente, origem/cookie inválidos, corpo acima do limite, schema recusando campo clínico extra e erro não ecoando segredo. `tests/server` passou (16/16) antes de acrescentar o caso específico de redação; o arquivo completo voltou a passar (7/7) depois dessa adição. A tabela de rate limits ficou vazia após cleanup. `git diff --check` passou.

### T007 — sessão SSR validada por requisição

- `tests/server/auth-session.test.ts` foi criado antes dos arquivos e falhou inicialmente por módulo ausente. A implementação usa `createServerClient` de `@supabase/ssr` novo por request, adaptador `getAll/setAll`, cookies HttpOnly/SameSite Lax e Secure em HTTPS; atualizações de cookie e headers do SDK são aplicáveis à resposta final `no-store`.
- O guard chama `auth.getUser()` para confirmar o registro atual e verificar revogação; `auth.getClaims()` valida JWT e fornece `sub/session_id`, cuja linha é comparada com `user.id` por `private.runtime_auth_sessions`. Exige e-mail existente/verificado, usuário não anônimo e claim `sub` igual ao usuário. Nenhum owner do request/user_metadata é usado; nenhum token é retornado. Não chama `getSession()` como autoridade.
- Conferi a documentação oficial Supabase SSR: `getAll/setAll` preserva rotação de refresh cookies e headers anti-cache, clientes de servidor devem ser criados por request, e `getUser()` verifica o usuário no servidor enquanto `getClaims()` fornece claims validados. Referências: https://supabase.com/docs/guides/auth/server-side/creating-a-client e https://supabase.com/docs/guides/auth/server-side/advanced-guide.
- `tests/server/auth-session.test.ts` passou (6/6), cobrindo cookie/refresh, usuário válido, anônimo, e-mail pendente, JWT revogado, ausência/discordância de auth.sessions, owner forjado e ausência de tokens/getSession no resultado. `npm run type-check` passou. Esta prova usa mocks controlados; o fluxo real local de confirmação/refresh fica para os testes integrados de T026.

### T008 — cadastro, login e confirmação de e-mail

- `tests/server/auth-signup.test.ts` foi escrito primeiro e a primeira execução falhou por rota/módulo ainda ausentes. Implementados parseadores estritos de JSON para signup/login/conclusão, seis endpoints de Auth e o callback `/auth/confirm` no runtime Node.
- Cadastro normaliza e-mail e nomes trimados; confirmações devem bater; senha nova tem 12+ caracteres e máximo 72 bytes UTF-8; faixas de meses/anos e métricas finitas não negativas são aceitas. Campos extra (inclusive clinical/user_metadata) são recusados. O BFF nunca passa perfil por `user_metadata`; novos perfis são cifrados e inseridos uma vez. Resposta de signup é genérica; identidades duplicadas não disparam bootstrap e falha do INSERT deixa conclusão para login verificado.
- Login verifica o token recém-emitido com `getUser(jwt)` + `getClaims(jwt)` e a sessão com a view privada; token só transita dentro do servidor. Perfil ausente encaminha ao modo de conclusão e nenhuma rota de save é chamada. Complete-profile exige sessão confirmada, não sobrescreve registro existente e não cria saves.
- Rate limits duráveis agora aplicam as taxas planejadas: login 10/10min por e-mail e 50/10min por IP; cadastro/recuperação 3/h por e-mail e 10/h por IP. Em produção, IP usa `x-vercel-forwarded-for`; não aceita `x-forwarded-for` sem o header confiável. Baseei essa origem nos [request headers documentados pela Vercel](https://vercel.com/docs/headers/request-headers), que diz que a Vercel sobrescreve `X-Forwarded-For` para impedir spoofing.
- Confirmação GET apenas sela token hash em cookie AES-GCM HttpOnly de 15min e redireciona sem token na URL; não consome OTP. POST usa propósito `email` fixo, `verifyOtp` e `signOut({ scope: 'local' })`. Logout usa somente escopo de sessão corrente. Todas respostas Auth são no-store e redigidas.
- `tests/server/auth-signup.test.ts` passou (12/12). `npx vitest run tests/server` passou (36/36) com banco/Auth locais e role runtime; `npm run type-check` e `git diff --check` passaram. Testes de rota usam doubles para o provedor; envio/consumo real de e-mail no Mailpit permanece para T026. Nenhuma mensagem foi enviada a um endereço externo e SMTP remoto não foi configurado.

### T009 — landing, cadastro e login

- `tests/components/auth/registration-login.test.tsx` foi escrito antes das telas; a primeira execução falhou pela rota ausente. Implementados landing provisória, páginas de login/cadastro e o organismo de cadastro com modos `signup`, `confirm` e `complete`. A landing mantém o título previsto e informa que os arquivos clínicos continuam no dispositivo.
- Login/cadastro obtêm CSRF em memória, enviam os campos aos endpoints server-side, mostram loading e erros associados/focados e preservam autocomplete. O formulário exige escolha explícita de experiência em meses ou anos; a métrica admite zero/fração e nenhuma faixa é presumida.
- O shell deixa `/`, `/login`, `/criar-conta`, `/recuperar-senha` e `/redefinir-senha` sem instanciar nem restaurar o profile local. O teste confirma que a sessão clínica e seu snapshot não são consultados em rota pública. O restante dos gates account/save/locked continua em T020.
- Registrados `organism-login-form` e `organism-registration-form`, seus perfis e exports. `registry.json` atualiza a contagem da baseline de 79 para 81 fontes depois de adicionar os dois organismos.
- `tests/components/auth/registration-login.test.tsx` passou (13/13), cobrindo landing, login, erro genérico, loading, perfil/faixas, confirmação, conclusão e ausência de restauração clínica em rota pública. `npm run type-check`, parse JSON do catálogo e `git diff --check` passaram.
- `npm run verify:design-system` não encontrou divergência de baseline nem findings nos novos componentes; manteve oito findings em perfis antigos sem exceção/homologação vigente. `npm run audit:atomic-design` reportou cinco violações em `src/app/agenda/page.tsx` e `src/components/organisms/CreateReadyMealsFromDietModal.tsx`, arquivos fora desta mudança. Os relatórios `.audit-report.{json,md}` gerados serão restaurados ao estado anterior à execução.
- Não houve revisão visual em navegador nem envio real de e-mail nesta tarefa; a jornada browser integrada está planejada em T026 e o teste de e-mail local também fica para T026/T024.

### T010 — recuperação e redefinição de senha

- Escrevi `tests/server/auth-recovery.test.ts` antes dos handlers; a primeira execução falhou pela rota ainda ausente. Recovery valida e-mail/CSRF, aplica os limites duráveis previstos e sempre retorna a mesma mensagem condicional, inclusive para respostas de erro do Auth que poderiam variar com o endereço.
- O template Supabase inclui `type=recovery`. O GET correspondente aceita somente esse propósito, sela `token_hash` por 15 minutos em cookie HttpOnly restrito a `/api/auth/reset-password`, limpa a URL e não chama `verifyOtp`. A confirmação ocorre somente no POST.
- O POST valida nova senha/confirmação e CSRF, consome OTP fixo `recovery`, atualiza a senha e exige sucesso de `signOut({ scope: 'global' })`. Sessão e cookies temporários permanecem no cliente SSR em memória; a resposta só propaga deleções de cookies de Auth. Falha depois do consumo pede novo link e tenta revogar a sessão temporária localmente. O módulo não chama catálogo, repositório de saves nem funções de chave, preservando o vínculo/DEK existente.
- `tests/server/auth-recovery.test.ts` passou (11/11), incluindo propósito/expiração, scanner GET, resposta genérica, OTP replay e duas consumações concorrentes, ausência de cookie-token e falhas após consumo. `tests/server/auth-signup.test.ts` passou (12/12); type-check e `git diff --check` passaram.
- A evidência usa Auth simulado em testes de handler. E-mail/OTP reais em Mailpit, login posterior com a nova senha e leitura de um save sintético permanecem na validação integrada T026; não houve alteração no Auth remoto nem envio de e-mail.

### T011 — formulários de recuperação e redefinição

- Escrevi `tests/components/auth/recovery.test.tsx` antes das telas; a primeira execução falhou pela ausência esperada de `ResetPasswordForm`. Criei as rotas públicas `/recuperar-senha` e `/redefinir-senha` e os dois organismos usando `Input`, `Button`, `textStyle` e o layout de acesso existente.
- Solicitação recolhe e-mail, retorna mensagem condicional genérica e link para login. Redefinição valida mínimo/tamanho de senha e confirmação, destaca/foca o erro, explica link expirado/usado e oferece nova solicitação; sucesso leva ao login. CSRF pendente/indisponível e envio usam estados acessíveis sem exibir tokens.
- Registrei perfis, fontes, consumers e exports dos organismos, e atualizei a baseline do catálogo de 81 para 83 fontes.
- `tests/components/auth/recovery.test.tsx` passou (9/9), cobrindo rotas, e-mail/CSRF, envio genérico, Enter via submit de formulário, loading/deduplicação, campos, expiração, erros focados, sucesso e destino. A auditoria visual em múltiplos viewports e a verificação integrada seguem em T028/T026.

### T012 — registro atômico e autorização de save

- Escrevi `tests/server/save-registry.test.ts` antes das rotas; a primeira execução falhou porque `/api/saves` ainda não existia. O teste usa contas sintéticas e o Postgres local com a role `online_runtime`; somente a validação de sessão Auth é simulada.
- `registerSaveRecord` lê por owner + idempotency key e identidade clínica dentro de `withOwnerTransaction`; a reivindicação usa `UNIQUE` e `ON CONFLICT DO NOTHING`, de modo que concorrentes recebem o mesmo vínculo do owner ou um 409 opaco para outra conta. Retentativa com mesma idempotency key e payload diferente é 409. Perfil profissional existente é exigido antes do acesso.
- A criação gera/wrapa uma DEK candidata, cifra o rótulo e persiste prova, identidade e envelope na mesma linha. Resposta de criação/retry contém só IDs, rótulo e prova; a autorização compara a prova recebida com a persistida em tempo constante, recalcula sua HMAC, valida a sessão/owner e desembrulha a DEK somente para `/authorize`. O plaintext é zerado após a serialização da resposta e a autorização tem janela de oito horas; não há endpoint de relato de checkpoint.
- O primeiro teste contra Postgres revelou que o insert Drizzle incluía `created_at`, embora a role runtime deva deixar o timestamp exclusivamente para o banco. Troquei apenas o insert da reivindicação por SQL explícito que omite essa coluna, conservando os grants mínimos da migration; as consultas permanecem Drizzle/RLS e nenhuma migration foi ampliada.
- `tests/server/save-registry.test.ts` passou (6/6) com RLS/Postgres local: prova/DEK estáveis no retry, idempotência conflitante, duas contas concorrentes com dono único, payload clínico rejeitado, prova incorreta/owner cruzado com o mesmo 404, falha de wrapping sem linha e chave utilizável somente no authorize. `tests/server/online-db.repository.test.ts`, `auth-session.test.ts`, `request-security.test.ts`, `auth-recovery.test.ts` e `auth-signup.test.ts` passaram no conjunto (45 testes aprovados, 1 cenário já pulado); type-check e `git diff --check` passaram.
- Auth Supabase real não foi usada; validação de sessão foi simulada neste teste de rota. SMTP, cadastro de dois usuários no Auth local e fluxo HTTP completo seguem na jornada T026. Não houve alteração remota.

#### Ajuste T012 — formato versionado da prova

- A primeira validação depois de introduzir o formato versionado falhou porque o parser da rota ainda tratava a string completa como base64url puro; a fixture do save desconhecido também enviava o formato antigo. Removi a validação redundante e passei ambos os casos pelo parser canônico `v1:<binding_kek_id>:<base64url-HMAC-SHA256>`.
- Como o modelo deixava a representação wire da prova em aberto, consultei Jev com as opções string compacta versionada ou objeto JSON tipado. A recomendação foi a string compacta (confiança 0,96; probabilidade 0,98), compatível com o requisito de opacidade. O formato ficou registrado em `data-model.md` e `contracts/backend-api.md`.
- `tests/server/save-registry.test.ts`, `tests/server/online-db.repository.test.ts` e `tests/infrastructure/protected-save.test.ts` passaram juntos (15/15), com Postgres local e role runtime restrita para as rotas/repository. T012 e T013 passaram a compartilhar o mesmo parser/serializador da prova.

### T013 — codec local para saves protegidos

- Escrevi primeiro `tests/infrastructure/protected-save.test.ts`; a primeira execução falhou pela ausência esperada dos módulos `protected-save`. O codec reutiliza `validateBackupEnvelope`, que migra o payload reconhecido para schema 11 em memória antes de retorná-lo.
- O envelope externo aceita somente chaves/versão/algoritmo e base64url canônicos; usa AES-256-GCM, IV aleatório novo de 12 bytes, tag de 128 bits e AAD UTF-8 da tupla fixa `[appId,formatVersion,saveId,algorithm,bindingProof]`. A prova é a string versionada `v1` definida no T012. Perfil clínico, identificador local, DEK e handle não são serializados em claro.
- Sete cenários passaram: round-trip de todas as coleções schema 11, IV distinto, envelope inválido/downgrade/campo extra antes do decrypt, identidade/prova/tag/IV adulterados, Conta clínica divergente, schema clínico desconhecido e chave exportável recusada. A prova cobre o codec por testes unitários; não substitui teste de browser nem a integração da sessão em T016/T026.

### T014 — referências locais para múltiplos arquivos

- `tests/infrastructure/browser-save-file.test.ts` foi escrito antes da alteração e falhou nos métodos ausentes de persistência/identidade e por fechar o stream em uma escrita que falhou. O port agora mantém store IndexedDB v2 separada do ponteiro legado, indexada por `(ownerId,saveId)`, e retorna somente tuple, identificadores não secretos permitidos e handle/nome local. Nenhum campo extra recebido é copiado para a store.
- A comparação usa `FileSystemHandle.isSameEntry`, nunca o nome do arquivo. Consulta de permissão continua sem prompt; `requestPermission({mode:'readwrite'})` é executado somente quando chamada explicitamente. A escrita aguarda `close()` antes de resolver; erro de write ou close tenta `abort()` e propaga a falha.
- Quatro cenários passaram com IndexedDB em memória: associação de dois proprietários/saves, recuperação/remoção isolada, igualdade de destino por identidade do handle mesmo com nomes diferentes, nome igual para entradas diferentes, permissões e write/close/abort. `npm run type-check` e `git diff --check` passaram. Não houve execução em Chrome/Edge real; essa evidência está prevista na jornada T026.

### T015 — sessão online do save e prazo

- Escrevi primeiro `tests/application/online-save-session.test.ts`; a primeira execução falhou porque o módulo da sessão ainda não existia. A API mantém a CryptoKey não extraível somente na sessão em memória, exige o tuple completo `(ownerId,saveId,localAccountId,keyId,bindingProof)` e fornece a chave apenas ao callback de uma operação aceita. O snapshot público contém somente `status`, prazo e flag de revogação.
- Grant novo é recusado sem conectividade reportada, com revogação pendente, prazo expirado/maior que oito horas, tuple inválido ou CryptoKey exportável. O prazo combina epoch e monotônico; `onResume` reconhece suspensão/retorno e bloqueia operações novas sem renovar. Operações já aceitas podem concluir, depois disso a referência interna é descartada.
- A flag é suportada por um port de marcador injetável e não contém material de chave. A sessão inicia locked, sem restaurar grant; armazenamento browser concreto e gate de nova autorização serão integrados na composição T016. Se armazenamento do marcador falhar ao ler, a decisão é fail-closed.
- Seis testes passaram, cobrindo tupla/cipher key, conectividade, expiração em oito horas após suspensão, não renovação por atividade, reload sem grant, marcador não secreto persistido pelo port, logout com operação em andamento e grants inválidos. `npm run type-check` passou. Nenhuma sessão/Auth real ou browser foi exercitada neste módulo unitário.

### T016 — perfil protegido e composição browser

- Ampliei `tests/lib/application/profile-session.test.ts` com criação online, adoção legacy schema 10, retry após falha de destino e negação antes de criar runtime. O teste de migration/repository agora compara SHA-256 do fixture schema 10 antes/depois; a fixture determinística existente foi reutilizada.
- O fluxo novo escolhe destino e pede permissão antes do registro remoto; persiste `(ownerId,localAccountId,idempotencyKey)` e handles permitidos antes da chamada, autoriza a DEK e só então cria PGlite no scope `(ownerId,saveId)`. Mantém `account.id` textual. Encrypt → write/close → readback/decrypt/validação → checkpoint → persistência da associação precedem o estado active.
- A abertura protegida valida cabeçalho, autorização, GCM e Conta clínica antes de criar runtime. Workspace existente do mesmo tuple não é substituído; draft store e PGlite usam namespaces do owner/save. Preferências de favoritos agora são lidas/escritas com chave local por Conta clínica. O arquivo legado fica em memória após validação e a adoção escreve um destino distinto; a origem não é regravada.
- A composição browser usa apenas endpoints same-origin `/api/auth/session`, `/api/auth/csrf` e `/api/saves`; raw DEK é importada como AES-GCM não extraível e o buffer é zerado. O marcador browser pendente contém somente um booleano local. Restore automático antigo não abre base online sem grant.
- Quatro novos cenários de sessão passaram e os testes existentes de sessão/repository/browser-file passaram em conjunto (29/29); `npm run type-check` passou. Os testes de rota/crypto e banco real local anteriores também passaram. Esta tarefa ainda usa gateway/Auth simulados na composição; signup/OTP, browser real, deadline durante editor e revogação/logout integrado ficam para T021/T026. Nenhuma alteração foi aplicada ao Supabase remoto.

### T017 — exportação e restauração protegidas do menu

- Ampliei primeiro os testes de aplicação e do menu. O export online agora captura a base já validada e cifra o `.nutridiet` com a mesma DEK/identidade do save ativo; o resultado baixado contém somente o envelope externo v2. O caminho sem gateway permanece compatível com os fluxos locais de teste/legado.
- `validateBackup` e `restoreBackup` em modo online só aceitam ciphertext v2 autenticado por GCM para o tuple atual. Grant ausente/expirado vira `BACKUP_AUTH_REQUIRED`; plaintext, header inválido ou outro save falha antes do repositório. A restauração continua exigindo confirmação e conservando as proteções existentes de draft/checkpoint/transação.
- `SidebarNavigationAdapter` continua usando a aplicação como única porta, baixa o conteúdo cifrado e explica a dependência da conta vinculada; não serializa o envelope clínico em propriedades de UI.
- `tests/application/backup-application.test.ts`, `tests/components/app/backup-actions.test.tsx` e a regressão de `profile-session.test.ts` passaram (39/39); `npm run type-check` passou. A mensagem `Not implemented: navigation to another Document` vem do `window.location.reload()` simulado após restore de sucesso no jsdom; o caso e a suíte terminaram aprovados. A restauração foi testada com repository double, não em browser real. Nenhuma migration/config Supabase remota foi alterada.

### T018 — catálogo paginado e localização

- Implementei `GET /api/saves?page=0&pageSize=50` com paginação limitada, ordenação estável por `createdAt`/ID, contagem total e filtro por owner sob a transação/RLS existentes. A consulta e resposta incluem somente ID, rótulo decifrado para a conta autenticada e data; não retornam Conta clínica, path, handle ou progresso.
- `isSaveOpenableAtLocation` só retorna verdadeiro quando já existe handle e a sessão tem grant atual para o tuple completo. Localizar arquivo não renova, cria nem estende autorização.
- Sem `LOCAL_SUPABASE_DB_URL`, o teste de catálogo é ignorado pelo guard. Com Postgres local disponível, `save-catalog`, `online-db.repository`, `save-registry` e `online-save-session` passaram juntos (18/18), cobrindo 53 saves de um owner, paginação 50+3, outro owner isolado, parâmetros inválidos, sessão/perfil exigidos e grant não concedido por localização. Nenhum schema remoto foi aplicado.

### T019 — dashboard de saves

- Escrevi primeiro `tests/components/saves/saves-dashboard.test.tsx`; a falha inicial foi a ausência esperada do organismo. Criei `/saves` com GET do catálogo em páginas de 50, validação estrita do formato, consulta de associações locais separada e mensagens genéricas para erro de Auth/catálogo. A tela usa o organismo `SavesDashboard`, DataTable remota com `totalRows`, badge textual e ações criar/importar/abrir/localizar.
- O status local diferencia verificação, handle referenciado, sem arquivo, permissão e referência perdida. “Arquivo referenciado” não afirma sincronização; nomes iguais não identificam saves (ações são rotuladas pelo ID curto). Perfil legado só oferece criar uma cópia protegida e preserva a origem.
- `ProfileSession.openSave` restaura apenas a associação do owner atual e confere o saveId cifrado antes de autorizar. `locateSave` exige seleção explícita de arquivo protegido e igualdade de saveId; arquivo de outra linha não chama authorize nem grava associação. A relocalização usa a prova/chave do save existente, sem novo registro. Erros de permissão/referência perdida são diferenciados.
- Registrei componente, perfil, export e consumidor no catálogo visual; o resolver e `verify:table --strict` localizaram o teste e passaram sem erros/avisos. Testes do dashboard (4/4) e sessão/profile (22/22), `npm run type-check` e `git diff --check` passaram. O teste usa DOM/IndexedDB e doubles; a jornada real de arquivos continua em T026.

### T020 — gate de conta e save

- Reescrevi o gate para validar `/api/auth/session` antes de renderizar rota clínica. Anônimo vai a `/login`; perfil incompleto a `/criar-conta?completar=1`; conta pronta sem runtime entra em `/saves`; `/home` direciona ao dashboard ou à rota clínica conforme já exista runtime.
- Removi restauração automática do último arquivo e tirei `PatientApplicationBootstrap` do layout. A rota pública não consulta Auth/profile. A sessão `paused` com runtime segue no shell clínico, preservando trabalho em memória.
- `tests/app/session-aware-app-shell.test.tsx` passou (5/5), incluindo anônimo, profile incompleto, `/home`, paused e ausência de auto-restore. Em Chromium, a spec `profile-session-gate.spec.ts` cobriu conta sem save, rota clínica encaminhada, perfil incompleto e landing sem consulta; os casos restantes passaram em duas execuções direcionadas (2/2 cada). Auth foi simulado por respostas HTTP sintéticas, sem criar contas ou enviar e-mail.

### T021 — bloqueio imediato e preservação de drafts

- O gate de edição consulta a autorização viva do tuple; operações já aceitas terminam e `waitForIdle()` permite preservá-las antes da desmontagem. Prazo/logout muda a sessão clínica para `locked` imediatamente e mantém a árvore clínica oculta/inert enquanto conclui checkpoint e flush local.
- O hook registra o flush do draft atual no `ProfileSession`, atualiza a referência para o documento mais recente e tenta uma vez novamente quando uma escrita aceita foi superada. Falha de flush mantém runtime bloqueado e montado para uma tentativa explícita; nenhum draft é exportado nem enviado à outra Conta.
- Type-check passou. `useDietBuilderPage`, `backup-drafts.integration`, `online-save-session`, `profile-session` e `session-aware-app-shell` passaram em conjunto (44/44). Os fixtures online usam gateway sintético e banco local descartável; o deadline/logout na jornada real do browser continua em T026.

### T022 — entrada pelo dashboard e logout autenticado

- A criação e seleção de arquivo permanecem na dashboard de saves, que autoriza cada save antes de expor a Conta clínica. Removi o antigo `ProfileOnboarding` público e seu export; `/home` agora encaminha a `/saves`. Links clínicos existentes permanecem no sidebar e os nomes dentro do save continuam sendo dados da Conta clínica.
- Logout primeiro bloqueia e preserva o runtime local, então busca token CSRF same-origin e chama `POST /api/auth/logout`. A dashboard oferece Sair mesmo sem saves, e erros do endpoint permanecem visíveis para nova tentativa. As ações clínicas continuam disponíveis no menu do sidebar.
- Atualizei registro/categorias/consumidor do catálogo visual para remover o organismo órfão. Type-check passou; `browser-auth`, `session-aware-app-shell`, `saves-dashboard` e `auth-signup` passaram (26/26). A navegação/logout integrado com Auth real e SMTP local segue para T026; não houve envio de e-mail nem alteração remota.

### T023 — setup e limites de operação

- `.env.example` documenta somente variáveis de servidor e separa a conexão runtime restrita da conexão administrativa local. `docs/setup/online-auth.md` explica origin/CSRF, callbacks, SMTP/Mailpit, conexão IPv4/IPv6 e pooler, KEK/backup/rotação, Vercel futura e fronteira dos dados clínicos.
- O setup local está preenchido com origem localhost, API/Auth em `127.0.0.1`, Postgres local em `127.0.0.1:54322`, role runtime e KEK local; nenhum valor secreto foi copiado ao repositório ou aos logs. O endpoint Auth local respondeu HTTP 200 e Mailpit HTTP 200. Type-check e `supabase db lint --local --level error --fail-on error` passaram; lint encontrou zero erros. O container Supabase Vector aparece reiniciando, fora do caminho usado pelos testes.
- Links externos do guia apontam para documentação Supabase oficial de SMTP, redirects, modos de conexão e migrations. `npm run verify:links` falhou somente em dois exemplos markdown malformados de `.agents/skills_link/{add-community-extension,simple}/SKILL.md`, anteriores e sem relação com esta feature.

### T024 — alvo Supabase (parcial; sem mutação remota)

- Leitura do Supabase conectado confirmou o projeto `diet-maker` (`mxmamolgulbljcocaonl`), região `sa-east-1`, status `ACTIVE_HEALTHY`, organização `Jacquinho` em plano Free. O projeto preexistente `cardapio-app` continua intacto. Catálogo remoto confirmou zero migrations e zero tabelas em `public`/`private`.
- A migration local está aplicada e `db lint` passou. A role de runtime local foi usada pelos testes integrados das tarefas anteriores. SMTP remoto/remetente aprovados e configuração de URLs de produção ainda não existem; por isso não apliquei migration, grants, Auth ou dados de teste remotamente. A condição da tarefa mantém T024 aberta até resolver esses itens; nenhum e-mail real foi enviado.

### T025 — soberania, legado e proteção local

- Atualizei as Decisões 11–13, o índice e ADR-009 para distinguir o payload clínico do envelope externo cifrado v2, arquivos legados plaintext, drafts/IndexedDB não cifrados e janela de grant de oito horas. Limites de Auth/e-mail, KEK, perda de armazenamento e ausência de sincronização clínica estão alinhados ao SDD.
- O schema clínico não foi alterado. Os textos afirmam explicitamente que não há E2EE estrita nem cifra de todo o dispositivo; Auth remoto e disponibilidade de produção seguem pendentes de ativação.

### T026 — jornada integrada (em validação)

- Auth real local/Supabase/Mailpit: signup, bloqueio do e-mail pendente, confirmação via GET preparatório/POST consumidor, login, recovery/reset, replay e logout passaram na primeira execução integrada (1/1). A extração do helper e as correções posteriores exigem nova passada, em andamento.
- Helpers de regressão agora criam contas sintéticas verificadas e saves protegidos, usando FileSystemFileHandle real de OPFS e persistência real em IndexedDB. Somente a escolha do picker é automatizada; isso não prova o diálogo nativo Windows nem permissões de um arquivo externo. O conteúdo clínico não é colocado em localStorage pelos doubles. A chave capturada para assertions fica apenas na memória do processo de teste; traces foram desabilitados.
- A passada integrada atual aprovou os quatro testes de backup: export cifrado offline sem request clínico, restore/cancelamento/reabertura explícita, não consulta drafts legados e rollback por falha transacional. Demais cenários seguem em execução.
- Falhas iniciais de waits ocorreram durante compilação fria; alterações do código enquanto o navegador rodava também invalidaram aquela execução. Não são provas de aprovação. Docker/dev estavam desligados na retomada e foram iniciados preservando o volume existente; Vector permanece reiniciando, serviços usados pelo teste saudáveis.
- O 503 de signup observado anteriormente coincidiu com indisponibilidade do serviço/SMTP local; a hipótese de limite de duas mensagens/hora não foi comprovada. O runtime mostrou GOTRUE_RATE_LIMIT_EMAIL_SENT=360000. Config local passou a 20 mensagens para testes sintéticos, decisão apoiada por Jev (confiança0,98), sem alegar efeito causal nem alteração remota.

### T027 — auditoria e correções

- Três recon e três hunters conforme security-audit: nenhum ataque explorável confirmado. 24/24 testes de wrapping/codec/file/session; 37 testes Auth/HTTP passaram, um teste de banco foi ignorado nessa revisão para evitar mutação repetida. As provas RLS locais anteriores permanecem distintas de produção. Relatório externo: `C:/Users/Jacques/security-audit-skill/diet-maker/run-1/REPORT.md`; findings.json vazio validado (0 findings).
- Corrigidos gaps funcionais: logout confirmado reconhece revogação, falha conserva marcador, novo login processa pendência; métodos capturados consultam grant antes do despacho; restore exige nova autorização online. Jev apoiou guard nos métodos, em vez de no AccountContext usado pela conservação (confiança0,96, probabilidade0,98).
- Revisão independente confirmou risco de perda de edição por desmontagem do editor no ramo locked e remoção do flusher após primeira falha. A árvore clínica agora permanece montada, oculta/inert; callbacks capturados sobrevivem ao unregister até preservação bem-sucedida. Checkpoint busy também mantém a árvore clínica.
- 79/79 testes focados passaram em sete arquivos: shell, profile-session, hook, formulários, logout, backup e grant. Type-check passou após essas correções; alterações seguintes de convergência serão verificadas novamente.

### T028 — auditorias (parcial)

- Z-index: zero findings em645 arquivos. Atomic: cinco violações em agenda/page.tsx e CreateReadyMealsFromDietModal.tsx, fora dos componentes desta feature. Tabela: um erro anterior em MealCardContainer.tsx e sete warnings.
- DS: quatro exceções anteriores expiradas/incompletas e quatro componentes clínicos não homologados; SavesDashboard ainda tinha status specified, mantido até terminar sua validação. Não alterei os componentes anteriores para eliminar esses findings do relatório.
- Specs de viewport1024/1280/1600, zoom200% e teclado foram adicionadas; execução integrada em andamento. Não há afirmação de conformidade WCAG completa baseada somente nessas assertions.

### Convergência — primeira passada

- Encontrado gap FR-010/US3: dashboard consultava somente permissão do handle e mostrava Arquivo referenciado, sem ler/reconhecer cabeçalho ou os estados pedidos Sincronizado/Desincronizado. T030 foi anexada a tasks.md (contradicts). Cenários de cabeçalho/prova/nome igual/arquivo removido e textos da dashboard falharam antes da implementação (3 falhas,8 sucessos), comprovando o gap.
- T024/SMTP continua pendência externa existente; nenhuma migration/grant/Auth remota aplicada. T026–T029 ainda não foram declaradas concluídas.

### Provas adicionais — 2026-10-11

- T030:11/11 testes de reconhecimento/arquivo e dashboard passaram após implementação; tipo/identidade/prova/arquivo inválido/ausente/permissão são diferenciados sem grant pela localização. Type-check passou. A disputa de preparação concorrente de logout/login foi reproduzida (quatro requests em vez de dois), corrigida com Promise compartilhada e comprovada em teste; rodada de logout/dashboard9/9.
- Build passou numa cópia isolada em `C:/Users/Jacques/.codex/tmp/diet-maker-build-1a13bff87e9f4f4e8cf8f50da54721b5`: compile, types,17 páginas estáticas e route handlers dinâmicos. `.next` do dev foi preservado. Esse build não é deploy nem teste do runtime remoto.
- Jornada clínica passou (1/1,54s): criação/edição de avaliações, criação/substituição/remoção de follow-up, arquivo cifrado com dados correspondentes, arquivamento e isolamento de pacientes. Os locators foram atualizados para o fluxo atual anterior a esta feature (ações no cabeçalho, datas por tipo e Observações), sem alterar a UI clínica.
- Regressão reload/nova aba/offline passou (1/1,17,8s) após esperar a verificação do catálogo antes de desligar a rede. Execuções interrompidas sem resultado foram descartadas como evidência de aprovação; o roteiro restante está sendo executado serialmente.
- Saída Atomic desta passada preservada em `evidence/audit-report.{json,md}`; arquivos gerados na raiz restaurados ao baseline do checkpoint, conforme registro anterior. O projeto remoto foi relido: diet-maker permanece ACTIVE_HEALTHY, Postgres17, sa-east-1. SMTP foi solicitado como entrada de T024, sem senha pelo chat.

### Publicação Vercel e validação final — 2026-10-11

- O usuário ampliou o escopo: publicar o aplicativo Next.js na conta Vercel atual, sem domínio próprio, e usar Gmail como SMTP de Auth. A especificação, plano, quickstart e tarefas agora refletem esse pedido; nenhum deploy foi feito ainda.
- Login CLI Vercel confirmado. Criado e vinculado o projeto `nutridiet` ao checkout. Inspeção confirma que ainda não houve deployment e `vercel env ls` retorna zero variáveis. O CLI acrescentou `VERCEL_OIDC_TOKEN` ao `.env.local` ignorado pelo Git; as seis variáveis preexistentes de Supabase/KEK continuaram presentes. Nenhum segredo foi exibido.
- `.env.smtp.local` foi criado e está ignorado pelo Git para receber endereço Gmail e senha de app Google; esses campos ainda não foram fornecidos. Não usar a senha normal do Gmail nem credenciais da Vercel nesse arquivo.
- Chrome instalado: três jornadas passaram em execução direcionada (layout de páginas públicas/teclado/zoom, criação-relogin-localização/reset/isolamento de saves, e checkpoint durante navegação concorrente). O fluxo de retry de checkpoint falho também passou (1/1); autenticação e offline passaram em execuções anteriores registradas acima. O File System Access usa OPFS/IndexedDB reais, com a seleção do picker simulada; a caixa nativa do Windows e Edge não foram validados.
- Verificação de contraste computado em Chrome nas rotas `/login`, `/criar-conta`, `/recuperar-senha` e `/redefinir-senha`, incluindo erro de login: zero pares abaixo de WCAG AA entre os elementos de texto examinados. Não é certificação integral WCAG da aplicação.
- T028 passou para o SavesDashboard: status DS atualizado para homologated; screenshots/afirmações em 1024/1280/1600, zoom 200%, teclado e verificação de contraste passaram. `verify:design-system` não aponta mais o organismo; ainda lista oito achados em perfis/exceções preexistentes, fora do escopo. Atomic/tabela também têm findings globais antigos registrados acima.
- T027 concluída: revisão colaborativa de segurança e validação independente sem achado explorável confirmado; testes direcionados e guards corrigidos estão registrados acima. Nenhuma mutação/Auth/migration remota foi feita.
- `type-check` passou após as últimas mudanças de código. Build passou na cópia isolada descrita acima. T026 continua parcial até prova em Edge e abertura pelo picker nativo; T024 aguarda SMTP; T029 depende de SMTP, migration/Auth remotos, variáveis de produção e teste HTTPS após deploy.

### Continuação — revisão de escopo e ativação pendente — 2026-10-11

- Corrigi as referências que ainda diziam que deploy não estava autorizado ou que Vercel era futura. `tasks.md`, `research.md` e `docs/setup/online-auth.md` agora registram publicação autorizada, projetos `diet-maker`/`nutridiet`, região `gru1`, hostname `.vercel.app` ainda a obter e Gmail como remetente inicial.
- Documentei que `.env.smtp.local` contém remetente Gmail e senha de app Google. Não contém credenciais Vercel nem a senha normal do Gmail; a senha de app ainda está vazia e é a única entrada imediata do usuário.
- Reexecutei `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`: feature directory correto, `tasks.md` presente. O inventário atual tem 42 IDs únicos FR/NFR/SC, todos já referenciados pelas tarefas; FR-021/SC-009 estão em T024/T029. A análise final não encontrou contradições de especificação/constituição nem lacuna sem tarefa. Converge não acrescentou tarefa: os três itens restantes estão explicitamente cobertos por T024 (SMTP/remote), T026 (Edge/picker nativo) e T029 (produção/deploy); T030 já cobre o gap anterior de sincronização.
- A tentativa de instalar Microsoft Edge pelo Playwright terminou com erro de privilégio insuficiente. Não há executável Edge nas localizações padrão; T026 permanece aberta por essa cobertura e pelo picker nativo Windows, sem afirmar falha do produto.
- `git diff --check` passou; as mensagens exibidas são apenas avisos existentes de normalização LF/CRLF. Nenhum teste adicional, commit, push, migration remota, e-mail real ou deploy foi executado nesta continuação.

### Continuação — SMTP e configuração Supabase remota — 2026-10-11

- O usuário preencheu `.env.smtp.local`. Validação local sem revelar valores: remetente Gmail válido, senha de app presente no formato de 16 caracteres alfanuméricos, arquivo ignorado pelo Git.
- Projeto alvo confirmado: `diet-maker` (`mxmamolgulbljcocaonl`), região `sa-east-1`. Aplicada a migration `20261011002435_online_account_saves.sql`; `migration list --linked` confirmou o mesmo identificador local/remoto. Auditoria SQL confirmou `online_runtime` como login sem superuser/BYPASSRLS, RLS e `FORCE RLS` em `professional_profiles`, `saves` e `auth_rate_limits`, leitura permitida da sessão runtime e ausência de UPDATE/DELETE runtime em `private.saves`.
- SMTP Gmail, templates de confirmação/recovery e callbacks HTTPS para `nutridiet-eight.vercel.app` foram enviados à configuração remota. `config diff` com o SMTP local carregado retornou zero diferenças; `GET /auth/v1/health` com a chave pública retornou HTTP 200. O teste sintético de signup retornou HTTP 200 e deixou exatamente uma conta de alias Gmail não confirmada. A caixa de entrada não está acessível neste ambiente; entrega/recebimento não comprovado.
- Advisors remotos registraram quatro `WARN auth_rls_initplan`: `current_setting` é reavaliado por linha em políticas SELECT/INSERT de profiles e saves. São avisos de desempenho; não indicam bypass de RLS. Permanecem descritos como finding a acompanhar, sem nova migration corretiva nesta ativação.
- Projeto Vercel `nutridiet` e domínio `nutridiet-eight.vercel.app` confirmados por consulta autenticada; ainda sem variáveis de produção e deployment.
- Tentativa de gerar e gravar a senha de `online_runtime` e `SERVER_MASTER_KEY` em `.env.production.local`, além de executar `ALTER ROLE`, foi rejeitada antes da execução pelo controle automático do terminal com o motivo informado “blocked by policy”. Não houve fallback por outro caminho: `.env.production.local` não existe, nenhum segredo foi criado e a senha da role não foi alterada. Consequência: conexão runtime e T024 permanecem incompletas, variáveis de produção não foram configuradas, e T029/deploy seguem bloqueados. Próxima retomada: resolver a criação/configuração dos segredos por um fluxo permitido; depois configurar Vercel e validar signup/recovery/saves por HTTPS.

### Convergência incremental — 2026-10-11 — bloqueada por ativação externa

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` confirmou a feature informada e `tasks.md`. `.specify/extensions.yml` contém somente `before_implement`; não há hooks before/after-converge para executar. Inventário encontrou 42 IDs únicos FR/NFR/SC em `spec.md`, todos referenciados pelas tarefas atuais.
- A verificação do gap anterior T030 encontrou leitura do arquivo associado e comparação conjunta de `saveId`/`bindingProof` em `inspectAssociatedSaveFile`, estados de permissão/ausência/referência perdida/incompatibilidade e cobertura correspondente nos testes da dashboard/browser. A evidência anterior registrada para T030 é 11/11 testes e type-check aprovados; nesta passada não reexecutei testes.
- As únicas pendências observadas nesta retomada já estão explicitamente rastreadas: T024, recebimento do e-mail sintético e segredo/conexão da role runtime; T026, Edge e picker nativo; T029, variáveis, deploy e smoke HTTPS. Não acrescentei tarefas repetidas. Portanto esta não é uma passada limpa de convergência: FR-008/FR-021/SC-009 e a cobertura Edge ainda não foram validados até produção.
- A decisão de não duplicar tarefas foi conferida por Jev, mas veio com confiança baixa (0,37); a decisão final é fallback do agente apoiado pela correspondência verificável entre cada pendência e T024/T026/T029. `git diff --check` passou, com avisos existentes de conversão LF/CRLF. Não executei build/testes, não criei commit, não fiz push ou deploy.
- O motivo de bloqueio continua sendo o controle automático do terminal, que rejeitou a operação de segredos/`ALTER ROLE` como “blocked by policy”. Retomar por um fluxo permitido para configurar esses segredos; em seguida completar T024, T029 e o que ainda for possível de T026, e rodar nova convergência completa.

### Confirmação de recebimento do e-mail — 2026-10-11

- O usuário confirmou que recebeu e clicou no e-mail sintético. Consulta read-only em `auth.users`, sem selecionar ou exibir o endereço, encontrou uma conta sintética, `email_confirmed_at` nulo e `last_sign_in_at` nulo.
- Inspeção do fluxo confirma que GET `/auth/confirm` sela o `token_hash` em cookie HTTP-only e redireciona para `/criar-conta?confirmar=1`; somente POST `/api/auth/confirm-email` chama `verifyOtp`. Como a Vercel ainda não tem deployment, o clique comprova recebimento, mas não conclui a confirmação da conta de teste. Depois de publicar, será necessário solicitar/usar um link ainda válido e verificar o POST.
- A tentativa inicial de consulta usou a opção `--sql`, inexistente nesta versão da Supabase CLI; foi corrigida para SQL posicional e a leitura remota concluiu com sucesso. Nenhum dado foi alterado.

### Retomada após reinicialização do Codex — 2026-10-11

- A configuração global foi verificada em `C:\Users\Jacques\.codex\config.toml`: `approval_policy = "on-request"` está no nível raiz. A Supabase CLI 2.120.0 autenticada lista o projeto `diet-maker` (`mxmamolgulbljcocaonl`) como ativo/linkado; a Vercel CLI 63.1.2 confirma o projeto `nutridiet` e zero variáveis de produção.
- `supabase config pull --dry-run --project-ref mxmamolgulbljcocaonl` informou `wrote=false`, sem modificar a configuração local ou remota. `.env.production.local` e o backup DPAPI esperado continuam ausentes.
- A tentativa padrão pela Supabase CLI para gerar as credenciais localmente e aplicar `ALTER ROLE online_runtime` foi bloqueada pelo controle automático no `CreateProcess`, antes de qualquer instrução iniciar. Nenhuma rota alternativa foi usada, nenhuma senha foi criada e nenhuma alteração SQL aconteceu. O bloqueio persiste apesar da configuração local `on-request`.
- O painel Supabase no navegador está deslogado. A URI da role runtime deve vir do botão Connect do projeto depois do login; não se deve adivinhar host/porta do pooler. T024/T029 continuam bloqueadas pelo controle de execução e falta da URI. T026 ainda tem a limitação independente de Edge e picker nativo Windows.

### Retomada após login no Supabase — 2026-10-11

- O painel aberto está autenticado na organização `Jacquinho` e no projeto `diet-maker` (`mxmamolgulbljcocaonl`). Connect confirmou o pooler de transações `aws-1-sa-east-1.pooler.supabase.com:6543`, usuário `postgres.mxmamolgulbljcocaonl`, banco `postgres`; nenhum password foi copiado ou registrado.
- Consulta remota somente leitura confirmou `online_runtime` existente com flags `rolcanlogin=true`, `rolsuper=false`, `rolbypassrls=false`. Auth health retornou HTTP 200 com a chave pública. Vercel confirmou zero variáveis em Production.
- `npm run type-check` passou. `npm run build` passou numa cópia isolada do checkout, sem copiar arquivos `.env*` e sem alterar `.next` do servidor local.
- A tentativa normal pela Supabase CLI de gerar credenciais aleatórias, guardá-las em backup DPAPI e executar `ALTER ROLE online_runtime` voltou a ser rejeitada por política no `CreateProcess`, antes de iniciar. Verificação read-only confirmou ausência do backup DPAPI, de SQL temporário e de `.env.production.local`; nenhuma senha, SQL ou variável da Vercel foi alterada.
- T024/T029 permanecem abertas por esse bloqueio. T026 permanece parcial pelas validações de Edge e picker nativo do Windows. Nenhum deploy, commit ou push foi feito.

### Continuação — TLS remoto e publicação aguardando revisão — 2026-10-11

- O backup local `production-secrets.dpapi` existe em `%LOCALAPPDATA%\NutriDiet\secrets`, protegido por DPAPI do usuário atual. Foi decodificado somente em memória para uso; nenhum valor de segredo foi impresso ou salvo no repositório. O certificado oficial do Supabase está em arquivo temporário fora do checkout.
- `src/lib/server/online-db/client.ts` agora exige `ONLINE_DATABASE_SSL_CA_B64` em conexões Postgres remotas, valida Base64/PEM e configura `rejectUnauthorized: true`; Supabase local em `127.0.0.1:54322` conserva `ssl: false`. `.env.example`, o quickstart e `docs/setup/online-auth.md` descrevem a variável.
- `npm.cmd exec vitest -- run tests/server/online-db-client.test.ts --pool=forks --maxWorkers=1` passou (2/2); cobre falta/Base64 inválido, CA aplicada com verificação TLS e conexão local. `npm.cmd run type-check` passou.
- Consulta real `SELECT current_user, current_database` via `aws-1-sa-east-1.pooler.supabase.com:6543`, com credencial restrita de `online_runtime`, CA oficial e verificação de certificado habilitada, retornou role/database esperados (`RUNTIME_POOLER_TLS_VERIFIED_OK`). A senha de runtime já havia sido definida por `ALTER ROLE`; RLS/grants e quatro avisos de desempenho do advisor estão descritos acima.
- T024 concluída: migration remota aplicada, Auth/SMTP/callbacks configurados, role limitada, catálogo preparado, e-mail sintético recebido e findings do advisor explicados.
- A chamada `vercel env add` para salvar os sete segredos no Production do projeto `nutridiet` foi rejeitada pela revisão automática antes de criar o processo. Razão literal: o payload exporta credenciais de banco/chave de cifragem para Production e a autorização ampla para Supabase/Vercel não explicita o payload sensível e destino exigidos pela regra de egress. Nenhuma variável foi adicionada e nenhum deploy foi iniciado; não usei caminho alternativo.
- Build isolado repetido após a alteração TLS em `C:\Users\Jacques\AppData\Local\Temp\diet-maker-supabase-tls-build-20261011`, sem copiar arquivos `.env*` e sem alterar o `.next` do checkout. Next.js 15.5.22 compilou e gerou as 17 páginas estáticas/rotas dinâmicas; build passou.
- T029 fica aberta até essa aprovação específica, configurar variáveis, publicar e validar HTTPS. T026 segue parcial: Edge não está instalado e o picker nativo do Windows não foi validado. A build remota ainda não foi iniciada.

### Convergência final desta retomada — 2026-10-11

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` confirmou `spec.md`, `plan.md`, `tasks.md` e diretório da feature corretos. A revisão cruzada não encontrou requisito sem tarefa nem conflito novo: a mudança TLS está coberta pelo contrato/conexão runtime e pela variável de ambiente documentada.
- Restam exatamente T026 e T029. T026 já rastreia Edge/picker nativo ainda não comprovados; T029 já rastreia variáveis Production, deploy e smoke HTTPS, bloqueados pela revisão automática do envio de segredos. Não acrescentei tarefas duplicadas. A convergência não está limpa até essas provas serem concluídas.
- `npm.cmd exec vitest -- run tests/server/online-db-client.test.ts --pool=forks --maxWorkers=1` passou (2/2), `npm.cmd run type-check` passou e o build isolado passou. `git diff --check` passou; Git emitiu apenas avisos existentes de normalização LF/CRLF.

### Publicação e smoke HTTPS Production — 2026-10-11

- Após a revisão automática solicitar confirmação específica do payload e destino, o usuário autorizou o envio das sete variáveis ao ambiente Production do projeto Vercel `nutridiet`. A Vercel lista 7/7 nomes esperados: `APP_ORIGIN`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ONLINE_DATABASE_URL`, `ONLINE_DATABASE_SSL_CA_B64`, `SERVER_MASTER_KEY` e `SERVER_MASTER_KEY_ID`. Nenhum valor foi impresso ou escrito neste repositório.
- O primeiro deploy revelou incompatibilidade de peer dependency: Next 15 com `eslint-config-next` 16 exigia ESLint 9. Jev recomendou, com confiança 1, alinhar apenas `eslint-config-next` à linha do Next 15/ESLint 8; `package.json`/lock foram corrigidos e a instalação/build remoto passou. Outro deploy apontou preset Vercel sem framework; o projeto foi configurado como Next.js e o deploy subsequente concluiu `READY`.
- O alias Production `https://nutridiet-eight.vercel.app` respondeu `200` para `/`, `/login`, `/criar-conta`, `/recuperar-senha`, `/redefinir-senha` e `/saves`. `/api/auth/csrf` respondeu `200` e seu cookie tinha `Secure`, `HttpOnly`, `SameSite=Strict`; `/api/auth/session` e `/api/saves` sem sessão responderam `401`.
- Smoke via HTTPS com dados sintéticos: `POST /api/auth/signup` respondeu `202`, criou a identidade e perfil remoto; login respondeu `200`, o perfil ficou completo. Para exercitar também o consumidor de confirmação, uma segunda identidade sintética recebeu OTP de `auth.admin.generateLink({ type: 'signup' })`; `GET /auth/confirm` e `POST /api/auth/confirm-email` concluíram com `200`, seguido de login e conclusão do perfil. A confirmação da primeira identidade foi feita administrativamente após o signup para verificar seu perfil/login; portanto o clique no e-mail enviado por esse signup não é afirmado como validado nesta rodada.
- A API de recovery Production respondeu `202`; o callback `/auth/recovery`, reset e novo login concluíram com `200`. `POST /api/saves` criou um save (`201`), GET o listou, POST de autorização retornou `200`; após reset a sessão e o catálogo ainda mostraram o save.
- Os callbacks positivos usaram OTPs sintéticos gerados administrativamente. Conforme a [documentação Supabase](https://supabase.com/docs/reference/javascript/auth-admin-generatelink), `generateLink` gera links/OTPs para serem enviados por um provedor e não envia o e-mail. A API de signup e de recovery Production também foi acionada; a entrega SMTP foi confirmada pelo usuário em teste anterior, mas a caixa de entrada não foi lida nesta rodada.
- Bundle das seis rotas públicas e 37 scripts passou pela busca dos valores secretos disponíveis no `.env.local`; logs do deployment passaram pela busca de formatos de credencial. Ambas retornaram `CLEAN`.
- Limpeza: o save foi removido por SQL usando somente seu ID aleatório de teste; as duas contas sintéticas foram removidas pelo Auth Admin. A resposta inicial de geração de link não trouxe o ID de uma conta; ela foi encontrada por busca restrita ao alias sintético do teste, removida e verificada. A consulta final confirmou zero usuários sintéticos, e a verificação anterior encontrou zero perfil/save para a conta recuperada. Nenhum paciente ou save real foi acessado.
- T024/T029 estão concluídas. T026 segue aberta somente para a validação não disponível de Edge e do picker nativo do Windows. Não houve commit ou push.

### Análise SDD após a ativação — 2026-10-11

- Preflight confirmou `spec.md`, `plan.md`, `tasks.md` e o diretório da feature corretos. Os checklists continuam completos (16/16 e 24/24); os 42 IDs FR/NFR/SC estão referenciados em tarefas, há 30 tarefas e todas têm exatamente uma skill atribuída.
- A comparação atualizada de spec/plan/tasks não encontrou requisito sem cobertura, contradição ou placeholder novo. T029 foi marcada concluída após as provas acima; T026 é a única tarefa aberta.
- Converge não encontrou novo gap de implementação que justifique uma tarefa adicional: a verificação restante de Edge e picker nativo já está coberta por T026. Não foi criada tarefa duplicada nem alterada a spec durante a convergência.
- A passada final não é limpa para declarar a feature SDD concluída: T026 ainda exige evidência em Edge e no diálogo nativo do Windows, indisponíveis neste ambiente. Ponto de retomada: executar esses dois checks em ambiente com Edge/picker acessíveis, atualizar T026 e repetir a convergência completa. `extensions.yml` não define hooks de analyze/converge/after-implement.

### Retomada — T026 e instalação do Edge — 2026-10-11

- Reconfirmei que Edge não está instalado. A instalação user-scope do winget não tem instalador aplicável; o MSI oficial de máquina baixado previamente confere com SHA-256 publicado pela Microsoft (`46DB09D14B85A0DF8BCA87FBE9C3224CCF54F97D776BEDC2EEBF4B0C2CCBF5B4`).
- Iniciei `msiexec /i ... /passive /norestart` com solicitação UAC. O processo ainda aparece ativo e `msedge.exe` ainda não existe nos caminhos de instalação; portanto não registro a instalação como concluída. O próximo passo é aceitar a elevação no Windows, aguardar a instalação e executar a cobertura T026.
- A inspeção dos testes confirma que `online-saves.spec.ts` e `helpers/profile-session.ts` substituem `showOpenFilePicker`/`showSaveFilePicker` por handles OPFS; isso não prova a interação pelo seletor nativo. Chrome já tem a execução registrada acima. T026 permanece aberta até evidência em Edge e picker nativo. Nenhum código do produto foi alterado nesta retomada.

### Retomada — runtime de validação T026 — 2026-10-11

- Iniciei o Docker Desktop instalado e confirmei daemon 29.6.2. Isso retomou os containers locais do projeto `diet-maker`; Postgres, Auth, Storage, Kong e Mailpit estão healthy. Realtime/Vector seguem unhealthy e Edge Runtime está exited; esses serviços não são usados pelas rotas de Auth/saves testadas. Nenhum container de outro projeto foi parado ou removido.
- O processo MSI da tentativa anterior encerrou sem instalar nem registrar Microsoft Edge: `winget list` não encontra o pacote e `msedge.exe` não existe nos caminhos verificados. Não foi executada a suíte de browser neste ciclo.
- `playwright.config.ts` aceita `PLAYWRIGHT_BROWSER=edge` para abrir o mesmo conjunto de testes no canal Edge; Chromium continua padrão. `npm.cmd run type-check` passou e `PLAYWRIGHT_BROWSER=edge npm.cmd exec playwright -- test --list` listou 23 testes em 10 arquivos. Isso prova descoberta/configuração, não execução em Edge.
- A execução browser permanece preparada, mas o `.env.local` e a lista Auth local apontam `localhost:3000`; esse endereço está ocupado pelo processo Node do projeto `cardapio-app` (PID 12968), que foi preservado. Playwright usa 3100 e o allowlist Supabase local atual ainda não inclui essa origem; antes de repetir jornadas Chrome/Edge será necessário ajustar somente o ambiente local de teste sem alterar a porta/processo do outro app.
- `git diff --check` passou, com avisos preexistentes de LF/CRLF. T026 continua aberta: a instalação Edge requer consentimento UAC, e ainda falta a interação real com o picker nativo em Chrome/Edge. Nenhum deploy, commit ou push foi feito.

### Link de produção solicitado — 2026-10-11

- Verifiquei ao vivo `https://nutridiet-eight.vercel.app`: `/`, `/login`, `/criar-conta` e `/api/auth/csrf` responderam HTTP 200 e a raiz traz o título atual do NutriDiet.
- `https://nutridiet.vercel.app` também responde 200, mas apresenta conteúdo diferente. `vercel alias ls` mostra os aliases do projeto atual, sem esse endereço; `vercel domains inspect` disse que o escopo `erickjacquinhos-projects` não tem acesso ao domínio.
- Tentei apontar a implantação Production atual (`nutridiet-m9utrq6tv-erickjacquinhos-projects.vercel.app`) ao alias solicitado, sem `--force`. A própria Vercel recusou: `The chosen alias "nutridiet.vercel.app" is already in use.` Não forcei remoção/reassociação de um alias que não está acessível neste escopo. `APP_ORIGIN`/Auth Production foram preservados para manter funcionando o link atual.

### Retomada — tentativa Playwright Edge — 2026-10-11

- A instalação oficial por `npm.cmd exec -- playwright install msedge` falhou com `insufficient privileges`; Edge continua ausente. Não tentei contornar a instalação global nem elevar outro processo. T026 segue aberta para Edge e picker nativo.
- Reconfirmei no alias atual que `/login`, `/criar-conta` e `/api/auth/csrf` respondem HTTP 200. `nutridiet.vercel.app` responde HTTP 200, mas seu título/conteúdo é de outro site; o app NutriDiet segue em `nutridiet-eight.vercel.app`.
- O usuário informou que criou uma conta no app, confirmou a criação pelo e-mail recebido e conseguiu entrar; relatou que a conta parece normal. Registro como validação manual de cadastro, confirmação por e-mail real e login no ambiente publicado, sem acesso da automação à caixa de entrada.

### Correção — reautorização da referência local ao reabrir save — 2026-10-11

- O usuário confirmou que consegue localizar, abrir e editar o arquivo real; após sair e entrar novamente, a dashboard o marcava Desincronizado e não aparecia pedido de permissão, levando à relocalização manual.
- A causa estava no fluxo `openSave`: ele lia o handle salvo no IndexedDB sem chamar `requestWritePermission`; a operação `Localizar` funcionava porque o seletor nativo entregava um handle recém-autorizado.
- `openSave` agora solicita permissão de leitura/escrita antes de ler o handle. O teste focado primeiro falhou mostrando a ordem `read` sem `permission`; após a correção, 25/25 testes de `profile-session.test.ts` passaram. Type-check e build local também passaram.
- Publicação Production Vercel `dpl_GfhKiaXoFW5XvyQ8vJhkPMR2gy8Q` ficou `READY` e atualizou o alias existente `nutridiet-eight.vercel.app`. Verificação HTTPS: `/`, `/saves`, `/login` e `/api/auth/csrf` retornaram 200; `/api/auth/session` sem sessão retornou 401, como esperado.
- T026 continua aberta para cobertura completa em Edge e repetição manual do ciclo sair/entrar/autorizar usando o arquivo real após esta publicação. O usuário já comprovou o seletor nativo e a edição em um navegador, mas não identificou qual navegador; esse ciclo específico corrigido ainda não foi refeito nele.

### Correção complementar — gesto do usuário ao reabrir save — 2026-10-11

- Retificação da causa: o pedido de permissão já existia, mas a referência era recuperada somente após `getCurrentOwnerId()` (rede); além disso, a dashboard descartava o handle que já havia recuperado para conferir o estado. Assim, o browser recebia `requestPermission()` sem o gesto transitório do clique e não mostrava o diálogo.
- `src/app/saves/page.tsx` agora conserva as associações verificadas em memória e as passa ao `openSave`; o botão fica desabilitado enquanto a dashboard recupera/verifica os handles. O fluxo chama a permissão pelo handle no clique e só depois verifica a conta atual e pede autorização do backend. A autorização remota continua obrigatória.
- `npm.cmd exec vitest -- run tests/lib/application/profile-session.test.ts tests/components/saves/saves-dashboard.test.tsx --pool=forks --maxWorkers=1` passou: 2 arquivos, 31 testes. `npm.cmd run type-check` passou. O build de produção Vercel compilou, validou tipos e gerou 17 páginas estáticas/rotas dinâmicas.
- Deploy Production `dpl_9VynCd8zM1HmaSuAF3CzVE7wfA64` ficou `READY` e atualizou `https://nutridiet-eight.vercel.app`. Smoke HTTPS: `/`, `/login`, `/saves` e `/api/auth/csrf` retornaram 200; `/api/auth/session` sem sessão retornou 401. `git diff --check` não achou erros (apenas avisos de normalização LF/CRLF).
- O browser controla se a permissão será por sessão ou persistente. No Chrome compatível, após fechar todas as abas do domínio e reabrir, o diálogo pode oferecer “Permitir em todas as visitas”; somente essa escolha mantém o acesso indefinidamente, até ser revogado. O app não pode selecionar essa opção pelo usuário. A interação com o arquivo real após este deploy continua pendente; T026 também exige Edge/picker nativo.
