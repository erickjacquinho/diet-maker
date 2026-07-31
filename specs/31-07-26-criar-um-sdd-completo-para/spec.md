# Feature Specification: Migração integral para o Design System canônico

**Feature Branch**: `31-07-26-criar-um-sdd-completo-para`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "Criar um SDD que cubra todas as etapas para substituir o design system legado pelo novo, com validação em todas as etapas para garantir a exclusão do legado e a implementação do novo."

## Contexto

O catálogo documental canônico em `design-system/` já define tokens, tipografia, geometria, estados, categorias visuais, perfis individuais, Atomic Design, Shadcn UI e governança. O código executável ainda contém o sistema visual anterior em tokens TypeScript, CSS global, aliases Tailwind, receitas locais e classes espalhadas pelas rotas e componentes.

Esta especificação cobre a migração completa do código executável para o sistema canônico. A entrega não cria uma nova linguagem visual, não altera regras de domínio nutricional e não transforma referências históricas em fontes ativas.

## Escopo

Incluído:

- runtime de tokens, text styles, recipes e tipos compartilhados;
- `src/app/globals.css`, `tailwind.config.js` e aliases Shadcn;
- 14 primitivos em `src/components/ui`;
- 6 atoms, 14 molecules, 3 organisms e 2 templates atuais;
- layouts e 10 rotas em `src/app`, incluindo `/design-system`;
- atualização do registry para refletir o estado real da migração;
- testes unitários, de interação, acessibilidade, visuais, links e auditorias de legado;
- remoção das fontes executáveis antigas e bloqueio contra reintrodução.

Excluído:

- `refs/UI/`, `refs/UI/design-system-prd/` e `demo_dashboard.html`, que permanecem históricos e não normativos;
- redesign de fluxos, alteração de regras de negócio ou mudança de contratos de dados;
- suporte mobile, tablet ou dark mode;
- criação de novos componentes sem necessidade comprovada pelo registry;
- migração de documentação histórica que não é consumida pelo build ou runtime.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Adotar a fundação canônica em runtime (Priority: P1)

Como mantenedor do projeto, quero que tokens, tipografia, receitas, aliases e estilos globais sejam derivados exclusivamente do Design System canônico para que todos os componentes tenham uma única base visual.

**Why this priority**: Sem uma fundação única, qualquer migração posterior apenas desloca decisões legadas entre arquivos.

**Independent Test**: A fundação pode ser validada sem migrar uma tela: os exports de tokens/text styles/recipes existem, o build e os testes de contrato passam, e a auditoria encontra zero referência legada dentro dos arquivos da fundação.

**Acceptance Scenarios**:

1. **Given** a baseline de tokens e aliases antigos, **When** a fundação canônica é ativada, **Then** cada alias ativo aponta para um token semântico permitido e nenhum alias legado continua exportado.
2. **Given** um texto ou recipe inválido, **When** ele é usado fora do conjunto fechado, **Then** o contrato de tipos/testes rejeita a decisão sem criar uma exceção local.
3. **Given** `globals.css` e Tailwind configurados, **When** o gate da fundação é executado, **Then** não há reset visual global proibido, dark mode ativo, fonte legada, radius proibido ou valor visual arbitrário.

### User Story 2 - Migrar primitivos Shadcn e atoms (Priority: P1)

Como desenvolvedor, quero que os primitivos `ui` e atoms consumam as recipes e text styles canônicos sem perder semântica, acessibilidade ou API pública para que todo componente composto herde regras corretas.

**Why this priority**: Molecules, organisms e páginas dependem desses componentes; migrá-los depois criaria retrabalho e inconsistência.

**Independent Test**: Cada primitivo e atom pode ser exercitado em seus estados aplicáveis, com teclado e foco, enquanto auditorias de classes e tokens retornam zero legado nesses diretórios.

**Acceptance Scenarios**:

1. **Given** cada componente `src/components/ui`, **When** ele é migrado, **Then** sua API pública registrada permanece compatível ou tem mudança documentada, e sua aparência vem apenas da categoria/perfil correspondente.
2. **Given** Button, Input, Badge, Avatar, IconButton e ProgressBar, **When** estados default, hover, pressed, focus-visible, disabled, loading, error, empty e read-only aplicáveis são testados, **Then** todos seguem a matriz da categoria sem valores locais.
3. **Given** um primitive Shadcn genérico, **When** ele é usado por um componente de domínio, **Then** o primitive não recebe conhecimento nutricional nem regra de página.

### User Story 3 - Migrar molecules, organisms e templates (Priority: P1)

Como usuário do produto, quero que componentes compostos mantenham sua função atual enquanto herdam a nova hierarquia visual, para que navegação, contexto nutricional, overlays e shells tenham comportamento consistente.

**Why this priority**: Esses componentes concentram composição, dependências Atomic e maior risco de propagação de classes legadas.

**Independent Test**: Cada família composta pode ser renderizada com seus estados reais, validada contra seu perfil e executada sem importação ascendente, token local ou visual legado.

**Acceptance Scenarios**:

1. **Given** uma molecule ou organism atual, **When** sua categoria e perfil são aplicados, **Then** shared rules continuam na categoria e particularidades continuam apenas no perfil/recipe.
2. **Given** os componentes com `migration-required` no registry, **When** a etapa termina, **Then** `currentLayer`, `targetLayer`, dependências e lifecycle ficam coerentes com o código e o registro atualizado.
3. **Given** Dialog, Sheet, Popover, Select, Sidebar e modais nutricionais, **When** foco, dismissal, loading, error e read-only são exercitados, **Then** a acessibilidade e as camadas canônicas permanecem corretas.

### User Story 4 - Migrar todas as rotas e o catálogo visual (Priority: P1)

Como usuário do NutriDiet, quero que todas as telas acessíveis apresentem a mesma linguagem visual sem regressão funcional, incluindo a rota de demonstração do Design System.

**Why this priority**: O sistema só está efetivamente adotado quando nenhuma rota continua servindo o estilo anterior.

**Independent Test**: Uma matriz de rotas visita cada `page.tsx`, executa fluxos críticos, verifica console/erros de runtime, acessibilidade e ausência de padrões legados no arquivo e no DOM renderizado.

**Acceptance Scenarios**:

1. **Given** cada rota existente, **When** ela é migrada, **Then** não importa diretamente um primitive para inventar uma variante local quando existe um wrapper/recipe catalogado.
2. **Given** a rota `/design-system`, **When** ela é aberta, **Then** ela demonstra somente tokens, text styles, recipes, estados e componentes canônicos, sem apresentar tokens antigos como atuais.
3. **Given** uma rota com dados vazios, erro, loading ou modal, **When** esses estados são acionados, **Then** a tela usa a categoria correta e mantém o comportamento de domínio existente.

### User Story 5 - Remover e bloquear definitivamente o legado (Priority: P1)

Como mantenedor, quero que o legado seja removido e que qualquer reintrodução falhe automaticamente para que a migração não dependa de revisão manual permanente.

**Why this priority**: Sem um bloqueio final, o projeto pode voltar gradualmente às regras antigas mesmo após a migração.

**Independent Test**: A auditoria final executa buscas negativas, valida registry, roda build/testes/links/lint/type-check e falha ao inserir qualquer padrão legado controlado em uma fixture.

**Acceptance Scenarios**:

1. **Given** um padrão legado como `warm-*`, `rounded-xl`, `font-black`, `text-[...]`, `transition-all`, hex visual ou breakpoint mobile, **When** ele é introduzido em código executável, **Then** o gate falha identificando arquivo, linha e regra.
2. **Given** todos os arquivos migrados, **When** as fontes antigas e aliases incompatíveis são removidos, **Then** nenhuma importação, export, configuração ou variável CSS legada permanece no build.
3. **Given** o registry, categorias e perfis, **When** a auditoria final é executada, **Then** todos os componentes atuais estão em estado documentado de migração/conformidade e nenhuma proposta é apresentada como implementada.

### User Story 6 - Homologar a migração com evidência reproduzível (Priority: P2)

Como revisor, quero uma evidência por etapa e por rota para aprovar a substituição sem depender de inspeção subjetiva ou memória do sistema anterior.

**Why this priority**: Evidência estruturada permite revisar, reverter uma etapa isolada e demonstrar que o legado foi realmente eliminado.

**Independent Test**: O checklist de migração reproduz os comandos e cenários de cada etapa em uma máquina limpa e gera resultado determinístico.

**Acceptance Scenarios**:

1. **Given** um checkpoint de etapa, **When** seus comandos são executados, **Then** o relatório identifica contagem de fontes migradas, findings, testes e padrões legados restantes.
2. **Given** uma regressão visual ou de acessibilidade, **When** o gate falha, **Then** a etapa não é homologada e o próximo grupo de componentes não pode avançar.
3. **Given** a conclusão de todas as etapas, **When** a revisão independente é executada, **Then** a evidência confirma zero legado e cobertura de todas as rotas/componentes definidos no escopo.

### Edge Cases

- Valores dinâmicos de gráfico, progresso, virtualização e posicionamento Radix permanecem permitidos apenas quando representarem dados/medição e não cor, tipografia ou radius.
- Literais primitivos necessários ao arquivo canônico `src/design-system/tokens.css` são permitidos somente em declarações nomeadas reference; hex ou valores brutos repetidos em recipes, componentes, rotas ou configuração continuam sendo legado.
- Compound components e reexports devem preservar a família pública sem criar perfis duplicados ou importar uma camada superior.
- Macros continuam com cores semânticas próprias; tokens macro não podem ser substituídos por `primary` ou pelos tokens genéricos.
- Testes, fixtures, exemplos de documentação executável e a própria rota `/design-system` também entram na busca de legado quando forem consumidos pelo build/teste.
- Uma divergência encontrada em uma etapa bloqueia a etapa e mantém o último checkpoint aprovado; não se avança usando compatibilidade visual silenciosa.
- Se uma API pública precisar mudar, a mudança deve ser registrada no registry e coberta por teste de compatibilidade antes da remoção do alias antigo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST registrar uma baseline congelada de arquivos, exports, tokens, aliases, classes proibidas, rotas e configurações legadas antes da primeira migração.
- **FR-002**: Cada etapa MUST possuir um checklist de entrada, mudanças permitidas, validações, critério de aprovação e artefato de evidência.
- **FR-003**: A fundação runtime MUST expor tokens `reference (primitive) → semantic/system → component` alinhados a `design-system/03-token-architecture.md`, `04-color-system.md`, `05-typography-system.md`, `06-geometry-and-desktop-layout.md`, `07-icons-motion-and-layers.md` e `08-states-and-accessibility.md`.
- **FR-004**: O sistema MUST oferecer um conjunto fechado de text styles nomeados e rejeitar tamanhos, pesos, cores e tracking visuais arbitrários em consumidores.
- **FR-005**: Recipes MUST concentrar variantes, estados, geometria, borda, radius, motion e tokens de componentes sem permitir props visuais livres.
- **FR-006**: `globals.css` MUST conter somente regras globais autorizadas, importação da fundação, base do body e reduced motion.
- **FR-007**: Tailwind e aliases Shadcn MUST apontar exclusivamente para os tokens semânticos e escalas canônicas, sem dark mode ou aliases legados ativos.
- **FR-008**: Os primitivos em `src/components/ui` MUST permanecer genéricos, acessíveis e preservados como base; especializações MUST ocorrer em wrappers/filhos catalogados.
- **FR-009**: Cada um dos 39 componentes atuais MUST ser migrado conforme categoria, perfil, layer e consumers registrados.
- **FR-010**: As quatro propostas MUST permanecer distintas das fontes atuais e só podem ser implementadas com decisão e perfil válidos.
- **FR-011**: Todas as molecules, organisms e templates MUST respeitar dependências descendentes e os sete componentes `migration-required` MUST ter seu estado resolvido ou explicitamente documentado.
- **FR-012**: Todas as rotas e layouts em `src/app` MUST consumir componentes/recipes canônicos sem regras visuais locais proibidas.
- **FR-013**: `/design-system` MUST demonstrar o sistema atual, nunca tokens ou componentes legados.
- **FR-014**: A migração MUST preservar comportamento funcional, semântica HTML, contratos de dados, nomes acessíveis, teclado, foco e estados de domínio existentes.
- **FR-015**: O processo MUST atualizar `registry.json`, perfis e evidências de migração junto com cada grupo aprovado.
- **FR-016**: O processo MUST fornecer uma auditoria negativa que detecte padrões legados em TS/TSX/CSS/configuração e retorne findings acionáveis por arquivo e linha.
- **FR-017**: O gate MUST bloquear `warm-*`, paleta antiga, tokens CSS antigos, `rounded-xl/2xl/3xl/full` fora de exceção, `font-black/extrabold`, `text-[...]`, hex/valor visual local fora das declarações primitivas canônicas, `transition-all`, `z-[...]`, breakpoints mobile/tablet, shadows não autorizadas, fontes antigas e aliases duplicados.
- **FR-018**: Cada etapa MUST passar testes unitários/contratuais e type-check/lint/build aplicáveis antes da homologação.
- **FR-019**: Componentes interativos e rotas MUST possuir testes de teclado, foco, ARIA, estados, contraste e movimento reduzido aplicáveis.
- **FR-020**: A validação visual MUST comparar estados e telas migradas contra a especificação canônica e bloquear discrepâncias não justificadas.
- **FR-021**: Links documentais, registry, Atomic Design e preservação Shadcn MUST continuar passando os validadores existentes.
- **FR-022**: Cada checkpoint MUST ser reversível sem apagar dados de domínio ou misturar uma etapa parcialmente aprovada com a seguinte.
- **FR-023**: O encerramento MUST remover arquivos, exports, aliases e configurações que representem o sistema legado do código executável.
- **FR-024**: O encerramento MUST produzir zero ocorrência legada na auditoria e zero arquivo fora do registry entre as fontes públicas de componentes.
- **FR-025**: A migração MUST permanecer restrita à plataforma web desktop a partir de 1024px, sem criar mobile, tablet ou dark mode.
- **FR-026**: Nenhuma regra visual nova MUST ser adicionada a `refs/UI`, `demo_dashboard.html` ou outra fonte histórica durante a migração.

### Key Entities

- **MigrationBaseline**: snapshot imutável das ocorrências legadas, fontes, exports, rotas, configurações e contagens antes da migração.
- **TokenContract**: conjunto `reference (primitive) → semantic/system → component` com nomes, valores, aliases, consumidores autorizados e proibições.
- **TextStyleContract**: style nomeado com tamanho, line-height, peso, tracking, tone, uso permitido e substitutos proibidos.
- **ComponentRecipe**: receita de componente com variantes, estados, geometria, tokens, composição e API visual fechada.
- **MigrationCheckpoint**: etapa, arquivos cobertos, pré-condições, validações executadas, findings, resultado e commit/checkpoint reversível.
- **LegacyFinding**: ocorrência legada com regra, arquivo, linha, severidade, etapa responsável e resolução.
- **RouteAcceptanceRecord**: rota, estados exercitados, componentes usados, acessibilidade, resultado visual e regressões funcionais.
- **ComponentMigrationRecord**: component ID, layer atual/alvo, categoria, status de implementação, consumers, exceções e evidência.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A baseline inicial lista 100% das ocorrências legadas detectáveis em `src`, Tailwind, CSS, configuração, testes executáveis e página `/design-system`, com contagem reproduzível.
- **SC-002**: Ao final, a auditoria negativa retorna zero ocorrências para cada regra legada definida em FR-017.
- **SC-003**: 100% dos 39 componentes atuais e 100% das rotas/layouts no escopo possuem registro de migração e evidência de validação.
- **SC-004**: 100% dos textos de UI migrados usam um text style nomeado; nenhuma ocorrência de tamanho, peso, cor ou tracking visual arbitrário permanece em código executável.
- **SC-005**: 100% dos primitivos, atoms e componentes interativos migrados passam os testes aplicáveis de teclado, foco, ARIA e estados sem regressão funcional conhecida.
- **SC-006**: `npm test`, `npm run type-check`, `npm run lint`, `npm run build`, `npm run verify:links`, `npm run verify:design-system` e a auditoria de legado passam no checkpoint final.
- **SC-007**: Todas as rotas do inventário são renderizadas sem erro de runtime e sem discrepância visual não aprovada nos estados críticos definidos por suas categorias.
- **SC-008**: A página `/design-system` demonstra 100% do vocabulário canônico necessário e nenhuma referência ao sistema anterior.
- **SC-009**: Nenhum arquivo executável fora do registry contém export visual público sem perfil/categoria correspondente.
- **SC-010**: Cada checkpoint intermediário pode ser reexecutado em até 5 minutos para gerar o mesmo resultado de validação, sem depender de estado externo.
- **SC-011**: A auditoria final não registra alteração de comportamento de domínio, contrato de dados ou navegação que não esteja explicitamente documentada como necessária.
- **SC-012**: Após o último checkpoint, uma nova fixture contendo qualquer padrão legado listado em FR-017 falha automaticamente no CI/local gate.

## Assumptions

- Os artefatos em `refs/UI/` e `demo_dashboard.html` permanecem disponíveis como histórico, mas nunca são consultados pelo runtime nem tratados como fonte normativa.
- A API funcional e os dados existentes serão preservados; mudanças de API visual serão compatíveis ou terão migração documentada.
- O produto continua web desktop, com garantia de layout a partir de 1024px.
- O registry canônico e os perfis atuais são a fonte de classificação dos componentes; nenhum componente novo será criado apenas para facilitar a migração.
- A migração será executada em checkpoints independentes, com commits reversíveis e sem avançar após falha de gate.
- A validação visual usará estados representativos e revisão humana para diferenças que não possam ser verificadas somente por código.
