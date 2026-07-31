# 03-components / 02-molecules — Moléculas canônicas

## Contrato universal

Moléculas combinam dois ou mais átomos, mantêm responsabilidade única, recebem dados por props e não acessam APIs diretamente.

## 1. `MacroMetricCard`

Card de KPI com label, valor atual/meta em `Fira Code`, unidade, status textual e uma visualização compacta.

- Variantes de visualização: `progress`, `sparkline` ou `stepper-histogram`.
- Proteína, carboidratos, gorduras e fibras usam tokens nutricionais.
- Valor e percentual ficam sempre visíveis; gráfico é complementar.
- Estado estático não recebe hover.

## 2. `MealItemRow`

Linha de alimento com drag handle, nome, porção, P/C/G, Kcal, edição de gramas e remoção.

- Valores usam `font-mono`.
- Drag-and-drop possui alternativa por teclado “Mover para cima/baixo”.
- Ações têm 44×44px em touch e labels contextuais.
- Linha não depende de hover para revelar ações essenciais.

## 3. `PatientBadgeHeader`

Cabeçalho compacto com avatar, nome, UID, idade, objetivo, peso atual e percentual de gordura. Em mobile, metadados quebram para uma coluna; a ordem DOM acompanha a visual.

## 4. `NutriToast`

Anatomia obrigatória:

1. Card branco sólido `rounded-card`, borda de 1px, sem sombra e sem gradiente.
2. Badge 36×36px `rounded-control` com fundo pastel sólido.
3. Ícone Lucide de 20px: `Info`, `CheckCircle2`, `AlertTriangle` ou `AlertCircle`.
4. Título semibold e descrição secundária.
5. `X` Lucide à direita em botão com `aria-label="Fechar notificação"`.

Variantes: `info`, `success`, `warning`, `error`. Info/success usam `role="status"`; warning/error usam `role="alert"`. Fechar não pode interromper foco ou remover anúncio antes da leitura.

## 5. `HabitItemRow`

Badge circular de 40×40px, título, área/dificuldade/tempo e `NutriCheckbox`. O card pode ser interativo, mas o checkbox mantém alvo e nome acessível próprios.

## 6. `NutriEmptyState`

Ícone Lucide em badge sólido de 48px, H2 de 18px, descrição de 13px e CTA. Deve explicar o estado e a ação possível sem culpar o usuário.

## 7. `FilterPillBar`

Lista de filtros `Categoria (N)` em pills. Usa `aria-pressed` ou Tabs conforme o comportamento, suporta setas quando for tablist e permite wrap/scroll próprio em mobile sem gerar scroll da página.

## 8. `RadioCards`

Grupo de cards de seleção com label, descrição e indicador de radio. Usa `role="radiogroup"`/Radix, setas para navegação e estado selecionado por borda + indicador, não só cor.

## 9. `TacoFoodSelector`

Formulário integrado para pesquisar e adicionar alimentos da TACO:

- label visível, busca, resultados, porção e CTA;
- autocomplete com `combobox`, `listbox` e `option`;
- estados idle, loading, resultados, vazio e erro;
- seleção e fechamento completos por teclado;
- alimento selecionado anunciado antes da adição.
