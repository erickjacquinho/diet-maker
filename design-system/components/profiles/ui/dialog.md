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

## Allowed variants

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

