# 03-components / 04-templates — Templates canônicos

> Templates articulam organismos e layout. Recebem conteúdo e dados por props; não contêm dados reais, chamadas de API ou strings de domínio fixas.

## 1. `AppLayoutShell`

- Canvas `bg-warm-bg min-h-screen`.
- `SidebarNav` no desktop e Sheet no mobile.
- Skip link “Ir para o conteúdo principal”.
- `<main id="main-content">` com `min-w-0`, foco programático em mudanças de rota e scroll vertical.

## 2. `DietBuilderTemplate`

Integra:

1. Action header e `PatientBadgeHeader`.
2. `MacroTrackerHeader`.
3. `BentoGridContainer`.
4. Coluna principal de `MealCardContainer`.
5. Painel de `TacoFoodSelector`.
6. `HabitTrackerSection`.
7. `NutriToastStack`.

Layout: 1 coluna em mobile; `lg:grid-cols-3`, refeições em duas colunas de span e suporte em uma. Não possui dados hardcoded.

## 3. `PatientDashboardTemplate`

Integra `PatientBadgeHeader`, resumo clínico em Bento, `HabitTrackerSection` e `NutritionalSparklineTable`. Em mobile, cabeçalho, filtros, métricas e histórico seguem a ordem de leitura.

## Mapeamento de rotas

| Rota | Template |
| :--- | :--- |
| `src/app/page.tsx` | `AppLayoutShell` + dashboard |
| `src/app/dieta/page.tsx` | `AppLayoutShell` + `DietBuilderTemplate` |
| `src/app/pacientes/page.tsx` e detalhe | `AppLayoutShell` + `PatientDashboardTemplate` |
