# Histórico de ciclo de carboidratos no perfil — Design

## Problema

O histórico de prescrições do perfil é alimentado por `FullDietPlan`, mas `buildPatientDietHistory` converte o plano para `HistoricalDiet` lendo apenas os campos `simpleTarget*`. Em planos com `mode: 'carb_cycling'`, as metas efetivas estão nas variações e, por isso, a tabela pode exibir calorias/macros zerados ou desatualizados e não informa como o ciclo foi configurado.

## Objetivo

Representar corretamente dietas simples e dietas de ciclo de carboidratos na tabela **Histórico de prescrições dietéticas** do perfil:

- a linha principal de um ciclo mostra a média semanal ponderada pela quantidade de dias atribuídos;
- a linha identifica o modo como “Ciclo de Carboidratos”;
- as variações podem ser expandidas na própria tabela, exibindo nome, dias, macros, kcal e quantidade de refeições;
- dietas simples preservam o comportamento e a apresentação atuais;
- a transformação dos dados mantém os metadados necessários para a ação existente de visualização do cardápio.

## Abordagens consideradas

1. **Enriquecer o modelo de histórico (recomendado).** Fazer `buildPatientDietHistory` produzir uma visão de histórico que preserve `mode`, variações e refeições derivadas do plano salvo; o organismo da tabela renderiza esses dados. Mantém uma fonte de dados única, não adiciona leituras assíncronas ao componente e permite testar cálculo e apresentação separadamente.
2. Fazer `PatientDietsTable` consultar o armazenamento novamente para localizar o `FullDietPlan`. Evita ampliar `HistoricalDiet`, mas duplica a responsabilidade de acesso a dados no componente, cria risco de divergência entre o estado da página e a tabela e dificulta testes determinísticos.
3. Transformar cada variação em uma linha independente. Mostra todos os números diretamente, mas perde a unidade de “uma linha por prescrição”, polui o histórico e altera a ordenação/status existentes.

## Design aprovado

### Modelo e fluxo de dados

`buildPatientDietHistory` continuará sendo o adaptador entre o armazenamento e o perfil. Para um plano simples, os campos atuais permanecem. Para um plano de ciclo:

1. detectar `mode === 'carb_cycling'`;
2. calcular `avgKcal`, `avgProtein`, `avgCarbs` e `avgFats` com `calculateWeeklyCycleAverage`;
3. copiar para o histórico as variações necessárias para a visualização, incluindo dias atribuídos, metas e contagem de refeições;
4. derivar as refeições do plano simples ou da primeira variação para manter a visualização de cardápio compatível com o modelo histórico atual;
5. manter ordenação por data e regra de status já existente.

O tipo de histórico receberá campos opcionais de ciclo, sem alterar o schema persistido de `FullDietPlan`. Valores ausentes serão tratados como “Sem dias”, “Nenhuma refeição” ou estado vazio explícito; não serão inventados zeros como substitutos de uma variação inexistente.

### Tabela

`PatientDietsTable` continuará sendo o organismo responsável pela tabela. A linha principal exibirá a média semanal no conjunto de macros/kcal e um badge de modo. Para ciclos com variações, um botão acessível controla uma única linha expandida associada à prescrição, com `aria-expanded` e `aria-controls`. A expansão exibirá uma grade de variações usando os componentes e tokens já existentes; a tabela simples não ganhará conteúdo adicional.

O controle de expansão não selecionará nem abrirá a prescrição. Os botões existentes de cardápio, edição e exclusão permanecerão independentes e com os mesmos callbacks.

### Acessibilidade e visual

Será preservada a tabela semântica, caption, headers, unidades explícitas, ordem canônica proteína → carboidrato → gordura → calorias, foco visível e navegação por teclado. A expansão será anunciada pelo nome da dieta e não dependerá apenas de cor. Serão usados tokens do design system e ícones Lucide; nenhum primitivo em `src/components/ui` será alterado.

### Testes

- teste unitário do adaptador para uma dieta de ciclo com distribuição de dias, garantindo médias ponderadas, modo, variações e refeições;
- teste do estado inicial e da expansão/colapso da tabela, garantindo que os detalhes de cada variação aparecem e que o clique no expandir não dispara ações da linha;
- regressão das dietas simples e dos fluxos existentes do perfil;
- execução dos testes direcionados e do typecheck/lint conforme os scripts do projeto.

## Fora de escopo

- alterar a estrutura persistida de `FullDietPlan`;
- mudar o construtor de dietas ou a matriz de ciclo;
- alterar a tabela/modal de importação de dietas;
- trocar o agrupamento ou o status das prescrições no perfil;
- substituir os componentes genéricos da tabela ou os primitivos Shadcn.

