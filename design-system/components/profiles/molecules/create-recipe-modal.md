# CreateRecipeModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-create-recipe-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/CreateRecipeModal.tsx` |
| Public exports | `CreateRecipeModalProps` (type), `CreateRecipeModal` (component) |

## Purpose

Criar ou editar receitas, buscando ingredientes TACO e exibindo os macros calculados por porção.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos, seleção e ações do sistema. Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com título acessível, campos de identificação, busca de ingredientes, lista rolável, resumo de macros e instruções, seguido de footer de ações.

## Allowed variants

Create quando `recipe` é nulo e edit quando existe receita. O contrato não expõe decisões visuais livres.

## Particular states

Resultados de busca aparecem somente após consulta suficiente; submit bloqueia nome vazio ou receita sem ingredientes e anuncia erro via toast.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-select`, `ui-button`, `molecule-taco-search-input`, `molecule-recipe-ingredient-row` e `molecule-auto-kcal-section`. Persistência permanece no consumidor.

## Content rules

Ingredientes exibem nome, quantidade e unidade; o resumo de macros deve manter contexto de porção.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/receitas/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- busca, quantidade e remoção ficam encapsuladas no modal;
- validação bloqueia payload inválido;
- dialog mantém body rolável, title e footer acessíveis.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
