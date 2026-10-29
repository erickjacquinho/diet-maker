# Implementation Plan: Corrigir inconsistências dos fluxos auditados

**Branch**: checkout preservado; nenhuma criada · **Date**: 2026-10-25 · **Spec**: [spec.md](spec.md)
**Status**: Implementada e verificada localmente em2026-10-25; tarefas em [tasks.md](tasks.md), evidências e convergência em [validation-report.md](validation-report.md). O plano abaixo preserva as decisões aprovadas.

## Summary

Reconciliar contratos, corrigir o harness existente, verificar o inventário completo de páginas e resolver a integração local mediante diagnóstico demonstrado. Reutilizar T008 do dashboard como dona do aceite real. Nenhum novo módulo de produto ou integração financeira.

## Technical Context

- **Language/Version**: TypeScript 5.7, React 19, Next.js App Router 15 conforme `package.json` atual.
- **Primary Dependencies**: Supabase Auth, pg e Drizzle existentes; nenhuma adição.
- **Storage**: PGlite/IndexedDB como área local, `.nutridiet` principal conforme ADR-009, PostgreSQL privado para catálogo/chaves; conteúdo clínico permanece local.
- **Testing**: Vitest 4, Testing Library, Playwright 1.62 e testes de banco existentes. Auth mockado no teste de servidor não equivale ao login real.
- **Target Platform / Project Type**: aplicação web desktop ≥1024px; desenvolvimento atual Windows.
- **Performance Goals**: preservar contratos atuais; censo de arquivos somente nos testes.
- **Constraints**: menor privilégio, backend autoriza, dados/arquivos/processos/dirty work preservados; nenhuma alteração remota.
- **Scale/Scope**: cinco achados, quatro histórias, 24 páginas no censo atual; contagem futura deriva dos arquivos.

## Constitution Check

| Princípio | Antes da pesquisa | Após design | Aplicação |
| --- | --- | --- | --- |
| I Atomic Design | Passa | Passa | Nenhum componente ou dependência UI novo. |
| II DS canônico | Passa | Passa | Nenhum token/categoria/perfil alterado. |
| III Desktop/a11y | Passa | Passa | Preservar teclado/foco e escopo desktop. |
| IV Contratos antes de código | Passa | Passa | Cenários negativos precedem implementação; testes sob `tests/`, dados sintéticos próprios. |
| V Execução SDD | Passa | Passa | Validar este pacote antes de `/speckit-implement`; nenhuma conformidade do código inferida dos documentos. |

Nenhuma exceção necessária. Setup de teste que altera membership global deve ser adaptado antes de execução, preservando estado preexistente.

## Project Structure

### Documentation (this feature)

```text
specs/25-10-26-corrigir-inconsistencias-fluxos/
├── .sdd-context.json
├── spec.md
├── clarification.md
├── checklists/{requirements,contracts-evidence}.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/{correction-scope,route-inventory}.md
├── quickstart.md
├── tasks.md
└── analysis.md
```

`validation-report.md` será criado durante implementação com resultados efetivos; não é prova já produzida.

### Sources and consumers

```text
docs/prd/PRD.md
docs/adr/ADR-007-screen-architecture-and-navigation.md
docs/setup/online-auth.md
specs/10-10-26-integrar-supabase-contas-saves/contracts/{pages-and-states,backend-api}.md
tests/routes/{route-acceptance-matrix.ts,route-smoke.test.tsx,navigation.test.tsx,behavior-preservation.test.tsx}
tests/browser/{library.spec.ts,fixtures/library-fixture.ts,helpers/profile-session.ts}
tests/browser/{profile-save-load,backup-persistence,clinical-persistence,diet-offline-persistence,component-adequation,settings-saves,online-auth}.spec.ts
tests/server/{online-db.integration,online-db.repository,save-registry,single-save-policy,request-security}.test.ts
src/lib/server/{online-db/repository.ts,online-db/client.ts,request-security.ts}
src/app/api/saves/route.ts
supabase/migrations/
specs/23-10-26-dashboard-rotina-assinatura/{tasks,implementation-log}.md
```

`playwright.config.ts` já aceita host/porta/reuso por ambiente. `next.config.ts` só entra se indispensável para isolar build de uma instância própria sem disputar `.next`. Nenhum export de produção será criado para suportar o inventário.

## Phase 0 — Research

[research.md](research.md) consolida precedência, helpers, grants por coluna, Spec Kit e consulta Jev. Pesquisa delegada somente leitura confirmou o INSERT de 13 colunas e o lock anterior. Não há escolha arquitetural em aberto. Causa operacional do 503 é objeto da execução planejada, não decisão presumida.

## Phase 1 — Design & Contracts

### A. Contratos coerentes — US1 / F1,F3

Editar trechos conflitantes do PRD, ADR-007 e contratos de 10-10. PRD deixa de prometer escala em lote, reconhece PGlite adotado e referencia proteção do save sem schema duplicado. ADR-007 registra rotina no Início e administração completa em Configurações → Saves, com assinatura informativa e logout na sidebar.

Indicar supersessão de regras antigas, preservando decisões datadas e logs. `docs/setup/online-auth.md` precisa conciliar introdução pré-deploy e relato posterior de publicação: este último deve ser datado histórico, sem afirmar disponibilidade remota atual. Examinar referências diretamente afetadas; não reescrever SDDs arquivados.

### B. Diagnóstico e reparo mínimo — US4 / F5

1. Confirmar conexão loopback e role efetiva sem imprimir DSN; identificar código realmente executado.
2. Reproduzir cadastro com conta/save sintéticos, capturando etapa, requestId e SQLSTATE/erro técnico sanitizado. Wrapping/configuração pode falhar antes do SQL; 503 não prova grant ausente.
3. Comparar migrations pertinentes, incluindo `20261011002435_online_account_saves.sql` e `20261022120000_professional_profile_and_save_label_updates.sql`. Não reaplicar a primeira cegamente: contém REVOKE amplo.
4. Conferir USAGE, SELECT/RETURNING, INSERT nas 13 colunas, UPDATE necessário ao `FOR UPDATE` do perfil, políticas, RLS/FORCE RLS e `app.owner_id` transacional. Falso `has_table_privilege` pode ser correto com grants por coluna.
5. Drift demonstrado: reconciliar apenas delta local conforme migrations vigentes, transação e rollback em erro quando aplicável, sem falsificar histórico. Estado correto: não alterar grants. Defeito de código/configuração demonstrado: regressão focada antes da menor correção nessa etapa. Falha não reproduzida: manter aceite bloqueado sem reparo especulativo.
6. Revalidar cadastro, autorização, retry/idempotência e recusa entre owners com runtime restrito. Nunca runtime admin, GRANT ALL, BYPASSRLS, SECURITY DEFINER, remoção de lock ou desativação de RLS.

Reutilizar `save-registry` e `online-db.*`; complementar testes para todas as colunas e o lock onde houver lacuna. Se nova mudança versionada for comprovadamente necessária, seguir skill Supabase e CLI descoberta por `--help`; não inventar migration ou aplicá-la remotamente. Nenhuma mudança de schema clínico é permitida.

### C. Biblioteca e callers — US2 / F2

Mapear consumidores antes de alterar `createProfileSession`, `loadLegacyProfileSession` e `openRememberedSave`. Eles ainda buscam comandos de save diretamente no dashboard. Reutilizar esses helpers entrando em Configurações → Saves, aguardando runtime ativo e fechando modal para voltar ao fluxo; não duplicar helpers por suíte.

No teste de biblioteca, confirmar alimento, concluir checkpoint e conferir conteúdo via `readPrimarySave`/`decryptBrowserSave` em memória. Recarregar e reabrir o mesmo arquivo autorizado antes de verificar nome, porção, três macros e ausência das chaves legadas. Fixture usa pickers/handles controlados em OPFS; prova arquivo do harness, não gravação externa escolhida manualmente.

A sessão real deve incluir criar/gravar/reabrir arquivo externo de teste sem substituir pickers. Se precisar excluir cache para provar recuperação, somente contexto sintético isolado, reimportando o mesmo arquivo; nunca limpar armazenamento do usuário ou banco compartilhado.

### D. Inventário de rotas — US3 / F4

Enriquecer minimamente a matriz existente com natureza, destino/parâmetros, estados aplicáveis e referências de evidência. [route-inventory.md](contracts/route-inventory.md) lista o conjunto atual, sem atestar execução dos testes citados.

No teste Node/Vitest, enumerar `src/app/**/page.tsx`, normalizar separadores e comparar conjuntos com matriz; rejeitar duplicatas, ausentes/extras e rota inválida. Grupos de rota não acrescentam segmento; preservar parâmetros dinâmicos. Não construir framework para rotas interceptadas/paralelas ausentes do censo atual.

Cenários negativos de omissão/duplicata/extra/renomeado precedem a correção e usam listas sintéticas no próprio teste, sem criar/remover páginas do produto. Helper local basta. Renomear inspeções estáticas e remover alegações de navegação/comportamento baseadas em regex agregada; regras visuais já têm validadores próprios.

### E. Aceite e evidência — US4 / transversal

Após ambiente e harness válidos, preparar save sanitizado real pelo produto; iniciar sessão de aceite com esse save já existente, sem interceptar Auth/catálogo/cadastro/authorize. Comparar sete dias e lista com Agenda; navegar, trocar/fechar/bloquear arquivo e trocar conta, sem mostrar dados anteriores.

Janela de ausência de mutações começa após login/cadastro/abertura; autorizações necessárias são classificadas à parte porque `/authorize` usa POST. Registrar chamadas/redações sem persistir conteúdo das respostas ou grants. Screenshots devem ser sanitizados; trace/HAR de autenticação ficam desativados.

Uma tarefa deste SDD coordena a T008 existente e atualiza os dois registros de evidência. Não adicionar outro aceite concorrente na feature antiga. Falha mantém T008 aberta; novo log corrige a atribuição especulativa de privilégio preservando o relato original.

## Validation Strategy

- Contratos/casos negativos antes da correção; teste determinístico de inventário, regressões de backend pertinentes, type-check e lint dos arquivos tocados.
- Playwright biblioteca e todos os consumidores do helper alterado; nenhuma suíte omitida silenciosamente. Verificar serviços antes; skip ambiental não é sucesso.
- Sessão real com arquivo externo e T008 separadas de OPFS controlado e teste de servidor com Auth mockado.
- Busca dirigida/revisão dos contratos e referências; falhas globais preexistentes são relatadas separadamente.
- [quickstart.md](quickstart.md) define comandos e aceites; nenhum foi executado nesta fase de planejamento.

## Risks & Recovery

| Risco | Controle e recuperação |
| --- | --- |
| Diagnóstico falso de grant | Operação inteira, colunas e SQLSTATE antes de mudar permissões. |
| Reaplicar SQL antigo remover grants posteriores | Comparar migrations/delta; transação e verificação posterior. |
| Perda de save/segredos | Sem reset/rotação; fixtures próprias, nenhuma credencial em log. |
| Helper compartilhado quebrar consumers | Inventário de callers e regressão de todos os afetados. |
| Colisão de build/Origin | Reusar instância compatível; se própria, dist isolado e ajustes transitórios restaurados. |
| Setup de teste alterar role global | Remover/restringir GRANT/REVOKE de membership global antes de executar no ambiente compartilhado. |
| Alegar prova acima da observada | Seis camadas, resultados/limites explícitos e T008 aberta se faltar evidência. |

Rollback restaura apenas ACL/configuração capturada previamente, sem apagar novos dados nem desfazer trabalho alheio. Correção documental/harness mantém diff restrito. Nenhuma violação de complexidade constitucional prevista.
