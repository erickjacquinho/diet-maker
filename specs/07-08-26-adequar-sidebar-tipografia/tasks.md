# Tasks: Adequação da Tipografia da Sidebar

**Feature**: Adequação da Tipografia da Sidebar ao Design System
**Branch**: `specs/07-08-26-adequar-sidebar-tipografia`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Tasks

### Phase 1: Implementation

- [x] T001 [skill: speckit-implement] [US1] Atualizar `sidebarMenuButtonVariants` em `src/components/ui/sidebar.tsx` para incluir a classe `font-semibold` no estado padrão inativo, atendendo ao contrato `nav-item` (`13px/18px`, `font-semibold`) de `05-typography-system.md`.

### Phase 2: Verification & Testing

- [x] T002 [skill: speckit-implement] [US2] Executar a suíte de testes Vitest em `tests/components/ui/sidebar.test.tsx` para validar que o componente `SidebarMenuButton` e seus consumidores mantém o comportamento e acessibilidade sem regressões.

### Phase 3: Review & Audit

- [x] T003 [skill: ui-ux-pro-max] [US2] Realizar auditoria visual e técnica de conformidade no componente `SidebarMenuButton` e registrar no log de implementação.
