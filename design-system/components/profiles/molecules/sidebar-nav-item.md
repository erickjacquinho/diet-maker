# SidebarNavItem

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-sidebar-nav-item` |
| Nature | `product-generic` |
| Lifecycle | `migration-required` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/SidebarNavItem.tsx` |
| Public exports | `SidebarNavItem` (component) |

## Purpose

Representar um destino da sidebar e sua condição current.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Traits autorizados: `collapsible`, `icon-only`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `SidebarNavItem` e exports visuais registrados: `SidebarNavItem`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Default/current em expanded ou collapsed.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

The molecule owns route-item rendering and receives collapse/active state by props. It does not reexport or import the `SidebarNav` organism.

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

Implementado em `molecule`, especificado para `molecule`; perfil homologado, código ainda requer migração em SDD posterior.

