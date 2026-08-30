# MealItemRow

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-meal-item-row` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/MealItemRow.tsx` |
| Public exports | `MealItemRowProps` (type), `MealItemRow` (component) |

## Purpose

Apresentar um alimento da refeição com quantidade, energia e macros.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `MealItemRow` e exports visuais registrados: `MealItemRow`. Base declarada: `atom-surface`; inputs e actions continuam componentes próprios.

## Allowed variants

Read-only ou editable-actions; estrutura do row não muda.

## Particular states

Quantidade ausente é dado incompleto, não zero; remoção pending bloqueia apenas a action do row.

## Composition

Base declarada: `atom-surface`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Nomes, kcal, g e percentuais seguem o contexto do domínio; macro sempre possui nome textual. As colunas de nutrientes seguem rigorosamente a ordem canônica: Proteína (`g`), Carboidrato (`g`), Gordura (`g`) e Calorias (`kcal`).

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

