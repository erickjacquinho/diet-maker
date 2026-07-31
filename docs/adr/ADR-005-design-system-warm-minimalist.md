# ADR-005: Design System Warm Minimalist Off-White (Swiss Flat 2.0)

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
O NutriDiet Pro necessita de uma identidade visual marcante, limpa, clara e de alta legibilidade para atendimento em consultório. O usuário especificou que a interface não deve conter sombras 3D (`box-shadow`), gradientes (`linear-gradient`) ou filtros de profundidade, baseando-se nas referências visuais de dashboards minimalistas quentes (Swiss Warm Minimalist).

## Decisão
Adotar o **Design System Warm Minimalist Off-White (Swiss Flat 2.0)** como padrão oficial do projeto:

1. **Paleta Base & Destaque**:
   - Fundo da Aplicação: `#f5f2eb` (Creme / Areia Suave Swiss Warm).
   - Superfície dos Cards: `#ffffff` (Branco Puro Nítido).
   - Containers Internos / Inputs: `#faf8f5` (Off-white sutil).
   - Linhas e Contornos: `#e8e4dc` (Linha sólida de 1px - Zero box-shadow).
   - Texto Principal & Números: `#111827` (Dark Charcoal / Carvão Escuro).
   - Cor Dominante de Destaque (Brand Highlight): `#047857` / `#059669` (Verde Esmeralda Nutricional para CTAs principais e conclusões).

2. **Tipografia & Contraste**:
   - Fonte Principal: **Plus Jakarta Sans** (Display/Headings) / **Inter** (Body/Formulários) / **Fira Code** (Métricas).
   - Numerais de Kcal, g/kg e Macros em peso `font-bold` / `font-black` em Carvão Escuro e Esmeralda.

3. **Layout & Arquitetura Atomic Design**:
   - Organização estrutural em 5 níveis (`atoms`, `molecules`, `organisms`, `templates`, `app`).
   - Preservação de 100% dos primitivos Shadcn UI em `src/components/ui/` sem modificações genéricas.
   - Sidebar Lateral Esquerda Fixa (240px) com pílula de navegação ativa.
   - Bento Grid responsivo com cards em cantos `rounded-2xl` (16px) e pílulas de status arredondadas (`rounded-full`).

4. **Zero Sombras / Zero Gradientes (Swiss Flat)**:
   - Proibição estrita de `box-shadow` e `linear-gradient`.
   - Separação visual garantida exclusivamente por bordas sólidas nítidas de 1px e contraste de fundo.

## Consequências
- Visual contemporâneo, atemporal e extremamente agradável para atendimento diário.
- Desempenho computacional ⚡ excelente (zero repintura de sombras no navegador).
- Conformidade total com acessibilidade WCAG 2.1 AA/AAA.
