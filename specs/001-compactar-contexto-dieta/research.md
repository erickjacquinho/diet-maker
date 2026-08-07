# Research: Compactação do quadro de contexto da dieta

## Decision 1: Preservar uma única superfície com duas regiões

**Decision**: Manter o `Surface` existente e organizar o quadro em duas regiões estáveis: identidade do paciente à esquerda e escolha do modelo à direita.

**Rationale**: O pedido é reduzir ruído dentro do quadro, não criar novas superfícies. A divisão vertical já comunica a relação entre os contextos sem competir com o restante da página.

**Alternatives considered**:

- Dois cards internos: rejeitado porque aumenta a fragmentação visual.
- Remover toda divisão: rejeitado porque reduz a leitura de que os dois grupos pertencem ao mesmo contexto.

## Decision 2: Reutilizar as variantes existentes

**Decision**: Compor `PatientBadgeHeader` com `compact` e `DietModeSwitcher` com `embedded`, preservando suas APIs públicas.

**Rationale**: A regra de decisão do design system prioriza usar, configurar e compor antes de criar. Os dois componentes já representam exatamente identidade e seleção de modo.

**Alternatives considered**:

- Criar um novo componente `DietContextHeader`: rejeitado por duplicar responsabilidades já cobertas e aumentar a superfície do catálogo.
- Reescrever o seletor diretamente no template: rejeitado porque deslocaria estado e acessibilidade para o nível errado.

## Decision 3: Remover redundância de conteúdo, não de contexto

**Decision**: Peso fica no badge do paciente; objetivo fica como texto secundário sem repetir a unidade do peso. O título `Modelo de dieta` e os labels das opções permanecem.

**Rationale**: A análise do `ui-ux-pro-max` prioriza hierarquia escaneável, tipografia consistente e acessibilidade; resumir não pode remover nomes, unidades ou estados necessários.

**Alternatives considered**:

- Mostrar somente o nome do paciente: rejeitado porque peso e objetivo orientam a prescrição.
- Remover o título do grupo de dieta: rejeitado porque o conjunto perderia nome acessível e contexto semântico.

## Decision 4: Manter o comportamento de seleção

**Decision**: Não alterar callbacks, estados ou regras condicionais de dieta simples/ciclo de carboidratos; apenas compactar a apresentação da variante embutida.

**Rationale**: A mudança solicitada é visual. O seletor já usa radio semantics, foco por teclado e revela os controles do ciclo progressivamente.

**Alternatives considered**:

- Substituir por um `Select`: rejeitado porque esconderia as duas opções e mudaria a interação existente.
- Converter em tabs de navegação: rejeitado porque a escolha é de modo, não de rota.

## Decision 5: Limitar o escopo ao desktop canônico

**Decision**: Validar a faixa 1024px–1440px+ usando tokens existentes, sem criar variações mobile/tablet.

**Rationale**: O design system do projeto define produto desktop a partir de 1024px e proíbe breakpoints mobile para esta tela.

**Alternatives considered**:

- Criar uma pilha responsiva para mobile: rejeitado por estar fora do escopo do produto.
