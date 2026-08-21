# Contract: Public Shells and Shared Composition

## Purpose

Definir como compartilhar markup, estados e interações sem fundir componentes públicos com responsabilidades de domínio diferentes.

## Boundary rules

1. A unidade compartilhada recebe somente dados, callbacks e estados necessários para sua responsabilidade comum.
2. O shell consumidor mantém abertura/fechamento do modal, submit, confirmação, descarte, ordenação, remoção, seleção e persistência específicos do domínio.
3. A unidade não expõe flags booleanas para representar modalidades mutuamente exclusivas; variações devem ser expressas por composição, callbacks tipados ou variantes nomeadas.
4. Componentes em `src/components/ui` continuam agnósticos; wrappers de domínio vivem em `atoms`, `molecules` ou `organisms` conforme a responsabilidade.
5. Cada unidade compartilhada deve ser consumida por pelo menos dois candidatos reais ou ter justificativa registrada como fronteira de composição.

## Candidate mapping

| Candidato | Unidade comum | Permanece no shell público |
|---|---|---|
| `AdjustDietGoalsModal` + `AutoKcalSection` | Controles de macros, cálculo energético, validações e read-only | Abertura, submit, cancelamento e contexto do modal |
| `MealItemRow` + `RecipeIngredientRow` | Grupo de badges de macros e editor de quantidade, se os contratos coincidirem | Ordenação, remoção, edição local e tipos de domínio |
| `CreatePatientModal` + `EditPatientModal` | Campos de identidade e estados de campo compartilhados | Criação, rascunho, objetivos, confirmação, descarte e atualização |
| `FoodSearchModal` + `CreateRecipeModal` | Input/lista/estados de busca TACO e item de resultado | Seleção, inserção na receita, submit e fechamento de cada fluxo |
| `atoms/Badge` + `ui/badge` | Somente a superfície canônica, caso o wrapper não acrescente contrato | Consumidores e lifecycle que ainda dependam de um wrapper documentado |

## Required states

Cada unidade deve documentar os estados aplicáveis entre default, hover, pressed, focus-visible, selected, disabled, loading, error, empty e read-only. Estados não aplicáveis precisam de justificativa no perfil do componente.

## Acceptance contract

- A unidade compartilhada não conhece entidades de domínio fora da sua camada permitida.
- Cada shell mantém os mesmos exports, callbacks e ações observáveis antes da migração.
- Acessibilidade de teclado, foco visível e semântica não é perdida ao mover markup.
- Uma falha de um candidato pode ser revertida sem exigir alterações em candidatos já validados.
