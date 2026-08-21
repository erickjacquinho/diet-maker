# Feature Specification: Avaliação física com cálculo US Navy

**Feature Branch**: `05-08-26-calculo-avaliacao-us-navy`

**Created**: 2026-08-05

**Status**: Approved for implementation

**Input**: Design aprovado em `docs/superpowers/specs/2026-08-05-physical-assessment-us-navy-design.md` e requisitos confirmados na conversa.

## User Scenarios & Testing

### User Story 1 - Registrar composição corporal automaticamente (Priority: P1)

Como nutricionista, quero registrar o peso e as medidas corporais de um paciente para obter automaticamente o percentual de gordura, a massa gorda e a massa magra pelo método US Navy.

**Why this priority**: É o fluxo principal solicitado e evita a digitação manual de resultados derivados.

**Independent Test**: Abrir o perfil de um paciente, iniciar uma nova avaliação, preencher todos os campos e confirmar que os três resultados derivados aparecem antes do salvamento e são persistidos junto com a avaliação.

**Acceptance Scenarios**:

1. **Given** um paciente masculino com altura cadastrada, **When** o nutricionista informa peso, pescoço, barriga e as demais medidas, **Then** o sistema calcula BF usando `abdômen - pescoço` e exibe massa gorda e massa magra derivadas.
2. **Given** uma paciente feminina com altura cadastrada, **When** o nutricionista informa peso, pescoço, cintura, quadril e as demais medidas, **Then** o sistema calcula BF usando `cintura + quadril - pescoço` e exibe massa gorda e massa magra derivadas.
3. **Given** todos os campos válidos, **When** o nutricionista altera peso ou uma medida usada pela fórmula, **Then** os resultados derivados são atualizados imediatamente.
4. **Given** uma avaliação com medida obrigatória ausente ou combinação inválida, **When** o nutricionista tenta salvar, **Then** o sistema exibe uma mensagem de erro no diálogo e não persiste a avaliação.

### User Story 2 - Editar e consultar avaliações sem perder histórico (Priority: P1)

Como nutricionista, quero editar uma avaliação existente e continuar consultando avaliações antigas para manter o histórico corporal do paciente.

**Why this priority**: O diálogo atual é compartilhado entre criação e edição, e registros antigos não podem desaparecer nem ficar com resultados manuais inconsistentes.

**Independent Test**: Abrir uma avaliação existente, alterar uma medida, salvar e confirmar que o histórico mantém a mesma avaliação com os novos valores calculados; abrir um registro legado sem novas medidas e confirmar que ele continua carregando.

**Acceptance Scenarios**:

1. **Given** uma avaliação existente com medidas completas, **When** o nutricionista altera uma circunferência e salva, **Then** o registro é atualizado com BF, massa gorda e massa magra recalculados.
2. **Given** uma avaliação legada sem as novas circunferências, **When** o histórico do paciente é carregado, **Then** o registro permanece disponível e seus valores já salvos não são apagados.
3. **Given** uma avaliação legada incompleta aberta para edição, **When** o nutricionista tenta salvar sem completar as medidas, **Then** o sistema informa que o cálculo precisa ser completado e mantém o diálogo aberto.

## Edge Cases

- Altura, peso ou medida igual a zero, negativa, ausente ou não numérica impede o cálculo.
- A diferença `abdômen - pescoço` para homens e a composição `cintura + quadril - pescoço` para mulheres devem ser maiores que zero.
- Somente gênero Masculino ou Feminino é aceito para seleção da equação; o formulário de cadastro de paciente já oferece essas duas opções.
- Quadril continua sendo registrado para todos os pacientes, embora só entre na fórmula feminina.
- Os resultados BF, massa gorda e massa magra são derivados e não podem ser editados manualmente.
- A função de cálculo não deve depender de estado de React, armazenamento ou renderização.

## Requirements

### Functional Requirements

- **FR-001**: O diálogo deve permitir informar peso atual em quilogramas.
- **FR-002**: O diálogo deve permitir informar, em centímetros, Pescoço, Escápula, Busto, Braço esquerdo, Braço direito, Cintura, Barriga, Quadril, Coxa proximal esquerda/direita, Coxa distal esquerda/direita e Panturrilha esquerda/direita, nessa ordem.
- **FR-003**: O sistema deve calcular o percentual de gordura pelo método US Navy usando altura e gênero do cadastro do paciente e as medidas da avaliação.
- **FR-004**: O sistema deve usar barriga menos pescoço para pacientes masculinos e cintura mais quadril menos pescoço para pacientes femininos, convertendo centímetros para polegadas antes da equação.
- **FR-005**: O sistema deve calcular massa gorda como peso multiplicado pelo BF dividido por 100 e massa magra como peso menos massa gorda.
- **FR-006**: BF, massa gorda e massa magra devem ser atualizados sempre que peso ou medidas relevantes mudarem e devem ser somente leitura.
- **FR-007**: O cálculo deve existir em uma função pura reutilizável, com constantes da fórmula e conversão de unidade centralizadas em um único módulo de domínio.
- **FR-008**: O diálogo deve bloquear o salvamento e exibir erro contextual quando os dados não permitirem uma composição válida.
- **FR-009**: O sistema deve persistir as medidas informadas e os resultados derivados na avaliação física do paciente.
- **FR-010**: O sistema deve manter a leitura de avaliações antigas que não possuam os novos campos.
- **FR-011**: Os fluxos de criação e edição devem usar o mesmo contrato visual e comportamental do diálogo, sem alterar os primitivos genéricos de Shadcn UI.

### Key Entities

- **Patient**: Cadastro que fornece gênero e altura para a equação.
- **BodyAssessment**: Avaliação física datada com peso, resultados derivados e circunferências corporais persistidas por paciente.
- **BodyCompositionResult**: Resultado derivado contendo BF, massa gorda, massa magra e estado de validade do cálculo.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Uma avaliação com dados válidos exibe BF, massa gorda e massa magra automaticamente antes do salvamento, sem campos manuais para esses resultados.
- **SC-002**: Os cálculos masculino e feminino retornam resultados determinísticos e reproduzíveis para os mesmos dados de entrada.
- **SC-003**: Nenhuma avaliação é salva com cálculo inválido ou com resultados derivados digitados manualmente.
- **SC-004**: Registros legados continuam acessíveis após a mudança e não perdem seus valores previamente persistidos.
- **SC-005**: Os testes automatizados cobrem os dois ramos da equação, cálculo de composição, entradas inválidas e interação do diálogo.

## Assumptions

- O gênero do paciente permanece limitado a Masculino e Feminino.
- A altura do paciente é reutilizada do cadastro e não será duplicada no diálogo.
- Todas as circunferências informadas no formulário são obrigatórias para uma avaliação nova, mesmo quando uma delas não entra na equação do gênero selecionado.
- O campo existente `muscleMassKg` continuará sendo usado como armazenamento compatível para o valor calculado de massa magra; `fatMassKg` será adicionado para massa gorda.
- A fórmula é uma estimativa de composição corporal para acompanhamento nutricional e não substitui uma avaliação clínica instrumental.
- O produto continua sendo desktop a partir de 1024px, offline-first e com persistência local existente.
