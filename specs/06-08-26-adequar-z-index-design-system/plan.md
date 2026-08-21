# Implementation Plan: Adequação da Hierarquia de Camadas

**Branch**: [06-08-26-adequar-z-index-design-system] | **Date**: 2026-08-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from /specs/06-08-26-adequar-z-index-design-system/spec.md

## Summary

Adequar todos os usos de z-index do frontend à escala canônica do Design System. A abordagem é primeiro consolidar uma matriz de inventário e um contrato semântico, depois corrigir os primitivos de overlay e seus consumidores, harmonizar os perfis documentais e finalizar com testes determinísticos que impeçam valores crus e relações de camada incorretas.

A correção preserva os portais, o foco, o teclado, o dismiss, o retorno de foco e a animação dos primitivos Radix/shadcn. Nenhum novo nível numérico será criado.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router

**Primary Dependencies**: Radix Dialog, Dropdown Menu, Popover, Select e Tooltip; Tailwind CSS 3.4; class-variance-authority; Vitest e Testing Library

**Storage**: N/A; a feature altera contratos de UI, documentação e testes

**Testing**: Vitest run, Testing Library, TypeScript noEmit, ESLint e verificadores existentes do Design System

**Target Platform**: Aplicação web desktop, com suporte a partir de 1024 px

**Project Type**: Web application frontend

**Performance Goals**: Não introduzir custo de runtime perceptível; auditoria deve ser determinística e adequada ao tamanho atual do repositório

**Constraints**: Offline-capable, WCAG 2.2 AA, tokens semânticos canônicos, primitivos ui genéricos e execução futura via /speckit-implement

**Scale/Scope**: 22 declarações de camada identificadas em src/, tests/ e tailwind.config.js, mais consumidores de cinco páginas e documentação de componentes afetada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Atomic Design: PASS. A correção separa ajustes em primitivos ui, moléculas/organismos consumidores e páginas, sem mover componentes entre camadas.
- Design System canônico: PASS. A escala de 07 é a única fonte de valores; perfis e contratos serão harmonizados com ela.
- Acessibilidade: PASS. O plano exige preservar foco, teclado, dismiss, retorno de foco, estados e portais, com testes determinísticos.
- Qualidade/test-first: PASS. Os testes e o auditor são tarefas explícitas antes da conclusão da implementação.
- Frontend architecture: PASS. O contexto de camada permanece local ao componente/portal e não é promovido a estado de URL ou servidor.
- Spec-driven execution: PASS. A execução deve ser feita por /speckit-implement após validação humana.
- Simplicity: PASS. Não haverá novos níveis, sistema paralelo de camadas ou dependência externa.

## Research Summary

As decisões e alternativas consideradas estão em [research.md](research.md).

1. A escala de design-system/07-icons-motion-and-layers.md prevalece sobre qualquer perfil que ainda diga z-popover para Select.
2. DropdownMenu e Select padrão usam z-dropdown; Popover padrão usa z-popover.
3. Conteúdo de overlay dentro de modal recebe contexto explícito z-modal, sem alterar a camada padrão do componente.
4. Valores crus locais são removidos ou substituídos por z-raised apenas quando há necessidade real de sobreposição.
5. A conformidade será verificada por auditoria textual determinística e testes de contrato/integração.

## Architecture and implementation phases

### Phase 0 — Contract and inventory

- Confirmar o inventário em src/, tests/ e tailwind.config.js.
- Criar uma matriz com ocorrência, família, contexto, camada atual, camada esperada, ação e cobertura.
- Fixar o contrato de escolha de camada em [contracts/layer-contract.md](contracts/layer-contract.md).
- Definir o auditor para aceitar tokens canônicos e rejeitar números arbitrários fora do mapa central.

### Phase 1 — Primitive layer correction

- Corrigir Sheet para separar SheetOverlay em z-overlay e SheetContent em z-modal.
- Corrigir DropdownMenuContent e DropdownMenuSubContent para z-dropdown.
- Harmonizar SelectContent com z-dropdown por padrão e opção contextual modal explícita.
- Adicionar ao contrato de PopoverContent a opção contextual modal necessária ao DatePickerField, mantendo z-popover como padrão.
- Manter Dialog, Tooltip e demais tokens já compatíveis com a escala.

### Phase 2 — Consumer and local overlay correction

- Corrigir DatePickerField para declarar o contexto modal por contrato, sem impor z-modal em popovers genéricos.
- Corrigir PatientListTable e os cinco ícones de busca, removendo z-10 quando desnecessário ou usando z-raised quando a sobreposição for necessária.
- Preservar z-dropdown do resultado inline de CreateRecipeModal após confirmar sua relação com o modal.
- Revalidar calendar.tsx como uso de z-raised compatível.

### Phase 3 — Documentation and registry alignment

- Atualizar perfis e contratos de Select, Popover, DropdownMenu, Sheet e Dialog conforme a matriz.
- Registrar a regra contextual no catálogo de overlays e no registro de componentes quando a API pública de um primitivo for alterada.
- Manter as regras de preservação dos primitivos shadcn e as regras Atomic Design sem duplicar tabelas conflitantes.

### Phase 4 — Verification

- Adicionar testes de contrato para tokens e contexto modal/não modal.
- Adicionar testes para Sheet, DropdownMenu, Select e Popover em portal e dentro de Dialog/Sheet.
- Adicionar auditoria determinística para z-10, z-[N], style.zIndex e tokens inadequados.
- Executar lint, type-check, testes e verificadores de Design System.
- Registrar achados com arquivo, linha, severidade e correção esperada.

## File impact map

### Implementation files

- src/components/ui/sheet.tsx
- src/components/ui/dropdown-menu.tsx
- src/components/ui/select.tsx
- src/components/ui/popover.tsx
- src/components/molecules/DatePickerField.tsx
- src/components/organisms/PatientListTable.tsx
- src/app/refeicoes-prontas/page.tsx
- src/app/receitas/page.tsx
- src/app/pacientes/page.tsx
- src/app/alimentos/page.tsx
- src/app/presets/page.tsx

### Verification files

- tests/components/
- tests/app/
- scripts/ or tests/validators/ for the deterministic layer audit, following the repository's existing validator conventions

### Design System files

- design-system/07-icons-motion-and-layers.md
- design-system/components/categories/overlays.md
- design-system/components/profiles/ui/select.md
- design-system/components/profiles/ui/popover.md
- design-system/components/profiles/ui/dropdown-menu.md
- design-system/components/profiles/ui/dialog.md
- design-system/components/registry.json, only if a public component contract or export changes

## Dependency order

1. Inventory and contract.
2. Primitive layer correction.
3. Consumer cleanup.
4. Documentation and registry alignment.
5. Tests and deterministic audit.
6. Full repository verification.

## Constitution Re-check

- Atomic Design remains satisfied because changes are scoped to existing layers and contracts.
- Canonical token usage remains satisfied because no new z-index values are planned.
- Accessibility remains satisfied only if the planned overlay tests verify focus and keyboard behavior.
- Test-first remains satisfied when regression tests are added before or with each implementation correction.
- Spec-driven execution remains satisfied when the approved tasks are run through /speckit-implement.

## Complexity Tracking

No constitution violations or architecture exceptions are required.
