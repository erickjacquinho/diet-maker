# MacroSummary

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-macro-summary` |
| Nature | `domain-nutrition` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/MacroSummary.tsx` |
| Public exports | `MacroSummaryProps` (type), `MacroSummary` (component), `MacroNutrientSummary` (alias) |

## Purpose

Resumir os valores de proteína, carboidrato, gordura e energia de um contexto nutricional já calculado.

## Category inheritance

Herda [nutrition-domain](../../categories/nutrition-domain.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

Uma linha ou bloco de quatro métricas na ordem proteína → carboidrato → gordura → calorias; `MacroNutrientSummary` é alias público da mesma família.

## Allowed variants

Somente as opções de conteúdo já expostas pela API; não aceita props para redefinir token, escala ou geometria.

## Particular states

Valor zero é exibido como zero; valor ausente recebe conteúdo explícito. O componente não inventa valores para uma métrica ausente.

## Composition

Compõe texto semântico e ícones/indicadores já catalogados. O cálculo e a origem do snapshot pertencem ao consumidor de domínio, não a esta molécula.

## Content rules

Cada número exibe sua unidade; energia usa kcal quando fornecida. A ordem e a precisão recebidas são preservadas e a cor nunca é a única indicação.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

Importação, histórico de dietas, histórico de consultas e cartões nutricionais que exibem o resumo; a lista definitiva permanece no registry.

## Acceptance criteria

- identidade, alias, source e exports coincidem com o registro;
- a ordem e os valores recebidos permanecem estáveis;
- zero e ausência são semanticamente distintos;
- nenhum cálculo, persistência ou decisão visual é criado pelo consumidor.

## Implementation status

Implementado em `molecule`; perfil criado para fechar o ownership do alias e dos avisos tabulares.
