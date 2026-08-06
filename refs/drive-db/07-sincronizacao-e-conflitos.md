# 07 — Sincronização, Idempotência e Conflitos

## Objetivo

Fazer IndexedDB e Drive convergirem sem bloquear o atendimento e sem sobrescrever silenciosamente edições concorrentes.

## Push

1. Adquirir lease local da operação.
2. Confirmar rede e token.
3. Carregar documento na revisão local indicada.
4. Consultar metadado remoto quando houver arquivo.
5. Se `lastOperationId` já foi aplicado, concluir idempotentemente.
6. Comparar revisão-base e remota.
7. Sem divergência: criar/atualizar.
8. Com divergência: abrir conflito e preservar versões.
9. Validar metadados da resposta.
10. Atualizar `remoteRefs` e concluir outbox em transação.

## Pull

1. Ler cursor de changes ou executar descoberta inicial.
2. Buscar páginas de mudanças.
3. Filtrar workspace/módulos conhecidos.
4. Baixar alterados.
5. Validar envelope, checksum e schema.
6. Migrar quando necessário.
7. Comparar com pendências locais.
8. Aplicar, ignorar idempotentemente ou conflitar.
9. Avançar cursor após commit.

## Idempotência

- `operationId` é único.
- Envelope remoto registra `lastOperationId`.
- Retry após upload e antes de conclusão local reconhece operação já aplicada.
- Create retry busca por appProperties/identidade lógica antes de criar.
- Aplicar a mesma change duas vezes não altera revisão lógica.
- Tombstone repetido é sucesso semântico.

## Revisões

Cada `remoteRef` guarda:

- Drive `fileId`;
- `headRevisionId` quando disponível;
- `modifiedTime`;
- revisão lógica do envelope;
- último operation ID;
- data do último pull/push.

Antes do update, comparar revisão-base com metadados atuais e envelope remoto quando necessário.

## Definição de conflito

```text
mesmo workspaceId/moduleId/entityId
AND existe alteração local não sincronizada
AND revisão remota != baseRemoteRevision
```

Arquivos diferentes não conflitam. Por isso a granularidade por entidade reduz contenção.

## Políticas

| Módulo | Política |
|---|---|
| Paciente | Manual; preservar ambas |
| Dieta | Manual ou duplicar dieta |
| Avaliação | IDs diferentes coexistem; mesmo ID manual |
| Receita | Manual ou duplicar |
| Preset/refeição/alimento | Manual ou duplicar |
| Favoritos | União de IDs válidos |
| Objetivos | União normalizada; remoção concorrente pede confirmação |
| UI preferences | Last-write-wins por timestamp permitido |

## Registro de conflito

Deve conter:

- `conflictId`;
- chave lógica;
- revisão-base;
- envelope local;
- envelope remoto;
- timestamps;
- device ID local;
- status `open/resolved`;
- decisão e entidade resultante;
- referências às cópias preservadas.

Não deve ser enviado a telemetry.

## Resolução

1. Bloquear somente sync do documento, não o workspace.
2. Mostrar diferenças permitidas pelo módulo.
3. Usuário escolhe manter local, remoto, duplicar ou editar resultado.
4. Validar resultado.
5. Incrementar revisão lógica.
6. Criar nova operação com base remota atual.
7. Manter histórico do conflito.

Não fazer merge genérico de JSON clínico.

## Limite distribuído

Drive não é banco transacional nem lock de agregado. Revisão-base e preservação reduzem risco, mas não tornam o produto editor colaborativo em tempo real.

## Retry

| Classe | Tratamento |
|---|---|
| `429`, `500`, `502`, `503`, `504` | Backoff truncado com jitter |
| Rate limit `403` explícito | Backoff |
| `401` | Pausar e pedir autorização |
| Permissão insuficiente | Falha permanente/ação do usuário |
| Schema/checksum inválido | Quarentena |
| `404` | Diagnosticar remoção, conta ou permissão |

Retry possui máximo por janela e `nextAttemptAt` persistido; não usa loop quente.

## Pull incremental

- Guardar cursor somente após aplicar lote.
- Cursor inválido dispara rediscovery controlada.
- Change representa estado atual, não diff de payload.
- Remoção/perda de acesso exige diagnóstico.
- Módulo desconhecido é ignorado com registro seguro, não apagado.

## Coordenação multiaba

- Uma aba é líder de sync por origem.
- Usar `BroadcastChannel`.
- Quando disponível, Web Locks ou lease equivalente.
- Todas as abas salvam no IndexedDB.
- Só líder drena outbox/pull.
- Troca de líder recupera leases expirados.
- Sem APIs, idempotência continua obrigatória.

## Conectividade

- Evento `online` é sinal, não prova de acesso ao Drive.
- Health é inferido por chamada real.
- Offline pausa remoto sem marcar operação como erro permanente.
- `Sincronizar agora` força tentativa elegível.

## Critérios

- Alterações não concorrentes convergem.
- Operação repetida não duplica.
- Crash em qualquer ponto retoma com segurança.
- Conflito bloqueia apenas o documento.
- Cursor nunca avança antes do commit local.
- Erro remoto não apaga save local.

## Referências

- https://developers.google.com/workspace/drive/api/guides/about-changes
- https://developers.google.com/workspace/drive/api/guides/change-overview
- https://developers.google.com/workspace/drive/api/guides/handle-errors
- https://developers.google.com/workspace/drive/api/guides/limits
