import React from 'react';

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
  /** Camada de sobreposição ('modal' para diálogos, 'dropdown' para páginas normais) */
  layer?: 'dropdown' | 'modal';
  /** Se o campo está desabilitado */
  disabled?: boolean;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Classes CSS adicionais para o container ou trigger */
  className?: string;
  /** Classes CSS adicionais para o trigger de seleção especificamente */
  triggerClassName?: string;
  /** Rótulo acessível quando label visual não for renderizado */
  'aria-label'?: string;
}
