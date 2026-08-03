# Especificações Visuais Completas dos Componentes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Documentar de forma normativa e verificável como cada componente atual do NutriDiet deve ser estilizado, eliminando decisões visuais locais durante a implementação.

**Architecture:** Cada família pública de componente terá uma especificação própria em `design-system/components/`, organizada pela camada-alvo do Atomic Design. Um registro JSON relacionará símbolos públicos, fontes atuais, camada-alvo, consumidores e arquivo de especificação; um verificador automatizado impedirá componentes sem registro, especificações incompletas, estados ausentes e referências quebradas. `design-system/12-component-specifications.md` passará a ser o índice humano do catálogo, enquanto as fichas individuais serão a fonte normativa detalhada.

**Tech Stack:** Markdown, JSON, Node.js ESM, Vitest, TypeScript/React como fonte de inventário, Shadcn UI/Radix, Tailwind CSS e Lucide.

## Global Constraints

- O escopo é exclusivamente web desktop a partir de `1024px`; mobile, tablet, mobile-first e dark mode não serão especificados.
- Tema claro levemente quente: canvas `#F5F3EE`, surface `#FFFFFF`, surface-subtle `#FAF8F4` e primary `#2746B3`.
- A documentação de componentes deve consumir nomes de tokens de sistema ou componente; valores hexadecimais não podem ser repetidos nas fichas.
- Tipografia exclusivamente Plus Jakarta Sans e somente styles semânticos definidos em `design-system/05-typography-system.md`.
- Spacing permitido: `0`, `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48` e `64px`.
- Radius permitido: `0`, `4`, `6` e `8px`; formato circular somente para avatar, radio, spinner, status dot e marcador de gráfico.
- Toda borda possui exatamente `1px`; foco usa ring/outline de `2px` com offset de `2px`.
- Controles possuem somente `32px` ou `36px` de altura; não existe tamanho large.
- Sombras são proibidas em cards e permitidas apenas nos tokens de floating/overlay.
- Movimento usa somente `0`, `120`, `160` ou `240ms`; `transition-all`, scale em hover e spring/bounce são proibidos.
- Ícones são exclusivamente Lucide em `12`, `14`, `16`, `20` ou `24px`, stroke `1.75`.
- Conformidade mínima WCAG 2.2 AA.
- A hierarquia-alvo é `ui → atoms → molecules → organisms → templates → app`; uma ficha deve ser arquivada na camada-alvo, mesmo quando o arquivo atual estiver mal classificado.
- Toda decisão compartilhada deve existir em uma receita comum. Fichas não podem usar expressões abertas como “spacing adequado”, “cor apropriada” ou “tamanho conforme necessário”.
- Este plano documenta componentes e padrões transversais. Layout detalhado de rotas e migração de `src/` ficam fora deste escopo e exigem planos próprios.

---

## Definition of Done

O trabalho estará completo somente quando:

1. os 39 arquivos de componentes atuais estiverem cobertos pelo registro;
2. todos os símbolos públicos e compound parts estiverem associados a uma ficha;
3. as quatro propostas justificadas (`Textarea`, `FormField`, `Spinner`, `Skeleton`) estiverem especificadas e marcadas como `proposed`;
4. cada ficha contiver anatomia, API visual, geometria, tipografia, tokens, estados, movimento, acessibilidade, composição e critérios de aceite;
5. cada estado aplicável tiver receita exata para cada parte do componente;
6. qualquer estado não aplicável estiver registrado como `N/A` com justificativa objetiva;
7. `npm run verify:design-system` e `npm run verify:links` passarem;
8. nenhuma mudança em `src/` fizer parte desta execução;
9. um implementador conseguir reproduzir o componente sem escolher tamanho, cor, peso, spacing, radius, borda, sombra, ícone ou transição.

## Execution Precondition

Executar este plano somente depois que a reconstrução canônica atual de `design-system/` estiver em um commit próprio e o worktree estiver limpo, exceto pelos artefatos externos já existentes em `.agents/skills_link/`, que não pertencem ao escopo e não devem ser adicionados a nenhum commit.

## Target File Structure

```text
design-system/
├── 11-component-contract.md
├── 12-component-specifications.md
├── 15-component-registry.md
└── components/
    ├── README.md
    ├── specification-schema.md
    ├── shared-recipes.md
    ├── registry.json
    ├── ui/
    ├── atoms/
    ├── molecules/
    ├── organisms/
    └── templates/
scripts/
└── verify-design-system-components.mjs
tests/
└── design-system/
    └── component-specs.test.mjs
```

## Normative Component Specification Schema

Toda ficha individual deve usar exatamente estas seções, nesta ordem:

```markdown
# ComponentName

## 1. Identidade
## 2. Propósito
## 3. Quando usar
## 4. Quando não usar
## 5. Anatomia
## 6. API visual e variantes
## 7. Geometria
## 8. Tipografia
## 9. Tokens por parte
## 10. Matriz de estados
## 11. Ícones
## 12. Movimento
## 13. Interação e teclado
## 14. Acessibilidade
## 15. Conteúdo, overflow e densidade
## 16. Composição permitida
## 17. Composição proibida
## 18. Critérios de aceite
```

Em `Tokens por parte`, cada linha deve informar parte, propriedade e token. Em `Matriz de estados`, as colunas obrigatórias são estado, background, texto, borda, ícone, cursor, movimento e anúncio semântico.

---

### Task 1: Criar o contrato verificável e o inventário canônico

**Files:**
- Create: `design-system/components/README.md`
- Create: `design-system/components/specification-schema.md`
- Create: `design-system/components/registry.json`
- Create: `scripts/verify-design-system-components.mjs`
- Create: `tests/design-system/component-specs.test.mjs`
- Modify: `design-system/11-component-contract.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `verifyComponentSpecs(rootDir: string, strict: boolean): string[]`.
- Produces: `npm run verify:design-system` executando o verificador em modo estrito.
- Produces: registro com os campos `id`, `name`, `layer`, `nature`, `lifecycle`, `sourceFiles`, `publicExports`, `spec`, `consumers` e `primitiveBase`.

- [ ] **Step 1: Escrever o teste do verificador**

O teste deve importar a função e exigir nenhum erro no estado final:

```ts
import { describe, expect, it } from 'vitest';
import { verifyComponentSpecs } from '../../scripts/verify-design-system-components.mjs';

describe('design-system component specifications', () => {
  it('validates inventory and every specification already marked complete', () => {
    expect(verifyComponentSpecs(process.cwd(), false)).toEqual([]);
  });
});
```

- [ ] **Step 2: Implementar as invariantes do verificador**

O script deve retornar erro quando encontrar: fonte TSX sem registro; fonte inexistente; símbolo público sem entrada; spec inexistente; spec duplicada; seção obrigatória ausente; estado interativo sem matriz; lifecycle `implemented`, `migration-required` ou `stable` sem spec completa; placeholder textual; link local quebrado dentro das fichas.

- [ ] **Step 3: Registrar todo o inventário atual**

O registro deve cobrir exatamente os arquivos atuais em `src/components/ui`, `atoms`, `molecules`, `organisms` e `templates`, ignorando `index.ts` e `__tests__`. Compound components como Card, Dialog, Select, Table e DropdownMenu ficam em uma entrada de família com todos os `publicExports` enumerados.

- [ ] **Step 4: Documentar o schema e a política de ausência de decisões locais**

`specification-schema.md` deve definir as 18 seções, os campos das tabelas, o uso obrigatório de tokens e a regra `N/A + justificativa`. `11-component-contract.md` deve apontar para esse schema e torná-lo requisito de promoção para `stable`.

- [ ] **Step 5: Adicionar o comando de validação**

```json
"verify:design-system": "node scripts/verify-design-system-components.mjs --strict"
```

- [ ] **Step 6: Validar a infraestrutura sem exigir fichas completas**

Run: `node scripts/verify-design-system-components.mjs`

Expected: PASS para estrutura e inventário; o modo `--strict` deve listar nominalmente todas as fichas ainda ausentes.

- [ ] **Step 7: Commit**

```bash
git add design-system/components design-system/11-component-contract.md scripts/verify-design-system-components.mjs tests/design-system/component-specs.test.mjs package.json
git commit -m "docs(design-system): add verifiable component specification contract"
```

---

### Task 2: Fixar as receitas visuais compartilhadas

**Files:**
- Create: `design-system/components/shared-recipes.md`
- Modify: `design-system/components/specification-schema.md`

**Interfaces:**
- Consumes: tokens dos documentos 03 a 08.
- Produces: receitas nomeadas `control-compact`, `control-standard`, `icon-control-compact`, `icon-control-standard`, `surface-compact`, `surface-standard`, `menu-item`, `navigation-item`, `data-row`, `overlay-small`, `overlay-medium`, `overlay-large`, `feedback-inline` e `feedback-floating`.

- [ ] **Step 1: Definir geometria exata por receita**

Cada receita deve especificar altura, min-width quando aplicável, padding horizontal/vertical, gap, radius, borda, ícone, text style e comportamento de overflow usando somente valores permitidos.

- [ ] **Step 2: Definir tokens por estado**

Para cada receita interativa, preencher `default`, `hover`, `pressed`, `focus-visible`, `selected`, `disabled`, `loading`, `error` e `read-only`. Estados não aplicáveis devem conter justificativa.

- [ ] **Step 3: Definir receitas de densidade e composição**

Documentar exatamente quando usar compact ou standard, padding de superfícies, separação entre header/body/footer e limites de largura dos overlays. Nenhuma ficha poderá redefinir esses valores sem registrar uma variante de componente.

- [ ] **Step 4: Validar**

Run: `node scripts/verify-design-system-components.mjs`

Expected: PASS sem tokens inexistentes, valores fora das escalas ou nomes de receita duplicados.

- [ ] **Step 5: Commit**

```bash
git add design-system/components/shared-recipes.md design-system/components/specification-schema.md
git commit -m "docs(design-system): define shared component recipes"
```

---

### Task 3: Especificar os primitivos de controle e seleção

**Files:**
- Create: `design-system/components/ui/button.md`
- Create: `design-system/components/ui/input.md`
- Create: `design-system/components/ui/select.md`
- Create: `design-system/components/ui/tabs.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: receitas de controle da Task 2.
- Produces: contratos completos para `Button`, `Input`, `Select` e `Tabs`, incluindo todas as compound parts de Select e Tabs.

- [ ] **Step 1: Documentar Button**

Fixar `primary`, `secondary`, `ghost`, `danger` e `link`; tamanhos `compact` e `standard`; alinhamento de ícone; loading com largura preservada; foco; disabled; regra de um primary por região; proibição de emerald, terracotta, macro e large.

- [ ] **Step 2: Documentar Input**

Fixar texto, placeholder, prefixo/sufixo, unidade, número tabular, error, disabled, read-only, foco, seleção, autofill, overflow e diferenças entre 32px e 36px.

- [ ] **Step 3: Documentar Select**

Especificar Trigger, Value, Icon, Content, Viewport, Item, Indicator, Label e Separator; dimensões, portal, collision handling desktop, teclado e estados selected/disabled.

- [ ] **Step 4: Documentar Tabs**

Especificar TabsList, TabsTrigger e TabsContent; variante padrão sem pills; indicador primary; navegação por teclado; overflow horizontal proibido no escopo desktop suportado.

- [ ] **Step 5: Validar e atualizar lifecycle**

Run: `node scripts/verify-design-system-components.mjs`

Expected: as quatro famílias devem aparecer como `specified`; nenhuma outra entrada pode mudar de lifecycle.

- [ ] **Step 6: Commit**

```bash
git add design-system/components/ui design-system/components/registry.json
git commit -m "docs(design-system): specify control and selection primitives"
```

---

### Task 4: Especificar os primitivos de overlay e conteúdo contextual

**Files:**
- Create: `design-system/components/ui/dialog.md`
- Create: `design-system/components/ui/dropdown-menu.md`
- Create: `design-system/components/ui/popover.md`
- Create: `design-system/components/ui/sheet.md`
- Create: `design-system/components/ui/tooltip.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: receitas `overlay-small`, `overlay-medium`, `overlay-large`, `menu-item` e tokens de layer/motion.
- Produces: contratos completos de portal, overlay, content, close, foco e retorno de foco.

- [ ] **Step 1: Documentar Dialog e Sheet**

Fixar backdrop, z-index, sombra overlay, tamanhos permitidos, padding, header/body/footer, close button, scroll interno, entrada/saída, foco inicial, focus trap e retorno ao acionador. Sheet permanece desktop e não representa adaptação mobile.

- [ ] **Step 2: Documentar DropdownMenu e Popover**

Fixar largura mínima/máxima, padding, item height, grupos, separators, destructive item, submenu, checked/radio items, alinhamento, collision padding, teclado e dismissal.

- [ ] **Step 3: Documentar Tooltip**

Fixar trigger semântico, delay, max-width, text style, contraste, offset, movimento e proibição de conteúdo essencial ou interativo.

- [ ] **Step 4: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: cinco famílias novas marcadas `specified` e todas as matrizes de overlay completas.

```bash
git add design-system/components/ui design-system/components/registry.json
git commit -m "docs(design-system): specify overlay primitives"
```

---

### Task 5: Especificar os primitivos de superfície e dados

**Files:**
- Create: `design-system/components/ui/badge.md`
- Create: `design-system/components/ui/card.md`
- Create: `design-system/components/ui/scroll-area.md`
- Create: `design-system/components/ui/separator.md`
- Create: `design-system/components/ui/table.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: receitas `surface-compact`, `surface-standard` e `data-row`.
- Produces: especificações das 14 famílias `ui` atualmente implementadas quando combinadas às Tasks 3 e 4.

- [ ] **Step 1: Documentar Badge**

Fixar variantes neutral, primary-soft, info, success, warning, error e macros; altura, padding, radius 4px, ponto/ícone opcional, truncation, números e proibição de formato pill.

- [ ] **Step 2: Documentar Card e Separator**

Fixar Card, CardHeader, CardTitle, CardDescription, CardContent e CardFooter; padding 16/20 conforme receita; radius 8px; borda 1px; ausência de sombra; regras contra card dentro de card. Separator deve fixar orientação, espessura e token de divider.

- [ ] **Step 3: Documentar ScrollArea**

Fixar scrollbar, track, thumb, estados hover/drag, dimensões e regra de não ocultar indicação de overflow necessária.

- [ ] **Step 4: Documentar Table**

Fixar Table, Header, Body, Footer, Row, Head, Cell e Caption; alturas, padding, alinhamento numérico, hover, selected, sortable, empty, loading, overflow e foco de controles internos.

- [ ] **Step 5: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: todas as 14 famílias `ui` implementadas marcadas `specified`.

```bash
git add design-system/components/ui design-system/components/registry.json
git commit -m "docs(design-system): specify surface and data primitives"
```

---

### Task 6: Especificar todos os atoms atuais

**Files:**
- Create: `design-system/components/atoms/avatar.md`
- Create: `design-system/components/atoms/badge.md`
- Create: `design-system/components/atoms/button.md`
- Create: `design-system/components/atoms/icon-button.md`
- Create: `design-system/components/atoms/input.md`
- Create: `design-system/components/atoms/progress-bar.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: specs `ui` correspondentes.
- Produces: contratos dos wrappers públicos e receitas `CreateButton`, `SecondaryActionButton`, `EditIconButton` e `DeleteIconButton` sem duplicar primitivos.

- [ ] **Step 1: Especificar wrappers Button, IconButton e Input**

Declarar exatamente quais props/variantes dos primitivos são expostas, bloqueadas ou transformadas. Receitas nomeadas devem referenciar variantes existentes e não criar novas cores, tamanhos ou estados.

- [ ] **Step 2: Especificar Avatar e Badge**

Fixar tamanhos aceitos, iniciais, imagem ausente, contraste, status marker, truncation e relação com os primitivos. Avatar é uma das exceções circulares; Badge não é.

- [ ] **Step 3: Especificar ProgressBar**

Fixar track, indicator, espessuras, radius, animação, valor indeterminado, valor fora de faixa, labels, macros e atributos ARIA.

- [ ] **Step 4: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: os seis atoms atuais e todos os exports públicos associados marcados `specified`.

```bash
git add design-system/components/atoms design-system/components/registry.json
git commit -m "docs(design-system): specify atomic components"
```

---

### Task 7: Especificar moléculas de navegação e contexto do produto

**Files:**
- Create: `design-system/components/molecules/sidebar-brand.md`
- Create: `design-system/components/molecules/sidebar-nav-item.md`
- Create: `design-system/components/molecules/sidebar-quick-actions.md`
- Create: `design-system/components/molecules/sidebar-user-profile.md`
- Create: `design-system/components/molecules/patient-badge-header.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: atoms especificados e receitas de navegação.
- Produces: contratos independentes para os quatro subcomponentes hoje reexportados por `SidebarNav` e para o cabeçalho compacto de paciente.

- [ ] **Step 1: Especificar as quatro moléculas da sidebar**

Fixar anatomia expandida/recolhida, dimensões, text styles, ícones, active/hover/focus/disabled, tooltip no modo recolhido, avatar, truncation e áreas clicáveis. Registrar explicitamente que imports devem ser descendentes após a migração.

- [ ] **Step 2: Especificar PatientBadgeHeader**

Fixar avatar, nome, metadados, badge/status, hierarquia tipográfica, gaps, truncation e comportamento nos containers suportados.

- [ ] **Step 3: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: cinco moléculas marcadas `specified`; as quatro entradas da sidebar continuam `migration-required` até a arquitetura do código ser corrigida.

```bash
git add design-system/components/molecules design-system/components/registry.json
git commit -m "docs(design-system): specify navigation and patient context molecules"
```

---

### Task 8: Especificar moléculas do domínio nutricional

**Files:**
- Create: `design-system/components/molecules/auto-kcal-section.md`
- Create: `design-system/components/molecules/macro-metric-card.md`
- Create: `design-system/components/molecules/meal-item-row.md`
- Create: `design-system/components/molecules/recipe-card.md`
- Create: `design-system/components/molecules/recipe-ingredient-row.md`
- Create: `design-system/components/molecules/taco-search-input.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: sistema oficial de macros e specs de atoms/primitives.
- Produces: contratos exatos para apresentação e edição de dados nutricionais.

- [ ] **Step 1: Especificar AutoKcalSection e MacroMetricCard**

Fixar label, valor, unidade, delta, meta, progress, cor macro permitida, calories neutral, número tabular, estados dentro/fora da meta, edição, loading e erro.

- [ ] **Step 2: Especificar MealItemRow e RecipeIngredientRow**

Fixar grid de colunas, alturas, célula de alimento, quantidade/unidade, macros, ações, hover/focus, edição, remoção, erro e overflow. Diferenças reais entre as duas linhas devem ser explícitas.

- [ ] **Step 3: Especificar RecipeCard**

Fixar superfície, header, metadados, macros, ingredientes resumidos, ações, estados hover/selected/empty e regra de card não clicável quando contém botões internos.

- [ ] **Step 4: Especificar TacoSearchInput**

Fixar ícone, input, clear, loading, sugestões, no-results, teclado, debounce apenas como comportamento consumidor e relação com FoodSearchModal.

- [ ] **Step 5: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: todas as moléculas de domínio que permanecem nessa camada marcadas `specified`.

```bash
git add design-system/components/molecules design-system/components/registry.json
git commit -m "docs(design-system): specify nutrition domain molecules"
```

---

### Task 9: Especificar organisms atuais e reclassificados

**Files:**
- Create: `design-system/components/organisms/sidebar-nav.md`
- Create: `design-system/components/organisms/macro-tracker-header.md`
- Create: `design-system/components/organisms/meal-card-container.md`
- Create: `design-system/components/organisms/diet-mode-switcher.md`
- Create: `design-system/components/organisms/food-search-modal.md`
- Create: `design-system/components/organisms/read-only-diet-modal.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: specs de primitives, atoms e molecules.
- Produces: contratos completos de seis seções complexas, incluindo três componentes cuja fonte atual ainda está em `molecules`.

- [ ] **Step 1: Especificar SidebarNav e MacroTrackerHeader**

Fixar dimensões 224/64px, regiões internas, separadores, canvas/surface, comportamento de collapse, composição dos subcomponentes e grid 2×2 ou 4×1 dos macros nos desktops suportados.

- [ ] **Step 2: Especificar MealCardContainer**

Fixar header, lista, footer, hierarquia de ações, meal summary, empty, items, editing, loading, error, drag/reorder se existente e regras contra bordas aninhadas visíveis.

- [ ] **Step 3: Especificar DietModeSwitcher**

Fixar anatomia de organismo, segmented control sem pills, primary-soft selected, áreas condicionais, estados e camada-alvo `organism`.

- [ ] **Step 4: Especificar FoodSearchModal e ReadOnlyDietModal**

Fixar tamanhos de dialog, anatomia, scroll, header/body/footer, busca/resultados/seleção/quantidade, leitura histórica, macros, foco inicial, retorno de foco, loading, empty, error e read-only textual.

- [ ] **Step 5: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: seis organisms especificados; os três arquivos ainda em `molecules` permanecem lifecycle `migration-required` com camada-alvo `organism`.

```bash
git add design-system/components/organisms design-system/components/registry.json
git commit -m "docs(design-system): specify application organisms"
```

---

### Task 10: Especificar templates e componentes propostos

**Files:**
- Create: `design-system/components/templates/app-layout-shell.md`
- Create: `design-system/components/templates/diet-builder-template.md`
- Create: `design-system/components/ui/textarea.md`
- Create: `design-system/components/atoms/spinner.md`
- Create: `design-system/components/atoms/skeleton.md`
- Create: `design-system/components/molecules/form-field.md`
- Modify: `design-system/components/registry.json`

**Interfaces:**
- Consumes: todas as camadas inferiores especificadas.
- Produces: contratos dos dois templates atuais e das quatro propostas justificadas pelo uso real.

- [ ] **Step 1: Especificar AppLayoutShell**

Fixar sidebar, content area, canvas, container, gutters, scroll ownership, foco de skip link e comportamento entre 1024px e larguras maiores.

- [ ] **Step 2: Especificar DietBuilderTemplate**

Fixar regiões, largura de workflow, header, macro summary, meal stack, action area, gaps e ownership de scroll sem definir conteúdo específico de uma rota.

- [ ] **Step 3: Especificar Textarea e FormField**

Textarea deve herdar Input e fixar min-height, resize, scroll, error, disabled e read-only. FormField deve fixar label, required indicator, control, helper, error, IDs e gaps.

- [ ] **Step 4: Especificar Spinner e Skeleton**

Spinner deve fixar tamanhos, stroke, rotação, reduced motion e label acessível. Skeleton deve fixar superfícies, radius, shimmer proibido se violar motion, pulse permitido somente com token documentado e preservação de layout.

- [ ] **Step 5: Validar e commit**

Run: `node scripts/verify-design-system-components.mjs`

Expected: templates atuais `specified`; quatro propostas `proposed` com ficha completa, sem serem declaradas implementadas.

```bash
git add design-system/components/templates design-system/components/ui/textarea.md design-system/components/atoms/spinner.md design-system/components/atoms/skeleton.md design-system/components/molecules/form-field.md design-system/components/registry.json
git commit -m "docs(design-system): specify templates and proposed foundations"
```

---

### Task 11: Consolidar o catálogo e fechar a conformidade

**Files:**
- Modify: `design-system/README.md`
- Modify: `design-system/12-component-specifications.md`
- Modify: `design-system/15-component-registry.md`
- Modify: `design-system/13-implementation-and-compliance.md`
- Modify: `agents.md`
- Modify: `tests/design-system/component-specs.test.mjs`

**Interfaces:**
- Consumes: registro e todas as fichas concluídas.
- Produces: índice humano sem duplicação normativa e uma baseline verificável para o futuro plano de migração do código.

- [ ] **Step 1: Converter o documento 12 em índice do catálogo**

Substituir regras resumidas duplicadas por uma tabela com componente, camada-alvo, lifecycle, spec e base. O documento deve declarar que valores visuais residem nas fichas individuais.

- [ ] **Step 2: Sincronizar o registro humano**

Atualizar `15-component-registry.md` a partir de `registry.json`, preservando distinção entre existência do arquivo, conformidade documental, conformidade de implementação e migração arquitetural.

- [ ] **Step 3: Atualizar entrada, implementação e roteamento**

Adicionar `components/README.md` à ordem de leitura do README mestre; fazer `13-implementation-and-compliance.md` exigir o verificador; adicionar o catálogo ao roteamento de `agents.md`.

- [ ] **Step 4: Rodar o modo estrito**

Alterar o teste de integração para `verifyComponentSpecs(process.cwd(), true)`; a partir deste ponto, nenhuma entrada atual pode permanecer apenas inventariada.

Run: `npm run verify:design-system`

Expected: PASS e relatório `39 current source files covered; 0 incomplete implemented specs; 4 proposed specs documented`.

- [ ] **Step 5: Rodar verificações documentais e de isolamento**

Run: `npm run verify:links`

Expected: zero links quebrados.

Run: `git diff --check`

Expected: nenhuma saída.

Run: `git diff --name-only -- src`

Expected: nenhuma saída.

- [ ] **Step 6: Revisar ausência de decisões abertas**

Run:

```powershell
$forbidden = @(('T' + 'BD'), ('T' + 'ODO'), 'a definir', 'conforme necessário', 'quando adequado', 'cor apropriada', 'spacing adequado') -join '|'
rg -n $forbidden design-system/components
```

Expected: nenhuma ocorrência.

- [ ] **Step 7: Commit**

```bash
git add design-system agents.md scripts/verify-design-system-components.mjs tests/design-system/component-specs.test.mjs package.json
git commit -m "docs(design-system): complete normative component catalog"
```

---

## Post-plan Work Kept Separate

Após este plano, existem dois trabalhos independentes:

1. **Especificações de telas:** documentar composição, hierarquia, estados e comportamento das dez rotas atuais usando somente componentes já especificados.
2. **Migração da implementação:** alterar tokens, primitives, atoms, molecules, organisms, templates e páginas até o código corresponder às fichas.

Nenhum dos dois deve começar antes de `npm run verify:design-system` passar, porque a implementação não pode ser a etapa em que decisões visuais ainda são inventadas.
