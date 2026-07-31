# 03-components / 03-organisms — Organismos canônicos

## 1. `SidebarNav`

Navegação persistente com marca, itens ícone+texto, item ativo escuro, perfil e ações rápidas.

- Desktop: 220–256px, sticky, colapsável para 80px.
- Mobile: Sheet/Drawer; nunca comprime o conteúdo principal.
- Item ativo usa `aria-current="page"`.
- `AppLayoutShell` oferece skip link para pular a navegação.

## 2. `MacroTrackerHeader`

Grid responsivo `1 → 2 → 4` com calorias e três macronutrientes. Integra `MacroMetricCard`; atualizações mantêm texto visível e usam live region apenas para mudanças relevantes.

## 3. `MealCardContainer`

Card de refeição com título, horário pill, total calórico, lista de `MealItemRow`, CTA de adicionar e resumo P/C/G. Se expansível, usa `aria-expanded` e preserva foco.

## 4. `BentoGridContainer`

Grid assimétrico responsivo de 1 a 4 colunas, gaps de 16–24px e spans definidos por props. A ordem visual nunca diverge da ordem DOM; nenhum card possui altura rígida que corte conteúdo em zoom.

## 5. `RoutineBlockOrganism`

Agrupa hábitos/refeições por Manhã, Tarde e Noite. Em desktop pode usar colunas; em mobile empilha na ordem cronológica.

## 6. `HabitTrackerSection`

Combina `FilterPillBar`, cards/lista de `HabitItemRow` e `RoutineBlockOrganism`. Exibe contagem concluída em texto e não somente por checkbox/cor.

## 7. `NutritionalSparklineTable`

Tabela densa com cabeçalho de 40px, linhas padrão de 48px ou compactas de 38px, valores à direita, status ao centro, ações à direita e `SparklineLine` de 120×32px.

- Cabeçalhos usam `<th scope="col">`.
- Ordenação informa `aria-sort`.
- Seleção usa checkbox com label.
- Paginação oferece Anterior/Próximo e total textual.
- Sparkline possui resumo numérico; dados completos podem ser acessados em tabela.

`HighInfoTable` é nome legado e deve ser migrado para `NutritionalSparklineTable`.

## 8. `NutriToastStack`

Stack no canto inferior direito em desktop e largura quase total no topo/rodapé seguro em mobile. Ordem DOM corresponde à ordem visual; limite simultâneo evita sobrecarga. Usa `z-toast` 40.
