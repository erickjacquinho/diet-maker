# Research: Persistência de avaliações e acompanhamento

**Date**: 2026-09-11  
**Scope**: decisões de domínio, persistência, integração e validação da Etapa 5

## Decisões mantidas

### 1. Reutilizar o banco local e adicionar uma migration incremental

Manter PGlite + Drizzle e adicionar uma única migration para `body_assessments` e
`next_follow_ups`. A Etapa 5 usa o mesmo `AccountContext`, `PatientRepository`,
`TransactionRunner` e composição do navegador já existentes.

Trocar o motor, criar um segundo banco ou reescrever migrations anteriores só
acrescentaria fontes de falha sem alterar o resultado funcional.

### 2. Persistir avaliações como registros independentes

`BodyAssessment` permanece uma linha independente, escopada por Conta + Paciente,
com medidas informadas, valores calculados confirmados, proveniência do cálculo,
timestamps e versão otimista. O salvamento recebe apenas o input do formulário,
reaplica normalização, preenchimento assistido e cálculo US Navy no domínio e
só então confirma o registro.

Não há array de avaliações no paciente, recálculo do histórico por dados atuais,
snapshot imutável de cada edição ou exclusão normal de avaliação.

### 3. Manter um único próximo acompanhamento

`NextFollowUp` tem no máximo uma linha por `(accountId, patientId)`. Criar e
reagendar usam a versão esperada; remover apaga apenas essa linha. Os tipos
continuam sendo atualização de avaliação e atualização de dieta. Datas passadas
são válidas para representar atraso.

Uma agenda histórica, múltiplos acompanhamentos ou colunas duplicadas em
`Patient` não fazem parte desta etapa.

### 4. Derivar projeções e reutilizar a composição de pacientes

Atividade, avaliação recente, comparação, contagens, resumo da lista e consulta
por data continuam sendo leituras derivadas de avaliações e dietas confirmadas.
Não haverá tabelas ou escritas de projeção.

Para reduzir camadas, a aplicação clínica será adicionada ao `PatientApplication`
existente e o `PatientProfileReader` existente será estendido para consumir o
resumo clínico em lote. Não será criada uma fachada `ClinicalApplication` nem um
`ClinicalProjectionReader` paralelo.

A ordenação usa data clínica/evento descendente, confirmação descendente e ID
estável. Empates entre tipos seguem uma precedência fixa apenas para ordenação;
as identidades dos registros permanecem independentes.

### 5. Manter a consulta como projeção somente leitura

A rota de consulta combina paciente canônico, dietas confirmadas e avaliações da
data. Não há tabela, repositório de mutação ou caso de uso para
`ConsultationRecord`; observações e suplementos permanecem no estado vazio
atual.

### 6. Usar concorrência otimista e corte direto do legado

Edições exigem `expectedVersion`, atualizam apenas a linha escopada e preservam
o formulário em conflito. Os fluxos canônicos deixam de ler e escrever as
chaves legadas, sem migração, fallback ou dual-write. Helpers puros de cálculo,
datas e apresentação podem ser reaproveitados.

### 7. Validar por risco, em uma suíte curta

A validação cobre domínio, migration/repositório, aplicação, hooks/componentes,
cutover, desempenho representativo e uma jornada Chromium serial para reload e
rede desativada após preparação. Testes existentes são estendidos quando já
cobrem a mesma fronteira; não se cria uma suíte paralela para cada camada.

## Simplificações aplicadas

| Removido do desenho anterior | Motivo |
| --- | --- |
| `ClinicalApplication` separado | O `PatientApplication` já é a fachada usada pelas páginas e hooks. |
| `ClinicalProjectionReader` separado | O `PatientProfileReader` já compõe perfil e lista; um repositório clínico fornece os dados novos. |
| Preparação do schema de exportação | Exportação e restauração pertencem à Etapa 6. |
| `implementation-log.md` e inventário manual como entregáveis | A fronteira legada é comprovada por teste de arquitetura e pelos gates. |
| Testes duplicados por repositório, caso de uso e composição in-memory | Uma integração por fluxo cobre o contrato sem mover complexidade para arquivos auxiliares. |

## Resolved unknowns

Não restam decisões de escopo abertas. Campos, fórmulas, rotas, modais,
preenchimento assistido, normalização bilateral, operação local, arquivamento,
isolamento e mensagens de estado permanecem conforme `spec.md`. Backup,
autenticação, sincronização, agenda e observações/suplementos persistidos ficam
fora da Etapa 5.
