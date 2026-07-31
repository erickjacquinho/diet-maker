# Research: Regras Visuais por Categoria de Componentes

## Decision 1 — Dois eixos independentes

**Decision**: Manter Atomic Design e categoria visual como classificações ortogonais.

**Rationale**: Atomic Design responde responsabilidade, dependências e localização; categoria visual responde aparência, estados e comportamento. Componentes em camadas diferentes podem compartilhar a mesma categoria sem violar a arquitetura.

**Alternatives considered**:

- Organizar regras visuais apenas por atoms/molecules/organisms: rejeitado porque mistura complexidade estrutural com função visual.
- Abandonar Atomic Design e organizar tudo por função: rejeitado porque elimina limites arquiteturais já adotados.

## Decision 2 — Uma categoria principal e traits limitados

**Decision**: Cada componente possui exatamente uma categoria visual principal e pode declarar traits adicionais incapazes de sobrescrever a categoria.

**Rationale**: Uma única fonte principal torna herança e auditoria determinísticas. Traits cobrem capacidades transversais, como destructive ou nutritional-macro, sem criar múltipla herança conflitante.

**Alternatives considered**:

- Múltiplas categorias com igual prioridade: rejeitado por exigir resolução de precedência.
- Proibir traits: rejeitado porque forçaria duplicação ou categorias combinatórias.

## Decision 3 — Taxonomia mínima por função visual

**Decision**: Adotar onze categorias iniciais: actions, fields, selection, navigation, surfaces, data-display, feedback, overlays, loading, nutrition-domain e structure.

**Rationale**: O conjunto cobre os componentes atuais e separa funções com anatomia, estados e acessibilidade materialmente diferentes. A taxonomia pode evoluir somente pelo processo de CategoryDecision.

**Alternatives considered**:

- Uma categoria por componente atual: rejeitado porque não orienta componentes futuros.
- Poucas categorias genéricas como interactive/display/layout: rejeitado porque deixaria decisões relevantes em aberto.

## Decision 4 — Autoria category-first

**Decision**: Especificar e homologar categorias antes de criar ou validar perfis individuais.

**Rationale**: Se os perfis forem escritos primeiro, peculiaridades e estilos legados do código atual contaminam regras que deveriam ser reutilizáveis e futuras.

**Alternatives considered**:

- Inventariar e documentar cada componente primeiro: rejeitado por favorecer duplicação e preservação acidental do design antigo.
- Escrever categorias e perfis simultaneamente: rejeitado porque dificulta saber qual documento é fonte de cada regra.

## Decision 5 — Registro estruturado mais documentação legível

**Decision**: Usar um registro estruturado para identidade e relações, mantendo categorias e perfis em Markdown normativo.

**Rationale**: O registro permite auditoria determinística; Markdown permite contratos compreensíveis e revisáveis. O validador garante correspondência entre os dois.

**Alternatives considered**:

- Somente Markdown: rejeitado porque parsing de inventário e unicidade seria frágil.
- Somente dados estruturados: rejeitado porque reduziria clareza de anatomia, decisões e exemplos.

## Decision 6 — Cobertura por fonte e símbolo público

**Decision**: Medir cobertura em dois níveis: arquivos atuais descobertos e símbolos públicos declarados.

**Rationale**: Um arquivo pode exportar compound parts ou reexports. Cobrir apenas arquivos esconderia APIs públicas; cobrir apenas símbolos perderia arquivos órfãos ou mal registrados.

**Alternatives considered**:

- Uma ficha obrigatória por arquivo: rejeitado porque compound families e reexports não são sempre um-para-um.
- Uma ficha por export: rejeitado porque fragmentaria famílias como Dialog, Select, Card e Table.

## Decision 7 — Perfis individuais enxutos

**Decision**: Perfis contêm identidade, categoria, anatomia específica, variantes permitidas, estados particulares, composição, exceções e aceite; não repetem tabelas compartilhadas.

**Rationale**: Reduz divergência, torna mudanças de categoria propagáveis e mantém visível somente o que diferencia o componente.

**Alternatives considered**:

- Ficha completa autossuficiente para cada componente: rejeitado por duplicação e alto custo de sincronização.
- Somente registro sem ficha: rejeitado porque anatomia e composição específicas ficariam implícitas.

## Decision 8 — Exceções formais e temporariamente revisáveis

**Decision**: Toda divergência exige motivo, escopo, impacto, aprovação, data de revisão e decisão sobre generalização.

**Rationale**: Exceções invisíveis viram novos padrões acidentais. Revisão explícita permite incorporar recorrência à categoria ou remover a diferença.

**Alternatives considered**:

- Proibir todas as exceções: rejeitado por impedir necessidades reais sem criar categoria artificial.
- Permitir exceção narrativa livre: rejeitado por não ser auditável.

## Decision 9 — Auditoria determinística sem dependência nova

**Decision**: Implementar validação com runtime e bibliotecas já presentes no projeto, saída ordenada e classes de finding estáveis.

**Rationale**: O catálogo é local e pequeno; dependência adicional não entrega benefício proporcional. Saída determinística facilita testes e revisão.

**Alternatives considered**:

- Validação apenas por revisão humana: rejeitado por não impedir regressão silenciosa.
- Plataforma externa de design system: rejeitado por ampliar escopo, custo e dependências.

## Decision 10 — Sincronização das fontes históricas como gate

**Decision**: Atualizar constituição e roteadores para refletir o guia canônico antes da homologação.

**Rationale**: A constituição atual contém zero sombra absoluto e target de 44px, enquanto o guia vigente permite sombra de overlay e controles desktop de 32/36px sob WCAG 2.2 AA. Manter ambos ativos invalidaria a ideia de fonte única.

**Alternatives considered**:

- Ignorar a constituição: rejeitado porque continuará sendo consumida por workflows Spec Kit.
- Reverter o guia novo para a constituição histórica: rejeitado porque contradiz as decisões atuais aprovadas e o roteamento de `AGENTS.md`.

## Decision 11 — Separar catálogo, telas e migração

**Decision**: Este escopo termina na homologação documental e nos validadores.

**Rationale**: Telas tratam composição contextual; migração trata alteração do código. Separar os três permite validar a fonte normativa antes de usá-la para implementação.

**Alternatives considered**:

- Documentar e migrar simultaneamente: rejeitado porque decisões poderiam ser tomadas no código antes de serem normatizadas.
- Incluir telas neste SDD: rejeitado porque adicionaria um segundo subsistema independente e ampliaria excessivamente a validação.

