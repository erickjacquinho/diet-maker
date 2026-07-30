# Plano de Arquitetura e Implementação: Atomic Design System em Código React / Next.js

## 1. Visão de Arquitetura do Código (`src/`)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── IconButton.tsx
│   │   ├── Avatar.tsx
│   │   └── index.ts
│   ├── molecules/
│   │   ├── MacroMetricCard.tsx
│   │   ├── MealItemRow.tsx
│   │   ├── PatientBadgeHeader.tsx
│   │   ├── TacoSearchInput.tsx
│   │   └── index.ts
│   ├── organisms/
│   │   ├── SidebarNav.tsx
│   │   ├── MacroTrackerHeader.tsx
│   │   ├── MealCardContainer.tsx
│   │   └── index.ts
│   └── templates/
│       ├── DietBuilderTemplate.tsx
│       └── index.ts
└── app/
    └── page.tsx
```

---

## 2. Fases de Execução

### Fase 1: Átomos Primitivos (`src/components/atoms/`)
Construção dos 6 componentes atômicos com suporte total ao Tailwind CSS estipulado em `design-system/nutridiet/components/atoms.md`.

### Fase 2: Moléculas (`src/components/molecules/`)
Composição dos átomos para criar `MacroMetricCard`, `MealItemRow`, `PatientBadgeHeader` e `TacoSearchInput`.

### Fase 3: Organismos (`src/components/organisms/`)
Construção dos agrupadores `SidebarNav`, `MacroTrackerHeader` e `MealCardContainer`.

### Fase 4: Templates & Refatoração de Rota (`src/components/templates/` & `src/app/page.tsx`)
Construção do `DietBuilderTemplate` e integração final na página principal Next.js.

---

## 3. Plano de Teste e Validação
- Compilação via `npm run build` ou validação TypeScript sem erros de tipos.
- Verificação de renderização visual dos componentes na página principal.
