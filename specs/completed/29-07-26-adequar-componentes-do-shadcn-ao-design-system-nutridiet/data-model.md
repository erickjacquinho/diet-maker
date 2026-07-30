# Phase 1 Data Model & Tokens: Especificação de Componentes UI

## 1. Atômicos (`button`, `badge`, `input`, `card`, `separator`)

### `Button` (`src/components/ui/button.tsx`)
- **Raio de Borda**: `rounded-xl`
- **Sombra**: `shadow-none`
- **Variantes**:
  - `default`: `bg-warm-charcoal text-white hover:bg-warm-charcoal/90`
  - `destructive`: `bg-warm-rose text-white hover:bg-warm-rose/90`
  - `outline`: `border border-warm-border bg-warm-card text-warm-charcoal hover:bg-warm-inner hover:border-warm-borderDark`
  - `secondary`: `bg-warm-inner text-warm-charcoal border border-warm-border hover:bg-warm-bg`
  - `ghost`: `text-warm-charcoal hover:bg-warm-inner`
  - `link`: `text-warm-terracotta underline-offset-4 hover:underline`
  - `emerald` (NutriDiet Custom): `bg-warm-emerald text-white hover:bg-warm-emerald/90`

### `Badge` (`src/components/ui/badge.tsx`)
- **Raio de Borda**: `rounded-full`
- **Sombra**: `shadow-none`
- **Variantes**:
  - `default`: `bg-warm-inner text-warm-charcoal border border-warm-border`
  - `emerald` / `kcal`: `bg-warm-emeraldBg text-warm-emerald border border-warm-emerald/20`
  - `rose` / `protein`: `bg-warm-roseBg text-warm-rose border border-warm-rose/20`
  - `amber` / `carb`: `bg-warm-amberBg text-warm-amber border border-warm-amber/20`
  - `teal` / `fat`: `bg-warm-tealBg text-warm-teal border border-warm-teal/20`
  - `terracotta`: `bg-warm-terracottaBg text-warm-terracotta border border-warm-terracotta/20`

### `Input` (`src/components/ui/input.tsx`)
- **Raio de Borda**: `rounded-xl`
- **Estilo Base**: `border border-warm-border bg-warm-card text-warm-charcoal placeholder:text-warm-muted focus-visible:ring-2 focus-visible:ring-warm-borderDark focus-visible:border-warm-borderDark`

### `Card` (`src/components/ui/card.tsx`)
- **Raio de Borda**: `rounded-2xl`
- **Estilo Base**: `border border-warm-border bg-warm-card text-warm-charcoal shadow-none`
- **CardHeader / CardTitle**: Tipografia `font-display font-bold text-warm-charcoal`
- **CardDescription**: Tipografia `text-warm-secondary text-sm`

### `Separator` (`src/components/ui/separator.tsx`)
- **Estilo Base**: `bg-warm-border`

---

## 2. Overlays & Overlays (`dialog`, `sheet`, `dropdown-menu`, `popover`, `tooltip`)

### `Dialog` & `Sheet`
- **Container**: `rounded-2xl border border-warm-border bg-warm-card text-warm-charcoal shadow-none`
- **Overlay**: `bg-warm-charcoal/40 backdrop-blur-xs`

### `DropdownMenu`, `Popover`, `Tooltip`
- **Container**: `rounded-xl border border-warm-border bg-warm-card text-warm-charcoal shadow-none`
- **Item Active/Hover**: `bg-warm-inner text-warm-charcoal`

---

## 3. Dados & Layout (`table`, `tabs`, `scroll-area`, `select`)

### `Tabs`
- **TabsList**: `rounded-xl bg-warm-inner p-1 text-warm-secondary border border-warm-border`
- **TabsTrigger**: `rounded-lg data-[state=active]:bg-warm-card data-[state=active]:text-warm-charcoal data-[state=active]:border-warm-border`

### `Table`
- **TableHead**: `text-warm-secondary font-medium border-b border-warm-border`
- **TableRow**: `border-b border-warm-border hover:bg-warm-inner/50`
