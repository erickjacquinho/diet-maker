# MacroMetricCard

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-macro-metric-card` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/MacroMetricCard.tsx` |
| Public exports | `MacroMetricCardProps` (type), `MacroMetricCard` (component) |

## Purpose

Apresentar valor, unidade, meta e progresso de um macronutriente.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `MacroMetricCard` e exports visuais registrados: `MacroMetricCard`. Base declarada: `atom-surface`; badge, progresso, valores e cores permanecem responsabilidade da molécula.

## Allowed variants

Nutrient protein/carbohydrate/fat e hierarquia compact/standard.

## Particular states

`over-target` mantém a cor do macro e comunica excesso por texto/valor, nunca por trocar para error.

## Composition

Base declarada: `atom-surface`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

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

