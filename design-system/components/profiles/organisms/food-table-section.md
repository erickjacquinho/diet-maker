# FoodTableSection

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-food-table-section` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/foods/FoodTableSection.tsx` |
| Public exports | `FoodTableSectionProps` (type), `FoodTableSection` (component) |

## Purpose

Apresentar alimentos filtrados em uma tabela paginada, ordenável e acionável para manutenção de favoritos e alimentos customizados.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Não possui traits adicionais. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Usa `molecule-data-table` com colunas de favorito, nome, categoria, preparo, kcal, macronutrientes e ações de edição. A barra de filtros e a fonte dos dados permanecem fora da tabela.

## Allowed variants

Uma única tabela de alimentos com paginação client-side de 15 itens. Nome, kcal, proteína, carboidrato e gordura são ordenáveis; categoria, preparo e ações são somente leitura.

## Particular states

O estado vazio explica que nenhum alimento corresponde aos filtros ativos. Favoritar e editar preservam filtros, ordenação e página; a paginação desabilita controles nas extremidades.

## Composition

Compõe `molecule-data-table`, `ui-button`, `ui-badge` e `atom-icon-button`. O organismo mantém callbacks de favorito/edição, valores ordenáveis e filtros; a molécula mantém a estrutura tabular genérica.

## Content rules

Valores nutricionais exibem unidades explícitas (`kcal` e `g`). Alimentos customizados recebem badge textual e a ação de edição só aparece para registros customizados.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

- `src/app/alimentos/page.tsx`

## Acceptance criteria

- identidade, source, exports e categoria coincidem com o registro;
- filtros ocorrem antes de ordenação e paginação;
- ações internas não propagam navegação ou alteram filtros não relacionados;
- empty, sort e page-boundary permanecem acessíveis e verificáveis.

## Implementation status

Implementado em `organism`; perfil homologado junto com a migração para `molecule-data-table`.
