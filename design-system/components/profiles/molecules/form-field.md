# FormField

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-form-field` |
| Nature | `product-generic` |
| Lifecycle | `proposed` |
| Current layer | `null` |
| Target layer | `molecule` |
| Sources | nenhuma fonte — proposta |
| Public exports | `FormFieldProps` (type), `FormField` (component) |

## Purpose

Propor a composição label, control, helper e validation.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `FormField` e exports visuais registrados: `FormField`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Control single-line ou multiline; optional helper; validation error/success.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

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

