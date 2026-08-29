# Research: Variações de Refeições

**Feature**: [spec.md](spec.md)  
**Date**: 2026-08-28

## Decision 1: Evolução compatível do modelo de refeição

**Decision**: Tratar `DietMeal` como o grupo de refeição, mantendo seus campos atuais de identidade (`id`, `name`, `time`) e seus `items` como a Variação 1. Adicionar uma coleção opcional de variações extras para as opções 2 a 5.

**Rationale**:

- O modelo atual já é usado pela Dieta Simples e por `CarbCyclingVariation.meals`.
- Dietas salvas existentes não possuem variações e devem continuar abrindo sem migração destrutiva.
- A identidade compartilhada fica representada uma única vez.
- O card atual continua recebendo uma refeição e pode exibir uma opção por vez.
- A alteração é aditiva e reduz o risco de quebrar históricos, resumos e fluxos que ainda leem `items`.

**Alternatives considered**:

1. **Grupo totalmente normalizado com `variants[]` obrigatório**: representa o domínio com pureza, mas exige converter todas as refeições existentes e revisar mais consumidores que atualmente acessam `meal.items` diretamente.
2. **Variações como refeições irmãs com `groupId`**: aproveita a lista atual, mas aumenta o risco de somar ou mostrar opções como horários independentes e exige reagrupar dados em muitos fluxos.
3. **Representação aditiva selecionada**: preserva o contrato atual da refeição, mantém compatibilidade e permite evoluir para normalização futura se o domínio exigir.

## Decision 2: Seleção ativa fora dos dados clínicos

**Decision**: Manter a opção aberta como estado de edição/visualização controlado pelo construtor, sem persistir uma escolha do paciente no plano.

**Rationale**:

- A especificação exige Variação 1 como opção inicial ao reabrir a dieta.
- Criar uma opção deve abrir a nova opção imediatamente para edição.
- Trocar a opção ativa precisa atualizar os dados exibidos e os totais sem alterar as demais.
- A seleção pode ser isolada por refeição e por dia do ciclo sem contaminar o conteúdo clínico salvo.

**Alternatives considered**:

1. Persistir a última opção aberta: contradiz o padrão inicial da Variação 1 e mistura estado de edição com prescrição.
2. Usar uma única seleção global: não representa refeições diferentes nem os grupos isolados de cada dia do ciclo.
3. Manter seleção controlada por contexto de plano/dia + refeição: selecionada por reduzir vazamento entre grupos e permitir defaults determinísticos.

## Decision 3: Tabs existentes para a interação

**Decision**: Compor o `MealCardContainer` com o primitivo de tabs existente, exibindo os controles somente quando o grupo possuir duas ou mais variações.

**Rationale**:

- O design system já possui a família `ui-tabs` e contrato de seleção para painéis.
- A tab pode controlar o conteúdo da opção ativa sem criar uma segunda refeição visual.
- O estado sem variações permanece igual ao fluxo atual.
- O contrato de acessibilidade existente cobre nome do grupo, estado selecionado, foco e teclado.

**Alternatives considered**:

1. Criar um componente genérico novo em `src/components/ui`: rejeitado por duplicar um primitivo existente e violar a preservação de Shadcn/Radix.
2. Usar apenas badges clicáveis sem semântica de tab: rejeitado porque seleção e painel precisam ser anunciados por tecnologia assistiva.
3. Usar `ui-tabs` composto no card: selecionado; exige que labels sejam derivados da posição e que a superfície do card não ganhe uma nova hierarquia visual.

## Decision 4: Operações nutricionais por opção

**Decision**: Projetar cada operação de alimento para receber o identificador da refeição e da variação ativa; projetar a opção ativa para os cálculos e para o conteúdo do card.

**Rationale**:

- Inclusão, remoção, substituição, duplicação, reordenação, quantidade e escala devem afetar somente a opção aberta.
- Os totais devem somar uma opção por grupo, nunca todas as opções.
- O mesmo contrato pode ser usado na Dieta Simples e no dia ativo do Ciclo de Carboidratos.

**Alternatives considered**:

1. Manter ações indexadas somente por posição da refeição: frágil após inserções e incapaz de distinguir variações dentro do mesmo card.
2. Aplicar alterações a todas as opções: contradiz a independência confirmada pelo usuário.
3. Endereçar cada mutação pelo contexto + `mealId` + `variationId`: selecionado por manter a atualização localizada e testável.

## Decision 5: Compatibilidade e cópias

**Decision**: Interpretar dados antigos sem coleção de variações como uma refeição de opção única; ao criar ou duplicar, gerar cópias independentes dos alimentos e ids internos.

**Rationale**:

- Não há necessidade de alterar dietas existentes antes de serem editadas.
- A duplicação precisa evitar referências compartilhadas entre origem e destino.
- Labels são derivados da posição atual, portanto exclusões podem renumerar sem reescrever nomes clínicos.

**Alternatives considered**:

1. Converter todo o armazenamento na abertura: aumenta superfície de risco e pode modificar dados sem ação explícita.
2. Compartilhar os mesmos objetos de alimentos entre cópias: permitiria alterações acidentais cruzadas.
3. Normalizar sob demanda e clonar profundamente na criação/duplicação: selecionado por compatibilidade e isolamento.

## Known constraints carried into planning

- O produto é desktop a partir de 1024px; mobile/tablet permanecem fora de escopo.
- O layout do card de opção única não deve ser redesenhado.
- O limite de produto é de cinco opções por refeição.
- Nome e horário são compartilhados; alimentos, quantidades e macros calculados são independentes.
- A exportação para paciente, PDF e WhatsApp não será ampliada nesta entrega.
- A categoria `selection`, o perfil `ui-tabs` e o perfil `organism-meal-card-container` são as fontes canônicas de composição e estados visuais.
