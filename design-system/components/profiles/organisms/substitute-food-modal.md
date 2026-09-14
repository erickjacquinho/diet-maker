# SubstituteFoodModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-substitute-food-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/foods/SubstituteFoodModal.tsx` |
| Public exports | `SubstituteFoodModalProps` (type), `SubstituteFoodModal` (component) |

## Purpose

Coordenar a busca e escolha de um alimento substituto para a quantidade contextual existente.

## Category inheritance

Herda [overlays](../../categories/overlays.md). Traits autorizados: `nutrition-context`, `async`.

## Specific anatomy

Dialog com contexto do alimento, seletor de fonte, campo de busca, resultados, favoritos quando existentes e ações de cancelar/confirmar.

## Allowed variants

Somente as fontes e estados já expostos pelo fluxo; quantidade e callbacks permanecem os contratos atuais.

## Particular states

Busca vazia, carregando, erro recuperável, nenhum resultado, item selecionado e confirmação pendente são comunicados sem fechar prematuramente.

## Composition

Compõe `ui-dialog`, `FoodSearchCategorySelector`, listas de resultados, `IconButton` e `Button`. A quantidade e a persistência pertencem ao consumidor/hook.

## Content rules

Nome, quantidade e unidade do alimento original permanecem visíveis; o resultado escolhido não altera macros por cálculo de apresentação.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`useDietBuilderModals`, template de construção da dieta e consumidores que substituem alimento.

## Acceptance criteria

- foco, título, Escape e retorno obedecem ao contrato de overlays;
- fontes, resultados, quantidade e callback permanecem compatíveis;
- erro e ausência têm recuperação/explicação explícita;
- não há nova persistência nem alteração de tokens/primitivos.

## Implementation status

Implementado em `organism`; fonte e consumidores foram reconciliados no registry.
