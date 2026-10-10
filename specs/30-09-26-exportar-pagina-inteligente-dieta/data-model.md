# Modelo de dados da publicação

## Account (local)

Campos atuais id/displayName/phone/createdAt/updatedAt preservados. Adicionar publicationKey: string | null (32 bytes aleatórios codificados base64url). Conta normalizada pode não ter chave até primeiro preparo; nunca confundir id com segredo. Chave integra export/import do save schema 8; schemas 4–7 seguem aceitos. Geração na preparação é persistida uma vez e checkpoint antes da rede. Save importado com chave a preserva byte a byte; save antigo sem chave não consegue substituir publicação de namespace anterior silenciosamente.

## PublishedDietSnapshot

schemaVersion=1; patientName; authorName disponível da conta; authorRegistration opcional real; prescriptionDateIso; mode=SIMPLE; meals[{id,name,time?,position,options[{id,label,position,items[{id,name,quantity,unit}],macros|null}]}]; dayMacros|null. Macros decimais são strings formatadas por formatNutrition; ordem P,C,G,kcal na apresentação. unit: g/ml/unit, render unit como un. Não enviar Account.publicationKey, save, dados de avaliações, catálogo nem contatos não utilizados. IDs são opacos de elementos e só servem para seleção; accountId/patientId internos não entram no payload público. Total vem de countsTowardTotals e itens PRIMARY dos snapshots, não de abas/checks/metas.

## Publication (remoto)

publicationId aleatório; ownerKeyHash; sourceKey interno estável derivado de patientId e draft.targetDietId/baseDietId pelo cliente e validado como opaco; readToken aleatório secreto de leitura; revision inteiro >=1; snapshot JSON validado; publishedAt/updatedAt. UNIQUE(ownerKeyHash,sourceKey), UNIQUE(readToken). Chave bruta não armazenada. UPDATE por ownerKeyHash e revision esperado; commit incrementa revision uma vez. Resposta pública expõe apenas revision+snapshot, não owner/source.

## PublicationOperation (remoto)

ownerKeyHash+operationId UNIQUE; requestFingerprint; publicationId; committedRevision; resultUrl; createdAt. Resultado da operação é persistido na mesma transação. Repetir operação+fingerprint devolve resposta original sem alterar revision; fingerprint diferente = 409. Retry após timeout mantém operationId. Status autenticado permite recuperar resultado; ownerHash só vem da credencial, nunca do body.

## PublicationWriteWindow (remoto)

windowKey (origem+namespace com identificadores derivados), windowStart e count. Incremento atômico para limite de 30/min. TTL operacional de contadores; não persiste dados clínicos. Limite aplicado também às primeiras publicações antes de criar namespace; não é prova de propriedade.

## PatientChecks (navegador)

localStorage key `nutridiet:diet-checks:v1:<readToken>:<revision>`; valor lista validada de combinações mealId/optionId/itemId. Não guardar chave profissional nem copiar snapshot no storage de checks. Ler somente IDs presentes na publicação. Nova revisão inicia vazia, não migra seleções; recarga mesma revisão preserva. Storage malformado vira vazio; quota/permissão falha degrada para memória com aviso. Não compartilhar entre browsers, não resetar automaticamente por dia.

## Estados

Modal: closed → ready → preparing → publishing → success; preparing/publishing → error, retry conserva identidade da operação incerta. Cancelar antes da confirmação não cria snapshot. Snapshot público: absent → published revision1 → updated revisionN, com mesmo token; falha mantém versão anterior. Edição/salvamento local não é transição remota. Check: unchecked ↔ checked local, reset somente por nova revisão (ou limpeza do navegador).
