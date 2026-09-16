# Research: reordenação de refeições

## Decisões

- A lista `mealGroups` já é derivada da variação ativa em `useDietCalculations`; `updateActiveMeals` já grava apenas `simpleMeals` ou a variação cujo ID é `activeVariationId`. A reordenação reutilizará esse fluxo.
- O modal terá uma cópia local da sequência. O plano só será alterado em `Confirmar`, o que torna `Descartar`, `Esc` e clique fora seguros sem snapshot adicional do plano.
- O arraste usará Pointer Events controlados pelo componente, seguindo a necessidade de preview e abertura de caminho visual. Não será adicionada dependência.
- A abertura de caminho usará um placeholder com a altura do card e FLIP (`getBoundingClientRect` + `transform`) para animar os cards vizinhos durante o `dragover`; isso mantém o arraste nativo sem depender de uma biblioteca.
- O arraste da interface usará Pointer Events controlados pelo componente, com um preview fixo acompanhando o ponteiro. O elemento original não será removido durante um `dragstart` nativo, evitando o cancelamento do arraste causado pela remontagem do React.
- A mecânica de reordenação foi extraída para a molécula genérica `SortableList<T>`. A seção de refeições fornece somente os itens, IDs, conteúdo visual e callback controlado; Pointer Events, preview, placeholder, FLIP, teclado e anúncio ficam reutilizáveis em qualquer lista.
- A ordenação dos alimentos usará a mesma molécula em modo semântico de tabela: `SortableList` fornece o motor e permite que `MealItemRow` mantenha `tbody`/`tr`, placeholder de linha e preview compacto. A implementação nativa de `dragstart`/`drop` será removida.
- O campo de gramas manterá apenas o estado transitório vazio localmente e encaminhará cada valor numérico válido por `onChange`; `useDietMealActions.handleUpdateItemGram` já recalcula o alimento e os totais derivados sem depender de `blur`.
- O resumo reutilizará `MacroSummary`, `Badge`, `Tooltip` e `ConfirmationAlertDialog`; primitivos de `src/components/ui` não serão alterados.

## Causa do bug de criação

Ao trocar uma dieta simples para ciclo de carboidratos, `activeVariationId` podia continuar como `variation-simple`. As novas variações usam `var-high`, `var-med` e `var-low`, então `updateActiveMeals` não encontrava uma variação correspondente e descartava a atualização. A transição agora seleciona a primeira variação de ciclo criada ou existente antes de permitir novas edições.

O alvo da busca de alimentos continua sendo resolvido pelo índice após a atualização da lista, e o teste regressivo confirma a criação e a abertura do fluxo para a nova refeição.

## Alternativas descartadas

- Biblioteca externa de drag and drop: adicionaria dependência para um fluxo já coberto pelo navegador.
- Reutilizar `MealCardContainer` inteiro no modal: carregaria ações de edição e arraste de alimentos desnecessárias.
- Atualizar a ordem a cada movimento: dificultaria cancelar e poderia gerar autosaves intermediários.
