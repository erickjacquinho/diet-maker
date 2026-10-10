# CreateRecipeModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-create-recipe-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/CreateRecipeModal.tsx` |
| Public exports | `CreateRecipeModalProps` (type), `CreateRecipeModal` (component) |

## Purpose

Criar ou editar receitas com quantidade e unidade de rendimento, buscando ingredientes TACO e exibindo o total de macros e kcal dos ingredientes adicionados; o rendimento define a base por porção, 100 g, 100 ml ou unidade no consumo.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos, seleção e ações do sistema. Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com título acessível, campos de identificação, categoria, quantidade e unidade do rendimento, busca de ingredientes, lista rolável, resumo do total da receita e instruções, seguido de footer de ações.

## Allowed variants

Create quando `recipe` é nulo e edit quando existe receita. O contrato não expõe decisões visuais livres.

## Particular states

Resultados de busca aparecem somente após consulta suficiente; submit bloqueia nome vazio ou receita sem ingredientes e anuncia erro via toast.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-select`, `ui-button`, `molecule-taco-search-input`, `molecule-recipe-ingredient-row`, `molecule-macro-summary` e `molecule-auto-kcal-section`. Persistência permanece no consumidor.

## Content rules

Ingredientes exibem nome, quantidade e unidade; a unidade do rendimento acompanha seu valor; quando há ingredientes, o resumo identifica "Total da receita" e soma proteína, carboidrato, gordura e kcal de todos eles, sem dividir pelo rendimento.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/receitas/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- busca, quantidade e remoção ficam encapsuladas no modal;
- o resumo mostra os totais dos ingredientes atuais e não aparece vazio;
- validação bloqueia payload inválido;
- dialog mantém body rolável, title e footer acessíveis.

## Implementation status

Implementado em `organism` e homologado documentalmente no catálogo.
