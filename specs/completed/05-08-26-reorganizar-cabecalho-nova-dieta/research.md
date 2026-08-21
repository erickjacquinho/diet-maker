# Research: Reorganização do cabeçalho da criação de dieta

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-08-05

## Decision 1: Reutilizar a estrutura da tela de paciente

**Decision**: Usar a composição de `src/app/pacientes/[id]/page.tsx` como referência para o page header: retorno icon-only com nome acessível, overline de contexto, `h1` e ação alinhada à direita.

**Rationale**: O padrão já é reconhecível no produto, já usa a ordem de leitura esperada e reduz divergência visual entre o prontuário e o fluxo de dieta.

**Alternatives considered**:

- Manter o botão "Voltar ao Prontuário" como botão textual dentro do bloco atual: rejeitado porque mantém a hierarquia diferente da tela de paciente.
- Criar um componente novo de page header: rejeitado porque esta mudança tem um único consumidor e a composição existente é suficiente.

**Sources**: `src/app/pacientes/[id]/page.tsx`; `design-system/components/categories/structure.md`; `docs/superpowers/specs/2026-08-05-diet-builder-header-design.md`.

## Decision 2: Preservar contratos e mover apenas a apresentação

**Decision**: Manter `DietBuilderTemplateProps` e `DietModeSwitcherProps` e preservar todos os callbacks existentes.

**Rationale**: A especificação altera hierarquia e posição, não o domínio nutricional, persistência ou comportamento de cálculo. Manter a API reduz risco de regressão no consumidor da rota.

**Alternatives considered**:

- Criar um novo template específico para dieta nova: rejeitado porque a rota já usa `DietBuilderTemplate` para novo e existente.
- Mover estado de dieta para um novo contexto: rejeitado por estar fora do escopo e não ser necessário para o problema visual.

**Sources**: `src/components/templates/DietBuilderTemplate.tsx`; `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`; `design-system/components/profiles/templates/diet-builder-template.md`.

## Decision 3: Usar menu textual para ações secundárias

**Decision**: Compor `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent` e `DropdownMenuItem` existentes para agrupar WhatsApp e PDF sob o trigger textual `Mais ações`.

**Rationale**: O projeto já possui o primitive Radix/Shadcn com foco, Escape, clique externo e portal. O trigger textual preserva descoberta melhor que um botão icon-only e retira ruído do cabeçalho.

**Alternatives considered**:

- Manter WhatsApp/PDF sempre visíveis no topo: rejeitado porque aumenta competição visual com Salvar Prescrição.
- Criar um novo organismo de ações: rejeitado por ser uma composição de uma única tela, sem contrato de reuso independente.

**Sources**: `src/components/ui/dropdown-menu.tsx`; `design-system/components/categories/navigation.md`; `design-system/components/profiles/ui/dropdown-menu.md`; `C:\Users\Jacques\Skills\ui-ux-pro-max\SKILL.md`.

## Decision 4: Distribuir ações por contexto

**Decision**: Nova Refeição ficará na seção de refeições; Escalar ficará adjacente à região de metas/macros; Ajustar Metas continuará dentro do cabeçalho do paciente.

**Rationale**: A proximidade espacial reduz busca e associa cada comando à entidade que ele modifica, mantendo o page header reservado para orientação e salvamento.

**Alternatives considered**:

- Colocar todas as ações em uma barra superior: rejeitado pelo objetivo explícito de reduzir carga cognitiva.
- Criar barra fixa: rejeitado porque adiciona uma camada persistente sem necessidade no desktop.

**Sources**: `src/components/organisms/MacroTrackerHeader.tsx`; `src/components/molecules/PatientBadgeHeader.tsx`; `src/components/organisms/MealCardContainer.tsx`; `design-system/components/categories/structure.md`.

## Decision 5: Validar por estados e contratos de interface

**Decision**: Cobrir composição e interação com Vitest/Testing Library e validar visualmente os estados simples, ciclo de carboidratos, refeições vazias e larguras desktop de 1024px, 1280px e 1440px.

**Rationale**: O risco principal é de hierarquia, descoberta e regressão de callbacks; a combinação de testes determinísticos e inspeção visual cobre esses riscos sem adicionar dependências.

**Alternatives considered**:

- Criar uma suíte visual nova ou dependência de screenshot: rejeitado porque o projeto já possui validação manual/visual de rota e não há necessidade de infraestrutura nova para este ajuste.

**Sources**: `package.json`; `tests/components`; `tests/app/pacientes`; `design-system/13-implementation-and-compliance.md`; `spec.md`.
