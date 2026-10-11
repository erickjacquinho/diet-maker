# Decisão 13 — Proteção local e limites do backup

- **Status:** Implementada com limites explícitos
- **Data da atualização:** 2026-10-11
- **Escopo:** Arquivo principal, backup, banco local e legados sem vínculo online

## 1. Formatos e proteção

O payload clínico lógico segue o contrato versionado da
[Decisão 11](11-recuperacao-e-portabilidade-local.md). Quando vinculado à conta
online, o `.nutridiet` usa envelope externo v2 com AES-256-GCM e identidade de
save autenticada; a mesma chave permanente do save é autorizada pelo backend e
usada localmente. O download de backup pelo menu também permanece nesse formato
protegido.

Arquivos legados ou ainda não vinculados no envelope v1 são JSON plaintext e
não ganham sigilo retroativamente. A adoção de um legado cria uma cópia
protegida, mantendo o original. Não existe senha separada do arquivo nem
derivação de chave a partir da senha de login.

## 2. Limites reais

- A cifra cobre o arquivo protegido, não o banco IndexedDB/PGlite, drafts,
  arquivos temporários ou o perfil inteiro do dispositivo.
- Enquanto o save está autorizado e aberto, o runtime pode ler dados clínicos;
  o controle do navegador, sistema operacional ou uma sessão comprometida pode
  expô-los. Logout/expiração bloqueia novas ações, mas não revoga dados já
  entregues ao dispositivo.
- Supabase Auth recebe o e-mail para autenticação e envio. Operadores
  privilegiados do provedor podem processar os dados de Auth sob os termos do
  serviço.
- A KEK de servidor envolve as DEKs e cifra o perfil profissional persistido.
  Sua perda pode inutilizar os valores cifrados. Uma rotação precisa re-envolver
  ciphertexts com suporte às KEKs antigas e verificação de rollback.
- Restauração valida o envelope e as relações antes de substituir a base; não
  mescla dados. Rascunhos continuam no store local separado e exigem tratamento
  explícito durante restauração.

Não há cifra de todo o dispositivo nem alegação de E2EE estrita: o servidor
controla a KEK de wrapping e o browser recebe uma CryptoKey não extraível para
uso na sessão autorizada. A arquitetura reduz o conteúdo remoto e protege os
arquivos em repouso, mas não protege o runtime desbloqueado.

## 3. Envio e armazenamento remoto

O backend guarda somente identidade/Auth, perfil profissional cifrado,
catálogo mínimo de saves, chave envolvida, prova HMAC e limitadores técnicos.
Não recebe automaticamente banco, backup, pacientes, contatos, prescrições,
receitas, macros ou drafts. Localização de arquivo e status de UI nunca são
prova de ownership nem geram autorização.

## 4. SMTP e sessão

Confirmação e recuperação dependem de envio de e-mail. Mailpit captura mensagens
no ambiente local; testes usam contas sintéticas e não entregam e-mail real.
Para ambiente remoto, configure SMTP e remetente aprovados antes de habilitar
signup/recovery para endereços reais.

A autorização de um save dura até oito horas desde o grant. Reload não restaura
grant, e login/criação/abertura exigem internet. No vencimento ou logout a tela
clínica é mascarada imediatamente; operações previamente aceitas e flush local
de draft/checkpoint são concluídos antes de desmontar a sessão. Falha mantém a
área local bloqueada e recuperável por retry.

## 5. Fora do escopo

- cifrar IndexedDB/PGlite, drafts, PDFs ou todo o perfil do sistema operacional;
- backup automático, sincronização clínica, colaboração ou armazenamento em
  nuvem de prontuários;
- senha de arquivo, equipes, transferência de save ou revogação retroativa de
  plaintext legado;
- rotação automática de KEK até existir procedimento versionado de rewrap.

Implementação/evidência: [SDD de contas e saves](../../specs/10-10-26-integrar-supabase-contas-saves/implementation-log.md).
