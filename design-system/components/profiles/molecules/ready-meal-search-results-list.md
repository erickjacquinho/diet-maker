# ReadyMealSearchResultsList

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-ready-meal-search-results-list` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/food-search/ReadyMealSearchResultsList.tsx` |
| Public exports | `ReadyMealSearchResultsListProps` (type), `ReadyMealSearchResultsList` (component) |

## Purpose

Exibir resultados de refeições prontas em tabela para seleção no fluxo de busca.

## Category inheritance

Herda [data-display](../../categories/data-display.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

`DataTable` com caption, colunas de identificação e nutrientes, seleção e estados internos.

## Allowed variants

Usa somente configuração de tabela, seleção, ordenação e virtualização já oferecidas pela API viva.

## Particular states

Busca vazia, carregamento, erro recuperável e nenhum resultado são estados da tabela; seleção mantém identidade estável.

## Composition

Compõe `molecule-data-table` e células de conteúdo nutricional. Não duplica headers, seleção ou linha de estado.

## Content rules

Nome, porção, unidade e nutrientes mantêm a precisão recebida; texto longo permanece acessível.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`FoodSearchModal` e `SubstituteFoodModal`.

## Acceptance criteria

- todos os estados tabulares ficam dentro da tabela canônica;
- caption, headers, chaves e seleção são acessíveis;
- resultados e callbacks existentes permanecem inalterados;
- paginação/virtualização existente não é removida.

## Implementation status

Implementado em `molecule`; perfil criado para fechar a família de resultados.
