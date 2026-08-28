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
