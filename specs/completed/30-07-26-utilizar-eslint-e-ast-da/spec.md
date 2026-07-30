# Feature Specification: Atomic Design ESLint & AST Compliance Auditor

**Feature Branch**: `30-07-26-utilizar-eslint-e-ast-da`

**Created**: 30-07-2026

**Status**: Approved

**Input**: User description: "utilizar a opção 2 (automação via ESLint / AST da forma mais robusta possível) para auditar e forçar a conformidade dos componentes ao Atomic Design"

## Clarifications

### Session 2026-07-30
- Q: Nenhuma ambiguidade crítica foi encontrada na especificação inicial. → A: Prosseguir com os checklists de requisitos e plano de implementação.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detecção Automática de HTML Nativo em Views/Páginas (Priority: P1)

Como desenvolvedor trabalhando no projeto `diet-maker`, quero que o linter me alerte (ou falhe no `npm run lint`) sempre que eu utilizar elementos HTML nativos brutos (como `<button>`, `<input>`, `<select>`, `<textarea>`) dentro de páginas, organismos ou templates em vez de utilizar os componentes reutilizáveis de Atomic Design (ex: `<Button>`, `<Input>`, `<Select>`).

**Why this priority**: Evita que novos componentes ou telas fiquem desalinhados do Design System e garante consistência visual e comportamental imediata no editor e no CI.

**Independent Test**: Pode ser testado adicionando uma tag `<button>` em uma página de exemplo (ex: `src/app/page.tsx` ou `src/components/organisms/...`) e rodando `npm run lint`, verificando se o ESLint acusa erro e sugere a troca pelo componente de Atomic Design correspondente.

**Acceptance Scenarios**:

1. **Given** um arquivo JSX/TSX localizado fora do diretório de átomos (`src/components/ui` ou `src/components/atoms`), **When** o desenvolvedor insere um elemento HTML nativo substituível (`<button>`, `<input>`, etc.), **Then** o ESLint exibe uma mensagem de erro indicando que o elemento nativo deve ser substituído pelo componente de Design System.
2. **Given** um arquivo JSX/TSX localizado dentro do diretório de átomos (`src/components/ui`), **When** o desenvolvedor utiliza elementos HTML nativos para construir o próprio átomo, **Then** o ESLint permite o uso sem sinalizar erro.

---

### User Story 2 - Auditoria de Estilos Inline e Classes Arbitrárias Fora dos Tokens (Priority: P2)

Como desenvolvedor, quero que o linter impeça o uso de `style={{ ... }}` inline e proíba cores/espaçamentos arbitrários em classes CSS/Tailwind que não façam parte dos tokens definidos pelo Design System.

**Why this priority**: Impede a contaminação do layout com "magic numbers" e cores fora da paleta do Design System.

**Independent Test**: Inserir `style={{ color: 'red' }}` ou uma classe arbitrária não padronizada em um componente e rodar `npm run lint`, confirmando o bloqueio pelo linter.

**Acceptance Scenarios**:

1. **Given** qualquer componente JSX/TSX na aplicação, **When** um atributo `style` é utilizado diretamente, **Then** o linter sinaliza como violação das diretrizes de Design System.
2. **Given** uma classe CSS/Tailwind com valores arbitrários (ex: `bg-[#123456]`), **When** o linter analisa o arquivo, **Then** ele alerta a necessidade de utilizar tokens de cor/espaçamento configurados.

---

### User Story 3 - Script de Varredura / Scanner AST para Relatório Completo do Projeto (Priority: P3)

Como líder técnico ou mantenedor do projeto, quero executar um comando de varredura AST (`npm run audit:atomic-design` ou script dedicado) que inspecione todo o projeto e gere um relatório detalhado em Markdown/JSON listando todas as violações existentes do Atomic Design para facilidade de refatoração.

**Why this priority**: Permite mapear a dívida técnica atual sem quebrar imediatamente o build de legados, possibilitando refatoração gradual e tracking de progresso.

**Independent Test**: Rodar o script de auditoria e verificar a criação de um relatório contendo os arquivos, linhas e tipos de violações encontrados.

**Acceptance Scenarios**:

1. **Given** o projeto com páginas existentes, **When** o comando de auditoria AST é executado, **Then** é gerado um relatório consolidado classificando os arquivos em "Conformes", "Parcialmente Conformes" e "Não Conformes".

---

### Edge Cases

- **Como o sistema lida com elementos HTML dentro de bibliotecas de terceiros ou wrappers internos?**
  Os arquivos no diretório de UI base (ex: `src/components/ui/*`) e `node_modules` são ignorados pelas regras restritivas do linter para permitir a composição nativa dos átomos.
- **O que acontece se uma tag nativa for estritamente necessária por razões de acessibilidade ou formulários específicos sem equivalente no Design System?**
  O desenvolvedor poderá usar um comentário `// eslint-disable-next-line` explícito acompanhado de justificativa, mantendo a regra rígida por padrão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O projeto DEVE conter regras personalizadas de ESLint (via `eslint-plugin-no-restricted-syntax` ou plugin customizado AST) que restrinjam o uso de tags HTML nativas (`<button>`, `<input>`, `<select>`, `<textarea>`) em arquivos JSX/TSX localizados em páginas, views, organogramas e templates (`src/app/**`, `src/components/organisms/**`, `src/components/molecules/**`).
- **FR-002**: As regras do ESLint DEVEM permitir exceções configuradas estritamente para o diretório de componentes atômicos primários (`src/components/ui/**`).
- **FR-003**: O ESLint DEVE sinalizar como aviso/erro o uso de estilos inline (`style={{ ... }}`) em componentes de aplicação para forçar o uso de classes e tokens do Design System.
- **FR-004**: O projeto DEVE oferecer um script executável via Node.js (`scripts/audit-atomic-design.js` ou similar) baseado em AST (`@typescript-eslint/parser` ou `babel/parser`/`ts-morph`) para varrer o projeto e emitir um relatório completo de conformidade.
- **FR-005**: O arquivo de configuração do ESLint (`.eslintrc.js` ou `.eslintrc.json`) DEVE estar integrado ao script de `npm run lint` existente para execução em CI e pré-commit.

### Key Entities

- **Linter Rule Set**: Conjunto de regras configuradas no ESLint definindo restrições de sintaxe JSX, seletores AST e exceções de diretório.
- **AST Compliance Auditor**: Script em Node.js responsável pela análise de Árvore Sintática Abstrata (AST) que navega pelos nós JSXElement para calcular estatísticas de conformidade.
- **Audit Report**: Artefato estruturado (em JSON ou Markdown) resumindo a taxa de aderência do projeto ao Atomic Design e a localização exata de cada não conformidade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos novos usos de tags HTML nativas em arquivos fora de `src/components/ui` são identificados pelo `npm run lint`.
- **SC-002**: O tempo de execução da verificação do ESLint não aumenta mais do que 15% em relação ao tempo atual.
- **SC-003**: O script de auditoria AST gera um relatório legível identificando com precisão de linha e coluna todas as ocorrências de componentes fora do padrão.

## Assumptions

- O diretório principal de Átomos/UI do Design System está localizado em `src/components/ui` (padrão shadcn/Radix UI).
- O desenvolvedor possui ambiente Node.js e ESLint 8+ funcional no repositório.
- A restrição a tags HTML nativas se aplica primariamente a elementos de controle e interatividade que possuem equivalentes de Design System no projeto.
