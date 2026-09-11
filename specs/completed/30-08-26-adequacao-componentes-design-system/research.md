# Research: Adequação dos componentes

Data: 2026-08-30. Pesquisa local de código e contratos; não altera produção.
Fontes: design-system/README.md, documentos 03, 09–11, 14–15, categorias
actions/selection/overlays/data-display/nutrition-domain, contratos de perfil e
auditoria, registry.json, fontes/exports/consumidores e testes citados abaixo.

## D1 — Preservar regras, adequar especializações

Decision: limitar alterações normativas a perfis individuais e campos de
componentes/baseline do registry. Não editar categorias, traits, fundamentos,
token-index, schemas, scripts de auditoria, tokens, Tailwind, CSS global ou ui.
Rationale: a conversa confirmou adequação, não redesign. O perfil MacroProportionBar
duplica valores e contradiz a escala; IconButton duplica hex em prosa.
Alternatives considered: alterar tokens ou regex para aceitar valores locais
foi rejeitado. Reduzir contagem de findings não comprova conformidade visual.

## D2 — Inventário atual não é contagem fixa

Decision: recapturar fontes, imports, exports, testes e hashes antes de executar,
e derivar currentSourceCount da descoberta vigente, nunca do número de entradas.
Rationale: snapshot atual tem 17 findings: 5 PRF002, 1 REG001 (65 × 78),
9 SRC001 e 2 TOK002. Há fontes excluídas historicamente da descoberta que ainda
podem ter cobertura documental sem alterar a lista de exclusões.
Alternatives considered: fixar 78 como requisito ou adicionar exclusões foi rejeitado.

## D3 — ImportPreviousDietModal: inverter a fachada com migração completa

Decision: colocar a implementação em
src/components/organisms/diets/ImportPreviousDietModal.tsx, atualizar todos os
consumidores e testes e retirar a antiga implementação molecule após zero usos.
Rationale: hoje o arquivo organism apenas reexporta a implementação molecule;
o comentário descreve o sentido inverso. O registro aponta a fachada, não a
implementação. Ambas usam PreviousDietSummary; não há conversão de dados nova.
Alternatives considered: declarar a fachada como implementação ou deixar um
reexport molecule → organism é incorreto. Compatibilidade é funcional; caminhos
internos são migrados no mesmo change set, sem promessa de pacote externo.

## D4 — ReadOnlyDietModal: não converter modelos

Decision: manter a implementação organism que recebe DietPlan; retirar a
implementação molecule com HistoricalDiet se a busca atualizada confirmar zero
consumidores de produção. Migrar os testes estruturais para a fonte ativa,
preservando as mesmas verificações.
Rationale: a rota PatientProfileModals usa organism, enquanto o legado subsiste
no barrel e em testes estruturais. As APIs e os cálculos não são equivalentes.
Alternatives considered: converter HistoricalDiet para DietPlan ou reexportar
silenciosamente foi rejeitado por alterar semântica/dados. Se surgirem consumidores
legados em edição concorrente, a remoção para e requer reconciliação; não se
improvisa adaptador de dados.

## D5 — Camadas dos coordenadores e fechamento dos imports

Decision: migrar FoodSearchModal para organisms/foods, SubstituteFoodModal para
organisms/foods, CarbCyclingVariationPanel e DietModeSwitcher para organisms/diet.
Os helpers de escolha e resultados continuam molecules. Migrar também imports
em rotas, hooks de apresentação, templates e testes, sem alterar suas lógicas.
Rationale: coordenam seções; FoodSearchModal e DietModeSwitcher já têm layer-alvo
organism no catálogo. Mover o painel sozinho criaria import ascendente no
DietModeSwitcher. Este par é o fechamento mínimo da migração.
Alternatives considered: mover tudo indiscriminadamente ou manter reexports
ascendentes foi rejeitado. As demais migrações gerais do aplicativo estão fora.

## D6 — Famílias e filhos sem proliferar fichas

Decision:
- FoodSearchCategorySelector: molecule independente, selection;
- ReadyMealSearchResultsList e RecipeSearchResultsList: molecules independentes,
  data-display com nutrition-context, delegando métricas à semântica nutricional;
- MacroSummary e seu alias MacroNutrientSummary: uma família molecule,
  nutrition-domain;
- PatientAssessmentsTable e PatientDietsTable: famílias organism, data-display;
  exports de rows no mesmo arquivo são compound-parts dessas famílias;
- ConsultationHistoryRow e ConsultationHistoryExpandedRow: uma família de rows
  com um perfil e o mesmo arquivo, data-display;
- PatientListTableRow: uma família, data-display;
- IconButton e MacroProportionBar preservam IDs existentes.

Rationale: responsabilidades e APIs já existem e têm consumidores/testes; não
criar novos wrappers apenas para estilizar. O auditor atual verifica exports
por arquivo; as famílias escolhidas não misturam exports ausentes entre arquivos.
Alternatives considered: cadastrar cada elemento JSX, excluir filhos do auditor,
ou juntar arquivos arbitrariamente num arquivo gigante foi rejeitado.

## D7 — Reutilizar contratos atuais de dados e seleção

Decision: usar o resolver de tabelas na execução, com DataTable e primitivos
existentes; corrigir empty bypass, semântica, ordenação e seleção no consumidor.
Escolha de categoria/variação usa semântica coerente de seleção, sem fingir tabs
sobre controle de outro papel nem depender de drag-only.
Rationale: os auditores atuais passam por alguns ramos vazios não detectados;
leitura de RecipeSearchResultsList identificou empty fora da tabela, e
FoodSearchCategorySelector mistura ToggleGroup com roles de tabs.
Alternatives considered: confiar apenas em exit 0 ou mudar ui foi rejeitado.

## D8 — Validação atual, não reutilização de resultados antigos

Decision: testes de regressão sob tests precedem refactors; finalizar com suíte,
type-check, lint, build, links, Atomic, z-index, legado, catálogo e tabelas,
mais navegador em ambiente sintético.
Rationale: 605 testes da rodada anterior não certificam o workspace atual.
vitest.config.ts exclui component-catalog.test.mjs; criar configuração de teste
da feature dentro deste SDD para executar essa suíte explicitamente, sem
remover exclusões/configuração global nem esconder findings.
Alternatives considered: assumir cobertura pela suíte default ou mudar seus
resultados esperados para aceitar erros foi rejeitado.

## Unknowns resolved

Sem questão de produto pendente. Evidências e caminhos são snapshot; divergência
concorrente é um gatilho explícito de recaptura/coordenação, não uma decisão
aberta para a implementação.

