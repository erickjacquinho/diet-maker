# 02-tokens / 05-tailwind-config — Mapeamento Oficial do Tailwind CSS

> Este é o espelho documental de `tailwind.config.js` e `src/design-system/tokens.ts`. Classes usadas nos componentes devem existir neste mapa.

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#faf8f5",
          100: "#f5f2eb",
          200: "#e8e4dc",
          300: "#d6cfc4",
          400: "#b8af9e",
        },
        charcoal: {
          800: "#1f2937",
          900: "#111827",
          950: "#0b0f17",
        },
        emerald: { 50: "#e6f4ea", 600: "#059669", 700: "#047857" },
        warm: {
          bg: "#f5f2eb",
          card: "#ffffff",
          inner: "#faf8f5",
          hover: "#f0ebe1",
          border: "#e8e4dc",
          borderDark: "#d6cfc4",
          main: "#111827",
          secondary: "#4b5563",
          muted: "#645d52",
          focus: "#111827",
        },
        nutri: {
          info: { text: "#0f766e", bg: "#e6f2f2", border: "rgba(15,118,110,.25)" },
          success: { text: "#047857", bg: "#e6f4ea", border: "rgba(4,120,87,.25)" },
          warning: { text: "#b45309", bg: "#fef3c7", border: "rgba(180,83,9,.25)" },
          error: { text: "#be123c", bg: "#fce8e6", border: "rgba(190,18,60,.25)" },
          neutral: { text: "#4b5563", bg: "#faf8f5", border: "#e8e4dc" },
          protein: { text: "#be123c", bg: "#fce8e6", border: "#fecdd3" },
          carbs: { text: "#b45309", bg: "#fef3c7", border: "#fde68a" },
          fats: { text: "#0f766e", bg: "#e6f2f2", border: "#99f6e4" },
          fibers: { text: "#047857", bg: "#e6f4ea", border: "#a7f3d0" },
        },
      },
      fontFamily: {
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-fira-code)", "Fira Code", "monospace"],
      },
      borderRadius: {
        card: "1rem",
        control: ".75rem",
        pill: "9999px",
      },
      spacing: {
        "3xs": ".125rem",
        "2xs": ".25rem",
        xs: ".5rem",
        sm: ".75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
      },
      zIndex: {
        base: "0",
        card: "10",
        subcontainer: "20",
        dropdown: "30",
        toast: "40",
        "modal-backdrop": "50",
        "modal-content": "60",
      },
      boxShadow: { none: "none" },
      backgroundImage: { none: "none" },
    },
  },
  plugins: [],
};

export default config;
```

## Convenções obrigatórias

- Foco: `focus-visible:ring-2 focus-visible:ring-warm-focus focus-visible:ring-offset-2`.
- Gradientes: nenhuma classe `bg-gradient-*`; `background-image` permanece `none`.
- Elevação: borda + contraste de superfície; nenhuma classe `shadow-*`.
- Tokens customizados devem existir também em `src/design-system/tokens.ts`.

## Movimento reduzido

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
