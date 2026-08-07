# Rule: Estados Comportamentais e Acessibilidade (WCAG 2.2 AA)

> **Escopo:** Matriz de estados de componentes, navegação por teclado, anel de foco e suporte a leitores de tela.

## 1. Matriz Obrigatória de Estados

Todo componente interativo (botão, input, select, checkbox, card clicável) DEVE tratar explicitamente os seguintes estados em seu contrato funcional e estilização:

1. **Default:** Estado de repouso padrão.
2. **Hover:** Feedback ao passar o cursor (`hover:`).
3. **Pressed / Active:** Feedback imediato ao clicar/pressionar (`active:`).
4. **Focus-Visible:** Anel de foco visível ativado exclusivamente via navegação por teclado (`focus-visible:`).
5. **Selected / Checked:** Estado ativo/selecionado em seletores ou abas (`aria-selected="true"`, `data-state="active"`).
6. **Disabled:** Desativado, sem interação, opacidade reduzida (`disabled:opacity-50`, `cursor-not-allowed`, `aria-disabled="true"`).
7. **Loading:** Estado de carregamento assíncrono (exibir indicador legível, desativar cliques múltiplos).
8. **Error:** Estado de erro de validação (borda indicativa de erro, mensagem explicativa conectada via `aria-describedby`).
9. **Empty:** Estado sem dados/vazio para listas, tabelas e cards.
10. **Read-Only:** Somente leitura, sem edição, mantendo contraste acessível.

## 2. Receita Padrão de Foco Visível

O anel de foco DEVE ser consistente em todos os elementos focáveis do projeto:

```tsx
// Classe padrão de foco visível no Tailwind:
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

- ❌ **PROIBIDO:** Remover o anel de foco (`outline-none`) sem fornecer uma alternativa clara com `focus-visible:ring-*`.
- ❌ **PROIBIDO:** Usar `:focus` puro quando a intenção for apenas foco por teclado (utilize `:focus-visible` para evitar anéis de foco ao clicar com o mouse).

## 3. Navegação por Teclado e Semântica HTML

- Todos os elementos interativos DEVEM ser alcançáveis e acionáveis por teclado.
  - `Tab` / `Shift+Tab` : Navegar entre elementos focáveis.
  - `Enter` / `Space` : Acionar botões, alternar checkboxes e switches.
  - `Escape` : Fechar modais, dropdowns, popovers e menus.
  - `Arrow Keys` : Navegar entre opções de select, abas e itens de radio group.
- **Rótulos Acessíveis:** Todo botão apenas com ícone DEVE conter `aria-label` ou `<span className="sr-only">Descrição</span>`.
- **Semântica:** Use elementos HTML5 nativos (`<button>`, `<input>`, `<nav>`, `<main>`, `<header>`). Se utilizar uma `<div>` interativa, adicione obrigatoriamente `role="button"`, `tabIndex={0}` e manipulador de eventos `onKeyDown`.

## 4. Modais e Overlays Acessíveis

- Modais DEVEM prender o foco (focus trap) enquanto abertos.
- Ao fechar o modal, o foco DEVE retornar ao elemento que o abriu.
- Modais e gavetas DEVEM possuir `role="dialog"`, `aria-modal="true"`, `aria-labelledby` e `aria-describedby`.
