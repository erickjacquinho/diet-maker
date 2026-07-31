# 04 — Sistema de cores

## 1. Princípio

O sistema usa quatro famílias com responsabilidades distintas:

1. **neutros quentes** para estrutura e leitura;
2. **azul primário** para produto e interação;
3. **cores nutricionais** para macronutrientes;
4. **cores semânticas** para feedback do sistema.

Uma cor não deve trocar de significado apenas para atender uma preferência visual local.

## 2. Neutros quentes

### 2.1 Tokens de referência

| Token | Valor |
| --- | --- |
| `ref.color.warm.0` | `#FFFFFF` |
| `ref.color.warm.25` | `#FAF8F4` |
| `ref.color.warm.50` | `#F5F3EE` |
| `ref.color.warm.100` | `#F0EDE6` |
| `ref.color.warm.150` | `#ECE8E1` |
| `ref.color.warm.200` | `#E4E0D8` |
| `ref.color.warm.300` | `#CBC5BA` |
| `ref.color.warm.500` | `#9FA39F` |
| `ref.color.warm.600` | `#858A84` |
| `ref.color.warm.700` | `#686F69` |
| `ref.color.warm.800` | `#5E645F` |
| `ref.color.warm.950` | `#1C211F` |

### 2.2 Tokens semânticos

| Token conceitual | Valor | Função |
| --- | --- | --- |
| `canvas` | `#F5F3EE` | Fundo principal da aplicação |
| `surface` | `#FFFFFF` | Cards, painéis, dialogs e conteúdo elevado |
| `surface-subtle` | `#FAF8F4` | Subáreas e agrupamentos internos |
| `surface-hover` | `#F0EDE6` | Hover neutro |
| `border-divider` | `#ECE8E1` | Separadores internos |
| `border-subtle` | `#E4E0D8` | Bordas padrão de superfícies |
| `border-hover` | `#CBC5BA` | Hover neutro |
| `border-control-essential` | `#858A84` | Fronteira acessível de controles |
| `text-primary` | `#1C211F` | Títulos, valores e texto principal |
| `text-secondary` | `#5E645F` | Texto de leitura secundário |
| `text-muted` | `#686F69` | Metadados e legendas |
| `disabled` | `#9FA39F` | Conteúdo indisponível e não essencial |
| `disabled-soft` | `#F0EDE6` | Superfície de controle indisponível |

`disabled` não deve ser usado para conteúdo necessário à compreensão.

## 3. Azul primário

O azul foi escolhido para introduzir identidade e orientação sem disputar com as cores nutricionais.

### 3.1 Tokens de referência

| Token | Valor |
| --- | --- |
| `ref.color.blue.50` | `#E9EDFF` |
| `ref.color.blue.100` | `#C8D2FF` |
| `ref.color.blue.500` | `#4A64D8` |
| `ref.color.blue.700` | `#2746B3` |
| `ref.color.blue.800` | `#203A96` |
| `ref.color.blue.900` | `#192F7A` |

### 3.2 Tokens semânticos

| Token conceitual | Valor | Função |
| --- | --- | --- |
| `primary` | `#2746B3` | CTA, seleção, navegação ativa e links de ação |
| `primary-hover` | `#203A96` | Hover |
| `primary-pressed` | `#192F7A` | Estado pressionado |
| `primary-focus` | `#4A64D8` | Anel de foco e ênfase transitória |
| `primary-soft` | `#E9EDFF` | Fundo selecionado ou informativo leve |
| `primary-border` | `#C8D2FF` | Borda de contexto primário suave |
| `on-primary` | `#FFFFFF` | Conteúdo sobre fundo primário |

Combinações validadas:

- `on-primary` sobre `primary`: **8.04:1**;
- `primary` sobre `surface`: **8.04:1**;
- `primary` sobre `canvas`: **7.25:1**;
- `primary` sobre `primary-soft`: **6.90:1**.

## 4. Macronutrientes

As cores de macro não são cores da marca. Elas possuem significado fixo:

| Macro | Principal | Fundo suave | Borda |
| --- | --- | --- | --- |
| Proteínas | `macro-protein` `#B8325A` | `macro-protein-soft` `#FBEAF0` | `macro-protein-border` `#E8BDC9` |
| Carboidratos | `macro-carbohydrate` `#A55B00` | `macro-carbohydrate-soft` `#FFF1D6` | `macro-carbohydrate-border` `#E7C997` |
| Gorduras | `macro-fat` `#0F766E` | `macro-fat-soft` `#E6F4F1` | `macro-fat-border` `#B6DAD5` |

Regras:

- o rótulo textual deve acompanhar a cor;
- não comunicar macro apenas pela cor;
- usar fundos suaves para áreas maiores;
- reservar a cor principal para texto acessível, ícones, barras e pontos;
- calorias totais usam `text-primary`; metas gerais podem usar `primary`;
- não reutilizar cores de macro como decoração genérica.

Contrastes das cores principais sobre seus fundos suaves:

- proteínas: **4.98:1**;
- carboidratos: **4.59:1**;
- gorduras: **4.84:1**.

## 5. Feedback semântico

Feedback descreve o estado do sistema, não o tipo de nutriente.

| Estado | Principal | Fundo suave | Borda | Conteúdo sobre principal | Uso |
| --- | --- | --- | --- | --- | --- |
| Informação | `info` `#3157A4` | `info-soft` `#EAF0FB` | `info-border` `#C7D5ED` | `on-info` `#FFFFFF` | Contexto e orientação |
| Sucesso | `success` `#237A4B` | `success-soft` `#E8F5ED` | `success-border` `#B9DCC8` | `on-success` `#FFFFFF` | Operação concluída |
| Alerta | `warning` `#8A5D00` | `warning-soft` `#FFF3D6` | `warning-border` `#E6D19B` | `on-warning` `#FFFFFF` | Atenção ou risco reversível |
| Erro | `error` `#B42318` | `error-soft` `#FDECEA` | `error-border` `#E6B8B2` | `on-error` `#FFFFFF` | Falha, bloqueio ou ação destrutiva |

Mesmo quando feedback e macro possuem cores próximas, seus tokens permanecem separados. O contexto deve incluir texto e, quando útil, ícone.

Campos e regiões em erro podem usar `error-border`, sempre acompanhados de mensagem textual.

Contrastes sobre os fundos suaves:

- informação: **6.06:1**;
- sucesso: **4.73:1**;
- alerta: **5.22:1**;
- erro: **5.75:1**.

## 6. Hierarquia de contraste

### Alto contraste

Usar `text-primary`, `primary` e `on-primary` em:

- informação essencial;
- ação principal;
- seleção ativa;
- valores que orientam decisão;
- títulos.

### Médio contraste

Usar `text-secondary` em:

- corpo;
- labels;
- descrições;
- ações secundárias.

### Baixo contraste

Usar `text-muted`, `border-subtle` e diferenças de superfície em:

- metadados;
- legendas;
- divisores;
- agrupamento visual.

`text-muted` possui contraste mínimo de **4.66:1** sobre `canvas`. Bordas e fundos não substituem texto quando a distinção precisa ser percebida.

## 7. Visualização de dados

Regras básicas:

- série principal ou selecionada: `primary`;
- série comparativa: `text-secondary`;
- linhas de grade: `border-divider`;
- séries de macro: respectivas cores fixas;
- dados sem destaque: neutros;
- não criar paleta arco-íris para poucas séries;
- usar labels, marcadores ou padrões quando a distinção for essencial.

## 8. Distribuição visual recomendada

A distribuição é uma referência de equilíbrio, não uma fórmula rígida:

- **80–90%** neutros e superfícies;
- **5–10%** texto e estrutura escura;
- **até 5%** azul primário;
- macros e feedback apenas quando os dados ou estados existirem.

## 9. Regras proibitivas

- não usar `#0000FF` diretamente;
- não introduzir hex local quando já existir função semântica;
- não usar azul primário para erro ou destruição;
- não usar cor de macro para ação principal;
- não aplicar texto colorido sobre fundo sem contraste validado;
- não usar cor como único indicador;
- não aumentar saturação para compensar hierarquia estrutural ruim.

## 10. Uso em componentes

Componentes devem consumir tokens semânticos, não escolher valores pela aparência.

Exemplo conceitual:

```text
correta: botão primário → primary
incorreta: botão → azul 700 porque “parece melhor”

correta: progresso de proteína → macro-protein
incorreta: progresso → rosa porque combina com o card
```

Valores de implementação em CSS ou Tailwind devem ser derivados desta tabela em uma etapa separada de alinhamento do código.
