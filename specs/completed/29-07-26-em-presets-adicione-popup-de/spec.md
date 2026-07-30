# Feature Specification: Preset Backdrop Confirmation & Patient Multiplicative Macro Recalculation

**Feature Branch**: `specs/29-07-26-em-presets-adicione-popup-de`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "em /presets adicione popup de confirmacao ao clicar fora do popup. tambem é necesasrio que quando selecionado a opcao multiplicativa, esta deve responder aos dados do paciente em que o preset é carregado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmação ao Clicar Fora do Popup de Preset (Priority: P1)

Como um nutricionista criando um preset na página `/presets`, quero receber um aviso de confirmação ao clicar acidentalmente no fundo escuro (backdrop) fora do formulário, para evitar perder todos os dados que digitei no preset.

**Why this priority**: A perda acidental de dados digitados durante a criação de um protocolo gera frustração direta ao profissional.

**Independent Test**: Abrir o modal de criação de preset em `/presets`, preencher alguns campos (como título ou macros) e clicar na região externa (backdrop). O modal de confirmação de descarte deve aparecer pedindo para confirmar a ação.

**Acceptance Scenarios**:

1. **Given** que o usuário está com o modal de criação de preset aberto e preencheu informações no formulário, **When** ele clica no backdrop (fora do modal), **Then** um dialog/popup de confirmação é exibido perguntando se ele deseja descartar as alterações ou continuar editando.
2. **Given** que o popup de confirmação de descarte está visível, **When** o usuário clica em "Continuar Editando" (Cancelar descarte), **Then** o popup de confirmação se fecha e o modal de criação de preset permanece aberto com todos os dados preenchidos intactos.
3. **Given** que o popup de confirmação de descarte está visível, **When** o usuário clica em "Descartar Alterações" (Confirmar descarte), **Then** tanto o popup de confirmação quanto o modal de preset se fecham, limpando os dados do formulário.

---

### User Story 2 - Recálculo de Macros Multiplicativos por Dados do Paciente (Priority: P1)

Como um nutricionista aplicando um preset de dieta a um paciente específico, quero que os valores com opção multiplicativa (`g/kg`) respondam dinamicamente ao peso real do paciente selecionado no momento da aplicação do preset, para que os gramas e calorias sejam ajustados corretamente.

**Why this priority**: A prescrição nutricional multiplicativa (ex: 2.0g/kg de proteína) depende diretamente da massa corporal do paciente que recebe a dieta.

**Independent Test**: Aplicar um preset que possua macros definidos em `g/kg` (multiplicativos) para dois pacientes com pesos diferentes (ex: 60kg e 90kg) e verificar que as gramas finais e calorias totais são calculadas usando o peso de cada paciente respetivamente.

**Acceptance Scenarios**:

1. **Given** um preset configurado com Proteína em modo multiplicativo (`2.0 g/kg`) e um paciente com peso de `80 kg`, **When** o preset é carregado/aplicado ao paciente, **Then** o sistema calcula a meta de proteína como `160 g` (`2.0 * 80`) e recalcula o total de calorias com base nesse resultado.
2. **Given** um preset configurado com modo absoluto (`150 g` fixos) para um macro e multiplicativo (`1.0 g/kg`) para outro, **When** o preset é carregado para o paciente, **Then** o macro absoluto permanece `150 g` e o macro multiplicativo adapta-se ao peso do paciente.

---

### Edge Cases

- O que acontece se o paciente não tiver peso cadastrado (ou peso = 0)? O sistema deve usar o peso de referência padrão do preset ou solicitar um valor numérico válido (ex: fallback 70kg ou aviso).
- O que acontece se o usuário clicar fora do modal de criação de preset sem ter alterado nenhum campo? Se o formulário estiver completamente limpo/vazio, o fechar pode ser direto ou manter a mesma confirmação preventiva.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE interceptar o evento de clique externo (backdrop overlay click ou `onInteractOutside`) no Dialog de criação/edição de presets em `/presets`.
- **FR-002**: O sistema DEVE exibir um modal de confirmação secundário quando um clique fora do popup de preset for detectado, oferecendo as opções "Descartar Alterações" e "Continuar Editando".
- **FR-003**: O sistema DEVE manter o estado do formulário de preset inalterado caso o usuário decida cancelar o descarte.
- **FR-004**: O sistema DEVE fornecer uma função utilitária de resolução (`resolvePresetForPatient(preset, patientWeight)`) que aceita os dados do preset e o peso do paciente, retornando os valores finais de gramas de proteína, carboidratos, gorduras e calorias totais.
- **FR-005**: Na aplicação ou carregamento de presets para um paciente, o sistema DEVE utilizar a função de resolução com o peso atual do paciente para atualizar os targets nutricionais (targetProtein, targetCarbs, targetFats, targetKcal).

### Key Entities

- **DietPreset**: Representa o protocolo nutricional reutilizável contendo título, categoria, modos de cálculo dos macros (`absoluto` | `multiplicativo`), valores dos macros (`value` em g ou g/kg) e peso de referência base.
- **Patient**: Representa o paciente que possui peso em kg (`weightKg`) utilizado no recálculo dinâmico de presets multiplicativos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cliques fora do popup de preset no formulário de `/presets` ativam a tela de confirmação de descarte de dados.
- **SC-002**: 100% das aplicações de presets com macros multiplicativos em pacientes recalculam corretamente os gramas totais (`g/kg × peso_do_paciente`) e o valor calórico total sem erros de arredondamento.

## Assumptions

- Presets com modo multiplicativo armazenam o coeficiente em `g/kg` (ex: 2.0) e uma indicação de modo (`proteinMode: 'multiplicativo'`).
- A confirmação de descarte é exibida com um popup/dialog padronizado da aplicação.
