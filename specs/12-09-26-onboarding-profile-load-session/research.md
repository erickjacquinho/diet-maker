# Research: sessão efêmera e save local

## Decisões

### 1. Runtime em memória

Usar PGlite `memory://` por aba e remover `idb://nutridiet-local-db-v1` do caminho de produção. A documentação do PGlite diferencia `memory://` (sem persistência) de `idb://` (persistência no IndexedDB): [PGlite Filesystems](https://pglite.dev/docs/filesystems).

Efeito: navegação SPA reutiliza a sessão; reload/fechamento na mesma origem
tentam reconstruir a sessão pelo arquivo associado; nova porta/origem e novo
deploy não herdam a associação e voltam a `/Home`.

### 2. Arquivo escolhido pelo profissional

Usar uma única porta/adaptador baseado em File System Access API: `showSaveFilePicker` para o primeiro save, `showOpenFilePicker` para load e `createWritable` para sincronização. O handle não entra no domínio, mas é persistido no IndexedDB somente como referência técnica do arquivo ativo para a mesma origem. A API requer gesto do usuário e contexto seguro; Vercel deve operar em HTTPS: [MDN File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), [MDN createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable).

Se a API não existir, ou a permissão/arquivo falhar, o app informa o problema e não usa armazenamento do host para substituir o conteúdo do save. Quando o navegador exigir gesto para restaurar a permissão, o onboarding oferece uma ação explícita de retomada.

### 3. Google Drive

Não integrar OAuth ou API do Drive. Uma pasta sincronizada/montada localmente é tratada como qualquer pasta do computador.

### 4. Restore e accountId

Ler e validar o envelope inteiro antes de trocar a sessão. Importar em transação e reconsultar pacientes pelo `accountId` que veio no arquivo. Isso cobre a regressão real em que Jacques Regiani estava no arquivo, mas não aparecia após restore em outra porta.

### 5. Sincronização

Após cada confirmação explícita: `commit em memória → export completo → write no arquivo → status synced`. Digitação e drafts não sincronizam. Falha de escrita preserva a sessão em memória e marca `paused`.

### 6. Compatibilidade

Adicionar telefone opcional à conta: escrever `schemaVersion = 5`, manter `formatVersion = 1`, aceitar schema 4 sem telefone como `null` e rejeitar versões futuras/unknown.

## Alternativas rejeitadas

- Persistência de dados em IndexedDB/localStorage/cookies: continua vinculada à origem/browser e não é fonte clínica. Um registro isolado de handle permissionado é aceito apenas para retomar o arquivo escolhido na mesma origem.
- Banco remoto: contradiz a arquitetura file-backed e cria dependência de host.
- API direta do Drive: exigiria OAuth/backend fora do escopo.
- OPFS: é storage do origin, não o arquivo escolhido e transportável pelo profissional.
