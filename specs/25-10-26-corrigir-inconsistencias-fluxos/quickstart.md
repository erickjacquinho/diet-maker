# Quickstart de validação futura

**Estado**: guia para implementação após aprovação, não registro de testes executados. Rodar na raiz `C:\Programmer\diet-maker` com a âncora `SPECIFY_FEATURE_DIRECTORY=specs/25-10-26-corrigir-inconsistencias-fluxos`.

## 1. Pré-condições e preservação

1. Ler spec/plan/tasks e capturar `git status --short`. Preservar trabalho anterior e processos ativos. Registrar ambiente, origem e checkout efetivamente servido, sem ler/imprimir arquivos de segredo por inteiro.
2. Confirmar Auth/PostgreSQL local disponíveis e conexão de runtime restrita. Descobrir CLI Supabase por `--help` antes de usá-la. Não resetar DB, provisionar remoto ou reaplicar migration indiscriminadamente.
3. Usar credenciais de teste já autorizadas e helpers existentes, sem reproduzi-las no relatório. Se necessária conta sintética isolada, usar Mailpit e domínio de teste, sem enviar a terceiros. Dois owners de teste podem validar isolamento, respeitando a política de um save por owner.
4. Revisar setup/teardown dos testes de banco antes de executar: `online-db.integration.test.ts` hoje faz GRANT/REVOKE de membership global. Remover essa dependência em favor de conexão/SET LOCAL ROLE em transação própria onde suportado; nunca revogar membership preexistente. Limpeza deve atingir somente IDs criados pela execução, ou usar rollback, preservando quaisquer dados anteriores.
5. Manter traces desativados, sem HAR/dumps de respostas com chave. Persistir apenas etapas, status e erros sanitizados. Falta de pré-requisito bloqueia a prova correspondente.

## 2. Diagnóstico do cadastro503

Conferir endpoint loopback/role/migrations efetivas, grants de cada coluna do INSERT e pré-requisitos de lock do perfil, SELECT/RETURNING, RLS e owner transacional. Capturar etapa e erro original seguro. A ausência de grant de tabela não é prova suficiente contra grants por coluna. Nenhuma consulta viva foi executada para produzir este guia.

Executar os testes abaixo **após** isolar setup e configurar as variáveis locais de teste já previstas pelo projeto (`LOCAL_SUPABASE_DB_URL` e runtime), sem imprimir valores. Vitest marcado skipped por falta de variável não conta como prova de integração.

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/25-10-26-corrigir-inconsistencias-fluxos'
npx vitest run tests/server/online-db.integration.test.ts tests/server/online-db.repository.test.ts tests/server/save-registry.test.ts tests/server/single-save-policy.test.ts tests/server/request-security.test.ts
```

Esperado: cadastro/autorização por papel restrito, retry/idempotência corretos, ausência de owner e outro owner recusados, sem acesso de browser roles ao schema privado. Aplicar só reparo demonstrado; repetir verificações e registrar antes/depois sanitizados. Se já correto, registrar no-op com evidência.

## 3. Inventário e checagens técnicas

```powershell
npx vitest run tests/routes/route-smoke.test.tsx tests/routes/navigation.test.tsx tests/routes/behavior-preservation.test.tsx
npm run type-check
git diff --check
```

Esperado: conjunto real completo (24 no censo atual), duplicatas/omissão/extra/rename rejeitados pelos cenários negativos, estados adequados a aliases/dinâmicas. Regex estática não é classificada como navegação. Rodar ESLint somente nos arquivos TS/TSX tocados, com seus caminhos literais, e buscas dirigidas de escala/`.diet`/`/saves` nos contratos alterados. Menções históricas e URLs de API `/api/saves` são válidas, não fazer substituição global cega.

## 4. Navegador e callers

Preferir servidor ativo cujo checkout e `APP_ORIGIN` correspondam ao teste. Exemplo **somente se a instância confirmada for `http://localhost:3000`**:

```powershell
$env:PLAYWRIGHT_HOST='localhost'
$env:PLAYWRIGHT_PORT='3000'
$env:PLAYWRIGHT_REUSE_SERVER='1'
npx playwright test tests/browser/library.spec.ts tests/browser/profile-save-load.spec.ts tests/browser/backup-persistence.spec.ts tests/browser/clinical-persistence.spec.ts tests/browser/diet-offline-persistence.spec.ts tests/browser/component-adequation.spec.ts tests/browser/settings-saves.spec.ts tests/browser/online-auth.spec.ts tests/browser/online-layout.spec.ts tests/browser/profile-session-gate.spec.ts tests/browser/online-saves.spec.ts --config=playwright.config.ts
```

Se a origem/checkout diferirem, ajustar somente o processo de teste ou iniciar instância própria com porta e dist isolados. `NEXT_DIST_DIR` não é consumido pelo `next.config.ts` atual; não presumir que só definir a variável isola build. Se indispensável, incluir suporte mínimo em `next.config.ts`, documentar no diff e preservar padrão `.next`. Nunca usar duas instâncias gravando o mesmo dist nem parar instância do usuário. Restaurar variáveis/ajustes transitórios e encerrar somente processos criados pela execução.

Esperado biblioteca: abrir save por Configurações → Saves, criar alimento, checkpoint concluído, arquivo do harness contém valores, reload, abrir mesmo save autorizado e recuperar nome/porção/macros; três chaves legadas continuam null. Não depender de botão direto no dashboard. Todos os consumidores alterados devem passar; `settings-saves` pode continuar tendo cenários controlados declarados como tal.

## 5. Sessão real e T008 original

1. Preparar conta de teste e arquivo externo sanitizado pela interface, com um save por owner. Gravar checkpoint, fechar e reabrir esse mesmo arquivo sem simular pickers ou API, conferindo conteúdo. Nunca usar arquivo clínico pessoal.
2. Iniciar a janela de aceite com save já existente. Registrar início depois de login/cadastro/abertura; observar rotas/status sem gravar respostas sensíveis.
3. Comparar sete dias e próximas ações do Início com Agenda, incluindo datas próprias por tipo e vazios. Conferir navegação e proteção de contexto ao fechar/bloquear/reabrir e trocar entre contas de teste. Não criar segundo registro por owner para forçar troca.
4. Abrir Assinatura pelo Início e retornar foco; nenhuma informação financeira fictícia ou mutação causada por leitura. Separar `POST /authorize` de mutações clínicas/cadastro: método POST isolado não basta para classificar gravação.
5. Atualizar T008 e log em `specs/23-10-26-dashboard-rotina-assinatura/` somente se todos os critérios passarem; acrescentar correção da hipótese de grant preservando o histórico. Caso contrário, manter pendente com etapa bloqueadora.

## 6. Registro de execução

Criar `validation-report.md` nesta feature com achado → tarefa → requisito → evidência → resultado. Separar seis camadas de [correction-scope.md](contracts/correction-scope.md), incluindo explicitamente paridade remota não verificada. Registrar comandos, datas, dados sintéticos e limites de interceptações. Não declarar completo com skip, mock ou ausência de erro visual apenas.
