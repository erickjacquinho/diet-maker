# Research: Adequação da Sidebar ao Design System

**Feature**: `06-08-26-adequar-sidebar-design-system`
**Date**: 2026-08-06

## Research Scope

Esta pesquisa usa as fontes normativas locais do repositório. Não foi necessário buscar uma fonte externa: o Design System já fixa a plataforma, tokens, anatomia, estados e fronteiras da sidebar.

## Findings and Decisions

### R1 — Fonte normativa para geometria e navegação

- **Decision**: Usar `design-system/components/categories/navigation.md` antes dos perfis individuais, seguido de `06-geometry-and-desktop-layout.md`, `07-icons-motion-and-layers.md` e `08-states-and-accessibility.md`.
- **Evidence**: A categoria fixa 224/64, item de 36px, icon-16, `nav-item`, `overline`, `subsection-title`, `body-small-strong`, `caption`, `aria-current`, foco 2px/offset 2 e topologia flat com grupos futuros.
- **Rationale**: Evita criar uma regra visual específica no perfil ou no componente que contradiga a categoria.
- **Alternatives considered**: Manter as classes atuais por compatibilidade visual; rejeitada porque `h-7`, `size-7`, espaçamentos locais e tipografia legal divergem da categoria.

### R2 — Borda do rail

- **Decision**: O rail esquerdo deve mapear sua borda para `border-divider` de 1px, com o lado direito sem borda duplicada; o item de navegação continua sem borda por padrão.
- **Evidence**: A tabela de tokens da categoria separa `rail` (`surface`/`border-divider`) de `item` (sem borda); a geometria limita bordas a 1px.
- **Rationale**: Resolve a ausência de separação do rail sem transformar links em controles com borda.
- **Alternatives considered**: Adicionar `border` a cada item; rejeitada pela matriz de estados e pela anatomia da categoria.

### R3 — Movimento reduzido

- **Decision**: Aplicar duração efetiva 0ms e remover transformações quando `prefers-reduced-motion: reduce`; manter o estado final, feedback de foco e conteúdo do tooltip/popover.
- **Evidence**: `07-icons-motion-and-layers.md` define o comportamento reduzido; `08-states-and-accessibility.md` proíbe remover outline sem substituição.
- **Rationale**: A preferência reduz movimento sem remover informação ou operação.
- **Alternatives considered**: Retirar todas as classes de transição somente do rail; rejeitada porque chevron, collapse, tooltip e popover também são superfícies de movimento.

### R4 — Ownership do pathname e da configuração

- **Decision**: Criar um adaptador em `src/app/navigation/SidebarNavigationAdapter.tsx`, dono de `usePathname` e da configuração flat de produção; `SidebarNav` recebe `pathname` e `navigationItems`.
- **Evidence**: A constituição exige fronteira `ui → atoms → molecules → organisms → templates → app`; o organismo atual importa `usePathname` e a aplicação é a camada que conhece o contexto de rota.
- **Rationale**: Mantém o organismo testável com fixtures, reduz dependência de Next.js e evita que `src/components/ui` receba domínio.
- **Alternatives considered**: Manter `usePathname` no organismo; rejeitada por acoplamento e pelo requisito explícito de adaptador. Fazer `AppLayoutShell` importar o adaptador; rejeitada porque faria um template conhecer uma camada app superior.

### R5 — Perfil sem callback e conta

- **Decision**: `onOpenAccount` transforma o perfil em uma entrada semântica de conta; quando ausente, o perfil é identidade não interativa. O menu/conteúdo da conta não faz parte desta feature.
- **Evidence**: A categoria navigation descreve o perfil como elemento que pode abrir navegação de conta e a matriz de controles exige que disabled não tenha eventos.
- **Rationale**: Remove a affordance falsa atual sem inventar um destino ou superfície de conta.
- **Alternatives considered**: Sempre renderizar um botão que não faz nada; rejeitada por no-op acessível e por cursor/hover enganoso. Transformar o perfil em link fixo; rejeitada porque não existe URL de conta aprovada.

### R6 — Ações locais sem handlers

- **Decision**: Salvar/Abrir permanecem visíveis e `disabled` quando seus callbacks faltam; cada control recebe uma descrição acessível com o motivo definido em `spec.md`.
- **Evidence**: `navigation.md` define estado disabled como sem eventos, legível e anunciado como indisponível; `08-states-and-accessibility.md` exige motivo quando necessário.
- **Rationale**: Preserva a previsibilidade visual da shell e comunica a limitação sem deixar botões no-op.
- **Alternatives considered**: Ocultar as ações; rejeitada porque a decisão do usuário foi mantê-las visíveis. Renderizar enabled sem handler; rejeitada por comportamento falso.

### R7 — Skip link

- **Decision**: `AppLayoutShell` expõe “Pular para o conteúdo principal” antes da navegação, com `href="#main-content"`; `<main id="main-content" tabIndex={-1}>` recebe o foco.
- **Evidence**: O Design System exige landmarks, ordem de foco e WCAG 2.2 AA; o shell atual não possui skip link.
- **Rationale**: Define um caminho curto e reproduzível para teclado sem alterar a ordem visual normal.
- **Alternatives considered**: Usar somente foco no primeiro link; rejeitada porque não pula a navegação persistente.

### R8 — Contrato de submenu

- **Decision**: Preservar grupos como tipo futuro; em expanded usar disclosure com `aria-expanded`; em collapsed usar surface acessível; não renderizar grupo vazio; subitem medir 36px.
- **Evidence**: A categoria autoriza `collapsible`, exige estado do grupo e define 36px para item; o SDD anterior já fixa topologia flat para produção.
- **Rationale**: Permite evolução sem mover as seis rotas atuais nem introduzir regra mobile.
- **Alternatives considered**: Remover grupos até existir uma necessidade de produto; rejeitada porque a migração atual já expõe o contrato e a feature precisa corrigir sua densidade e semântica.

### R9 — Evidência e gates

- **Decision**: Usar testes focados, `type-check`, lint, auditoria atômica, verificadores do Design System e validação manual desktop/reduced-motion.
- **Evidence**: Os gates existentes podem passar sem detectar clipping, nomes acessíveis, tokens de geometria ou movimento reduzido; o documento 13 exige evidência manual para conformidade visual.
- **Rationale**: Separa conformidade estrutural automatizável de homologação visual/assistiva.
- **Alternatives considered**: Declarar conformidade após os gates atuais; rejeitada explicitamente pelo requisito NFR-004.

## Resolved Unknowns

Não há decisões técnicas pendentes que bloqueiem o plano. Qualquer nova regra de copy de conta, reorganização de grupos ou atalho global deve abrir uma nova decisão/feature, pois não está autorizada pelos requisitos atuais.
