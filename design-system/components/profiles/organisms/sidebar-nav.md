# SidebarNav

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-sidebar-nav` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/SidebarNav.tsx` |
| Public exports | `useSidebarContext` (hook), `SidebarNavProps` (type), `SidebarBrandProps` (type), `SidebarNavItemProps` (type), `SidebarUserProfileProps` (type), `SidebarQuickActionsProps` (type), `SidebarNavComponent` (compound-part), `SidebarNav` (component) |

## Purpose

Coordenar brand, destinos, quick actions e perfil na navegação persistente.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Traits autorizados: `collapsible`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Slots concretos: brand, nav groups/items, quick actions, spacer e user profile; root controla expanded/collapsed.

## Allowed variants

Expanded 224 e collapsed 64.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

The organism owns the collapse context and composes the four sidebar molecules through their public prop contracts; it no longer defines or reexports their implementations.

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Labels nomeiam destinos; estado current é programático; collapsed conserva nome completo.

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

Implementado em `organism`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

