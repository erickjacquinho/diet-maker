# Implementation Log: Persistência e desempenho dos perfis

## Checkpoint e preflight

- Branch: `system-optimization`.
- Checkpoint anterior à implementação: `90563229baf01cca48468645405a695cccfb9bf8` (`feat(patients): checkpoint patient history loading changes`).
- Preflight: `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` localizou esta feature; os dois checklists estavam completos (34/34 itens); os 22 requisitos/critério mensuráveis têm tarefas; a análise não encontrou conflito de constituição.
- Corrigida a referência de `DataTable.tsx` na seção de estrutura do `plan.md`; a fonte atual fica em `src/components/molecules/DataTable.tsx`.

## Fase 2 — paginação e schema local

### T001 — teste de paginação remota

- Vermelho: `npx vitest run tests/components/molecules/data-table.test.tsx` — 11 passaram e o novo teste falhou porque a tabela calculava uma página a partir das linhas recebidas.
- Verde: `npx vitest run tests/components/molecules/data-table.test.tsx` — 12 passaram.

### T002 — suporte a total remoto no DataTable

- Alterações: `DataTablePagination.totalRows` opcional; paginação remota preserva linhas/ordem recebidas, calcula o total de páginas e anuncia a contagem completa em `aria-rowcount`; paginação local mantém o corte do array. Perfil canônico atualizado.
- Validação: `npm run type-check` passou; auditoria `verify:table -- --target src/components/molecules/DataTable.tsx --strict` passou (1/1, sem erros ou avisos); `verify:design-system -- --strict`, `verify:design-system-legacy -- --strict` e `audit:atomic-design` passaram.

### T003/T004 — tabelas locais de checkpoint e resumo

- Vermelho: `npx vitest run tests/lib/infrastructure/local-db/client.test.ts` — 2 passaram e o novo teste falhou porque as tabelas ainda não existiam.
- Migration adiciona as duas tabelas locais com FK/cascata e valores/revisões não negativos. O schema exportado pelo `.nutridiet` não foi alterado; a versão local passou a `7`, mantendo o envelope portátil em `6`.
- Falha de regressão: o grupo de testes de migrations apontou duas expectativas antigas (`'6'`) em `tests/infrastructure/library-migration.integration.test.ts`; ajustadas para a versão local `7`. As expectativas de backup permanecem em `6`.
- Verde: `npx vitest run tests/lib/infrastructure/local-db/client.test.ts` — 3 passaram; grupo de migrations/adapters (`client`, `clinical-migration`, `diet-migration`, `library-migration`, `local-db`) — 5 arquivos, 12 testes passaram; `npm run type-check` passou.

## Fase 3 — workspace persistente

### T005/T006 — persistência IndexedDB por profile

- Vermelho: `npx vitest run tests/lib/infrastructure/local-db/client.test.ts` — o novo teste falhou porque `idb://` era rejeitado pelo cliente.
- Mudanças: adicionado modo `persistent`, validação explícita do prefixo `idb://`, chave de base derivada do `accountId` no navegador, preservação da Conta já persistida em reaberturas e uso do `IndexedDbDietDraftStore`; testes Node seguem em `memory://` e drafts em memória. Um primeiro carregamento importa o arquivo; workspace existente não é sobrescrito ao reabrir.
- Verde: teste do cliente local — 4/4 (inclui reabertura e isolamento de duas chaves; 31,41 s); teste da fronteira de persistência — 1/1; `tests/infrastructure/patient-loading.integration.test.ts` — 2/2; `npm run type-check` passou.

### T007/T008 — revisões e checkpoint condicional

- Vermelho: `npx vitest run tests/lib/application/profile-session.test.ts` — 8 passaram e 5 falharam nos casos novos: sync limpo ainda gravava, não avançava checkpoint e gatilhos simultâneos colidiam com `SESSION_BUSY`.
- Mudanças: o runtime expõe as revisões da área local; mutações confirmadas incrementam `workspace_revision`; sync captura a revisão antes de exportar, escreve somente quando está pendente, avança o checkpoint após a gravação e compartilha a Promise em andamento. Uma mutação durante a escrita deixa estado `pending`; saves legados ficam pendentes para migração ao schema atual. A navegação lateral diferencia pendência de falha/permissão e oferece retry.
- Verde: `npx vitest run tests/lib/application/profile-session.test.ts` — 13/13; `tests/infrastructure/patient-loading.integration.test.ts` — 3/3, incluindo incremento só após mutação válida; `npm run type-check` passou.

### T009/T010 — restauração com escolha e rollback

- Vermelho: `npx vitest run tests/application/backup-application.test.ts tests/infrastructure/backup-repository.integration.test.ts` — falharam os novos casos de revisão pendente e reset no sucesso; 14/16 casos anteriores/não afetados passaram.
- Mudanças: a restauração exige escolher salvar (checkpoint atual antes da troca) ou descartar alterações confirmadas pendentes; drafts editáveis exigem descarte explícito por revisão. A aplicação valida arquivo/Conta/schema antes de escrever. O repositório reseta revisões para `0/0` dentro da transação de substituição; rollback mantém dados e revisão anteriores. O modal expõe as escolhas e, depois da restauração, tenta atualizar o arquivo principal.
- Verde: `tests/application/backup-application.test.ts` + `tests/infrastructure/backup-repository.integration.test.ts` — 17/17; `tests/components/app/backup-actions.test.tsx` — 6/6; `npm run type-check` passou.

### T011/T012 — retry por navegação e confirmação de gravação

- Vermelho: os testes de navegador identificaram o rótulo compartilhado pelo campo de data e botão do calendário; após corrigir o seletor, o cenário de recuperação falhou porque a troca de rota não disparava retry. O novo teste de `SessionAwareAppShell` também falhou antes da implementação.
- Mudanças: testes de navegador cobrem edições locais, salvar, Ctrl+S, navegação limpa, falha de escrita, recuperação após recarga, retry e gatilhos simultâneos. O shell tenta sincronizar estados `pending`, `paused` e `syncing` quando o pathname muda, sem aguardar a gravação nem atrasar a navegação; o estado e a ação de retry da sidebar permanecem ligados ao snapshot da sessão.
- Verde: testes focados de `tests/app/session-aware-app-shell.test.tsx` — 4/4; testes Playwright dos cenários de salvar/recuperar/retry e concorrência — 1/1 cada; `npm run type-check` passou. A suíte completa de navegador fica no T025.

## Fase 4 — paginação de pacientes

### T013/T014 — consulta paginada e ordenação global

- Vermelho: o novo cenário de `tests/lib/patients/create-list.integration.test.ts` falhou porque a aplicação ainda não expunha a consulta de página.
- Mudanças: páginas genéricas limitadas a 25; a consulta filtra por Conta, paciente ativo e nome/objetivo, ordena primeiro por grupo/data/nome pt-BR e chave estável, e só então aplica `LIMIT/OFFSET`. O total continua correto mesmo para página vazia; o leitor busca avaliações, acompanhamentos e resumos dietéticos em lote apenas para os IDs retornados.
- Compatibilidade local: migration v8 cria a collation pt-BR de força primária no PGlite; o `.nutridiet` continua no schema 6. Os planos usaram os índices de Conta e histórico já existentes, então nenhum índice novo foi adicionado.
- Verde: `tests/lib/patients/create-list.integration.test.ts`, `tests/infrastructure/patient-loading.integration.test.ts` e migrations (`clinical`, `diet`, `library`, `local-db`) — 6 arquivos, 16 testes passaram; `npm run type-check` passou. Com 100 pacientes, 2.000 dietas e 2.000 avaliações, a primeira página de 25 levou 108,8 ms e fez cinco consultas; `EXPLAIN ANALYZE` mediu 294,8 ms para a consulta de ordenação, abaixo de SC-001.

## Fases 4 e 5 — telas paginadas de pacientes

### T015/T016 — lista remota de pacientes

- Mudanças: a lista mantém busca e ordenação no repositório, pagina até 25 resultados, usa o total remoto e preserva a ordem do servidor. Estados sem pacientes, sem correspondência e erro permanecem distintos; paginação e busca são acessíveis pelo contrato atual de `DataTable`.
- Verde: testes focados da lista, hook e rota — 15/15; `npm run type-check` passou.

### T017–T021 — páginas de histórico e resumos de dieta

- Mudanças: avaliações e dietas consultam páginas escopadas por Conta e paciente, com totais e ordenação estável. O perfil lê os dois resumos clínicos mais recentes sem limitar as listas usadas pelos editores. A confirmação da dieta atualiza totais nutricionais exatos na mesma transação; migrations v9 e restauração de arquivos schema 4/5/6 reconstroem o resumo derivado.
- Planos de consulta em 2.000 linhas: avaliações usaram `body_assessments_patient_date_idx` com Index Only Scan, 0,351 ms; dietas usaram `diet_plans_patient_history_idx` e Top-N heapsort, 6,959 ms. Ambos limitaram a 25 linhas; nenhuma migration de índice foi necessária.
- Verde: repositórios clínico/dietético e restauração/importação — 11/11; migration dietética v9 — 4/4; fixture com 2.000 registros por histórico — 4/4. Primeiras páginas: avaliações 10,2 ms e dietas 21,8 ms, abaixo de SC-002.

### T022/T023 — histórico remoto no perfil

- Mudanças: avaliações e dietas navegam páginas independentes, mostram totais globais e retêm o conteúdo anterior em estados de carregamento/erro. Salvar avaliação atualiza o perfil clínico sem reler dietas; a dieta completa só é carregada ao abrir seus detalhes. A página é ajustada quando o total diminui.
- Verde: hook, perfil, tabela de avaliações e tabela de dietas — 33/33; `npm run type-check` passou.

## Fase 6 — decisão e validação final

### T024 — arquivo principal e workspace local

- Decisão: o ADR-009 fixa o `.nutridiet` como save principal e o banco PGlite/IndexedDB como área de trabalho local. O índice central e as descrições conflitantes das decisões 09–11 foram alinhados; drafts seguem separados e o schema lógico do arquivo permanece independente das tabelas internas.

### T025 — validação final

- `npm run type-check` passou em 18/09/2026; `git -c core.safecrlf=false diff --check` passou.
- A suíte completa Playwright passou: 18/18 testes em aproximadamente 5,5 minutos. Isso cobre o fluxo de salvar, recuperar após falha, retry, restauração, histórico e persistência IndexedDB.
- A primeira execução de `npm test` concluiu 235/236 arquivos e 900/904 testes. Os quatro casos que falharam eram de `tests/hooks/useAssessmentWorkspacePage.test.ts`: o mock não resolvia `application.listAssessments`. O `beforeEach` foi corrigido para retornar a avaliação canônica, e a execução focada passou 4/4.
- Reexecuções completas do Vitest em threads e forks terminaram antes de produzir resumo. O log verboso mais recente encerrou depois de 41/243 arquivos, sem falha de assertion registrada e sem arquivo de saída do processo destacado; portanto, o resultado integral de `npm test` permanece indeterminado e não é declarado como aprovado.
- Fixture local: `/pacientes` retornou 25 de 100 em 129,0 ms e cinco consultas; com 2.000 avaliações e dietas, as primeiras páginas levaram 8,6 ms e 23,7 ms. Todas ficaram abaixo de SC-001/SC-002.
- `npm run verify:design-system -- --strict` e `npm run verify:table -- --target src/components/molecules/DataTable.tsx --strict` passaram. `npm run verify:links` apontou somente duas referências preexistentes em `.agents/skills_link/add-community-extension/SKILL.md` e `.agents/skills_link/simple/SKILL.md`, fora do escopo alterado.

### Convergência — iteração 1

- Avaliados FR-001–FR-016, SC-001–SC-006, as três histórias, decisões do plano e os cinco princípios da constituição. Não foram encontradas lacunas funcionais nem conflitos de arquitetura/design.
- F1 (partial, MEDIUM): a validação exigida pelo plano não tem um resumo integral do Vitest, apesar de os testes específicos da feature, o type-check e os 18 testes de navegador passarem.
- A auditoria anexou T026 em `tasks.md`. Três execuções completas repetiram o encerramento prematuro sem progresso nem falha reproduzível; o ponto de retomada é concluir `npm test` em uma execução que consiga manter o processo até o resumo final.
- Estado: bloqueado somente na comprovação integral do Vitest. Nenhum código foi alterado nesta iteração de convergência.

### Retomada T025/T026 — validação integral (18/09/2026)

- O `npm test` sem partição ainda não forneceu um resumo confiável. Para cobrir o inventário inteiro sem omitir falhas, distribuí os 236 arquivos Vitest pelos oito grupos determinísticos de `--shard` (30/30/30/30/29/29/29/29) e executei em listas menores os arquivos restantes de grupos cujo worker encerrou antes do resumo. Cada arquivo do inventário tem resultado positivo; total: **236 arquivos e 904 testes aprovados**, sem falhas.
- Resultado por grupo: shard 1 — 30/111; shard 2 — 30/102; shard 3 — 30/81; shard 4 — 30/103; shard 5 — 29/121; shard 6 — 29/110; shard 7 — 29/129; shard 8 — 29/147 (arquivos/testes). Os shards 3 e 5 tiveram resultados verbosos parciais completados com os arquivos restantes; shards 6–8 foram executados em lotes menores. `tests/hooks/useAssessmentWorkspacePage.test.ts` passou 4/4 após a correção anterior do mock `application.listAssessments`.
- `npm run type-check`, `npm run lint` e `npm run build` passaram em 18/09/2026. `npm run test:browser` passou 18/18 na validação completa anterior, sem mudanças de código depois dela.
- Quickstart e SC-001/SC-002: `/pacientes` retornou 25 de 100 pacientes em 129,0 ms e cinco consultas; `EXPLAIN ANALYZE` mediu 294,8 ms na ordenação. Com 2.000 registros por histórico, as primeiras páginas de avaliações e dietas levaram 8,6 ms e 23,7 ms. Ambos os critérios de 1 segundo passam. Os testes completos cobrem equivalência Decimal, importação schema 4/5/6, checkpoint, retry, recuperação, mutação durante checkpoint e restauração válida/inválida.
- `T025` e `T026` concluídas. A evidência integral agora fecha o achado F1 da primeira convergência; nenhuma alteração de código foi necessária nesta retomada.

### Convergência final — iteração 2 (18/09/2026)

- Reavaliados FR-001–FR-016, SC-001–SC-006, histórias, edge cases, decisões do plano e os cinco princípios da constituição contra o código e os resultados de teste atuais. A análise cruzada de spec/plan/tasks não encontrou conflito, lacuna de cobertura ou tarefa implementável pendente.
- Resultado: **convergido, sem novos achados e sem tarefas anexadas**. O achado parcial F1 da iteração 1 foi resolvido pela cobertura Vitest integral documentada acima.
