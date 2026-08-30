# UX & Accessibility Checklist: Timeline de Atendimentos

**Purpose**: Garantir conformidade com as diretrizes UI/UX Pro Max e a Constituição NutriDiet Local Pro
**Created**: 2026-08-22
**Feature**: [spec.md](../spec.md)

## Visual Hierarchy & Progressive Disclosure

- [x] Controles de filtro no topo com feedback ativo claro e contagens em badges
- [x] Cabeçalho de data unificado para agrupar múltiplos eventos do mesmo dia
- [x] Cards com semântica de cor consistente (verde para dietas, neutro/primário para avaliações)
- [x] Ações primárias explícitas: "Ver Cardápio" e "Ver Detalhes" em vez de chevrons crípticos
- [x] Painel de dobras e perímetros expande inline com rótulo alternado dinâmico

## Accessibility & Standards (WCAG 2.2 AA)

- [x] Elementos interativos com foco visível e navegação completa por teclado (Tab / Espaço / Enter)
- [x] Atributos `aria-expanded` e `aria-label` adequados nos botões de expansão e ações
- [x] Contraste mínimo de texto de 4.5:1 em todos os badges de macronutrientes e números
- [x] Alvos de toque/clique de no mínimo 36px de altura (padrão desktop compact/standard)
- [x] Estados vazios explicativos e acionáveis para cada aba de filtro
