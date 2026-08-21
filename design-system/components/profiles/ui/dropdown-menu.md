# DropdownMenu

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-dropdown-menu` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/dropdown-menu.tsx` |
| Public exports | `DropdownMenu` (component), `DropdownMenuTrigger` (compound-part), `DropdownMenuContent` (compound-part), `DropdownMenuItem` (compound-part), `DropdownMenuCheckboxItem` (compound-part), `DropdownMenuRadioItem` (compound-part), `DropdownMenuLabel` (compound-part), `DropdownMenuSeparator` (compound-part), `DropdownMenuShortcut` (compound-part), `DropdownMenuGroup` (compound-part), `DropdownMenuPortal` (compound-part), `DropdownMenuSub` (compound-part), `DropdownMenuSubContent` (compound-part), `DropdownMenuSubTrigger` (compound-part), `DropdownMenuRadioGroup` (compound-part) |

## Purpose

Expor menu compound de comandos e escolhas contextuais.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas cobrem root/trigger/content, group, label, item, checkbox/radio item, separator, shortcut e submenu; cada item conserva semântica própria.

## Visual contract

- `DropdownMenuContent` e `DropdownMenuSubContent` usam `z-dropdown`, `surface`, `border-subtle`, `rounded-control` e `shadow-floating`/`shadow-overlay` conforme o papel.
- Dropdowns não recebem `z-popover` ou valores arbitrários; a camada contextual modal é responsabilidade de um primitivo que ofereça contrato explícito.

## Allowed variants

## Family contract

`DropdownMenu` provides menu context and keyboard navigation. Trigger, content, item, group, portal, submenu, label, separator, shortcut and radio parts require that context and are never independent families.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

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

