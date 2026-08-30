# PoC report — Prova técnica e base local

## Decisão final

- Adaptador avaliado: `@electric-sql/pglite` `0.5.8` + `drizzle-orm` `0.45.2`.
- Decisão: **approved** — aprovado como candidato para o próximo SDD de adaptação/persistência, dentro do escopo comprovado nesta PoC.
- Limite da decisão: não é aprovação para integrar módulos clínicos, migrar `localStorage`, declarar PWA/offline total ou certificar produção, volume e latência.
- Escopo executado: workspace isolado `poc/local-db-proof/`; nenhum módulo de `src/` foi integrado e nenhum dado legado foi migrado.

## Ambiente e reprodução

- Runtime: Node `22.23.1`, npm `10.9.8`.
- Bundler: Vite `8.2.2`.
- Testes: Vitest `4.1.11`; Playwright `1.62.1`.
- Browser run: Chromium for Testing `151.0.7922.34`, headless, viewport `1280x900`.
- Dados: fixture sintética versionada `fixture-v1`, com duas Contas, Pacientes ativos/arquivados, receitas, refeições, itens e snapshots nutricionais.
- Modo browser: filesystem IndexedDB do PGlite (`idb://...`) com Web Locks; modo `test-memory` usado apenas nos testes de runtime.
- Dependências finais: `typescript` `5.9.3`, `eslint` `10.9.1`, `typescript-eslint` `8.68.0`, `@playwright/test` `1.62.1`, `fake-indexeddb` `6.2.5`.

## Matriz de verificações

| Requisito / critério | Evidência | Resultado |
| --- | --- | --- |
| FR-001, FR-002 / SC-001 | Fixture relacional gravada, fechada e reaberta com comparação de 100% dos registros, relações e valores exercitados | PASS |
| FR-003, FR-004 / SC-002 | Gravação de dieta com falhas após plano, refeição e item; rollback deixou zero registro parcial | PASS |
| FR-005 | Relações Conta/Paciente, filhos/agregado e uma única dieta `ACTIVE` por Paciente validadas | PASS |
| FR-006 | Autosave, update, discard e falha em store IndexedDB separado; base confirmada permaneceu igual | PASS |
| FR-007 / SC-003 | Segunda aba bloqueada antes da abertura; após fechar a primeira, a nova aba assumiu | PASS |
| FR-008 / SC-004 | Migration aditiva aplicada sobre fixture v1 populada, preservada e reexecutada de modo idempotente | PASS |
| FR-009, FR-010 / SC-005 | Round-trip JSON preservou IDs, relações e snapshots; JSON, formato, schema e relações inválidos rejeitados antes da mutação | PASS |
| FR-011 / SC-006 | Após preparação, leitura, gravação, portabilidade e reabertura funcionaram com Chromium offline | PASS |
| FR-012, FR-013 / SC-007 | Este relatório contém versões, modo, resultados, limitações, tempos e decisão explícita | PASS |
| NFR-001, NFR-003, NFR-004 / SC-008 | Chromium desktop em viewport `1280x900`, fixture sintética, passos reproduzíveis e sem integração clínica/legada | PASS |
| NFR-002 | Falhas emitiram códigos `PERSISTENCE_UNCONFIRMED`, `LOCK_UNAVAILABLE`, `IMPORT_REJECTED` e `OFFLINE_RESOURCE_NOT_READY` | PASS |
| NFR-005 | Tempos diagnósticos registrados; não foi criada certificação de latência ou volume | PASS |

## US1 — Persistência e reabertura

**Resultado: PASS.**

Execução browser real com `python scripts/us1_browser_check.py`, iniciada por `with_server.py`:

- a fixture foi gravada no filesystem IndexedDB do PGlite;
- a página foi fechada/reaberta na mesma origem e recuperou as 3 dietas;
- a comparação cobriu Contas, Pacientes, receitas, ingredientes, refeições, itens e snapshots nutricionais da fixture;
- a tentativa de abrir modo não persistente em contexto browser sem IndexedDB produziu `PERSISTENCE_UNCONFIRMED`.

Tempos observados:

| Operação | Tempo |
| --- | ---: |
| Abertura/migration | 3732.60 ms |
| Consulta inicial | 163.00 ms |
| Gravação da fixture | 58.60 ms |

Os tempos são evidência diagnóstica, não uma certificação de latência ou volume.

## US2 — Integridade, drafts e aba única

**Resultado: PASS.**

- rollback de falha após item não deixou plano, refeição ou item parcial;
- referência de Paciente em outra Conta e referência de filho fora do agregado foram rejeitadas;
- substituição de dieta manteve uma única `ACTIVE` e converteu a anterior em `SNAPSHOT`;
- autosave, update, discard e falha de draft não alteraram dados confirmados;
- a segunda aba foi bloqueada antes de abrir a base com `LOCK_UNAVAILABLE`; após fechar a primeira, a segunda assumiu a instância.

Verificações: Vitest, 6 testes de US2; Playwright Chromium, 1 cenário de duas abas aprovado em viewport `1280x900`.

## US3 — Migration e portabilidade lógica

**Resultado: PASS.**

- `0001_add_fixture_metadata.sql` foi aplicada sobre uma base v1 já preenchida e preservou registros e relações;
- a segunda aplicação foi idempotente pelo journal versionado;
- o envelope JSON preservou IDs, relações e snapshots nutricionais da Conta Alpha;
- drafts não foram serializados;
- JSON inválido, schema/formato incompatível e relações inconsistentes foram rejeitados antes de chamar a substituição transacional;
- a importação substituiu somente a Conta Alpha e deixou a Conta Beta intacta.

Verificações: Vitest, 4 testes de US3.

## US4 — Operação local sem rede após preparação

**Resultado: PASS.**

- antes da preparação, a tentativa foi bloqueada com `OFFLINE_RESOURCE_NOT_READY`;
- após inicialização e preparação online, Chromium foi colocado offline;
- consulta, gravação composta, exportação/importação lógica e reabertura continuaram funcionando sem chamada remota da PoC;
- o relatório/harness distingue recursos preparados de uma promessa de offline total/PWA.

Verificação: Playwright Chromium, 1 cenário aprovado em viewport `1280x900`.

## Validação final do quickstart e qualidade

Executado a partir de `poc/local-db-proof/`:

- `npm install` — PASS; `npm run db:generate` — PASS, sem alterações de schema;
- `npm run type-check` — PASS;
- `npm run lint` — PASS;
- `npm test` — PASS, 6 arquivos e 14 testes;
- `npm run test:browser` — PASS, 2 cenários;
- `npm run build` — PASS.

O build reportou apenas avisos provenientes do bundle do PGlite: uso de `eval` no artefato do motor e chunk principal acima de 500 kB. Eles foram registrados como limitação de distribuição da PoC, não como falha funcional. `npm audit --omit=dev --audit-level=high` encontrou 0 vulnerabilidades; a instalação completa sinalizou 4 vulnerabilidades moderadas em dependências de desenvolvimento/transitivas.

## Limitações e próximos limites

- A evidência de navegador foi executada em Chromium desktop; não certifica outros browsers.
- A fixture é sintética e pequena; não há certificação de volume, latência, multiusuário ou sincronização.
- O harness é técnico e não representa telas clínicas, PWA, cache avançado, backup completo ou sincronização remota.
- A persistência depende do IndexedDB disponível; perda manual do armazenamento do navegador não é tratada como backup.
- A aprovação vale para seguir ao próximo SDD como candidato de adaptador, mantendo a fronteira isolada até aprovação humana da etapa seguinte.
