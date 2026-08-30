# Dieta DB — Guia Central da Persistência

Esta pasta reúne os requisitos, o vocabulário, as decisões, as justificativas
e a divisão em SDDs da persistência do NutriDiet. É o ponto de consulta desse
escopo; não é necessário percorrer o PRD, o glossário e os ADRs externos para
recompor os contratos de armazenamento.

**Como ler:** comece por este índice; consulte a
[divisão em SDDs](./14-consolidacao-e-portao-de-execucao.md) para planejar a
execução e abra as decisões de cada etapa para os detalhes.

## Proposta preservada

Persistir os dados do consultório no navegador, com uma Conta, um profissional
e uma aba ativa. O nutricionista mantém as edições em rascunho, confirma a
prescrição por **Salvar** e exporta/restaura a Conta manualmente por um arquivo
`.nutridiet` em JSON, **sem criptografia e sem senha**.

O primeiro fluxo vertical completo é:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

A refatoração preserva os fluxos clínicos e a interface existentes. Não cria
novos módulos de produto para justificar infraestrutura adicional.

O cenário de uso considera centenas de pacientes e milhares de refeições e
itens acumulados, como já previsto para a base do consultório. Isso não cria
uma nova bateria de homologação; a validação proporcional segue a Decisão 10.

## Requisitos consolidados

Esta tabela reúne os requisitos de persistência antes distribuídos no PRD,
no contexto e nos ADRs. Os detalhes de cada contrato ficam nas decisões locais
indicadas; a tabela não acrescenta requisitos.

| Tema | Comportamento esperado | Contrato |
| --- | --- | --- |
| Conta e pacientes | Perfil local estável; cadastrar, editar e arquivar pacientes sem apagar seu histórico | [02](./02-ciclo-de-vida-e-persistencia-do-paciente.md), [05](./05-arquitetura-backend-e-escopos-de-dados.md), [09](./09-topologia-v1-local-first-e-conta-local.md) |
| Biblioteca | Alimentos customizados, receitas e refeições prontas pertencem à Conta e são reutilizáveis entre pacientes | [06](./06-catalogo-de-alimentos-e-customizados.md), [07](./07-receitas-e-refeicoes-prontas.md) |
| Dados clínicos | Avaliações, acompanhamento existente e prescrições ficam vinculados à Conta e ao Paciente | [02](./02-ciclo-de-vida-e-persistencia-do-paciente.md), [03](./03-contrato-de-interacao-da-tela-de-pacientes.md), [05](./05-arquitetura-backend-e-escopos-de-dados.md) |
| Rascunho e autosave | IndexedDB guarda somente a edição local; primeiro alimento e autosave não criam dieta confirmada nem alteram histórico | [01](./01-fluxo-paciente-dieta.md), [04](./04-plano-de-execucao-e-validacao.md) |
| Salvamento | Capturar o último input, validar e confirmar plano, filhos e vigência em uma transação; botão e Ctrl+S usam o mesmo caso de uso | [01](./01-fluxo-paciente-dieta.md), [04](./04-plano-de-execucao-e-validacao.md) |
| Falhas e repetição | Preservar draft em rollback; conferir resultado incerto pelo ID estável antes de repetir; erro só na limpeza não repete o commit | [01](./01-fluxo-paciente-dieta.md) |
| Vigência e histórico | Uma vigente por paciente, editável por salvamento explícito; ao ser substituída, torna-se histórica e somente leitura | [01](./01-fluxo-paciente-dieta.md), [08](./08-snapshots-versionamento-e-integridade-clinica.md) |
| Integridade nutricional | Preservar snapshots, unidades, energia da fonte, metas manuais e peso de referência; mudanças no catálogo não recalculam o histórico | [06](./06-catalogo-de-alimentos-e-customizados.md), [08](./08-snapshots-versionamento-e-integridade-clinica.md) |
| Busca | Preservar a meta já existente de busca de alimentos em menos de 100 ms após inicialização; medir na integração, sem nova certificação de volume | [10](./10-motor-local-drizzle-e-migrations.md) |
| Offline e abas | Fluxos locais funcionam sem rede após preparação dos recursos; segunda aba é bloqueada antes de abrir o banco | [09](./09-topologia-v1-local-first-e-conta-local.md), [10](./10-motor-local-drizzle-e-migrations.md) |
| Exportação | Backup manual de todos os dados confirmados da Conta, inclusive arquivados e snapshots, sem drafts, senha ou criptografia | [11](./11-recuperacao-e-portabilidade-local.md), [13](./13-protecao-local-e-backup-simples.md) |
| Restauração | Validar arquivo e versões, resolver edições pendentes e confirmar a substituição de toda a base em uma transação, sem mesclagem | [11](./11-recuperacao-e-portabilidade-local.md) |
| Retenção e privacidade | Informar que navegador/dispositivo podem perder dados, backup só recupera o exportado e quem acessar o arquivo poderá lê-lo | [09](./09-topologia-v1-local-first-e-conta-local.md), [13](./13-protecao-local-e-backup-simples.md) |
| Arquitetura e legado | UI usa casos de uso/repositórios; descartar dados legados de teste por módulo, sem migrador nem duas fontes canônicas para a mesma entidade | [04](./04-plano-de-execucao-e-validacao.md), [05](./05-arquitetura-backend-e-escopos-de-dados.md), [14](./14-consolidacao-e-portao-de-execucao.md) |

## Glossário da persistência

| Termo | Significado nesta arquitetura |
| --- | --- |
| Conta / perfil local | Identidade e configurações do profissional que possui a base; `accountId` identifica a propriedade dos dados |
| Conta + Paciente | Escopo dos registros clínicos, sem permitir associá-los a outro paciente ou Conta |
| Banco canônico / backend local | Banco relacional dos dados confirmados; na V1 não significa servidor remoto |
| DietDraft / Em Criação | Documento de edição em IndexedDB, recuperável no mesmo navegador, sem constituir prescrição confirmada |
| Autosave / buffer de rascunho | Gravação da edição no draft; não equivale ao salvamento clínico e só protege o que foi efetivamente persistido |
| Commit / salvamento explícito | Transação iniciada por Salvar ou Ctrl+S, confirmando os dados da prescrição em conjunto |
| Vigente / ACTIVE | Dieta confirmada atual do paciente, editável mediante novo salvamento explícito |
| Histórico / SNAPSHOT | Dieta que deixou a vigência e passou a ser somente leitura; não inclui cada edição intermediária da vigente |
| Snapshot nutricional | Cópia dos valores e da composição usados na prescrição, independente de mudanças futuras no catálogo |
| Versão esperada | Versão da dieta base que o draft pretende atualizar; protege contra sobrescrita de conteúdo desatualizado |
| ID estável | Identificador reutilizado nas tentativas de salvar a mesma nova dieta, impedindo criar duplicatas por troca de ID |
| Biblioteca | Alimentos customizados, receitas e refeições prontas da Conta; TACO é a referência de sistema sem proprietário de Conta |
| VET / meta energética | Objetivo em kcal informado pelo nutricionista; não se confunde com a soma energética dos alimentos |
| Energia de referência / calculada | Kcal informadas pela fonte ou estimativa identificada por 4–4–9; regras completas na Decisão 06 |
| g/kg | Gramas do macronutriente por quilograma; a prescrição preserva seu peso de referência, conforme a Decisão 08 |
| Arquivo mestre / .nutridiet | Backup lógico em JSON dos dados confirmados da Conta; não é rascunho, PDF, arquivo SQL ou cópia física do motor |
| Outbox | Mecanismo de sincronização futura, excluído da V1; não há fila a implementar agora |

## Etapas para os SDDs

A [Decisão 14](./14-consolidacao-e-portao-de-execucao.md) contém entregas,
dependências e justificativas. Este mapa serve para localizar a leitura de
cada SDD, sem duplicar o plano detalhado:

| Ordem | Entrega | Leitura principal |
| --- | --- | --- |
| 1 | Prova técnica e base local | [09](./09-topologia-v1-local-first-e-conta-local.md) e [10](./10-motor-local-drizzle-e-migrations.md) |
| 2 | Conta e pacientes | [02](./02-ciclo-de-vida-e-persistencia-do-paciente.md), [03](./03-contrato-de-interacao-da-tela-de-pacientes.md) e [05](./05-arquitetura-backend-e-escopos-de-dados.md) |
| 3 | Dietas: rascunho, salvamento e histórico | [01](./01-fluxo-paciente-dieta.md), [04](./04-plano-de-execucao-e-validacao.md) e [08](./08-snapshots-versionamento-e-integridade-clinica.md) |
| 4 | Biblioteca reutilizável | [06](./06-catalogo-de-alimentos-e-customizados.md), [07](./07-receitas-e-refeicoes-prontas.md) e [08](./08-snapshots-versionamento-e-integridade-clinica.md) |
| 5 | Avaliações e acompanhamento existentes | [02](./02-ciclo-de-vida-e-persistencia-do-paciente.md), [03](./03-contrato-de-interacao-da-tela-de-pacientes.md) e [05](./05-arquitetura-backend-e-escopos-de-dados.md) |
| 6 | Backup manual simples | [11](./11-recuperacao-e-portabilidade-local.md) e [13](./13-protecao-local-e-backup-simples.md) |

Os SDDs específicos de persistência ainda não foram criados. Seus futuros
artefatos ficam em `specs/`, conforme o fluxo do projeto, e referenciam esta
pasta. As fases internas da Decisão 04 pertencem ao SDD de dietas.

PGlite + Drizzle permanecem candidatos, sujeitos à PoC da Decisão 10. Esta
organização documental não executa a prova nem implementa código.

## Limites e justificativas

Continuam fora da V1: login online, múltiplos profissionais, colaboração,
sincronização, outbox, armazenamento clínico remoto, backup automático,
criptografia, exportação isolada `.diet`, revisão histórica de cada edição,
migração de dados de teste e uso simultâneo de abas.

Também não há gerações de base, tabela de recibos, infraestrutura de upgrades
automáticos ou funcionalidades avançadas de PWA. Offline básico e testes dos
fluxos entregues permanecem necessários.

As justificativas do que foi retirado e do que foi mantido estão na
[Decisão 14, seções 5 e 6](./14-consolidacao-e-portao-de-execucao.md).
A [Decisão 12](./12-autenticacao-online-e-soberania-local.md) registra somente
autenticação futura; não gera tarefas implícitas para esta implementação.

## Catálogo das decisões

- [01 — Fluxo de paciente e dieta](./01-fluxo-paciente-dieta.md)
- [02 — Ciclo de vida e persistência do paciente](./02-ciclo-de-vida-e-persistencia-do-paciente.md)
- [03 — Contrato de interação da tela de pacientes](./03-contrato-de-interacao-da-tela-de-pacientes.md)
- [04 — Plano de execução e validação da arquitetura de dietas](./04-plano-de-execucao-e-validacao.md)
- [05 — Arquitetura de backend e escopos de dados](./05-arquitetura-backend-e-escopos-de-dados.md)
- [06 — Catálogo de alimentos e alimentos customizados](./06-catalogo-de-alimentos-e-customizados.md)
- [07 — Receitas e refeições prontas](./07-receitas-e-refeicoes-prontas.md)
- [08 — Snapshots, versionamento e integridade clínica](./08-snapshots-versionamento-e-integridade-clinica.md)
- [09 — Topologia da V1 local-first e Conta local](./09-topologia-v1-local-first-e-conta-local.md)
- [10 — Motor local, Drizzle e estratégia de migrations](./10-motor-local-drizzle-e-migrations.md)
- [11 — Recuperação e portabilidade local](./11-recuperacao-e-portabilidade-local.md)
- [12 — Autenticação online futura e soberania dos dados locais](./12-autenticacao-online-e-soberania-local.md)
- [13 — Proteção local e backup simples](./13-protecao-local-e-backup-simples.md)
- [14 — Consolidação e divisão da implementação em SDDs](./14-consolidacao-e-portao-de-execucao.md)

## Fonte única e manutenção

Os contratos de persistência antes distribuídos no PRD, no contexto e nos
ADRs 002/008 estão reunidos nesta pasta. Os endereços antigos permanecem como
referências de navegação; não devem manter versões paralelas desses contratos.
O PRD geral e as decisões visuais continuam em seus locais próprios.

Alterações futuras deste escopo devem ser feitas na decisão correspondente.
Este índice reúne requisitos e vocabulário para consulta; regras detalhadas
e justificativas ficam nos documentos indicados.

A orientação de backup sem criptografia e sem senha substitui os requisitos
anteriores em contrário. A consolidação não revoga requisitos de outras áreas
do produto, não muda a proposta e não autoriza funcionalidades fora da V1.
