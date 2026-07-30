# Tasks: Duplos Botões no Card de Dieta (Read-Only e Editar)

**Feature**: Duplos Botões no Card de Dieta
**Branch**: `29-07-26-2-botoes-no-card-de`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Tasks Overview

- [x] T001 [skill: ui-ux-pro-max] [US1] Criar o componente `ReadOnlyDietModal` em `src/components/molecules/ReadOnlyDietModal.tsx` exibindo o plano alimentar formatado em modo somente leitura (refeições, horários, alimentos, totais de macronutrientes).
- [x] T002 [skill: frontend-design] [US1] Adicionar estado e handler em `src/app/pacientes/[id]/page.tsx` para controlar a visibilidade da `ReadOnlyDietModal`.
- [x] T003 [skill: frontend-design] [US1] [US2] Atualizar o layout da área inferior de ações do card de dieta em `src/app/pacientes/[id]/page.tsx` para incluir o botão "Ver Dieta" (com ícone `Eye`) à esquerda e o botão de ícone de edição (lápis, com ícone `Pencil`) no lado direito navegando para o Construtor de Dietas.
- [x] T004 [skill: general] [US1] [US2] Executar verificação manual e build/lint da aplicação para garantir ausência de regressões.

## Dependencies

- T001 -> T002 -> T003 -> T004

## MVP Scope

- T001, T002, T003 (substituição do botão único por duplos botões + modal Read-Only funcional).
