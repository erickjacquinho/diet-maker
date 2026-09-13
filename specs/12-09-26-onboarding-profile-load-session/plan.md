# Implementation Plan: Onboarding de Profile e Sessão por Save

**Branch**: `onboarding-profile-load-session` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

## Summary

Trocar o runtime persistido no navegador por PGlite em memória, proteger todas as rotas internas com um gate e criar `/Home` para Criar ou Carregar um `.nutridiet`. O arquivo escolhido pelo profissional será a única persistência durável. Após cada operação explícita de salvar/confirmar, um coordenador exportará o estado confirmado completo e o escreverá no arquivo associado.

O caminho mínimo reutiliza os repositórios e o envelope existentes: acrescenta apenas o contexto de sessão, uma porta/adaptador de arquivo, a tela de onboarding e o callback de sincronização. A restauração será validada antes da troca do runtime para corrigir a regressão em que Jacques Regiani era importado, mas não aparecia em outra porta.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router

**Dependencies**: PGlite 0.5.8, Drizzle ORM, Radix/shadcn existentes e `nanoid`

**Storage**: PGlite `memory://` por aba; arquivo `.nutridiet` escolhido pelo profissional. Nenhum profile, dado de domínio, draft ou handle será salvo em IndexedDB, localStorage, sessionStorage, cookie, servidor ou metadado de host.

**Testing**: Vitest para domínio, envelope, sessão e sincronização; Playwright para guard, onboarding e load entre portas/origens.

**Target**: Web desktop a partir de 1024px; localhost e Vercel HTTPS. File System Access API é necessária para associar e escrever o arquivo; incompatibilidade ou permissão negada produz erro/status visível, sem fallback silencioso.

**Performance**: `/Home` interativa em até 2s após assets; paciente de arquivo válido visível em até 10s; confirmação só fica sincronizada depois da escrita terminar.

**Scope constraints**: uma sessão por aba, sem concorrência entre abas, sem API direta do Google Drive. Uma pasta do Google Drive sincronizada localmente é tratada como pasta do computador. Reload, fechamento ou nova origem começam sem sessão.

## Constitution Check

| Princípio | Resultado |
|---|---|
| Atomic Design e preservação de `src/components/ui` | PASS — onboarding fica em molecule/organism; primitivos permanecem genéricos. |
| Design System canônico | PASS — tokens, estados, foco, tipografia e geometria serão reutilizados. |
| Desktop e WCAG 2.2 AA | PASS — teclado, foco, labels, loading e erros fazem parte do contrato. |
| Test-first e isolamento | PASS — contratos e cenários de falha precedem a implementação. |
| Spec-driven | PASS — execução posterior deve usar `/speckit-implement`. |

## Arquitetura mínima

1. `openLocalDatabase` e `browser-composition` passam a criar somente PGlite `memory://`; o contexto de conta não cria mais `local-account` automaticamente.
2. `src/lib/application/profile-session.ts` concentra estado e comandos de criar/carregar/sincronizar. O objeto de sessão guarda profile, runtime, handle, nome do arquivo e status; handle/status não entram no save.
3. `src/lib/persistence/save-file.ts` define uma única porta (`chooseExisting`, `chooseNew`, `read`, `requestWritePermission`, `write`); `src/lib/infrastructure/file-system-access/browser-save-file.ts` é seu adaptador browser-only.
4. `src/app/SessionAwareAppShell.tsx` é o único gate: `/Home` não usa sidebar; qualquer outra rota só mostra o shell quando houver sessão `active` ou `paused`.
5. `src/components/organisms/profile-onboarding.tsx` e `src/components/molecules/profile-create-dialog.tsx` implementam a UI; a página `/Home` apenas conecta os comandos.
6. Um callback/coordenador em `src/lib/application/composition-root.ts` sincroniza após comandos confirmados de paciente, clínica, dieta e biblioteca. Drafts continuam em memória.
7. Stores de domínio ainda ativos em `src/lib/*Store.ts`/`src/lib/storage.ts` deixam de ser fontes de produção; dados já cobertos pelos repositórios continuam no envelope existente.

## Formato e compatibilidade

O row de account ganha telefone opcional. `schemaVersion` passa de `4` para `5`, `formatVersion` continua `1` enquanto a moldura do envelope não mudar. O validador aceita schema 4 sem telefone, normaliza para `null` e grava schema 5 no próximo save; versões futuras, outro `appId`, tipos inválidos e relações quebradas são rejeitados antes de mutar a sessão.

## Estrutura

```text
src/app/
├── Home/page.tsx
├── SessionAwareAppShell.tsx
├── layout.tsx
├── page.tsx
└── navigation/SidebarNavigationAdapter.tsx
src/components/
├── molecules/profile-create-dialog.tsx
└── organisms/profile-onboarding.tsx
src/lib/
├── application/profile-session.ts
├── application/browser-composition.ts
├── application/composition-root.ts
├── domain/account.ts
├── persistence/save-file.ts
├── infrastructure/file-system-access/browser-save-file.ts
├── infrastructure/local-db/{client,account-context,logical-export-schema,backup-repository}.ts
└── infrastructure/diet-drafts/in-memory-diet-draft-store.ts
tests/
├── architecture/host-persistence-boundary.test.ts
├── lib/application/profile-session.test.ts
├── lib/infrastructure/backup-roundtrip.test.ts
├── app/session-aware-app-shell.test.tsx
└── browser/profile-save-load.spec.ts
```

**Decision**: não criar backend, middleware de autenticação, rota API, banco remoto, integração Drive, múltiplos providers ou novas camadas de domínio. A aplicação existente continua responsável pelas páginas clínicas; somente o ciclo de vida do runtime e do save muda.

## Documentos relacionados

- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/onboarding-session.md](./contracts/onboarding-session.md)
- [quickstart.md](./quickstart.md)

## Complexity Tracking

Nenhuma exceção constitucional. A porta de arquivo, o gate e o coordenador são os três pontos novos indispensáveis; abstrações adicionais devem ser rejeitadas durante a implementação.
