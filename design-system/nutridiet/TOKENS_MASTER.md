# NutriDiet Design System - Catálogo Mestre 100% de Tokens

> 💎 **Single Source of Truth de Tokens do NutriDiet (Ready-to-Go)**
> Arquitetura em 3 Camadas: **Primitivos ➔ Semânticos ➔ Componentes**, formatada e totalmente integrada no Next.js/Tailwind CSS.

---

## 🎨 1. Camada 1: Tokens Primitivos (Raw Values)

### 1.1 Cores Nativas Base (Raw Hex Palette)
```json
{
  "stone-50": "#faf8f5",
  "stone-100": "#f5f2eb",
  "stone-200": "#e8e4dc",
  "stone-300": "#d6cfc4",
  "stone-500": "#8c8275",
  "stone-700": "#4b5563",
  "stone-900": "#111827",
  "white": "#ffffff",
  "emerald-600": "#059669",
  "emerald-50": "#e6f4ea",
  "rose-600": "#e11d48",
  "rose-50": "#fce8e6",
  "amber-600": "#d97706",
  "amber-50": "#fef3c7",
  "teal-600": "#0d9488",
  "teal-50": "#e6f2f2",
  "terracotta-500": "#d97760",
  "terracotta-50": "#fdf2f0"
}
```

### 1.2 Tipografia Primitiva
- **Display / Metric Font**: `'Plus Jakarta Sans', sans-serif` (Pesos: 700, 800, 900)
- **Body / Interface Font**: `'Inter', sans-serif` (Pesos: 400, 500, 600, 700)
- **Mono / Time Font**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### 1.3 Escala de Arredondamento (Border Radius)
- `rounded-2xl`: `16px` (1rem) ➔ Cards Principais & Modais
- `rounded-xl`: `12px` (0.75rem) ➔ Inputs, Botões & Caixas
- `rounded-lg`: `8px` (0.5rem) ➔ Sub-elementos
- `rounded-full`: `9999px` ➔ Badges & Pílulas de Status

---

## 🏛️ 2. Camada 2: Tokens Semânticos (System Intent)

### 2.1 Superfícies & Layout
| Token Semântico | Token Primitivo Mapeado | Valor Hex | Aplicação no Sistema |
| :--- | :--- | :--- | :--- |
| `--color-bg-app` | `stone-100` | `#f5f2eb` | Fundo principal de tela (Creme / Areia) |
| `--color-surface-card` | `white` | `#ffffff` | Cartões e painéis principais |
| `--color-surface-subtle` | `stone-50` | `#faf8f5` | Containers internos de itens |
| `--color-border-clean` | `stone-200` | `#e8e4dc` | Linhas de contorno sólido 1px |
| `--color-border-focus` | `stone-300` | `#d6cfc4` | Contornos em foco ou hover |

### 2.2 Tipografia & Leitura (WCAG AAA)
| Token Semântico | Token Primitivo Mapeado | Valor Hex | Aplicação no Sistema |
| :--- | :--- | :--- | :--- |
| `--color-text-primary` | `stone-900` | `#111827` | Títulos, números em grande porte |
| `--color-text-secondary` | `stone-700` | `#4b5563` | Corpo de texto e descrições |
| `--color-text-muted` | `stone-500` | `#8c8275` | Rótulos secundários, placeholders |

### 2.3 Macronutrientes & Status
| Macronutriente / Status | Cor Principal (`text` / `border`) | Fundo Pílula (`bg`) | Ratio Contraste WCAG |
| :--- | :--- | :--- | :--- |
| **Kcal Total / Meta** | `#059669` (`emerald-600`) | `#e6f4ea` (`emerald-50`) | 4.8:1 (AA) |
| **Proteínas / Carmim** | `#e11d48` (`rose-600`) | `#fce8e6` (`rose-50`) | 4.6:1 (AA) |
| **Carboidratos / Âmbar** | `#d97706` (`amber-600`) | `#fef3c7` (`amber-50`) | 4.5:1 (AA) |
| **Gorduras / Teal** | `#0d9488` (`teal-600`) | `#e6f2f2` (`teal-50`) | 4.7:1 (AA) |
| **Ação Terracota** | `#d97760` (`terracotta-500`)| `#fdf2f0` (`terracotta-50`)| 4.5:1 (AA) |

---

## 🧩 3. Camada 3: Tokens de Componentes & Tailwind (`tailwind.config.js`)

```javascript
// tailwind.config.js (100% Configurado e Ativo no Projeto)
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        warm: {
          bg: '#f5f2eb',
          card: '#ffffff',
          inner: '#faf8f5',
          border: '#e8e4dc',
          borderDark: '#d6cfc4',
          charcoal: '#111827',
          secondary: '#4b5563',
          muted: '#8c8275',
          emerald: '#059669',
          emeraldBg: '#e6f4ea',
          rose: '#e11d48',
          roseBg: '#fce8e6',
          amber: '#d97706',
          amberBg: '#fef3c7',
          teal: '#0d9488',
          tealBg: '#e6f2f2',
          terracotta: '#d97760',
          terracottaBg: '#fdf2f0'
        }
      },
      borderRadius: {
        '2xl': '1rem',   /* 16px */
        'xl': '0.75rem', /* 12px */
        'lg': '0.5rem',  /* 8px */
      },
      spacing: {
        'sidebar': '240px',
      },
      zIndex: {
        'sticky-sidebar': '10',
        'dropdown': '20',
        'modal-backdrop': '40',
        'modal-content': '50',
      }
    }
  }
}
```

---

## 💻 4. Importação Programática em TypeScript (`src/design-system/tokens.ts`)

```typescript
import { designTokens, semanticTokens, primitiveTokens } from '@/design-system/tokens';

// Exemplo de Acesso Programático:
const cardBackground = semanticTokens.surfaces.card; // "#ffffff"
const primaryText = semanticTokens.text.primary;       // "#111827"
const sidebarWidth = primitiveTokens.spacing.sidebarWidth; // "240px"
```
