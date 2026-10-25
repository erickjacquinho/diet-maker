# Tasks: Corrigir inconsistências dos fluxos auditados

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contratos](contracts/correction-scope.md), [quickstart.md](quickstart.md).
**Estado**: 0/15 executadas. Este SDD ainda requer validação humana; depois usar `/speckit-implement`.
**Formato**: ID → skill principal → paralelismo → história → ação/arquivos → verificação. A atribuição logo após ID segue a skill `sdd`.
**Skills**: `supabase`, `webapp-testing`, `ponytail:ponytail` e `code-reviewer-expert` constam do catálogo da sessão. `general` somente para manutenção textual de contratos sem skill específica. Nenhuma tarefa autoriza SQL remoto, deploy, reset, rotação de chaves ou descarte de trabalho anterior.

## Phase 1 — Setup e segurança da execução

- [ ] T001 [skill: $ponytail:ponytail] Capturar baseline e preparar registro em `specs/25-10-26-corrigir-inconsistencias-fluxos/validation-report.md`: dirty work, processos/origem/checkout, arquivos afetados e callers de `tests/browser/helpers/profile-session.ts`; confirmar reuso de servidor compatível via `playwright.config.ts`. Se indispensável, suporte mínimo opcional de dist isolado em `next.config.ts`, mantendo padrão. Verificação: nenhuma instância do usuário interrompida, nenhuma escrita concorrente em `.next`, diff/baseline e limites sanitizados registrados. [FR-001, NFR-001–003]

## Phase 2 — Fundação da prova real

Estas tarefas resolvem a dependência ambiental US4 antes dos testes browser. Documentação US1 e inventário US3 podem ser preparados enquanto há bloqueio ambiental; o aceite final permanece pendente.

- [ ] T002 [skill: $supabase] Diagnosticar localmente F5 seguindo `plan.md §B` em `src/app/api/saves/route.ts`, `src/lib/server/online-db/{repository,client}.ts`, `request-security.ts` e migrations pertinentes; registrar etapa/SQLSTATE sanitizados e comparação de grants por coluna, lock do perfil, owner e RLS no `validation-report.md`. Verificação: falha reproduzida ou indisponibilidade descrita; nunca concluir falta de INSERT por consulta de tabela isolada. Acrescentar ao `specs/23-10-26-dashboard-rotina-assinatura/implementation-log.md` complemento da hipótese sem apagar histórico. [FR-001, FR-007, FR-010, NFR-001/003]
- [ ] T003 [skill: $supabase] Antes do reparo, acrescentar regressão da causa/lacuna reproduzida em `tests/server/online-db.integration.test.ts` e/ou `tests/server/save-registry.test.ts`, reutilizando `online-db.repository.test.ts`; cobrir todas as colunas inseridas e lock pertinente sem confundir privilégio de tabela/coluna. Remover dependência de GRANT/REVOKE de membership global do harness, mantendo conexões/role locais a cada execução/transação e dados próprios. Verificação: caso falha pela causa esperada antes da correção, ou checks existentes bastam e no-op é documentado; nenhum setup apaga dados prévios ou altera privilégios globais. [FR-007/008, NFR-001–003]
- [ ] T004 [skill: $supabase] Aplicar apenas reparo local demonstrado por T002/T003 conforme migrations vigentes e `docs/setup/online-auth.md`; código/configuração só na etapa comprovada de `src/lib/server/online-db/` ou `src/app/api/saves/route.ts`. Se contrato versionado precisar ajuste, criar migration pelo fluxo Supabase, sem editar histórico aplicado. Verificação: testes de cadastro/autorizar/retry/owner e grants mínimos passam; sem reset, GRANT ALL, BYPASSRLS ou chave admin no runtime. Estado já correto exige zero alteração com evidência; bloqueio mantém tarefa aberta. [FR-008, NFR-001–003]

## Phase 3 — US1: contratos coerentes (P1)

**Independent Test**: revisão dos trechos F1/F3 sem contradição normativa, mantendo registros históricos identificados.

- [ ] T005 [skill: general] [P] [US1] Corrigir referências ativas de escala, `.diet`, adoção PGlite/proteção do arquivo e catálogo no dashboard em `docs/prd/PRD.md` e `docs/adr/ADR-007-screen-architecture-and-navigation.md`; remeter ao ADR-009/refs canônicos e registrar evolução de Settings → Saves sem redesenho. Verificação: busca dirigida encontra somente menções históricas explícitas dos recursos removidos; nenhuma promessa de cifra da área local ou reintrodução funcional. [FR-002, NFR-001/002]
- [ ] T006 [skill: general] [P] [US1] Alinhar `specs/10-10-26-integrar-supabase-contas-saves/contracts/{pages-and-states,backend-api}.md` com entrada `/dashboard`, aliases/parâmetros e gestão no modal; resolver introdução/estado contraditórios de `docs/setup/online-auth.md` datando o relato histórico. Revisar referências diretamente afetadas. Verificação: nenhum destino antigo tratado como atual, logs históricos preservados, nenhum status remoto atual alegado sem prova; links locais alvo resolvem. [FR-002/003/010, NFR-002/003]

## Phase 4 — US2: biblioteca após recarga (P1)

**Independent Test**: mesmo alimento e valores após checkpoint, reload e reabertura; zero chaves legadas.

- [ ] T007 [skill: $webapp-testing] [US2] Escrever primeiro o cenário corrigido em `tests/browser/library.spec.ts`/`fixtures/library-fixture.ts` para checkpoint confirmado, conteúdo do arquivo, reload e abertura do mesmo save, comparando nome, porção e três macros com ausência de chaves legadas; declarar pickers OPFS simulados. Verificação: falha útil antes de corrigir o helper/expectativa antiga, sem esconder503 nem introduzir mocks de autorização para satisfazer a prova real. [FR-004/010, NFR-001/003]
- [ ] T008 [skill: $webapp-testing] [US2] Atualizar `tests/browser/helpers/profile-session.ts` para criação/importação/abertura em Configurações → Saves com runtime pronto e retorno à página, mantendo API dos helpers e reutilizando `readPrimarySave`/`decryptBrowserSave`. Ajustar seletores diretos dos consumidores mapeados em `plan.md §C` quando necessário. Verificação: nenhum caller depende dos comandos removidos do dashboard; sem navegação duplicada, concessão de autorização no cliente ou impressão de grants. [FR-004, NFR-001/002/004]
- [ ] T009 [skill: $webapp-testing] [US2] Executar biblioteca e todos os consumidores do helper listados no `quickstart.md §4`, além das guardas/aliases existentes; registrar resultados, interceptações e persistência OPFS no `validation-report.md`. Verificação: suítes afetadas passam sem skips silenciosos; alimento reaberto mantém os valores e chaves legadas ausentes; bloqueio ambiental é relatado como bloqueio. [FR-003/004/010, NFR-003/004]

## Phase 5 — US4: aceite real da integração e dashboard (P1)

**Independent Test**: sessão real sem interceptações, arquivo externo sanitizado persistido e T008 original cumprida.

- [ ] T010 [skill: $webapp-testing] [US4] Executar jornada real de `quickstart.md §5`, com conta(s) de teste, um save por owner, arquivo externo sintético gravado/reaberto sem picker fake e save existente antes do aceite; comparar Início/Agenda, navegação, foco, fechamento/bloqueio/troca de contexto/conta e ausência de mutações pela leitura. Registrar em `validation-report.md` e executar/atualizar a T008 já existente em `specs/23-10-26-dashboard-rotina-assinatura/{tasks,implementation-log}.md` somente com prova completa. Verificação: catálogo/cadastro/authorize reais, conteúdo persistido, sem itens anteriores ou dados financeiros fictícios; `/authorize` separado de mutações; qualquer falha conserva T008 aberta. [FR-008–010, NFR-001/003/004]

## Phase 6 — US3: inventário completo e alegações precisas (P2)

**Independent Test**: igualdade dos conjuntos de páginas e matriz; divergências artificiais rejeitadas, nomes de testes fiéis à sua prova.

- [ ] T011 [skill: $ponytail:ponytail] [US3] Definir primeiro casos negativos em `tests/routes/route-smoke.test.tsx` para omissão, duplicata, extra/rename e normalização dos caminhos, usando listas sintéticas locais e arquivos reais somente para leitura; matriz atual deve falhar pelo conjunto incompleto. Verificação: falhas nominais apontam diferenças e não dependem de contagem24 fixa nem escrevem em `src/app`. [FR-005, NFR-002/003]
- [ ] T012 [skill: $ponytail:ponytail] [US3] Completar `tests/routes/route-acceptance-matrix.ts` segundo `contracts/route-inventory.md` e implementar a comparação mínima em `route-smoke.test.tsx`; classificar natureza, parâmetros/destino, estados e evidências diretas/indiretas/lacunas. Verificação: 24 arquivos atuais únicos cobertos, aliases sem estados visuais inventados, dinâmica preservada e casos negativos T011 aprovados. [FR-005, NFR-002]
- [ ] T013 [skill: $ponytail:ponytail] [US3] Corrigir títulos/asserções globais de `tests/routes/navigation.test.tsx` e `behavior-preservation.test.tsx`, removendo ou delimitando regex que alegam execução; conferir referências de cobertura da matriz e rodar os três testes de rotas. Verificação: zero teste estático apresentado como prova funcional/visual; nenhuma alegação de ausência de testes só pela matriz antiga; resultados no `validation-report.md`. [FR-005/006/010, NFR-003]

## Phase 7 — Validação transversal e encerramento

- [ ] T014 [skill: $code-reviewer-expert] Revisar diff restrito e rodar type-check, lint dos arquivos tocados, testes determinísticos/de servidor pertinentes e `git diff --check` conforme `quickstart.md`; conferir preservação de dados/segredos, guardas, foco e rollback local registrado, repetindo browser afetado se houver mudança posterior. Verificação: zero regressão introduzida nos alvos, falhas preexistentes segregadas, nada removido do baseline nem processo alheio encerrado. [FR-001/003/008, NFR-001–004]
- [ ] T015 [skill: $code-reviewer-expert] Consolidar no `validation-report.md` F1–F5 → requisitos → tarefas → evidências; fechar cada achado só com critério de `contracts/correction-scope.md` satisfeito e sincronizar status deste `tasks.md` sem substituir o dono T008 anterior. Verificação: cinco resoluções rastreáveis ou pendências explícitas, seis camadas separadas, paridade remota não verificada, zero conclusão de “todos os fluxos sem bugs” baseada em mocks/estática. [FR-001/009/010, NFR-003]

## Dependências e execução incremental

- T001 → T002 → T003 → T004 é a cadeia segura da integração. Falha não reproduzida/ambiente indisponível bloqueia aceite, não o trabalho documental.
- US1: T005 e T006 podem seguir em paralelo após T001; arquivos diferentes. Primeiro incremento revisável é a documentação coerente.
- US2: T004 → T007 → T008 → T009. Não marcar T007/009 concluída com setup falhando.
- US4: T004 e T009 → T010. Seu aceite pertence à T008 da feature anterior; **T008 deste arquivo é outra tarefa**, de helper, e não fecha o aceite anterior.
- US3: T001 → T011 → T012 → T013. Pode avançar em paralelo à cadeia de integração depois do baseline; todos tocam os mesmos testes e são sequenciais entre si.
- T014 depende de US1–US4; T015 depende de T014 e de todos os aceites. Uma etapa bloqueada mantém a entrega global aberta.
- Ordem numérica é uma sequência completa possível. Paralelismo é de arquivos/jornadas, não autorização implícita para agentes ou testes concorrentes no banco.

## Rastreabilidade

| Requisito | Tarefas |
| --- | --- |
| FR-001 | T001,T002,T014,T015 |
| FR-002 | T005,T006 |
| FR-003 | T006,T009,T014 |
| FR-004 | T007,T008,T009 |
| FR-005 | T011,T012,T013 |
| FR-006 | T013 |
| FR-007 | T002,T003 |
| FR-008 | T003,T004,T010,T014 |
| FR-009 | T010,T015 |
| FR-010 | T002,T006,T007,T009,T010,T013,T015 |
| NFR-001 | T001–T005,T007,T008,T010,T014 |
| NFR-002 | T001,T003–T006,T008,T011,T012 |
| NFR-003 | T001–T004,T006,T007,T009–T011,T013–T015 |
| NFR-004 | T008–T010,T014 |
| SC-001 | T015 |
| SC-002 | T005,T006,T014 |
| SC-003 | T007–T009,T010 |
| SC-004 | T011–T013 |
| SC-005 | T004,T010 |
| SC-006 | T001–T004,T010,T014,T015 |

## Critério final

15 tarefas concluídas somente quando verificação correspondente passar. Tarefa condicional pode concluir sem alteração apenas se a investigação demonstrar estado correto e a evidência estiver registrada. Bloqueio externo, teste skipped ou simulado onde era exigido real mantém tarefa e achado pendentes.
