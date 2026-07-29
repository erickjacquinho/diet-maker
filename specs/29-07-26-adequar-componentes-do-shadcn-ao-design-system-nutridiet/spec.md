# Feature Specification: Adequação dos Componentes Shadcn ao Design System NutriDiet

**Feature Directory**: `specs/29-07-26-adequar-componentes-do-shadcn-ao-design-system-nutridiet`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "/frontend-design e /ui-ux-pro-max adeque os componentes do shadcn a partir dos ja instalados pro /shadcn e adeque eles totalmente ao design system do projeto. crie um /sdd pra isso"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Refatoração dos Componentes Atômicos de Interface (Priority: P1)

Como desenvolvedor e designer do NutriDiet, quero que os componentes atômicos do shadcn UI (`button`, `badge`, `input`, `card`, `separator`) sigam estritamente o Design System NutriDiet (*Swiss Warm Minimalist Flat Design*), utilizando as classes de tokens semânticos (`warm-*`), raio de borda correto (`rounded-xl` para inputs/botões, `rounded-2xl` para cards, `rounded-full` para badges) e eliminando todas as sombras e gradientes.

**Why this priority**: Os componentes atômicos formam a base visual de toda a aplicação. Qualquer incoerência visual neles compromete a experiência e quebra a identidade da marca.

**Independent Test**: Pode ser testado visualmente renderizando uma galeria com `Button`, `Badge`, `Input` e `Card` e verificando ausência de `shadow-*`, cores em sintonia com a paleta `warm-*`, bordas `border-warm-border` de 1px e arredondamentos fiéis aos tokens.

**Acceptance Scenarios**:

1. **Given** um botão shadcn UI, **When** ele for renderizado na tela em suas variações (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`), **Then** deve exibir cores da paleta `warm-*`, raio de borda `rounded-xl`, tipografia `font-sans`, ausência completa de sombra (`shadow-none`) e micro-interações suaves de hover (150-200ms).
2. **Given** um componente `Card`, **When** ele for renderizado, **Then** deve usar fundo `bg-warm-card`, borda `border border-warm-border`, raio de borda `rounded-2xl`, texto `text-warm-charcoal` e zero `shadow`.
3. **Given** um `Badge`, **When** renderizado com variantes semânticas (nutrientes/kcal), **Then** deve ter formato `rounded-full`, cores de fundo pílula e texto correspondentes às especificações dos macronutrientes do NutriDiet.

---

### User Story 2 - Adequação dos Componentes Overlay & Dialogs (Priority: P2)

Como usuário do aplicativo, quero que diálogos, modais, gavetas laterais e menus suspensos (`dialog`, `sheet`, `dropdown-menu`, `popover`, `tooltip`) possuam overlay e containers alinhados à linguagem estética warm minimalist flat design do NutriDiet.

**Why this priority**: Componentes de sobreposição (Overlays, Modais e Menus) são fundamentais para fluxos de interação complexos e precisam de consistência visual para transmitir refinamento.

**Independent Test**: Abrir cada modal, sheet e dropdown menu e verificar se as superfícies usam `bg-warm-card` / `bg-warm-inner`, bordas `border-warm-border`, cantos `rounded-2xl` / `rounded-xl` e ausência de sombras com profundidade via contornos limpos.

**Acceptance Scenarios**:

1. **Given** o componente `Dialog` ou `Sheet`, **When** disparado pelo usuário, **Then** o backdrop deve ter fundo fosco/escuro limpo, o container principal deve possuir borda `border-warm-border`, cantos `rounded-2xl` e cabeçalhos com tipografia `Plus Jakarta Sans`.
2. **Given** os componentes `DropdownMenu` e `Popover`, **When** abertos, **Then** as opções devem ter raio `rounded-xl`, fundo `bg-warm-card`, estado hover `bg-warm-inner` e textos em `text-warm-charcoal` / `text-warm-secondary`.

---

### User Story 3 - Padronização dos Componentes de Dados e Layout (Priority: P3)

Como usuário navegando em dados nutricionais, quero que tabelas, abas e áreas de rolagem (`table`, `tabs`, `scroll-area`, `select`) apresentem separadores, estados ativos e cabeçalhos 100% integrados às diretrizes estéticas do NutriDiet.

**Why this priority**: Tabelas e abas exibem a informação nutricional crítica da dieta. Sua legibilidade e estética plana facilitam o consumo dos dados pelo nutricionista ou paciente.

**Independent Test**: Renderizar uma tabela de alimentos com `Table` e navegar entre abas de refeições com `Tabs`, confirmando o uso de `border-warm-border`, abas ativas com `bg-warm-card` + `text-warm-charcoal`, e cabeçalhos de tabela claros.

**Acceptance Scenarios**:

1. **Given** o componente `Tabs`, **When** alterando entre abas, **Then** a lista de abas deve ter fundo `bg-warm-inner` com cantos `rounded-xl`, e a aba ativa deve ter `bg-warm-card`, `text-warm-charcoal` e contorno suave.
2. **Given** o componente `Table`, **When** exibindo dados de alimentos, **Then** as linhas devem ter divisores `border-warm-border`, cabeçalhos em `text-warm-muted` / `text-warm-secondary` e zebra striping opcional em `bg-warm-inner`.

---

### Edge Cases

- Como o sistema se comporta quando uma prop customizada `className` é passada para um componente shadcn refatorado? A classe customizada deve mesclar perfeitamente via `cn()` sem sobrescrever acidentalmente as regras invioláveis de tokens semânticos a menos que explicitamente solicitado.
- O que ocorre quando o tema for escuro ou ajustado no futuro? As variáveis de cor continuam ancoradas na paleta tokenizada em `globals.css` / `tailwind.config.js`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST adequar todos os 14 componentes shadcn atualmente instalados em `src/components/ui/` (`badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `popover`, `scroll-area`, `select`, `separator`, `sheet`, `table`, `tabs`, `tooltip`) às diretrizes do Design System NutriDiet.
- **FR-002**: O sistema MUST aplicar a regra Swiss Flat (`box-shadow: none` e `background-image: none`) a todos os componentes shadcn refatorados.
- **FR-003**: O sistema MUST utilizar a escala estrita de arredondamentos do NutriDiet: `rounded-2xl` para Cards/Modais, `rounded-xl` para Botões/Inputs/Menus, e `rounded-full` para Badges/Pílulas.
- **FR-004**: O sistema MUST utilizar as cores semânticas da paleta `warm-*` (`warm-bg`, `warm-card`, `warm-inner`, `warm-border`, `warm-borderDark`, `warm-charcoal`, `warm-secondary`, `warm-muted`, `warm-emerald`, `warm-rose`, `warm-amber`, `warm-teal`, `warm-terracotta`).
- **FR-005**: O sistema MUST aplicar a hierarquia tipográfica correta: `Plus Jakarta Sans` (`font-display` / `font-sans`) para títulos e métricas, e `Inter` (`font-body`) para conteúdos corridos e rótulos.
- **FR-006**: O sistema MUST manter a compatibilidade completa das APIs e props originais do Radix UI / shadcn UI em cada componente para que nenhum componente consumidor quebre.
- **FR-007**: O sistema MUST garantir acessibilidade WCAG AAA / AA em todos os contrastes de texto e estados de foco (`focus-visible:ring-warm-borderDark`).

### Key Entities

- **NutriDiet Design Tokens**: Conjunto de tokens de design em 3 camadas (Primitivos ➔ Semânticos ➔ Componentes) definidos em `design-system/nutridiet/TOKENS_MASTER.md` e configurados no `tailwind.config.js`.
- **Shadcn UI Base Components**: Coleção de 14 componentes React em `src/components/ui/` construídos sobre Radix UI e estilizados via Tailwind CSS e `class-variance-authority`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 14 componentes shadcn em `src/components/ui/` utilizam exclusivamente tokens de cor `warm-*` e raios de borda tokenizados (`rounded-2xl`, `rounded-xl`, `rounded-full`).
- **SC-002**: Zero ocorrências de classes de sombra padrão Tailwind (`shadow`, `shadow-sm`, `shadow-md`, `shadow-lg`) nos componentes refatorados em `src/components/ui/`.
- **SC-003**: 100% de compatibilidade com a suite de testes e build do Next.js sem erros de TypeScript ou quebras de importação.
- **SC-004**: Todas as combinações de cores de texto e fundo nos componentes atendem ao contraste mínimo de 4.5:1 exigido pelo padrão WCAG AA.

## Assumptions

- Todos os componentes instalados em `src/components/ui/` importam o utilitário `cn` de `@/lib/utils`.
- O arquivo `tailwind.config.js` já possui as extensões de cores `warm` e raios de borda mapeados conforme o `TOKENS_MASTER.md`.
- Lucide React é a biblioteca oficial de ícones adotada no projeto.
