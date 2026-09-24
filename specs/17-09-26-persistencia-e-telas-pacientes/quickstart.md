# Verificação da implementação

1. Rode `npm run type-check` e `npm test`.
2. Rode os testes de navegador relacionados a salvar/carregar perfil e confirme que `tests/browser/profile-save-load.spec.ts` continua passando.
3. Use a fixture existente de 100 pacientes, 2.000 dietas e 2.000 avaliações. Confirme que a consulta de `/pacientes` retorna até 25 cadastros após busca/ordenação global, mantém agrupamento e ações, e busca resumos em lote somente para os IDs da página.
4. Para um paciente com 2.000 dietas e 2.000 avaliações, confirme que a carga de cada página retorna no máximo 25 registros, preserva total/ordem e não hidrata dietas fora da página nem cardápios fechados.
5. Confirme equivalência dos resumos de dietas com `Decimal` antes/depois de salvar e ao importar `.nutridiet` schema 4, 5 e 6.
6. Teste o fluxo do arquivo: digitação/autosave local não escreve `.nutridiet`; save confirmado grava uma vez; mudança de tela limpa não grava; falha de permissão conserva o workspace; retry grava; recarga recupera a revisão pendente; mutação durante checkpoint não fica marcada como salva.
7. Confirme que restaurar arquivo inválido não troca o workspace e que restauração válida substitui os dados somente após confirmação.

Registrar tempos de primeira página no navegador desktop e compará-los com os critérios SC-001/SC-002 da especificação. Não usar o teste de benchmark para ocultar falhas de equivalência ou paginação.
