# Regra Swiss Flat & Transições - NutriDiet Design System

> 🏛️ **Regra de Ouro**: O NutriDiet segue estritamente a filosofia *Swiss Warm Minimalist Flat Design*. Zero sombras 3D, zero gradientes decorativos e contornos sólidos e nítidos de 1px.

---

## 1. Regra Estrita Flat (Swiss Flat Rule)

### 1.1 Proibição de Sombras e Gradientes
```css
/* Aplicado globalmente em todas as páginas e componentes */
* {
  box-shadow: none !important;
  background-image: none !important;
}
```

### 1.2 Subvenção Visual via Contornos
Toda hierarquia e profundidade visual deve ser alcançada através de:
- **Linhas de Contorno Sólidas**: `border border-warm-border` (`1px solid #e8e4dc`).
- **Contraste de Superfícies**: Fundo da app em `#f5f2eb` (Areia) com Cards em `#ffffff` (Branco puro) e containers internos em `#faf8f5` (Off-white sutil).

---

## 2. Regras de Transições & Feedback de Interação

- **Duração Padrão**: Interações devem durar entre **150ms** e **200ms**.
- **Easings**: Utilizar `transition-all ease-in-out` ou `transition-colors`.

```html
<!-- Exemplo de Botão Flat com Feedback de Hover Suave -->
<button class="px-4 py-2 bg-warm-emerald hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all duration-150">
  + Nova Refeição
</button>

<!-- Exemplo de Item Interativo com Mudança de Borda no Hover -->
<div class="bg-warm-card border border-warm-border hover:border-warm-borderDark rounded-xl p-3 transition-all duration-150">
  ...
</div>
```

---

## 3. Respeito ao Prefer Reduced Motion (Acessibilidade)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
