# Implementation Log

Feature: adequação de estilos hardcoded e arquitetura de componentes
Diretório: `specs/30-07-26-adequacao-de-estilos-hardcoded-e`

## Checkpoint

- O estado pré-existente do worktree foi preservado em `c8a8868` (`chore(ui): checkpoint before extracting route modals`), conforme exigido pelo fluxo SDD.
- A feature foi recebida explicitamente por este diretório. O arquivo `.specify/feature.json` aponta para outra feature (`05-08-26-alinhamento-primitivos-componentes`); por isso, a execução usa o diretório explicitamente informado pelo usuário.

## Preflight e análise dos artefatos

- `spec.md`, `plan.md`, `tasks.md`, `checklists/design_system.md` e as instruções de arquitetura do repositório foram lidos antes da implementação.
- A análise cruzada identificou uma divergência documental: a especificação menciona 12 arquivos de rota, enquanto o código contém 10 `page.tsx` sob `src/app`. As tarefas listam 9 páginas específicas, e a implementação validará todas as rotas existentes sem inventar duas páginas inexistentes.
- A especificação referencia `tokens.ts`/`globals.css` para macros, mas a fonte canônica efetiva do projeto é `src/design-system/tokens.css`, consumida pelo Tailwind. Os tokens de calorias foram adicionados nessa cadeia canônica e expostos como utilitários semânticos.

## Baseline antes da integração

- `npm run lint`: passou; o build/lint do Next ainda emite o aviso conhecido de opções ESLint removidas (`useEslintrc`, `extensions`).
- `npm run build`: passou, compilando as 10 rotas existentes, com o mesmo aviso de configuração ESLint.
- `npm run type-check`: passou após a geração de `.next` pelo build.
- `npm run audit:atomic-design`: passou (100%, 66 arquivos, 0 violações).
- `npm run verify:design-system`: passou (40 arquivos cobertos, 0 descobertos).
- Testes arquiteturais/tokens/catalog foram executados com um worker: 34 testes passaram; 2 expectativas do catálogo falharam porque o registry atual contém 3 componentes a mais que o número fixado no teste (54 contra 51). Essa divergência antecede a integração desta feature e será reavaliada na validação final.

## Registro de execução

As entradas seguintes serão adicionadas somente após cada alteração ser validada por type-check/build e pelos checks específicos da tarefa.

## T001 — tokens semânticos

- O token de calorias foi adicionado à cadeia canônica (`src/design-system/tokens.css`, `tailwind.config.js` e `src/design-system/index.ts`) como `macro-kcal`, `macro-kcal-soft` e `macro-kcal-border`.
- Validação: `npm run type-check` e `npm run build` passaram.

## T002–T007 — modais extraídos

- `CustomFoodModal`, `CreatePatientModal`, `EditPatientModal`, `CreatePresetModal`, `CreateRecipeModal` e `CreateReadyMealModal` passaram a concentrar estado de formulário, validação local, scroll de conteúdo e contratos de callback.
- As páginas consumidoras mantêm apenas estado de abertura, seleção/edição e persistência; `src/components/ui` não recebeu lógica de negócio.
- O modal de avaliação física já existente foi mantido e catalogado como parte de T004.
- Validação: `npm run type-check`, `npm run lint`, `npm run build`, `npm run audit:atomic-design` e `npm run verify:design-system` passaram.

## T008–T016 — estilos e previews

- A busca de classes proibidas nos 10 `page.tsx` existentes não encontrou `text-[9px]`, `text-[10px]`, `text-[11px]`, `max-w-[1400px]`, `max-h-[90vh]`, `scale-[...]` ou cores utilitárias brutas.
- Cores de macro em consultas/dietas foram alinhadas a `text-macro-protein`, `text-macro-carbohydrate`, `text-macro-fat` e `text-macro-kcal`; a página de Design System já usa `recipes`/`textStyle` para previews dinâmicos.
- Validação: `npm run audit:atomic-design` passou com 72 arquivos, 100% conformes; `npm run verify:design-system` passou sem findings; testes arquiteturais/catalog passaram com 36 testes.

## T017 — build e catálogo

- `next.config.ts` delega o lint ao script dedicado (`npm run lint`) para evitar a chamada legada do lint interno do Next; o build verifica TypeScript e compila sem warnings.
- O lockfile foi sincronizado com `npm install --legacy-peer-deps` depois que o Next identificou dependências SWC ausentes; a segunda execução de build não emitiu warnings.
- Validação final: `npm run lint` passou, `npm run type-check` passou, `npm run build` passou sem warnings, e os testes direcionados passaram (5 arquivos, 36 testes).
- O catálogo do Design System foi atualizado para as seis novas fontes e seis perfis; as expectativas do teste de inventário foram atualizadas de 50/54 para 56/60 fontes/entradas.

## T018 — validação visual

- A validação foi concluída com Playwright conforme o skill `webapp-testing`, usando o servidor de produção gerado por `npm run build` e `with_server.py`.
- As 7 rotas públicas (`/`, `/alimentos`, `/pacientes`, `/presets`, `/receitas`, `/refeicoes-prontas` e `/design-system`) passaram em viewports de `1366x768` e `1024x768`.
- Os cinco fluxos de abertura de modal (`alimentos`, `pacientes`, `presets`, `receitas` e `refeições prontas`) também passaram nos dois viewports: diálogo dentro da tela, sem overflow horizontal e sem erros de console.
- Foram gerados e inspecionados screenshots das telas e dos modais. Resultado: `VISUAL_VALIDATION_PASS routes=7 viewports=2 screenshots=14`; T018 e CHK009 concluídos.
- Additional dynamic route validation: `/pacientes/visual-check`, `/pacientes/visual-check/consulta/2026-08-06` and `/pacientes/visual-check/dieta/visual-diet` passed at `1366x768` and `1024x768` with no horizontal overflow or console errors (`DYNAMIC_VISUAL_VALIDATION_PASS routes=3 viewports=2 screenshots=6`).
- Aggregate visual evidence: 14 public-route screenshots, 6 dynamic-route screenshots and 10 modal screenshots were generated and inspected.
