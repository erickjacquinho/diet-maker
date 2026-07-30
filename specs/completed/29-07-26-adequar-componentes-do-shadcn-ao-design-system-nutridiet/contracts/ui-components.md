# Contrato de Interface dos Componentes UI Refatorados

## Garantias de API
1. **Preservação de Props**: Nenhuma prop original de componente shadcn/Radix UI será alterada ou removida (ex: `asChild`, `variant`, `size`, `className`, etc.).
2. **Mesclagem de ClassNames**: Todas as classes customizadas repassadas via `className` continuarão a ser mescladas usando `cn(...)` de `@/lib/utils`.
3. **Contraste de Acessibilidade**: Todas as variantes padrão de cor atendem ou superam WCAG AA (mínimo 4.5:1).
