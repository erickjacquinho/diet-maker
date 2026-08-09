# Feature Specification: Identificador de Paciente com NanoID e Código de Prontuário

**Feature Branch**: `implementacao-nanoid-pacientes`

**Created**: 2026-08-09

**Status**: Draft

**Input**: User description: "Implementar identificador de paciente com NanoID nas URLs (/pacientes/[nanoid]) e número de prontuário P-XXXX na interface do usuário"

## Clarifications

### Session 2026-08-09

- Q: Tamanho e formato do NanoID? → A: 8 caracteres alfanuméricos (base62) para URLs concisas e sem risco de colisão.
- Q: Exibição do código de prontuário na UI? → A: Prefixo P- com 4 dígitos numéricos sequenciais (ex: P-0042) no cabeçalho do perfil e listagens.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso Seguro e Limpo ao Perfil do Paciente via URL NanoID (Priority: P1)

Como profissional de saúde (nutricionista), desejo acessar o perfil de qualquer paciente através de uma URL limpa com identificador NanoID de 8 a 10 caracteres (`/pacientes/k8Xm2P9q`), para que os dados sensíveis do paciente não vazem na barra de endereço ou nos logs do navegador e as URLs permaneçam estáveis.

**Why this priority**: É o requisito central da reestruturação de URLs da aplicação, garantindo conformidade com a LGPD e privacidade visual.

**Independent Test**: Pode ser testado ao clicar em qualquer paciente da lista de pacientes e verificar se o endereço no navegador muda para `/pacientes/[nanoid]`, carregando corretamente o perfil.

**Acceptance Scenarios**:

1. **Given** que o nutricionista está na lista de pacientes, **When** ele clica no paciente "João Silva", **Then** a navegação redireciona para `/pacientes/[nanoid]` e exibe todas as informações clínicas do paciente.
2. **Given** que o nutricionista digita diretamente uma URL válida `/pacientes/[nanoid]` no navegador, **Then** o sistema recupera o paciente correspondente e renderiza seu perfil sem erros.
3. **Given** que o nutricionista altera o nome do paciente no perfil, **Then** a URL `/pacientes/[nanoid]` permanece inalterada e funcional.

---

### User Story 2 - Exibição do Código de Prontuário na Interface Clínica (Priority: P2)

Como nutricionista, desejo visualizar o código numérico de prontuário (ex: `P-0042`) no cabeçalho do perfil do paciente e nos cards de navegação, para poder identificar e correlacionar rapidamente a ficha física/clínica do paciente durante a consulta.

**Why this priority**: Fornece o contexto de identificação humana e clínica sem precisar expor o nome do paciente na URL ou depender de IDs técnicos do banco de dados.

**Independent Test**: Pode ser verificado abrindo a tela de perfil do paciente e checando se o badge com a tag `Prontuário P-XXXX` é exibido ao lado do nome do paciente.

**Acceptance Scenarios**:

1. **Given** que um novo paciente é cadastrado, **When** o cadastro é salvo, **Then** o sistema gera automaticamente um código de prontuário único com formato `P-XXXX` (ex: `P-0001`, `P-0002`).
2. **Given** que o nutricionista visualiza o perfil de um paciente existente, **Then** o código de prontuário é visível no cabeçalho da página ao lado das iniciais e dados pessoais.

---

### User Story 3 - Compatibilidade e Redirecionamento de IDs Antigos (Priority: P3)

Como sistema, desejo redirecionar de forma transparente requisições de URLs com identificadores legados (ex: `pat-171829...`) para as novas URLs com NanoID, para não quebrar links existentes gravados no histórico do usuário.

**Why this priority**: Evita que links antigos mantidos em cache ou favoritos fiquem inacessíveis após a atualização da estrutura de URLs.

**Independent Test**: Pode ser testado acessando uma URL antiga `/pacientes/pat-17182...` e confirmando o redirecionamento automático para `/pacientes/[nanoid]`.

**Acceptance Scenarios**:

1. **Given** um link antigo no formato `/pacientes/pat-XXXX`, **When** o usuário acessa este link, **Then** o sistema localiza o paciente e atualiza a URL no navegador para `/pacientes/[nanoid]`.

---

### Edge Cases

- O que acontece se uma URL contiver um NanoID inexistente ou inválido? O sistema exibe a página amigável de "Paciente não encontrado" com botão de retorno para a lista.
- Como o sistema lida com o cadastro de pacientes criados offline/localStorage? O gerador de NanoID funciona de forma síncrona/atômica garantindo IDs de 8 caracteres alfanuméricos sem colisão local ou remota.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE gerar um identificador opaco único baseado em NanoID (8 caracteres alfanuméricos) para cada novo paciente cadastrado.
- **FR-002**: O sistema DEVE utilizar o NanoID como o parâmetro primário de rota na URL de perfil (`/pacientes/[nanoid]`), substituindo o formato legado `pat-[timestamp]-[hash]`.
- **FR-003**: O sistema DEVE gerar um código de prontuário sequencial com prefixo `P-` (ex: `P-0001`) para cada paciente.
- **FR-004**: O sistema DEVE exibir o código de prontuário no cabeçalho do perfil do paciente e nas listagens principais.
- **FR-005**: O sistema DEVE manter o nome do paciente e o código de prontuário pesquisáveis na barra de busca de pacientes.
- **FR-006**: As sub-rotas de paciente (`/pacientes/[nanoid]/dieta/...`, `/pacientes/[nanoid]/consulta/...`) DEVEM utilizar o NanoID como identificador de rota do paciente pai.

### Key Entities

- **Paciente (Patient)**: Representa o paciente cadastrado.
  - Atributos principais: `id` (NanoID único de 8 caracteres, ex: `"k8Xm2P9q"`), `code` (Código de prontuário, ex: `"P-0042"`), `name` (Nome completo), `initials` (Iniciais), `email`, `phone`, `createdAt`.
- **Registro de Prontuário**: Código legível por humanos para identificação rápida em clínica.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das URLs de perfil de paciente utilizam a estrutura `/pacientes/[nanoid]` de 8 caracteres.
- **SC-002**: Nenhuma URL exibe o nome do paciente ou timestamp em texto claro, eliminando vazamento de dados de saúde na barra de endereços e logs de servidor.
- **SC-003**: O tempo de busca/carregamento do perfil do paciente por NanoID é mantido em menos de 100ms.
- **SC-004**: Todas as navegações internas de dieta e consulta utilizam o novo identificador NanoID do paciente sem falhas de roteamento.

## Assumptions

- O tamanho padrão do NanoID adotado é de 8 caracteres alfanuméricos (base62), garantindo entropia suficiente para evitar colisões no banco local e remoto.
- Pacientes existentes no armazenamento local que possuem IDs legados serão migrados ou adaptados automaticamente atribuindo-lhes um `id` NanoID e mantendo o alias legado para compatibilidade.
