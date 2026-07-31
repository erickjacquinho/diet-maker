# 02-tokens / 04-motion — Animações, Transições & Micro-interações Flat

> **NutriDiet Design System — Transições Rápidas, Feedback Tátil e Regras Motion**

---

## ⚡ 1. Tempos de Animação & Curva Easing

Todas as interações na aplicação devem responder imediatamente. O orçamento de processamento e o tempo de animação são métricas diferentes:

- **Resposta funcional**: atualização de estado e cálculo visual em menos de 50ms.
- **Transição perceptiva**: 100–200ms para comunicar a mudança sem parecer abrupta.

- **Tempo Padrão (`duration-150`)**: `150ms` para hovers em botões, alteração de bordas e background de pílulas.
- **Tempo Rápido (`duration-100`)**: `100ms` para feedback de clique (`active:scale-[0.98]`).
- **Curva Easing (`ease-in-out`)**: `cubic-bezier(0.4, 0, 0.2, 1)` para movimentos fluidos sem desaceleração excessiva.

---

## 👆 2. Padrões de Micro-interações por Componente

### 2.1 Botões & Pílulas Clicáveis
```css
/* Efeito de Clique Tátil Flat (Micro Scale Down) */
.nutri-button-interact {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.nutri-button-interact:hover {
  border-color: var(--color-border-focus);
}
.nutri-button-interact:active {
  transform: scale(0.98);
}
```

### 2.2 Checks & Swaps de Hábitos (Checkbox Animated)
- **Ao Marcar**: O checkbox transita a cor de fundo de `bg-transparent` para `bg-emerald-700` com `scale(1)` e surge o ícone Lucide `Check` em `100ms`.
- **Badge Contador**: A contagem numérica (`Saúde (5)`) atualiza sem salto visual usando `transition-all duration-150`.

### 2.3 Notificações NutriToast (Slide & Fade)
- **Entrada**: `animate-in fade-in slide-in-from-top-2 duration-200`.
- **Saída**: `animate-out fade-out slide-out-to-top-2 duration-150`.
- **Acessibilidade**: `role="status"` para sucesso/info, `role="alert"` para warning/error e anúncio não duplicado via live region.

### 2.4 Loading e feedback assíncrono

- Toda ação segue `idle → loading → success|error`.
- Durante loading, preservar a largura do rótulo para evitar layout shift.
- Botões usam `aria-busy="true"` e mantêm nome acessível.
- Skeletons reservam a geometria final do conteúdo.

---

## ⛔ 3. Regras Proibidoras de Motion

1. **Sem Efeitos de Parallax ou 3D Rotations**: Manter a fidelidade ao Swiss Flat.
2. **Sem Bounce Exagerado em Modais**: Modais sobem com `fade-in zoom-in-95` limpo.
3. **Respeito a `prefers-reduced-motion`**:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

4. **Sem animação decorativa contínua**: histogramas e sparklines animam apenas quando a mudança ajuda a compreender novos dados.
5. **Sem animação de layout custosa**: priorizar `transform` e `opacity`; evitar animar `width`, `height`, `top` ou `left`.
