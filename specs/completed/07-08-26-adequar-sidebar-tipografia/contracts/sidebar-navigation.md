# Interface Contract: Sidebar Navigation Typography

## UI Component Contract

Componente: `SidebarMenuButton` (`src/components/ui/sidebar.tsx`)

### Classes Esperadas (Variants Base)

```typescript
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-control p-2 text-left text-style-nav-item font-semibold text-sidebar-foreground outline-none transition-colors duration-fast ease-standard motion-reduce:transition-none motion-reduce:duration-0 [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar disabled:pointer-events-none disabled:opacity-disabled data-[active=true]:bg-sidebar-primary-soft data-[active=true]:text-sidebar-primary",
  // ...
)
```

### Validação de Conformidade
- Inativo: `font-semibold` (600), `13px/18px`, `text-sidebar-foreground`.
- Ativo: `font-semibold` (600), `13px/18px`, `text-sidebar-primary`, `bg-sidebar-primary-soft`.
