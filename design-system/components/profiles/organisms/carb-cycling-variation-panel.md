# CarbCyclingVariationPanel

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-carb-cycling-variation-panel` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/diet/CarbCyclingVariationPanel.tsx` |
| Public exports | `CarbCyclingVariationPanelProps` (type), `CarbCyclingVariationPanel` (component) |

## Purpose

Coordenar a seleção, edição e reordenação das variações de ciclo de carboidratos existentes.

## Category inheritance

Herda [selection](../../categories/selection.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

Seção com escolha da variação, ações de edição/cópia/remoção e lista reordenável das variações existentes.

## Allowed variants

Somente modos e variações fornecidos pelo domínio; a cardinalidade de escolha e as ações atuais não mudam.

## Particular states

Seleção pendente, confirmação de descarte, erro recuperável e reordenação em andamento comunicam estado sem perder a escolha anterior.

## Composition

Compõe controles de seleção, `IconButton`, `Button` e linhas da lista. A atualização do ciclo permanece no hook/serviço consumidor.

## Content rules

Labels nomeiam dias e variações de forma estável; dados nutricionais mantêm unidades e não são recalculados pela apresentação.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`DietContextSection` e `DietModeSwitcher`, registrados no registry.

## Acceptance criteria

- a implementação pertence à camada organism sem dependência ascendente;
- ações e seleção permanecem separadas e operáveis por teclado;
- reordenação e confirmação preservam callbacks e dados do domínio;
- nenhuma variante visual nova é introduzida.

## Implementation status

Implementado em `organism`; fonte e consumidores reconciliados no registry.
