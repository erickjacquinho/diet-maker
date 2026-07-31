# Textarea

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-textarea` |
| Nature | `ui-generic` |
| Lifecycle | `proposed` |
| Current layer | `null` |
| Target layer | `ui` |
| Sources | nenhuma fonte — proposta |
| Public exports | `TextareaProps` (type), `Textarea` (component) |

## Purpose

Propor entrada genérica multiline alinhada ao contrato de fields.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Textarea` e exports visuais registrados: `Textarea`. Base declarada: `ui-input`.

## Allowed variants

Standard e invalid/read-only; resize vertical.

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

Proposta documentada (`specified`), sem fonte atual e fora da baseline. Implementação futura exige SDD próprio e atualização do registro.

