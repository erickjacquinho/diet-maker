# NutriDiet Drive DB — Índice Canônico

**Status:** Proposta para revisão  
**Versão:** 1.0  
**Data:** 2026-08-04

Este índice é a porta de entrada e a fonte canônica de navegação. Os documentos numerados dividem o PRD por responsabilidade. Uma regra deve existir em um único documento temático; os demais apenas apontam para ela.

## Decisões fixadas

- Vercel hospeda o Next.js; não existe banco de dados próprio.
- Não existe conta, senha ou tabela interna de usuários.
- A entrada é `Conectar Google Drive`.
- IndexedDB é a persistência local transacional.
- Google Drive é a fonte remota oficial do workspace.
- Dados clínicos trafegam diretamente entre navegador e Drive.
- O escopo OAuth inicial é `drive.file`.
- Toda gravação confirma localmente antes da rede.
- A sincronização usa outbox idempotente.
- Conflitos clínicos nunca usam sobrescrita silenciosa.
- Todo tipo persistente é um módulo com schema e migrations próprios.
- Exportação física integral e `.diet` por paciente são obrigatórias.

## Catálogo e ordem de leitura

| Ordem | Documento | Responsabilidade |
|---:|---|---|
| 1 | [01-visao-e-criterios.md](./01-visao-e-criterios.md) | Problema, solução, decisões e métricas |
| 2 | [02-experiencia-e-requisitos.md](./02-experiencia-e-requisitos.md) | Fluxos, histórias, critérios e estados da UI |
| 3 | [03-modelo-do-perfil-e-dados.md](./03-modelo-do-perfil-e-dados.md) | Módulos, agregados, envelopes e integridade |
| 4 | [04-arquitetura-limpa-e-contratos.md](./04-arquitetura-limpa-e-contratos.md) | Camadas, portas, registry e source layout |
| 5 | [05-persistencia-local-e-save.md](./05-persistencia-local-e-save.md) | IndexedDB, transações, save, outbox e offline |
| 6 | [06-google-drive-e-autorizacao.md](./06-google-drive-e-autorizacao.md) | OAuth, workspace, árvore remota e deploy |
| 7 | [07-sincronizacao-e-conflitos.md](./07-sincronizacao-e-conflitos.md) | Push, pull, retry, multiaba e conflitos |
| 8 | [08-migracao-importacao-e-backup.md](./08-migracao-importacao-e-backup.md) | Legado, `.diet`, backup e restauração |
| 9 | [09-seguranca-privacidade-e-observabilidade.md](./09-seguranca-privacidade-e-observabilidade.md) | LGPD, tokens, logs e compartilhamento |
| 10 | [10-testes-desempenho-e-homologacao.md](./10-testes-desempenho-e-homologacao.md) | Testes, perda de dados, escala e gates |
| 11 | [11-roadmap-riscos-e-governanca.md](./11-roadmap-riscos-e-governanca.md) | Fases, riscos, documentação e decisões abertas |

## Rotas de leitura

### Produto

1. Visão e critérios.
2. Experiência e requisitos.
3. Modelo do perfil.
4. Roadmap e riscos.

### Arquitetura

Leia 01, 03, 04, 05, 06, 07, 08, 09, 10 e 11, nessa ordem.

### Implementação

| Etapa | Objetivo | Documentos | Gate |
|---:|---|---|---|
| 0 | Aprovar decisões e schemas v1 | 01, 03, 04, 11 | ADR e plano aprovados |
| 1 | Criar fundação local | 03, 04, 05, 10 | Save e outbox passam nos testes de crash |
| 2 | Migrar legado e habilitar backup | 08, 10 | Contagens reconciliadas e restauração validada |
| 3 | Integrar OAuth e Drive | 06, 07, 09, 10 | Dois dispositivos convergem sem concorrência |
| 4 | Proteger concorrência | 07, 10 | Nenhuma sobrescrita silenciosa |
| 5 | Endurecer e lançar | 09, 10, 11 | Todos os launch gates aprovados |

## Dependências

```text
Visão e requisitos
        ↓
Modelo do perfil e schemas
        ↓
Arquitetura limpa e contratos
        ↓
Persistência local ──→ Migração e backup
        ↓
Google Drive e OAuth
        ↓
Sincronização e conflitos
        ↓
Segurança + testes + homologação
        ↓
Lançamento
```

Drive não pode ser iniciado antes de save local e outbox estarem homologados. Chaves legadas não podem ser removidas antes de migração, backup e rollback validados.

## Propriedade normativa

- Requisitos e estados da UI: 02.
- Entidades, módulos e integridade: 03.
- Dependências e interfaces: 04.
- Gravação local: 05.
- Google Cloud e arquivos remotos: 06.
- Protocolo distribuído: 07.
- Compatibilidade e restauração: 08.
- Segurança e logging: 09.
- Critérios quantitativos: 10.
- Fases e governança: 11.

## Regras de alteração

- Atualizar a fonte proprietária do assunto, sem duplicar tabelas.
- Atualizar este índice quando mudar ordem, escopo ou gate.
- Novo módulo persistente atualiza 03, 08 e 10.
- Novo escopo OAuth atualiza 06, 09 e 11 e exige revisão.
- Mudança incompatível incrementa versão e gera ADR quando alterar decisão aceita.

## Terminologia

| Termo | Significado |
|---|---|
| Workspace | Conjunto completo do perfil profissional |
| Módulo | Contrato de schema, serialização, migration e conflito |
| Documento | Envelope versionado de uma entidade/agregado |
| Save local | Commit do documento e outbox no IndexedDB |
| Outbox | Fila durável de alterações destinadas ao Drive |
| Revisão-base | Revisão remota usada para produzir a edição |
| Conflito | Edições concorrentes no mesmo documento |
| Quarentena | Área de conteúdo inválido não aplicado |

## Compatibilidade

[PRD.md](./PRD.md) é apenas uma ponte para ferramentas que procurem o nome antigo. Ele não deve conter uma cópia do conteúdo.
