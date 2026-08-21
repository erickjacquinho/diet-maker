# Feature Specification: Merge Seletivo de Componentes Similares

**Feature Branch**: `merge-componentes-similares`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: Planejar e executar, em etapa posterior, um merge seletivo de componentes React similares no src/components, usando composição e preservando os contratos do design system. Os candidatos principais são o alias deprecated de Input, a relação entre AdjustDietGoalsModal e AutoKcalSection, os fragmentos compartilhados entre MealItemRow e RecipeIngredientRow, entre CreatePatientModal e EditPatientModal, e entre FoodSearchModal e CreateRecipeModal. Também deve ser revisada a possível redundância entre atoms/Badge e ui/badge. Componentes com diferenças reais de domínio ou fluxo devem permanecer separados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consolidar comportamentos comuns sem ampliar o escopo (Priority: P1)

Como pessoa mantenedora do produto, quero classificar cada par de componentes similares e consolidar somente o comportamento realmente comum, para reduzir duplicação sem criar APIs genéricas difíceis de entender.

**Why this priority**: A decisão correta de fronteira é o principal valor do trabalho. Um merge excessivo pode apagar diferenças de domínio, enquanto nenhum compartilhamento mantém custo de manutenção duplicado.

**Independent Test**: Revisar a matriz de candidatos e verificar que cada candidato possui uma decisão explícita, uma justificativa baseada em responsabilidade e uma forma de reutilização compatível com seu domínio.

**Acceptance Scenarios**:

1. **Given** os candidatos identificados no inventário, **When** a decisão de composição for registrada, **Then** cada candidato será classificado como merge direto, compartilhamento de unidade interna, manutenção separada ou remoção de alias deprecated.
2. **Given** componentes com responsabilidades públicas diferentes, **When** a unidade comum for extraída, **Then** as entradas públicas, ações específicas e estados próprios de cada domínio permanecerão preservados.
3. **Given** os primitivos existentes em `src/components/ui`, **When** o compartilhamento for implementado, **Then** os primitivos continuarão genéricos e suas APIs não receberão regras de domínio.

---

### User Story 2 - Preservar os fluxos de nutrição e cadastro (Priority: P1)

Como pessoa usuária do NutriDiet, quero continuar editando metas, refeições, receitas, pacientes e alimentos com os mesmos valores, validações, estados e ações, para que a reorganização interna não altere o trabalho diário.

**Why this priority**: O benefício da redução de duplicação não pode vir acompanhado de regressões em cálculos nutricionais, edição de dados ou busca de alimentos.

**Independent Test**: Executar os fluxos de metas de dieta, linha de refeição, ingrediente de receita, criação/edição de paciente e busca TACO, comparando resultados, mensagens, estados e ações antes e depois da mudança.

**Acceptance Scenarios**:

1. **Given** uma pessoa editando proteína, carboidrato e gordura, **When** os valores forem alterados em qualquer fluxo de metas aplicável, **Then** o total energético calculado, a validação e o modo somente leitura continuarão coerentes.
2. **Given** uma linha de refeição ou ingrediente de receita, **When** quantidade, macros, remoção ou ordenação forem manipuladas, **Then** cada fluxo manterá suas ações específicas e exibirá os mesmos valores nutricionais.
3. **Given** a criação ou edição de um paciente, **When** campos de identidade forem preenchidos, salvos, invalidados ou descartados, **Then** o fluxo correspondente manterá suas regras de rascunho, objetivos, confirmação e descarte.
4. **Given** uma busca de alimento TACO dentro de um modal ou do formulário de receita, **When** a busca estiver carregando, sem resultados, com erro ou com um alimento selecionado, **Then** os estados e a seleção continuarão equivalentes sem misturar os fluxos públicos.

---

### User Story 3 - Manter rastreabilidade e conformidade do sistema visual (Priority: P2)

Como pessoa responsável pelo design system, quero que as decisões de merge e as mudanças de componentes sejam refletidas no catálogo, nos perfis e nas validações do projeto, para que a arquitetura continue auditável.

**Why this priority**: O catálogo é a fonte de verdade para camadas, categorias, estados e contratos. Sem sua atualização, o código e a documentação podem divergir mesmo que os fluxos funcionem.

**Independent Test**: Conferir os registros de componentes afetados, executar as validações de Atomic Design e do design system e revisar a evidência de testes dos fluxos impactados.

**Acceptance Scenarios**:

1. **Given** uma mudança de componente ou de unidade compartilhada, **When** o catálogo for atualizado, **Then** IDs, camadas, fontes, exports, status e perfis afetados permanecerão consistentes com o código.
2. **Given** a remoção do alias deprecated de `Input`, **When** a validação de referências for executada, **Then** não haverá importação residual do alias e a entrada canônica continuará disponível.
3. **Given** os testes e validadores do projeto, **When** a entrega for validada, **Then** não serão introduzidas violações de Atomic Design, tokens, acessibilidade ou preservação de primitivos.

### Edge Cases

- Um componente candidato pode compartilhar markup e estados visuais, mas ter ações, tipos de dados ou regras de ciclo de vida diferentes; nesse caso somente a unidade interna comum deve ser compartilhada.
- Alterações de macros podem receber valores vazios, inválidos, zero ou combinações que alterem o total energético; os mesmos limites e mensagens devem ser preservados.
- Modais devem continuar acessíveis por teclado, com foco visível, nome/role/value corretos e retorno de foco após fechamento.
- Buscas TACO devem manter estados de carregamento, lista vazia, erro, seleção e fechamento sem duplicar contratos públicos de modal.
- A edição de paciente pode conter alterações não salvas; descartar ou cancelar deve continuar exigindo a confirmação prevista pelo fluxo.
- A remoção do alias `Input` somente pode ocorrer depois de confirmar que nenhum import público ou teste depende dele.
- Uma aparente duplicação entre `atoms/Badge` e `ui/badge` pode ser um wrapper intencional; a decisão deve respeitar o contrato de camada antes de remover qualquer export.
- Diferenças reais entre `MetricBox` e `MacroMetricCard`, `RecipeCard` e `MealCardContainer`, `DataTable` e organismos de tabela, ou `SidebarNav` e suas partes compound não devem ser apagadas por semelhança superficial.
- Se a composição de um candidato introduzir regressão, a mudança desse candidato deve poder ser isolada e revertida sem desfazer decisões já validadas nos demais candidatos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O trabalho MUST manter um inventário dos candidatos e registrar, para cada um, a motivação, a decisão de merge ou separação, os riscos e os arquivos afetados.
- **FR-002**: O sistema MUST ter uma única entrada canônica para o comportamento de `Input`, removendo o alias deprecated somente após confirmar a inexistência de dependências válidas e atualizar suas referências.
- **FR-003**: O comportamento comum de edição de metas e cálculo energético entre `AdjustDietGoalsModal` e `AutoKcalSection` MUST ser composto de forma que valores, validações, modo somente leitura e cálculo permaneçam consistentes.
- **FR-004**: As unidades compartilhadas entre `MealItemRow` e `RecipeIngredientRow` MUST limitar-se às partes realmente comuns, mantendo distintas as ações de ordenação, edição, remoção e os contratos de cada domínio.
- **FR-005**: Os campos de identidade compartilhados entre `CreatePatientModal` e `EditPatientModal` MUST preservar separadamente criação, edição, rascunho, objetivos, confirmação e descarte.
- **FR-006**: A busca TACO compartilhada entre `FoodSearchModal` e `CreateRecipeModal` MUST reutilizar os estados e elementos comuns sem fundir os modais nem alterar seus contratos públicos.
- **FR-007**: A relação entre `atoms/Badge` e `ui/badge` MUST ser revisada contra as regras de camadas, categorias e exports; a solução final MUST remover redundância apenas se não houver perda de contrato.
- **FR-008**: O trabalho MUST manter separados `MetricBox` e `MacroMetricCard`, `RecipeCard` e `MealCardContainer`, `DataTable` e organismos de tabela, e `SidebarNav` e suas partes compound, salvo nova evidência objetiva de responsabilidade comum.
- **FR-009**: Nenhuma solução MUST criar um modal universal baseado em uma proliferação de boolean flags nem mover regras de domínio para `src/components/ui`.
- **FR-010**: Os componentes e unidades compartilhadas MUST preservar tokens canônicos, hierarquia Atomic Design, estados definidos, acessibilidade WCAG 2.2 AA e escopo desktop do produto.
- **FR-011**: O trabalho MUST incluir testes determinísticos para os fluxos afetados e verificações de regressão para cálculo, validação, busca, foco, teclado, estados vazios/erro e ações específicas de domínio.
- **FR-012**: O catálogo e os perfis do design system MUST refletir os exports, camadas, categorias, status de depreciação/remoção e unidades compartilhadas depois da mudança.
- **FR-013**: Cada candidato MUST ser implementado e validado como unidade independente, com uma estratégia de reversão localizada caso sua mudança altere um contrato ou cenário de aceitação.

### Key Entities

- **Candidato de componente**: Par ou grupo de componentes com possível duplicação, incluindo localização, responsabilidade, dependências, estados e decisão esperada.
- **Unidade compartilhada**: Fragmento de apresentação, estado ou interação reutilizado por mais de um componente sem absorver o domínio dos consumidores.
- **Contrato de componente**: Props, exports, estados, acessibilidade, camada Atomic Design e responsabilidade observáveis por consumidores e pelo catálogo.
- **Evidência de validação**: Resultado reproduzível de testes, auditorias, verificação do catálogo e revisão visual dos fluxos afetados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos candidatos priorizados possuem uma decisão registrada, justificativa, escopo de arquivos e evidência de validação antes da implementação ser considerada concluída.
- **SC-002**: Os cinco fluxos críticos de metas, refeições/ingredientes, paciente, busca TACO e input canônico concluem seus cenários de aceitação sem alteração observável nos valores, mensagens, ações ou estados esperados.
- **SC-003**: A validação final registra zero violações novas de Atomic Design, preservação de primitivos, tokens, acessibilidade e catálogo do design system.
- **SC-004**: Nenhum import válido permanece apontando para o alias deprecated de `Input`, e os consumidores usam a entrada canônica documentada.
- **SC-005**: Cada unidade extraída atende pelo menos dois consumidores reais ou é justificada como composição de um único contrato; não são criadas abstrações sem reutilização comprovada.
- **SC-006**: A revisão manual dos fluxos impactados confirma que teclado, foco, leitura semântica, estados de carregamento/vazio/erro e mensagens de validação permanecem equivalentes.
- **SC-007**: 100% dos candidatos priorizados podem ser validados e revertidos individualmente sem depender de mudanças ainda não validadas em outro candidato.

## Assumptions

- A análise de candidatos e a implementação serão realizadas no mesmo repositório e respeitarão os documentos normativos existentes em `design-system/` e `.agents/rules/`.
- O escopo inicial é desktop a partir de 1024px; mobile, tablet e dark mode continuam fora do escopo.
- A remoção do alias deprecated é permitida porque a verificação atual não encontrou consumidores de produção, mas a decisão final deve ser confirmada novamente durante a implementação.
- O trabalho pode criar unidades internas ou wrappers de domínio quando isso reduzir duplicação sem alterar os exports públicos necessários.
- Planos aprovados serão executados posteriormente por `/speckit-implement`; esta especificação não declara a implementação como concluída.
