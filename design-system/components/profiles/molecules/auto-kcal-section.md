# AutoKcalSection

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-auto-kcal-section` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/AutoKcalSection.tsx` |
| Public exports | `AutoKcalSectionProps` (type), `AutoKcalSection` (component) |

## Purpose

Apresentar e controlar o cálculo automático de energia da dieta.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `AutoKcalSection` e exports visuais registrados: `AutoKcalSection`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

`manual-override` pausa a atualização automática e exige indicação textual; recalculating usa `async` sem apagar o último valor válido.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Nomes, kcal, g e percentuais seguem o contexto do domínio; macro sempre possui nome textual.

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

