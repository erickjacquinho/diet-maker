# Technical Research: Padronização e Centralização de Dropdowns e Listas

**Feature**: [spec.md](./spec.md) | **Date**: 2026-08-19

## Context & Problem Space

A aplicação NutriDiet Local Pro apresentava múltiplos componentes de tela e modais implementando seletores e menus suspensos com duplicação de marcação do Radix UI (`<Select><SelectTrigger><SelectValue /><SelectContent><SelectItem /></SelectContent></Select>`), classes utilitárias repetidas, variações inconsistentes de camada (`layer="modal"` vs default) e trechos com listas suspensas inline ad-hoc (como a lista de resultados em `CreateRecipeModal.tsx` com `div absolute z-dropdown`).

Para garantir manutenibilidade facilitada, consistência visual, ausência de hardcode de estilos e governança pelo Atomic Design e Design System canônico, este documento consolida as decisões técnicas para centralização em componentes pai padronizados.

## Decisions & Technical Rationales

### 1. Criação do Componente Pai Padronizado de Seleção (`SelectField` / `Select`)

- **Decision**: Criar e padronizar o componente `SelectField` (disponibilizado em `src/components/atoms/SelectField.tsx` e reexportado em `src/components/atoms`) que encapsula o gatilho, o conteúdo, a navegação de teclado, o suporte a opções estruturadas (`options: SelectOption[]`), o rótulo (`label`), mensagem de erro/auxiliar e suporte a `layer="modal" | "dropdown"`.
- **Rationale**: Permite que os consumidores declarem seletores de forma concisa e tipada (`<SelectField label="Gênero" value={gender} onValueChange={setGender} options={GENDER_OPTIONS} />`), eliminando dezenas de linhas de boilerplate por modal.
- **Alternatives considered**:
  - *Manter apenas os primitivos Radix em `src/components/ui/select.tsx`*: Rejeitado porque força cada modal a duplicar 10-15 linhas de JSX para cada select, aumentando risco de divergência de estilos e inconsistências de camada.
  - *Usar `<select>` nativo do HTML*: Rejeitado porque não oferece conformidade visual com o design system, estados ricos de foco, chevron canônico e indicadores estilizados.

### 2. Criação do Componente Pai Padronizado de Menus de Ação (`ActionDropdown`)

- **Decision**: Criar e padronizar o componente `ActionDropdown` (em `src/components/molecules/ActionDropdown.tsx` e reexportado em `src/components/molecules`) para menus contextuais de comandos (como o menu "Mais ações" em `DietBuilderTemplate.tsx`), aceitando `items: DropdownActionItem[]` e um botão gatilho customizável ou padrão.
- **Rationale**: Centraliza a renderização de itens de menu com ícones, atalhos, rótulos e variantes (padrão, destrutiva), garantindo alinhamento de tokens e fechamento automático.
- **Alternatives considered**:
  - *Continuar montando `DropdownMenuContent` + `DropdownMenuItem` manualmente em cada tela*: Rejeitado por espalhar classes como `min-w-44`, ícones e listeners em arquivos de template.

### 3. Eliminação de Listas Suspensas Flutuantes Manuais

- **Decision**: Substituir marcações como a lista flutuante de busca em `CreateRecipeModal.tsx` por componentes de lista padronizados do design system ou pelo fluxo de busca canônico (`FoodSearchModal` / `FoodSearchResultsList`).
- **Rationale**: Impede que elementos com posicionamento absoluto manual (`absolute top-full z-dropdown`) definam regras visuais e bordas ad-hoc fora das receitas do design system.

### 4. Mapeamento de Todos os Consumidores para Migração

Os seguintes componentes foram mapeados e serão migrados integralmente para o componente pai padronizado:
1. `src/components/molecules/CreatePatientModal.tsx` (Campos: Gênero, Objetivo)
2. `src/components/molecules/EditPatientModal.tsx` (Campos: Gênero, Objetivo)
3. `src/components/molecules/CreatePresetModal.tsx` (Campos: Categoria, Modos de cálculo de Proteína, Carbo e Gordura)
4. `src/components/molecules/CreateRecipeModal.tsx` (Campo: Categoria; refatoração da lista de busca de ingredientes)
5. `src/components/molecules/CustomFoodModal.tsx` (Campos: Unidade, Categoria)
6. `src/components/molecules/NextEventModal.tsx` (Campo: Tipo de evento)
7. `src/components/molecules/CopyVariationModal.tsx` (Campos: Copiar de [origem], Para [destino])
8. `src/components/organisms/foods/FoodFilterHeader.tsx` (Filtros: Categoria, Preparo, Preset de Macros)
9. `src/components/templates/DietBuilderTemplate.tsx` (Menu "Mais ações")

## Design System & Token Alignment

- **Gatilho de Seleção**: Consome a receita canônica `recipes.input({ size, state })` já padronizada no design system.
- **Tipografia**: `text-style-field-value` no valor selecionado, `text-style-field-label` no label associado, e `text-style-nav-item` nos itens da lista suspensa.
- **Camadas e Elevação**: `z-modal` (para abertura dentro de diálogos) e `z-dropdown` (para superfícies comuns), garantindo ausência de clipping.
- **Acessibilidade**: Suporte total a ARIA combobox/listbox do Radix UI, foco visível com ring canônico e fechamento em Escape ou clique fora.
