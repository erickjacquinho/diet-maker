/**
 * NutriDiet Design System - Single Source of Truth Tokens (TypeScript)
 * Swiss Warm Minimalist Flat Architecture
 */

export const primitiveTokens = {
  colors: {
    stone: {
      50: '#faf8f5',
      100: '#f5f2eb',
      200: '#e8e4dc',
      300: '#d6cfc4',
      500: '#8c8275',
      700: '#4b5563',
      900: '#111827',
    },
    emerald: {
      50: '#e6f4ea',
      500: '#10b981',
      600: '#059669',
    },
    rose: {
      50: '#fce8e6',
      500: '#f43f5e',
      600: '#e11d48',
    },
    amber: {
      50: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    teal: {
      50: '#e6f2f2',
      500: '#14b8a6',
      600: '#0d9488',
    },
    terracotta: {
      500: '#d97760',
      600: '#c86650',
    },
    white: '#ffffff',
    transparent: 'transparent',
  },
  typography: {
    fonts: {
      display: "'Plus Jakarta Sans', sans-serif",
      body: "'Inter', sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    sizes: {
      micro: '10px',
      caption: '11px',
      body: '12px',
      titleSm: '14px',
      titleMd: '16px',
      titleLg: '18px',
      pageTitle: '24px',
      hero: '30px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    sidebarWidth: '240px',
  },
  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  zIndices: {
    base: 0,
    card: 1,
    stickySidebar: 10,
    dropdown: 20,
    modalBackdrop: 40,
    modalContent: 50,
    toast: 60,
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
} as const;

export const semanticTokens = {
  surfaces: {
    app: primitiveTokens.colors.stone[100],        // #f5f2eb
    card: primitiveTokens.colors.white,             // #ffffff
    inner: primitiveTokens.colors.stone[50],        // #faf8f5
  },
  text: {
    primary: primitiveTokens.colors.stone[900],     // #111827
    secondary: primitiveTokens.colors.stone[700],   // #4b5563
    muted: primitiveTokens.colors.stone[500],       // #8c8275
    onPrimary: primitiveTokens.colors.white,
  },
  borders: {
    clean: primitiveTokens.colors.stone[200],      // #e8e4dc
    focus: primitiveTokens.colors.stone[300],      // #d6cfc4
    emerald: primitiveTokens.colors.emerald[600],  // #059669
  },
  macros: {
    calories: {
      main: primitiveTokens.colors.emerald[600],
      bg: primitiveTokens.colors.emerald[50],
    },
    protein: {
      main: primitiveTokens.colors.rose[600],
      bg: primitiveTokens.colors.rose[50],
    },
    carbs: {
      main: primitiveTokens.colors.amber[600],
      bg: primitiveTokens.colors.amber[50],
    },
    fats: {
      main: primitiveTokens.colors.teal[600],
      bg: primitiveTokens.colors.teal[50],
    },
    terracotta: {
      main: primitiveTokens.colors.terracotta[500],
      bg: '#fdf2f0',
    },
  },
} as const;

export const componentTokens = {
  button: {
    radii: primitiveTokens.radii.xl,
    font: primitiveTokens.typography.fonts.body,
    fontWeight: primitiveTokens.typography.weights.bold,
    transition: primitiveTokens.transitions.fast,
    sizes: {
      sm: { px: '10px', py: '4px', font: '11px' },
      md: { px: '14px', py: '8px', font: '12px' },
      lg: { px: '16px', py: '10px', font: '14px' },
    },
  },
  badge: {
    radii: primitiveTokens.radii.full,
    font: primitiveTokens.typography.fonts.body,
    fontWeight: primitiveTokens.typography.weights.bold,
  },
  input: {
    bg: semanticTokens.surfaces.inner,
    border: semanticTokens.borders.clean,
    borderFocus: semanticTokens.borders.emerald,
    placeholder: semanticTokens.text.muted,
    radii: primitiveTokens.radii.xl,
  },
  sidebar: {
    width: primitiveTokens.spacing.sidebarWidth,
    bg: semanticTokens.surfaces.card,
    borderRight: semanticTokens.borders.clean,
    zIndex: primitiveTokens.zIndices.stickySidebar,
  },
} as const;

export const designTokens = {
  primitive: primitiveTokens,
  semantic: semanticTokens,
  component: componentTokens,
} as const;

export type DesignTokens = typeof designTokens;
