# Research & Component Inventory: Mapeamento 100% de `/src`

## Overview

Foi realizado um levantamento exaustivo de 100% dos arquivos de interface em `src/` para identificar elementos nativos HTML (`<button>`, `<input>`, `<select>`, `<table`), overlays customizados (`fixed inset-0`) e componentes legados em `atoms/` que devem ser migrados para os primitivos do Shadcn em `@/components/ui/`.

---

## Inventário Detalhado por Arquivo

### 1. Páginas e Telas (`src/app/`)

| Arquivo | Elementos Atuais a Migrar | Componentes Shadcn Alvo |
| :--- | :--- | :--- |
| `src/app/alimentos/page.tsx` | `<input>` de busca, `<button>` de ordenação, `<table` nativa, modal div `fixed inset-0 z-50` de criar alimento customizado, `<select>` de categoria | `Input`, `Button`, `Table`, `Dialog`, `Select`, `Badge`, `Card` |
| `src/app/pacientes/page.tsx` | `<input>` de filtro, modal div `fixed inset-0` de novo paciente, `<select>` de objetivo, `<button>` de submit/cancel | `Input`, `Button`, `Dialog`, `Select`, `Card`, `Badge` |
| `src/app/pacientes/[id]/page.tsx` | Modal div `fixed inset-0` de novo plano alimentar, `<input>` de título/meta, `<button>` de criar/voltar | `Dialog`, `Input`, `Button`, `Card`, `Badge` |
| `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` | Modais div `fixed inset-0` (Adicionar Refeição, Busca TACO, Ajuste de Porção), `<input>` de gramas e filtros, `<button>` de ações | `Dialog`, `Sheet`, `Input`, `Button`, `Card`, `Tabs`, `Popover`, `Tooltip`, `Badge` |
| `src/app/presets/page.tsx` | Modal div `fixed inset-0` de novo preset, `<input>` de título/categoria, `<button>` de aplicar/deletar | `Dialog`, `Input`, `Button`, `Card`, `Badge` |
| `src/app/refeicoes-prontas/page.tsx` | Modal div `fixed inset-0` de nova refeição rápida, `<input>` de porção/alimento, `<button>` de ações | `Dialog`, `Input`, `Button`, `Card`, `Badge` |

---

### 2. Componentes de UI (`src/components/`)

| Arquivo | Estado Atual | Plano de Migração / Refatoração |
| :--- | :--- | :--- |
| `src/components/atoms/Button.tsx` | Implementação custom com tag `<button>` | Reexportar ou encapsular `@/components/ui/button` com mapeamento de props |
| `src/components/atoms/Input.tsx` | Implementação custom com tag `<input>` | Reexportar ou encapsular `@/components/ui/input` com mapeamento de props |
| `src/components/atoms/Badge.tsx` | Implementação custom com `<span>` | Reexportar ou encapsular `@/components/ui/badge` |
| `src/components/atoms/IconButton.tsx` | Encapsula `<button>` nativo | Substituir por `Button` de `@/components/ui/button` com `variant="ghost"` ou `size="icon"` |
| `src/components/atoms/Avatar.tsx` | Div circular custom | Padronizar estilos ou estender primitivo |
| `src/components/atoms/ProgressBar.tsx` | Bar div custom | Padronizar variante de progresso com tokens |
| `src/components/molecules/MacroMetricCard.tsx` | Cartão de macro com div custom | Migrar contêiner para `Card`, `CardContent` de `@/components/ui/card` |
| `src/components/molecules/MealItemRow.tsx` | Linha de alimento com `<button>` nativo | Substituir por `Button` e `Input` de `@/components/ui/` |
| `src/components/molecules/PatientBadgeHeader.tsx` | Cabeçalho com div e `atoms/Badge` | Substituir por `Badge` e `Card` de `@/components/ui/` |
| `src/components/molecules/TacoSearchInput.tsx` | Busca com `atoms/Input` | Migrar para `Input` de `@/components/ui/input` |
| `src/components/organisms/MacroTrackerHeader.tsx` | Header de macros com div custom | Usar `Card` e `CardHeader` de `@/components/ui/card` |
| `src/components/organisms/MealCardContainer.tsx` | Cartão de refeição com `atoms/Button` | Usar `Card`, `CardContent`, `CardHeader` e `Button` de `@/components/ui/` |
| `src/components/organisms/SidebarNav.tsx` | Drawer e menu com `<button>` e overlay | Refatorar para `Sheet`, `Button`, `Tooltip` de `@/components/ui/` |
| `src/components/templates/DietBuilderTemplate.tsx` | Template do montador com `atoms/Button` | Refatorar para `Button` e `Tabs` de `@/components/ui/` |

---

## Decisões Técnicas de Design

1. **Estratégia de Transição para Modais**:
   - Subsidiar todos os overlays `div.fixed.inset-0` pelo componente `Dialog` (`DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`).
   - Para menus laterais de filtros ou navegação mobile, utilizar `Sheet` (`SheetTrigger`, `SheetContent`).

2. **Estratégia para Componentes de Formulário**:
   - Substituir `<select>` HTML por `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`).
   - Substituir `<input>` por `Input` mantendo suporte a `type`, `value`, `onChange`, `placeholder` e `className`.

3. **Compatibilidade de Atoms Legados**:
   - `atoms/Button.tsx`, `atoms/Input.tsx` e `atoms/Badge.tsx` serão mantidos como re-exports compatíveis com Shadcn UI para evitar quebras em imports terceiros.
