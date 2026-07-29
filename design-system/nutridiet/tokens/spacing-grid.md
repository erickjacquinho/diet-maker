# Geometria, Espaçamento & Z-Index - NutriDiet Design System

> 📐 **Diretrizes de Layout, Escala de Arredondamento e Z-Index**

---

## 1. Regras de Arredondamento (Border Radius)

| Categoria de Componente | Token / Classe | Raio em Pixel | Exemplo de Aplicação |
| :--- | :--- | :--- | :--- |
| **Cards Principais & Modais** | `rounded-2xl` | `16px` a `20px` | Cards de Macronutrientes, MealCards, Dialogs |
| **Inputs, Botões & Caixas** | `rounded-xl` | `12px` | Botões de Ação, Search Input, Caixas de Gramagem |
| **Sub-elementos & Ícones** | `rounded-lg` | `8px` | Badges menores, containers de foto de perfil |
| **Badges & Pílulas de Status** | `rounded-full` | `9999px` | Tags de status ("Na meta ✓", "-12g restante", "82.5 kg") |

---

## 2. Escala de Espaçamento Interno e Padding

- **Espaçamento de Cards**: Utilizar `p-6` (24px) como padrão para manter o respiro visual e sensação minimalista.
- **Espaçamento de Itens**: Utilizar `p-3` (12px) a `p-4` (16px) para linhas de alimentos e métricas.
- **Gap do Grid**: Utilizar `gap-4` (16px) ou `gap-6` (24px) entre cartões.

---

## 3. Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-card: 1;
  --z-sticky-sidebar: 10;
  --z-dropdown: 20;
  --z-modal-backdrop: 40;
  --z-modal-content: 50;
  --z-toast: 60;
}
```

```tailwind
// Utilização via Tailwind
aside { @apply z-10; } /* Sidebar sticky */
.modal-backdrop { @apply z-40; }
.modal-dialog { @apply z-50; }
```
