# Decisão 12 — Autenticação Online Futura e Soberania dos Dados Locais

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-30
- **Escopo:** Acesso futuro ao perfil profissional sem sincronizar prontuários

## 1. Decisão aprovada

A autenticação será adicionada posteriormente como um serviço online de
identidade, ativação e validação do perfil profissional. Ela não transforma o
NutriDiet em um produto de prontuário em nuvem.

O serviço online valida que a chave/perfil profissional corresponde ao usuário
autenticado por ID e senha. Cada Conta terá inicialmente um único profissional
proprietário, com perfil único e intransferível. Não haverá membros, equipes ou
comunicação entre profissionais nesta fase.

A validação online serve para autorizar a abertura da Conta local pelo perfil
correto. Ela não valida cada salvamento clínico, pois os salvamentos ocorrem
somente no banco local enquanto o acesso estiver desbloqueado.

## 2. Soberania dos dados clínicos

O serviço de autenticação pode receber somente os dados mínimos para validar a
identidade e o direito de acesso, como identificador do perfil, credenciais,
estado de ativação e metadados técnicos indispensáveis.

Ele não pode receber, ler, armazenar, indexar ou sincronizar:

- pacientes e contatos;
- avaliações, consultas ou anotações;
- dietas, refeições, alimentos, receitas ou macros;
- snapshots, arquivo `.nutridiet` ou conteúdo do banco local.

Os dados clínicos permanecem no banco relacional local e só são abertos após a
validação de acesso ao perfil profissional. Autenticação é um controle de
acesso; não é replicação, backup nem transporte de prontuário.

## 3. Limites da futura Conta online

```text
Serviço online de identidade
└── perfil profissional + chave/ativação + estado de acesso

Banco local do profissional
└── toda a Conta clínica e seus Pacientes
```

O `accountId` local deve ser vinculado de forma estável ao identificador do
perfil profissional validado online. Uma sessão autenticada não autoriza abrir
uma Conta local vinculada a outro perfil.

## 4. Política de disponibilidade aprovada

Após uma autenticação online bem-sucedida, o serviço entrega uma autorização
de acesso local vinculada ao perfil profissional e à Conta correspondente, com
validade de **oito horas**.

Durante essas oito horas, desde que a PWA já esteja carregada/cacheada no
dispositivo:

- a aplicação pode abrir os dados locais sem internet;
- leituras e salvamentos clínicos ocorrem somente no banco local;
- nenhuma validação remota é exigida para cada salvamento;
- nenhum dado clínico é enviado para o serviço de autenticação.

Após a expiração da autorização, a aplicação bloqueia o acesso à Conta local e
solicita conexão para nova autenticação. Ela não apaga, altera nem sincroniza
os dados clínicos durante o bloqueio.

Se o aplicativo nunca tiver sido carregado online antes, ele não estará
disponível sem internet: a PWA precisa primeiro obter e armazenar os recursos
da interface a partir da hospedagem.

## 5. Fora desta decisão

Não são definidos aqui provedor de autenticação, recuperação de senha,
licenciamento comercial, vinculação a dispositivo, RLS, Supabase, API, telas de
login ou sincronização online. Esses detalhes só serão tratados quando a fase
de autenticação começar.
