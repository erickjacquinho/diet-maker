# 02 — Experiência, Fluxos e Requisitos Funcionais

## Personas

### Nutricionista proprietário

Usa um ou mais computadores, atende em desktop, precisa de save imediato e quer os dados na própria conta Google.

### Nutricionista em migração

Já possui dados no navegador e precisa migrá-los sem perder histórico ou bibliotecas.

## Fluxo principal

1. Acessar o app na Vercel.
2. Carregar workspace conhecido do IndexedDB.
3. Apresentar `Conectar Google Drive` se necessário.
4. Autorizar `drive.file`.
5. Localizar ou criar workspace.
6. Hidratar dispositivo novo pelo Drive.
7. Buscar mudanças incrementais em dispositivo conhecido.
8. Confirmar toda edição localmente e criar outbox.
9. Mostrar estado global real.
10. Permitir backup físico.

## US-01 — Conectar Drive

**Como** nutricionista, **quero** conectar o Google **para** acessar meu workspace sem cadastro NutriDiet.

- Usar `Conectar Google Drive`, não `Criar conta`.
- Google Identity Services no navegador.
- Escopo `drive.file`.
- Nenhum client secret no bundle.
- Access token somente em memória.
- Token expirado pausa sync, preserva outbox e exige gesto do usuário.
- Revogar Drive não apaga dados locais.

## US-02 — Localizar workspace

**Como** nutricionista, **quero** encontrar meu perfil **para** continuar em outro computador.

- Criar pasta `NutriDiet` no primeiro uso.
- Associar `appProperties` privadas.
- Usar workspace UUID independente de e-mail/nome.
- Provisionamento idempotente.
- Workspaces múltiplos exigem escolha.
- Conta errada não cria nem mescla silenciosamente.

## US-03 — Save local

**Como** nutricionista, **quero** confirmação imediata **para** não depender da internet.

- UI chama casos de uso, não storage.
- Módulo valida o documento.
- Documento e outbox compartilham transação.
- Confirmar somente após commit.
- Falha remota não desfaz local.
- Compactar alterações rápidas sem perder estado final.

## US-04 — Push remoto

**Como** nutricionista, **quero** envio automático **para** continuar em outro computador.

- Sync lê outbox, não React.
- Operação possui `operationId`.
- Retry não duplica arquivo.
- Outbox conclui após confirmação remota válida.
- Transitórios usam backoff/jitter.
- `401` solicita reconexão.
- Permanente entra em atenção sem loop infinito.

## US-05 — Pull remoto

**Como** nutricionista, **quero** receber saves remotos **para** manter o workspace atualizado.

- Primeiro uso descobre todos os documentos.
- Próximos usos usam cursor/Changes.
- Validar envelope, checksum, schema e migration.
- Inválido vai para quarentena.
- Aplicar lote localmente de forma transacional.

## US-06 — Conflitos

**Como** nutricionista, **quero** aviso de concorrência **para** não perder dados clínicos.

- Registrar revisão-base.
- Divergência com pendência local gera `conflict`.
- Paciente, dieta, avaliação e receita não usam last-write-wins.
- Preservar local e remoto.
- Permitir manter, duplicar ou revisar conforme módulo.
- Resolver gera nova operação idempotente.

## US-07 — Backup e restauração

**Como** nutricionista, **quero** cópia física **para** não depender do navegador/Google.

- Exportar workspace com manifest, schemas e checksums.
- Exportar paciente em `.diet`.
- Validar pacote inteiro antes de restaurar.
- Oferecer novo workspace ou mesclagem.
- Substituição exige confirmação e backup.
- Inválidos geram relatório sem estado parcial oculto.

## US-08 — Migração

**Como** usuário atual, **quero** migrar `localStorage` **para** preservar o histórico.

- Reconhecer todas as chaves do documento 08.
- Migração idempotente/versionada.
- Snapshot antes da conversão.
- JSON inválido em quarentena.
- Não apagar legado antes de backup ou sync confirmado.
- Processo interrompido retoma ou reverte.

## US-09 — Novo módulo

**Como** desenvolvedor, **quero** registrar tipos **para** evoluir sem alterar o sync engine.

- Descriptor, schema, serializer, migrations, path e conflict policy.
- Sync não importa domínio específico.
- Falha isolada por módulo.
- Registry rejeita duplicações/versões inválidas.
- Módulo passa pela suíte comum.

## Estados globais

| Estado | Significado | Ação |
|---|---|---|
| `local-saving` | Transação em curso | Nenhuma |
| `local-saved` | Seguro local; remoto pendente | Ver pendências |
| `syncing` | Enviando/recebendo | Ver progresso |
| `synced` | Nenhuma pendência | Última sincronização |
| `offline` | Sem rede; local protegido | Exportar |
| `reauthorization-required` | Token inválido | Conectar Drive |
| `conflict` | Concorrência | Resolver |
| `error` | Requer atenção | Detalhes seguros |

`Sincronizado` exige outbox vazia, ausência de conflito e nenhum lote pendente. Edição permanece disponível quando o IndexedDB está saudável.

## Transparência

- Diferenciar save local e sync.
- Informar que Drive armazena dados clínicos.
- Exibir conta/workspace sem usá-los como identidade de domínio.
- Avisar pasta compartilhada.
- Explicar limite de sync com navegador fechado.
- Nunca exibir token/payload em erro.

## Não objetivos

- Login NutriDiet.
- Escolher qualquer pasta do Drive no MVP.
- Colaboração em tempo real.
- Conflito clínico resolvido invisivelmente.
- Portal de paciente.
- Gestão de permissões de terceiros.

## Dependências

- [03-modelo-do-perfil-e-dados.md](./03-modelo-do-perfil-e-dados.md)
- [05-persistencia-local-e-save.md](./05-persistencia-local-e-save.md)
- [07-sincronizacao-e-conflitos.md](./07-sincronizacao-e-conflitos.md)
