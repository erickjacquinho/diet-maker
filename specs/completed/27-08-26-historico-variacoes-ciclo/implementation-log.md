# Implementation Log: Tabela de variações no histórico de ciclo

## Checkpoint e preflight

- Checkpoint: `90b75d2 chore(profile): checkpoint before compact cycle variation table`.
- Feature directory: `specs/27-08-26-historico-variacoes-ciclo`.
- Checklists: `requirements.md` 16/16 e `ux.md` 26/26 concluídos.
- Preflight: 20 tarefas válidas, com uma skill por tarefa e caminhos rastreáveis.
- Hook `before_implement`: tentou executar `speckit-implement`, mas o executável não está disponível nesta sessão; a execução explícita de `$sdd-implement` é a implementação ativa.

## T001 — Fixtures históricas

- Alterado `tests/fixtures/patient-profile.ts` com conjuntos reutilizáveis de 1, 4 e 8 variações, incluindo variação sem dias e sem refeições.
- Verificação: `npx vitest run tests/lib/patient-profile-selectors.test.ts` — 1 arquivo e 6 testes aprovados.

## T002–T017 — Projeção, tabela e contratos

- A projeção de apresentação ordena dias pela semana canônica, separa com vírgula e espaço, preserva dias desconhecidos e explicita ausência de dias/refeições.
- `DietCycleDetails` foi convertido de grid de cards para tabela semântica somente leitura, com uma linha por variação e colunas estáveis para variação/tipo, dias, proteína, carboidratos, gorduras, calorias e refeições.
- Todas as linhas de variação usam `h-table-row`, `whitespace-nowrap` e truncamento com `title` para evitar uma segunda faixa visual em conteúdo longo.
- Ciclos sem variações continuam expandíveis e exibem estado vazio contextual; variações sem dias ou refeições permanecem visíveis.
- O resumo ponderado da linha pai, status, ações e isolamento do controle de expansão foram preservados.
- Acessibilidade validada por nome/estado do controle, `aria-controls`, cabeçalhos semânticos, unidades explícitas e foco no controle.
- Verificação vertical: `npm exec -- vitest run tests/lib/patient-profile-selectors.test.ts tests/components/organisms/patient-diets-table.test.tsx tests/app/pacientes/patient-profile-history.test.tsx --reporter=verbose` — 3 arquivos e 28 testes aprovados.

## T018–T019 — Validação automatizada

- `quickstart.md` foi atualizado com a ordem das colunas, estados vazios e cenários para 1, 3, 4 e 8 variações.
- `npm run type-check` — aprovado.
- `npm run lint` — aprovado.
- `npm run resolve:table -- --target src/components/organisms/patient/PatientDietsTable.tsx --json` — alvo resolvido sobre `DataTable` canônica e primitivos `Table`, sem classes arbitrárias.
- `npm run verify:table -- --target src/components/organisms/patient/PatientDietsTable.tsx --strict` — aprovado: 0 erros e 1 warning baseline sobre `MacroSummary` não catalogado.
- `npm run verify:design-system -- --strict` — falha baseline já existente de drift do registro/perfis em múltiplos componentes; nenhum novo erro específico da alteração foi identificado.
- `npm test -- --reporter=verbose` — não concluiu no limite de 90s do hook; reportou falhas baseline em contratos de z-index/overlays, catálogo do design system e auditoria legacy, fora do escopo desta feature. A suíte focada permaneceu verde com 28/28 testes.

## T020 — Verificação manual desktop

- `next build` — aprovado.
- Playwright contra `next start` — aprovado em 1024px e 1440px.
- Evidência: oito linhas verticais renderizadas; pai e todas as linhas de variação mediram 44px; `Ter, Qui`, estados sem dias/refeições, expansão e re-colapso foram verificados.
- O primeiro ensaio com `next dev` foi descartado por respostas 400 dos assets estáticos/HMR; o ensaio final foi executado após build isolado e não apresentou essa limitação.

## Finalização e convergência

- Tasks: `20/20` concluídos; nenhuma tarefa de convergência foi necessária.
- `speckit-converge` — iteração 1: convergido, com 15 requisitos funcionais, 5 não funcionais, 6 critérios de sucesso, cenários das 3 histórias, decisões do plano e 5 princípios constitucionais verificados sem findings.
- Findings da convergência: `missing 0`, `partial 0`, `contradicts 0`, `unrequested 0`.
- O arquivo `tasks.md` permaneceu sem uma fase de convergência vazia, conforme o contrato append-only.

## Follow-up — Compactação do histórico dietético (2026-08-28)

- Checkpoint antes da alteração: `d81ea1d chore(profile): checkpoint before compacting diet history tables`.
- Clarificações e requisitos foram registrados em `spec.md` e `plan.md`; a nova fase append-only T021–T028 foi adicionada a `tasks.md` sem alterar o histórico anterior.
- O hook obrigatório `before_implement` foi tentado, mas `speckit-implement` não está instalado nesta sessão; o fluxo explícito `$sdd-implement` foi aplicado manualmente conforme o roteiro local.

### T021–T023 — Contrato de regressão test-first

- Os testes foram escritos/ajustados antes da implementação e inicialmente falharam pelos labels, title e separação visual ainda ausentes.
- O contrato final cobre `Simples`, `Ciclo de carboidratos`, `Ativo`, `Histórico`, ausência visual do nome/tag, ação de visualizar como ícone nomeado, ações de editar/excluir, resumo ponderado, dieta simples e linhas de quatro variações.
- Após a implementação: `npm exec -- vitest run tests/components/organisms/patient-diets-table.test.tsx tests/app/pacientes/patient-profile-history.test.tsx --reporter=dot --pool=forks --maxWorkers=1` — 2 arquivos e 23 testes aprovados.

### T024–T026 — Implementação e conformidade visual

- `PatientDietsTable` passou a usar tabela principal `table-fixed` com larguras que totalizam 100%, padding horizontal compacto e sem larguras mínimas que forcem overflow.
- A célula de plano mostra somente o tipo; o status usa badge compacto com os labels definidos; a ação de cardápio usa somente `Eye`, preservando `aria-label`, `title` e callback.
- A tabela expandida usa `table-fixed` e `overflow-hidden`, reduz a identificação, mantém `· Tipo ...` visível e trunca somente o nome longo com `title`; dias, macros, calorias e refeições continuam presentes.
- Type-check e lint passaram. O resolvedor confirmou `DataTable` canônico. A auditoria global de tabelas manteve os achados baseline em outros consumidores e, no alvo, somente o warning conhecido `TABLE016` sobre `MacroSummary` não catalogado.

### T027 — Validação manual Playwright

- O cenário foi executado via `C:\Users\Jacques\Skills\webapp-testing\scripts\with_server.py` com oito variações em 1024px e 1440px.
- Em 1024px, principal `scrollWidth/clientWidth = 684/684` e expandida `650/650`; em 1440px, principal `1084/1084` e expandida `1050/1050`. Os contêineres tiveram as mesmas medidas.
- Foram confirmados: uma linha por variação, oito linhas de dados, nome longo truncado com tooltip, tipo visível, ação de ícone acessível e altura de 44px (`h-table-row`) na linha pai e nas linhas de dados.

### T028 — Validação de build e documentação

- `npm run build` passou com `NODE_OPTIONS=--max-old-space-size=4096`; a primeira execução padrão sofreu encerramento do worker antes da compilação, sem erro de código, e foi repetida isoladamente com sucesso.
- `quickstart.md` foi atualizado com labels, critérios de overflow, comandos e evidências finais.
- A rodada completa `npm test -- --reporter=dot --pool=forks --maxWorkers=1` foi iniciada para a validação final, reproduziu os marcadores de falha baseline e excedeu o tempo operacional sem concluir; foi interrompida após a confirmação da suíte focada verde. O mesmo comportamento já havia sido registrado na validação anterior do repositório.
- Após o último ajuste de compactação do padding da data, a suíte focada foi repetida: 2 arquivos e 23 testes aprovados; type-check e lint permaneceram aprovados.
- `npm run audit:atomic-design` passou com 100% de conformidade. `verify:design-system --strict` manteve somente findings baseline de registro/perfis/tokens em componentes existentes, incluindo a ausência de entrada de `PatientDietsTable` no registry. `verify:links` manteve um link quebrado preexistente em `refs/pesquisa-mercadologica/README.md`, fora do escopo.

## Status do follow-up antes da convergência

- Tasks: `28/28` concluídas.
- Nenhuma alteração foi feita em tipos de domínio, persistência, média ponderada ou fluxo de dietas simples.

## Convergência final do follow-up

- Requisitos verificados: 20 FR, 6 NFR e 8 SC; decisões do plano e os cinco princípios da constituição foram revisados contra o código e os testes.
- Resultado: `missing 0`, `partial 0`, `contradicts 0`, `unrequested 0`.
- `tasks.md` permaneceu sem nova fase de convergência, pois não havia trabalho residual acionável.
