# AlertDialog

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-alert-dialog` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/alert-dialog.tsx` |
| Public exports | `AlertDialog`, compound parts `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` |

## Purpose

Fornecer a infraestrutura modal acessível para confirmações que exigem decisão explícita antes de prosseguir.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Não possui trait adicional.

## Specific anatomy

Root controlado, portal, backdrop, content, header, title, description, footer, action e cancel.

## Allowed variants

Modal de confirmação com ação primária, secundária ou destrutiva definida pelo consumidor.

## Particular states

Mantém abertura controlada, foco preso enquanto ativo, fechamento por Escape e retorno do foco ao gatilho conforme o contrato Radix.

## Composition

Compõe `@radix-ui/react-alert-dialog` e `ui-button` por meio de `buttonVariants`. Não contém regras de domínio.

## Content rules

Todo uso deve fornecer título acessível, descrição contextual e uma ação explícita de cancelamento ou confirmação adequada ao risco.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `molecule-confirmation-alert-dialog`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- foco, portal, modal state e dismissal permanecem delegados ao Radix;
- estilos utilizam os tokens do design system.

## Implementation status

Implementado em `ui` e homologado documentalmente no catálogo.
