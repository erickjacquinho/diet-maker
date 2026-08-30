# Feature Specification: Button Group Diet Mode Switcher

**Feature Branch**: `09-08-26-button-group-diet-mode-switcher`

**Created**: 2026-08-09

**Status**: Approved (Specified & Clarified)

**Input**: User description: "vamos substituir entao por Button Groups. use /shadcn para essa implementaçao. cire um /sdd simpels apenas para essa tarefa dos botoes. nao deve implementar o botao e mudar a aparencia dele. quero algo totalmente igual ao vanilla, porem com nossas cores e hover. o Button Group precisa ter state selected. ele deve ser um alternador, mas que trabalha como Button Group, exibindo o que esta ativo no momento."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seleção de Modelo de Dieta via Button Group (Priority: P1)

Como nutricionista montando um plano alimentar, quero alternar o modelo de dieta entre "Dieta Simples" e "Ciclo de Carboidratos" utilizando um Button Group (Segmented Switcher) nativo shadcn com indicação clara do estado selecionado e tokens de cor do projeto, para que a navegação seja limpa, coesa e com resposta tátil/visual imediata.

**Why this priority**: É a escolha primária do modelo de prescrição. Determina se as opções de ciclo de carboidratos devem ser exibidas ou ocultadas.

**Independent Test**: Pode ser testado clicando nas opções "Dieta Simples" e "Ciclo de Carboidratos" no Button Group, verificando a troca de estado visual selecionado e a visibilidade dos controles subsequentes.

**Acceptance Scenarios**:

1. **Given** que o nutricionista está na tela de prescrição, **When** ele visualiza o Button Group de modelo de dieta, **Then** exatamente um dos botões ("Dieta Simples" ou "Ciclo de Carboidratos") exibe o estado selecionado (`aria-pressed="true"` / `data-state="on"` ou `active`) com as cores e hover do nosso design system.
2. **Given** que "Dieta Simples" está selecionada, **When** o nutricionista clica em "Ciclo de Carboidratos", **Then** a seleção alterna suavemente para "Ciclo de Carboidratos", emitindo a propriedade `onModeChange('carb_cycling')` e revelando as opções de ciclo.

---

### User Story 2 - Seleção de Quantidade de Variações via Button Group (Priority: P2)

Como nutricionista que escolheu o modo "Ciclo de Carboidratos", quero selecionar entre 2 Variações (Alto/Baixo) e 3 Variações (Alto/Médio/Baixo) usando um Button Group compacto shadcn, para ajustar a complexidade da rotina do paciente.

**Why this priority**: Define a quantidade de dias/variações que compõem o ciclo alimentar.

**Independent Test**: Pode ser testado clicando em "2 Variações" e "3 Variações" e validando que o número de botões de variação exibidos altera de 2 para 3 imediatamente.

**Acceptance Scenarios**:

1. **Given** que o modo "Ciclo de Carboidratos" está ativo, **When** o nutricionista clica no segmento "3 Variações", **Then** o estado selecionado é atualizado para 3 variações, chamando `onVariationsCountChange(3)` e exibindo as 3 variações ativas.

---

### User Story 3 - Alternância de Variação Ativa via Button Group Segmentado (Priority: P3)

Como nutricionista editando um ciclo de carboidratos, quero alternar entre as variações (Dia A - Alto, Dia B - Baixo, Dia C - Médio) usando um Button Group segmentado com badges de macros integrados, para visualizar e editar o cardápio do dia escolhido.

**Why this priority**: Permite navegar entre os cardápios diários do ciclo sem poluição visual de cards empilhados.

**Independent Test**: Alternar entre Dia A, Dia B e Dia C no Button Group e confirmar que a refeição editada abaixo responde ao ID do dia ativo correspondente (`onSelectVariation(id)`).

**Acceptance Scenarios**:

1. **Given** que o ciclo possui 2 ou 3 variações, **When** o nutricionista clica em uma das variações do Button Group, **Then** essa variação assume o estado selecionado (`state selected`) destacando visualmente suas informações (meta kcal/carbos) com as cores do tema e ativando a edição das refeições correspondentes.

---

### Edge Cases

- **Troca de Modo com Edições em Andamento**: Ao alternar de "Ciclo de Carboidratos" para "Dieta Simples", a interface deve preservar os dados das variações no armazenamento sem perda.
- **Variação Inexistente Selecionada**: Se `activeVariationId` for inválido ou ausente, o Button Group deve selecionar por padrão o primeiro item (`variations[0].id`).
- **Telas Estreitas / Mobile**: Em resoluções móveis (<640px), o Button Group deve ajustar seu layout flexível (wrapping ou scroll suave) mantendo os botões acessíveis e com área de toque mínima de 44px.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente MUST utilizar componentes de alternância nativos do `shadcn/ui` (`ToggleGroup` / `ToggleGroupItem` ou `Tabs` estilizados com a API padrão do shadcn), mantendo o comportamento vanilla sem redefinir a estrutura base dos botões.
- **FR-002**: O Button Group MUST operar no modo alternador exclusivo (`type="single"`), garantindo que apenas um item permaneça selecionado por grupo a cada instante.
- **FR-003**: Os botões MUST exibir o estado selecionado (`state selected`) usando os tokens semânticos de cores do projeto (ex: `bg-surface`, `border-success` ou `bg-primary` para ativo, `hover:bg-surface-hover` para hover, `text-text-primary` e `text-text-muted`).
- **FR-004**: O visual do botão MUST ser mantido limpo e fiel ao design vanilla de componentes shadcn/ui, sem alterações radicais na geometria ou elevação, adicionando apenas os nossos tokens de cores e estados interativos.
- **FR-005**: O componente MUST manter total compatibilidade de contrato com a interface `DietModeSwitcherProps`, preservando todos os callbacks (`onModeChange`, `onVariationsCountChange`, `onSelectVariation`, `onCopyMealsBetweenVariations`).
- **FR-006**: Todos os botões e elementos interativos do Button Group MUST possuir suporte completo a acessibilidade (atributos `aria-pressed`, `aria-label`, navegação via teclado e foco visível).

### Key Entities

- **DietMode**: Enumeração contendo `'simple' | 'carb_cycling'`.
- **VariationsCount**: Número inteiro `2 | 3`.
- **CarbCyclingVariation**: Objeto contendo `id`, `name`, `type ('high' | 'medium' | 'low')`, `targetKcal`, `targetCarbs`, e lista de refeições.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O nutricionista consegue alternar entre o modo Simples e Ciclo de Carboidratos em 1 único clique com resposta visual imediata (<50ms).
- **SC-002**: Redução de pelo menos 40% na altura ocupada pelos controles de variação em comparação com o layout de cards em grid anterior.
- **SC-003**: 100% de conformidade com os tokens de design do projeto para estados normal, hover, foco e selecionado (`selected`).
- **SC-004**: Zero regressões nas propriedades e comportamentos existentes de `DietModeSwitcher`.

## Assumptions

- O projeto já possui a biblioteca `shadcn/ui` (ou componentes base Radix / Tailwind em `src/components/ui/`) instalada e configurada.
- Os tokens de cores semânticas (`bg-surface`, `border-border-subtle`, `text-text-primary`, `bg-surface-subtle`, `text-success`, etc.) estão definidos no arquivo CSS global e utilitário `cn()`.
- O botão "Copiar Refeições entre Dias" continuará funcional utilizando a mesma prop `onCopyMealsBetweenVariations`.
