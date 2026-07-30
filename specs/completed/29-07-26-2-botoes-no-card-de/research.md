# Research: Duplos Botões no Card de Dieta

## Decision 1: Estrutura dos Ações do Card
- **Decisão**: Substituir a div `<div className="pt-2 flex justify-end">` por `<div className="pt-2 flex items-center justify-between">` ou `<div className="pt-2 flex items-center gap-2">` com alinhamento justify-between.
- **Racional**: Permite colocar o botão principal "Ver Dieta" (com ícone `Eye`) à esquerda e o botão de ação rápida de edição (ícone `Pencil`) no lado direito.

## Decision 2: Modal de Leitura (Read-Only)
- **Decisão**: Criar componente dedicado `ReadOnlyDietModal` utilizando Shadcn `Dialog`.
- **Racional**: Fornece uma experiência limpa, acessível e focada em visualização sem permitir edições acidentais nos macros ou alimentos.
