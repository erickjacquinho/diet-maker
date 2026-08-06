# PatientListTable

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-patient-list-table` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/PatientListTable.tsx` |
| Public exports | `PatientListTableProps` (type), `PatientListTable` (component) |

## Purpose

Apresentar pacientes em uma tabela desktop contínua, ordenada pela prioridade do próximo acompanhamento e com o contexto mínimo de evolução corporal para a triagem antes do perfil.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Não possui traits adicionais. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Caption acessível, cabeçalho de colunas e linhas de paciente com um rail vertical de dois indicadores à esquerda do nome/idade e ícone Mars ou Venus, objetivo, evolução de gordura corporal, próximo acompanhamento e chevron de abertura.

## Allowed variants

Uma única sequência de prioridade: atrasados, hoje, próximos acompanhamentos por data e, por último, sem próximo evento. Não há cabeçalhos ou separadores de grupo.

## Particular states

O estado corporal mostra o BF atual e, quando há duas avaliações válidas, a variação percentual assinada e o intervalo em dias. Sem comparação, usa texto explícito. Estados de foco, hover, vazio e erro são herdados da categoria e do primitivo `ui-table`.

## Composition

Compõe `ui-table`, `next/link` e ícones Lucide Mars, Venus e ChevronRight. A linha oferece navegação por teclado e o primeiro campo mantém um link real para o perfil; os indicadores têm descrição acessível e dois slots fixos, mesmo quando vazios.

## Content rules

Exibe nome, idade, gênero, objetivo, BF atual, delta BF/tempo e próximo evento. Não exibe peso atual, calorias, macros ou último registro como métricas da lista. O estado do próximo evento é textual e a data é apresentada em `dd/mm`. O objetivo `Recomposição Corporal` é resumido como `Recomposição` na tabela.

## History indicators

O primeiro slot representa existência de avaliação física e o segundo representa existência de dieta histórica. O indicador de dieta usa azul e o de avaliação usa o tom neutro; a cor é apenas apoio visual e a descrição acessível comunica as quatro combinações possíveis.

## Toolbar relationship

A rota posiciona busca, contagem ao vivo e `+ Novo paciente` na mesma linha do painel existente. O controle visível `Prioridade do acompanhamento` não faz parte da composição.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- a tabela preserva semântica de caption, escopos, foco visível e navegação por Enter/Espaço;
- a busca ocorre antes da ordenação e não cria cabeçalhos ou separadores adicionais;
- BF, delta e período usam formatação `pt-BR` e não dependem de peso atual;
- os dois indicadores permanecem alinhados e têm descrição não dependente de cor;
- a prioridade e os estados sem dados permanecem legíveis sem depender exclusivamente de cor;
- nenhuma decisão visual fica a cargo do consumidor e `src/components/ui/table.tsx` permanece genérico.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
