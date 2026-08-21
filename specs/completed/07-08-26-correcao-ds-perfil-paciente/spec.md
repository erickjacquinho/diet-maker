# Feature Specification: Correção de Conformidade 100% ao Design System na Página de Perfil do Paciente (/pacientes/perfil)

**Feature Branch**: `07-08-26-correcao-ds-perfil-paciente`  
**Created**: 2026-08-07  
**Status**: Clarified / Approved  
**Input**: User description: "em /pacientes/perfil quero que verifique 100% da pagina e identifique se algo esta fora do design system. crie /sdd de correçao."

---

## Clarifications

### Session 2026-08-07

- Q: A auditoria de 100% da página identificou todas as não conformidades de tipografia, geometria, espaçamentos e limites de camada? → A: Sim. Todas as divergências foram mapeadas diretamente sobre `src/app/pacientes/[id]/page.tsx` e os componentes relacionados, não restando ambiguidades técnicas ou de escopo.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Normalização Tipográfica e Correção de Text Styles (Priority: P1)

Como profissional nutricionista acessando a página de Perfil do Paciente, quero que todos os textos, títulos, rótulos e legendas sigam rigorosamente a escala canônica do Sistema Tipográfico (`textStyle(...)`), para que a hierarquia visual seja limpa, harmônica e sem distorções de peso ou altura de linha.

**Why this priority**: A hierarquia tipográfica e o uso correto dos tokens fechados do catálogo são o pilar central da linguagem visual do NutriDiet. Sobrescrever `textStyle(...)` com `font-bold`, `font-semibold` ou usar `legal` em descrições rompe o contraste e a legibilidade da página.

**Independent Test**: Pode ser verificado navegando pela página e confirmando que nenhum elemento de texto combina `font-bold` com `textStyle` ou utiliza `text-style-legal` fora de notas não operacionais e metadados legais.

**Acceptance Scenarios**:
1. **Given** a página `/pacientes/[id]`, **When** renderizada, **Then** o nome do paciente no cabeçalho do resumo utiliza `textStyle('subsection-title')` sem sobrescritas ad-hoc de `font-bold` ou `tracking-tight`.
2. **Given** os títulos de seções e cartões ("Indicadores atuais", "Plano alimentar atual", "Histórico de consultas"), **When** exibidos, **Then** utilizam exclusivamente os estilos fechados `section-title`, `subsection-title` ou `card-title` sem modificadores manuais de peso.
3. **Given** as descrições de seções e metadados, **When** exibidas, **Then** utilizam `body-secondary`, `caption` ou `helper`, substituindo o uso inadequado de `text-style-legal`.

---

### User Story 2 - Respeito à Geometria, Espaçamentos e Escala de Dimensões dos Componentes (Priority: P2)

Como usuário do sistema desktop, quero que todos os componentes da página de Perfil do Paciente respeitem as dimensões autorizadas (`compact` 32px e `standard` 36px), a escala base de espaçamento de 4px e a estrutura de superfícies `Surface`, evitando dimensões e classes inline arbitrárias.

**Why this priority**: Garantir que botões, avatares, cartões e contêineres sigam as especificações de geometria (DS 06) impede inconsistências de alinhamento e mantém o layout desktop previsível e fluido.

**Independent Test**: Pode ser verificado inspecionando os componentes `Avatar`, `IconButton`, cartões e divisores, garantindo que utilizam props do catálogo (`size="lg"`, `size="compact"`, `surface="boxed"`) sem classes Tailwind arbitrárias (`h-16 w-16`, `h-7 w-7`, `h-6 w-px`, `bg-surface/50`).

**Acceptance Scenarios**:
1. **Given** o `Avatar` do paciente e os botões de ação (`IconButton`), **When** renderizados, **Then** suas dimensões são controladas exclusivamente por suas props de tamanho do átomo (`size="lg"`, `size="compact"`), sem classes de largura/altura arbitrárias.
2. **Given** o bloco de "Próximo acompanhamento", **When** renderizado, **Then** ele é composto utilizando o padrão de superfície `Surface` ou molécula `MetricBox` com tokens semânticos, sem estilos inline customizados.
3. **Given** as margens e paddings da página, **When** aplicados, **Then** utilizam estritamente a escala de espaçamentos `space-1` a `space-16` e as regras de container desktop (`p-6 max-w-6xl mx-auto`).

---

### User Story 3 - Desacoplamento Arquitetural, Modularização de Modais e Tabela de Histórico (Priority: P3)

Como desenvolvedor mantenedor do código, quero que a página `src/app/pacientes/[id]/page.tsx` delegue a renderização de modais e tabelas complexas para moléculas e organismos dedicados (`PatientConsultationHistoryTable`, `NextEventModal`, `AddObjectiveModal`, `DeletePatientModal`), eliminando imports diretos de primitivos `ui` e marcações HTML brutas na camada de página.

**Why this priority**: A camada `app` (página) deve instanciar templates e organizar fluxos (DS 10 Section 8), não manter 400+ linhas de HTML bruto de tabelas com acordeões nem definir o JSX de múltiplos diálogos inline.

**Independent Test**: Pode ser verificado confirmando que `src/app/pacientes/[id]/page.tsx` não importa primitivos `ui` (`Card`, `Badge`, `Button`, `Input`, `Select`, `Dialog`), não contém marcação `<table>` direta e que todos os modais/tabelas estão isolados em `src/components/molecules/` e `src/components/organisms/`.

**Acceptance Scenarios**:
1. **Given** a tabela de histórico de consultas, **When** visualizada na página, **Then** ela é renderizada através do organismo `PatientConsultationHistoryTable` com contrato tipado e testes isolados.
2. **Given** as interações de reagendamento, adição de objetivo e exclusão de paciente, **When** acionadas, **Then** utilizam as moléculas `NextEventModal`, `AddObjectiveModal` e `DeletePatientModal`.
3. **Given** a página `src/app/pacientes/[id]/page.tsx`, **When** auditada por linting ou análise estática, **Then** não apresenta import direto da camada `@/components/ui/` nem quebras de limite arquitetural.

---

### Edge Cases

- **Ausência de Histórico ou Avaliação**: Quando o paciente não possui histórico de consultas nem avaliações corporais, o estado vazio dentro da tabela/organismo deve utilizar `empty-title` e `body-secondary` com ícones semânticos do catálogo.
- **Valores Indefinidos nas Métricas**: Campos corporais ou alvos dietéticos não calculados devem exibir o caractere de travessão (`—`) com tom `muted`, mantendo o layout tabular alinhado sem quebras de linha.
- **Modais com Alterações Não Salvas**: Ao fechar os modais via teclado (Escape) ou clique fora, a confirmação de descarte deve seguir o padrão de diálogo do sistema com variant `destructive` no botão de confirmação.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE utilizar exclusivamente os estilos do catálogo de tipografia `textStyle(...)` em todos os elementos visíveis da página de Perfil do Paciente.
- **FR-002**: O sistema NÃO DEVE combinar classes de peso (`font-bold`, `font-semibold`) ou de espaçamento de letras (`tracking-tight`) com funções `textStyle(...)` que já definem esses valores em seu contrato.
- **FR-003**: O sistema DEVE substituir todo uso indevido de `text-style-legal` em descrições de seção, badges e resumos pelos estilos `caption`, `body-secondary` ou `helper`.
- **FR-004**: O sistema DEVE remover todas as classes Tailwind de dimensões arbitrárias (`h-16 w-16`, `h-7 w-7`, `h-6 w-px`, `bg-surface/50`) de componentes átomos e moléculas.
- **FR-005**: O sistema DEVE encapsular a tabela de consultas e acordeões em um organismo dedicado em `src/components/organisms/PatientConsultationHistoryTable.tsx`.
- **FR-006**: O sistema DEVE extrair os diálogos inline de `src/app/pacientes/[id]/page.tsx` para as moléculas `NextEventModal`, `AddObjectiveModal` e `DeletePatientModal` em `src/components/molecules/`.
- **FR-007**: A página `src/app/pacientes/[id]/page.tsx` DEVE eliminar imports diretos de `@/components/ui/` (`Card`, `Badge`, `Button`, `Input`, `Select`, `Dialog`), consumindo apenas os componentes homologados de `@/components/atoms`, `@/components/molecules` e `@/components/organisms`.
- **FR-008**: Todas as cores utilizadas na página e componentes relacionados DEVEM ser derivadas estritamente das quatro famílias de tokens (neutros quentes, azul primário, macronutrientes, feedback semântico).

---

### Key Entities

- **PatientProfileView**: Modelo de dados consolidado para a página de perfil contendo paciente, histórico de consultas, avaliações físicas e plano dietético ativo.
- **ConsultationHistoryItem**: Entidade de apresentação representando um registro unificado por data contendo prescrição dietética e/ou avaliação física corporal.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de conformidade com o Design System na página `/pacientes/perfil` (`src/app/pacientes/[id]/page.tsx` e subcomponentes associados), comprovado por ausência total de violações na verificação estática.
- **SC-002**: 0 imports diretos de `@/components/ui/` na página `src/app/pacientes/[id]/page.tsx`.
- **SC-003**: 0 ocorrências de `font-bold` ou `font-semibold` combinados ad-hoc com `textStyle(...)` no código da página e de seus componentes específicos.
- **SC-004**: 100% de aprovação na suíte de testes automatizados (`npm test` / `vitest`).

---

## Assumptions

- O produto destina-se exclusivamente a telas web desktop a partir de `1024px`; ajustes de responsividade mobile/tablet estão fora de escopo conforme diretriz do Design System (DS 06).
- Os primitivos de `@/components/ui/` continuam sendo utilizados internamente pelas camadas `atoms`, `molecules` e `organisms`, mas não diretamente pela camada `app` (página).
- As alterações visuais devem preservar exatamente a funcionalidade e os fluxos de dados existentes de cadastro, avaliação, plano alimentar e acompanhamento do paciente.
