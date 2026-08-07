# Feature Specification: Compactação do quadro de contexto da dieta

**Feature Branch**: `001-compactar-contexto-dieta`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Na rota /pacientes/pat-1786033492617-8xcc5/dieta/nova, resumir somente o quadro interno onde o nome do paciente aparece, mantendo o paciente à esquerda e a opção de dieta à direita. O breadcrumb e o restante da página ficam fora do escopo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identificar o paciente e escolher o modelo da dieta (Priority: P1)

Como nutricionista, quero encontrar o paciente e o modelo da dieta no mesmo quadro, com cada informação em seu lado, para iniciar a prescrição com leitura rápida e sem ruído visual.

**Why this priority**: Esse quadro é o primeiro contexto operacional da dieta. Uma hierarquia mais direta reduz a carga de leitura sem remover nenhuma decisão necessária do fluxo.

**Independent Test**: Abrir a tela de nova dieta em um desktop suportado e verificar somente o quadro de contexto: paciente à esquerda, modelo de dieta à direita, sem alteração visual no breadcrumb ou nas regiões posteriores.

**Acceptance Scenarios**:

1. **Given** o quadro de contexto está carregado, **When** o nutricionista o observa, **Then** o avatar, nome, peso e objetivo do paciente aparecem agrupados no lado esquerdo.
2. **Given** o quadro de contexto está carregado, **When** o nutricionista o observa, **Then** as opções de dieta simples e ciclo de carboidratos aparecem agrupadas no lado direito.
3. **Given** o paciente possui peso e objetivo disponíveis, **When** o quadro é exibido, **Then** o peso aparece uma única vez e o objetivo não repete essa informação.
4. **Given** o nutricionista alterna o modelo da dieta, **When** seleciona ciclo de carboidratos, **Then** os controles específicos de variações continuam aparecendo progressivamente no mesmo quadro.
5. **Given** o quadro foi simplificado, **When** o nutricionista navega pela tela, **Then** breadcrumb, cabeçalho externo, metas, refeições e ações fora do quadro permanecem inalterados.

### Edge Cases

- Em 1024px, a composição deve preservar a separação entre paciente e modelo sem sobreposição ou ocultação de controles essenciais.
- Nomes de pacientes e objetivos longos devem permanecer legíveis, podendo quebrar ou truncar visualmente sem perder o nome acessível completo.
- Quando o modelo simples estiver ativo, os controles exclusivos do ciclo de carboidratos não devem ocupar espaço visível desnecessário.
- Quando o ciclo de carboidratos estiver ativo com duas ou três variações, a variação selecionada deve continuar identificável por texto e estado visual.
- A ausência de dados opcionais do paciente não deve criar duplicações, labels vazios ou um quadro visualmente quebrado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O quadro de contexto deve apresentar a identificação do paciente no lado esquerdo e a escolha do modelo de dieta no lado direito.
- **FR-002**: A identificação do paciente deve conter avatar, nome, peso e objetivo, mantendo a unidade do peso explícita.
- **FR-003**: O peso do paciente deve ser apresentado uma única vez dentro do quadro.
- **FR-004**: A escolha do modelo deve manter as opções de dieta simples e ciclo de carboidratos com labels textuais compreensíveis.
- **FR-005**: Ao selecionar ciclo de carboidratos, os controles de quantidade de variações, seleção de variação e cópia entre variações devem continuar disponíveis conforme o comportamento atual.
- **FR-006**: O quadro deve manter uma divisão visual clara entre os dois contextos sem adicionar superfícies concorrentes ou texto explicativo desnecessário.
- **FR-007**: Todos os controles do modelo de dieta devem manter nome acessível, foco visível, navegação por teclado e indicação textual/visual de seleção.
- **FR-008**: A alteração deve ficar restrita ao quadro interno de contexto; breadcrumb, cabeçalho externo, metas, refeições, ações externas e persistência não fazem parte da mudança.
- **FR-009**: A composição deve respeitar o escopo desktop a partir de 1024px, sem introduzir variantes específicas para mobile ou tablet.
- **FR-010**: A composição deve reutilizar os componentes e tokens visuais existentes sempre que forem suficientes, sem alterar primitivos genéricos de UI.

### Key Entities

- **Quadro de contexto da dieta**: região visual que reúne a identificação do paciente e o modelo de dieta antes das metas e refeições.
- **Contexto do paciente**: nome, avatar, peso e objetivo usados para confirmar a pessoa atendida.
- **Modelo da dieta**: escolha entre dieta simples e ciclo de carboidratos, com variações condicionais no segundo modo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em cinco avaliações representativas, o nutricionista identifica o paciente e o modelo de dieta no quadro em até 3 segundos.
- **SC-002**: Em cinco avaliações representativas, nenhum participante encontra o peso duplicado dentro do quadro.
- **SC-003**: Em 100% dos cenários simples e de ciclo de carboidratos, a opção selecionada e os controles aplicáveis permanecem compreensíveis e operáveis.
- **SC-004**: Em 100% dos cenários testados, breadcrumb, cabeçalho externo, metas e refeições permanecem visualmente e funcionalmente inalterados.
- **SC-005**: Na largura desktop mínima suportada, nenhum controle essencial do quadro fica sobreposto, oculto ou inacessível por teclado.

## Assumptions

- O usuário principal é um nutricionista trabalhando no fluxo desktop do NutriDiet.
- O produto continua sendo web desktop a partir de 1024px; mobile, tablet e dark mode permanecem fora do escopo.
- O quadro atual já possui os dados e callbacks necessários; não serão criadas entidades, regras nutricionais ou persistência novas.
- A escolha entre os modelos e os controles de ciclo existentes devem manter o comportamento atual, com mudança apenas de hierarquia e densidade visual.
- O breadcrumb e o `PageContextHeader` estão fora do quadro solicitado e não serão alterados.
- A execução futura será feita por `/speckit-implement`, conforme a constituição do projeto.
