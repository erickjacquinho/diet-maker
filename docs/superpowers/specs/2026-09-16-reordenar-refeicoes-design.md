# Reordenação de refeições no editor — Design

## Problema

O editor de nova dieta exibe as refeições na ordem atual, mas não oferece uma forma dedicada de reorganizá-las quando a lista cresce. A ordem precisa ser editável sem aplicar alterações parcialmente e sem afetar outras variações de um ciclo de carboidratos.

## Objetivo

Adicionar um fluxo de reordenação no cabeçalho **Refeições**:

- abrir um modal pelo botão **Reordenar**;
- exibir um card resumido para cada refeição da variação ativa;
- permitir arrastar o card inteiro e operar a mesma reordenação pelo teclado;
- mostrar macros/calorias e a lista detalhada de alimentos em tooltip na badge de itens;
- aplicar a nova ordem somente após **Confirmar**;
- fechar diretamente quando não houver alteração e confirmar o descarte quando houver.

## Abordagens consideradas

1. **Drag-and-drop nativo com rascunho local no modal (recomendado).** Não adiciona dependências, segue o padrão nativo já usado na ordenação de alimentos e separa claramente edição temporária de persistência.
2. Reutilizar `MealCardContainer` no modal. Reduz a modelagem, mas carrega inputs e ações de edição para uma superfície que deve ser apenas de ordenação.
3. Adicionar uma biblioteca de sortable. Pode oferecer animações mais completas, mas aumenta dependências e complexidade sem necessidade para esta lista.

## Design aprovado

### Fluxo e componentes

`DietMealsSection` recebe uma callback opcional de reordenação e mostra **Reordenar** somente quando existem pelo menos duas refeições. O modal mantém a ordem dos IDs em estado local e usa os dados já projetados em `mealsData`, que representam a variação ativa.

Cada card é uma superfície arrastável com `GripVertical` como affordance visual. O mesmo card recebe foco e suporta setas para cima/baixo, com anúncio acessível da posição resultante. A badge de quantidade usa o tooltip existente e lista cada alimento com quantidade, proteína, carboidrato, gordura e calorias.

O rodapé oferece **Descartar** e **Confirmar**. `Dialog` controla a superfície principal; clique no backdrop, `Esc` ou o botão de fechar seguem a regra de descarte. Quando a ordem mudou, `ConfirmationAlertDialog` é aberto sobre o modal; cancelar mantém o modal aberto, enquanto descartar restaura a ordem inicial e fecha ambos.

### Estado e persistência

`useDietMealActions` recebe `handleReorderMeals`, que valida a lista de IDs e atualiza a fonte de refeições ativa por cópia imutável. `updateActiveMeals` já direciona a mutação para `simpleMeals` ou apenas para a variação cujo ID está ativo em `carbCyclingVariations`. Nenhuma outra variação é modificada.

O modal só chama a callback no confirmar; abrir, arrastar, usar teclado ou cancelar não persiste a ordem. A persistência local existente detectará a alteração normal do plano depois que a callback for aplicada.

### Acessibilidade e visual

Serão usados `Dialog`, `ConfirmationAlertDialog`, `Tooltip`, `Badge`, `Button`, `Surface` e ícones Lucide existentes. O modal preservará foco, título/descrição acessíveis, retorno ao gatilho, foco visível, contraste e tokens canônicos. O conteúdo dos cards será rolável quando necessário, sem alterar os primitivos em `src/components/ui`.

### Testes

- renderização do botão somente com duas ou mais refeições;
- abertura do modal, cards, macros, badge e conteúdo do tooltip;
- reordenação por drag-and-drop e por teclado;
- confirmar aplica a ordem recebida;
- cancelar/descartar preserva ou restaura a ordem correta;
- clique fora sem alteração fecha e com alteração abre confirmação;
- ação do hook reorganiza apenas a variação ativa.

## Fora de escopo

- sincronizar a ordem entre variações de ciclo de carboidratos;
- alterar a ordem dos alimentos dentro de uma refeição;
- adicionar dependência externa de drag-and-drop;
- modificar os primitivos Shadcn ou a estrutura persistida do banco.
