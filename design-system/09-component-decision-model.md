# 09 — Modelo de decisão de componentes

## 1. Sequência obrigatória

Antes de criar ou ampliar um componente, siga a sequência:

1. **Defina o problema**, sem propor ainda o componente.
2. **Procure capacidade existente** em `ui`, atoms, molecules e organisms.
3. **Compare responsabilidade, anatomia e comportamento**.
4. **Escolha** uso direto, configuração, variante, composição ou componente novo.
5. **Classifique em dois eixos independentes**: camada Atomic para dependência e categoria visual para aparência/comportamento.
6. **Defina o contrato mínimo**.
7. **Registre** a decisão e o estágio correspondente.

Nenhum dos eixos pode ser inferido do outro. Um `ui`, atom, molecule, organism ou template pode pertencer a qualquer categoria compatível com sua responsabilidade; a camada nunca autoriza criar cor, spacing, radius, tipografia ou estado próprio.

## 2. Matriz principal

| Situação | Decisão |
| --- | --- |
| Mesmo propósito, anatomia e comportamento | Usar o componente existente |
| Mesmo propósito; diferença expressável por propriedade já prevista | Configurar o componente existente |
| Mesmo propósito e anatomia; alternativa semântica pequena e fechada | Criar variante |
| Novo arranjo de capacidades existentes | Criar composição |
| Nova responsabilidade estável, novo comportamento ou nova semântica | Criar componente |
| Uso único, simples e ainda instável | Manter local na página ou feature |
| Uso único, mas interação complexa ou sensível à acessibilidade | Encapsular e registrar como experimental |

## 3. Quando criar uma variante

Uma variante é apropriada somente quando:

- a responsabilidade permanece a mesma;
- a anatomia essencial permanece a mesma;
- os estados fundamentais permanecem os mesmos;
- as alternativas formam um conjunto pequeno e nomeável;
- o consumidor não precisa conhecer detalhes internos para escolher.

Exemplos conceituais válidos:

- prioridade semântica de um botão;
- tamanho padronizado de um badge;
- estado tonal de uma mensagem.

Sinais de que **não** é uma variante:

- muda o fluxo da tarefa;
- remove ou acrescenta regiões estruturais importantes;
- exige propriedades exclusivas em cada alternativa;
- cria combinações booleanas inválidas;
- muda a semântica acessível do elemento.

Nesses casos, prefira composição ou componentes distintos.

## 4. Quando compor

Composição é apropriada quando o resultado:

- organiza componentes já existentes;
- possui slots ou regiões independentes;
- permite que o consumidor forneça conteúdo;
- não precisa duplicar o contrato interno dos filhos.

Prefira:

- `children`;
- slots nomeados;
- componentes compostos;
- dados estruturados quando a estrutura é realmente fechada.

Evite:

- uma propriedade para cada fragmento visual;
- componentes monolíticos que controlam conteúdo, navegação, dados e layout;
- duplicar API de um primitivo apenas para repassá-la.

## 5. Quando criar um componente novo

Um componente novo precisa satisfazer pelo menos um dos critérios:

- responsabilidade nova e recorrente;
- regra comportamental que deve ser consistente;
- interação complexa que merece isolamento e testes;
- requisito de acessibilidade difícil de garantir em cada uso;
- conceito de domínio reconhecido pelo produto;
- composição estável utilizada em mais de um contexto.

Além disso, deve existir:

- ao menos um consumidor real ou uma entrega aprovada;
- nome baseado em responsabilidade, não em aparência;
- camada arquitetural definida;
- contrato mínimo preenchido;
- ausência de equivalente funcional no inventário.

## 6. Quando manter local

Mantenha o código dentro da página ou feature quando:

- existe apenas um uso;
- a estrutura é curta;
- a responsabilidade ainda está mudando;
- não existe risco relevante de inconsistência ou acessibilidade;
- extrair agora criaria uma API especulativa.

Reavalie a extração quando:

- surgir um segundo consumidor;
- a mesma regra for copiada;
- o trecho ganhar estados ou comportamento próprio;
- os testes da página ficarem difíceis por causa dele;
- a responsabilidade receber um nome estável.

## 7. Perguntas de bloqueio

A proposta não deve prosseguir enquanto não responder:

1. Qual problema o componente resolve?
2. Qual componente existente foi avaliado?
3. Por que uma variante não basta?
4. Por que uma composição não basta?
5. Quem é o primeiro consumidor real?
6. Qual parte é genérica e qual parte é domínio?
7. Quais estados e requisitos acessíveis se aplicam?
8. Qual é a única categoria visual principal e quais traits compatíveis acrescentam capacidade?
9. A diferença proposta já está coberta por variante, composição, trait ou exceção temporária?

## 8. Exemplos no NutriDiet

| Necessidade | Resultado esperado |
| --- | --- |
| Botão com outra prioridade de ação, mesma anatomia | Variante de `Button` |
| Cabeçalho com avatar, metadados e ações de paciente | Composição de componentes menores |
| Busca de alimentos com semântica TACO | Molécula de domínio |
| Novo diálogo modal padrão | Compor ou configurar o primitivo `Dialog` |
| Campo isolado usado uma vez em formulário experimental | Manter local |
| Seletor de alimento com busca, seleção e regras próprias | Novo componente de domínio |

## 9. Decisão por categoria visual

Depois de decidir reutilizar, configurar, variar, compor ou criar, aplique esta ordem:

1. Consulte os critérios de `Includes` e `Excludes` das onze categorias em `design-system/components/categories/`.
2. Escolha exatamente uma categoria pela responsabilidade visual central.
3. Adicione somente traits listados como permitidos pela categoria e compatíveis no registro.
4. Herde anatomia, geometria, tipografia, tokens, estados, interação e acessibilidade da categoria.
5. Registre no perfil apenas anatomia, variantes e estados particulares da família.
6. Se a categoria não cobrir a proposta, avalie trait ou exceção antes de propor uma categoria nova.

| Diferença encontrada | Decisão obrigatória |
| --- | --- |
| Mesmo contrato de categoria e mesma anatomia | Reutilizar/configurar componente |
| Mesmo contrato e alternativa semântica fechada | Variante permitida pela categoria |
| Capacidade transversal já registrada | Trait compatível |
| Arranjo novo de famílias existentes | Composição em layer superior |
| Divergência temporária com migração conhecida | Exceção com responsável e prazo |
| Responsabilidade recorrente não coberta | Componente novo na categoria existente |
| Anatomia, estados e tokens compartilhados não cobertos por três famílias | Proposta formal de categoria; implementação bloqueada até decisão |

## 10. Categorias disponíveis

| Category ID | Use quando a responsabilidade central é |
| --- | --- |
| `actions` | executar comando imediato |
| `fields` | capturar/editar texto, número ou busca |
| `selection` | escolher estado, modo ou opção |
| `navigation` | mover entre destinos/contextos |
| `surfaces` | agrupar conteúdo local |
| `data-display` | apresentar dado ou identidade genérica |
| `feedback` | comunicar status, resultado ou severidade |
| `overlays` | apresentar conteúdo temporário em camada |
| `loading` | representar espera ou progresso |
| `nutrition-domain` | representar macro, caloria, alimento, receita ou refeição |
| `structure` | organizar shell, container, grid ou região de página |

O documento da categoria, o registro e o perfil resolvem a decisão final; esta tabela é apenas roteamento.

## 11. Evolução sem proliferação

Antes de propor nova categoria, tente nesta ordem: componente existente, variante fechada, composição, trait compatível e exceção temporária. Uma nova categoria só é elegível quando a diferença compartilhada inclui anatomia, estados e tokens, aparece em pelo menos três famílias independentes e não pode ser resolvida pelas onze categorias estáveis.

Toda proposta recebe lifecycle `proposed`, decisão em `category-decisions.md`, contrato completo antes de `experimental` e consumidor real antes de `stable`. Categoria deprecated bloqueia novos consumers; categoria removed bloqueia toda referência.
