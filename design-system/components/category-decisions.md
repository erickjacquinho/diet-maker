# Category Decisions

Este registro documenta criação, mudança de limites e lifecycle das categorias visuais. O registro JSON é o índice executável; este arquivo preserva problema, consumidores, alternativas, impacto, compatibilidade e decisão aprovada.

## Initial decisions

Cada decisão inicial possui um registro completo. `Replacement` é `none` enquanto a categoria estiver estável.

### CAT-2026-07-31-actions

- Status: `accepted/stable`
- Category/lifecycle affected: `actions` / `stable`
- Problem: Ações explícitas precisavam de uma receita comum para intenção, foco, busy e consequência.
- Consumers: `ui-button`, `atom-button`, `atom-icon-button`, `molecule-sidebar-quick-actions`.
- Alternatives: Compor `feedback` para mensagens; usar variante em `navigation`; criar uma categoria por botão.
- Impact: Centraliza controles que disparam comandos e evita divergência entre famílias.
- Compatibility: Compatível com traits `icon-only`, `destructive`, `async` e `collapsible`; não altera Atomic Design.
- Decision: Manter ações imediatas nesta categoria; rotas, seleção persistente e shell ficam fora.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-fields

- Status: `accepted/stable`
- Category/lifecycle affected: `fields` / `stable`
- Problem: Entrada textual, numérica e search compartilhavam geometria, label, helper e erro.
- Consumers: `ui-input`, `atom-input`, `molecule-taco-search-input`, `ui-textarea`, `molecule-form-field`.
- Alternatives: Colocar search em `selection`; repetir a receita em cada input; criar categoria por tipo de dado.
- Impact: Garante associação label/valor/helper e estados determinísticos para controles de entrada.
- Compatibility: Compatível com `async`, `nutrition-context` e `read-only`; seleção composta continua em `selection`.
- Decision: Usar `fields` para entrada editável ou consultável; não incluir escolhas discretas.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-selection

- Status: `accepted/stable`
- Category/lifecycle affected: `selection` / `stable`
- Problem: Tabs e escolhas persistentes precisavam de selected, keyboard navigation e indicação sem depender só da cor.
- Consumers: `ui-select`, `ui-tabs`, `organism-diet-mode-switcher`.
- Alternatives: Tratar tabs como `navigation`; usar `fields`; duplicar selected em cada componente.
- Impact: Define seleção persistente e separa-a de comando momentâneo e destino de rota.
- Compatibility: Compatível com `async` e `nutrition-context`; compõe `fields` quando há busca.
- Decision: Manter escolhas selecionáveis nesta categoria, com `aria-selected` ou equivalente.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-navigation

- Status: `accepted/stable`
- Category/lifecycle affected: `navigation` / `stable`
- Problem: Destinos e localização atual exigiam semântica de link, item ativo e estrutura persistente.
- Consumers: `molecule-sidebar-brand`, `molecule-sidebar-nav-item`, `molecule-sidebar-user-profile`, `organism-sidebar-nav`.
- Alternatives: Usar `actions` para links; misturar shell em `structure`; criar categoria para sidebar.
- Impact: Mantém navegação consistente sem transformar comandos em links ou vice-versa.
- Compatibility: Compatível com `collapsible`, `identity` e `icon-only`; shell continua em `structure`.
- Decision: Destinos, localização e itens de navegação pertencem aqui.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-surfaces

- Status: `accepted/stable`
- Category/lifecycle affected: `surfaces` / `stable`
- Problem: Cards, painéis e divisores precisavam de agrupamento flat, borda de 1px e hierarquia de superfície.
- Consumers: `ui-card`, `ui-scroll-area`, `ui-separator`.
- Alternatives: Colocar layout de página em `structure`; usar `overlays` para todo container; decidir radius por perfil.
- Impact: Reúne superfícies locais sem impor layout externo nem comportamento de portal.
- Compatibility: Compatível com `interactive-surface`; compõe `data-display` e `structure` sem herança múltipla.
- Decision: Superfície local persistente, card e divisor usam esta categoria.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-data-display

- Status: `accepted/stable`
- Category/lifecycle affected: `data-display` / `stable`
- Problem: Tabelas, rows, métricas genéricas e identidade precisavam de alinhamento, densidade e leitura previsíveis.
- Consumers: `ui-table`, `atom-avatar`, `molecule-patient-badge-header`.
- Alternatives: Colocar toda métrica em `nutrition-domain`; usar `surfaces`; definir tabela em cada consumidor.
- Impact: Define apresentação genérica de dados sem semântica nutricional própria.
- Compatibility: Compatível com `identity` e `nutrition-context`; pode compor `surfaces`.
- Decision: Dados e identidade genéricos ficam aqui; macros e unidades nutricionais ficam em `nutrition-domain`.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-feedback

- Status: `accepted/stable`
- Category/lifecycle affected: `feedback` / `stable`
- Problem: Badge, alerta e mensagem precisavam comunicar status e severidade com texto e semântica.
- Consumers: `ui-badge`, `atom-badge`.
- Alternatives: Usar `actions` para danger; misturar espera em `loading`; deixar cor como decisão local.
- Impact: Padroniza feedback de resultado, status e severidade sem esconder o conteúdo em cor.
- Compatibility: Compatível com `nutrition-macro`; loading e espera continuam em `loading`.
- Decision: Resultado e status comunicados ao usuário pertencem a esta categoria.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-overlays

- Status: `accepted/stable`
- Category/lifecycle affected: `overlays` / `stable`
- Problem: Conteúdo temporário exigia portal, camadas, foco, dismiss e relação com o gatilho.
- Consumers: `ui-dialog`, `ui-dropdown-menu`, `ui-popover`, `ui-sheet`, `ui-tooltip`, `organism-food-search-modal`, `organism-read-only-diet-modal`.
- Alternatives: Tratar dialog como `surfaces`; usar `feedback`; definir z-index em cada perfil.
- Impact: Centraliza comportamento temporário, foco e camadas sem contaminar superfícies persistentes.
- Compatibility: Compatível com `async`, `read-only`, `nutrition-context` e `destructive`; usa tokens de overlay globais.
- Decision: Portal, dialog, sheet, popover, menu e tooltip pertencem aqui.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-loading

- Status: `accepted/stable`
- Category/lifecycle affected: `loading` / `stable`
- Problem: Espera, progresso e skeleton precisavam manter contexto, busy e movimento reduzido.
- Consumers: `atom-progress-bar`, `atom-spinner`, `atom-skeleton`.
- Alternatives: Colocar busy em `feedback`; usar apenas estado de botão em `actions`; tratar skeleton como superfície.
- Impact: Separa espera de resultado e torna progresso contínuo previsível.
- Compatibility: Compatível com `async` e `nutrition-macro`; resultados vazios permanecem fora.
- Decision: Espera e progresso sem resultado final pertencem a esta categoria.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-nutrition-domain

- Status: `accepted/stable`
- Category/lifecycle affected: `nutrition-domain` / `stable`
- Problem: Macros, calorias, alimentos e refeições compartilham unidades, precisão, comparação e semântica de produto.
- Consumers: `molecule-auto-kcal-section`, `molecule-macro-metric-card`, `molecule-meal-item-row`, `molecule-recipe-card`, `molecule-recipe-ingredient-row`, `organism-macro-tracker-header`, `organism-meal-card-container`.
- Alternatives: Espalhar regras em `data-display`; usar somente trait; criar categoria por macro.
- Impact: Preserva significado nutricional sem criar múltiplas categorias combinatórias.
- Compatibility: Compatível com `nutrition-macro`, `nutrition-context`, `async`, `read-only` e `interactive-surface`.
- Decision: Semântica nutricional compartilhada é governada aqui; `data-display` continua para dados genéricos.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

### CAT-2026-07-31-structure

- Status: `accepted/stable`
- Category/lifecycle affected: `structure` / `stable`
- Problem: Shell, containers, grids e regiões desktop precisavam de limites de layout sem estilizar filhos.
- Consumers: `template-app-layout-shell`, `template-diet-builder-template`.
- Alternatives: Usar `surfaces` para página; deixar grid em cada tela; misturar navegação no shell.
- Impact: Fixa layout desktop e composição estrutural, mantendo aparência interna nas categorias filhas.
- Compatibility: Compatível com `collapsible` e `nutrition-context`; não define tokens de conteúdo.
- Decision: Shell, regiões e containers de página pertencem aqui; estilo interno é delegado.
- Replacement: `none`.
- Approved by/date: Design System maintainers / `2026-07-31`.

## Decision record template

Copie este bloco para qualquer proposta futura; não crie categoria diretamente no registro.

### CAT-YYYY-MM-DD-slug

- Status: `proposed | accepted | rejected | superseded`
- Category/lifecycle affected:
- Problem: Problema recorrente não coberto por categoria ou trait existente.
- Consumers: Famílias consumidoras previstas (mínimo três para categoria nova).
- Alternatives: Composição, variante, trait e categoria existente avaliados.
- Impact: Efeito em tokens, estados, arquitetura, documentação e migração.
- Compatibility: Compatibilidade com categorias, traits e Atomic Design.
- Decision: Resultado aprovado ou rejeitado.
- Replacement: Substituto estruturado quando o lifecycle for `deprecated`.
- Reviewers and decision date:

## Change rules

1. Uma proposta começa `proposed`; não recebe consumidores implementados.
2. Uma categoria nova exige diferença compartilhada de anatomia, estados e tokens, além de três famílias independentes previstas.
3. Mudança de limite exige atualizar documento, registro, perfis afetados, testes e esta decisão no mesmo change set.
4. `deprecated` bloqueia novos consumidores e lista substituta; `removed` não pode ser referenciada.
5. Exceção temporária pertence ao perfil, tem responsável e prazo, e não cria precedente de categoria.
