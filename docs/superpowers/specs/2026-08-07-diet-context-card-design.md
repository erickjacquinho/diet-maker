# Design: compactação do quadro de contexto da dieta

## Objetivo

Reduzir o ruído visual somente no quadro interno que contém a identificação do paciente e o modelo de dieta na rota `/pacientes/[id]/dieta/nova`.

## Escopo

Alterar exclusivamente o `diet-context-card` renderizado por `DietBuilderTemplate`.

Fora de escopo:

- `PageContextHeader`, breadcrumb e ações externas;
- região de metas nutricionais;
- região de refeições;
- comportamento de persistência e callbacks do fluxo de dieta;
- primitivos em `src/components/ui`.

## Decisão visual

Manter uma única superfície, dividida em duas áreas com alinhamento vertical:

- **Esquerda — paciente:** avatar, nome, peso e objetivo em uma composição compacta. O peso deve aparecer uma única vez; o texto secundário não deve repetir a unidade.
- **Direita — modelo de dieta:** manter a escolha entre dieta simples e ciclo de carboidratos, com título curto, seletor segmentado e os controles de variação condicionais somente quando o ciclo estiver ativo.

A divisão entre as áreas permanece como uma borda vertical de 1px. O texto explicativo longo do seletor é removido para deixar a escolha diretamente escaneável. A estrutura existente de `PatientBadgeHeader` e `DietModeSwitcher` será configurada antes de considerar qualquer novo componente.

## Comportamento e acessibilidade

- O grupo de seleção continua com nome acessível `Modelo de dieta`.
- A navegação por setas entre os modos permanece funcionando.
- Foco visível, estados selected/pressed e labels textuais existentes são preservados.
- O nome completo do paciente permanece disponível para tecnologias assistivas mesmo quando houver truncamento visual.
- A variação de carboidratos continua sendo exibida somente no modo correspondente.

## Critérios de aceite

1. O quadro interno exibe paciente à esquerda e modelo de dieta à direita.
2. O peso do paciente não aparece duplicado.
3. Breadcrumb, título externo, ações, métricas e refeições permanecem inalterados.
4. Alternar entre `Dieta Simples` e `Ciclo de Carboidratos` mantém o comportamento atual.
5. O layout usa tokens e classes existentes do design system, sem cores hex, espaçamentos arbitrários ou novos primitivos UI.
6. Type-check, lint e testes focados passam após a alteração.

## Validação

- inspeção visual desktop na rota solicitada;
- verificação de foco e alternância por teclado;
- `npm run type-check`;
- `npm run lint`;
- testes relacionados ao template e ao domínio de dieta, quando existentes.
