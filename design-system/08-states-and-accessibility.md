# 08 — Estados e acessibilidade

## 1. Referência

Meta mínima:

```text
WCAG 2.2 AA
```

Acessibilidade faz parte do comportamento do componente. Não pode ser tratada como revisão visual posterior.

## 2. Foco

Receita única:

```text
outline/ring: 2px primary-focus
offset: 2px
border: permanece 1px
```

Regras:

- foco visível somente com `:focus-visible`, salvo campos de texto;
- nunca remover outline sem substituição;
- foco não altera tamanho;
- foco não depende apenas de mudança de cor interna;
- elemento focado não pode ficar coberto por sticky regions;
- ordem de foco acompanha ordem visual e semântica;
- não usar `tabIndex` positivo.

## 3. Controles acionáveis

| Estado | Comportamento |
| --- | --- |
| Default | Contrato visual da variante |
| Hover | Alterar cor ou borda por `motion-fast` |
| Pressed | Cor de pressed; sem scale ou deslocamento |
| Focus-visible | Ring padrão |
| Disabled | Sem eventos; cor disabled; cursor padrão ou not-allowed |
| Loading | Preservar largura, bloquear repetição e manter label compreensível |

Loading:

- aparece quando a operação não responde imediatamente;
- mantém o texto ou usa forma `Salvando…`;
- spinner usa `icon-compact`;
- `aria-busy="true"` no controle ou região;
- não trocar o conteúdo por ícone sem nome.

## 4. Seleção

| Estado | Comportamento |
| --- | --- |
| Unselected | Superfície neutra |
| Hover | Fundo neutro ou borda hover |
| Selected | `primary-soft`, texto primary e indicador |
| Focus-visible | Ring padrão |
| Disabled | Estado legível, sem interação |
| Mixed | Somente controles que suportem seleção parcial |

Seleção não usa borda grossa e não depende somente de azul. Usar check, marcador, `aria-selected`, `aria-checked` ou estado nativo apropriado.

## 5. Campos

| Estado | Borda | Conteúdo | Auxílio |
| --- | --- | --- | --- |
| Empty | `border-control-essential` | placeholder | helper opcional |
| Filled | `border-control-essential` | `field-value` | helper opcional |
| Hover | `border-hover` apenas se continuar identificável | inalterado | inalterado |
| Focus | borda 1px + ring | cursor/seleção | helper |
| Invalid | `error-border` + ring de erro quando focado | valor preservado | `validation-error` |
| Disabled | token disabled | valor legível | motivo quando necessário |
| Read-only | superfície subtle, sem aparência disabled | valor selecionável | indicação textual quando ambígua |
| Loading | valor preservado ou skeleton contextual | bloqueio apenas se necessário | status anunciado |

Regras:

- todo campo possui label persistente;
- placeholder não substitui label;
- required deve ser comunicado em texto ou semântica;
- erro aparece próximo ao campo e é ligado por `aria-describedby`;
- `aria-invalid="true"` em valor inválido;
- validação preferencialmente após blur ou tentativa de envio;
- não apagar valor inválido;
- campos numéricos preservam unidade fora do valor.

## 6. Conteúdo assíncrono

Toda região de dados avalia:

| Estado | Obrigatório |
| --- | --- |
| Initial | Conteúdo ainda não solicitado, quando aplicável |
| Loading | Skeleton ou indicador proporcional |
| Success/data | Conteúdo completo |
| Success/empty | Empty state com explicação e próxima ação |
| Error | Mensagem, contexto preservado e retry quando possível |
| Refreshing | Dados anteriores preservados com indicador discreto |

Não substituir dados existentes por página vazia durante refresh.

Skeleton:

- replica estrutura aproximada;
- não contém texto falso;
- usa superfície neutra;
- não pulsa com movimento em reduced motion;
- não deve aparecer para resposta instantânea.

## 7. Cards

### Estático

- sem hover;
- sem cursor pointer;
- pode conter controles internos;
- card inteiro não recebe foco.

### Interativo

- toda área corresponde a uma única ação;
- hover discreto;
- focus-visible equivalente;
- sem controles interativos aninhados;
- sem scale ou sombra em hover.

### Selecionável

- usa semântica de seleção;
- combina fundo suave e indicador;
- suporta teclado;
- não aumenta borda.

## 8. Overlays

Dialog, sheet, dropdown, select, popover e tooltip devem usar Radix/Shadcn.

### Dialog e sheet

- título acessível obrigatório;
- descrição quando necessária;
- foco inicial deliberado;
- Tab contido dentro do modal;
- Escape fecha, exceto operação destrutiva irreversível em andamento;
- foco retorna ao acionador;
- botão de fechar possui nome acessível;
- backdrop impede interação inferior;
- ação principal fica à direita; cancelamento à esquerda.

### Dropdown, select e popover

- acionador anuncia expanded;
- setas navegam quando o padrão exigir;
- Escape fecha;
- seleção retorna foco adequadamente;
- não abrir apenas por hover.

### Tooltip

- complementa, não contém informação indispensável;
- não substitui label;
- abre por hover e foco;
- pode ser dispensado;
- não recebe conteúdo interativo.

## 9. Feedback

| Tipo | Uso | Persistência |
| --- | --- | --- |
| Info | Orientação não bloqueante | Até 5s ou dismiss |
| Success | Confirmação de operação | Até 4s |
| Warning | Risco ou atenção | Até 7s ou ação |
| Error | Falha que exige conhecimento | Persistente até dismiss ou resolução |

Toast:

- título curto;
- descrição opcional;
- não conter decisão complexa;
- ação apenas quando claramente reversível, como desfazer;
- erros de formulário permanecem no formulário;
- região usa live announcement adequado;
- não empilhar mais de 3 visíveis.

## 10. Ações destrutivas

- variante `danger`;
- texto explicita o objeto: `Excluir receita`;
- confirmação quando perda não for facilmente reversível;
- foco inicial na ação segura;
- não usar apenas vermelho para comunicar risco;
- loading impede repetição;
- sucesso e erro recebem feedback.

## 11. Teclado

| Componente | Teclas |
| --- | --- |
| Button | Enter, Space |
| Link | Enter |
| Checkbox | Space |
| Radio group | Setas, Space |
| Tabs | Setas, Home, End |
| Select/menu | Setas, Enter, Escape |
| Dialog | Tab, Shift+Tab, Escape |
| Combobox | Setas, Enter, Escape |

Não criar comportamento de teclado diferente do padrão do primitivo.

## 12. Alvos e ponteiro

- alvo mínimo WCAG: `24×24px`;
- controles do sistema usam no mínimo `32×32px`;
- ações adjacentes mantêm `8px`;
- drag handle deve possuir alternativa por teclado quando reordenação for essencial;
- hover nunca revela a única forma de executar ação importante;
- tooltip não é requisito para compreender icon button: `aria-label` continua obrigatório.

## 13. Contraste

- texto normal: mínimo `4.5:1`;
- texto grande conforme WCAG: mínimo `3:1`;
- componente ou estado visual essencial: mínimo `3:1`;
- foco: mínimo `3:1` contra adjacências;
- disabled pode ficar fora, mas não contém informação necessária;
- cor nunca é o único sinal.

As combinações oficiais estão no [sistema de cores](./04-color-system.md).

## 14. Zoom e desktop

Mesmo sem suporte mobile/tablet:

- interface deve operar com zoom de até 200%;
- conteúdo essencial não pode ser cortado;
- scroll em região densa é permitido;
- overlays permanecem acessíveis no viewport;
- texto não fica preso em altura fixa;
- foco continua visível.

## 15. Matriz mínima por família

| Família | Estados obrigatórios |
| --- | --- |
| Button | default, hover, pressed, focus, disabled, loading |
| Input | empty, filled, hover, focus, invalid, disabled, read-only |
| Select/combobox | closed, open, focus, selected, disabled, empty, no-results |
| Checkbox/radio | unchecked, checked, focus, disabled, mixed quando aplicável |
| Tab | default, hover, active, focus, disabled |
| Card interativo | default, hover, focus, selected quando aplicável |
| Table | loading, data, empty, error, selected row quando aplicável |
| Dialog | opening, open, closing, submitting, error |
| Toast | info, success, warning, error, dismissed |
| Async region | initial, loading, data, empty, error, refreshing |

Estados não aplicáveis devem ser marcados como tal no contrato, não implementados artificialmente.
