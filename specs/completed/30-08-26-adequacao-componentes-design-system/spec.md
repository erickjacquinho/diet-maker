# Feature Specification: Adequação de componentes ao design system

**Feature Directory**: `specs/30-08-26-adequacao-componentes-design-system`
**Created**: 2026-08-30
**Status**: Draft — aguardando validação humana; nenhuma implementação autorizada por este documento
**Input**: “ok, crie o $sdd para adequar esses componentes citados”, após esclarecer que a adequação abrange componentes, documentação e cadastro, preservando as regras existentes do design system.

## User Scenarios & Testing

### User Story 1 - Contratos de componentes confiáveis (Priority: P1)

Como mantenedor, quero encontrar cada componente e parte pública citada com responsabilidade, categoria, fonte, contrato e consumidores coerentes, para reutilizar e revisar a interface sem interpretar regras contraditórias.

**Why this priority**: A ausência de cadastro e perfis incompletos impede distinguir código existente, contrato documentado e conformidade comprovada.
**Independent Test**: Revisar o inventário delimitado e seus perfis sem precisar executar jornadas clínicas; todas as relações devem ser verificáveis e cada diferença deve ter destino explícito.

**Acceptance Scenarios**:

1. **Given** uma família com implementações e fachadas legadas, **When** seu inventário é reconciliado, **Then** cada fonte tem papel real, cada export público tem responsável e nenhuma fachada é confundida com uma segunda implementação.
2. **Given** um perfil incompleto ou divergente, **When** é adequado, **Then** contém todas as seções exigidas, herda uma única categoria principal e referencia regras existentes sem inventar valores.
3. **Given** um filho compartilhado, **When** é revisado, **Then** sua responsabilidade autônoma ou vínculo a uma família fica explícito, sem criar ficha duplicada apenas para satisfazer o auditor.
4. **Given** uma contagem histórica do inventário, **When** é atualizada, **Then** a nova contagem deriva das fontes reais e da mesma regra de descoberta vigente.

### User Story 2 - Usar as jornadas existentes com apresentação canônica (Priority: P1)

Como nutricionista, quero buscar alimentos, receitas e refeições, escolher variações, consultar/importar prescrições e ler históricos de pacientes usando controles consistentes, sem perder funcionalidades ou alterar dados por causa da adequação visual.

**Why this priority**: Corrigir o cadastro sem corrigir desvios observáveis apenas documentaria inconsistências.
**Independent Test**: Exercitar cada família com dados sintéticos isolados, comparando resultados, eventos e estados com o contrato atual de domínio e com as regras visuais canônicas.

**Acceptance Scenarios**:

1. **Given** botões de ícone, **When** acionados por mouse ou teclado, **Then** mantêm nomes acessíveis, intenção semântica, foco e variantes previstas.
2. **Given** valores nutricionais disponíveis ou ausentes, **When** resumos e proporções são exibidos, **Then** seguem a ordem proteína → carboidrato → gordura → calorias, unidades e tokens oficiais, sem recalcular ou inventar dados.
3. **Given** busca ou seleção de categorias/variações, **When** a escolha muda, **Then** a seleção é anunciada e os mesmos resultados e callbacks são preservados.
4. **Given** um modal de importação, substituição ou consulta, **When** aberto e fechado, **Then** preserva título acessível, foco inicial/retorno, teclado, região de rolagem e caráter de consulta ou ação conforme sua responsabilidade existente.
5. **Given** histórico vazio, preenchido ou com detalhes expandidos, **When** a tabela é consultada, **Then** conserva cabeçalhos, unidades, associação de linhas e estados dentro da tabela canônica.
6. **Given** dados históricos com snapshots confirmados, **When** uma superfície somente leitura os apresenta, **Then** não cria rascunho, não altera origem, precisão ou energia armazenada.

### User Story 3 - Comprovar adequação sem alterar as regras (Priority: P2)

Como revisor, quero evidências reproduzíveis da conformidade e da preservação das fontes normativas, para aprovar a mudança sem depender apenas de uma auditoria automatizada verde.

**Why this priority**: As verificações devem detectar desvios, e não ser flexibilizadas para acomodá-los.
**Independent Test**: Conferir registros de comparação antes/depois, resultados de testes e auditorias, evidências visuais e matriz de rastreabilidade.

**Acceptance Scenarios**:

1. **Given** fundamentos, categorias, tokens e primitivos preservados, **When** o conjunto é validado, **Then** não há alteração dessas fontes atribuível à adequação.
2. **Given** avisos de composição e erros de cadastro conhecidos, **When** a entrega é concluída, **Then** nenhum permanece sem resolução verificável e nenhum foi escondido por exclusão ou relaxamento do auditor.
3. **Given** edição concorrente em arquivo compartilhado, **When** a execução detecta divergência, **Then** preserva a edição, atualiza a evidência e interrompe apenas a alteração conflitante para coordenação.
4. **Given** implementação apenas documentada, **When** o relatório é emitido, **Then** não declara conformidade ou aprovação humana antes dos testes e revisões correspondentes.

### Edge Cases

- Um nome de componente pode existir em caminho legado e atual; preservar contratos distintos até comprovar equivalência e migrar consumidores com segurança.
- Um filho sem perfil próprio pode ser parte legítima de família; documentar ownership, exports e fontes sem ampliar exclusões do auditor.
- Um perfil pode citar duas categorias como herança; apenas uma é principal, as outras são composição.
- Valores literais em prosa não provam defeito no código; confrontar cada ocorrência com a fonte canônica e corrigir a documentação sem mudar o token.
- Dados vazios, busca sem resultado, falha recuperável, seleção inválida, item removido do conjunto e valores nutricionais ausentes não podem virar números ou itens fictícios.
- Nomes longos, tabelas extensas, zoom e movimento reduzido devem preservar acesso às informações e ações.
- Um componente sem consumidor só pode ser removido após comprovar ausência de uso e de obrigação de compatibilidade; remover funcionalidade para eliminar um achado é proibido.
- Novos achados não relacionados que apareçam por mudanças concorrentes são registrados separadamente, não corrigidos silenciosamente nem declarados resolvidos.

## Requirements

### Functional Requirements

- **FR-001**: Delimitar e inventariar as onze famílias principais: IconButton, MacroProportionBar, CarbCyclingVariationPanel, FoodSearchCategorySelector, ReadyMealSearchResultsList, RecipeSearchResultsList, ImportPreviousDietModal, ReadOnlyDietModal, SubstituteFoodModal, PatientAssessmentsTable e PatientDietsTable.
- **FR-002**: Incluir a revisão dos filhos MacroSummary, ConsultationHistoryExpandedRow e PatientListTableRow e das composições consumidoras FoodSearchModal, DietModeSwitcher, PatientConsultationHistoryTable e PatientListTable, apenas no necessário para fechar os contratos dessas famílias.
- **FR-003**: Definir para toda fonte e export afetado identidade, responsabilidade, camada atual/alvo, categoria principal única, traits existentes, papel de implementação/reexport/parte composta, consumidores e estágio real.
- **FR-004**: Reconciliar o cadastro com o inventário real, sem duplicar implementações, esconder fontes ou alterar regras de descoberta; atualizar a contagem somente após reconciliar as fontes.
- **FR-005**: Completar perfis afetados conforme o contrato vigente, incluindo propósito, herança, anatomia, variantes, estados particulares, composição, conteúdo, exceções, consumidores, aceite e estado da implementação.
- **FR-006**: Eliminar descrições documentais que contradigam os tokens existentes e duplicações de valores visuais locais; não modificar os valores canônicos para corresponder ao texto ou ao componente.
- **FR-007**: Adequar os componentes às receitas existentes de ações, seleção, overlays, dados e domínio nutricional, seguindo a sequência usar → configurar → variar → compor → criar; não criar nova regra visual ou categoria.
- **FR-008**: Preservar contratos funcionais existentes de busca, seleção, importação, substituição, consulta e histórico; qualquer migração estrutural deve atualizar consumidores e compatibilidade na mesma entrega.
- **FR-009**: Preservar nomes/roles/valores acessíveis, teclado, foco, seleção anunciada, estados assíncronos aplicáveis e confirmação de ações destrutivas; estados não aplicáveis exigem justificativa semântica.
- **FR-010**: Usar a tabela canônica para dados tabulares afetados, mantendo estados internos, ordenação/seleção quando já disponíveis, expansão, cabeçalhos, chaves estáveis e semântica dos filhos.
- **FR-011**: Preservar ordem de macros, unidades, valores e precisão de domínio, distinguindo zero real de ausência; superfícies somente leitura não persistem nem recalculam snapshots.
- **FR-012**: Cobrir cada adequação com cenários de regressão anteriores à implementação, incluindo fluxo nominal, estados aplicáveis, acessibilidade e compatibilidade.
- **FR-013**: Produzir evidências reproduzíveis das auditorias, testes, build e inspeção visual das famílias afetadas, distinguindo conformidade documental de conformidade de código e revisão humana.
- **FR-014**: Resolver os achados e avisos delimitados sem reduzir rigor de validadores, aceitar exceções para passar gates, apagar cobertura válida ou remover funcionalidades usadas.
- **FR-015**: Preservar mudanças concorrentes; recapturar inventário e estado dos arquivos no início e no fechamento da implementação futura, registrando conflitos e novos achados fora de escopo.

### Non-Functional Requirements

- **NFR-001 — Fontes normativas preservadas**: Identidade visual, fundamentos, categorias, definições de traits, regras, tokens, estilos globais, schemas/contratos de auditoria e primitivos permanecem inalterados. Somente perfis/cadastro de componentes e código consumidor podem ser adequados às regras existentes.
- **NFR-002 — Plataforma e acessibilidade**: Aplicam-se os limites desktop e critérios de acessibilidade vigentes, inclusive teclado, foco, zoom e movimento reduzido. Não introduzir mobile, tablet ou dark mode.
- **NFR-003 — Dados e privacidade**: Não alterar schemas, persistência, cálculos, autenticação ou dados clínicos. Verificação usa dados sintéticos isolados; nenhum teste escreve no banco pessoal do usuário.
- **NFR-004 — Compatibilidade**: Não reduzir capacidades existentes nem degradar busca/listas extensas; preservar mecanismos já presentes de paginação/virtualização. Não introduzir dependência, serviço remoto ou redesign.
- **NFR-005 — Evidência**: Novos testes determinísticos residem em tests; não mudar globais compartilhados ou dados externos. Métricas históricas e resultados anteriores não substituem execução atual.
- **NFR-006 — Escopo da entrega**: Este SDD termina na validação humana. Implementação somente após aprovação e via speckit-implement; promoção de conformidade depende de evidência, não de existência de arquivo.

### Key Entities

- **Família de componente**: unidade pública com identidade, categoria, contrato, fontes e consumidores.
- **Parte composta**: fonte/export sob ownership de uma família, sem contrato visual independente duplicado.
- **Perfil documental**: especialização rastreável da categoria, sem redefinir fundamentos.
- **Achado de conformidade**: código, alvo, evidência, causa, resolução e verificação; não é prova automática de falha visual.
- **Baseline de execução**: retrato datado de fontes, relações, hashes e achados que permite preservar mudanças concorrentes.

### Scope and exclusions

Adequação compatível, não redesign. Perfis/cadastro podem refletir o contrato existente e a implementação migrada; isso não autoriza alterar fundamentos para legitimar divergências. Nenhuma evolução de dieta-db, migração de dados, nova funcionalidade clínica, mudança global de tokens/primitivos, nova categoria, relaxamento de auditoria, commit, publicação ou implementação pertence à criação deste SDD. Migrações arquiteturais gerais já previstas para outras famílias ficam fora, salvo conexão necessária e documentada com os alvos listados.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das famílias, fontes e partes públicas delimitadas têm ownership, categoria, contrato e consumidores verificáveis, sem duplicidade ou fonte órfã.
- **SC-002**: Zero seção obrigatória ausente e zero contradição entre perfis afetados e fundamentos/categorias vigentes.
- **SC-003**: 100% dos cenários de aceite das três jornadas passam, preservando resultados e dados das operações existentes.
- **SC-004**: Zero erro de conformidade e zero aviso de composição pendente no escopo; todos os gates globais são executados, e novos impedimentos fora de escopo são explicitamente separados, impedindo alegação de aprovação global.
- **SC-005**: Zero alteração da feature nas fontes protegidas e zero gravação de teste nos dados pessoais do usuário.
- **SC-006**: Todas as famílias afetadas possuem evidência visual e de teclado no desktop canônico, com nomes longos/estado vazio e estados pertinentes, sem perda de informação crítica.

## Contexto confirmado e dependências

- O usuário confirmou que a tarefa é adequar componentes e sua documentação/cadastro ao design system existente, não adaptar o sistema aos componentes.
- A auditoria observada em 2026-08-30 tem 17 achados (5 de perfil, 1 baseline, 9 fontes sem cobertura e 2 valores locais documentais) e a auditoria de tabelas tem 5 avisos. São evidências históricas, não metas numéricas fixas.
- Há trabalho concorrente em dietas e modais. A execução deve preservar seu comportamento atualizado e revalidar antes de editar.
- Os contratos vigentes do projeto resolvem aparência, arquitetura, plataforma e acessibilidade. Novas regras visuais, funcionalidades e migrações de dados estão explicitamente fora de escopo.

