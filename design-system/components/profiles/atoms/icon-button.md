# IconButton

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-icon-button` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/IconButton.tsx` |
| Public exports | `IconButton` (component), `EditIconButton` (compound-part), `DeleteIconButton` (compound-part), `IconButtonProps` (type), `ExplicitIconButtonProps` (type) |

## Purpose

Executar ação compacta sem label visual, sempre com nome acessível.

## Category inheritance

Herda integralmente [actions](../../categories/actions.md). Traits autorizados: `icon-only`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `IconButton` e exports visuais registrados: `IconButton`, `EditIconButton`, `DeleteIconButton`. Base declarada: `atom-button`.

## Allowed variants

Somente compact/standard e prioridades aprovadas; `icon-only` é obrigatório.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Base declarada: `atom-button`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label específico deve ser verbo curto; icon-only fornece accessible name equivalente.

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

