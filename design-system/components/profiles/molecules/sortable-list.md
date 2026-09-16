# SortableList

## Identity

- Component ID: `molecule-sortable-list`
- Layer: molecule
- Nature: product-generic
- Source: `src/components/molecules/SortableList.tsx`

## Purpose

Fornecer uma lista controlada e reutilizável para reordenar itens por ponteiro ou teclado. O componente é responsável pela interação, preview, placeholder, animação de deslocamento e anúncio acessível; o consumidor continua responsável pelos dados e pelo conteúdo visual de cada item.

## Category inheritance

Herda [data-display](../../categories/data-display.md). A categoria define a leitura e a semântica da lista; a interação de reordenação é uma capacidade específica deste componente e não altera o contrato de dados exibidos.

## Specific anatomy

- Região `list` com itens `listitem` controlados por `items`.
- Wrapper focável por item, com ID estável fornecido por `getItemId`.
- Conteúdo fornecido por `renderItem` através de `SortableItemRenderContext`.
- Container e wrapper de item podem ser substituídos para preservar semântica especializada, como `tbody`/`tr`.
- Placeholder de inserção, preview em portal e região viva para anúncios.
- Callback controlado `onReorder` com a nova sequência e `SortableReorderMeta`.

## Allowed variants

- Lista padrão com placeholder interno.
- Placeholder customizado via `renderPlaceholder`.
- Container, wrapper e preview customizados via `renderContainer`, `renderItemWrapper` e `renderPreview`.
- Lista desabilitada via `disabled`.
- Classes de lista, item e placeholder podem ser compostas pelo consumidor.

## Particular states

Itens suportam estado padrão, focado, pressionado durante o arraste, arrastando, preview, placeholder, desabilitado e movimento reduzido. O preview não participa da árvore semântica da lista e o item original permanece representado por um placeholder durante o arraste.

## Composition

`SortableList<T>` recebe qualquer tipo de item e não conhece domínio, persistência ou componentes visuais específicos. Organismos e moléculas devem fornecer o conteúdo através de `renderItem`; a ordem só é aplicada quando o consumidor atualiza `items` em `onReorder`.

## Content rules

`getItemId` deve retornar um identificador estável e único durante a vida da lista. `getItemLabel` deve produzir um nome curto e compreensível para anúncios e foco. O conteúdo renderizado deve manter uma hierarquia visual clara e não depender apenas de movimento ou cor para comunicar a nova posição.

## Exceptions

Não há exceções de governança. Pointer Events, portal do preview e estilos inline de geometria são detalhes necessários para manter o arraste funcional quando o item original sai do fluxo; não substituem tokens nem primitives.

## Consumers

- `src/components/organisms/diet/DietMealsSection.tsx`
- `src/components/organisms/MealCardContainer.tsx`

## Acceptance criteria

- Reordena itens por ponteiro com preview acompanhando o cursor e abertura de caminho animada.
- Reordena itens com `ArrowUp` e `ArrowDown` e anuncia a posição.
- Permite cancelar o gesto sem alterar a sequência.
- Respeita `prefers-reduced-motion` e mantém foco visível e nomes acessíveis.
- Não exige dependência externa de drag and drop.

## Implementation status

Implementado e exportado por `src/components/molecules/index.ts`. O componente é controlado, genérico em `T` e coberto por `tests/components/molecules/sortable-list.test.tsx`.
