# Modelo de dados proposto

Nenhuma tabela criada. Conteúdo clínico ausente do modelo remoto.

## Supabase Auth

auth.users.id é ownerId estável, distinto da Conta clínica no save. E-mail, confirmação, hash bcrypt e sessões geridos pelo provedor; sem modificar tabelas Auth ou duplicar senha/e-mail nas próprias. Runtime lê somente `id` e `user_id` das sessões atuais por `private.runtime_auth_sessions`; não recebe `USAGE` no schema `auth` nem acesso aos outros campos/tabelas.

## Schema private

### professional_profiles

owner_id UUID PK/FK auth.users; profile_cipher/iv/kek_id (AES-GCM, AAD purpose=profile+owner); created_at servidor.

Payload cifrado: nome/sobrenome trim, 1–100 caracteres cada; averagePatientsPerMonth finito >=0; experience união `{kind:'months_1_6'}`, `{kind:'months_6_12'}` ou `{kind:'years',value:number}` finito >=0. Faixa não aceita value/não vira duração exata; years exige value, inclusive zero/fração. Resposta não comprova formação profissional.

Cadastro compara e-mails trim/sem distinção de caixa; senha sem trim/normalização, mínimo 12 caracteres e máximo 72 bytes UTF-8; confirmação idêntica. Informar limites na UI. Confirmações só validadas, não persistidas. Bootstrap INSERT-only; duplicados não alteram perfil. Sem perfil/e-mail confirmado não há acesso a catálogo/chaves. Perfil faltante após confirmação só é completado por identidade/sessão verificadas, com os mesmos dados profissionais e INSERT-only, sem autenticar pela resposta de signup.

### saves

| Campo | Regra |
| --- | --- |
| id UUID PK | saveId backend opaco, imutável |
| owner_id FK profile | Dono único; índice owner+created_at+id |
| local_account_id TEXT UNIQUE | Identidade clínica lógica preservada, string não vazia; atual usa nanoid(16), não UUID; claim global único |
| key_id UUID UNIQUE | Identidade lógica da DEK, não o segredo |
| wrapped_key, wrap_iv, wrap_kek_id | DEK cifrada (32 bytes no plaintext); fora do catálogo |
| binding_mac, binding_kek_id | HMAC-SHA256 não clínica imutável de owner/save/Conta clínica/key_id; o identificador também permite selecionar a KEK histórica |
| label_cipher, label_iv, label_kek_id | Nome opcional 1–80 chars, padrão Save, cifrado por propósito/owner/save |
| idempotency_key UUID | UNIQUE(owner_id,idempotency_key); retry não muda payload |
| created_at | Servidor; registro imutável nesta fase |

Sem pacientes/dietas/notes/snapshots/drafts/arquivo/path/e-mail. Identidade clínica é metadado necessário ao vínculo. Runtime tem somente INSERT/SELECT de saves e perfis; sem endpoint de transferência, alteração de chave ou relato de checkpoint remoto. Claim conflitante não informa outro dono.

RLS por owner transacional; ausente nega. UNIQUE arbitra concorrência. Mesmo dono retoma vínculo/DEK; idempotencyKey com payload diferente gera 409. Mudança futura do wrapping conserva DEK/key_id/prova. Sessão validada em toda operação, além da RLS.

### auth_rate_limits

bucket_hash = HMAC(endpoint+tipo+e-mail normalizado/IP); window_start/attempts/expires_at; PK bucket/janela. Incremento atômico, limpeza oportunista limitada de expirados até 24h; sem cron adicional. Policy só runtime, sem grants browser ou identificadores legíveis.

## Local

- SaveLocation: `(ownerId,saveId)` → FileSystemFileHandle, nome local e permissão; ponteiro ativo separado. Identificadores não secretos de tentativa pendente (localAccountId/idempotencyKey/saveId/prova pública quando disponível) ficam na mesma associação para retomar registro/gravação sem gerar outra DEK; nenhum segredo utilizável. Não envia handle ao servidor/não autoriza.
- OnlineSaveGrant: tuple owner/save/localAccount/keyId, CryptoKey, bindingProof, authorizedAt/expiresAt; somente memória. Reload perde grant.
- Workspace: PGlite existente isolado por tuple autorizado. Namespace antigo só é adotado após vínculo validado; preservar revisões mais novas, base anterior e recuperação, sem substituir silenciosamente por snapshot antigo.
- Drafts: contratos atuais associados ao namespace; sem segredo criptográfico e sem recuperação entre donos. PGlite/drafts não recebem cifra em repouso neste escopo.

## Arquivo protegido

JSON UTF-8 .nutridiet: appId=nutridiet-local-pro, formatVersion=2, saveId, algorithm=AES-256-GCM, `bindingProof` como string opaca versionada `v1:<binding_kek_id>:<base64url-HMAC-SHA256>` (MAC canônico de 32 bytes), `iv`/`ciphertext` base64url. O ID identifica o verificador e não é segredo nem prova suficiente sem comparação server-side. Sem ownerId/nome/e-mail/pacientes/DEK/path em claro. Payload preserva envelope clínico atual formatVersion=1/schemaVersion='11'.

AAD UTF-8 de tuple fixo `[appId,formatVersion,saveId,algorithm,bindingProof]`; não depender de ordem arbitrária do JSON. IV aleatório 12 bytes novo por cifra; tag 16 bytes anexada conforme Web Crypto. Validar base64url/tamanho/tipo/versão/algoritmo antes de decifrar; depois validar/migrar payload e comparar Conta clínica com grant antes de importar. Limites de arquivo seguem port/validador existente, sem truncar prontuários.

Legado reconhecido explicitamente pelo envelope anterior, migradores conhecidos. Versão desconhecida/downgrade/mistura de campos falha sem mutação. Aplicativo antigo sem codec não lê envelope v2; preservar legado para rollback sem alegar proteção dele.

## Estados

| Objeto | Transições |
| --- | --- |
| Conta | visitante → pendente → verificada; duplicado/retry não muda perfil |
| Recovery | token selado curto → OTP consumido no POST → senha alterada + login normal; inválido/expirado/replay pede outro link |
| Registro | inexistente → vínculo permanente (owner/DEK/prova atômicos); falha local retoma o mesmo vínculo, sem estado remoto de gravação |
| Localização | checking → Sincronizado/Desincronizado com motivo; relink pede ação/permissão, não concede grant |
| Clínica | locked/sem grant → autorizando online → active; falha de escrita → paused; prazo/logout → locked com conservação |
| Escrita | snapshot autorizado → cifra → write → close → checkpoint confirmado; erro → abort e conservação |

Não ativar runtime/migrar base antes de autorização e validação. Operação aceita antes do bloqueio pode concluir conservação; nenhuma operação nova depois do deadline.
