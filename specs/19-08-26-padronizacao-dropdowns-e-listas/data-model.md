# Data Model & Interface Specifications: Padronização e Centralização de Dropdowns e Listas

**Feature**: [spec.md](./spec.md) | **Date**: 2026-08-19

## Entities & Type Contracts

### 1. `SelectOption<T>`

Representa a estrutura de dados de uma opção selecionável dentro de um dropdown padronizado.

```typescript
export interface SelectOption<T extends string = string> {
  /** Identificador único / valor enviado no formulário */
  value: T;
  /** Texto exibido visualmente para o usuário */
  label: string;
  /** Ícone opcional exibido ao lado do texto */
  icon?: React.ReactNode;
  /** Descrição auxiliar ou badge secundária */
  description?: string;
  /** Se o item está desabilitado para seleção */
  disabled?: boolean;
}
```

### 2. `SelectFieldProps<T>`

Contrato de propriedades do componente pai padronizado de formulários `SelectField`.

```typescript
export interface SelectFieldProps<T extends string = string> {
  /** Identificador único para associação com labels e acessibilidade */
  id?: string;
  /** Rótulo textual acima do campo */
  label?: string;
  /** Valor atualmente selecionado (controlado) */
  value?: T;
  /** Valor inicial para modo não-controlado */
  defaultValue?: T;
  /** Callback acionado na alteração da seleção */
  onValueChange?: (value: T) => void;
  /** Texto de placeholder quando nenhum valor foi selecionado */
  placeholder?: string;
  /** Lista estruturada de opções */
  options?: readonly SelectOption<T>[] | SelectOption<T>[];
  /** Filhos alternativos para composição manual (quando aplicável) */
  children?: React.ReactNode;
  /** Tamanho visual do campo conforme tokens canônicos */
  size?: 'compact' | 'standard';
  /** Estado de validação visual */
  state?: 'default' | 'error';
  /** Mensagem de erro exibida abaixo do campo quando state="error" */
  errorMessage?: string;
  /** Camada z-index ('modal' para diálogos, 'dropdown' para páginas normais) */
  layer?: 'dropdown' | 'modal';
  /** Se o campo está desabilitado */
  disabled?: boolean;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Classes CSS adicionais para o container ou trigger */
  className?: string;
  /** Rótulo acessível quando label visual não for renderizado */
  'aria-label'?: string;
}
```

### 3. `DropdownActionItem`

Representa uma ação executável dentro de um menu de contexto/ações.

```typescript
export interface DropdownActionItem {
  /** Identificador da ação */
  id: string;
  /** Rótulo textual da ação */
  label: string;
  /** Ícone ilustrativo */
  icon?: React.ReactNode;
  /** Callback executado ao clicar/selecionar a ação */
  onSelect: () => void;
  /** Variante semântica da ação */
  variant?: 'default' | 'destructive';
  /** Se a ação está desabilitada */
  disabled?: boolean;
}
```

### 4. `ActionDropdownProps`

Contrato de propriedades do componente pai padronizado de menu de ações `ActionDropdown`.

```typescript
export interface ActionDropdownProps {
  /** Gatilho customizado (ou padrão se não fornecido) */
  trigger?: React.ReactNode;
  /** Texto do gatilho padrão */
  triggerLabel?: string;
  /** Ícone do gatilho padrão */
  triggerIcon?: React.ReactNode;
  /** Variante do botão gatilho padrão */
  triggerVariant?: 'primary' | 'secondary' | 'quiet';
  /** Tamanho do botão gatilho */
  size?: 'compact' | 'standard';
  /** Alinhamento do menu suspenso em relação ao gatilho */
  align?: 'start' | 'center' | 'end';
  /** Lista estruturada de ações */
  items: readonly DropdownActionItem[] | DropdownActionItem[];
  /** Classes CSS adicionais */
  className?: string;
  /** Rótulo acessível do menu */
  'aria-label'?: string;
}
```
