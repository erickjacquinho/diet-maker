# Tokens Reference — Referência Canônica de Valores

> **Status:** Fonte canônica executável de tabelas de tokens do NutriDiet Design System.

## 1. Sistema de Cores

### 1.1 Neutros Quentes (Superfície e Estrutura)
- `ref.color.warm.0`: `#FFFFFF`
- `ref.color.warm.15`: `#FCFAF7` (Canvas)
- `ref.color.warm.25`: `#F8F6F2` (Surface subtle)
- `ref.color.warm.50`: `#F3F0EA`
- `ref.color.warm.100`: `#ECE8E0` (Surface soft)
- `ref.color.warm.150`: `#E3DED5` (Border divider)
- `ref.color.warm.200`: `#D6D0C5` (Border subtle)
- `ref.color.warm.300`: `#B8B1A5` (Border hover / Border control essential)
- `ref.color.warm.500`: `#948D81` (Disabled)
- `ref.color.warm.600`: `#7A7369`
- `ref.color.warm.700`: `#615B53` (Text muted)
- `ref.color.warm.800`: `#4B463F` (Text secondary)
- `ref.color.warm.950`: `#201C18` (Text primary)

### 1.2 Azul Primário (Ação e Foco)
- `ref.color.blue.50`: `#E9EDFF` (`primary-soft`)
- `ref.color.blue.100`: `#C8D2FF` (`primary-border`)
- `ref.color.blue.500`: `#4A64D8` (`primary-focus`)
- `ref.color.blue.700`: `#2746B3` (`primary`)
- `ref.color.blue.800`: `#203A96` (`primary-hover`)
- `ref.color.blue.900`: `#192F7A` (`primary-pressed`)

### 1.3 Macronutrientes (Domínio Nutricional)
- **Proteínas:** `macro-protein` `#B8325A` | Soft `#FBEAF0` | Border `#E8BDC9`
- **Carboidratos:** `macro-carbohydrate` `#A55B00` | Soft `#FFF1D6` | Border `#E7C997`
- **Gorduras:** `macro-fat` `#0F766E` | Soft `#E6F4F1` | Border `#B6DAD5`

### 1.4 Feedback Semântico
- **Informação:** `info` `#3157A4` | Soft `#EAF0FB` | Border `#C7D5ED`
- **Sucesso:** `success` `#237A4B` | Soft `#E8F5ED` | Border `#B9DCC8`
- **Alerta:** `warning` `#8A5D00` | Soft `#FFF3D6` | Border `#E6D19B`
- **Erro:** `error` `#B42318` | Soft `#FDECEA` | Border `#E6B8B2`

---

## 2. Sistema Tipográfico

### 2.1 Família e Pesos
- **Família:** `Plus Jakarta Sans`, sans-serif
- **Pesos Homologados:** `400` (Regular), `500` (Medium), `600` (Semibold), `700` (Bold).

### 2.2 Escala Tipográfica
| Escala | Tamanho | Line-Height | Tracking | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `page-title` | 28px | 36px | -0.01em (tight) | H1 da página |
| `section-title` | 20px | 28px | -0.01em (tight) | H2 / Seções |
| `card-title` | 14px | 20px | 0 (normal) | Título de card |
| `body-large` | 16px | 24px | 0 (normal) | Leitura destacada |
| `body` | 14px | 22px | 0 (normal) | Texto padrão de interface |
| `body-small` | 13px | 20px | 0 (normal) | Listas compactas |
| `caption` | 12px | 18px | 0 (normal) | Legendas |
| `legal` | 11px | 16px | 0.04em | Metadados |

---

## 3. Geometria e Layout Desktop

### 3.1 Grade de Espaçamento Base 4px
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px (Padding padrão)
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px

### 3.2 Raios de Borda (Radius)
- `radius-xs`: 2px
- `radius-sm`: 4px (Controles: botões, inputs, select)
- `radius-md`: 6px (Dropdowns, popovers)
- `radius-lg`: 8px (Superfícies: cards, modais)
- `radius-full`: 9999px (Avatares, pills)

### 3.3 Bordas
- Espessura fixa: **1px** (`border-1`).
- Cor padrão: `border-subtle` (`#D6D0C5`) / `border-border`.

---

## 4. Ícones, Animação e Z-Index

### 4.1 Ícones (Lucide React)
- Traço: `1.75px` ou `2px`.
- Tamanhos: `16px` (h-4 w-4), `20px` (h-5 w-5), `24px` (h-6 w-6).

### 4.2 Camadas de Z-Index
- `z-base`: 0
- `z-sticky`: 10
- `z-dropdown`: 20
- `z-overlay`: 30
- `z-modal`: 40
- `z-toast`: 50

### 4.3 Movimento e Transição
- Duração: `150ms` a `200ms` (interações normais), máx `250ms` (modais).
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 5. Matriz de Estados e Acessibilidade

- Estados obrigatórios: `default`, `hover`, `pressed`, `focus-visible`, `selected`, `disabled`, `loading`, `error`, `empty`, `read-only`.
- Receita de anel de foco: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- Acessibilidade: WCAG 2.2 AA (contraste mínimo 4.5:1 para texto e 3:1 para UI).
