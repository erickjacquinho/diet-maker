# Phase 0: Research & Decision Log

## Decision 1: Aplicação do Peso Tipográfico font-semibold (600) em SidebarMenuButton

- **Decision**: Adicionar a classe `font-semibold` diretamente na variante base do `sidebarMenuButtonVariants` em `src/components/ui/sidebar.tsx`.
- **Rationale**: Em `05-typography-system.md` (§4.3), o token de tipografia `nav-item` é contratado como `13px/18px, 600`. A implementação anterior em `sidebar.tsx` continha apenas `text-style-nav-item`, omitindo `font-semibold` no estado inativo.
- **Alternatives considered**:
  1. *Usar font-medium (500)*: Rejeitado porque o contrato tipográfico explícito do Design System em `05-typography-system.md` e `text-styles.ts` define `nav-item` como `font-semibold` (`600`).
  2. *Criar uma nova classe de utilitário customizada*: Rejeitado para evitar exceções locais de acordo com a Regra Absoluta (§1 do Design System).
