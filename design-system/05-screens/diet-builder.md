# 05-screens / diet-builder — Montagem e edição de dieta

## Objetivo

Permitir que o nutricionista monte e ajuste um plano alimentar em tempo real, com alta densidade, leitura clara e feedback imediato.

## Composição

1. `AppLayoutShell` com `SidebarNav`.
2. Action header e `PatientBadgeHeader`.
3. `MacroTrackerHeader`: Kcal, proteína, carboidratos e gorduras.
4. `DietBuilderTemplate` em Bento:
   - coluna principal com `MealCardContainer`;
   - painel de suporte com `TacoFoodSelector`;
   - `HabitTrackerSection` e rotina por período.
5. `NutriToastStack`.

## Padrões importados das referências

- Habit tracker: filtros pill, checkbox circular, hábitos e rotina.
- KuCoin: sidebar compacta, perfil e alta densidade.
- Shadcn Bento: grid assimétrico, formulários integrados, stepper e histograma de metas.
- Toasts: quatro estados com badge pastel sólido e ícone Lucide.

## Comportamentos

1. Alterar gramas atualiza refeição e macros globais em menos de 50ms no cenário homologado.
2. Stepper respeita limites e permite teclado.
3. Busca TACO possui loading, resultados, vazio, erro e seleção por teclado.
4. Reordenação de alimentos oferece drag-and-drop e alternativa “Mover para cima/baixo”.
5. Salvar percorre `idle → loading → success|error` e bloqueia duplicação.

## Responsividade

- Mobile: uma coluna; painel TACO abre como Sheet/Dialog; ações possuem 44×44px.
- Tablet: duas colunas quando o conteúdo comportar.
- Desktop: três colunas, refeições ocupando span 2.
- Nenhum viewport gera scroll horizontal da página.

## Acessibilidade

- H1 único e landmarks.
- Labels visíveis e helpers próximos aos campos.
- Valores dos gráficos também aparecem em texto.
- Foco retorna ao gatilho ao fechar modal/popover.
- Toast success usa status; warning/error usam alert.

## Estados

- Loading: skeleton com altura reservada.
- Vazio: `NutriEmptyState` com CTA para adicionar refeição/alimento.
- Erro: mensagem contextual + retry.
- Meta ultrapassada: texto, ícone e cor semântica; nunca apenas cor.
