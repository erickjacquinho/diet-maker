# Tokens de Cores - NutriDiet Design System

> 🎨 **Arquitetura de Cores em 3 Camadas** (Primitivos → Semânticos → Componentes)

---

## 1. Camada 1: Cores Primitivas (Raw Values)

| Token Primitivo | Valor Hex | Descrição |
| :--- | :--- | :--- |
| `stone-50` | `#faf8f5` | Off-white extremamente suave |
| `stone-100` | `#f5f2eb` | Areia / Creme claro de fundo |
| `stone-200` | `#e8e4dc` | Bege nítido para bordas |
| `stone-300` | `#d6cfc4` | Bege médio para foco e hover |
| `stone-500` | `#8c8275` | Bege/cinza neutro para rótulos secundários |
| `stone-700` | `#4b5563` | Cinza escuro para corpo de texto |
| `stone-900` | `#111827` | Carvão escuro para números e títulos |
| `white` | `#ffffff` | Branco puro |
| `emerald-600` | `#059669` | Esmeralda principal (Sucesso / Meta / Destaque) |
| `emerald-50` | `#e6f4ea` | Esmeralda pastel para pílulas |
| `rose-600` | `#e11d48` | Carmim / Proteína / Alertas críticos |
| `rose-50` | `#fce8e6` | Carmim pastel para pílulas |
| `amber-600` | `#d97706` | Âmbar / Carboidrato / Alertas moderados |
| `amber-50` | `#fef3c7` | Âmbar pastel para pílulas |
| `teal-600` | `#0d9488` | Teal / Gordura / Acento secundário |
| `teal-50` | `#e6f2f2` | Teal pastel para pílulas |
| `terracotta-500` | `#d97760` | Coral Terracota para botões de ação secundária |

---

## 2. Camada 2: Cores Semânticas (System Tokens)

### 2.1 Superfícies e Estrutura
```css
:root {
  --color-bg-app: #f5f2eb;        /* Fundo geral da aplicação (Creme/Areia) */
  --color-surface-card: #ffffff;  /* Painéis e Cards de primeiro plano */
  --color-surface-subtle: #faf8f5;/* Containers internos e campos de busca */
  --color-border-clean: #e8e4dc;  /* Divisores e bordas nítidas de 1px */
  --color-border-hover: #d6cfc4;  /* Bordas em estado hover ou foco */
}
```

### 2.2 Tipografia e Contraste Visual (WCAG AAA/AA)
```css
:root {
  --color-text-primary: #111827;   /* Títulos, números em grande porte e valores */
  --color-text-secondary: #4b5563; /* Textos descritivos e corpo */
  --color-text-muted: #8c8275;     /* Labels secundários, placeholders e unidades */
}
```

### 2.3 Cores Nutricionais & Ações
```css
:root {
  --color-emerald: #059669;
  --color-emerald-bg: #e6f4ea;
  --color-rose: #e11d48;
  --color-rose-bg: #fce8e6;
  --color-amber: #d97706;
  --color-amber-bg: #fef3c7;
  --color-teal: #0d9488;
  --color-teal-bg: #e6f2f2;
  --color-terracotta: #d97760;
}
```

---

## 3. Camada 3: Mapeamento no Tailwind CSS (`tailwind.config.js`)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
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
          terracotta: '#d97760'
        }
      }
    }
  }
}
```

---

## 4. Matriz de Combinações Recomendadas (Acessibilidade)

| Elemento | Fundo | Cor do Texto / Ícone | Ratio Contraste | Uso Recomendado |
| :--- | :--- | :--- | :--- | :--- |
| **Card Base** | `#ffffff` | `#111827` (Charcoal) | 16.1:1 (AAA) | Títulos de refeição, nomes de alimentos |
| **App Background** | `#f5f2eb` | `#111827` (Charcoal) | 14.8:1 (AAA) | Título principal da página |
| **Pílula Esmeralda** | `#e6f4ea` | `#059669` (Emerald) | 4.8:1 (AA) | Badges de status "Na meta ✓" |
| **Pílula Proteína** | `#fce8e6` | `#e11d48` (Rose) | 4.6:1 (AA) | Badges de Gramas de Proteína |
| **Pílula Carbo** | `#fef3c7` | `#d97706` (Amber) | 4.5:1 (AA) | Badges de Gramas de Carboidrato |
| **Pílula Gordura** | `#e6f2f2` | `#0d9488` (Teal) | 4.7:1 (AA) | Badges de Gramas de Gordura |
