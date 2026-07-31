# 02-tokens / 01-colors — Sistema de Cores em 3 Camadas

> **NutriDiet Design System — Arquitetura de Cores (100% Tokenizada)**
> **DIRETRIZ ABSOLUTA**: Nunca utilizar valores hexadecimais brutos nos componentes React. Sempre consumir via tokens semânticos Tailwind CSS ou variáveis CSS.

---

## 🎨 1. Camada 1: Tokens Primitivos (Raw Hex Palette)

Os primitivos definem as tonalidades brutas do sistema.

### 1.1 Escala Sand (Areia / Creme Swiss Warm)
- `sand-50`: `#faf8f5` (Off-white sutil)
- `sand-100`: `#f5f2eb` (Fundo Canvas Mestre)
- `sand-200`: `#e8e4dc` (Borda Limpa 1px)
- `sand-300`: `#d6cfc4` (Borda Hover/Foco)
- `sand-400`: `#b8af9e` (Linhas Divisórias Secundárias)

### 1.2 Escala Charcoal & Slate (Textos & Escuro)
- `charcoal-950`: `#0b0f17` (Fundo Botão Dark Ativo)
- `charcoal-900`: `#111827` (Texto Mestre Mínimo & Botão Primário)
- `charcoal-800`: `#1f2937` (Hover Botão Dark)
- `slate-600`: `#4b5563` (Texto Secundário — Contrast Ratio > 7:1)
- `slate-500`: `#645d52` (Texto Muted — Contrast Ratio > 5:1)
- `slate-300`: `#9ca3af` (Estado Desabilitado)

### 1.3 Esmeralda (Marca & Ações de Sucesso)
- `emerald-700`: `#047857` (Esmeralda Principal / CTA Destaque)
- `emerald-600`: `#059669` (Hover Esmeralda)
- `emerald-50`: `#e6f4ea` (Fundo Pastel Esmeralda)

### 1.4 Primitivos Nutricionais & Status
- `rose-700`: `#be123c` | `rose-50`: `#fce8e6` (Proteínas / Alerta Erro)
- `amber-700`: `#b45309` | `amber-50`: `#fef3c7` (Carboidratos / Aviso Moderado)
- `teal-700`: `#0f766e` | `teal-50`: `#e6f2f2` (Gorduras / Acento Secundário)
- `blue-600`: `#2563eb` | `blue-50`: `#eff6ff` (Azul Cobalto Auxiliar / Info)

---

## 🏛️ 2. Camada 2: Tokens Semânticos (System Intent)

Esta é a camada **obrigatória** utilizada no desenvolvimento de interfaces no Tailwind CSS.

### 2.1 Superfícies & Layout
| Classe Tailwind | Variável CSS | Valor Hex | Aplicação |
| :--- | :--- | :--- | :--- |
| `bg-warm-bg` | `--bg-warm-bg` | `#f5f2eb` | Fundo principal da aplicação (Canvas Creme) |
| `bg-warm-card` | `--bg-warm-card` | `#ffffff` | Cartões, Modais e Bento Grids |
| `bg-warm-inner` | `--bg-warm-inner` | `#faf8f5` | Containers internos e linhas de tabela hover |
| `bg-warm-hover` | `--bg-warm-hover` | `#f0ebe1` | Hover de elementos interativos |
| `border-warm-border` | `--border-warm-border` | `#e8e4dc` | Linha de contorno sólido 1px |
| `border-warm-borderDark` | `--border-warm-borderDark` | `#d6cfc4` | Contorno em estado de hover ou foco |
| `ring-warm-focus` | `--ring-warm-focus` | `#111827` | Anel de foco visível, 2px com offset de 2px |

### 2.2 Tipografia & Leitura (WCAG AAA)
| Classe Tailwind | Variável CSS | Valor Hex | Aplicação |
| :--- | :--- | :--- | :--- |
| `text-warm-main` | `--text-warm-main` | `#111827` | Títulos, cabeçalhos e texto principal |
| `text-warm-secondary` | `--text-warm-secondary` | `#4b5563` | Subtítulos, rótulos de campos e descrições |
| `text-warm-muted` | `--text-warm-muted` | `#645d52` | Unidades de medida, dicas e legendas |

### 2.3 Macronutrientes Nutricionais
| Macronutriente | Token Texto/Ícone | Token Fundo Pastel | Token Borda |
| :--- | :--- | :--- | :--- |
| **Proteínas** | `text-nutri-protein` (`#be123c`) | `bg-nutri-protein-bg` (`#fce8e6`) | `border-nutri-protein-border` (`#fecdd3`) |
| **Carboidratos** | `text-nutri-carbs` (`#b45309`) | `bg-nutri-carbs-bg` (`#fef3c7`) | `border-nutri-carbs-border` (`#fde68a`) |
| **Gorduras** | `text-nutri-fats` (`#0f766e`) | `bg-nutri-fats-bg` (`#e6f2f2`) | `border-nutri-fats-border` (`#99f6e4`) |
| **Fibras / Metas** | `text-nutri-fibers` (`#047857`) | `bg-nutri-fibers-bg` (`#e6f4ea`) | `border-nutri-fibers-border` (`#a7f3d0`) |

---

## 🧩 3. Camada 3: Component Tokens

Mapeamento específico para estados de botões e controles:
- **Botão Primário Dark**: `bg-charcoal-900 text-white hover:bg-charcoal-800 active:scale-[0.98]`
- **Botão Esmeralda CTA**: `bg-emerald-700 text-white hover:bg-emerald-600 active:scale-[0.98]`
- **Botão Secundário Card**: `bg-warm-card text-warm-main border border-warm-border hover:bg-warm-inner`
- **Pill Badge Genérico**: `bg-warm-inner text-warm-secondary border border-warm-border`
- **Input Focado**: `border-warm-borderDark ring-2 ring-warm-focus ring-offset-2`
- **Card Estático**: `bg-warm-card border border-warm-border` sem hover e sem sombra
- **Card Interativo**: `bg-warm-card border border-warm-border hover:bg-warm-inner hover:border-warm-borderDark`
- **Toast**: `bg-warm-card border` com badge sólido da variante, nunca com gradiente

### Regras de consumo

1. Componentes React consomem tokens semânticos ou de componente; nunca hex bruto.
2. Tokens primitivos são utilizados somente para declarar os níveis semântico e de componente.
3. Estados não podem depender apenas de cor: incluir texto, ícone ou mudança de borda.
4. `ring-warm-focus` é obrigatório em todo elemento interativo customizado.

### Compatibilidade legada

`terracotta` pode existir temporariamente no código durante migração, mas não pertence à paleta canônica aprovada em `refs/UI/`. Novos componentes não podem utilizá-lo; ações destrutivas usam `nutri-error` e CTAs de destaque usam emerald.
