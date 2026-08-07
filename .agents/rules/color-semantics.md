# Rule: Sistema de Cores e Semântica Cromática

> **Escopo:** Uso e aplicação de cores em componentes, layouts e elementos visuais.

## 1. Paleta de Cores e Função Semântica

A aplicação de cor no NutriDiet segue o princípio da **escassez cromática**: a maior parte da interface é neutra e silenciosa, reservando cor para ações e prioridades.

### 1.1 Superfícies e Base
- **Canvas Principal:** Off-white levemente quente (`bg-canvas` / `--color-canvas`).
- **Superfície Principal:** Branco puro para cards, tabelas e modais (`bg-card` / `--color-surface`).
- **Subárea / Recesso:** Off-white suave para áreas secundárias e filtros (`bg-muted` / `--color-surface-subtle`).

### 1.2 Cor Primária (Ação e Foco)
- **Primary Azul:** (`#2746B3` / `bg-primary` / `text-primary`).
- **Uso Obrigatório:** Botão principal (CTA), item selecionado, navegação ativa, anel de foco, barras de progresso principal.
- ❌ **Proibição:** Não usar a cor primária em grandes planos de fundo de páginas, fundos de tabela ou bordas decorativas de cards.

### 1.3 Neutros e Texto
- **Texto Primário:** Escuro de alto contraste (`text-foreground` / `--color-text-primary`).
- **Texto Secundário:** Cinza neutro médio (`text-muted-foreground` / `--color-text-secondary`).
- **Texto Terciário / Muted:** Cinza suave para metadados e timestamps (`--color-text-muted`).
- **Bordas:** Cinza neutro suave de 1px (`border-border` / `--color-border`).

### 1.4 Cores Semânticas de Status e Feedback
- **Sucesso (Verde):** Confirmações, atingimento de metas, status positivo (`--color-success`).
- **Aviso (Âmbar/Amarelo):** Alertas de atenção, limites de ingestão próximos (`--color-warning`).
- **Erro / Destrutivo (Vermelho):** Erros de validação, ações destrutivas, ultrapassagem crítica (`--color-destructive`).
- **Info (Azul Claro/Sky):** Dicas informativas e alertas neutros (`--color-info`).

### 1.5 Cores de Domínio Nutricional
Cores específicas fixadas para macronutrientes na exibição de dietas e tabelas TACO:
- **Carboidratos:** Tom alaranjado/âmbar dedicado (`--color-macro-carb`).
- **Proteínas:** Tom avermelhado/coral dedicado (`--color-macro-protein`).
- **Gorduras (Lípedes):** Tom amarelo/dourado dedicado (`--color-macro-fat`).
- **Fibras / Micronutrientes:** Tom esverdeado/teat dedicado (`--color-macro-fiber`).

## 2. Acessibilidade de Contraste (WCAG 2.2 AA)

- Texto normal deve manter contraste mínimo de **4.5:1** contra o fundo.
- Texto grande (acima de 18pt/24px ou 14pt/19px bold) e componentes de UI (bordas ativas, ícones interativos) devem manter contraste mínimo de **3:1**.
- Não dependa exclusivamente da cor para transmitir informação de status; inclua texto explicativo ou ícones correspondentes.

## 3. Vedações Cromáticas

- ❌ Não inventar novas tonalidades de cores fora dos tokens definidos em `tokens.css`.
- ❌ Não usar a cor de erro (vermelho) para elementos neutros ou decorativos.
- ❌ Não misturar cores de macronutrientes em contextos genéricos de UI.
