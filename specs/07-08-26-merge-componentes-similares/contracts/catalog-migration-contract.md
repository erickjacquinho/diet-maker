# Contract: Component Catalog and Lifecycle Migration

## Purpose

Definir os registros mínimos que devem acompanhar qualquer merge, composição, depreciação ou remoção de componente.

## Required registry/profile updates

Para cada fonte alterada, revisar `design-system/components/registry.json` e o perfil correspondente:

- ID, caminho e export real.
- Camada Atomic Design e categoria visual.
- Trait e estado aplicável.
- Consumidores atuais e fonte compartilhada, quando houver.
- Status de lifecycle (`migration-required`, `deprecated`, `removed` ou `stable`).
- Substituto e instrução de migração quando um alias for removido.
- Referência à decisão ou exceção quando a semelhança for mantida separada.

## Input lifecycle

1. Confirmar `src/components/ui/input.tsx` como fonte canônica.
2. Encontrar e migrar todos os consumidores do alias de `atoms/Input`.
3. Atualizar registro, perfil e documentação de import policy.
4. Remover o alias somente quando busca de referências e testes não indicarem dependência válida.
5. Executar auditoria estrita e verificação de links.

## Badge decision

`atoms/Badge` não deve ser removido somente por duplicar variantes. A decisão precisa demonstrar que a entrada canônica preserva consumidores, camada, estados, estilo e lifecycle; caso contrário, documentar o valor do wrapper e manter ambos com relação explícita.

## Audit contract

A entrega é bloqueada por qualquer finding de fonte ausente, export inconsistente, relação duplicada, perfil ausente, estado sem justificativa, token inválido, link quebrado ou transição de lifecycle incompleta. A validação deve produzir evidência nominal e reproduzível.
