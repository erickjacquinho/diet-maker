# Migration Gate Contract

Cada checkpoint executa, em ordem:

1. auditoria de legado no escopo;
2. auditoria do registry e categorias;
3. `npm run type-check`;
4. `npm run lint`;
5. `npm test` do escopo;
6. `npm run verify:links`;
7. revisão de Atomic/Shadcn;
8. validação visual e acessível das superfícies alteradas.

O checkpoint é `passed` somente se todos os comandos aplicáveis retornarem sucesso, a revisão visual/acessível estiver aprovada e o registry/evidência estiverem atualizados. Caso contrário é `blocked`; nenhuma tarefa posterior da sequência pode começar.
