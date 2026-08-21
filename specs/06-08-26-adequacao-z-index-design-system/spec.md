# Feature Specification: Adequação da hierarquia z-index ao Design System

**Feature Branch**: `06-08-26-adequacao-z-index-design-system`

**Created**: 2026-08-06

**Status**: Draft

**Input**: Verificar todos os componentes que usam z-index e criar um SDD de adequação ao Design System.

## Contexto e diagnóstico

O Design System define uma escala semântica única para empilhamento: `z-base` (0), `z-raised` (10), `z-sticky` (20), `z-navigation` (30), `z-dropdown` (40), `z-popover` (50), `z-overlay` (60), `z-modal` (70), `z-toast` (80) e `z-tooltip` (90). Valores numéricos locais e `z-[N]` são proibidos.

A auditoria do estado atual encontrou 19 ocorrências explícitas de utilities `z-*` em `src/` e 10 consumidores de `SelectContent layer="modal"`, que resolvem semanticamente para `z-modal` por uma alteração já presente no worktree. A auditoria documental do catálogo passa, mas seus gates atuais não verificam a classificação semântica de cada uso de z-index.

### Inventário inicial

| Grupo | Fontes | Situação | Decisão necessária |
| --- | --- | --- | --- |
| Primitivos conformes | `ui/tooltip.tsx`, `ui/dialog.tsx`, `ui/popover.tsx`, `ui/calendar.tsx` e partes de `ui/dropdown-menu.tsx` | Usam aliases oficiais | Preservar e cobrir no gate |
| Sheet | `src/components/ui/sheet.tsx` | Backdrop usa `z-overlay`, mas o conteúdo também usa `z-overlay` | Conteúdo modal deve usar `z-modal` |
| Select contextual | `src/components/ui/select.tsx` e 10 consumidores com `layer="modal"` | A variação fechada `popover/modal` já existe no código, mas ainda não está formalizada no perfil | Documentar, testar e manter `popover` como default |
| Usos numéricos locais | `src/app/alimentos/page.tsx`, `src/app/pacientes/page.tsx`, `src/app/presets/page.tsx`, `src/app/receitas/page.tsx`, `src/app/refeicoes-prontas/page.tsx`, `src/components/organisms/PatientListTable.tsx` | 6 ocorrências `z-10` | Substituir por `z-raised` |
| Date picker | `src/components/molecules/DatePickerField.tsx` | `PopoverContent` recebe `z-modal` diretamente no consumidor | Usar contexto semântico de overlay modal, sem classe local |
| Busca de ingredientes | `src/components/molecules/CreateRecipeModal.tsx` | Resultados são uma `div` posicionada com `z-dropdown` dentro de um `Dialog` | Compor primitive de overlay aprovado e preservar foco/teclado |
| Contrato compartilhado | `design-system/07-icons-motion-and-layers.md`, perfis de `dialog`, `sheet`, `select`, `popover`, `dropdown-menu`, `date-picker-field` e `create-recipe-modal` | `z-dropdown`/`z-popover` possuem responsabilidades parcialmente divergentes entre fundamento, perfil e implementação | Escolher e registrar uma única regra por semântica |

## Objetivo

Adequar todos os usos de empilhamento do runtime à escala oficial, tornando explícita a diferença entre conteúdo comum, overlays flutuantes, conteúdo ancorado dentro de modal e camadas modais. A alteração deve eliminar decisões locais sem alterar dados, rotas, regras nutricionais ou o comportamento funcional dos fluxos.

## User Scenarios & Testing

### User Story 1 - Inventariar e classificar todas as camadas (Priority: P1)

Como mantenedor do Design System, quero uma matriz completa de usos de z-index, para que nenhum componente dependa de um valor ou classificação não documentada.

**Why this priority**: A matriz é a linha de base para separar usos conformes, divergências de token e exceções de contexto antes da implementação.

**Independent Test**: Comparar a matriz com todas as ocorrências `z-*`, `z-index`, `style={{ zIndex }}` e props semânticas que geram classes de camada em `src/`; cada ocorrência deve possuir fonte, consumidor, categoria visual, contexto, token esperado e decisão.

**Acceptance Scenarios**:

1. **Given** uma busca completa no runtime, **When** a matriz de auditoria é revisada, **Then** todos os 19 usos explícitos e os 10 consumidores semânticos de `layer="modal"` aparecem uma única vez, com seus caminhos e linhas.
2. **Given** um uso semântico em componente `ui`, molecule, organism ou app, **When** sua responsabilidade é classificada, **Then** a camada Atomic e a categoria visual são registradas separadamente.
3. **Given** uma divergência entre fundamento, perfil e código, **When** a matriz é consolidada, **Then** a decisão canônica e o impacto da migração ficam explícitos antes da implementação.

### User Story 2 - Aplicar a escala semântica aos primitives e overlays (Priority: P1)

Como usuário do NutriDiet, quero que dialogs, sheets, selects, popovers, menus, tooltips e calendários permaneçam na ordem visual correta, para que o conteúdo ativo seja sempre interagível e o conteúdo inferior permaneça bloqueado quando necessário.

**Why this priority**: Primitives definem a infraestrutura compartilhada; qualquer ambiguidade neles se multiplica em todos os consumidores.

**Independent Test**: Abrir cada família de overlay isoladamente e dentro de um dialog; verificar a ordem visual, a interação com o conteúdo inferior, Escape, dismissal, foco inicial e retorno de foco.

**Acceptance Scenarios**:

1. **Given** um `Dialog` ou `Sheet` aberto, **When** backdrop e conteúdo são posicionados, **Then** o backdrop usa `z-overlay` e o painel usa `z-modal`, sem blur ou valor local.
2. **Given** um `Select` ou `Popover` fora de modal, **When** seu conteúdo abre, **Then** ele usa a camada flutuante correspondente ao seu contrato e não herda `z-modal` por padrão.
3. **Given** um `Select` ou `Popover` ancorado dentro de um dialog, **When** seu conteúdo abre, **Then** ele usa uma variação semântica fechada de contexto modal, fica acima do painel e continua acessível por teclado.
4. **Given** um tooltip aberto junto de qualquer overlay, **When** ele precisa comunicar contexto auxiliar, **Then** permanece acima das demais camadas e não contém interação indispensável.

### User Story 3 - Migrar consumidores sem decisões locais (Priority: P1)

Como implementador de telas, quero consumir tokens e contextos semânticos oficiais, para que páginas e molecules não precisem escolher números ou sobrescrever a infraestrutura dos primitives.

**Why this priority**: Os consumidores atuais são os pontos onde a escala perde significado e onde regressões de interação podem ficar ocultas.

**Independent Test**: Revisar os arquivos do inventário após a migração e executar a matriz de overlays, confirmando que não há `z-10`, `z-[N]`, `zIndex` inline ou classe local de camada fora de um primitive/recipe documentado.

**Acceptance Scenarios**:

1. **Given** os cinco ícones de busca de páginas e o link de nome em `PatientListTable`, **When** o empilhamento local é necessário, **Then** todos usam `z-raised` e continuam decorativos ou navegáveis conforme sua semântica atual.
2. **Given** `DatePickerField`, **When** o calendário abre, **Then** o consumidor não fornece `z-modal` diretamente e o popover continua acima do dialog quando o campo estiver em um modal.
3. **Given** a busca de ingredientes em `CreateRecipeModal`, **When** resultados existem, **Then** a lista usa um primitive/composto de overlay aprovado, mantém estados vazio/sem resultados, seleção por teclado e fechamento previsível, sem uma `div` flutuante ad hoc.
4. **Given** um formulário modal com vários selects, **When** um select abre, **Then** somente o contexto modal fechado é escolhido e nenhum consumidor repete uma classe de z-index.

### User Story 4 - Homologar regra, documentação e regressões (Priority: P2)

Como revisor do projeto, quero que o catálogo e os gates expressem a regra real de camadas, para que novas ocorrências não retornem silenciosamente ao código.

**Why this priority**: A correção só é sustentável quando a regra é reproduzível e verificável por outra pessoa.

**Independent Test**: Executar os gates de catálogo, legado, tipos, lint e testes focados; revisar a documentação dos fundamentos, categorias, perfis e registro sem findings bloqueantes.

**Acceptance Scenarios**:

1. **Given** a documentação do Design System e o runtime, **When** a regra `z-dropdown` versus `z-popover` é consultada, **Then** fundamento, categoria, perfil, receita e código usam a mesma semântica.
2. **Given** um novo uso numérico de z-index ou `z-[N]`, **When** os validadores rodam, **Then** o gate produz finding nominal e acionável.
3. **Given** uma mudança apenas de camada, **When** o fluxo é validado, **Then** conteúdo, dados, rotas, semântica, foco, zoom de 200% e acessibilidade existente permanecem preservados.

## Edge Cases

- Um overlay flutuante aberto dentro de um dialog não pode ficar atrás do backdrop ou do conteúdo modal.
- O fechamento de um select/popover interno deve devolver o foco ao trigger interno, sem fechar o dialog pai indevidamente.
- Um segundo dialog de confirmação aberto sobre um dialog de edição deve manter backdrop, conteúdo e foco na ordem modal correta.
- O `SheetContent` não pode compartilhar a mesma camada do backdrop, pois isso torna a ordem dependente da ordem do DOM.
- `DatePickerField` precisa manter suas células de 32px, foco visível, Escape, seleção e retorno de foco sob zoom de até 200%.
- A busca de ingredientes deve tratar nenhum resultado, resultados longos, rolagem e seleção sem deixar o overlay preso ao viewport.
- Tooltip não pode receber conteúdo interativo nem ser usado para informação indispensável.
- A matriz deve registrar explicitamente ausência de uso de `z-sticky`, `z-navigation` e `z-toast` em vez de criar substitutos locais.
- `z-[N]`, `z-index` inline e utilities numéricas padrão do Tailwind não podem permanecer fora de exceções formalmente aprovadas.

## Requirements

### Functional Requirements

- **FR-001**: A entrega deve manter uma matriz de auditoria com todas as ocorrências explícitas e semânticas de empilhamento em `src/`, incluindo fonte, linha, consumidor, Atomic layer, categoria visual, contexto, token efetivo, decisão e status.
- **FR-002**: A escala oficial deve ser a única escala permitida: `z-base`, `z-raised`, `z-sticky`, `z-navigation`, `z-dropdown`, `z-popover`, `z-overlay`, `z-modal`, `z-toast` e `z-tooltip`, com os valores definidos em `design-system/07-icons-motion-and-layers.md`.
- **FR-003**: O runtime não deve conter utilities numéricas de z-index, `z-[N]`, propriedade CSS `z-index` local ou `style.zIndex` para valores estáticos.
- **FR-004**: `DialogOverlay` e `SheetOverlay` devem usar `z-overlay`, enquanto `DialogContent` e `SheetContent` devem usar `z-modal`.
- **FR-005**: `SelectContent` deve usar `default` como contexto padrão e oferecer somente a variação semântica fechada `modal` para uso dentro de dialogs/sheets, com contrato documentado e teste de regressão.
- **FR-006**: `PopoverContent` e composições equivalentes devem possuir uma estratégia documentada para contexto modal, sem exigir que o consumidor aplique uma classe z-index diretamente.
- **FR-007**: A regra de mapeamento deve resolver a divergência entre `z-dropdown` e `z-popover`: `z-dropdown` será reservado a dropdowns/selects; `z-popover` será reservado a popovers ancorados; `z-overlay`/`z-modal` continuarão reservados a backdrop/painel modal.
- **FR-008**: Os seis consumidores atualmente classificados com `z-10` devem migrar para `z-raised` ou para o contrato semântico mais específico caso a auditoria de contexto demonstre outra responsabilidade.
- **FR-009**: `DatePickerField` não deve aplicar `z-modal` diretamente no `PopoverContent`; sua camada deve ser fornecida pelo contrato do overlay contextual.
- **FR-010**: A lista de resultados de ingredientes em `CreateRecipeModal` deve deixar de ser overlay manual ad hoc e usar composição aprovada de overlay, preservando busca, seleção, rolagem, estados e acessibilidade.
- **FR-011**: Fundamentos, categorias, perfis, token index, registro e implementação/compliance devem permanecer consistentes com a regra final, sem duplicar ou contradizer o contrato global.
- **FR-012**: O gate de conformidade deve detectar pelo menos utilities numéricas de z-index, `z-[N]`, `zIndex` estático e usos de tokens incompatíveis com a categoria/contexto declarado.
- **FR-013**: Testes devem cobrir a escala efetiva dos primitives, o contexto modal de selects/popovers, o `SheetContent`, os seis consumidores locais e a busca de ingredientes.
- **FR-014**: A migração não deve alterar modelos de dados, persistência, cálculo nutricional, rotas, conteúdo de negócio ou escopo desktop-only do produto.
- **FR-015**: A entrega documental deve permanecer como proposta para validação humana e nenhuma implementação deve ser executada antes de aprovação deste SDD e roteamento por `/speckit-implement`.

### Key Entities

- **Z-index token**: Nome semântico e valor oficial da escala de empilhamento.
- **Overlay context**: Contexto `default` ou `modal` que determina a camada de um conteúdo temporário sem expor valor numérico ao consumidor.
- **Z-index usage record**: Registro de uma ocorrência direta ou semântica, com fonte, consumidor, categoria, camada, token efetivo e decisão.
- **Exception record**: Exceção temporária com regra, escopo, responsável, substituto e data de revisão, quando uma divergência não puder ser eliminada imediatamente.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das 19 ocorrências explícitas e dos 10 consumidores semânticos identificados possuem registro único na matriz de auditoria.
- **SC-002**: O runtime termina com zero ocorrências de utilities numéricas de z-index, `z-[N]`, `zIndex` estático ou classe local não classificada.
- **SC-003**: Cada primitive e consumidor de overlay usa exatamente um token compatível com sua responsabilidade e contexto; nenhuma decisão permanece apenas em uma classe de página.
- **SC-004**: A documentação canônica e o código não apresentam divergência entre `z-dropdown`, `z-popover`, `z-overlay` e `z-modal`.
- **SC-005**: Os cenários de overlay isolado, overlay aninhado em modal, confirmação secundária, Escape, retorno de foco e zoom de 200% passam sem regressão observável.
- **SC-006**: Os gates de catálogo, legado, tipos, lint e testes focados terminam sem findings bloqueantes para o escopo.
- **SC-007**: Uma nova ocorrência numérica ou incompatível introduzida no escopo é detectada automaticamente antes da homologação.

## Assumptions

- A escala e os valores de `design-system/07-icons-motion-and-layers.md` são a fonte canônica; referências históricas em `refs/` não alteram a decisão.
- A API `SelectContent layer="modal"` e seus 10 consumidores já presentes no worktree são baseline parcial desta feature, não uma autorização para criar prop livre.
- Contextos modais são uma variação semântica fechada de infraestrutura, não uma nova categoria visual nem um token numérico novo.
- O produto continua web desktop a partir de 1024px, tema claro, WCAG 2.2 AA e composição Atomic existente.
- Primitives Shadcn/Radix permanecem genéricos; comportamento de domínio fica em molecules/organisms/pages.
- O SDD descreve uma migração posterior. Nenhuma alteração adicional de código, registro ou gate será executada nesta etapa.

## Out of Scope

- Implementar a migração ou alterar componentes nesta sessão documental.
- Criar ou alterar cores, sombras, motion, radius, tipografia ou breakpoints fora do que for estritamente necessário para a ordem de camadas.
- Criar suporte mobile/tablet, dark mode ou novos fluxos de produto.
- Alterar os valores oficiais da escala sem uma decisão de governança independente.
- Reauditar componentes sem uso de empilhamento, salvo para confirmar que não possuem `z-index` oculto ou inline.
