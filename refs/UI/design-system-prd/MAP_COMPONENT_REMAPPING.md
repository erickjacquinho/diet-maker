# Remapeamento Total dos Componentes — NutriDiet Design System (100% Tokenizado)

> **Especificação Técnica Definitiva de Componentes (100% Baseada em Tokens)**  
> **DIRETRIZ ABSOLUTA**: **ZERO VALORES HARDCODED / ZERO ABSOLUTOS DE COR OU ESPAÇAMENTO**. Todos os componentes listados abaixo utilizam EXCLUSIVAMENTE tokens semânticos e utilitários do Design System (`bg-warm-bg`, `bg-warm-card`, `bg-warm-inner`, `border-warm-border`, `border-warm-borderDark`, `text-warm-main`, `text-warm-secondary`, `text-warm-muted`, `bg-nutri-success-bg`, `text-nutri-success-text`, `font-display`, `font-body`, `font-mono`, `rounded-card`, `rounded-control`, `rounded-pill`).  
> **Base de Referência**: [PRD_DESIGN_SYSTEM.md](file:///c:/Programmer/diet-maker/refs/UI/design-system-prd/PRD_DESIGN_SYSTEM.md) + [MAP_DESIGN_SYSTEM_TOKENS.md](file:///c:/Programmer/diet-maker/refs/UI/design-system-prd/MAP_DESIGN_SYSTEM_TOKENS.md)

---

## 🏛️ Guia de Arquitetura Atomic Design

```
src/components/
├── atoms/          # Level 1: Átomos primitivos e wrappers do Shadcn UI (100% Tokens)
├── molecules/      # Level 2: Composições de 2+ átomos (100% Tokens)
├── organisms/      # Level 3: Seções de layout e painéis interativos (100% Tokens)
├── templates/      # Level 4: Esqueletos de página reutilizáveis (0% dados hardcoded)
└── ui/             # Level 0: Componentes base Shadcn UI (100% PRESERVADOS & INTOCADOS)
src/app/            # Level 5: Rotas Next.js App Router (Injeção de dados reais)
```

---

## ⚛️ 1. Camada 1: Átomos (`src/components/atoms/`)

---

### 1.1 `Button.tsx` (Wrapper `NutriButton` & Sub-componentes Táticos)

#### 📋 Interfaces TypeScript
```typescript
import React from 'react';
import { ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'ghost' | 'pill' | 'destructive' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  ref?: React.Ref<HTMLButtonElement>;
}

export interface CreateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export interface IconButtonProps extends ShadcnButtonProps {
  'aria-label': string; // Mandatório para Acessibilidade WCAG
  title?: string;
  icon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}
```

#### 🎨 Mapeamento Exato de Classes por Tokens Semânticos
* **`primary` / `default`**: `bg-charcoal-900 text-white hover:bg-charcoal-800 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-warm-focus focus-visible:ring-offset-2 focus-visible:ring-offset-warm-bg rounded-control transition-all duration-150`
* **`emerald` / `highlight`**: `bg-emerald-700 text-white hover:bg-emerald-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-bg rounded-control transition-all duration-150`
* **`outline` / `secondary`**: `bg-warm-card text-warm-main border border-warm-border hover:bg-warm-inner hover:border-warm-borderDark active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-warm-focus rounded-control transition-all duration-150`
* **`ghost`**: `bg-transparent text-warm-secondary hover:bg-warm-inner hover:text-warm-main active:scale-[0.98] rounded-control transition-all duration-150`
* **`pill`**: `bg-warm-inner text-warm-secondary border border-warm-border hover:bg-warm-card hover:text-warm-main hover:border-warm-borderDark rounded-pill px-3.5 py-1.5 text-xs font-body font-medium active:scale-[0.96] transition-all duration-150`
* **`destructive`**: `bg-nutri-error-bg text-nutri-error-text border border-nutri-error-border hover:bg-rose-700 hover:text-white active:scale-[0.98] rounded-control transition-all duration-150`

#### 🛠️ Sub-componentes Táticos Embutidos
* **`CreateButton`**: variante `emerald`, classe `inline-flex items-center gap-xs px-3.5 py-2 rounded-control text-xs font-body font-bold transition-all active:scale-[0.98] cursor-pointer`. Ícone: `<Plus size={14} />`.
* **`EditIconButton`**: variante `ghost`, classe `h-8 w-8 rounded-lg bg-warm-inner border border-warm-border text-warm-muted hover:text-warm-main hover:bg-warm-card hover:border-warm-borderDark transition-all cursor-pointer`. Ícone: `<Pencil size={14} />`.
* **`DeleteIconButton`**: variante `ghost`, classe `h-8 w-8 rounded-lg bg-warm-inner border border-warm-border text-nutri-error-text hover:bg-nutri-error-bg hover:border-nutri-error-border transition-all cursor-pointer`. Ícone: `<Trash2 size={14} />`.

---

### 1.2 `Badge.tsx` (Wrapper `NutriBadge`)

#### 🎨 Mapeamento Exato de Tokens por Variante
* **`emerald`**: `bg-nutri-success-bg text-nutri-success-text border border-nutri-success-border rounded-pill px-3 py-1 text-xs font-body font-semibold inline-flex items-center gap-2xs`
* **`amber`**: `bg-nutri-warning-bg text-nutri-warning-text border border-nutri-warning-border rounded-pill px-3 py-1 text-xs font-body font-semibold inline-flex items-center gap-2xs`
* **`teal`**: `bg-nutri-info-bg text-nutri-info-text border border-nutri-info-border rounded-pill px-3 py-1 text-xs font-body font-semibold inline-flex items-center gap-2xs`
* **`rose`**: `bg-nutri-error-bg text-nutri-error-text border border-nutri-error-border rounded-pill px-3 py-1 text-xs font-body font-semibold inline-flex items-center gap-2xs`
* **`neutral`**: `bg-nutri-neutral-bg text-nutri-neutral-text border border-nutri-neutral-border rounded-pill px-3 py-1 text-xs font-body font-semibold inline-flex items-center gap-2xs`

---

### 1.3 `Input.tsx` (Wrapper `NutriInput`)

#### 🎨 Mapeamento de Classes por Tokens
* **Classes Tailwind**: `w-full h-10 px-3 py-2 bg-warm-card border border-warm-border rounded-control text-sm font-body text-warm-main placeholder:text-warm-muted focus-visible:outline-none focus-visible:border-warm-borderDark focus-visible:ring-2 focus-visible:ring-warm-focus focus-visible:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:bg-warm-inner`

---

### 1.4 `ProgressBar.tsx`

#### 📋 Tokens Visuais de Estrutura
* **Container Trilha**: `w-full bg-warm-border h-2 rounded-pill overflow-hidden`
* **Preenchimento**: `h-full transition-all duration-300 ease-in-out`
* **Cores de Preenchimento**:
  - `emerald`: `bg-emerald-600`
  - `rose`: `bg-rose-700`
  - `amber`: `bg-amber-700`
  - `teal`: `bg-teal-700`
  - `blue`: `bg-blue-600`

---

### 1.5 `Avatar.tsx`

#### 📋 Tokens Visuais de Estrutura
* **Tamanhos**: `sm` (`w-8 h-8 text-xs`), `md` (`w-9 h-9 text-sm`), `lg` (`w-11 h-11 text-sm font-bold`)
* **Variantes**:
  - `emerald`: `bg-nutri-success-bg text-nutri-success-text font-bold border border-nutri-success-border`
  - `charcoal`: `bg-charcoal-900 text-white font-bold`
  - `inner`: `bg-warm-inner border border-warm-borderDark text-warm-main font-bold`
* **Formato**: `rounded-pill flex items-center justify-center shrink-0`

---

### 1.6 Novos Átomos (100% Tokenizados)

#### 🟢 `SparklineLine.tsx`
* **Props**: `{ data: number[]; width?: number; height?: number; color?: string; className?: string; }`
* **Estrutura**: SVG leve renderizando polilinha vetorial com nó terminal.
* **Cor Padrão de Traço**: Token `var(--color-charcoal-900)`.

#### 🟢 `NutriCheckbox.tsx`
* **Estrutura**: `w-5 h-5 rounded-pill border border-warm-borderDark flex items-center justify-center transition-all duration-150 cursor-pointer`.
* **Estado Ativo**: `bg-charcoal-900 border-charcoal-900 text-white`. Ícone: `<Check size={12} strokeWidth={3} />`.

#### 🟢 `NutriStepper.tsx`
* **Estrutura**: Contêiner `flex items-center gap-2xs bg-warm-inner border border-warm-border rounded-control p-3xs`.
* **Botões `-` / `+`**: `h-7 w-7 rounded-lg bg-warm-card border border-warm-border text-warm-main font-bold hover:bg-warm-hover active:scale-95 flex items-center justify-center`.
* **Display**: `px-xs text-xs font-mono font-bold text-warm-main`.

#### 🟢 `NutriSwitch.tsx`
* **Trilha**: `w-11 h-6 rounded-pill transition-colors duration-150 p-3xs cursor-pointer` (`checked ? "bg-emerald-700" : "bg-warm-border"`).
* **Knob**: `w-5 h-5 rounded-pill bg-warm-card transition-transform duration-150` (`checked ? "translate-x-5" : "translate-x-0"`).

#### 🟢 `NutriSkeleton.tsx`
* **Classes**: `animate-pulse bg-warm-border rounded-control`

---

## 🧬 2. Camada 2: Moléculas (`src/components/molecules/`)

---

### 2.1 `MacroMetricCard.tsx`

#### 🎨 Blueprint TSX 100% Tokenizado
```tsx
<div className="bg-warm-card border border-warm-border rounded-card p-md flex flex-col justify-between">
  <div className="flex justify-between items-center text-xs font-body font-semibold mb-2xs">
    <span className="text-warm-main font-bold">{label}</span>
    {statusBadgeText && <NutriBadge variant={statusBadgeVariant}>{statusBadgeText}</NutriBadge>}
  </div>

  <div className="text-2xl font-mono font-bold text-warm-main my-2xs">
    {currentValue} <span className="text-xs font-body font-normal text-warm-muted">/ {targetValue}</span>
  </div>

  {gPerKgRatio ? (
    <div className="text-xs font-mono font-semibold text-emerald-700 mb-xs">
      {gPerKgRatio} <span className="text-[10px] font-body text-warm-muted font-normal">(meta: {gPerKgMeta})</span>
    </div>
  ) : (
    <div className="h-4 mb-xs" />
  )}

  <ProgressBar value={percentage} colorVariant={macroColor} />
</div>
```

---

### 2.2 `MealItemRow.tsx`

#### 🎨 Blueprint TSX 100% Tokenizado
```tsx
<div className="group/row flex items-center justify-between bg-warm-inner border border-warm-border rounded-control p-sm hover:border-warm-borderDark transition-all">
  <div className="flex items-center gap-xs">
    <button className="p-3xs rounded-md cursor-grab text-warm-muted hover:text-warm-main opacity-0 group-hover/row:opacity-100 transition-opacity">
      <GripVertical size={14} />
    </button>
    <div>
      <div className="text-xs font-body font-bold text-warm-main">{name}</div>
      <div className="text-[11px] font-mono text-warm-secondary mt-3xs flex items-center gap-2xs">
        <span className="text-blue-600 font-semibold">P: {protein}g</span>
        <span className="text-warm-muted">•</span>
        <span className="text-amber-700 font-semibold">C: {carbs}g</span>
        <span className="text-warm-muted">•</span>
        <span className="text-teal-700 font-semibold">G: {fats}g</span>
        <span className="text-warm-muted">•</span>
        <span className="text-warm-main">{kcal} kcal</span>
      </div>
    </div>
  </div>

  <div className="flex items-center gap-xs">
    <button onClick={handleEditGrams} className="bg-warm-card border border-warm-borderDark hover:border-emerald-700 rounded-control px-2.5 py-1 text-xs font-mono font-bold text-warm-main transition-all">
      {quantityGrams} <span className="font-body font-normal text-warm-muted">g</span>
    </button>
    <DeleteIconButton onClick={onRemove} aria-label={`Remover ${name}`} />
  </div>
</div>
```

---

### 2.3 `PatientBadgeHeader.tsx`

#### 🎨 Blueprint TSX 100% Tokenizado
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-sm mb-md border-b border-warm-border gap-sm">
  <div className="flex items-center gap-sm">
    <Avatar initials={initials} size="lg" variant="inner" />
    <div>
      <div className="flex items-center gap-xs">
        <h2 className="text-lg font-display font-bold text-warm-main">{name}</h2>
        <NutriBadge variant="neutral">{weightKg} kg</NutriBadge>
      </div>
      <p className="text-xs font-body text-warm-secondary mt-3xs">{goalDescription}</p>
    </div>
  </div>
  <Button onClick={onAdjustGoals} variant="outline" size="sm" className="flex items-center gap-2xs">
    <Pencil size={13} />
    <span>Ajustar Metas</span>
  </Button>
</div>
```

---

### 2.4 `NutriToast.tsx` (Empilhamento Semântico Flutuante)

#### 🎨 Blueprint TSX 100% Tokenizado
```tsx
export function NutriToast({ title, description, variant = "info", onClose }: NutriToastProps) {
  const configs = {
    info:    { icon: Info,          iconColor: "text-nutri-info-text",    bgColor: "bg-nutri-info-bg",    borderColor: "border-nutri-info-border" },
    success: { icon: CheckCircle2,  iconColor: "text-nutri-success-text", bgColor: "bg-nutri-success-bg", borderColor: "border-nutri-success-border" },
    warning: { icon: AlertTriangle, iconColor: "text-nutri-warning-text", bgColor: "bg-nutri-warning-bg", borderColor: "border-nutri-warning-border" },
    error:   { icon: AlertCircle,   iconColor: "text-nutri-error-text",   bgColor: "bg-nutri-error-bg",   borderColor: "border-nutri-error-border" },
  };
  const config = configs[variant];
  const IconComponent = config.icon;

  return (
    <div className={cn("flex w-full max-w-md items-start gap-sm rounded-card border bg-warm-card p-md transition-all duration-200 z-toast", config.borderColor)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-control", config.bgColor)}>
        <IconComponent className={cn("h-5 w-5", config.iconColor)} />
      </div>
      <div className="flex-1 pt-3xs">
        <h4 className="text-sm font-display font-semibold text-warm-main">{title}</h4>
        <p className="mt-3xs text-xs font-body text-warm-secondary leading-relaxed">{description}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="rounded-lg p-3xs text-warm-muted hover:bg-warm-inner hover:text-warm-main transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

---

### 2.5 `HabitItemRow.tsx` (Checklist de Hábitos)
* **Layout**: `flex items-center justify-between p-sm bg-warm-card border border-warm-border rounded-card hover:border-warm-borderDark transition-all`.
* **Badge Ícone**: `h-10 w-10 rounded-pill bg-warm-inner border border-warm-border flex items-center justify-center shrink-0`.
* **Texto**: Título H3 (`text-xs font-display font-bold text-warm-main`), Metadados (`text-[11px] font-body text-warm-muted`).
* **Controle**: `<NutriCheckbox checked={completed} onChange={onToggle} />`.

---

### 2.6 `NutriEmptyState.tsx`
* **Layout**: `p-2xl text-center bg-warm-card border border-dashed border-warm-border rounded-card space-y-md flex flex-col items-center justify-center`.
* **Badge Ícone**: `h-12 w-12 rounded-control bg-nutri-success-bg text-nutri-success-text flex items-center justify-center mx-auto`.
* **Ação**: Botão `emerald` em `rounded-control`.

---

## 🦠 3. Camada 3: Organismos (`src/components/organisms/`)

---

### 3.1 `SidebarNav.tsx`

#### 🎨 Blueprint TSX 100% Tokenizado
```tsx
<aside className={cn(
  "bg-warm-card border-r border-warm-border h-screen sticky top-0 flex flex-col justify-between shrink-0 transition-all duration-300 z-sticky-sidebar",
  isCollapsed ? "w-20 px-sm py-md" : "w-64 p-md"
)}>
  <div className="flex flex-col w-full">
    {/* Sidebar Brand */}
    <div className="flex items-center justify-between mb-lg w-full">
      <Link href="/pacientes" className="flex items-center gap-sm overflow-hidden">
        <Avatar initials="N" variant="charcoal" size="md" className="rounded-control shrink-0" />
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="font-display font-bold text-base text-warm-main leading-none truncate">NutriDiet</h1>
            <span className="text-[10px] font-display font-bold text-emerald-700 uppercase tracking-wider block mt-3xs">Pro Local</span>
          </div>
        )}
      </Link>
      <button onClick={toggleCollapse} className="h-8 w-8 border border-warm-border rounded-control flex items-center justify-center text-warm-muted hover:text-warm-main hover:bg-warm-inner">
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>

    {/* Nav Items List */}
    <nav className="space-y-2xs w-full">
      {navItems.map((item) => (
        <SidebarNavItem key={item.href} {...item} isCollapsed={isCollapsed} />
      ))}
    </nav>
  </div>

  {/* Footer Profile & Quick Actions */}
  <div className="pt-md border-t border-warm-border space-y-sm w-full">
    <SidebarUserProfile doctorName="Dr. Lucas" doctorRole="Nutricionista" isCollapsed={isCollapsed} />
    <SidebarQuickActions onSave={onSave} onOpen={onOpen} isCollapsed={isCollapsed} />
  </div>
</aside>
```

* **Item Ativo**: `bg-charcoal-900 text-white font-body font-bold rounded-control px-3.5 py-2.5 text-xs flex items-center gap-sm`.
* **Item Inativo**: `text-warm-secondary hover:text-warm-main hover:bg-warm-inner font-body font-semibold rounded-control px-3.5 py-2.5 text-xs flex items-center gap-sm`.

---

### 3.2 `MacroTrackerHeader.tsx`
* **Grid**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md w-full`.
* **Aninhamento**: Contém 4 moléculas `MacroMetricCard` (Proteínas, Carboidratos, Gorduras, Calorias Totais).

---

### 3.3 `MealCardContainer.tsx`
* **Card Container**: `bg-warm-card border border-warm-border rounded-card p-5 space-y-md flex flex-col justify-between`.
* **Meal Header**: `flex items-center justify-between pb-sm border-b border-warm-border`. Título em `font-display font-bold text-base text-warm-main`. Badge de Horário: `text-xs font-mono text-warm-muted bg-warm-inner border border-warm-border px-2.5 py-0.5 rounded-pill`.
* **Lista de Alimentos**: Espaçamento `space-y-2xs`.
* **Botão Adicionar**: Botão tracejado `w-full border-dashed border-warm-borderDark bg-warm-inner/60 hover:bg-warm-inner text-warm-main font-body font-bold text-xs py-2 rounded-control flex items-center justify-center gap-2xs`.

---

### 3.4 Novos Organismos (100% Tokenizados)

#### 🟢 `BentoGridContainer.tsx`
* **Grid Responsivo**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-lg w-full`.

#### 🟢 `HabitTrackerSection.tsx`
* **Filtros**: Pílulas cápsula `FilterPillBar` (`px-3.5 py-1.5 rounded-pill border border-warm-border bg-warm-inner text-xs font-body font-medium text-warm-secondary`).
* **Colunas de Rotina**: `grid grid-cols-1 md:grid-cols-2 gap-md mt-md`.

#### 🟢 `NutritionalSparklineTable.tsx`
* **Header da Tabela (`<thead>`)**: `bg-warm-inner text-warm-secondary text-xs font-body font-medium border-b border-warm-border h-10 px-md text-left`.
* **Linha (`<tbody>`)**: `h-12 border-b border-warm-border hover:bg-warm-inner/60 transition-colors px-md text-xs font-body text-warm-main`.
* **Valores Numéricos**: Classe `font-mono font-semibold text-warm-main`.
* **Coluna Sparkline**: Renderização de `<SparklineLine data={historicalData} color="var(--color-charcoal-900)" />`.

---

## 📐 4. Camada 4: Templates (`src/components/templates/`)

---

### 4.1 `DietBuilderTemplate.tsx`
* **Shell Wrapper**: `flex-1 min-w-0 flex flex-col w-full bg-warm-bg min-h-screen`.
* **Área de Conteúdo**: `flex-1 p-md sm:p-lg lg:p-xl space-y-lg max-w-6xl mx-auto w-full`.
* **Seções Integradas**:
  1. Action Header (Navegação de volta + Título da prescrição + Botões de ação em topo).
  2. `DietModeSwitcher`
  3. `MacroTrackerHeader`
  4. Grid de `MealCardContainer` (`grid grid-cols-1 md:grid-cols-2 gap-lg`).

---

### 4.2 `AppLayoutShell.tsx`
* **Container**: `flex h-screen w-full overflow-hidden bg-warm-bg`.
* **Sidebar Section**: `<SidebarNav />` fixado à esquerda.
* **Main Section**: `<main className="flex-1 overflow-y-auto min-w-0">{children}</main>`.

---

### 4.3 `PatientDashboardTemplate.tsx`
* **Estrutura**: Integrador sem dados hardcoded que agrupa `PatientBadgeHeader`, `HabitTrackerSection` e `NutritionalSparklineTable` em layout Bento Grid.

---

## 🛡️ 5. Camada Base: Primitivos Shadcn UI (`src/components/ui/`)

Preservados 100% limpos em `src/components/ui/` sem modificações de regras de negócio:
* `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `popover.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `table.tsx`, `tabs.tsx`, `tooltip.tsx`.
