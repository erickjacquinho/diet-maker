# Research: Adequação da Lista de Pacientes

**Feature**: [spec.md](./spec.md)
**Date**: 2026-08-04

## Decision 1: Evoluir a rota existente e o organismo de tabela

- **Decision**: Migrar a composição da rota `/pacientes` para uma tabela contínua usando o organismo `PatientListTable` e o primitivo `ui-table`, mantendo o formulário de cadastro existente.
- **Rationale**: A rota atual é a fonte de comportamento e os componentes de tabela já existem no projeto. A mudança necessária é de projeção, conteúdo e composição, não de uma nova superfície de navegação.
- **Alternatives considered**:
  - Criar uma segunda rota ou uma segunda view alternável: rejeitado porque manteria a view de cards e duplicaria o fluxo.
  - Implementar a tabela diretamente em `page.tsx`: rejeitado porque violaria a separação entre página e organismo e reduziria a testabilidade.

## Decision 2: Usar uma projeção de linha derivada dos dados existentes

- **Decision**: Expandir a projeção `PatientListRow` para reunir identidade, evento, histórico de avaliação corporal, variação de BF e existência histórica de dieta antes da renderização.
- **Rationale**: A tabela precisa combinar dados que já estão em fontes de paciente, evento, avaliação e dieta. Uma projeção única mantém a ordenação e a apresentação determinísticas e permite testar regras sem depender do DOM ou de `localStorage`.
- **Alternatives considered**:
  - Fazer leituras de armazenamento dentro de cada célula: rejeitado por acoplamento, repetição e dificuldade de testar.
  - Adicionar BF e flags diretamente ao objeto persistido `Patient`: rejeitado porque são derivados de históricos e criaria duplicação sujeita a ficar obsoleta.

## Decision 3: BF atual e variação vêm das duas avaliações mais recentes

- **Decision**: Ordenar avaliações por data, usar a mais recente como BF atual e comparar com a imediatamente anterior quando disponível. A variação é `atual - anterior`, formatada em percentual com sinal e dias decorridos, como `−0,4% 20d`.
- **Rationale**: O valor atual e a comparação devem representar evolução corporal, não peso isolado. A regra usa dados clínicos existentes e deixa explícito quando não há comparação suficiente.
- **Alternatives considered**:
  - Exibir peso atual como métrica principal: rejeitado conforme decisão de produto do usuário.
  - Calcular uma média de avaliações: rejeitado porque dilui a leitura da avaliação mais recente.
  - Exibir mudança em pontos percentuais: rejeitado porque a referência aprovada usa o formato percentual `−0,4% 20d`.

## Decision 4: Indicadores de registro representam existência histórica

- **Decision**: O ponto superior representa pelo menos uma avaliação física histórica; o inferior representa pelo menos uma dieta histórica. A ausência mantém o slot transparente e o espaço reservado.
- **Rationale**: O objetivo é permitir triagem de disponibilidade de contexto antes de abrir o perfil, sem misturar isso com o próximo evento.
- **Alternatives considered**:
  - Representar somente a última atividade: rejeitado porque não atende à semântica de “já marcado em algum momento”.
  - Usar uma coluna separada: rejeitado porque aumenta a largura e quebra a leitura de identidade da referência.

## Decision 5: Ordenação fixa sem controle de prioridade

- **Decision**: Manter a ordenação derivada atrasados → hoje → próximos por data → sem próximo evento, com desempate determinístico por nome ou data conforme o grupo; remover o controle visual `Prioridade do acompanhamento`.
- **Rationale**: A ordem é uma regra de triagem, não uma escolha do usuário nesta tela. O controle removido ocupava espaço e não tinha uma alternativa de ordenação efetivamente definida.
- **Alternatives considered**:
  - Manter um botão de ordenação sem comportamento adicional: rejeitado por ser uma affordance sem consequência verificável.
  - Ordenar alfabeticamente: rejeitado porque reduz a prioridade clínica do próximo acompanhamento.

## Decision 6: Acessibilidade e tokens são critérios de contrato

- **Decision**: Compor o primitivo `ui-table`, usar caption, cabeçalhos com escopo, foco visível, navegação por teclado e nomes acessíveis para indicadores; usar exclusivamente tokens e receitas existentes do design system nas alterações.
- **Rationale**: A constituição exige WCAG 2.2 AA, Atomic Design e preservação de primitivos. A categoria `data-display` já define geometria, estados, overflow e semântica aplicáveis.
- **Alternatives considered**:
  - Estilizar com valores brutos no organismo ou na página: rejeitado por contrariar a arquitetura de tokens.
  - Alterar `src/components/ui/table.tsx` para acomodar regras clínicas: rejeitado pela regra de preservação do Shadcn.

## Decision 7: O HTML de referência é evidência visual, não fonte de implementação

- **Decision**: Usar `refs/pacientes-list-view.html` para validar hierarquia, conteúdo e estados visuais do conteúdo principal, ignorando a barra lateral e mantendo o código canônico em `src/`.
- **Rationale**: A constituição declara protótipos em `refs/` como históricos; o código e o design system são as fontes de implementação. Isso permite reproduzir a decisão visual sem copiar CSS ad hoc.
- **Alternatives considered**:
  - Copiar o CSS inline do HTML para a rota: rejeitado porque duplicaria tokens e regras de componentes.

## Findings from current repository

- A versão de `main` ainda apresenta a grade de cards com peso, meta calórica e última consulta.
- O worktree contém uma tentativa parcial de tabela e de ordenação em `PatientListTable.tsx`, `patientListView.ts` e na página; essa tentativa deve ser reconciliada com esta especificação e não deve ser considerada conforme sem os testes e validações do plano.
- `Patient` já possui eventos de próximo acompanhamento e última atividade; `BodyAssessment` já possui `bodyFatPercent`; dietas e avaliações são persistidas por paciente em armazenamento local.
- A categoria `data-display` e o perfil `PatientListTable` já existem, mas o perfil atual ainda descreve “último registro clínico” em vez da coluna de evolução de gordura; o plano inclui a atualização documental correspondente.
- Não há contrato externo ou API pública nova nesta mudança; por isso, a pasta `contracts/` não será criada.
