# Input

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-input` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/Input.tsx` |
| Public exports | `InputProps` (type), `Input` (component) |

## Purpose

Consolidar defaults de campo de uma linha do produto.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Input` e exports visuais registrados: `Input`. Base declarada: `ui-input`.

## Allowed variants

Mesmo subconjunto de Input, com defaults do produto; não adiciona tipo visual.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Base declarada: `ui-input`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label e tipo são explícitos; placeholder não substitui label; unidade fica fora do valor editável.

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

