# Quickstart & Verification Guide: Padronização e Centralização de Dropdowns e Listas

**Feature**: [spec.md](./spec.md) | **Date**: 2026-08-19

## Verification Overview

Este guia detalha os procedimentos para validar a implementação da padronização e centralização de dropdowns e listas no projeto.

## Prerequisites

- Node.js >= 18
- Repositório local atualizado com dependências instaladas (`npm install`)

## Automated Tests

Executar a suíte de testes unitários e de integração:

```bash
# Executar todos os testes do projeto
npm test

# Executar especificamente os testes de Dropdown / Select
npx vitest run tests/components/ui/select.test.tsx tests/components/atoms/SelectField.test.tsx tests/components/molecules/ActionDropdown.test.tsx
```

## Static Analysis & Style Audit

Verificar que não existem estilos inline ou classes ad-hoc de dropdown:

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint
```

## Manual Verification Checklist

1. **Modal de Cadastro de Paciente** (`/pacientes` -> "Novo Paciente"):
   - Abrir o modal.
   - Verificar que os campos "Objetivo Clínico" e "Gênero" utilizam o componente padronizado.
   - Testar seleção por clique e por teclado.

2. **Modal de Edição de Paciente** (`/pacientes/[id]` -> Editar):
   - Verificar que os campos de Objetivo e Gênero funcionam com dados pré-carregados e atualização dinâmica de novos objetivos.

3. **Modal de Presets de Dieta** (`/presets` -> "Criar Novo Preset"):
   - Verificar os campos de Categoria e Modos de cálculo de macronutrientes (Absoluto vs Multiplicativo).

4. **Modal de Receitas** (`/receitas` -> "Criar Nova Receita"):
   - Verificar o campo Categoria e a busca de ingredientes sem listas absolutas manuais.

5. **Modal de Alimento Customizado** (`/alimentos` -> "Novo Alimento Customizado"):
   - Verificar os campos de Unidade e Categoria.

6. **Modal de Próximo Acompanhamento** (`/pacientes/[id]` -> Próximo Acompanhamento):
   - Verificar o seletor de Tipo de Evento.

7. **Modal de Cópia de Variação** (`/pacientes/[id]/dieta/[dietaId]` -> Copiar Variação):
   - Verificar os seletores de Origem e Destino.

8. **Filtros da Base TACO** (`/alimentos`):
   - Verificar os seletores de Categoria, Preparo e Filtro de Macros no topo da página.

9. **Menu de Mais Ações** (`/pacientes/[id]/dieta/[dietaId]`):
   - Verificar a abertura e execução das ações de WhatsApp e PDF via menu padronizado.
