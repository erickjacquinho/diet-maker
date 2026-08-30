# ConfirmationAlertDialog

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-confirmation-alert-dialog` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/ConfirmationAlertDialog.tsx` |
| Public exports | `ConfirmationAlertDialogProps` (type), `ConfirmationAlertDialog` (component) |

## Purpose

Centralizar a composição visual e acessível de confirmações do produto sem acoplar regras de negócio ou mensagens a um fluxo específico.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Não possui trait adicional.

## Specific anatomy

Root controlado com título, descrição, botão de cancelamento e botão de confirmação. O ícone de aviso padrão pode ser substituído pelo consumidor quando necessário.

## Allowed variants

Confirmação neutra ou destrutiva por meio da variante da ação; labels e conteúdo são fornecidos pelo consumidor.

## Particular states

Preserva os estados de abertura, fechamento, cancelamento, confirmação e foco definidos por `ui-alert-dialog`.

## Composition

Base declarada: `ui-alert-dialog`. Compõe as partes do alerta e as variantes de `ui-button`; não acessa hooks, stores ou regras de domínio.

## Content rules

O título deve ser curto, a descrição deve explicar a consequência da decisão e os labels devem usar verbos claros no imperativo.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`; atualmente `src/app/alimentos/page.tsx`, `src/app/pacientes/[id]/avaliacao/[assessmentId]/page.tsx` e `organism-meal-card-container`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- nenhuma regra de negócio fica no componente;
- cancelamento, confirmação, foco e acessibilidade são delegados ao primitivo;
- estilos e variantes seguem os tokens e receitas existentes.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
