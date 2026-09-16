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

Root `MealItemRow` e exports visuais registrados: `MealItemRow`. A linha é renderizada dentro de uma tabela e recebe opcionalmente as props de interação de `molecule-sortable-list`; inputs e actions continuam componentes próprios.

## Allowed variants

Read-only ou editable-actions; quando usado em uma lista ordenável, a linha inteira recebe foco e interação de ponteiro/teclado sem alterar a estrutura tabular.

## Particular states

Quantidade ausente é dado incompleto, não zero; valores numéricos válidos digitados recalculam os macros imediatamente, enquanto o vazio permanece local até a normalização. Remoção pending bloqueia apenas a action do row. Durante a ordenação, preview e placeholder pertencem a `SortableList`, enquanto a linha mantém seus dados e ações.

## Composition

Compõe `ui-table`, `SortableList`, inputs e actions. `MealItemRow` permanece responsável pela célula e callbacks do alimento; a molécula genérica controla posição, preview, placeholder e anúncio. Controles interativos aninhados continuam focáveis e operáveis sem iniciar movimento quando não há deslocamento.

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
- a linha pode ser reordenada por ponteiro e pelas setas do teclado através de `SortableList`;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `molecule`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

