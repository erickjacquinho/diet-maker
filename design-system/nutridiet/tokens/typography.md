# Tipografia & Hierarquia - NutriDiet Design System

> 🔤 Especificação tipográfica baseada no pareamento de alta legibilidade: **Plus Jakarta Sans** (Títulos & Métricas) e **Inter** (Textos de Corpo & Dados).

---

## 1. Famílias Tipográficas

### 1.1 Font Display & Títulos: `Plus Jakarta Sans`
- **Uso**: Títulos de módulos, estatísticas de macronutrientes, marcas e cabeçalhos.
- **Característica**: Moderna, geométrica, com traços marcantes em pesos altos (`font-black 900` / `font-extrabold 800`).

### 1.2 Font Body & Interface: `Inter`
- **Uso**: Nomes de alimentos, campos de texto, tabelas, rótulos e botões.
- **Característica**: Neutra, otimizada para telas pequenas e dados numéricos.

---

## 2. Escala de Tipos (Type Scale)

| Nível / Papel | Classe Tailwind | Tamanho / Line Height | Peso (Weight) | Cor Recomendada | Exemplo de Aplicação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Numeric** | `text-3xl` | 30px / 36px | `font-black` (900) | `text-warm-charcoal` | Valor principal de Kcal (`2.450 / 2.400 kcal`) |
| **Page Title** | `text-2xl` | 24px / 32px | `font-black` (900) | `text-warm-charcoal` | Título "Plano Alimentar Ativo" |
| **Section Title** | `text-lg` | 18px / 28px | `font-black` (900) | `text-warm-charcoal` | Nome do paciente "Carlos Eduardo Silva" |
| **Card Header** | `text-base` | 16px / 24px | `font-black` (900) | `text-warm-charcoal` | Título da Refeição ("Café da Manhã") |
| **Body Bold** | `text-xs` | 12px / 16px | `font-bold` (700) | `text-warm-charcoal` | Nome do Alimento ("Ovo de galinha cozido") |
| **Body Regular** | `text-xs` | 12px / 16px | `font-normal` (400) | `text-warm-secondary` | Subtítulo "Elaboração visual com metas manuais" |
| **Caption / Muted**| `text-[11px]`| 11px / 14px | `font-medium` (500) | `text-warm-muted` | Detalhes de alimento ("219 kcal • P: 20g • C: 0.9g") |
| **Micro Badge** | `text-[10px]`| 10px / 12px | `font-bold` (700) | `text-warm-emerald` | Tag superior ("PRO LOCAL", "Na meta ✓") |

---

## 3. Diretrizes de Uso no Código (React & Tailwind)

```tsx
// Exemplo 1: Número Grande de Macronutriente
<div className="text-3xl font-black text-warm-charcoal tracking-tight">
  2.450 <span className="text-xs font-normal text-warm-muted">/ 2.400 kcal</span>
</div>

// Exemplo 2: Item de Alimento em Refeição
<div className="text-xs font-bold text-warm-charcoal">
  Ovo de galinha inteiro cozido
</div>
<div className="text-[11px] text-warm-secondary mt-0.5">
  219 kcal • <span className="text-warm-rose font-bold">P: 20g</span> • C: 0.9g
</div>
```
