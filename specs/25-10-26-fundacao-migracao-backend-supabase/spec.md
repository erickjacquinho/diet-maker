# Feature Specification: Fundação da migração para o backend Supabase (F0)

**Feature Branch**: branch existente `feat/configuracoes-perfil-save` preservada; nenhuma branch criada nesta etapa. A execução acontece numa branch própria a partir de `main` ([research.md](./research.md) R11).

**Created**: 2026-10-25

**Status**: Draft — especificação para validação humana. Não autoriza implementação, migration remota, criação de chaves ou publicação; a execução segue `/speckit-implement` após aprovação.

**Input**: Pedido completo preservado em [.sdd-context.json](./.sdd-context.json). Abrir o SDD da migração para o backend Supabase pela fase F0 (fundação) da [Decisão 15](../../refs/dieta-db/15-esquema-transferencia-backend-supabase.md).

## Objetivo, atores e limites

A migração para o backend troca a persistência local (PGlite, `.nutridiet` e saves) pelo PostgreSQL do Supabase como fonte principal dos dados confirmados de cada conta. O navegador conversa apenas com o servidor da aplicação e não conhece o banco. A F0 não move nenhum dado clínico. Ela prepara a base de segurança que as fases seguintes usam: banco que nega acesso por padrão, um único caminho de acesso por conta, chave mestra fora do banco e verificações automáticas que impedem o código do navegador de conhecer o banco.

**Atores**

- **Mantenedor** (desenvolvedor/operador): aplica as migrations, configura o projeto e os segredos e lê os resultados da CI.
- **Pipeline de CI**: aplica as verificações automáticas a cada push ou pull request.
- **Código de servidor da aplicação**: único consumidor do banco.
- **Navegador do profissional**: não acessa o banco.
- **Atacante**: tem o bundle público, uma sessão válida de outra conta ou uma credencial de navegador do Supabase (`anon`/`authenticated`). Serve de referência para os cenários negativos.

**Dentro do escopo (F0, Decisão 15 §11)**

- Papéis do banco.
- Schemas `app` e `private` com acesso revogado para os papéis de navegador.
- A tabela de contas e a função que lê a conta da transação corrente.
- Exposição da Data API e GraphQL.
- O caminho de transação por conta no servidor.
- O contrato da chave mestra (KEK) versionada fora do banco.
- As verificações de CI: advisors de segurança, varredura do bundle, restrição de imports do código de cliente e bloqueio de variáveis sensíveis públicas.

**Fora do escopo**

- Borda HTTP `/api/v1`, `defineEndpoint`, headers e adapter do cliente (F1).
- DEK por conta, codec de campo cifrado e rotação (F2).
- Tabelas e rotas de domínio (F3).
- Importação `.nutridiet` (F4).
- Remoção da persistência local (F5).
- Homologação final e PITR (F6).
- Endurecimento do Supabase Auth (MFA, expiração do token, política de senha), que acompanha a borda na F1.
- Tabela de auditoria `private.audit_events`, que nasce com as primeiras escritas de domínio (F3). A F0 não tem operação de domínio a auditar.
- Encerramento e exclusão de conta.
- Travas de assinatura.

**Limites conhecidos** (Decisão 15 §8): a RLS protege contra bugs da aplicação, não contra o roubo da credencial do papel de runtime, porque quem tem a credencial pode definir o contexto da conta. A F0 não armazena dado pessoal novo além do vínculo entre os UUIDs de usuário e de conta.

**Contratos que continuam valendo**: o [ADR-009](../../docs/adr/ADR-009-nutridiet-principal.md), as Decisões 09–13 e o fluxo online atual (perfil profissional, catálogo e autorização de saves) seguem funcionando sem regressão até a transição.

## Clarifications

### Session 2026-10-25

- Q: A F0 deve aplicar a fundação no projeto Supabase remoto de produção `diet-maker`? → A: Sim. A F0 valida tudo localmente primeiro. Depois aplica as migrations da fundação no `diet-maker` com dry-run e evidência, ajusta Data API/GraphQL e provisiona a KEK nas variáveis sensíveis da Vercel (Production). A CI continua sem tocar o remoto.
- Q: Qual papel de banco as requisições devem usar? → A: Renomear `online_runtime` para `app_runtime`, mantendo um único papel. Grants e policies acompanham o rename. O usuário em `ONLINE_DATABASE_URL` muda no ambiente local, na Vercel e nos testes. (Refinado depois na especificação: a senha é rotacionada logo após o rename, conforme FR-001, e a variável nova entra por republicação da versão de produção atual, conforme FR-022a.)
- Q: De onde vem a KEK que vai envolver as chaves das contas? → A: De um chaveiro novo e separado, usado só para as contas. A `SERVER_MASTER_KEY` atual fica restrita ao perfil profissional e aos saves legados até a F5.
- Q: Onde a KEK das contas fica guardada na F0? → A: Em variáveis Sensitive da Vercel, apenas em Production, com backup DPAPI separado fora do repositório. Um KMS externo fica fora da F0.
- Q: A matriz de isolamento entre contas deve rodar na CI? → A: Sim, como gate. Os testes de integração (os novos e os atuais do schema `private`) rodam no mesmo Supabase local usado pelos advisors e bloqueiam a pipeline se falharem.

### Session 2026-10-26

- Q: O que acontece com a conta quando o usuário é excluído do Supabase Auth? → A: A exclusão é bloqueada (`ON DELETE RESTRICT`) enquanto houver conta. O encerramento de conta será um fluxo explícito, com retenção e crypto-shredding, em fase posterior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Banco nega acesso por padrão e isola contas (Priority: P1)

O mantenedor aplica as migrations da fundação num banco descartável. Ele comprova que o papel de runtime não lê nem grava nada sem uma conta definida na transação. Comprova também que, com uma conta definida, o papel não alcança linhas de outra conta e que os papéis de navegador não alcançam os schemas da aplicação.

**Why this priority**: Todas as fases seguintes dependem desse isolamento. Sem ele, qualquer bug de rota expõe outra conta.

**Independent Test**: Teste de integração contra o Supabase local que cria duas contas pelo papel administrativo e executa as consultas como o papel de runtime, com e sem contexto de conta. Não depende de rotas HTTP.

**Acceptance Scenarios**:

1. **Given** duas contas existentes, **When** o papel de runtime consulta `app.accounts` sem contexto de conta nem de usuário na transação, **Then** recebe zero linhas.
1a. **Given** a transação de resolução com o usuário da conta A, **When** o papel de runtime consulta ou cria a conta, **Then** vê ou cria somente a conta do usuário A, e uma segunda criação devolve a mesma conta.
2. **Given** a transação com a conta A, **When** o papel de runtime consulta, **Then** vê apenas a conta A.
3. **Given** a transação com a conta A, **When** tenta inserir ou alterar uma linha com a conta B, **Then** o banco rejeita a operação.
4. **Given** os papéis `anon` e `authenticated`, **When** tentam usar os schemas `app` ou `private`, **Then** não têm privilégio de uso nem de tabela.
5. **Given** o papel de runtime, **When** os atributos e privilégios são inspecionados, **Then** ele faz login, não herda papéis, não ignora RLS, não é superusuário, tem limites de tempo de comando e de transação ociosa e não tem `DELETE`, `TRUNCATE` ou `REFERENCES` em `app`.
6. **Given** um valor de conta malformado definido na transação, **When** o papel de runtime consulta, **Then** a operação falha fechada, sem retornar linhas.
7. **Given** um usuário do Auth com conta, **When** um administrador tenta excluí-lo, **Then** o banco recusa a exclusão e a conta permanece.

---

### User Story 2 - Bundle do navegador não conhece o banco (Priority: P1)

A cada push ou pull request, a CI compila a aplicação e falha se o código entregue ao navegador contiver qualquer um destes itens:

- endereço ou chave do Supabase;
- nome de variável sensível;
- nome qualificado de schema ou tabela da aplicação;
- nome de papel do banco.

A CI também falha se o código de cliente importar módulos de banco, Supabase ou servidor, ou se uma variável sensível usar prefixo público.

**Why this priority**: A Decisão 15 exige que o navegador não veja nada do banco. A verificação automática impede regressões silenciosas em todas as fases seguintes.

**Independent Test**: Executar a varredura sobre o build atual (deve passar) e sobre um build com uma referência proibida injetada (deve falhar com o arquivo e o padrão encontrados).

**Acceptance Scenarios**:

1. **Given** o build de produção, **When** a varredura roda, **Then** passa sem achados e lista os padrões verificados.
2. **Given** um arquivo do bundle contendo um padrão proibido, **When** a varredura roda, **Then** falha e informa arquivo e padrão, sem imprimir o valor de um segredo.
3. **Given** um componente ou hook importando diretamente `@supabase/*`, `pg`, `drizzle-orm` ou `@/lib/server/**`, ou um módulo de cliente que alcança `@supabase/*`, `pg`, `drizzle-orm/node-postgres`, `@/lib/server/**` ou `server-only`, **When** o lint ou o teste de arquitetura roda, **Then** falha e aponta o arquivo ou a cadeia.
4. **Given** uma variável sensível declarada com prefixo `NEXT_PUBLIC_` no código, em exemplos de ambiente ou na configuração, **When** a CI roda, **Then** falha.
5. **Given** os route handlers e módulos de servidor existentes, **When** as mesmas regras rodam, **Then** não há falso positivo.

---

### User Story 3 - Advisors de segurança a cada migration (Priority: P2)

A CI aplica todas as migrations num banco Supabase descartável e roda os advisors de segurança. A pipeline falha diante de qualquer alerta de segurança.

**Why this priority**: Os advisors detectam RLS desligada, schema exposto, função com `search_path` mutável e view que ignora RLS antes de a migration chegar a um projeto real.

**Independent Test**: Rodar a etapa sobre as migrations atuais e sobre uma migration de teste que cria uma tabela sem RLS num schema exposto. A primeira passa e a segunda falha.

**Acceptance Scenarios**:

1. **Given** as migrations do repositório, **When** a etapa roda, **Then** todas se aplicam do zero sem erro e os advisors não retornam alerta de segurança.
2. **Given** uma migration que introduz uma falha de segurança detectável, **When** a etapa roda, **Then** a pipeline falha e mostra o alerta.
3. **Given** alertas apenas de desempenho, **When** a etapa roda, **Then** eles aparecem no log sem bloquear a pipeline.

---

### User Story 4 - Um único caminho de transação por conta no servidor (Priority: P2)

O código de servidor que acessa dados da conta só consegue fazê-lo por uma função de transação que recebe a conta resolvida da sessão. Essa função define o contexto da conta apenas dentro da transação. O contexto nunca vaza para outra requisição que reaproveite a conexão.

**Why this priority**: Um caminho de acesso que esquece de definir a conta é a principal porta para vazamento entre contas quando houver tabelas de domínio.

**Independent Test**: Testes unitários do contrato da função, e um teste de integração que executa duas transações seguidas na mesma conexão (conta A e depois nenhuma conta) e comprova que a segunda não vê a conta A.

**Acceptance Scenarios**:

1. **Given** um identificador de conta inválido, **When** a função de transação é chamada, **Then** recusa antes de tocar no banco.
2. **Given** uma transação concluída com a conta A, **When** a mesma conexão executa uma nova transação sem conta, **Then** não vê dados da conta A.
3. **Given** um erro no corpo da transação, **When** ela termina, **Then** é desfeita e o contexto da conta não permanece na conexão.
4. **Given** um módulo de servidor do domínio, **When** tenta obter o pool ou o cliente do banco fora da função de transação, **Then** um teste de arquitetura falha.

---

### User Story 5 - Chave mestra versionada fora do banco (Priority: P3)

O mantenedor provisiona a KEK como segredo versionado da hospedagem, com backup separado. O servidor carrega e valida a KEK e recusa operar se ela faltar ou estiver malformada. Nenhuma cópia da KEK fica no banco, no Vault, no repositório ou no bundle.

**Why this priority**: A KEK só é usada para envolver DEKs a partir da F2, mas o contrato de configuração, o provisionamento e o backup precisam existir antes.

**Independent Test**: Testes unitários do carregador de configuração com chave ausente, malformada, com identificador inválido e válida. A varredura do bundle confirma que o nome da variável não aparece no cliente.

**Acceptance Scenarios**:

1. **Given** a KEK ativa ausente ou sem 32 bytes em Base64 canônico, **When** o servidor a carrega, **Then** falha fechado com mensagem que não revela o valor.
2. **Given** a configuração válida, **When** o servidor a carrega, **Then** expõe ao código de servidor o identificador da versão ativa e o material da chave, e o identificador não é secreto.
3. **Given** o banco, o Vault e o repositório, **When** são inspecionados, **Then** não contêm a KEK.
4. **Given** o procedimento documentado de backup e recuperação da KEK, **When** é executado em ambiente isolado, **Then** a chave restaurada é idêntica à original, conferida por impressão digital não reversível.

---

### User Story 6 - Projeto Supabase configurado para não expor a aplicação (Priority: P3)

Depois da validação local, o mantenedor aplica a fundação no projeto `diet-maker` com dry-run e renomeia o papel de runtime de forma coordenada com o deploy. Em seguida, verifica por comandos reproduzíveis e registra em evidência de validação:

- a região é São Paulo;
- a Data API não expõe os schemas `app` e `private`;
- o GraphQL está desabilitado;
- a conexão exige SSL;
- o fluxo online atual segue funcionando.

**Why this priority**: Sem essa configuração, a defesa das camadas anteriores depende de um único controle no banco remoto.

**Independent Test**: Executar as consultas e os comandos do runbook contra o projeto `diet-maker` e registrar o resultado sem credenciais ou valores secretos.

**Acceptance Scenarios**:

1. **Given** o projeto alvo, **When** a configuração da Data API é lida, **Then** `app` e `private` não estão entre os schemas expostos.
2. **Given** o projeto alvo, **When** a extensão e o endpoint GraphQL são verificados, **Then** estão desabilitados ou sem acesso para os papéis de navegador.
3. **Given** uma conexão sem TLS, **When** é tentada contra o banco remoto, **Then** é recusada.
4. **Given** o fluxo online atual, **When** a fundação é aplicada e o deploy com o novo usuário de banco termina, **Then** login, perfil profissional, catálogo e autorização de saves seguem funcionando em produção.
5. **Given** o dry-run das migrations, **When** é revisado antes da aplicação, **Then** lista apenas as migrations da fundação e nenhum comando destrutivo sobre dados existentes.

### Edge Cases

- `app.account_id` definido como string vazia, valor não UUID ou conta inexistente: zero linhas ou erro; nunca acesso amplo.
- Conexão reaproveitada pelo pooler em modo transação depois de uma transação com conta: o contexto não persiste.
- Comando longo ou transação ociosa do papel de runtime: o banco interrompe a sessão dentro dos limites definidos.
- Migration da fundação reaplicada num banco que já a tem: idempotente, sem erro e sem duplicar papéis, schemas ou policies.
- Bundle com a palavra "supabase" em conteúdo legítimo de terceiros: a lista de padrões distingue identificadores do projeto de texto genérico, e qualquer exceção fica documentada e restrita.
- Variável sensível renomeada com prefixo público apenas na Vercel, fora do repositório: o runbook inclui a conferência das variáveis do ambiente remoto, já que a CI não as enxerga.
- Docker indisponível na CI: a etapa de advisors falha explicitamente em vez de pular em silêncio.
- KEK definida com o mesmo valor da `SERVER_MASTER_KEY`: o carregador recusa (FR-014).
- Os dois papéis (`online_runtime` e `app_runtime`) existem ao mesmo tempo, ou nenhum deles existe: a migration falha sem alterar nada (FR-001).
- Rename aplicado e republicação falha: o rollback de FR-022a restaura o papel e a variável anteriores.
- Uma transação define `app.user_id` e `app.account_id` de contas diferentes: as policies de domínio usam apenas `app.account_id`, e a operação de resolução usa apenas `app.user_id`.

## Requirements *(mandatory)*

### Functional Requirements

**Banco: papéis e schemas**

- **FR-001**: O banco MUST ter um único papel de runtime para as requisições, `app_runtime`, obtido pelo rename de `online_runtime`. Ele mantém os grants e as policies atuais do schema `private` e tem as propriedades `LOGIN`, `NOINHERIT`, `NOBYPASSRLS` e não superusuário, `statement_timeout` de 5 s e `idle_in_transaction_session_timeout` de 10 s. A migration MUST ser idempotente: renomeia quando só `online_runtime` existe, não faz nada além de reaplicar os limites quando só `app_runtime` existe e falha explicitamente quando os dois existem ou quando nenhum existe. Logo depois do rename remoto, o mantenedor MUST definir uma senha nova para `app_runtime`, guardada no backup DPAPI e nunca no repositório. Essa rotação elimina a dependência do formato da senha antiga, já que um rename apaga senhas MD5.
- **FR-002**: O papel de runtime MUST NOT ter `DELETE`, `TRUNCATE` ou `REFERENCES` em tabelas do schema `app`.
- **FR-003**: O schema `app` MUST existir com dono `postgres`. `ALL` MUST estar revogado de `PUBLIC`, `anon` e `authenticated` nos schemas `app` e `private`, e o papel de runtime MUST ter apenas `USAGE` nos schemas e os grants mínimos por tabela.
- **FR-004**: Objetos futuros nos schemas `app` e `private` MUST NOT receber acesso automático de `PUBLIC`, `anon` ou `authenticated`. Os privilégios padrão por schema (`ALTER DEFAULT PRIVILEGES`) MUST revogar esse acesso onde o Postgres permite. Um teste de integração MUST varrer o catálogo e falhar diante de qualquer privilégio desses papéis em tabela, view, sequência ou função dos dois schemas, o que cobre o `EXECUTE` que o Postgres concede a `PUBLIC` por padrão global.
- **FR-005**: Migrations MUST ser aplicadas por um papel de migração (`postgres` via CLI/CI), nunca pela credencial de runtime. A aplicação MUST NOT ser configurada com credencial administrativa.

**Banco: contas e contexto**

- **FR-006**: MUST existir `app.accounts` com identificador próprio e `owner_user_id` único, ligado ao usuário do Supabase Auth. Esse modelo garante uma conta por usuário e mantém um ID distinto do usuário para equipes futuras. A ligação MUST usar `ON DELETE RESTRICT`: excluir no Auth um usuário que tem conta falha, e o encerramento de conta fica para um fluxo explícito posterior.
- **FR-007**: MUST existir uma função que devolve a conta da transação corrente a partir de `app.account_id`, com estas propriedades: `SECURITY INVOKER`, `search_path` vazio, `EXECUTE` revogado de `PUBLIC` e concedido apenas ao runtime. Valor ausente ou vazio MUST resultar em `NULL`. Nenhuma função criada pela fundação nos schemas `app` e `private` MUST usar `SECURITY DEFINER`.
- **FR-008**: Toda tabela do schema `app` MUST ter RLS habilitada e forçada, e uma policy restrita ao papel de runtime que compara `account_id` com a conta corrente em `USING` e `WITH CHECK`. Em `app.accounts`, a comparação usa o `id` da conta ou o usuário dono (FR-009a). O runtime recebe apenas `SELECT` e `INSERT` em `app.accounts`.
- **FR-009**: A criação da conta de um usuário MUST ser idempotente e acontecer apenas pelo servidor, a partir do usuário autenticado. Nenhum dado do navegador escolhe a conta. A integração desse fluxo com a sessão ocorre na F1; a F0 entrega a operação de repositório e seus testes.
- **FR-009a**: A resolução "usuário autenticado → conta" MUST acontecer sem ignorar a RLS. O servidor abre uma transação de resolução com o contexto local `app.user_id`, definido apenas a partir do usuário da sessão validada. Nessa transação, a policy de `app.accounts` permite ler e criar somente a linha cujo `owner_user_id` é esse usuário. A solução MUST NOT usar funções `SECURITY DEFINER` nem credencial que ignore RLS. Transações de dados usam apenas `app.account_id`, e sem nenhum dos dois contextos `app.accounts` retorna zero linhas.
- **FR-010**: As migrations da fundação MUST ser reaplicáveis sem erro e atômicas: uma falha não deixa estado parcial. Elas MUST NOT alterar policies, grants ou dados das tabelas `private` existentes, salvo o rename do papel em FR-001.
- **FR-010a**: Código em `src/`, testes em `tests/`, `.env.example`, `docs/setup/online-auth.md` e a Decisão 15 MUST passar a citar `app_runtime` no lugar de `online_runtime`. Ficam como estão as migrations já aplicadas, que são histórico imutável, e os registros de outros SDDs em `specs/`.

**Servidor: transação por conta**

- **FR-011**: O servidor MUST oferecer `withAccountTransaction(accountId, fn)`. A função valida o UUID antes de qualquer consulta, abre a transação, define `app.account_id` com escopo local à transação e entrega apenas o handle da transação ao chamador.
- **FR-012**: Nenhum módulo de `src/` MUST obter o pool ou o banco online diretamente, exceto o módulo de conexão e os módulos que definem as funções de transação: `withAccountTransaction`, a transação de resolução de conta e o `withOwnerTransaction` legado do schema `private`. Um teste de arquitetura MUST impor essa regra.
- **FR-013**: Todo módulo novo de servidor da fundação MUST importar `server-only`.

**Chave mestra**

- **FR-014**: O servidor MUST carregar a KEK das contas de um chaveiro de variáveis de servidor novo e separado da `SERVER_MASTER_KEY`. O chaveiro tem um identificador ativo, não secreto, e o material de 32 bytes em Base64 canônico por versão. O carregamento MUST falhar fechado quando faltar algo, quando o formato for inválido ou quando o material for igual ao da `SERVER_MASTER_KEY`, sem expor o valor em erro ou log. A `SERVER_MASTER_KEY` MUST continuar restrita ao perfil profissional e aos saves legados.
- **FR-015**: A KEK das contas MUST ficar em variáveis Sensitive da Vercel restritas a Production, com backup DPAPI separado fora do repositório. Ela MUST NOT ser gravada no banco, no Supabase Vault, no repositório, em logs, no bundle ou nos ambientes Preview e Development da Vercel.
- **FR-016**: MUST existir um procedimento documentado de geração, armazenamento na hospedagem, backup separado e restauração da KEK, verificável por impressão digital não reversível.

**CI e isolamento do cliente**

- **FR-017**: A CI MUST compilar a aplicação e varrer todos os arquivos estáticos entregues ao navegador: os assets estáticos e as páginas e payloads pré-renderizados. A varredura MUST falhar se encontrar qualquer um destes itens:
  - URL de projeto Supabase (`*.supabase.co`, `*.supabase.com`, que contém o ref) e, quando o ref estiver disponível no ambiente da verificação, o ref isolado;
  - prefixos de chave `sb_publishable_` e `sb_secret_`;
  - os nomes explícitos das variáveis de FR-019. A regra por fragmento de nome vale só para a verificação de prefixo público, porque no bundle ela geraria falsos positivos em código de terceiros;
  - identificadores qualificados `app.<tabela>` e `private.<objeto>`, derivados automaticamente das migrations, para que objetos novos entrem sem editar a lista;
  - nomes dos papéis de banco (`app_runtime`, `online_runtime`).

  O relatório MUST indicar arquivo e padrão sem imprimir valores. Respostas dinâmicas não são cobertas por esta varredura; a allowlist de saída delas pertence à F1.
- **FR-018**: O lint MUST proibir imports de `@supabase/*`, `pg`, `drizzle-orm` e `@/lib/server/**` em `src/components/**` e `src/hooks/**`. Um teste de arquitetura MUST percorrer o grafo de imports a partir de todo arquivo com a diretiva `'use client'`, de `src/components/**` e de `src/hooks/**`. O teste MUST falhar se o grafo alcançar `@supabase/*`, `pg`, `drizzle-orm/node-postgres`, `@/lib/server/**` ou um módulo com `import 'server-only'`, apontando a cadeia de imports. O `drizzle-orm` núcleo e o `drizzle-orm/pglite` ficam permitidos no grafo transitivo, porque o banco local PGlite roda no navegador (`src/lib/infrastructure/local-db/**`); o import direto de `drizzle-orm` em `src/components/**` e `src/hooks/**` continua proibido pelo lint. (Emenda de T031, aprovada pelo mantenedor.)
- **FR-019**: As variáveis sensíveis são `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ONLINE_DATABASE_URL`, `ONLINE_DATABASE_SSL_CA_B64`, `SERVER_MASTER_KEY`, `SERVER_MASTER_KEY_ID`, as variáveis da KEK das contas e qualquer nome que contenha `KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `DATABASE` ou `SUPABASE`. A CI MUST falhar quando uma delas aparecer com o prefixo `NEXT_PUBLIC_` em `src/`, nos arquivos `.env*` versionados, em `next.config.*` ou nos workflows.
- **FR-020**: A CI MUST aplicar todas as migrations do zero num Supabase local descartável e rodar os advisors de segurança. A pipeline MUST falhar com qualquer achado de nível `warn` ou `error`. Os advisors de desempenho rodam sem bloquear e ficam no log. As etapas novas MUST rodar nos mesmos gatilhos da CI atual (push e pull request para `main`), com a versão da CLI do Supabase fixada.
- **FR-020a**: A CI MUST rodar, no mesmo Supabase local, todos os testes de integração de banco: isolamento entre contas, atributos do papel, vazamento de contexto e os testes atuais do schema `private`. Uma falha MUST bloquear a pipeline. Os testes MUST falhar, e não ser pulados, quando a etapa de CI fornecer as variáveis de banco local.
- **FR-021**: As novas etapas de CI MUST NOT usar credenciais de produção nem alterar projetos remotos.

**Projeto remoto**

- **FR-022**: MUST existir um runbook que verifica, por comandos reproduzíveis, estes itens, sem registrar segredos:
  - a região;
  - os schemas expostos pela Data API;
  - o estado do GraphQL;
  - a exigência de SSL;
  - a conexão do runtime com verificação de certificado e hostname;
  - as variáveis de ambiente da hospedagem: nomes, ambientes e marcação Sensitive.

  O resultado de cada execução MUST ser registrado em `validation-report.md` neste diretório.
- **FR-022a**: Depois da validação local completa, o mantenedor MUST aplicar a fundação no projeto `diet-maker`, nesta ordem:
  1. revisar o dry-run;
  2. desabilitar a Data API e confirmar a exigência de SSL;
  3. provisionar a KEK das contas nas variáveis Sensitive da Vercel (Production) e guardar o backup separado;
  4. gerar a nova senha do runtime, guardar no backup DPAPI e atualizar `ONLINE_DATABASE_URL` com o usuário `app_runtime`;
  5. aplicar as migrations;
  6. definir a nova senha em `app_runtime`;
  7. republicar a versão de produção atual, sem código novo, para carregar as variáveis;
  8. executar o runbook e o smoke do fluxo online.

  O código da F0 chega à produção pelo fluxo normal de merge e não depende desse passo, porque o runtime atual não cita o nome do papel. A janela entre a aplicação da migration (passo 5) e a republicação pronta (passo 7) MUST ser inferior a 10 minutos e ficar registrada na evidência. Uma falha no smoke MUST acionar o rollback documentado: rename de volta, senha anterior restaurada do backup, variável anterior restaurada e nova republicação.
- **FR-022b**: Toda ação no projeto remoto ou na Vercel (migration, configuração, variáveis, republicação) MUST receber confirmação explícita do mantenedor no momento da execução. O smoke que exige login em produção MUST ser executado pelo mantenedor com uma conta de teste sob seu controle.
- **FR-023**: O fluxo online atual (Auth, perfil profissional, catálogo e autorização de saves) MUST continuar passando nos testes existentes, sem alteração de comportamento.

### Non-Functional Requirements

- **NFR-001**: Os testes novos MUST residir em `tests/`, ser determinísticos e não mutar dados externos. Os testes de integração rodam apenas contra o Supabase local em `localhost:54322` e se recusam a rodar com outro destino.
- **NFR-002**: As etapas de Supabase local (advisors e integração) e a varredura do bundle MUST acrescentar no máximo 5 minutos à pipeline.
- **NFR-003**: Mensagens de erro de configuração e de CI MUST ser acionáveis: dizem o que falta e onde, sem revelar valores.
- **NFR-004**: A documentação MUST distinguir o que foi proposto, implementado e validado, conforme a constituição (Princípio V).

### Key Entities

- **Conta (`app.accounts`)**: ambiente de dados de um profissional, com ID próprio, usuário dono único e data de criação. É a raiz do isolamento de todas as tabelas de domínio futuras.
- **Contexto de conta da transação** (`app.account_id`): valor local à transação que as policies comparam. Só existe dentro de `withAccountTransaction`.
- **Contexto de usuário da transação** (`app.user_id`): valor local à transação de resolução de conta, vindo da sessão validada. Só dá acesso à linha de `app.accounts` do próprio usuário.
- **Papel de runtime**: identidade do banco usada pelas requisições, com privilégios mínimos.
- **KEK versionada**: chave mestra com identificador público e material secreto, fora do banco. Envolverá as DEKs das contas na F2.
- **Relatório de varredura do bundle**: lista de padrões verificados e achados por arquivo, sem valores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das consultas do papel de runtime sem conta definida retornam zero linhas, e 100% das escritas com conta divergente são rejeitadas, na matriz de integração executada pela CI.
- **SC-002**: 0 ocorrências dos padrões proibidos no bundle de produção. Um padrão injetado de propósito é detectado em 100% das execuções de teste.
- **SC-003**: 0 alertas de segurança dos advisors sobre as migrations do repositório.
- **SC-004**: Os papéis de navegador têm 0 privilégios nos schemas `app` e `private`.
- **SC-005**: A suíte existente (unitária, integração local e rotas) passa sem regressão do fluxo online atual.
- **SC-006**: A pipeline com as novas etapas termina em até 5 minutos a mais que a atual.
- **SC-007**: O backup da KEK é restaurado em ambiente isolado com impressão digital idêntica numa execução do procedimento.

## Assumptions

- O projeto Supabase dedicado `diet-maker` já existe em `sa-east-1`, linkado ao repositório, com o pooler Supavisor em modo transação. Não será criado um projeto novo.
- A hospedagem é a Vercel (região `gru1`, plano Hobby). O "secret manager da hospedagem" é o conjunto de variáveis Sensitive da Vercel em Production (confirmado na clarificação).
- A CI é o GitHub Actions existente, com Docker disponível no runner `ubuntu-latest` para o Supabase local.
- A CLI do Supabase 2.122.0 está disponível localmente via `npx` e inclui `supabase db advisors`. Ela não está declarada no `package.json`, então a CI precisa fixar a versão explicitamente (FR-020).
- O workflow de schema é o imperativo (migrations em `supabase/migrations/`), como hoje.
- Não há usuários em produção. Mesmo assim, o fluxo online atual não pode quebrar.
- `zod` ainda não é dependência. Ele só é necessário a partir da F1.
- A instalação local do Spec Kit está na versão 0.13.0, e a versão publicada mais recente é a 1.2.3. Este SDD usa a instalação local do projeto.
