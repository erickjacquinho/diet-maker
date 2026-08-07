# Rule: Ícones, Movimento, Elevação e Camadas (Z-Index)

> **Escopo:** Pacote de ícones, micro-animações, sombras e ordem de empilhamento (z-index).

## 1. Iconografia Canônica

- O projeto utiliza **exclusivamente a biblioteca `lucide-react`**.
- ❌ **PROIBIDO:** Usar `react-icons`, `@heroicons`, FontAwesome ou SVGs inline ad-hoc.
- ❌ **PROIBIDO:** Emojis em botões, controles ou componentes do sistema de design.
- **Espessura de Traço:** Traço padrão de `1.75px` ou `2px` para harmonia com a tipografia.
- **Tamanho dos Ícones:**
  - Pequeno (`16px` / `h-4 w-4`): Botões compactos, inline com texto de formulário.
  - Médio (`20px` / `h-5 w-5`): Botões padrão, itens de navegação, cabeçalhos de card.
  - Grande (`24px` / `h-6 w-6`): Destaques de métricas, modais, estados vazios.

## 2. Escala de Z-Index (Camadas de Empilhamento)

Para evitar conflitos de sobreposição e valores mágicos, utilize estritamente a escala homologada:

- `z-base` (0) : Fluxo normal de documentos, cards, conteúdo.
- `z-subtle` (1) : Elementos ligeiramente elevados (ex: cabeçalhos de tabela fixos).
- `z-sticky` (10) : Barra superior fixa, barras de ferramentas presas na rolagem.
- `z-dropdown` (20) : Menus suspensos, auto-complete, comboboxes, select options.
- `z-overlay` (30) : Máscara de fundo (backdrop) para modais e gavetas.
- `z-modal` (40) : Diálogos modais, painéis de confirmação.
- `z-toast` (50) : Notificações sonner/toast, tooltips e popovers flutuantes de prioridade máxima.

❌ **PROIBIDO:** Valores arbitrários de z-index (`z-[99]`, `z-[999]`, `z-[9999]`).

## 3. Elevação e Sombras (Shadows)

O NutriDiet adota uma estética **flat-first com profundidade funcional discreta**:

- **Nenhum (Shadow None):** Cards normais, tabelas e inputs usam borda fina de 1px em vez de sombra.
- `shadow-sm` : Botões em hover, cards interativos focados.
- `shadow-md` : Dropdowns, menus suspensos, popovers.
- `shadow-lg` : Modais, diálogos e toasts.

❌ **PROIBIDO:** Sombras coloridas, sombras com desfoque excessivo (glow effect) ou elevações tridimensionais pesadas.

## 4. Movimento e Animação

Animações devem ser rápidas, sutis e funcionais (micro-interações):

- **Duração Máxima:** `150ms` a `200ms` para feedback de hover/active; máximo de `250ms` para abertura de modais.
- **Curva Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` ou `ease-in-out` padrão.
- Animações permitidas: fade-in sutil, slide curto de 4px a 8px em dropdowns, expansão de sanfona (accordion).
- ❌ **PROIBIDO:** Animações lentas (acima de 300ms), giros decorativos, animações 3D ou rebotes excessivos (bounce) que distraiam o profissional de saúde.
- ✅ **Acessibilidade:** Respeitar obrigatoriamente `motion-reduce:` (desativar transições se `prefers-reduced-motion` estiver ativo).
