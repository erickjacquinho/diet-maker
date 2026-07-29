/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        warm: {
          bg: '#f5f2eb',         /* Creme / Areia Suave de Fundo */
          card: '#ffffff',       /* Branco Puro Nítido */
          inner: '#faf8f5',     /* Off-White Sutil para Itens */
          border: '#e8e4dc',     /* Linha Bege Sólida 1px */
          borderDark: '#d6cfc4', /* Contorno de Foco */
          charcoal: '#111827',   /* Carvão Escuro para Títulos/Números */
          secondary: '#4b5563',  /* Cinza Médio */
          muted: '#8c8275',      /* Bege/Cinza Neutro */
          emerald: '#059669',    /* Esmeralda Sólido */
          emeraldBg: '#e6f4ea',  /* Esmeralda Pastel */
          rose: '#e11d48',       /* Carmim / Proteína */
          roseBg: '#fce8e6',     /* Carmim Pastel */
          amber: '#d97706',      /* Âmbar / Carboidrato */
          amberBg: '#fef3c7',    /* Âmbar Pastel */
          teal: '#0d9488',       /* Teal / Gordura */
          tealBg: '#e6f2f2',     /* Teal Pastel */
          terracotta: '#d97760', /* Coral Terracota */
          terracottaBg: '#fdf2f0'/* Coral Terracota Pastel */
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        '2xl': '1rem',         /* 16px */
        'xl': '0.75rem',       /* 12px */
        'lg': '0.5rem',        /* 8px */
        'md': '0.375rem',      /* 6px */
        'sm': '0.25rem',       /* 4px */
      },
      spacing: {
        'sidebar': '240px',
      },
      zIndex: {
        'card': '1',
        'sticky-sidebar': '10',
        'dropdown': '20',
        'modal-backdrop': '40',
        'modal-content': '50',
        'toast': '60',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
