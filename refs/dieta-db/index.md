# Decisões da Arquitetura de Armazenamento

Esta pasta contém as decisões canônicas para a refatoração da persistência do
NutriDiet.

## Escopo atual

O primeiro fluxo a ser completamente definido é:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

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

## Regras desta pasta

1. Nenhuma decisão de persistência deve ser implementada sem estar registrada
   aqui ou em um documento explicitamente referenciado.
2. Os documentos descrevem contratos de domínio e comportamento, não detalhes
   acidentais de uma biblioteca de banco.
3. Os contratos de domínio devem isolar os detalhes de armazenamento sem
   alterar os componentes da interface. O draft local é deliberadamente
   local nesta decisão e não possui sincronização online automática.
