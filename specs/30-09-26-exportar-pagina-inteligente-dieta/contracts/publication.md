# Contrato remoto de publicação

## Transporte e credenciais

HTTPS em produção. Base pelo origin configurado, API no mesmo projeto da página Vercel. `Authorization: Bearer <publicationKey>` somente em requests de escrita/status; chave nunca em URL, query, snapshot, log ou bundle público. Servidor valida formato de 32 bytes e deriva SHA-256 como owner namespace. Primeira publicação cria namespace por posse dessa chave; não usa accountId fornecido como autorização nem permite substituir um dono existente por outra credencial. Não implementar login.

## POST /api/diet-publications

Body: schemaVersion=1, operationId aleatório estável por confirmação/retry, sourceKey estável por paciente+dieta, expectedRevision (0 na criação, >=1 na atualização), snapshot conforme data-model. Cliente captura último draft e preserva IDs. Limite 1 MiB; Content-Type application/json. Para atualização, verificar dono e revisão antes da escrita. Retornar 201 criação ou 200 atualização/replay: {url,revision,publicationId,operationId}. Token permanece igual por owner namespace+sourceKey. Nova confirmação usa novo operationId; retry da mesma confirmação usa o anterior.

Transação vincula operação, publicação e revisão; dupla chamada simultânea não duplica links/revisão. Repetir mesmo operationId com body diferente =409; revisão stale =409 com instrução de consultar status e reconfirmar, não sobrescrever automaticamente. Se erro após commit e antes de resposta, recuperação retorna resultado confirmado, sem republicar.

## GET /api/diet-publications/status

Authorization obrigatório; parâmetros sourceKey e operationId opcional. Retorna somente ao titular {url,revision,publicationId,operationResult?} ou ausência explícita. Nunca aceita readToken como credencial. Permite recuperar depois de reload/save restore, inclusive resultado incerto; acesso cruzado não expõe outra conta. Dados estáveis por namespace de credencial+sourceKey mesmo se o browser do profissional reiniciar.

## GET /dieta-publicada/:readToken

Sem login/sessão local. Validar token e carregar snapshot restrito no servidor. Não aceita mutação. Links inválidos retornam página indisponível/404 sem detalhes clínicos. Server component não importa browser-composition; client componente só gerencia Tabs/checks. Headers no-store, X-Robots-Tag noindex/nofollow, Referrer-Policy no-referrer; metadata robots correspondente. Não listar links em sitemap nem carregar terceiros.

## Erros

400 payload/IDs/unidades/mode inválidos; 401 credencial ausente/malformada; 404 publicação indisponível ou não pertencente ao titular para atualização por publicationId; 409 revisão/operationId conflitantes; 413 body grande; 429 limite; 503 configuração remota inválida/banco indisponível; timeout cliente tem resultado incerto consultável. Nenhum erro inclui chave, token de outro paciente ou conteúdo de save. Falha não muda versão anterior. Origem permitida/CORS não substitui autenticação.

## Ambiente e segurança operacional

DATABASE_URL servidor; NEXT_PUBLIC_DIET_PUBLICATION_ORIGIN origin sem chave; DIET_PUBLICATION_ALLOWED_ORIGINS lista de origins profissionais autorizados (quando cross-origin). Falta/invalidade impede publicação com erro explícito. Primeira inscrição por posse é limitada por contadores, sem cadastro online; credencial perdida não recupera titularidade por Account.id. Clone do save com mesma chave compartilha capacidade de publicar, conforme modelo aceito.

## Banco

Migração 001-publications.sql para Publication, PublicationOperation e contador de rate limit. SQL parametrizado; constraint de unicidade, CAS de revisão e gravação da operação na transação. Banco remoto armazena somente snapshot do que foi exportado. PGlite local, schema clínico e saves completos não são enviados ao servidor.
