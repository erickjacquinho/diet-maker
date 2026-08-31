# Revisão técnica — T032/T033

**Revisor:** agente Codex (revisão técnica automatizada/manual do diff)  
**Data:** 2026-08-31  
**Base:** checkpoint `1c5b9d8ef1ceada89f669c3bd7c53ef676531fcc`

Esta revisão não substitui os dois revisores humanos previstos pela governança.

## Checklist

- [x] Todos os targets do contrato têm fonte final e owner no registry.
- [x] Coordenadores foram movidos para `organisms`; helpers e resultados
  permanecem em `molecules`.
- [x] Não há implementação migrada residual em `src/components/molecules` nem
  dependência molecule → organism ascendente.
- [x] Tabelas afetadas continuam compostas por `DataTable`; auditoria completa
  retorna 12/12 sem erros ou avisos.
- [x] Empty, seleção, expansão, teclado, foco, Escape e somente leitura estão
  cobertos por testes de componente/browser.
- [x] O foco do `FoodSearchModal` retorna ao botão consumidor sem alterar o
  primitivo `Dialog`.
- [x] Categorias, traits, schema, tokens, regras, CSS global, primitives UI e
  auditores não foram alterados.
- [x] Não foram adicionadas dependências, persistência, autenticação, cálculo ou
  I/O de dados pessoais.
- [x] Nenhum snapshot foi aprovado automaticamente.

## Achados

### RV-001 — Gate global não verde

**Severidade:** bloqueio de conformidade global  
**Estado:** aberto fora do escopo da feature  
**Evidência:** `npm test` ficou 90s sem progresso e saiu com exit 1; a baseline
já registra falhas de legacy cutover, navegação de pacientes, auditoria legada
e `useDietMealActions`, além do aviso de navegação jsdom.

Não há evidência atual suficiente para atribuir novos failures à adequação. Os
testes específicos e o build permanecem verdes. O bloqueio é reportado, não
ocultado.

### RV-002 — Registro de hash da baseline inconsistente

**Severidade:** bloqueio documental de comparação literal  
**Estado:** aberto para coordenação da baseline  
**Evidência:** o arquivo atual `src/app/globals.css` está sem diff, mas o valor
capturado em `protected-hashes.txt` termina em `...5511`, enquanto o hash atual
termina em `...5517`.

Como não há alteração da fonte protegida, não foi feita correção no CSS nem
reescrita silenciosa da evidência inicial.

## Decisão

Não foram encontrados blockers de código no escopo da adequação. O resultado é
“aprovado tecnicamente no escopo, com bloqueios documentados”, e não aprovação
global nem aprovação humana. T029–T034 podem ser reconciliadas com esses
estados explícitos; a declaração final deve manter as duas pendências acima.
