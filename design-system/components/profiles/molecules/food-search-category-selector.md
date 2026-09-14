# FoodSearchCategorySelector

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-food-search-category-selector` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/food-search/FoodSearchCategorySelector.tsx` |
| Public exports | `FoodSearchCategorySelectorProps` (type), `FoodSearchCategorySelector` (component) |

## Purpose

Permitir a escolha única da fonte de busca de alimentos, refeições prontas ou receitas.

## Category inheritance

Herda [selection](../../categories/selection.md). Nenhum trait adicional.

## Specific anatomy

Grupo controlado de opções nomeadas; uma opção permanece selecionada enquanto o usuário alterna a fonte.

## Allowed variants

Somente a cardinalidade single e os valores de categoria já definidos pelo domínio.

## Particular states

Estado selecionado, foco, disabled e mudança pendente são comunicados pelo primitivo e por texto/estado acessível; não há estado vazio selecionável.

## Composition

Compõe o primitivo de seleção vigente e labels. Não mistura roles de tab com seleção de domínio nem atribui semântica por cor.

## Content rules

Labels distinguem as três fontes e permanecem estáveis; não usar ícone ou cor como único indicador.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`FoodSearchModal` e `SubstituteFoodModal`, além dos testes de busca; consumidores finais constam no registry.

## Acceptance criteria

- uma única opção é anunciada como selecionada;
- teclado, foco e labels permanecem operáveis;
- alternar categoria conserva callbacks e resultados correspondentes;
- nenhum role ou token incompatível é introduzido.

## Implementation status

Implementado em `molecule`; perfil criado para a receita de seleção existente.
