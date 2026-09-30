# Tasks: Página inteligente da dieta simples

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md.
**Status**: 12 tarefas propostas, nenhuma executada. Apenas `/speckit-implement` após validação humana.
**Regra**: T001 define contratos/falhas antes de qualquer implementação; dados isolados sob tests/. Skills após o ID. Agrupamento não remove trabalho de segurança, compatibilidade ou validação.

## Phase 1 — Contratos e fundação

- [ ] T001 [skill: $tdd] Definir testes prévios em `tests/application/account-publication-key.test.ts`, `tests/infrastructure/account-publication-key-save.test.ts`, `tests/application/diet-publication.test.ts`, `tests/routes/diet-publication-routes.test.ts`, `tests/components/diet-published-ui.test.tsx`, `tests/routes/diet-published-page.test.tsx` e cenários de `tests/browser/diet-publication.spec.ts`; cobrir todos os contratos de quickstart, incluindo save legado/roundtrip, chave cruzada, snapshot, replay/CAS, modal/foco, storage e revisão. Verificação: negativos nominais falham antes dos validadores; sem dados reais/serviços produtivos. [FR-001/002/003/004/005/006/007/008/009/010/012/014/015/016/017/018/019/020/021, NFR-002/003/005, SC-001/002/003/004/005/006/007/008]
- [ ] T002 [skill: $database-migrations-pro] Integrar `publicationKey` uma vez ao domínio/Conta/schema, migração local, save schema 8 compatível com 4–7 e `profile-session.ts`: `src/lib/domain/account.ts`, `src/lib/infrastructure/local-db/{schema,migrations,account-context,logical-export-schema,backup-repository}.ts`, `src/lib/application/backup-application.ts`; geração Web Crypto e sincronização antes da rede. Verificação: T001 cobre save/load byte a byte, import antigo sem gerar chave no import puro, cancelamento/falha bloqueia publicação sem regenerar segredo ou perder dados. [FR-003/019/020/021, NFR-005/006, SC-007]

## Phase 2 — US1: publicação e modal (P1)

**Goal/Independent Test**: Publicar fixture real do draft somente após confirmação; cancelamento, auth, replay/concorrência e link estável verificáveis pelos contratos antes da página completa.

- [ ] T003 [skill: $backend-patterns] [US1] Criar DTO público, validação e projeção em `src/lib/application/diets/diet-published-view.ts`, reutilizando `buildDietPdfViewModel` e whitelist de campos; adicionar autoria real e resolver targetDietId/baseDietId estável no fluxo existente. Verificação: T001 cobre zero/ausência, nomes/quantidades/unidades/energia/ordem/totais do snapshot; nenhuma chave ou dado adicional na API; PDF inalterado. [FR-004/005/006/010/021, NFR-004/006, SC-002/005]
- [ ] T004 [skill: $database-migrations-pro] [US1] Preparar env/driver e persistência transacional em `.env.example`, `package.json`, `package-lock.json`, `src/lib/infrastructure/published-diets/server.ts` e `migrations/001-publications.sql`; manter Publication/Operation/limite, hash de chave, SQL parametrizado, CAS e replay. Verificação: T001 com banco de teste comprova unicidade/concorrência, fingerprint conflitante, chave de outra conta, limite 30/min e env ausente; sem credencial do banco no bundle. [FR-012/013/015/016/017/018/019/021, NFR-004/006, SC-007/008]
- [ ] T005 [skill: $nextjs-fullstack-master] [US1] Implementar handlers em `src/app/api/diet-publications/route.ts` e `status/route.ts` usando o contrato puro T003 e serviço T004, preservando `contracts/publication.md`. Verificação: 400/401/404/409/413/429/503, recuperação autenticada pós-commit, owner namespace correto, leitura sem escrita e nenhum segredo em respostas/logs; CORS não autentica. [FR-012/013/015/016/017/019/021, NFR-006, SC-007/008]
- [ ] T006 [skill: $nextjs-fullstack-master] [US1] Integrar preparo, fetch nativo e status/retry no hook existente `src/hooks/useDietBuilderPage.ts`, reusando flushDraft e perfil/save; não criar client wrapper ou use case repassador. Verificação: T001 cobre flush não SAVED, chave/checkpoint, operationId preservado em retry incerto, revisão esperada, recuperação após reload/import, nova confirmação com ID novo e sem mudar vigência. [FR-003/004/012/015/017/018/020/021, NFR-006, SC-001/007/008]
- [ ] T007 [skill: $shadcn] [US1] Compor `src/components/organisms/diets/PublishDietModal.tsx` com Dialog/Button existentes, identidade, aviso de acesso pelo link, Cancelar/confirmar, busy/erro e Copiar/Abrir após sucesso; sem configs futuras. Verificação: T001 cobre foco/retorno/Escape, cancelamento sem rede, duplicação bloqueada, retry e clipboard indisponível. [FR-002/003/012/015/016, NFR-002, SC-001]
- [ ] T008 [skill: $nextjs-fullstack-master] [US1] Ligar menu/callback/modal ao hook em `src/components/templates/DietBuilderTemplate.tsx`, `dietBuilderTemplateTypes.ts` e `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`. Verificação: ação de página simples substitui placeholder Link, outros modos indisponíveis com razão explícita, abrir menu/modal não publica, PDF/WhatsApp preservados. [FR-001/002/003/004/012/015, SC-001/006]

## Phase 3 — US2: página do paciente (P1)

**Goal/Independent Test**: Fixture publicada em browser limpo, sem perfil/save clínico, com tabelas/alternativas e resumo aprovados.

- [ ] T009 [skill: $proj-table-adequation-v2] [US2] Compor `src/components/templates/DietPublishedTemplate.tsx`, `src/app/dieta-publicada/[token]/page.tsx` e `DietPublishedPageClient.tsx`; bypass pré-hooks em `src/app/SessionAwareAppShell.tsx`. Reusar DataTable/MacroSummary/Tabs/textStyle; rota server lê snapshot e client local controla seleção, template sem I/O. Verificação: T001, resolve/verify:table, data dd/MM/aaaa, resumo 2 colunas, opção única sem abas, loading/erro/empty, noindex/no-store/no-referrer e ausência de PGlite/onboarding/sidebar; shell interno preservado. [FR-005/006/007/010/011/013/014/016, NFR-001/002/003/004, SC-002/003/005]

## Phase 4 — US3: checks persistentes (P2)

**Goal/Independent Test**: Check pela linha e teclado, persistência após recarga, isolamento por opção e reset por nova publicação.

- [ ] T010 [skill: $frontend-architecture-mindset] [US3] Integrar `src/lib/persistence/diet-checks.ts` à composição client local `src/app/dieta-publicada/[token]/DietPublishedPageClient.tsx` e props de seleção controlada do template; usar multi/selectOnRowClick nativos. Verificação: T001 cobre uma alternância por checkbox/nome/quantidade/Enter/Espaço, alternar abas/reload, nova revisão zerada, JSON inválido/quota com aviso de sessão e nenhuma mudança de total/prescrição. [FR-008/009/018, NFR-002, SC-004/008]

## Phase 5 — Conformidade e validação completa

- [ ] T011 [skill: $shadcn] Registrar composições/consumidores no `design-system/components/registry.json`, perfis `profiles/organisms/publish-diet-modal.md`, `profiles/templates/diet-published-template.md` e `category-decisions.md`; conferir categorias antes dos perfis e apenas divergências necessárias de Tabs/Dialog. Verificação: type-check, testes focados, audit:atomic-design, audit:z-index, verify:design-system, verify:table; separar baseline sem supressão ou migração global, nenhuma réplica de primitivo. [FR-011, NFR-001/002/003, SC-006]
- [ ] T012 [skill: $webapp-testing] Executar `tests/browser/diet-publication.spec.ts` localmente e em Vercel Preview isolado, com cenários completos de quickstart; capturas em `specs/30-09-26-exportar-pagina-inteligente-dieta/validation/`, resultados em `validation-report.md`, atualizar `quickstart.md` e tarefas. Verificação: modal/publicação/auth/retry/concorrência/revisão, leitura limpa, checks/foco, save roundtrip, PDF/WhatsApp e 1024/1440; distinguir local/Preview e registrar ambiente ausente como pendência, não PASS. [FR-001/003/013/014/015/017/018/019/020/021, NFR-002/003/005/006, SC-001/002/003/004/005/006/007/008]

## Dependencies and delivery

T001 precede implementação. T002 e T003 podem avançar independentemente após contratos; T004 depende DTO T003; T005 depende T004. T006 depende T002/T003/T005; T007 pode avançar pelos contratos em paralelo ao backend, T008 depende T006/T007. T009 depende T003/T004, T010 depende T009. T011 após composições; T012 após integração/auditorias e ambiente de teste. Não editar template/client simultaneamente em tarefas distintas. Exemplos de paralelismo não autorizam delegação automática.

MVP completo exige todas as histórias: não lançar só endpoint/modal ou página placeholder. Nenhum requisito foi adiado ao agrupar tarefas. Configurações futuras, login online, gestão de links e sync clínica permanecem fora do pedido original. Nenhuma publicação em produção no fluxo documental.
