# Decisão 11 — Save Principal, Recuperação e Portabilidade

- **Status:** Implementada e validada no SDD de backup manual simples
- **Data:** 2026-08-30
- **Escopo:** Backup manual simples dos dados canônicos locais

## 1. Decisão

O save principal continua sendo um arquivo mestre `.nutridiet` do último
checkpoint concluído. O envelope lógico clínico schema 11 permanece compatível;
quando associado a uma conta online, o arquivo usa um envelope externo v2
cifrado com AES-256-GCM. Arquivos legados/desvinculados no envelope v1 continuam
JSON sem cifragem e podem ser lidos por quem os obtiver. O banco local é a área
de trabalho e pode conter alterações confirmadas posteriores ao checkpoint.
Consulte o [ADR-009](../../docs/adr/ADR-009-nutridiet-principal.md).

Não há backup automático, envio para nuvem, sincronização entre dispositivos
ou lembretes recorrentes para exportar o arquivo. Lembretes pontuais da agenda
fazem parte dos dados da Conta e são preservados no save principal. O usuário
escolhe quando exportar e onde guardar o arquivo. PDF e mensagens de dieta
continuam independentes desse fluxo.

Esta orientação substitui a exigência anterior de backup criptografado. Os
limites de privacidade estão na
[Decisão 13](13-protecao-local-e-backup-simples.md).

O contrato executável e as evidências da implementação estão no
[SDD de backup manual simples](../../specs/12-09-26-backup-manual-simples/validation-report.md).

## 2. Conteúdo do arquivo

O arquivo contém somente os dados confirmados da Conta:

- identificação e configurações do perfil profissional;
- alimentos customizados, receitas, refeições prontas e dietas prontas;
- preferências da biblioteca, incluindo os favoritos por ID;
- lembretes pontuais da agenda por ID, data, hora e tarefa;
- pacientes, consultas, avaliações e objetivos já contemplados no produto;
- dietas vigentes, snapshots históricos e registros arquivados;
- IDs, relações, versões e datas necessários para restaurar esses dados.

O payload lógico contém identificador da aplicação, `formatVersion`,
`schemaVersion` e data da exportação, em estrutura normalizada definida no SDD
de backup. No arquivo protegido, o cabeçalho externo contém somente versão,
saveId, algoritmo, prova opaca e ciphertext; o payload schema 11 fica dentro da
cifra. Não é dump físico do motor nem arquivo SQL executável.

Mudanças de dados de uma feature incrementam `schemaVersion`; o
`formatVersion` só muda quando o envelope/protocolo muda.

`DietDraft` e outros estados temporários do editor não integram o arquivo.
Exportar não transforma rascunho em prescrição salva.

### 2.1. Retrocompatibilidade do save

Ao atualizar o esquema do save, manter retrocompatibilidade com a versão
anterior sempre que possível: a aplicação atual deve conseguir abrir e
restaurar saves da versão imediatamente anterior.

- Adicionar a migração explícita e determinística da versão anterior para a
  atual, preservando os dados existentes e sem reescrever o arquivo original.
- Preencher campos novos com valores padrão somente quando forem seguros e
  coerentes com o domínio; não inventar dados clínicos nem descartar dados
  silenciosamente para tornar o arquivo compatível.
- Validar a migração e a restauração com uma fixture de save da versão anterior.
- Quando a compatibilidade não for possível sem perda ou interpretação
  insegura dos dados, documentar o motivo e rejeitar o arquivo com uma mensagem
  clara, preservando o arquivo e a base atual.

## 3. Exportar

1. O usuário aciona **Exportar backup** com uma autorização válida para o save.
2. A aplicação captura uma visão consistente das tabelas confirmadas e das
   preferências persistidas da Conta clínica, sem misturar revisões.
3. Valida/migra o payload lógico em memória, cifra-o com AES-256-GCM e oferece
   o download `.nutridiet` protegido. O menu não exporta plaintext do save
   vinculado.

Durante a captura, não intercalar mutações com a leitura das tabelas. A
exclusividade não precisa durar até o usuário escolher a pasta de download.
Falha na geração não altera a base nem deve ser apresentada como backup
concluído. Não há pedido de senha.

## 4. Restaurar

1. O usuário seleciona o arquivo e a conta online reautoriza o save.
2. Antes de modificar a base, a aplicação autentica o envelope externo, então
   valida JSON, identificador, versões
   suportadas, tipos, IDs, relações, uma única Conta e unicidade da dieta
   vigente. Versões de schema anteriores que possuam uma migração registrada
   são convertidas em memória, em sequência, para o schema atual; a migração é
   pura e não reescreve o arquivo selecionado. Não executa SQL ou código
   contido no arquivo.
3. Informa que a restauração **substitui toda a base atual, sem mesclar**, e
   solicita confirmação explícita.
4. A restauração só começa sem rascunhos ou edições pendentes: o usuário deve
   salvá-los ou descartá-los explicitamente antes. A aplicação não os apaga
   silenciosamente nem tenta reaplicá-los à base importada.
5. Na única aba ativa, suspende novas edições, conclui gravações pendentes,
   prepara os lembretes locais e substitui os dados canônicos em **uma
   transação**. Se a transação falhar, restaura os lembretes locais anteriores.
6. Após o commit, recarrega o contexto e as consultas antes de liberar a edição.

Arquivo inválido, versão não suportada, cancelamento ou erro com rollback
mantêm a base canônica anterior. Se houver interrupção, a recuperação nativa
do banco deve deixar o estado anterior ou o importado completo, nunca uma
mistura. A inicialização relê a base; não reutiliza formulários anteriores.

Não implementar troca entre gerações de bases, preservação de drafts
incompatíveis, mesclagem, conversores universais ou coordenação entre abas.
Cada mudança de schema deve adicionar uma migração explícita e determinística;
versões futuras sem uma etapa conhecida continuam sendo rejeitadas. O próximo
save/export do perfil já carregado grava o envelope no schema atual.

## 5. Limites

- O envelope protegido v2 impede leitura do payload sem chave e autorização
  válidas; não exige uma senha separada. Saves legados v1 permanecem plaintext
  e não ganham proteção retroativa.
- A cifra do arquivo não cifra o IndexedDB/PGlite nem os drafts do editor e não
  protege dados enquanto o runtime está autorizado e aberto.
- O backup permite recuperar somente o que foi exportado. Alterações
  posteriores e drafts não estão protegidos por esse arquivo.
- Limpeza do navegador ou perda do dispositivo pode apagar a base local.
- Entregar o download não comprova que o usuário guardou uma cópia recuperável.
- A interface explica esses limites no fluxo de backup, sem alertas recorrentes.

**Justificativa:** JSON versionado, validação antes da importação e substituição
transacional atendem à portabilidade manual pedida. Senhas, cifragem e
gerenciamento de várias bases acrescentariam fluxos e manutenção sem atender
a uma necessidade solicitada.
