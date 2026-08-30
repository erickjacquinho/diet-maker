# Decisões da Arquitetura de Armazenamento

Esta pasta contém as decisões canônicas para a refatoração da persistência do
NutriDiet.

## Escopo atual

O primeiro fluxo a ser completamente definido é:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

A arquitetura também define a fronteira de propriedade dos dados nutricionais:

- alimentos customizados, receitas e refeições prontas pertencem à **Conta** do
  nutricionista e podem ser reutilizados entre pacientes;
- pacientes, prescrições, consultas e históricos pertencem à **Conta + Paciente**;
- o `DietDraft` continua sendo apenas um artefato local do navegador e não é
  uma entidade da Conta nem do Paciente até o salvamento explícito.

## Fronteira de persistência das dietas

- **Em Criação** é apenas um `DietDraft` local no navegador, preferencialmente
  armazenado em IndexedDB.
- O primeiro alimento e o autosave gravam somente no draft local; não criam
  entidade no backend/banco e não alteram o histórico.
- Somente **Salvar** persiste a dieta no backend/banco e a torna **Vigente**.
- Dietas **Vigentes** e snapshots **Históricos** vivem no backend/banco.
- Após o sucesso do salvamento, o draft local é removido; em caso de falha, é
  preservado para nova tentativa.

## Decisões

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
- [13 — Proteção local e backup criptografado](./13-protecao-local-e-backup-criptografado.md)
- [14 — Consolidação e portão de execução da V1](./14-consolidacao-e-portao-de-execucao.md)

## Estado da execução

A arquitetura e o plano de validação estão consolidados em Markdown. A
implementação do `DietDraftStore`, a integração das telas e a migração ainda
não começaram. As Decisões 05–09 registram o domínio e a topologia aprovados
para a V1; as Decisões 11 e 12 registram recuperação local e autenticação
futura. A Decisão 13 registra a proteção local e dos backups. A Decisão 10
aguarda somente prova técnica do motor local; a Decisão 14 consolida que essa é
a única condição restante antes de iniciar a execução técnica.

Os dados existentes em `localStorage` são exclusivamente de teste e serão
descartados na implantação da arquitetura nova; não haverá migração desses
dados para o modelo canônico.

## Regras desta pasta

1. Nenhuma decisão de persistência deve ser implementada sem estar registrada
   aqui ou em um documento explicitamente referenciado.
2. Os documentos descrevem contratos de domínio e comportamento, não detalhes
   acidentais de uma biblioteca de banco.
3. Os contratos de domínio devem isolar os detalhes de armazenamento sem
   alterar os componentes da interface. O draft local é deliberadamente
   local nesta decisão e não possui sincronização online automática.
4. Toda entidade persistida deve ter um escopo explícito: **Conta** ou
   **Conta + Paciente**. Nenhuma tabela de negócio pode depender apenas da
   identidade implícita do navegador.
