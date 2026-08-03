# RecipeIngredientRow

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-recipe-ingredient-row` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/RecipeIngredientRow.tsx` |
| Public exports | `RecipeIngredientRowProps` (type), `RecipeIngredientRow` (component) |

## Purpose

Apresentar um ingrediente com quantidade e contribuição nutricional.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `RecipeIngredientRow` e exports visuais registrados: `RecipeIngredientRow`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Read-only ou editable-actions.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Nomes, kcal, g e percentuais seguem o contexto do domínio; macro sempre possui nome textual.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `molecule`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

