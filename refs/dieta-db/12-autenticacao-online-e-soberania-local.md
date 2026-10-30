# Decisão 12 — Conta online, saves protegidos e soberania clínica

- **Status:** Substituída (saves, grants e catálogo de saves removidos) — 2026-10-30
- **Data da atualização:** 2026-10-11
- **Escopo:** Identidade profissional, autorização dos saves e limites dos dados locais

> **Substituída em 2026-10-30 pela [Decisão 15](./15-esquema-transferencia-backend-supabase.md).** O produto grava tudo na conta (Supabase) e não tem mais modo local nem save `.nutridiet`. Este texto fica como registro histórico; só o formato do arquivo segue válido, como entrada da importação (Decisão 15, F4).

## 1. Identidade e responsabilidades

Supabase Auth valida a identidade online do profissional, confirmação de e-mail,
credenciais e sessão. O perfil profissional é cifrado no banco remoto, incluindo a preferência de avisos da agenda e o logotipo PNG opcional para documentos. Perfis anteriores assumem avisos ativos e nenhum logotipo. Essas preferências não alteram o schema clínico dos saves. O catálogo
remoto conserva apenas proprietário, IDs necessários ao vínculo, rótulo cifrado,
datas e material de chave cifrado. O `ownerId` vem do guard de sessão do backend;
parâmetros, UUIDs isolados, estado da interface e `user_metadata` não concedem
acesso.

A conta profissional online e a Conta clínica dentro do `.nutridiet` são
identidades distintas. `localAccountId` é preservado como texto e vinculado a
um `saveId` de proprietário único. Não existem equipes, compartilhamento,
transferência nem sincronização entre dispositivos nesta fase.

## 2. Soberania dos dados clínicos

O serviço online não recebe, armazena, indexa ou sincroniza:

- pacientes e contatos;
- avaliações, consultas, anotações, dietas e refeições;
- alimentos, receitas, macros, snapshots, banco local ou drafts;
- handles, caminhos locais e conteúdo de arquivo `.nutridiet`.

Esses dados permanecem no dispositivo. O arquivo principal vinculado usa um
envelope externo v2 AES-256-GCM; o backend guarda a DEK envolvida e a prova de
vínculo, e entrega material de autorização somente no endpoint específico após
validar conta, proprietário, sessão e prova. O conteúdo clínico não é enviado
para o Supabase. Catálogo e autorização são metadados de controle de acesso,
não backup, upload ou confirmação de checkpoint.

## 3. Autorização e continuidade

Login, criação de save e abertura/reabertura exigem conexão e validação do
backend. Um grant aceito vincula `(ownerId, saveId, localAccountId, keyId,
bindingProof)`, importa a CryptoKey como não extraível e dura no máximo oito
horas desde a autorização. Reload perde o grant. A localização de arquivo e o
estado do navegador não o criam nem renovam.

Enquanto um save já está aberto e o grant permanece válido, leitura, edição,
drafts e checkpoints ocorrem localmente; cada gravação clínica não precisa
consultar Supabase. Offline não permite login, criar save ou reabrir arquivo.
Na expiração, suspensão reconhecida ou logout, novas operações e a árvore
clínica são bloqueadas. A aplicação conclui operações já aceitas, checkpoint e
flush do draft local antes de descartar o runtime; uma falha preserva o runtime
bloqueado para retry explícito. Nenhum outro tuple recebe esses dados.

Não há garantia de primeiro carregamento offline, cache PWA completo ou
coordenação entre abas. Essa feature não implementa suporte PWA novo.

## 4. Arquivos, legado e backup

O envelope clínico lógico e o schema local permanecem independentes do novo
envelope externo. Arquivos protegidos v2 exigem autorização e AES-GCM válida
antes de trocar o banco local. Saves legados plaintext continuam legíveis; a
adoção cria uma cópia protegida em destino distinto e não regrava o original.
Uma migração determinística do payload reconhecido acontece em memória e não
reescreve silenciosamente o arquivo de origem.

O arquivo/export protegido não cifra IndexedDB, PGlite, drafts ou outros dados
do dispositivo. A proteção não se promete contra quem controla o navegador,
sistema operacional, sessão já autorizada ou material de chave já entregue ao
runtime. O e-mail continua visível ao provedor de Auth. Portanto, a arquitetura
é cifrada localmente e minimiza dados remotos; não é uma alegação de E2EE
estrita nem de cifra de todo armazenamento do dispositivo.

## 5. Chaves e operação

Uma DEK aleatória por save cifra o arquivo local; o servidor guarda apenas sua
forma envolvida por uma KEK de servidor. Perfil profissional e metadados
privados também usam cifra autenticada. A KEK precisa de backup restrito e
recuperável separado do repositório. O código atual mantém uma KEK ativa; perda
ou troca sem re-envolvimento pode tornar dados persistidos ilegíveis. Rotação
histórica ainda exige procedimento próprio antes de ocorrer.

Auth remoto requer confirmação de e-mail e SMTP adequado para destinatários da
aplicação. Não se envia e-mail real durante testes sem destinatários/serviço
aprovados. Redirects devem corresponder ao `APP_ORIGIN` HTTPS estável aprovado.

## 6. Estado de ativação

O projeto dedicado `diet-maker` foi criado no Supabase e o CLI está linkado a
ele. Migration, usuários, configuração remota de Auth, SMTP, callbacks e
deploy ainda não foram aplicados. Desenvolvimento e testes locais usam Docker
e Mailpit. A implementação local não representa autenticação ou disponibilidade
remota em produção.

Contratos executáveis e evidências estão em
[SDD de contas e saves](../../specs/10-10-26-integrar-supabase-contas-saves/implementation-log.md)
e [guia de setup](../../docs/setup/online-auth.md).
