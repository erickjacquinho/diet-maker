# Contrato HTTP do backend

Contrato da entrega original, posteriormente implementada. Destinos de autenticação atualizados em 2026-10-25 conforme a navegação de 20/23-10; esta revisão não revalida implantação remota. UI usa somente mesma origem. Runtime Node, Content-Type JSON nos POST, corpo máximo 16KiB para identidade e 8KiB para metadados (nenhum arquivo/backup). Schema rejeita campos desconhecidos como `ownerId`, `patients`, `snapshot`, `drafts`, `key` e `ciphertext` clínico. Respostas privadas e de tokens usam no-store.

## Autorização comum

Guard privado obtém identidade por getUser, confere e-mail verificado/não anônimo, perfil existente e session_id do JWT validado em auth.sessions para o mesmo usuário. Nunca confiar em UUID/cookie isolado, user_metadata ou parâmetro da página. Transação de dados recebe owner somente desse guard. POST exige Origin exata e CSRF válido, inclusive login/logout/reset. Sem CORS aberto.

| HTTP | Significado |
| --- | --- |
| 400 | Campo/estrutura inválida, erro associado ao campo sem reproduzir valores secretos |
| 401 | Sessão ausente/inválida ou login recusado genericamente |
| 403 | Origem/CSRF inválidos ou conta ainda sem acesso privado |
| 404 | Save indisponível para este usuário: mesmo resultado para inexistente/outro dono/prova inválida |
| 409 | Retry com payload diferente ou identidade legada indisponível, sem informar dono |
| 429 | Limite de tentativas; Retry-After, sem indicar existência de e-mail |
| 503 | Serviço indisponível: não conceder sessão/grant nem renovar janela |

Erro JSON: `{code,message,fieldErrors?,requestId}`. Sem stack, token, senha, e-mail completo ou chave. Para signup/recovery de e-mail válido, mensagens públicas genéricas: “Se for possível usar este e-mail, você receberá as instruções.” Erros específicos do provedor relativos à conta não atravessam o backend.

## Identidade

| Rota | Entrada | Resultado |
| --- | --- | --- |
| GET /api/auth/csrf | Nenhuma | Token selado curto de formulário; cookie HttpOnly de contexto, no-store |
| POST /api/auth/signup | firstName,lastName,email,emailConfirmation,password,passwordConfirmation,averagePatientsPerMonth,experience,csrfToken | 202 genérico após tentativa aceita; validação 400; nunca sessão pelo retorno de signUp |
| POST /api/auth/login | email,password,csrfToken | 200 com destino /dashboard após guard; perfil ausente de identidade verificada encaminha /criar-conta?completar=1 sem acesso a saves; cookies somente HttpOnly, credenciais inválidas apresentam mensagem genérica |
| POST /api/auth/complete-profile | firstName,lastName,averagePatientsPerMonth,experience,csrfToken | Exige getUser/e-mail confirmado/session_id válidos sem exigir perfil; INSERT-only do próprio owner, conflito não altera perfil; destino /dashboard depois de guard completo |
| GET /api/auth/session | Cookies somente | Sessão/profissional mínimo autorizado ou 401; refresh só servidor, sem tokens Auth em JSON |
| POST /api/auth/logout | csrfToken | Revoga sessão corrente, apaga cookies e devolve 204; cliente bloqueia/conserva mesmo em falha de rede e executa revogação pendente antes da próxima autorização |
| POST /api/auth/recovery | email,csrfToken | 202 genérico; não concede sessão |
| POST /api/auth/reset-password | password,passwordConfirmation,csrfToken + cookie recovery | Consome verifyOtp recovery, updateUser e signOut global; limpa cookie; destino /login, nunca /saves |

Validação de cadastro/experiência está em [data-model.md](../data-model.md). Confirmações não persistem; senhas não são trimadas/normalizadas. Média mensal/fracionária permitida. Não enviar dados profissionais para user_metadata como substituto do perfil próprio cifrado.

Bootstrap utiliza UUID da resposta do serviço Auth em transação de INSERT-only com FK real e conflito sem atualização. Conta ofuscada não causa overwrite nem acesso; duplicate unconfirmed também não prova posse. Retry conserva perfil existente. Se o e-mail foi confirmado mas o perfil falhou, login válido cria sessão de identidade e dirige à conclusão na mesma página de cadastro; saves continuam bloqueados. complete-profile obtém owner somente do guard de identidade/sessão, nunca da resposta de signup ou formulário; insere dados profissionais validados, sem perfil vazio. Perfil completo já existente não muda.

## Links de verificação e recuperação

- GET /auth/confirm?token_hash=... prepara cookie HttpOnly selado purpose=email e redireciona à tela limpa /criar-conta?confirmar=1, que pede ação Confirmar e-mail. POST /api/auth/confirm-email consome OTP de tipo email fixo, encerra sessão retornada e orienta login normal. Scanner GET não consome token.
- GET /auth/recovery?token_hash=... prepara cookie HttpOnly selado purpose=recovery e redireciona a /redefinir-senha. POST final consome OTP apenas depois de validar senha/confirmação. Sessão devolvida pelo provedor fica só no handler para updateUser, nunca cookie de login.
- Cookie temporário máximo 15min e expiração do OTP do provedor 15min, uso único, props de propósito/expiração autenticadas. Não aceitar type/next/redirect_to arbitrários. Consentimento de confirmação não precisa de novo componente de domínio: painel mínimo no RegistrationForm.
- Callback sem scripts/analytics externos, no-store, Referrer-Policy:no-referrer, queries sensíveis redigidas no ingress/backend. Redirect imediato à URL sem token. TokenHash é bearer sensível mesmo sendo hash; nenhuma senha/DEK em link.
- Token inválido/expirado/usado ou falha após consumo pede novo link sem alterar saves. Recovery nunca autoriza catálogo/chaves; sessão de login anterior do browser é removida ao entrar no reset para evitar confusão de contas, conservando sessão clínica via bloqueio/flush.

## Saves

| Rota | Entrada | Resultado |
| --- | --- | --- |
| GET /api/saves?page=0&pageSize=50 | Sessão validada; página inteira >=0; pageSize fixo50 | items do dono, totalRows, pageIndex/pageSize; ordenação createdAt+id estável; todos acessíveis por paginação |
| POST /api/saves | idempotencyKey UUID, localAccountId string não vazia preservada do modelo clínico, label?,csrfToken | Registro único para novo/legado; 201 ou200 retry com mesmo saveId/keyId/bindingProof; DEK não retornada aqui |
| POST /api/saves/:id/authorize | bindingProof,csrfToken | Depois de owner+prova+sessão: grant com saveId/localAccountId/keyId, authorizedAt/expiresAt e material de 32bytes para import CryptoKey em memória |

Catálogo devolve `{saveId,label,createdAt}`. Não devolve DEK/wrappedKey/keyId/prova/e-mail/path/clinica. Localização, checkpoint e nome de arquivo são calculados/adicionados localmente, sem endpoint para relatar gravação. Registro devolve prova pública não clínica necessária ao cabeçalho como string opaca versionada `v1:<binding_kek_id>:<base64url-HMAC-SHA256>` (MAC canônico de 32 bytes); o identificador seleciona o verificador e não autentica sozinho. Material de chave passa só por authorize, em canal autenticado no-store e sem logs/SSR serialization/cache. O browser autorizado pode instrumentar a execução: não prometer segredo absoluto.

Authorize valida prova HMAC associada à linha imutável, descifra DEK com AAD correta e devolve material somente para o dono. Nunca receber ciphertext clínico ou acreditar na declaração do cliente de que decifrou. O browser autentica GCM e Conta clínica antes de abrir. Não liberar grant com KEK/DB/Auth indisponível.

Registro novo/legacy é atômico: um owner/uma DEK por localAccountId. IdempotencyKey repetida com tuple diferente recusa; same owner retoma vínculo existente, outro owner não obtém metadados/chave. Nenhum endpoint de transferir save, atualizar key_id ou ler tabela diretamente.
