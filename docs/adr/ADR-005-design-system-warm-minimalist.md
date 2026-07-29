# ADR-005: Design System Warm Minimalist Off-White (Swiss Flat 2.0)

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
O NutriDiet Pro necessita de uma identidade visual marcante, limpa, clara e de alta legibilidade para atendimento em consultório. O usuário especificou que a interface não deve conter sombras 3D (`box-shadow`), gradientes (`linear-gradient`) ou filtros de profundidade, baseando-se nas referências visuais de dashboards minimalistas quentes (Swiss Warm Minimalist).

## Decisão
Adotar o **Design System Warm Minimalist Off-White (Swiss Flat 2.0)** como padrão oficial do projeto:

1. **Paleta Base**:
   - Fundo da Aplicação: `#f5f2eb` (Creme / Areia Suave).
   - Superfície dos Cards: `#ffffff` (Branco Puro Nítido).
   - Containers Internos / Inputs: `#faf8f5` (Off-white sutil).
   - Linhas e Contornos: `#e8e4dc` (Linha sólida de 1px - Zero box-shadow).
   - Texto Principal & Números: `#111827` (Dark Charcoal / Carvão Escuro).

2. **Tipografia & Contraste**:
   - Fonte Principal: **Plus Jakarta Sans** / **Inter** (Google Fonts).
   - Numerais de Kcal, g/kg e Macros em peso `font-black` (900) em Carvão Escuro.

3. **Layout & Geometria**:
   - Sidebar Lateral Esquerda Fixa (240px) com pílula de navegação ativa.
   - Cards com cantos `rounded-2xl` (16-20px) e pílulas de status arredondadas (`rounded-full`).

4. **Zero Sombras / Zero Gradientes**:
   - Proibição estrita de `box-shadow` e `linear-gradient`.
   - Separação visual garantida exclusivamente por bordas sólidas nítidas de 1px e contraste de fundo.

## Consequências
- Visual contemporâneo, atemporal e extremamente agradável para atendimento diário.
- Desempenho computacional ⚡ excelente (zero repintura de sombras no navegador).
- Conformidade total com acessibilidade WCAG AAA.
