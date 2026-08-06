# Feature Specification: Adequação de Estilos Hardcoded e Arquitetura de Componentes em src/app

**Feature Branch**: `30-07-26-adequacao-de-estilos-hardcoded-e`
**Created**: 30/07/2026
**Status**: Draft
**Input**: User description: "Adequação de estilos hardcoded (cores utilitárias, tamanhos arbitrários, inline styles) e refatoração da arquitetura de componentes e modais em 100% dos arquivos de src/app do NutriDiet Local Pro, alinhando ao Design System NutriDiet e ao Atomic Design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Padronização do Design System & Eliminação de Cores e Tamanhos Hardcoded (Priority: P1)

Como nutricionista ou desenvolvedor visual do sistema, desejo que toda a interface na pasta `src/app` utilize rigorosamente os tokens semânticos do Design System NutriDiet (ex: `--sys-color-macro-*`, `--sys-color-surface-*`, `--sys-color-text-*`) e escalas oficiais de tipografia/espaçamento em substituição a utilitários diretos como `text-blue-600`, `text-orange-500`, `text-emerald-700`, `bg-rose-50` e arbitrários `text-[10px]`, `text-[11px]`, `text-[9px]`, garantindo harmonia visual e fidelidade ao tema Swiss Flat Minimalist.

**Why this priority**: Garante que o aplicativo obedeça ao contrato de marca, acessibilidade e flexibilidade de temas do sistema nutricional sem poluição visual.

**Independent Test**: Navegar pelas 10 rotas existentes sob `src/app` (`/`, `/alimentos`, `/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/consulta/[date]`, `/pacientes/[id]/dieta/[dietaId]`, `/presets`, `/receitas`, `/refeicoes-prontas`, `/design-system`) e verificar que a interface mantém fidelidade estética de 100% com inspeção do DOM comprovando a utilização exclusiva de tokens semânticos e utilitários de design padronizados.

**Acceptance Scenarios**:

1. **Given** qualquer página em `src/app`, **When** inspecionado o HTML/JSX, **Then** nenhuma classe utilitária de cor bruta (`text-blue-600`, `text-orange-500`, `text-emerald-700`, `bg-rose-50`) é utilizada para representar elementos semânticos do sistema nutricional.
2. **Given** os elementos com tamanhos arbitrários (`text-[10px]`, `text-[11px]`, `text-[9px]`, `max-h-[90vh]`), **When** refatorados, **Then** utilizam as classes de utilitário de escala oficiais do Tailwind / Design System (ex: `text-xs`, `text-2xs`, `max-h-screen-90` ou equivalentes padronizados).

---

### User Story 2 - Desacoplamento da Arquitetura de Componentes e Modais (Atomic Design Level 5) (Priority: P2)

Como arquiteto de software e desenvolvedor mantenedor do projeto, desejo que os arquivos de rota sob `src/app` atuem puramente como Páginas (Level 5 do Atomic Design), delegando modais, formulários complexos e blocos de interface para moléculas, organismos e templates isolados em `src/components/`, preservando os componentes base do Shadcn UI sem poluição.

**Why this priority**: Evita proliferação de código monolítico em arquivos de rota, aumentando a reusabilidade, testabilidade e legibilidade da base de código conforme a regra do `AGENTS.md` e as diretrizes do `vercel-composition-patterns`.

**Independent Test**: Verificar se todas as modais (`Dialog`) de cadastro de paciente, cadastro de alimento, criação de preset, criação de receita e confirmações de descarte são extraídas para componentes isolados sob `src/components/molecules` ou `src/components/organisms`, mantendo o funcionamento idêntico e interativo.

**Acceptance Scenarios**:

1. **Given** a página `/pacientes`, `/alimentos`, `/presets`, `/receitas` ou `/refeicoes-prontas`, **When** acionados os botões de criação/edição, **Then** as modais exibidas são componentes compostos reutilizáveis importados da camada de componentes.
2. **Given** os componentes primitivos do Shadcn UI em `src/components/ui/`, **When** mantidos, **Then** seus arquivos base não recebem lógica de negócio específica do aplicativo, sendo preservados limpos.

---

### Edge Cases

- O que acontece se uma página de documentação como `/design-system` precisar de previews dinâmicos? Deve utilizar encapsulamento limpo para os swatches de demonstração de tokens sem violar os estilos da aplicação principal.
- Como o sistema se comporta quando o usuário abre modais em telas de resolução reduzida (laptops pequenos)? As modais desacopladas devem possuir scroll de conteúdo inteligente sem cortar o rodapé de ações.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST substituir todas as ocorrências de cores utilitárias brutas de macronutrientes (`text-blue-600`, `text-orange-500`, `text-emerald-700`, `bg-amber-500/10`) por tokens e classes semânticas do Design System NutriDiet (`text-macro-protein`, `text-macro-carbohydrate`, `text-macro-fat`, `text-macro-kcal`, `bg-macro-*-soft`, `border-macro-*-border`).
- **FR-002**: O sistema MUST substituir valores arbitrários de tamanho de fonte (`text-[10px]`, `text-[11px]`, `text-[9px]`) e dimensões fixas (`max-w-[1400px]`, `max-h-[90vh]`) em `src/app` por utilitários da escala do Design System NutriDiet, como `text-style-*`, `max-w-container-page` e `max-h-screen`.
- **FR-003**: O sistema MUST extrair formulários e modais inline hoje presentes nos arquivos de rota (`src/app/*`) para a hierarquia do Atomic Design em `src/components/molecules` ou `src/components/organisms`.
- **FR-004**: As páginas sob `src/app` MUST ser refatoradas para atuar como Nível 5 do Atomic Design, consumindo templates (`src/components/templates`) ou organismos compostos, sem lógica de estado de formulário monolítica embutida na página.
- **FR-005**: Os componentes base do Shadcn UI (`src/components/ui/`) MUST ser preservados limpos e sem acoplamento a regras de negócio locais.

### Key Entities

- **NutriDiet Design Tokens**: Conjunto de variáveis primitivas e semânticas de cores, superfícies, bordas, tipografia e espaçamentos definido em `src/design-system/tokens.css`, exposto pelo `tailwind.config.js` e indexado em `src/design-system/index.ts`.
- **Atomic Component Layer**: Estrutura em 5 níveis (`atoms`, `molecules`, `organisms`, `templates`, `app`) para UI modular.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 10 arquivos de rota existentes em `src/app` livres de utilitários de cores brutas de macronutrientes ou tamanhos de fonte arbitrários unificados.
- **SC-002**: 100% das modais e formulários de criação/edição em `src/app` extraídos para componentes reutilizáveis em `src/components/molecules` ou `src/components/organisms`.
- **SC-003**: 0 regressões de funcionalidade ou interface após a refatoração visual e estrutural.
- **SC-004**: Compilação sem avisos ou erros de lint/TypeScript no projeto Next.js App Router (`npm run build`).

## Assumptions

- Todos os tokens de cor semântica e tipografia necessários estão declarados em `src/design-system/tokens.css` e expostos pelos utilitários do Tailwind; novos tokens só são estendidos na cadeia canônica quando necessário.
- A experiência do usuário em todas as telas permanece idêntica do ponto de vista de uso, ganhando em consistência e desempenho.
