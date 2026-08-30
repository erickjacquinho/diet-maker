# Decisão 11 — Recuperação e Portabilidade Local

- **Status:** Escopo corrigido conforme orientação do usuário; implementação pendente
- **Data:** 2026-08-30
- **Escopo:** Backup manual simples dos dados canônicos locais

## 1. Decisão

A V1 oferece **Exportar backup** e **Restaurar backup** por um arquivo mestre
`.nutridiet`: JSON UTF-8, sem criptografia e sem senha.

Não há backup automático, envio para nuvem, sincronização entre dispositivos
ou lembretes recorrentes. O usuário escolhe quando exportar e onde guardar o
arquivo. PDF e mensagens de dieta continuam independentes desse fluxo.

Esta orientação substitui a exigência anterior de backup criptografado. Os
limites de privacidade estão na
[Decisão 13](13-protecao-local-e-backup-simples.md).

## 2. Conteúdo do arquivo

O arquivo contém somente os dados confirmados da Conta:

- identificação e configurações do perfil profissional;
- alimentos customizados, receitas e refeições prontas;
- pacientes, consultas, avaliações e objetivos já contemplados no produto;
- dietas vigentes, snapshots históricos e registros arquivados;
- IDs, relações, versões e datas necessários para restaurar esses dados.

O cabeçalho lógico contém identificador da aplicação, `formatVersion`,
`schemaVersion` e data da exportação. Os dados ficam em uma estrutura
normalizada definida no SDD do backup. Não é um dump físico do motor nem um
arquivo SQL executável.

`DietDraft` e outros estados temporários do editor não integram o arquivo.
Exportar não transforma rascunho em prescrição salva.

## 3. Exportar

1. O usuário aciona **Exportar backup**.
2. A aplicação captura uma visão consistente das tabelas confirmadas, sem
   misturar partes de salvamentos diferentes.
3. Serializa o conteúdo em JSON e oferece o download `.nutridiet`.

Durante a captura, não intercalar mutações com a leitura das tabelas. A
exclusividade não precisa durar até o usuário escolher a pasta de download.
Falha na geração não altera a base nem deve ser apresentada como backup
concluído. Não há pedido de senha.

## 4. Restaurar

1. O usuário seleciona o arquivo.
2. Antes de modificar a base, a aplicação valida JSON, identificador, versões
   suportadas, tipos, IDs, relações, uma única Conta e unicidade da dieta
   vigente. Não executa SQL ou código contido no arquivo.
3. Informa que a restauração **substitui toda a base atual, sem mesclar**, e
   solicita confirmação explícita.
4. A restauração só começa sem rascunhos ou edições pendentes: o usuário deve
   salvá-los ou descartá-los explicitamente antes. A aplicação não os apaga
   silenciosamente nem tenta reaplicá-los à base importada.
5. Na única aba ativa, suspende novas edições, conclui gravações pendentes e
   substitui os dados canônicos em **uma transação**.
6. Após o commit, recarrega o contexto e as consultas antes de liberar a edição.

Arquivo inválido, versão não suportada, cancelamento ou erro com rollback
mantêm a base canônica anterior. Se houver interrupção, a recuperação nativa
do banco deve deixar o estado anterior ou o importado completo, nunca uma
mistura. A inicialização relê a base; não reutiliza formulários anteriores.

Não implementar troca entre gerações de bases, preservação de drafts
incompatíveis, mesclagem, conversores universais ou coordenação entre abas.
Compatibilidade de futuras versões segue a Decisão 10.

## 5. Limites

- Qualquer pessoa com acesso ao arquivo pode ler os dados; não há proteção
  por senha ou criptografia.
- O backup permite recuperar somente o que foi exportado. Alterações
  posteriores e drafts não estão protegidos por esse arquivo.
- Limpeza do navegador ou perda do dispositivo pode apagar a base local.
- Entregar o download não comprova que o usuário guardou uma cópia recuperável.
- A interface explica esses limites no fluxo de backup, sem alertas recorrentes.

**Justificativa:** JSON versionado, validação antes da importação e substituição
transacional atendem à portabilidade manual pedida. Senhas, cifragem e
gerenciamento de várias bases acrescentariam fluxos e manutenção sem atender
a uma necessidade solicitada.
