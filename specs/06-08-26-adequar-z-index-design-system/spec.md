# Feature Specification: Adequação da Hierarquia de Camadas

**Feature Branch**: [06-08-26-adequar-z-index-design-system]
**Created**: 2026-08-06
**Status**: Draft
**Input**: User request: "analise os componentes que usam z-index e crie um [$sdd](C:\\Users\\Jacques\\Skills\\sdd\\SKILL.md) de correçao para adequar todos ao design system"

## Context

O produto já possui uma escala canônica de camadas no Design System, mas o código combina tokens semânticos, valores numéricos crus e usos semanticamente inadequados. A feature deve registrar uma correção abrangente para os componentes e consumidores que usam z-index, preservando o comportamento de portais, foco, teclado, dismiss e acessibilidade fornecido pelos primitivos Radix/shadcn.

A especificação cobre a adequação dos usos existentes em src/, os testes que verificam classes de camada e a documentação normativa que atualmente apresenta divergências. A implementação posterior deve ser executada pelo fluxo /speckit-implement.

## Design System de referência

A escala normativa, definida em design-system/07-icons-motion-and-layers.md e refletida no tailwind.config.js, é:

- z-base: 0
- z-raised: 10
- z-sticky: 20
- z-navigation: 30
- z-dropdown: 40
- z-popover: 50
- z-overlay: 60
- z-modal: 70
- z-toast: 80
- z-tooltip: 90

Valores locais crus, classes z-[N] e style.zIndex fora da definição central são proibidos.

## Baseline auditado

A análise inicial dos componentes e consumidores encontrou 22 declarações de camada em src/, tests/ e tailwind.config.js:

- DialogOverlay usa z-overlay e DialogContent usa z-modal.
- TooltipContent usa z-tooltip.
- PopoverContent usa z-popover por padrão.
- SheetOverlay usa z-overlay, mas SheetContent também usa z-overlay e deve ser distinguido como conteúdo modal.
- DropdownMenuContent e DropdownMenuSubContent usam z-popover, embora a escala reserve z-dropdown para dropdowns e selects.
- SelectContent possui uma diferenciação contextual entre popover e modal, mas a regra padrão e seu perfil documental precisam ser harmonizados com a escala canônica.
- PatientListTable e cinco páginas de busca usam z-10 cru em elementos locais que devem usar z-raised ou deixar de declarar camada quando ela não for necessária.
- DatePickerField usa z-modal em um PopoverContent inserido em um diálogo; esse caso precisa de uma API ou contrato contextual explícito, sem transformar popovers comuns em modais.
- CreateRecipeModal já usa z-dropdown em sua lista de resultados inline e deve permanecer compatível com a hierarquia.
- calendar.tsx usa z-raised em seu indicador de foco, uso compatível com o sistema e sujeito a regressão.

## User stories

### US1 — Interações sobrepostas respeitam a hierarquia (Priority: P1)

Como nutricionista usando o aplicativo, quero que dropdowns, popovers, folhas, diálogos e tooltips apareçam na ordem correta para continuar trabalhando sem perder contexto nem ficar com controles encobertos.

**Why this priority**: A ordem incorreta de camadas afeta diretamente a operação em formulários e pode impedir a seleção de dados.

**Independent test**: Abrir cada família de overlay isoladamente e em combinação com um diálogo ou sheet, verificando que o alvo interativo fica acima do backdrop correto e que o fechamento continua funcionando.

**Acceptance scenarios**:

1. **Given** um diálogo aberto, **When** um select ou dropdown é aberto dentro dele, **Then** seu conteúdo aparece acima do conteúdo do diálogo e não abaixo do overlay.
2. **Given** um diálogo aberto, **When** um popover de calendário é aberto dentro dele, **Then** o calendário usa a camada contextual modal e permanece interativo.
3. **Given** uma tela sem modal, **When** dropdown, select, popover ou tooltip é aberto, **Then** cada componente usa sua camada semântica padrão.
4. **Given** um sheet aberto, **When** seu conteúdo e seu backdrop são renderizados, **Then** o conteúdo fica acima do backdrop e mantém a mesma hierarquia de um diálogo.

### US2 — Manutenção usa tokens semânticos e contexto explícito (Priority: P1)

Como mantenedor do frontend, quero que cada uso de z-index seja mapeado para um token canônico ou para uma decisão contextual documentada, para corrigir novas ocorrências sem adivinhação.

**Why this priority**: Sem um contrato único, correções locais podem reintroduzir conflitos entre componentes e documentação.

**Independent test**: Inspecionar o inventário de usos em src/ e tests/ e comparar cada ocorrência com a matriz de camadas da especificação.

**Acceptance scenarios**:

1. **Given** qualquer declaração de camada em runtime ou teste, **When** ela é auditada, **Then** existe um token canônico e um contexto de uso identificável.
2. **Given** um primitivo reutilizável usado em contexto modal e não modal, **When** sua camada é escolhida, **Then** o contrato oferece uma opção contextual explícita sem duplicar o primitivo.
3. **Given** os perfis e regras do Design System, **When** são comparados com o código, **Then** não existe conflito sobre a camada padrão de dropdown, select, popover, overlay ou modal.

### US3 — Regressões de camada são detectáveis (Priority: P2)

Como responsável pela qualidade, quero validações determinísticas para detectar valores crus, tokens errados e omissões de contexto antes que a inconsistência chegue à interface.

**Why this priority**: A hierarquia é uma regra transversal e pode regredir quando componentes de UI são atualizados.

**Independent test**: Executar os testes e o verificador de inventário em ambiente local, sem depender de sessão externa ou de estado visual manual.

**Acceptance scenarios**:

1. **Given** o código conforme a especificação, **When** o auditor percorre os arquivos de runtime e teste, **Then** não encontra z-10 cru, z-[N] ou style.zIndex fora do mapa central.
2. **Given** um componente de overlay, **When** sua classe de camada é verificada, **Then** ela corresponde ao token previsto para sua categoria e contexto.
3. **Given** uma alteração que introduz uma camada inválida, **When** a validação é executada, **Then** o relatório identifica arquivo, linha, ocorrência, regra violada e correção esperada.

## Functional requirements

- **FR-001**: O sistema deve manter uma única escala canônica de camadas com os tokens z-base, z-raised, z-sticky, z-navigation, z-dropdown, z-popover, z-overlay, z-modal, z-toast e z-tooltip, sem criar novos níveis para esta feature.
- **FR-002**: O inventário deve cobrir todos os usos de camadas em componentes, páginas, testes e definição central de Tailwind, registrando arquivo, consumidor, contexto, token atual e token esperado.
- **FR-003**: DialogOverlay e SheetOverlay devem usar z-overlay; DialogContent e SheetContent devem usar z-modal.
- **FR-004**: DropdownMenuContent, DropdownMenuSubContent e SelectContent em contexto padrão devem usar z-dropdown; o contexto modal deve resolver explicitamente para z-modal quando o componente estiver dentro de dialog ou sheet.
- **FR-005**: PopoverContent deve usar z-popover por padrão e oferecer um contrato contextual explícito para o caso modal, incluindo o DatePickerField usado dentro de diálogo, sem alterar popovers não modais.
- **FR-006**: TooltipContent deve usar z-tooltip e não deve receber overrides modais como solução para conflitos de portal.
- **FR-007**: Elementos locais que realmente precisam de elevação devem usar z-raised; elementos sem sobreposição necessária devem remover a declaração de camada.
- **FR-008**: O código de runtime e os testes não devem conter z-10 cru, z-[N] ou style.zIndex; a definição central do mapa de tokens é a única exceção autorizada.
- **FR-009**: A correção deve remover overrides locais semanticamente incorretos e atualizar contratos e perfis do Design System sem alterar a semântica de foco, teclado, retorno de foco, dismiss, portal ou animação dos primitivos.
- **FR-010**: A validação deve cobrir todos os consumidores identificados no baseline, incluindo diálogos, sheets, selects, dropdowns, popovers, tooltips, calendário, tabela de pacientes, listas de busca e resultados inline de receitas.
- **FR-011**: O auditor de camadas deve emitir achados determinísticos, acionáveis e reproduzíveis, com severidade, localização e token/contexto esperado.

## Non-functional requirements

- **NFR-001**: A experiência deve permanecer adequada ao desktop suportado a partir de 1024 px e cumprir WCAG 2.2 AA para foco visível, teclado e leitura das relações de estado.
- **NFR-002**: A correção não deve depender de rede, dados externos, tempo real ou ordem não determinística de execução.
- **NFR-003**: Primitivos em src/components/ui devem continuar genéricos; decisões de contexto devem ser expressas por contrato reutilizável ou wrapper apropriado, preservando as regras de shadcn e Atomic Design.
- **NFR-004**: A documentação normativa, o registro de componentes e os testes devem permanecer consistentes com a implementação após a execução do plano.

## Edge cases

- Select ou calendário renderizado em portal dentro de DialogContent.
- Dropdown com submenu renderizado em portal sobre um dropdown pai.
- Sheet com backdrop e conteúdo sendo aberto enquanto outro overlay ainda está montado.
- Busca com ícone posicionado dentro do campo, sem necessidade real de empilhamento.
- Lista inline de resultados de ingredientes dentro de um modal.
- Uso futuro de um mesmo PopoverContent em modal e não modal.
- Classes arbitrárias ou style.zIndex adicionadas acidentalmente em novos testes ou componentes.
- Arquivos de dependências externas, como node_modules, ficam fora do escopo do inventário.

## Success criteria

- **SC-001**: 100% das ocorrências de camada em src/ e tests/ estão classificadas e apontam para token canônico ou contexto explícito documentado.
- **SC-002**: A validação encontra zero ocorrências de valor cru z-10, z-[N] ou style.zIndex fora da definição central autorizada.
- **SC-003**: Todos os cenários de sobreposição identificados possuem cobertura determinística de contrato ou teste, incluindo Select/Calendar dentro de Dialog e conteúdo de Sheet acima do seu overlay.
- **SC-004**: Os perfis relevantes do Design System e os contratos dos componentes não apresentam divergência sobre z-dropdown, z-popover, z-overlay e z-modal.
- **SC-005**: Os testes existentes de acessibilidade, foco, teclado, dismiss e retorno de foco continuam passando após a adequação.

## Assumptions

- design-system/07-icons-motion-and-layers.md é a fonte normativa para os valores e nomes da escala.
- A implementação não criará novos tokens nem mudará os valores numéricos já publicados.
- Select e Popover continuam não modais por padrão; a elevação modal será opt-in e explícita quando necessária.
- O escopo inclui código de produto, testes e documentação do Design System, mas não dependências geradas.
- Este artefato descreve a correção e sua validação; nenhuma alteração de implementação é autorizada nesta etapa do SDD.
