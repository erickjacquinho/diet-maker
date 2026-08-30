# Decisão 14 — Consolidação e Divisão da Implementação em SDDs

- **Status:** Escopo documental ajustado; SDDs de persistência ainda não criados
- **Data:** 2026-08-30
- **Escopo:** Entregas separadas da persistência local, sem ampliar a proposta

## 1. Proposta preservada

- Uma Conta e um profissional por base local, sem login ou sincronização na V1.
- Biblioteca de alimentos customizados, receitas e refeições prontas da Conta.
- Pacientes, acompanhamento existente, prescrições e histórico por Conta + Paciente.
- `DietDraft` somente em IndexedDB; autosave não cria prescrição confirmada.
- **Salvar** confirma a dieta em transação; a vigente anterior vira histórico.
- Vigente editável por salvamento explícito; histórica somente leitura.
- Backup manual `.nutridiet` em JSON, **sem criptografia e sem senha**.
- Uso local sem rede após preparação dos recursos necessários da aplicação.
- Uma única aba ativa, sem funcionalidade de uso simultâneo.

## 2. Situação das etapas

As Decisões 04 e 10 já definiam fases técnicas, mas não havia SDDs separados
para esta arquitetura em `specs/`. A Decisão 04 detalha o fluxo de dietas; ela
não representa seis features nem exige um SDD por fase interna.

A tabela abaixo organiza os próximos SDDs. Os números indicam ordem de
trabalho, não IDs definitivos de pasta. Esta revisão não cria `spec.md`,
`plan.md` ou `tasks.md`, nem marca implementação como concluída.

## 3. Divisão em SDDs

| Ordem | SDD | Entrega e limite | Dependência |
| --- | --- | --- | --- |
| 1 | Prova técnica e base local | Validar PGlite + Drizzle, persistência, transações, migration simples, separação de drafts e bloqueio da segunda aba. Registrar resultado e fixar o adaptador somente se aprovado. Sem integrar todos os módulos. | Nenhuma |
| 2 | Conta e pacientes | Persistir perfil local e cadastro de pacientes, incluindo edição e arquivamento. Preservar o contrato de restauração sem criar tela administrativa futura. Criar somente contratos/tabelas necessários, sem migrar dados de teste. | 1 aprovado |
| 3 | Dietas: rascunho, salvamento e histórico | Entregar o primeiro fluxo vertical completo da Decisão 01 e as fases da Decisão 04, usando TACO e preservando modos/variações já existentes. Validar autosave, vigência, snapshots e cópia. | 2 |
| 4 | Biblioteca reutilizável | Persistir alimentos customizados, receitas e refeições prontas e integrá-los à prescrição, sem referências que alterem dietas já salvas. | 3 |
| 5 | Avaliações e acompanhamento existentes | Migrar a persistência das avaliações, próximos acompanhamentos e demais registros já previstos, sem criar agenda, prontuário ampliado ou novos fluxos clínicos. | 3 |
| 6 | Backup manual simples | Exportar todos os dados confirmados da Conta e restaurá-los por substituição validada e transacional. Sem senha, criptografia, automação ou mesclagem. | 4 e 5 |

Cada SDD deve ter seus próprios requisitos, plano, tarefas e validação. Os
testes acompanham a entrega a que pertencem; não há uma feature separada de
“homologação avançada”. A execução dos planos segue `/speckit-implement`,
conforme as instruções do projeto.

A integração deve substituir o armazenamento legado por módulo, sem duas
fontes canônicas para a mesma entidade. Os registros legados são de teste e
serão descartados, sem construir um migrador.

## 4. Portão técnico proporcional

A prova da Decisão 10 deve comprovar persistência real, atomicidade,
integridade e exclusividade da instância. Não precisa implementar o produto
inteiro para escolher o motor.

Se PGlite falhar em requisito essencial, registrar a limitação e reavaliar o
adaptador. Os contratos de domínio permanecem independentes do motor.

O funcionamento offline básico é verificado nos fluxos integrados. Não inclui
instalação de PWA, sincronização em segundo plano, coordenação de abas ou
plataforma de atualização. A disponibilidade das telas sem rede exige seus
recursos previamente carregados/cacheados; banco local sozinho não basta.

## 5. Excesso retirado e justificativas

| Ajuste | Justificativa |
| --- | --- |
| Backup JSON sem criptografia ou senha | Orientação explícita do usuário; elimina chaves, recuperação de senha e envelope criptográfico |
| Uma aba ativa, com bloqueio simples da segunda | Evita duas instâncias do banco sem implementar colaboração, eleição de líder ou sincronização |
| Sem gerações de base e preservação de drafts na restauração | Resolver edições pendentes antes e substituir em uma transação elimina a necessidade desses mecanismos |
| Sem tabela de recibos e protocolo genérico de operações | ID estável da dieta, versão esperada e bloqueio de envio atendem ao fluxo local; resultado incerto é conferido antes de repetir |
| PoC com amostra representativa, sem nova certificação em vários navegadores | Valida o risco do motor sem impor volumes e metas operacionais não solicitados |
| Sem infraestrutura de upgrades automáticos do motor | Fixar a versão e validar mudanças quando necessárias evita construir antecipadamente uma plataforma de atualização |
| Offline limitado aos fluxos locais existentes | Preserva a proposta sem acrescentar funcionalidades de PWA ou trabalho em segundo plano |

## 6. Proteções mantidas e justificativas

| Proteção | Por que permanece |
| --- | --- |
| Capturar o último estado do editor e ordenar autosave | Evitar que Salvar perca a última digitação ou que um callback recrie um draft descartado |
| Transações, relações e uma vigente por paciente | Evitar dados parciais, referências inválidas e duas prescrições vigentes |
| Versão esperada e ID estável no salvamento | Detectar rascunhos desatualizados e impedir duplicação em novas tentativas |
| Snapshots e regras nutricionais explícitas | Preservar o que foi prescrito e não recalcular o histórico pelo catálogo atual |
| Validar backup antes de substituir a base, com confirmação | Evitar importação inválida e perda acidental dos dados atuais |
| Informar limites do armazenamento e do arquivo sem senha | Não prometer recuperação ou sigilo que a solução simples não oferece |

Não fazem parte desta implementação: autenticação futura, nuvem, outbox,
sincronização, colaboração, múltiplos profissionais, backup automático,
criptografia, revisão histórica de cada edição, exportação isolada `.diet`
ou migração dos dados de teste.
