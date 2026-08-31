# UI and catalog adequation contract

Status: proposta para implementação posterior à aprovação. Herança normativa:
design-system/components/component-profile-contract.md e categorias vigentes.
Este documento não cria nova regra visual.

## Famílias, destino e verificação

| Família | Fonte-alvo a adequar | Categoria | Preservação/aceite específico |
| --- | --- | --- | --- |
| IconButton | src/components/atoms/IconButton.tsx | actions | nomes, keyboard, variantes canônicas, props/ref, exclusão semântica |
| MacroProportionBar | src/components/molecules/MacroProportionBar.tsx | nutrition-domain | ordem, unidades, percentuais, zero vs ausência, tokens e label |
| MacroSummary / MacroNutrientSummary | src/components/molecules/MacroSummary.tsx | nutrition-domain | uma família/alias, valores e ordem, sem cálculo novo |
| CarbCyclingVariationPanel | src/components/organisms/diet/CarbCyclingVariationPanel.tsx | selection | seleção e ações separadas, teclado e reordenação acessível |
| DietModeSwitcher | src/components/organisms/diet/DietModeSwitcher.tsx | selection | mesmos modos/callbacks; nenhuma perda de escolha ao cancelar |
| FoodSearchCategorySelector | src/components/molecules/food-search/FoodSearchCategorySelector.tsx | selection | cardinalidade única, estado controlado, não deselecionar para vazio |
| ReadyMealSearchResultsList | src/components/molecules/food-search/ReadyMealSearchResultsList.tsx | data-display | DataTable, empty interno, labels, seleção/ordenação atuais |
| RecipeSearchResultsList | src/components/molecules/food-search/RecipeSearchResultsList.tsx | data-display | DataTable, empty interno, porções/nutrientes sem alteração |
| FoodSearchModal | src/components/organisms/foods/FoodSearchModal.tsx | overlays | título, foco, seleção das três fontes e callbacks atuais |
| SubstituteFoodModal | src/components/organisms/foods/SubstituteFoodModal.tsx | overlays | quantidade e callbacks atuais; sem novo cálculo/persistência |
| ImportPreviousDietModal | src/components/organisms/diets/ImportPreviousDietModal.tsx | overlays | seleção única, busca, expansão e callback assíncrono; manter erro aberto |
| ReadOnlyDietModal | src/components/organisms/diets/ReadOnlyDietModal.tsx | overlays | snapshot DietPlan sem recálculo/gravação; leitura completa e body rolável |
| PatientAssessmentsTable | src/components/organisms/patient/PatientAssessmentsTable.tsx | data-display | rows/expansão e unidades; não transformar dados em inputs disabled |
| PatientDietsTable | src/components/organisms/patient/PatientDietsTable.tsx | data-display | histórico corrente, ordem, consulta e callbacks preservados |
| ConsultationHistoryRow + ExpandedRow | src/components/organisms/patient/ConsultationHistoryRow.tsx | data-display | uma família compound, duas parts, links e detalhes associados |
| PatientListTableRow | src/components/organisms/patient/PatientListTableRow.tsx | data-display | semântica row preservada, link focável e navegação sem dupla ativação |

Os pais PatientConsultationHistoryTable e PatientListTable são consumidores
em escopo para adequação dos filhos; preservar IDs/categorias existentes.
Trait nutrition-context em data-display não redefine cores/macros.

## Fronteiras protegidas

Não editar design-system/README.md, documentos normativos de fundamentos,
categorias, contratos, schema, token-index, category-decisions, .agents/rules,
src/design-system, tailwind.config.js, CSS global ou src/components/ui.
No registry, somente componentes, relações cadastrais de consumers e baseline;
definições de categorias/traits, permissões e versionamento de schema ficam
iguais. Não modificar validadores nem suas exclusões.

## Estados e comportamentos

Cada perfil herda os dez estados da categoria, explicitando apenas particularidades
e N/A justificado. Modais: título, foco inicial e retorno, Escape, fechamento
seguro, body rolável/header-footer preservados e seleção/erro quando aplicáveis.
Tabelas: caption, headers, row semantics, chaves, dados tabulares e estados internos.
Seleção: semântica coerente via primitivo existente, selected/checked textual e
programático; manter cardinalidade e callbacks. Reordenação já existente deve ter
alternativa de teclado, sem adicionar operação de negócio.

## Compatibilidade e saída

Paths internos podem mudar com migração de todos os imports/testes; não criar
fachada ascendente molecule → organism. O módulo antigo só desaparece depois
da busca por imports diretos/barrels/dinâmicos e atualização dos testes de
estrutura. API de dados/efeitos fica intacta. Se o legado ReadOnly ainda for
consumido na execução, interromper sua remoção e coordenar a migração, sem
converter tipos ou acessar banco como atalho.

Cada alvo termina com perfil/cadastro coerente e evidência comportamental;
cadastro não legitima classes ou APIs contrárias à categoria.

