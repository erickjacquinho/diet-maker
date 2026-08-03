# 02 — Linguagem visual

## 1. Direção

A interface do NutriDiet deve transmitir **clareza clínica com calor humano**.

Ela combina:

- base clara e levemente quente;
- superfícies silenciosas;
- tipografia escura e objetiva;
- alta densidade somente onde os dados exigem;
- respiro suficiente para impedir fadiga;
- cor concentrada em ações e informações relevantes.

O resultado esperado é profissional, calmo e preciso. Não deve parecer um painel corporativo genérico, um aplicativo infantil de bem-estar ou uma interface hospitalar fria.

## 2. Síntese das referências

As imagens em `refs/UI/` não são layouts a serem copiados. Cada uma contribui com um princípio:

| Referência | Princípio extraído |
| --- | --- |
| `ref-habit-tracker.png` | Leveza, rotina compreensível, categorias e respiro |
| `ref-kucoin-dashboard.png` | Hierarquia eficiente para dados densos |
| `ref-shadcn-bento.png` | Modularidade, precisão e composição em blocos |
| `ref-toast-notifications.png` | Cor contextual localizada e feedback reconhecível |

Elementos incidentais das referências não se tornam regra automaticamente. A síntese do produto prevalece sobre a reprodução literal.

## 3. Princípios visuais

### 3.1 Base quente e silenciosa

O canvas principal usa off-white quente. Superfícies de conteúdo usam branco ou um off-white mais claro.

A diferença entre canvas, superfície e subárea deve ser sutil. A interface não depende de grandes blocos coloridos para construir estrutura.

### 3.2 Escassez cromática

A maior parte da tela permanece neutra. A cor primária aparece quando existe uma razão funcional:

- ação principal;
- seleção;
- navegação ativa;
- foco;
- progresso importante;
- destaque de uma série ou informação prioritária.

Se muitas regiões usam a cor primária ao mesmo tempo, ela deixa de orientar atenção.

### 3.3 Contraste direciona a tarefa

Existem três níveis de contraste:

| Nível | Uso |
| --- | --- |
| Alto | Títulos, valores principais, CTA, seleção ativa e informação crítica |
| Médio | Texto de leitura, labels, controles e ações secundárias |
| Baixo | Metadados, divisores, bordas e organização estrutural |

Baixo contraste não significa texto ilegível. Conteúdo necessário para concluir uma tarefa deve manter contraste acessível.

### 3.4 Hierarquia antes de decoração

Ordem, agrupamento, tipografia, espaço e contraste devem resolver a hierarquia antes da adição de ornamento.

Não usar cor, sombra, ícone ou badge apenas para preencher espaço.

### 3.5 Flat, mas não sem profundidade

A estrutura deve ser percebida principalmente por:

- mudança sutil de superfície;
- bordas finas;
- espaçamento;
- agrupamento;
- sobreposição apenas quando funcional.

Sombras fortes e efeitos tridimensionais não pertencem à linguagem principal. Overlays e notificações podem usar elevação discreta quando necessária para comunicar que estão acima do conteúdo.

### 3.6 Dados densos com respiro

Tabelas, métricas e formulários podem ser compactos. Seções distintas precisam de separação clara e ritmo consistente.

A densidade é planejada para uso web em desktop. Não é necessário transformar tabelas ou fluxos densos em experiências equivalentes para mobile ou tablet.

Evitar simultaneamente:

- cards excessivamente grandes com pouco conteúdo;
- informação comprimida sem agrupamento;
- um card para cada texto;
- grades bento usadas apenas como decoração.

### 3.7 Arredondamento contido

O arredondamento existe somente para suavizar a interface. Controles possuem raio pequeno e superfícies ficam apenas um nível acima. Pills e raios grandes não pertencem à linguagem.

### 3.8 Bordas discretas

Bordas são detalhes de separação, não contornos decorativos.

Bordas possuem 1px, baixo contraste e função clara. Foco, seleção e erro usam indicadores adicionais; espessura nunca muda.

### 3.9 Espaçamento e dimensionamento

Spacing usa grade de 4px e relações semânticas fechadas. Componentes não escolhem padding, gap, margem ou tamanho localmente.

### 3.10 Ícones funcionais

Ícones devem reforçar significado, navegação ou ação. Não substituem labels quando o significado não é universal.

Usar uma única família vetorial e manter consistência de traço. Emojis não fazem parte da linguagem dos controles.

Valores e regras completas de geometria estão em [06 — Geometria e layout desktop](./06-geometry-and-desktop-layout.md). Ícones, movimento e camadas estão em [07 — Ícones, movimento e camadas](./07-icons-motion-and-layers.md).

## 4. Regra de protagonismo

Em cada região visual deve existir, normalmente, um único elemento de maior destaque.

Exemplos:

- um CTA primário em um formulário;
- um valor principal em um card de métrica;
- uma série destacada em um gráfico;
- um item ativo na navegação.

Se tudo possui alto contraste, nada possui prioridade.

## 5. Uso da cor primária

O azul principal contrasta deliberadamente com a base quente.

Usar em:

- botão primário;
- link de ação;
- item selecionado;
- navegação ativa;
- foco;
- progresso geral;
- série principal de gráfico.

Evitar em:

- grandes fundos de página;
- todos os títulos;
- bordas de todos os cards;
- decoração sem ação;
- estados negativos;
- representação de macronutrientes.

## 6. Critério de conformidade

Uma tela está alinhada quando:

- a base quente domina a área total;
- conteúdo e estrutura continuam compreensíveis em escala de cinza;
- a cor primária identifica ações e prioridades;
- macros e feedback aparecem apenas em seus contextos;
- existe contraste alto onde o usuário deve agir ou decidir;
- áreas auxiliares permanecem visualmente silenciosas;
- controles relacionados compartilham `radius-control` e superfícies usam no máximo `radius-surface`;
- bordas estruturais possuem `1px` e permanecem subordinadas ao conteúdo;
- todo espaçamento e dimensionamento de controle pertence à escala aprovada;
- permanece funcional nas larguras desktop oficialmente suportadas;
- a tela não depende de sombra ou saturação para parecer organizada.
