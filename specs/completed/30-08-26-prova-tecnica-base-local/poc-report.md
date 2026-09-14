# PoC report — Prova técnica e base local

## Decisão

- Adaptador avaliado: PGlite `0.5.8` + Drizzle ORM `0.45.2`.
- Estado: **approved**, restrito ao portão técnico da PoC — cinco achados corrigidos, regressões completas aprovadas e uma passada final de `speckit-converge` sem pendências.
- Escopo: somente `poc/local-db-proof/`. Esta remediação não integra módulos clínicos, migra dados legados nem altera a segunda etapa em andamento.
- Este relatório substitui a aprovação prematura da primeira execução. O histórico e os ciclos RED/GREEN permanecem em [implementation-log.md](./implementation-log.md).

## Ambiente e reprodução

- Windows; Node `22.23.1`, npm `10.9.8`, Vite `8.2.2`, TypeScript `5.9.3`.
- Vitest `4.1.11`, Playwright `1.62.1`, Chromium `151.0.7922.34` headless (versão confirmada com `browser.version()`).
- Navegador desktop: viewports de 1280x720 e 1280x900, acima do mínimo de 1024px.
- Fixture sintética `fixture-v1`: 2 Contas, 3 Pacientes, 2 receitas, 3 ingredientes, 3 dietas, 4 refeições, 4 itens nutricionais e 1 draft separado.
- Browser: filesystem IndexedDB do PGlite, durabilidade padrão e Web Locks. Integração: motor em memória; teste adicional em diretório temporário real do filesystem, sem apresentá-lo como prova de IndexedDB.
- Migrations `0000`, `0001`, `0002`; schema atual `3`; formato lógico `1.0`.
- Comandos e pré-requisitos: [quickstart.md](./quickstart.md).

## Matriz vigente de evidências

Caminhos abaixo são relativos a `poc/local-db-proof/`.

| Requisito / critério | Evidência executável | Resultado |
| --- | --- | --- |
| FR-001/002, SC-001 | `tests/browser/persistence.spec.ts`: comparação integral das duas Contas após fechar a página, com e sem fechamento explícito do motor | PASS |
| FR-003/004, SC-002 | `tests/transaction.integration.test.ts`: falhas após plano, refeição e item preservam integralmente o estado anterior | PASS |
| FR-005 | Mesmo arquivo: rejeição de seed com Conta inexistente ou Paciente de outra Conta; validação de filhos e unicidade ACTIVE | PASS |
| FR-006 | `tests/drafts.integration.test.ts`: save/update/discard/erro não alteram dados confirmados; autosave atrasado e concorrente não substitui revisão recente. Ordenação também verificada no IndexedDB real | PASS |
| FR-007, SC-003 | `tests/browser/single-tab.spec.ts`: exclusividade inicial e após reopen, retomada após fechamento e erro nominal da API. Suíte repetida três vezes | PASS |
| FR-008, SC-004 | `tests/migration.integration.test.ts`: v1/v2 → v3 preserva ambas as Contas, reaplicação idempotente, v2 inválida falha atomicamente. Upgrade v2 populado também executado no navegador | PASS |
| FR-009/010, SC-005 | `tests/portability.integration.test.ts`: Alpha, Beta sem dietas e Conta sem filhos fazem round-trip; JSON, versões e relações inválidas rejeitados sem alterar estado confirmado | PASS |
| FR-011, SC-006 | `tests/browser/offline.spec.ts`: preparação, rede desligada, gravação composta, leitura, round-trip e reabertura; falta de preparação tem código nominal | PASS |
| NFR-002 | Regressões de storage, seed, migration, importação e Web Locks; `tests/browser/reopen.spec.ts` verifica erro visível e recuperação, sem sucesso falso | PASS |
| NFR-001/003/004, SC-008 | Origem local, contexto limpo, dados sintéticos e workspace isolado; nenhuma dependência de dados reais ou serviços autenticados | PASS |
| FR-012/013, NFR-005, SC-007 | Ambiente, tempos, limites e resultado consolidados aqui; gates e convergência registrados no log | PASS |

## US1 — Persistência, reabertura e erros

Os testes de navegador comparam todos os registros confirmados de Alpha e Beta, não só contagens. O cenário sem `close()` explícito fecha a página após o seed confirmado e recupera a mesma amostra em outra página do mesmo contexto. Anexos `persistence-evidence` são gerados pelo Playwright.

Tempos da última suíte de navegador, em ms (diagnóstico, não benchmark):

| Cenário | Abertura + migrations | Seed confirmado | Leitura das duas Contas |
| --- | ---: | ---: | ---: |
| Fechamento explícito | 5108.80 | 141.60 | 782.90 |
| Fechamento direto da página | 5168.30 | 124.50 | 798.80 |

O harness agora separa abertura, consulta e gravação. Os tempos antigos somavam parte do seed à abertura/consulta e não são reutilizados. O antigo script Python era um smoke test de reabertura do motor; não sustentava sozinho a alegação de comparação integral após fechar a página.

Falha de reabertura passa a registrar `US1/reopen` com código nominal e limpar referências fechadas. Falha de seed fecha a instância recém-aberta. Falha de migration fecha o motor antes de liberar a trava; se o fechamento falhar, a mensagem pede encerrar a aba.

## US2 — Integridade, drafts e exclusividade

- FKs físicas validam Account → Patient/Recipe/DietPlan e a chave composta Conta/Paciente da dieta.
- Rollback inclui a transição da dieta anterior de ACTIVE para SNAPSHOT, além dos novos filhos.
- Draft compara `updatedAt` e grava condicionalmente na mesma transação IndexedDB, inclusive entre conexões. Timestamps inválidos são rejeitados; timestamps iguais mantêm a ordem de chegada.
- Toda abertura persistente em browser adquire lock por padrão, incluindo reopen.
- Fechamento explícito espera o motor fechar antes de liberar a lease. No encerramento não recuperável da página, o callback da trava é finalizado sem iniciar trabalho assíncrono de filesystem; página em cache não libera a lease.
- O problema de teardown foi reproduzido em repetições. Apenas retirar o fechamento assíncrono do `pagehide` não bastou (11/12); com liberação no término da página, a mesma suíte passou 12/12, seguida da suíte completa.

A distinção entre página terminada e congelada segue o [ciclo de vida documentado pelo Chrome](https://developer.chrome.com/docs/web-platform/page-lifecycle-api); a [especificação Web Locks](https://www.w3.org/TR/web-locks/#termination) define a liberação no descarregamento. A evidência de funcionamento é a execução local, não essas referências.

## US3 — Migrations e portabilidade

`0002_account_patient_scope.sql` acrescenta as quatro FKs sem reescrever migrations anteriores. Sobre v2 inconsistente, falha e preserva registros, constraints anteriores e journal — não tenta reparar/apagar dados automaticamente.

O importador aceita coleções opcionais vazias e substitui apenas a Conta do envelope dentro de uma transação. O schema exportado é v3; envelopes de outros schemas são rejeitados, não convertidos silenciosamente. Este transporte continua sendo uma amostra lógica, não backup físico nem backup completo da Conta.

## US4 — Offline preparado

O cenário passa com a rede desativada depois da preparação, na página já carregada. A asserção interna offline verifica contagem e presença do item novo; comparações integrais de portabilidade/persistência são feitas nos testes próprios acima. Não se atribui ao teste offline uma comparação campo a campo que ele não executa.

## Gates

Últimos resultados concluídos:

- `npm run type-check` — PASS.
- `npm run lint` — PASS.
- `npm test` — PASS, 31 testes / 7 arquivos na rodada final (101,28 s).
- `npm run test:browser -- --workers=1` — PASS, 11 cenários.
- `npm run test:browser -- tests/browser/single-tab.spec.ts --workers=1 --repeat-each=3` — PASS, 12 execuções.
- `npm run db:generate` — PASS, sem diferença entre schema e migrations.
- `npm run build` — PASS; avisos do PGlite sobre `eval` e chunk principal de aproximadamente 735 kB.
- `speckit-analyze` — 26/26 requisitos cobertos, sem conflito crítico; `speckit-converge` — 1 passada final limpa, sem tarefas adicionais.

Nenhuma dependência foi alterada nesta remediação. A auditoria de dependências da execução anterior não é apresentada como uma nova auditoria nesta rodada.

## Limites da aprovação

- Não certifica produção, outros navegadores, volume, latência, multiusuário, sincronização, PWA ou abertura offline de recursos ainda não carregados.
- O cenário offline usa IDs sintéticos fixos: para reproduzi-lo integralmente, use um contexto/perfil de teste limpo.
- Perda/limpeza do armazenamento do navegador não é tratada como backup.
- A aprovação técnica desta PoC não substitui aprovação humana nem os gates próprios dos próximos SDDs.
