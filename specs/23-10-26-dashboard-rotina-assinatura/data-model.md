# Data Model: projeções sem persistência nova

Nenhuma entidade armazenada, schema, versão de save ou migração será criada.

## Entrada reutilizada

patients fornecido por usePatientsPage, derivado dos resumos da aplicação atual:
- id e name identificam o paciente.
- nextEvent pode ser ausente.
- nextEvent.dates contém datas independentes por diet-update e assessment-update.
- nextEvent.date/type é compatibilidade legada, usada apenas quando dates não existe.

Normalizar datas por normalizeDateKey e ignorar inválidas. Não substituir dates por date quando o mapa existe. Um par paciente/tipo em uma data válida gera uma ocorrência; tipos distintos contam separadamente.

## Projeções em memória

| Valor | Conteúdo | Validação/uso |
| --- | --- | --- |
| Dia | dateKey local, indicação de hoje, count | Sete dias consecutivos, domingo a sábado; count é número de ocorrências. |
| Ação | patientId, patientName, type, dateKey | Hoje ≤ dateKey ≤ fim da semana; ordenação data, nome pt-BR e tipo. |
| Semana | intervalo e sete dias, ações derivadas | Uma única coleção de entradas alimenta calendário e lista. |
| Aba | profile, save ou subscription | União SettingsTab existente ampliada; sem persistir seleção. |

Formato exato da função de projeção permanece local à lib e seu consumidor; não criar DTO/API ou modelo de assinatura. Textos da aba/linha são conteúdo estático, não um estado financeiro.

## Ciclo de vida da rotina

1. Sem runtime autorizado: consumidor de dados desmontado; convite para abrir saves.
2. Runtime autorizado novo: consumidor novo; loading sem dados anteriores.
3. Leitura bem-sucedida: coleção disponível; cada região decide seu vazio.
4. Falha: mensagem e retry do hook; não exibir coleção antiga como atual.
5. Troca de instância, bloqueio, fechamento ou troca de conta: descartar subárvore/dados anteriores antes de outra leitura.
6. Foco/retorno à página após mudar o dia: recalcular intervalo e lista a partir da data local, sem escrita e sem nova leitura apenas pela mudança do calendário.

A autorização vem exclusivamente da sessão existente. Placeholder ou estado visual não concedem acesso. Estado financeiro futuro não é definido nesta entrega.
