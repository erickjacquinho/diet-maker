# Phase 1 Data Model & Showcase Schema

## Entity Definitions

### 1. TokenItem
Representa um token visual catalogado.
- `id`: string (ex: `"color.brand.primary"`)
- `name`: string (ex: `"Brand Primary"`)
- `layer`: `"reference"` | `"system"` | `"component"`
- `type`: `"color"` | `"typography"` | `"spacing"` | `"shadow"` | `"radius"`
- `value`: string (ex: `"var(--color-emerald-500)"` ou `"#10b981"`)
- `description`?: string
- `contrastRatio`?: string (ex: `"7.2:1 (AAA)"` para tokens de cor)

### 2. ComponentCatalogItem
Representa um componente UI na galeria do showcase.
- `id`: string (ex: `"atom-button"`)
- `name`: string (ex: `"Button"`)
- `category`: `"atoms"` | `"molecules"` | `"organisms"`
- `description`: string
- `lifecycle`: `"stable"` | `"proposed"` | `"migration-required"`
- `availableVariants`: Record<string, string[]> (ex: `{ variant: ["primary", "secondary", "ghost", "danger"], size: ["compact", "standard", "large"] }`)
- `availableStates`: string[] (ex: `["default", "hover", "focused", "disabled", "loading"]`)
- `codeSnippet`: string

### 3. ShowcaseFilterState
Estado dos filtros ativos na página de showcase.
- `searchQuery`: string
- `activeTab`: `"all"` | `"tokens"` | `"atoms"` | `"molecules"` | `"organisms"` | `"compositions"`
- `viewMode`: `"client-showcase"` | `"dev-spec"`
- `themePreview`: `"dark"` | `"light"`

### 4. CompositionItem
Representa um grupo de componentes formando uma tela/fluxo real.
- `id`: string (ex: `"comp-macro-tracker"`)
- `title`: string (ex: `"Macro Tracker & Diet Header"`)
- `description`: string
- `componentsUsed`: string[]
