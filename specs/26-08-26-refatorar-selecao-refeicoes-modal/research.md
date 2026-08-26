# Research: Refeições reutilizáveis no modal de seleção

## Decision: manter o armazenamento local existente

- **Decision**: Evoluir `readyMealsStore` e `recipesStore` sobre o `localStorage` já usado pelo produto.
- **Rationale**: O produto é local-first nesta etapa, não possui integração externa necessária para esse fluxo e já tem testes e utilitários para os dois armazenamentos.
- **Alternatives considered**: Criar uma API ou migrar para banco remoto; rejeitado porque amplia o escopo e não reduz a fricção do fluxo de montagem.

## Decision: usar um snapshot de composição completa

- **Decision**: Refeições prontas devem persistir os itens em gramas, seus valores nutricionais e as opções completas; o resumo visual deve ser derivado ou mantido como compatibilidade.
- **Rationale**: O armazenamento atual guarda somente `itemsCount` e `itemsPreview`, que não permite reconstruir a refeição sem recadastro manual.
- **Alternatives considered**: Continuar salvando somente resumo; rejeitado porque impede inserção completa e reutilização confiável.

## Decision: aplicar a refeição pronta ao card ativo

- **Decision**: A seleção no modal acrescenta o snapshot à refeição ativa atual, sem criar um novo card e sem apagar os itens já existentes.
- **Rationale**: O modal atual é aberto a partir de uma refeição específica e seu contrato adiciona alimentos a essa refeição; preservar esse modelo reduz mudanças mentais e mantém o fluxo rápido.
- **Alternatives considered**: Criar automaticamente uma nova refeição ou substituir o conteúdo atual; rejeitado por aumentar surpresa e risco de perda de dados.

## Decision: opções completas como alternativa principal

- **Decision**: A reutilização deve transportar opções completas editáveis; a substituição individual permanece como ação rápida para uma troca pontual.
- **Rationale**: Opções completas permitem ao nutricionista calibrar todos os alimentos e são mais fáceis para o paciente seguir do que uma lista de trocas isoladas.
- **Alternatives considered**: Modelar somente substituições de alimento; rejeitado como fluxo principal por exigir várias decisões e não representar uma refeição completa.

## Decision: cálculo proporcional por macro de referência

- **Decision**: Uma opção registra um macro de referência entre proteína, carboidratos e gorduras, além do valor-alvo da composição base. A sugestão de gramas escala a composição candidata para aproximar esse valor; depois do cálculo, cada item continua editável.
- **Rationale**: A regra é auditável, preserva o controle clínico e atende ao requisito de equivalência sem introduzir medidas caseiras.
- **Alternatives considered**: Fixar porções pré-definidas ou esconder o cálculo em um resultado não editável; rejeitado por reduzir flexibilidade do nutricionista.

## Decision: validação determinística e local

- **Decision**: Regras de gramatura, macro de referência, composição válida e conversão entre tipos serão funções puras cobertas por testes unitários; os componentes terão testes de interação nos fluxos críticos.
- **Rationale**: O projeto exige isolamento e determinismo, e cálculos nutricionais não devem depender de ambiente externo ou estado global.
- **Alternatives considered**: Validar somente no componente visual; rejeitado porque duplicaria regras e deixaria stores e hooks vulneráveis a estados inválidos.
