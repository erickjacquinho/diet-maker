# Decisão 13 — Proteção Local e Backup Simples

- **Status:** Corrigido por orientação explícita do usuário; implementação pendente
- **Data:** 2026-08-30
- **Escopo:** Limites de proteção da V1, sem criptografia e sem senha de backup

## 1. Decisão

A V1 não implementa criptografia própria do banco nem do arquivo
`.nutridiet`. Também não exige senha para exportar ou restaurar o backup.

Esta decisão revoga o requisito anterior de backup criptografado, incluindo
derivação de chave, senha por arquivo, envelope autenticado e testes
criptográficos. Esses mecanismos não devem reaparecer como pré-requisitos dos
SDDs de persistência.

O backup é o JSON simples definido na
[Decisão 11](11-recuperacao-e-portabilidade-local.md).

## 2. Proteção e limites reais

A V1 não tem login na aplicação. O acesso ao computador, perfil do navegador
e arquivos exportados fica sob controle do usuário. Controles do sistema
operacional podem proteger o ambiente, mas configurá-los não é uma nova
funcionalidade nem uma exigência de implementação do NutriDiet.

Quem obtiver o arquivo `.nutridiet` poderá ler seu conteúdo. A extensão do
arquivo e a validação de schema não oferecem sigilo nem comprovam autoria.
O fluxo de backup deve informar isso em texto simples, sem modais recorrentes.

A aplicação não envia automaticamente o banco ou o backup para a nuvem e não
deve incluir dados clínicos em logs de diagnóstico.

## 3. Validação indispensável

Antes de restaurar, validar a estrutura e as relações do arquivo e pedir
confirmação para substituir a base. Erros não podem deixar uma importação
parcial. Esses controles protegem a integridade dos dados; não constituem
criptografia ou autenticação do arquivo.

## 4. Fora da V1

- senha do arquivo, recuperação de senha e gerenciamento de chaves;
- criptografia do banco, do backup ou dos PDFs;
- assinatura digital e verificação criptográfica de autoria do backup;
- login online, biometria ou bloqueio por tempo;
- backup automático e armazenamento remoto.

A autenticação descrita na Decisão 12 continua futura. Uma eventual senha de
login não deve ser confundida com senha do backup, que não faz parte da
proposta atual.

**Justificativa:** preservar a solução manual e simples solicitada, mantendo
apenas validações necessárias para não importar dados inválidos nem apagar a
base por engano.
