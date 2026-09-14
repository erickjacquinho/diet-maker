# RecipeSearchResultsList

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-recipe-search-results-list` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/food-search/RecipeSearchResultsList.tsx` |
| Public exports | `RecipeSearchResultsListProps` (type), `RecipeSearchResultsList` (component) |

## Purpose

Exibir receitas encontradas em tabela para seleção e composição da dieta.

## Category inheritance

Herda [data-display](../../categories/data-display.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

`DataTable` com caption, nome, porções, nutrientes, seleção e estados internos de consulta.

## Allowed variants

Somente configurações já disponíveis de tabela, seleção, ordenação e virtualização.

## Particular states

Query vazia, carregamento, erro, empty e seleção são comunicados dentro da tabela sem item fictício.

## Composition

Compõe `molecule-data-table` e células de receita; não duplica mecanismo de seleção nem desloca estado vazio para fora da tabela.

## Content rules

Porções, unidades e nutrientes preservam os valores da receita; nomes longos não são truncados de modo a perder informação crítica.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`FoodSearchModal` e `SubstituteFoodModal`.

## Acceptance criteria

- tabela semântica com caption, headers e chaves estáveis;
- empty/loading/error ficam no contrato canônico;
- seleção e callbacks permanecem compatíveis;
- dados e paginação/virtualização não são alterados.

## Implementation status

Implementado em `molecule`; perfil criado para a família de resultados de receitas.
