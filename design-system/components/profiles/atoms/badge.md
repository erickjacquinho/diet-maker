# Badge

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-badge` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/Badge.tsx` |
| Public exports | `BadgeProps` (type), `Badge` (component) |

## Purpose

Restringir Badge às receitas semânticas aprovadas do produto.

## Category inheritance

Herda integralmente [feedback](../../categories/feedback.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Badge` e exports visuais registrados: `Badge`. Base declarada: `ui-badge`.

## Allowed variants

Somente variantes nomeadas pela receita do atom; nenhuma aparência ad hoc.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Base declarada: `ui-badge`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label nomeia status/severidade; cor e ícone são redundantes ao texto.

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

Implementado em `atom`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

