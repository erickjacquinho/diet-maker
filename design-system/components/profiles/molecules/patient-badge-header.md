# PatientBadgeHeader

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-patient-badge-header` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/PatientBadgeHeader.tsx` |
| Public exports | `PatientBadgeHeaderProps` (type), `PatientBadgeHeader` (component) |

## Purpose

Identificar o paciente ativo com avatar, nome e metadados.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Traits autorizados: `identity`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `PatientBadgeHeader` e exports visuais registrados: `PatientBadgeHeader`. Base declarada: `atom-avatar`.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Base declarada: `atom-avatar`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Valores usam locale pt-BR, unidade explícita e alinhamento definido pela categoria.

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

Implementado em `molecule`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

