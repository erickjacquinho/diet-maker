# Especificação de Componentes Atômicos - NutriDiet Design System

> 🧱 **Átomos**: Blocos primitivos reutilizáveis sem dependência de regras de negócio.

---

## 1. `Button` (Botão Primitivo)

### 1.1 Variantes & Contratos de Estilo

| Variante | Classe Tailwind Base | Estado Hover | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **`primary`** | `bg-warm-emerald text-white font-bold rounded-xl` | `hover:opacity-90` | Ações principais ("+ Nova Refeição") |
| **`secondary`**| `bg-warm-card border border-warm-border text-warm-charcoal font-bold rounded-xl` | `hover:bg-warm-inner` | Ações secundárias ("% Escalar", "PDF") |
| **`terracotta`**| `bg-warm-terracotta text-white font-bold rounded-xl` | `hover:opacity-90` | Ações secundárias com destaque visual |
| **`ghost`** | `text-warm-secondary hover:text-warm-charcoal hover:bg-warm-inner rounded-xl` | `hover:bg-warm-inner` | Ações neutras de navegação |
| **`danger`** | `text-warm-muted hover:text-warm-rose rounded-xl` | `hover:text-warm-rose` | Exclusões e remoções ("Excluir") |

### 1.2 Snippet de Referência em React (TSX)

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = "font-bold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-emerald disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-warm-emerald text-white hover:opacity-90",
    secondary: "bg-warm-card border border-warm-border hover:bg-warm-inner text-warm-charcoal",
    terracotta: "bg-warm-terracotta text-white hover:opacity-90",
    ghost: "text-warm-secondary hover:text-warm-charcoal hover:bg-warm-inner",
    danger: "text-warm-muted hover:text-warm-rose"
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3.5 py-2 text-xs",
    lg: "px-4 py-2.5 text-sm"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
```

---

## 2. `Badge` / `Pill` (Pílula de Status)

### 2.1 Variantes Semânticas
- **`emerald`**: `bg-warm-emeraldBg text-warm-emerald border border-warm-emerald/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold`
- **`rose`**: `bg-warm-roseBg text-warm-rose border border-warm-rose/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold`
- **`amber`**: `bg-warm-amberBg text-warm-amber border border-warm-amber/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold`
- **`teal`**: `bg-warm-tealBg text-warm-teal border border-warm-teal/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold`
- **`neutral`**: `bg-warm-inner text-warm-charcoal border border-warm-border rounded-full px-2.5 py-0.5 text-xs font-bold`

---

## 3. `Input` & `SearchInput`

### 3.1 Especificação de Estilos
- Fundo: `bg-warm-inner` (`#faf8f5`).
- Borda Padrão: `border border-warm-border` (`#e8e4dc`).
- Borda em Foco: `focus:border-warm-emerald focus:ring-0`.
- Arredondamento: `rounded-xl`.
- Placeholder: `placeholder-warm-muted` (`#8c8275`).

```tsx
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full bg-warm-inner border border-warm-border rounded-xl px-3.5 py-2 text-xs text-warm-charcoal placeholder-warm-muted focus:outline-none focus:border-warm-emerald transition-all ${className}`}
      {...props}
    />
  )
);
```

---

## 4. `ProgressBar` (Barra de Progresso Plana)

```tsx
interface ProgressBarProps {
  value: number; // 0 a 100
  colorVariant?: 'emerald' | 'rose' | 'amber' | 'teal';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, colorVariant = 'emerald' }) => {
  const colors = {
    emerald: 'bg-warm-emerald',
    rose: 'bg-warm-rose',
    amber: 'bg-warm-amber',
    teal: 'bg-warm-teal'
  };

  return (
    <div className="w-full bg-warm-border h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`${colors[colorVariant]} h-full transition-all duration-300`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
};
```

---

## 5. `IconButton` (Botão de Ícone Acessível)

```tsx
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Obrigatório para a11y
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, className = '', ...props }) => (
  <button
    className={`p-1.5 text-warm-muted hover:text-warm-rose rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${className}`}
    {...props}
  >
    {icon}
  </button>
);
```
