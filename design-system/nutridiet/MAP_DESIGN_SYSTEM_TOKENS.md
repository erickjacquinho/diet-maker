# Mapeamento de Tokens do Design System NutriDiet (100% Tokenizado)

> **Documento de Especificação de Tokens Visuais Mestre**  
> **Diretriz Absoluta**: **ZERO VALORES HARDCODED OU VALORES ABSOLUTOS (HEX / PIXELS AD-HOC) EM COMPONENTES**. 100% das cores, tipografias, arredondamentos, bordas, espaçamentos, z-index e sombras do **NutriDiet Local Pro** DEVEM ser consumidos via tokens semânticos e utilitários declarados no Design System.  
> **Base de Especificação**: [PRD_DESIGN_SYSTEM.md](file:///c:/Programmer/diet-maker/refs/UI/design-system-prd/PRD_DESIGN_SYSTEM.md) + [MASTER.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/MASTER.md)

---

## 🎨 1. Camada 1: Tokens Primitivos (Primitive Tokens)

Os primitivos definem os valores brutos da paleta. **Nunca utilize hexadecimais brutos nos componentes React (ex: proibidíssimo usar `bg-[#111827]` ou `color: #047857`)**. Em vez disso, utilize os utilitários da Camada 2 e 3 ou os primitivos nomeados `sand-*`, `charcoal-*`, `emerald-*`.

### 1.1 Escala Sand (Creme / Areia Swiss Warm)
```css
--color-sand-50:  #faf8f5; /* Token: sand-50  (Off-white sutil) */
--color-sand-100: #f5f2eb; /* Token: sand-100 (Canvas Mestre Swiss Warm) */
--color-sand-200: #e8e4dc; /* Token: sand-200 (Borda limpa 1px) */
--color-sand-300: #d6cfc4; /* Token: sand-300 (Borda hover/foco) */
--color-sand-400: #b8af9e; /* Token: sand-400 (Linhas divisórias internas) */
```

### 1.2 Escala Charcoal & Slate (Escuro & Textos)
```css
--color-charcoal-950: #0b0f17; /* Token: charcoal-950 (Fundo ativo de botões dark) */
--color-charcoal-900: #111827; /* Token: charcoal-900 (Texto mestre & botões dark) */
--color-charcoal-800: #1f2937; /* Token: charcoal-800 (Hover botões dark) */
--color-slate-600:    #4b5563; /* Token: slate-600    (Texto secundário 7.0:1) */
--color-slate-500:    #645d52; /* Token: slate-500    (Texto muted/legenda 5.1:1) */
--color-slate-300:    #9ca3af; /* Token: slate-300    (Estado desabilitado) */
```

### 1.3 Cor Dominante de Destaque (Brand Highlight / Vitality)
```css
--color-emerald-700: #047857; /* Token: emerald-700 (Esmeralda Principal / CTA Destaque) */
--color-emerald-600: #059669; /* Token: emerald-600 (Hover Esmeralda) */
--color-emerald-50:  #e6f4ea; /* Token: emerald-50  (Fundo Pastel Esmeralda) */
```

### 1.4 Primitivos Nutricionais
```css
--color-teal-700:  #0f766e; /* Token: teal-700 (Teal Gorduras/Info) */
--color-teal-50:   #e6f2f2; /* Token: teal-50  (Teal Pastel) */

--color-amber-700: #b45309; /* Token: amber-700 (Âmbar Carboidratos/Warning) */
--color-amber-50:  #fef3c7; /* Token: amber-50  (Âmbar Pastel) */

--color-rose-700:  #be123c; /* Token: rose-700  (Rose Proteínas/Error) */
--color-rose-50:   #fce8e6; /* Token: rose-50   (Rose Pastel) */

--color-blue-600:  #2563eb; /* Token: blue-600  (Azul Cobalto Auxiliar) */
--color-blue-50:   #eff6ff; /* Token: blue-50   (Azul Pastel) */
```

---

## 🏛️ 2. Camada 2: Tokens Semânticos de Superfície, Controle & Texto

**ESTA É A CAMADA OBRIGATÓRIA PARA CONSTRUÇÃO DE INTERFACE**. Todos os componentes DEVEM utilizar estas variáveis e suas respectivas classes utilitárias no Tailwind CSS.

### 2.1 Mapeamento de Superfícies & Fundos
| Nome do Token | Variável CSS | Classe Tailwind | Propósito Exclusivo |
| :--- | :--- | :--- | :--- |
| **Canvas App** | `--bg-warm-bg` | `bg-warm-bg` | Fundo mestre da aplicação (`#f5f2eb` creme areia) |
| **Card Principal** | `--bg-warm-card` | `bg-warm-card` | Fundo de Cards do Bento Grid, Toasts e Modais (`#ffffff`) |
| **Sub-contêiner** | `--bg-warm-inner` | `bg-warm-inner` | Bloco interno aninhado dentro de um card (`#faf8f5`) |
| **Fundo Hover** | `--bg-warm-hover` | `bg-warm-hover` | Estado hover de botões secundários e cards clicáveis |

### 2.2 Mapeamento de Bordas e Anéis de Foco
| Nome do Token | Variável CSS | Classe Tailwind | Propósito Exclusivo |
| :--- | :--- | :--- | :--- |
| **Borda Sutil** | `--border-warm-border` | `border-warm-border` | Contorno padrão 1px em cards, inputs e tabelas (`#e8e4dc`) |
| **Borda Hover/Ativa**| `--border-warm-borderDark`| `border-warm-borderDark`| Contorno em foco, hover de cards ou elemento ativo (`#d6cfc4`) |
| **Anel de Foco** | `--ring-warm-focus` | `ring-warm-focus` | Anel de acessibilidade para navegação via teclado |

### 2.3 Mapeamento de Hierarquia Tipográfica
| Nome do Token | Variável CSS | Classe Tailwind | Propósito Exclusivo |
| :--- | :--- | :--- | :--- |
| **Texto Principal** | `--text-warm-main` / `--text-warm-charcoal` | `text-warm-main` / `text-warm-charcoal` | Títulos H1/H2/H3, números primários e rótulos (`#111827`) |
| **Texto Secundário**| `--text-warm-secondary` | `text-warm-secondary` | Corpo de texto principal, descrições e parágrafos (`#4b5563`) |
| **Texto Muted** | `--text-warm-muted` | `text-warm-muted` | Legendas, timestamps, metadados e placeholders (`#645d52`) |
| **Texto Destaque** | `--text-warm-emerald` | `text-warm-emerald` | Ações principais e badges de conclusão (`#059669` / `#047857`) |

---

## 🥗 3. Camada 3: Tokens Semânticos Nutricionais & Toasts (Feedback System)

Para feedback visual de mensagens de toast e indicadores de macronutrientes da dieta:

```css
/* Token Semântico: Info / Gorduras (Teal) */
bg-nutri-info-bg       /* Fundo: #e6f2f2 */
text-nutri-info-text   /* Texto: #0f766e */
border-nutri-info-border /* Borda: rgba(15, 118, 110, 0.25) */

/* Token Semântico: Success / Metas Concluídas / Kcal (Emerald) */
bg-nutri-success-bg       /* Fundo: #e6f4ea */
text-nutri-success-text   /* Texto: #047857 */
border-nutri-success-border /* Borda: rgba(4, 120, 87, 0.25) */

/* Token Semântico: Warning / Carboidratos (Amber) */
bg-nutri-warning-bg       /* Fundo: #fef3c7 */
text-nutri-warning-text   /* Texto: #b45309 */
border-nutri-warning-border /* Borda: rgba(180, 83, 9, 0.25) */

/* Token Semântico: Error / Proteínas / Alertas Críticos (Rose) */
bg-nutri-error-bg       /* Fundo: #fce8e6 */
text-nutri-error-text   /* Texto: #be123c */
border-nutri-error-border /* Borda: rgba(190, 18, 60, 0.25) */

/* Token Semântico: Neutral / Status Geral */
bg-nutri-neutral-bg       /* Fundo: #faf8f5 */
text-nutri-neutral-text   /* Texto: #4b5563 */
border-nutri-neutral-border /* Borda: #e8e4dc */
```

---

## 📐 4. Camada 4: Tokens de Geometria, Espaçamento, Motion & Tipografia

### 4.1 Tokens de Arredondamento (Border Radius)
* `rounded-card` / `rounded-2xl`: **1.0rem (16px)** — Cards Bento Grid, Modais e Painéis.
* `rounded-control` / `rounded-xl`: **0.75rem (12px)** — Inputs, Botões, Sub-contêineres e Rows.
* `rounded-pill` / `rounded-full`: **9999px** — Badges estilo Cápsula, Avatares e Trilhas.

### 4.2 Tokens de Espaçamento Mapeados (8px Grid Scale)
* `space-3xs` / `p-3xs`: **0.125rem (2px)** — Micro bordas e deltas.
* `space-2xs` / `gap-2xs`: **0.25rem (4px)** — Gap entre ícone e texto minúsculo.
* `space-xs` / `gap-xs`: **0.5rem (8px)** — Padding interno de badges e botões de ícone.
* `space-sm` / `p-sm`: **0.75rem (12px)** — Padding de inputs e listas compactas.
* `space-md` / `p-md`: **1.0rem (16px)** — Padding de cards e gap do Bento Grid.
* `space-lg` / `p-lg`: **1.5rem (24px)** — Respiro entre seções de layout.
* `space-xl` / `p-xl`: **2.0rem (32px)** — Margem externa de contêineres mestre.
* `space-2xl` / `p-2xl`: **3.0rem (48px)** — Padding de tela inteira.

### 4.3 Tokens Tipográficos Mapeados
* **Família Display**: `font-display` (`"Plus Jakarta Sans", sans-serif`) — Títulos H1, H2, H3 e Branding.
* **Família Corpo**: `font-body` (`"Inter", sans-serif`) — Corpo de texto, formulários, descrições e botões.
* **Família Monospaced Tabular**: `font-mono` (`"Fira Code", monospace`) — Métricas de Kcal, ratios em `g/kg`, valores de macronutrientes e timestamps.

### 4.4 Tokens de Z-Index & Elevação Swiss Flat
* `z-base`: **0** (Canvas mestre `bg-warm-bg`).
* `z-card`: **10** (Cards do Bento Grid `bg-warm-card`).
* `z-subcontainer`: **20** (Sub-contêineres internos `bg-warm-inner`).
* `z-dropdown`: **30** (Popovers, Selects e Menus Dropdown).
* `z-toast`: **40** (NutriToasts flutuantes).
* `z-modal-backdrop`: **50** (Overlay Dimmed do Dialog).
* `z-modal-content`: **60** (Card do Dialog Modal).

### 4.5 Regra Inviolável Swiss Flat (Sem Exceções)
```css
/* PROIBIDO USO DE BOX-SHADOW E GRADIENTES HARDCODED */
* {
  box-shadow: none !important;
  background-image: none !important;
}
```

---

## 🛠️ 5. Configuração Oficial do Tailwind CSS (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf8f5',
          100: '#f5f2eb',
          200: '#e8e4dc',
          300: '#d6cfc4',
          400: '#b8af9e',
        },
        charcoal: {
          800: '#1f2937',
          900: '#111827',
          950: '#0b0f17',
        },
        emerald: {
          50: '#e6f4ea',
          600: '#059669',
          700: '#047857',
        },
        warm: {
          bg: '#f5f2eb',
          card: '#ffffff',
          inner: '#faf8f5',
          hover: '#f0ebe1',
          border: '#e8e4dc',
          borderDark: '#d6cfc4',
          main: '#111827',
          charcoal: '#111827',
          secondary: '#4b5563',
          muted: '#645d52',
          emerald: '#059669',
          emeraldBg: '#e6f4ea',
          rose: '#e11d48',
          roseBg: '#fce8e6',
          amber: '#d97706',
          amberBg: '#fef3c7',
          teal: '#0d9488',
          tealBg: '#e6f2f2',
        },
        nutri: {
          info: { text: '#0f766e', bg: '#e6f2f2', border: 'rgba(15, 118, 110, 0.25)' },
          success: { text: '#047857', bg: '#e6f4ea', border: 'rgba(4, 120, 87, 0.25)' },
          warning: { text: '#b45309', bg: '#fef3c7', border: 'rgba(180, 83, 9, 0.25)' },
          error: { text: '#be123c', bg: '#fce8e6', border: 'rgba(190, 18, 60, 0.25)' },
          neutral: { text: '#4b5563', bg: '#faf8f5', border: '#e8e4dc' },
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        card: '1rem',       // 16px (rounded-card)
        control: '0.75rem', // 12px (rounded-control)
        pill: '9999px',     // Circular (rounded-pill)
      },
      spacing: {
        '3xs': '0.125rem', // 2px
        '2xs': '0.25rem',  // 4px
        xs: '0.5rem',      // 8px
        sm: '0.75rem',     // 12px
        md: '1.0rem',      // 16px
        lg: '1.5rem',      // 24px
        xl: '2.0rem',      // 32px
        '2xl': '3.0rem',   // 48px
      },
      boxShadow: {
        none: 'none !important',
      },
      backgroundImage: {
        none: 'none !important',
      },
    },
  },
  plugins: [],
};
