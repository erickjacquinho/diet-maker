# ProgressBar

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-progress-bar` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/ProgressBar.tsx` |
| Public exports | `ProgressBarProps` (type), `ProgressBar` (component) |

## Purpose

Representar progresso determinado genérico ou de macronutriente.

## Category inheritance

Herda integralmente [loading](../../categories/loading.md). Traits autorizados: `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `ProgressBar` e exports visuais registrados: `ProgressBar`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Determinate generic ou protein/carbohydrate/fat.

## Particular states

Valor acima da meta limita apenas a largura visual; texto/semântica conservam o valor real.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label descreve a operação; indicador não inventa conteúdo nem progresso.

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

