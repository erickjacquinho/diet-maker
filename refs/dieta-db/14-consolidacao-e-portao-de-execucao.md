# Decisão 14 — Consolidação e Portão de Execução da V1

- **Status:** Aprovado pelo usuário para especificação; execução técnica pendente
- **Data:** 2026-08-30
- **Escopo:** Encerramento das decisões de produto e critério para iniciar a
  implementação da persistência local

## 1. Conclusão da definição de produto

As decisões necessárias para a arquitetura de armazenamento da V1 estão
consolidadas. Não há outra escolha de produto que bloqueie o início do trabalho
técnico de persistência.

Em especial, já estão definidos:

- propriedade por **Conta** dos alimentos customizados, receitas e refeições
  prontas, conforme as [Decisões 05](05-arquitetura-backend-e-escopos-de-dados.md),
  [06](06-catalogo-de-alimentos-e-customizados.md) e
  [07](07-receitas-e-refeicoes-prontas.md);
- propriedade por **Conta + Paciente** das informações clínicas, prescrições e
  histórico;
- `DietDraft` **Em Criação** somente local, em IndexedDB, sem entidade
  canônica até o salvamento explícito;
- dieta **Vigente** e snapshots **Históricos** apenas no banco canônico, com
  integridade e imutabilidade preservadas;
- V1 local-first, uma Conta e um profissional por base, sem sincronização ou
  compartilhamento de dados clínicos;
- backup mestre `.nutridiet` manual, criptografado e protegido por senha
  escolhida em cada exportação;
- autenticação online futura limitada a validar o acesso à Conta local, sem
  leitura, cópia ou armazenamento de dados clínicos na nuvem.

## 2. Único portão antes de congelar o motor local

O único ponto pendente é técnico, não de produto: executar a prova de conceito
de **PGlite + Drizzle** prevista na [Decisão 10](10-motor-local-drizzle-e-migrations.md).

Ela deve confirmar, com evidências, persistência após reabertura, transações,
migrations, isolamento por `accountId` e `patientId`, comportamento entre abas,
volume de dados, separação do `DietDraft` e backup/restauração criptografados.

Se a prova for aprovada, PGlite será congelado como adaptador de infraestrutura
da V1. Se falhar em requisito essencial, o domínio, os casos de uso e os
contratos de repositório permanecem; somente o adaptador de banco é substituído.

## 3. Ordem autorizada depois da prova técnica

1. Registrar o resultado da prova e fixar o adaptador de infraestrutura.
2. Criar contratos de domínio, casos de uso e repositórios tipados, sem acoplar
   componentes a Drizzle, PGlite ou IndexedDB.
3. Implementar o banco canônico e migrations para Conta, catálogo, pacientes,
   dados clínicos, dietas confirmadas e snapshots.
4. Implementar o `DietDraftStore` isolado em IndexedDB e só então integrar o
   construtor de dieta e seu autosave.
5. Implementar salvamento explícito transacional, histórico e descarte do
   armazenamento legado de teste.
6. Implementar exportação e restauração do `.nutridiet` criptografado.

Autenticação online, sincronização, colaboração, múltiplos profissionais e
armazenamento clínico remoto não fazem parte dessa sequência inicial.

## 4. Itens que podem ser decididos durante a implementação

Os itens abaixo refinam experiência ou implementação, mas não alteram o modelo
de dados nem bloqueiam a V1:

- regra de qualidade da senha do `.nutridiet`, confirmação e texto de alerta;
- nome sugerido do arquivo e conteúdo não clínico do cabeçalho técnico;
- textos e etapas de confirmação para substituir uma base na restauração;
- opção futura de proteger PDF de dieta com senha;
- eventual exportação estruturada isolada de dados de dieta, que deverá ser
  criptografada quando existir.

## 5. Limites preservados

- Não há implementação autorizada por esta decisão; a execução segue o plano
  técnico aprovado e o processo de implementação do projeto.
- Dados atuais em `localStorage` são de teste e podem ser descartados; não
  haverá migração nem coexistência com o modelo canônico novo.
- O domínio continua independente da biblioteca de banco e dos mecanismos de
  autenticação, preservando a troca futura de adaptadores sem reescrever as
  regras clínicas.
