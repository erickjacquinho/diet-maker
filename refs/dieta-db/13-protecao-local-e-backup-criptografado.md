# Decisão 13 — Proteção Local e Backup Criptografado

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-30
- **Escopo:** Proteção em camadas dos dados clínicos locais e do `.nutridiet`

## 1. Decisão aprovada

Na V1, o banco relacional local (PGlite) não terá criptografia própria em
repouso. A proteção do uso diário será feita por camadas:

- autenticação do perfil profissional e janela local de oito horas;
- vinculação entre `accountId` local e perfil profissional validado;
- conta protegida do sistema operacional e criptografia de disco, como
  BitLocker ou FileVault;
- ausência de envio de dados clínicos para serviços online, logs, analytics ou
  relatórios de erro;
- controle de acesso da PWA para impedir abertura normal da Conta sem sessão
  válida.

Essa decisão protege o cenário normal de uso do consultório sem introduzir,
agora, gerenciamento de chaves para cada leitura e escrita do banco local.

## 2. Limite explícito da proteção do banco local

Login do NutriDiet protege a interface, mas não torna o armazenamento do
navegador secretamente criptografado. Uma pessoa com acesso ao mesmo perfil do
sistema operacional/navegador pode tentar inspecionar dados locais fora da
aplicação.

Por isso, a V1 exige orientação clara para uso de conta individual no sistema
operacional e disco criptografado. Criptografia do banco local poderá ser
adicionada futuramente por um adaptador de infraestrutura, sem mudar modelos de
domínio, repositórios ou snapshots clínicos.

## 3. Arquivo `.nutridiet` criptografado

Todo arquivo exportado `.nutridiet` será criptografado e autenticado com
**AES-256-GCM** antes de sair do dispositivo. Isso protege o principal vetor de
portabilidade: cópia para pendrive, Drive, e-mail ou outro computador.

O arquivo deve conter apenas um cabeçalho técnico mínimo não clínico, suficiente
para identificar formato, versão e parâmetros de derivação da chave. Pacientes,
dietas, receitas, avaliações e demais dados clínicos ficam somente no payload
cifrado.

Na importação, o sistema deve autenticar e decifrar o arquivo antes de ler seu
conteúdo. Senha/chave incorreta ou conteúdo adulterado encerra a importação sem
alterar a Conta local.

## 4. Guardrails criptográficos

1. Não criar algoritmo criptográfico próprio.
2. Usar uma implementação revisada e as APIs criptográficas adequadas da
   plataforma.
3. Gerar salt e nonce/IV aleatórios por exportação; nunca reutilizá-los entre
   arquivos.
4. Derivar a chave de exportação a partir da credencial escolhida com KDF
   versionada; o arquivo registra os parâmetros necessários à restauração.
5. Nunca salvar em claro a senha ou a chave de exportação dentro do arquivo,
   `localStorage`, logs ou analytics.
6. Não enviar a senha, a chave nem o payload clínico ao serviço de autenticação.
7. Falha de decifragem ou integridade não pode sobrescrever o banco local.

## 5. Senha do backup aprovada

Em cada exportação do arquivo mestre `.nutridiet`, o nutricionista escolhe uma
senha. Essa senha protege aquele arquivo, é exigida para restaurá-lo em outro
dispositivo e não depende da conta ou da autenticação online do NutriDiet.

Ela mantém o backup restaurável mesmo que o serviço de autenticação esteja
indisponível. Em contrapartida, uma senha perdida não pode ser recuperada pelo
NutriDiet sem comprometer a confidencialidade do arquivo.

O escopo da senha fica explicitamente limitado ao backup mestre:

| Artefato | Finalidade | Proteção por senha na V1 |
|---|---|---|
| `.nutridiet` | Backup e restauração do conteúdo canônico local | Obrigatória, escolhida a cada exportação |
| PDF ou mensagem de dieta | Entrega da prescrição ao paciente | Não por padrão |
| Exportação estruturada isolada de dados de dieta | Não faz parte da V1 | Quando existir, deverá ser criptografada |

PDF e mensagens enviados ao paciente não são backups e não entram no fluxo de
importação/restauração. Uma opção futura de PDF protegido pode ser oferecida,
mas não é requisito da V1.

## 6. Fora desta decisão

Não são definidos aqui criptografia do banco PGlite, recuperação de senha do
backup, envio do arquivo para nuvem, backup automático, sincronização de dados
clínicos ou exportação estruturada isolada de dados de dieta.
