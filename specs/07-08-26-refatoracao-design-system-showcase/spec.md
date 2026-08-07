# Feature Specification: Showcase da Linha Visual e Design System

**Feature Branch**: `refatoracao-design-system-showcase`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "crie um /sdd de refatoraçao completo da pagina /design-system para que esta retrate apenas visualmente todos os tokens e componentes do projeto. como se fosse fazer um showcase da linah visual para um cliente. /ui-ux-pro-max /frontend-design"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação e Visualização dos Tokens de Design (Priority: P1)

Como um cliente ou stakeholder do projeto DietMaker, quero visualizar todos os tokens de design do sistema (cores, tipografia, espaçamentos, elevação e bordas) de forma puramente visual e elegante, para entender instantaneamente a identidade visual e coerência da marca.

**Why this priority**: Tokens são a base da identidade visual. Uma apresentação visual dos tokens (swatches de cores com verificação de contraste, espécimes de tipografia em tempo real e escalas de spacing/elevation) transmite profissionalismo imediato.

**Independent Test**: Pode ser testado acessando a aba/seção "Tokens de Design" na página `/design-system` e verificando a renderização visual das paletas de cores, escala tipográfica, sombras e espaçamentos.

**Acceptance Scenarios**:

1. **Given** que o cliente acessa `/design-system`, **When** ele visualiza a seção de Tokens de Cores, **Then** cada token (Reference, System, Component) é exibido como um swatch visual interativo contendo a cor, seu valor hexadecimal/HSL, token semântico e indicador de acessibilidade de contraste (WCAG AA/AAA).
2. **Given** que o usuário está na seção de Tipografia, **When** ele observa os estilos de texto, **Then** cada estilo tipográfico (page-title, section-title, card-title, body, metadata, overline, data-id) é exibido em tamanho real com espécimes de texto editáveis/interativos.
3. **Given** que o usuário navega na seção de Tokens Estruturais, **When** ele observa espaçamento e bordas, **Then** elementos visuais representam graficamente as réguas de padding/margin (`--space-*`) e os raios de curvatura (`--radius-*`).

---

### User Story 2 - Galeria Interativa de Componentes (Atoms, Molecules & Organisms) (Priority: P1)

Como um designer, desenvolvedor ou cliente, quero interagir com previews ao vivo de todos os componentes UI da aplicação categorizados por complexidade (Átomos, Moléculas e Organismos), variando seus estados (default, hover, active, loading, disabled, error) em tempo real.

**Why this priority**: A página anterior apenas listava nomes de arquivos JSON e receitas. Uma galeria viva com componentes montados permite validar a fidelidade e comportamento da UI para entrega a clientes.

**Independent Test**: Pode ser testado selecionando qualquer componente na galeria (ex: `Button`, `MetricBox`, `PatientBadgeHeader`, `DietModeSwitcher`) e alterando suas variantes/estados através de controles visuais (knobs/toggles).

**Acceptance Scenarios**:

1. **Given** que o usuário seleciona a categoria "Átomos", **When** clica em `Button` ou `Badge`, **Then** visualiza o componente real renderizado com matriz completa de variantes (primary, secondary, ghost, danger) e tons de macros (protein, carb, fat, kcal).
2. **Given** que o usuário seleciona a categoria "Moléculas", **When** inspeciona componentes como `MetricBox` ou `TacoSearchInput`, **Then** o componente responde às interações de hover, foco e preenchimento de teste.
3. **Given** que o usuário seleciona a categoria "Organismos", **When** visualiza o `DietModeSwitcher` ou `PatientBadgeHeader`, **Then** o organismo é exibido num container isolado com suporte a troca de tema (Dark/Light mode preview).

---

### User Story 3 - Filtro, Busca e Inspecção de Showcase para Cliente (Priority: P2)

Como um apresentador do projeto, quero buscar componentes por nome, filtrar por categoria ou tag e alternar entre a "Visão Apresentação" (apenas UI limpa e bonitas animações) e a "Visão Spec/Dev" (detalhes técnicos sob demanda), para adaptar a demonstração à audiência.

**Why this priority**: Permite que a página `/design-system` sirva tanto como um pitch deck/showcase visual atraente para clientes quanto como documentação técnica viva para desenvolvedores.

**Independent Test**: Pode ser testado utilizando a barra de busca da galeria, clicando em tags de filtro e alternando o modo de visualização ("Modo Cliente Showcase" vs "Modo Inspeção Técnica").

**Acceptance Scenarios**:

1. **Given** que o apresentador digita "Patient" na busca, **When** o filtro é aplicado, **Then** apenas os componentes relacionados a pacientes (ex: `PatientBadgeHeader`, `PatientListTable`, `DeletePatientModal`) são exibidos na tela.
2. **Given** que o apresentador ativa o "Modo Showcase Cliente", **When** navega pela página, **Then** elementos de código cru e JSONs técnicos são ocultados em favor de cards com estética premium, micro-animações suaves e visual em minerais escuros/glassmorphism.
3. **Given** que o usuário clica no botão "Inspecionar Token/Código", **When** o painel expansível abre, **Then** exibe os snippets de importação React e variáveis CSS correspondentes.

---

### Edge Cases

- O que acontece se um componente renderizar um modal (ex: `EditAssessmentModal` ou `FoodSearchModal`) dentro da página de showcase? O modal deve ser exibido em um container inline simulado (embedded sandbox frame) para não bloquear toda a viewport da página de showcase.
- Como o sistema lida com o modo escuro/claro? A página de showcase deve ter um seletor visual de tema em tempo real que altera os tokens CSS do container sem quebrar o layout da aplicação host.
- O que acontece com componentes com estados de carregamento (Skeleton / Spinner)? Devem ter um toggle "Simular Loading" para mostrar a transição de estado visual sem loops infinitos descontrolados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE refatorar a página `/design-system` em uma aplicação Showcase Visual viva, substituindo a exibição textual de dados brutos por componentes UI renderizados em tempo real.
- **FR-002**: O sistema DEVE organizar o showcase em 4 seções principais com navegação rápida (Header/Tabs): Overview da Marca & Visão Geral, Tokens Fundamentais (Cores, Tipografia, Spacing, Shadows), Catálogo Interativo de Componentes (Átomos, Moléculas, Organismos) e Exemplos de Telas Montadas (Composições).
- **FR-003**: A seção de Tokens de Cores DEVE exibir swatches de cores categorizados por Camadas de Tokens (Reference, System, Component), indicando nome do token, valor HSL/HEX e nível de contraste relativo (WCAG AA 4.5:1 / AAA 7:1).
- **FR-004**: A seção de Tipografia DEVE renderizar os estilos de texto canônicos (`page-title`, `page-subtitle`, `section-title`, `card-title`, `body-primary`, `body-secondary`, `metadata`, `overline`, `data-id`) permitindo alteração em tempo real do texto de amostra.
- **FR-005**: O Catálogo de Componentes DEVE fornecer um painel de controles (Playground / Knobs) para alterar props em tempo real (ex: `size`, `variant`, `tone`, `density`, `disabled`, `state`).
- **FR-006**: O sistema DEVE disponibilizar busca em tempo real com filtro por categoria (Átomos, Moléculas, Organismos, Layout) e tags de estado de ciclo de vida (`stable`, `proposed`, `migration-required`).
- **FR-007**: O sistema DEVE incluir um visualizador de composições completas (ex: mini-dashboards do paciente, cards de refeição montados), permitindo ao cliente visualizar como os átomos e moléculas se combinam na interface final do NutriDiet.
- **FR-008**: A interface DEVE seguir os princípios de design refinados de `/frontend-design` e `/ui-ux-pro-max`: tipografia expressiva com Inter/Outfit, paleta mineral dark sofisticada, bordas suaves, efeitos de glassmorphism sutis e micro-animações de hover/transição de 150-250ms.

### Key Entities

- **TokenSpec**: Representa um token de design (nome, valor CSS, categoria de camada [reference | system | component], par de uso e contraste).
- **ComponentShowcaseEntry**: Registro do componente no showcase (id, nome, categoria [atom | molecule | organism], descrição funcional, lista de variantes/props testáveis, componente React associado).
- **PlaygroundState**: Estado reativo dos knobs de teste de um componente no showcase (variante selecionada, tamanho, estado de interação, dados simulados de props).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos tokens de design cadastrados no sistema (Cores, Tipografia, Espaçamentos, Raios, Sombras) possuem representação visual gráfica interativa na página `/design-system`.
- **SC-002**: 100% dos componentes base (Button, Input, Badge, Avatar, Surface, MetricBox, etc.) possuem preview ao vivo e manipulável por variantes na galeria do showcase.
- **SC-003**: A busca e o filtro de componentes retornam resultados em menos de 100ms sem travamentos de renderização.
- **SC-004**: Pontuação de estética e experiência do cliente (Client WOW factor) atinge nível de design studio premium, sem elementos com visual genérico/AI slop ou textos cru de depuração.

## Assumptions

- A infraestrutura existente de tokens CSS em `src/app/globals.css` e as utilidades de receitas (`recipes`, `textStyle`) em `@/design-system` serão utilizadas diretamente para alimentar o showcase.
- O pacote de ícones `lucide-react` já instalado no projeto será utilizado nos controles visuais e sinalizações da galeria.
- Os componentes existentes em `src/components/` podem ser importados no showcase com dados mockados seguros para demonstração visual.
