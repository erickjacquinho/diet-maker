# Dialog

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-dialog` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/dialog.tsx` |
| Public exports | `Dialog` (component), `DialogPortal` (compound-part), `DialogOverlay` (compound-part), `DialogClose` (compound-part), `DialogTrigger` (compound-part), `DialogContent` (compound-part), `DialogHeader` (compound-part), `DialogFooter` (compound-part), `DialogTitle` (compound-part), `DialogDescription` (compound-part) |

## Purpose

Expor a infraestrutura modal acessível preservada do Radix/Shadcn.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas cobrem root, portal, overlay, trigger, content, header, footer, title, description e close; `Title` é obrigatório no uso modal.

## Visual contract

- `DialogOverlay` usa `overlay-backdrop` e `z-overlay`, sem blur.
- `DialogContent` usa `surface`, `border-subtle`, `rounded-surface`, `shadow-overlay`, `p-6` e `z-modal`.
- `DialogHeader` usa alinhamento a esquerda e `gap-2`; `DialogTitle` usa `dialog-title`; `DialogDescription` usa `body-secondary`.
- `DialogFooter` usa `gap-2` entre acoes, sem `space-x-*`; a acao primaria permanece por ultimo.
- O close e uma area de foco de 32px com `text-muted`, `surface-hover`, `primary-focus` e nome acessivel.

## Allowed variants

## Family contract

`Dialog` provides context and open state. `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle` and `DialogDescription` are context-bound slots; `DialogTrigger` and `DialogClose` are context-bound triggers.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Open/closed seguem o primitivo; erro interno não altera mecanismo de dismissal salvo confirmação destrutiva.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Title único e copy objetiva; body contém a informação completa e footer somente ações.

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

Implementado em `ui`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

