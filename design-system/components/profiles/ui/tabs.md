# Tabs

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-tabs` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/tabs.tsx` |
| Public exports | `Tabs` (component), `TabsList` (compound-part), `TabsTrigger` (compound-part), `TabsContent` (compound-part) |

## Purpose

Expor seleção de tab e painéis associados com teclado completo.

## Category inheritance

Herda integralmente [selection](../../categories/selection.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas: root, list, trigger e content; cada trigger controla exatamente um content.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Tab disabled permanece na ordem sem ativação; seleção e foco são estados distintos.

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

