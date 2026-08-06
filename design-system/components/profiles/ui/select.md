# Select

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-select` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/select.tsx` |
| Public exports | `Select` (component), `SelectGroup` (compound-part), `SelectValue` (compound-part), `SelectTrigger` (compound-part), `SelectContent` (compound-part), `SelectLabel` (compound-part), `SelectItem` (compound-part), `SelectSeparator` (compound-part), `SelectScrollUpButton` (compound-part), `SelectScrollDownButton` (compound-part) |

## Purpose

Expor escolha single em listbox ancorada a um trigger.

## Category inheritance

Herda integralmente [selection](../../categories/selection.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas cobrem root/group/value/trigger/content, label, item, separator e scroll buttons; trigger + content + item formam o mínimo.

## Visual contract

- O `SelectTrigger` usa a receita canônica `recipes.input` em densidade `standard` por padrão, alinhando altura, radius, borda, superfície, foco e tipografia `field-value` aos demais controles de campo.
- O layout interno reserva o lado direito para o chevron sem alterar a geometria do controle; overrides de consumidor devem respeitar a categoria `selection`.
- O indicador do item selecionado fica à direita do label, com área reservada por `pr-8`, mantendo a leitura do texto à esquerda.
- O `SelectContent` usa `surface`, `border-subtle`, `rounded-control`, `shadow-floating`, `p-1` e `z-popover`; não usa `bg-popover`/`text-popover-foreground` legados.
- Os itens usam `nav-item`, `text-secondary`, `surface-hover` no foco e `primary-soft`/`primary`/`primary-border` quando selecionados; separadores usam `border-divider`.

## Allowed variants

## Family contract

`Select` provides selection context and keyboard navigation. Group, value, trigger, content, label, item, separator and scroll-button exports are context-bound parts of one selection family.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Placeholder não é opção selecionada; lista vazia comunica empty dentro do content.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Cada opção tem label estável; valor persistido não depende da apresentação.

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

