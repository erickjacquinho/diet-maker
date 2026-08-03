# 11 — Contrato de componente

## 1. Contrato mínimo

Antes de um componente ser considerado estável, sua documentação deve responder:

| Campo | Conteúdo obrigatório |
| --- | --- |
| Nome | Nome público baseado na responsabilidade |
| Propósito | Problema resolvido em uma frase |
| Não usar quando | Limites e alternativas |
| Camada | `ui`, atom, molecule, organism ou template |
| Natureza | Genérico ou domínio |
| Anatomia | Regiões, slots e filhos relevantes |
| API pública | Propriedades, eventos, filhos e valores padrão |
| Variantes | Alternativas semânticas fechadas |
| Estados | Estados aplicáveis e comportamento esperado |
| Tipografia | Text styles usados por cada região |
| Cores | Papéis semânticos e tons permitidos |
| Geometria | Tokens permitidos de raio, borda, spacing e dimensão, incluindo exceções |
| Ícones e movimento | Ícones, tamanhos e recipes aplicáveis |
| Adaptação desktop | O que muda com a largura da janela desktop, se aplicável |
| Semântica | Elemento, papel e relacionamento acessível |
| Teclado e foco | Interações aplicáveis |
| Dependências | Primitivos e componentes usados |
| Consumidores | Usos reais conhecidos |
| Testes | Cobertura proporcional ao risco |
| Estágio | Experimental, estável ou depreciado |

Um componente simples pode registrar isso em uma seção curta. O contrato não exige um arquivo exclusivo para cada componente.

## 2. Modelo reutilizável

```md
## ComponentName

- Propósito:
- Não usar quando:
- Camada:
- Natureza: genérico | domínio
- Estágio: experimental | estável | depreciado
- Base:
- Consumidores:

### Anatomia

### API pública

### Estados aplicáveis

### Tokens e text styles

### Acessibilidade

### Exemplos essenciais

### Testes

### Migração
```

`Migração` é obrigatória apenas para componente depreciado ou mudança incompatível.

## 3. Regras para API pública

Uma API deve:

- usar nomes do problema, não da implementação;
- manter o menor número de propriedades suficiente;
- preferir tipos discriminados quando alternativas possuem contratos diferentes;
- preferir `children` ou slots para conteúdo estrutural;
- expor callbacks como fatos ocorridos, não detalhes internos;
- preservar compatibilidade por padrão;
- documentar valores padrão relevantes.

Evite:

- propriedades booleanas que se contradizem;
- propriedades de estilo que contornam tokens e padrões;
- repassar toda a API interna sem necessidade;
- aceitar tanto estado controlado quanto não controlado sem contrato claro;
- retornar estruturas internas em callbacks;
- propriedades antecipadas sem consumidor.

## 4. Estados aplicáveis

Não existe uma matriz universal obrigatória para todos os componentes. Documente e implemente apenas estados pertinentes.

### 4.1 Controles acionáveis

Avaliar:

- default;
- hover, quando existe ponteiro;
- active/pressed;
- focus-visible;
- disabled;
- loading, quando existe operação assíncrona.

### 4.2 Campos e seleção

Avaliar:

- vazio;
- preenchido;
- focus-visible;
- inválido;
- disabled;
- read-only;
- loading, quando sugestões ou validação forem assíncronas.

### 4.3 Conteúdo assíncrono

Avaliar:

- inicial;
- loading;
- sucesso com dados;
- vazio;
- erro;
- atualização preservando dados anteriores.

### 4.4 Seleção

Avaliar:

- não selecionado;
- selecionado;
- seleção parcial, quando aplicável;
- disabled;
- focus-visible.

Estados impossíveis ou irrelevantes devem ser omitidos, não simulados.

## 5. Acessibilidade

Para todo componente interativo:

- usar elemento HTML nativo adequado sempre que possível;
- fornecer nome acessível;
- permitir operação completa por teclado;
- tornar foco visível;
- preservar ordem de foco lógica;
- comunicar estado, erro e mudança relevante;
- não depender apenas de cor, posição ou movimento;
- respeitar comportamento do primitivo Radix/Shadcn utilizado.

Requisitos adicionais:

- dialogs devem possuir título acessível, foco inicial deliberado e restauração de foco;
- campos devem possuir label ou nome equivalente;
- erros devem estar associados ao campo;
- controles de ícone precisam de nome acessível;
- loading não deve remover silenciosamente contexto necessário;
- conteúdo atualizado de forma assíncrona deve ser anunciado quando necessário.

## 6. Documentação e exemplos

O mínimo para um componente estável:

- um exemplo principal;
- um exemplo de limite ou estado relevante;
- descrição curta de uso e não uso;
- API pública tipada;
- consumidores reais identificados.

Storybook pode ser adotado quando a quantidade de componentes ou colaboração justificar catálogo interativo. No estágio atual, documentação Markdown, a rota local de catálogo e testes automatizados são suficientes, desde que permaneçam atualizados.

## 7. Adaptação de largura

O contrato não precisa especificar comportamentos para mobile ou tablet.

Quando o componente variar dentro do desktop, documentar somente:

- largura mínima funcional;
- wrapping permitido;
- truncamento;
- overflow;
- reorganização de colunas;
- comportamento em zoom;
- regiões que permanecem fixas ou fluidas.

## 8. Estratégia de testes

Teste comportamento público, não detalhes internos.

| Risco | Cobertura esperada |
| --- | --- |
| Componente puramente estrutural | Renderização e composição principal |
| Controle interativo | Eventos, teclado, foco e disabled |
| Formulário | Entrada, validação, erro e associação acessível |
| Assíncrono | Loading, sucesso, vazio e erro aplicáveis |
| Componente de domínio | Regras e transformações relevantes |
| Regressão crítica | Teste que reproduza o defeito |

Snapshots extensos não substituem afirmações comportamentais.

## 9. Checklist de aceite

Um componente pode ser promovido a estável quando:

- [ ] resolve responsabilidade explícita;
- [ ] não duplica capacidade existente;
- [ ] variante e composição foram consideradas;
- [ ] camada e natureza estão corretas;
- [ ] API pública está tipada e documentada;
- [ ] estados aplicáveis foram definidos;
- [ ] todo texto está associado a style do catálogo;
- [ ] cores e ícones usam papéis semânticos permitidos;
- [ ] geometria usa apenas os tokens permitidos;
- [ ] toda borda existente possui `1px` e papel semântico definido;
- [ ] spacing, padding e dimensões usam somente a escala e receitas aprovadas;
- [ ] acessibilidade foi validada;
- [ ] possui consumidor real;
- [ ] testes cobrem o risco principal;
- [ ] foi incluído no registro;
- [ ] documentação visual ou funcional relacionada foi atualizada.
