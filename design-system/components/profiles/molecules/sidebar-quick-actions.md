# SidebarQuickActions

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-sidebar-quick-actions` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/SidebarQuickActions.tsx` |
| Public exports | `SidebarQuickActionsProps` (type), `SidebarQuickActions` (component) |

## Purpose

Agrupar comandos rápidos da sidebar sem transformá-los em rotas.

## Category inheritance

Herda integralmente [actions](../../categories/actions.md). Traits autorizados: `collapsible`, `icon-only`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `SidebarQuickActions` e exports visuais registrados: `SidebarQuickActions`. Não possui primitive base único; compõe `Button`, `IconButton` e `Tooltip` por seus contratos públicos.

## Allowed variants

Expanded e collapsed, mantendo a mesma lista de comandos.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

The molecule owns the save/open action composition and receives callbacks and collapse state by props. It does not depend on the `SidebarNav` organism; the organism only supplies callbacks and presentation state.

Sem primitive base único; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label específico deve ser verbo curto; icon-only fornece accessible name equivalente.

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

Implementado em `molecule`; perfil homologado. Os mesmos comandos permanecem disponíveis em expanded e collapsed, com accessible names equivalentes.

