# RecipeCard

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-recipe-card` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/RecipeCard.tsx` |
| Public exports | `RecipeCardProps` (type), `RecipeCard` (component) |

## Purpose

Resumir uma receita e oferecer sua ação principal de abertura.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `interactive-surface`, `nutrition-macro`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `RecipeCard` e exports visuais registrados: `RecipeCard`. Base declarada: `atom-surface`; o resumo de macros interno continua tratamento de data-display e não cria card aninhado.

## Allowed variants

Static ou interactive-surface; nunca ambos com ação interna concorrente.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Base declarada: `atom-surface`. O resumo de macros interno é uma exceção de tratamento de dados, não uma segunda superfície de card. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Nomes, kcal, g e percentuais seguem o contexto do domínio; macro sempre possui nome textual.

## Exceptions

`inner-macro-summary-data-display`: o resumo de macros interno mantém anatomia compacta de data-display e não deve receber `Surface` aninhado; sua exceção é protegida por teste de consumidor.
ExceptionRecord: inner-macro-summary-data-display reviewAt: 2026-09-30 owner: design-system-maintainers

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

