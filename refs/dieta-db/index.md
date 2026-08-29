# Decisões da Arquitetura de Armazenamento

Esta pasta contém as decisões canônicas para a refatoração da persistência do
NutriDiet.

## Escopo atual

O primeiro fluxo a ser completamente definido é:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

## Decisões

- [01 — Fluxo de paciente e dieta](./01-fluxo-paciente-dieta.md)

## Regras desta pasta

1. Nenhuma decisão de persistência deve ser implementada sem estar registrada
   aqui ou em um documento explicitamente referenciado.
2. Os documentos descrevem contratos de domínio e comportamento, não detalhes
   acidentais de uma biblioteca de banco.
3. A persistência local deve permanecer substituível por uma implementação
   online sem alterar os componentes da interface.
