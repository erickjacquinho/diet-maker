# Validação

- Lista real: 100 pacientes, 2.000 dietas e 2.000 avaliações em 4 consultas, sem hidratar cardápios; projeção medida em 102,8 ms no ambiente local de teste.
- Histórico: macros, energia, metas, ciclos e contagem de refeições equivalentes ao cálculo sobre os documentos completos.
- Renderização: históricos de dietas e avaliações paginados em 25 linhas; todos os registros permanecem acessíveis.
- Salvamento: snapshots no schema atual deixam de passar pela validação completa antes da escrita; arquivos antigos continuam normalizados no próximo sync. O arquivo `.nutridiet` ainda é substituído integralmente, portanto escrita e serialização permanecem O(tamanho total da Conta).
- Verificações: build de produção, type-check, ESLint direcionado, testes de integração/componentes/performance, auditoria Atomic Design e verificação estrita do catálogo passaram.
