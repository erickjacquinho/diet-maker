# UI Contract: Dropdown and Selection Components

**Feature**: [spec.md](../spec.md) | **Date**: 2026-08-19

## Component Contracts

### 1. `SelectField`

- **Location**: `src/components/atoms/SelectField.tsx`
- **Re-exports**: `src/components/atoms/index.ts`, `src/components/molecules/index.ts`
- **Responsibility**: Fornecer a interface canônica de seleção de opções para todos os formulários e cabeçalhos de filtro da aplicação.
- **Rules**:
  1. Utiliza internamente a receita `recipes.input({ size, state })` para manter altura (`h-control-standard` = 40px ou `h-control-compact` = 32px), bordas, cantos arredondados e focus rings idênticos aos de inputs textuais.
  2. Suporta passagem de opções via prop `options` ou composição via `children`.
  3. Ajusta o z-index de forma segura através da prop `layer="modal"` (valor default quando dentro de diálogos) ou `layer="dropdown"`.
  4. Indicador de seleção posicionado à direita com ícone Check do Lucide React.
  5. Ícone ChevronDown posicionado à direita do trigger com cor `text-text-muted`.

### 2. `ActionDropdown`

- **Location**: `src/components/molecules/ActionDropdown.tsx`
- **Re-exports**: `src/components/molecules/index.ts`
- **Responsibility**: Fornecer a interface unificada de menus contextuais e ações suspensas ("Mais ações", exportações, opções de itens de lista).
- **Rules**:
  1. Encapsula o `DropdownMenu` do Radix UI mantendo acessibilidade e fechamento após clique.
  2. Renderiza botões com as variantes canônicas (`variant="secondary"`, `variant="quiet"`).
  3. Garante espaçamento e alinhamento consistentes dos itens e ícones.

### 3. Eliminação de Listas Inline Ad-hoc

- **Forbidden**: Elementos `<div className="absolute top-full z-dropdown ...">` contendo loops `.map()` com estilos personalizados.
- **Standard**: Utilizar componentes de lista canônicos (`FoodSearchResultsList` ou componentes encapsulados de popover/dropdown).
