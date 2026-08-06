# Collapsible

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-collapsible` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/collapsible.tsx` |
| Public exports | `Collapsible` (component), `CollapsibleTrigger` (compound-part), `CollapsibleContent` (compound-part) |

## Purpose

Expor a família genérica Radix para disclosure de conteúdo local, sem definir conteúdo de negócio, rotas ou a aparência de um grupo específico.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Trait autorizado: `collapsible`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root, trigger e content compõem a família de disclosure local; o root pode ser controlado ou não controlado.

## Allowed variants

Estado `open`/`closed`; nenhuma variante visual autônoma além dos atributos de estado fornecidos pelo primitive.

## Particular states

Open, closed e focus-visible são observáveis; o conteúdo fechado segue o comportamento de montagem do Radix.

## Primitive API

`Collapsible` owns open state; `CollapsibleTrigger` invokes the disclosure and `CollapsibleContent` contains the conditional region. Controlled and uncontrolled Radix props remain available to consumers. The primitive is generic and may be composed by a product organism.

## State and focus behavior

The trigger retains native keyboard activation and exposes Radix state attributes for styling. Content is hidden when closed and is mounted according to Radix content behavior. Focus-visible treatment and accessible trigger naming are supplied by the consuming composition.

## Composition

The primitive does not know navigation items, route matching, labels, icons or product tokens. `SidebarNav` uses it only for future-capable grouped navigation while the default production navigation remains flat.

## Content rules

O trigger recebe nome acessível do consumidor; o content contém somente a região associada ao disclosure.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores está em `design-system/components/registry.json`.

## Acceptance criteria

The trigger is keyboard-operable, exposes state for styling, and the primitive remains independent of product routes and labels.

## Implementation status

Implementado em `ui`; perfil homologado documentalmente. Homologação não declara conformidade visual sem a evidência manual correspondente.
