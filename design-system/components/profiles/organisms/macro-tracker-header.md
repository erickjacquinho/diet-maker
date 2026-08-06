# MacroTrackerHeader

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-macro-tracker-header` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/MacroTrackerHeader.tsx` |
| Public exports | `MacroTrackerHeaderProps` (type), `MacroTrackerHeader` (component) |

## Purpose

Coordenar totais e metas de energia/macros no topo do workflow.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Header com energia total e três MacroMetricCard em ordem proteína, carboidrato e gordura.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Metas ausentes geram estado partial explícito; nenhum macro desaparece silenciosamente.

## Composition

Base declarada: `atom-surface`. Compõe `Surface`, `PatientBadgeHeader` e `MacroMetricCard`; compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

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

Implementado em `organism`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

