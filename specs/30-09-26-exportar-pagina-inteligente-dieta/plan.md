# Implementation Plan: Página inteligente da dieta simples

**Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)
**Status**: SDD minimizado; proposto para validação humana, nenhuma implementação/publicação executada.

## Summary and invariants

Menu do editor → **modal intermediário obrigatório** → publicação Vercel → link do paciente. UI aprovada usando DataTable, Tabs, MacroSummary, Dialog e Button existentes. Preservar todos os 21 FR, 6 NFR e 8 SC da spec, sem alterar endpoints ou comportamentos. Link estável por conta/dieta, atualização só confirmada no modal; checks persistentes no navegador, reset por nova revisão. Publicação pela chave única da conta sincronizada no save, sem login. Compatibilidade de saves, segurança, erros, acessibilidade e regressões PDF/WhatsApp permanecem obrigatórios.

## Technical context

Stack existente: TypeScript 5.7, React 19, Next App Router 15, Radix/Shadcn, PGlite/Drizzle locais, Vitest/Playwright. Web desktop >=1024 px. Neon/Postgres apenas para snapshots publicados, operações e limite de escrita; driver oficial é a única dependência runtime nova prevista. Credenciais do banco só no servidor. Sem login online, upload do save completo, polling, sync de checks ou migração global do DS. Nenhuma campanha de benchmark adicional: consulta pontual, sem carga clínica no paciente, QA em 1024/1440.

## Architecture: menor caminho completo

1. Reusar o hook `src/hooks/useDietBuilderPage.ts`, que já coordena o editor, draft e flush. Nele ficam preparação da publicação, fetch nativo, operationId/revisão esperada e recuperação autenticada. Sem novos wrappers de transporte ou serviço que só repassem uma chamada.
2. `src/lib/application/diets/diet-published-view.ts` reúne DTO público, validação da entrada e projeção pura. Reusar **buildDietPdfViewModel** para alimentos/quantidades/macros a partir de snapshots; selecionar explicitamente os campos do DTO e acrescentar autoria. Não espalhar tipos PDF pela API nem duplicar fórmulas/loops de cálculo; comportamento do PDF não muda.
3. `src/lib/infrastructure/published-diets/server.ts` concentra acesso server-only ao banco e operação transacional; handlers POST/status existentes no contrato continuam pequenos. Não criar repositório genérico, factory ou interface com implementação única.
4. Modal é organismo `PublishDietModal`; página é template `DietPublishedTemplate`. São composições necessárias de famílias existentes com consumidores reais, registradas segundo categorias overlays/structure. O template não consulta persistência; seleção e storage são controlados pela composição client local da rota pública.
5. `/dieta-publicada/[token]` lê snapshot no servidor e monta a composição client da feature (arquivo local `DietPublishedPageClient.tsx` para hooks/storage), sem sessão/base do profissional. SessionAwareAppShell escolhe bypass público **antes** de montar hooks clínicos. Não mover todas as rotas para outra árvore.
6. `src/lib/persistence/diet-checks.ts` trata somente localStorage validado token+revisão+IDs e fallback de sessão. Essa fronteira evita colocar I/O no template e não cria um sistema de acompanhamento remoto.

## Flow and UI contracts

Abrir menu/modal não faz rede. Confirmar bloqueia duplicação, exige flushDraft SAVED, chave sincronizada no save e snapshot vigente; nova dieta usa targetDietId/baseDietId estável, sem commit clínico. POST segue `contracts/publication.md`; falha preserva draft e snapshot remoto anterior. Resultado incerto reutiliza operationId/status, nova confirmação posterior usa operationId novo e mantém link. Sucesso mostra Copiar/Abrir por ação explícita após resposta, evitando popup bloqueado após await.

Página segue `contracts/ui.md`: uma opção de refeição por vez, abas junto ao título, check acionável pela linha/teclado, resumo de duas colunas e data dd/MM/aaaa. Recarga lê revisão vigente; checks não mudam prescrição/totais, nem se sincronizam remotamente. Zero/ausência preservados. Nenhum controle fictício de configuração futura.

## Credentials, integrity and recovery

Chave gerada por Web Crypto 32 bytes e persistida em Conta. Hash SHA-256 no servidor associa namespace; primeira publicação registra credencial por posse. Account.id declarado não autoriza nada. Toda atualização exige que hash da chave corresponda à publicação; token público nunca aceita escrita. Cadastro online/login e verificação pessoal ficam fora desta etapa. Quem tem save/chave tem essa capacidade, conforme contrato local não criptografado.

Link secreto aleatório 32 bytes, sem IDs pessoais, persistido somente no armazenamento privado do servidor; banco guarda apenas digest de publicationKey. Repetição por ownerHash+operationId tem fingerprint do conteúdo; fingerprint diferente recebe conflito. Revisão esperada evita sobrescrever publicação mais nova com save antigo. Recuperação autenticada consulta status sem repetir commit nem gerar outro link.

SQL remoto limita snapshots ao esquema público permitido. Limite de body 1 MiB, abort de cliente em 30s e erros acessíveis. Rejeitar IDs duplicados, formatos inválidos, modes não simples e strings com unidades inválidas; React renderiza texto. Rate limit de criação/publicação 30 operações por minuto por origem + namespace usando contador transacional; limites não usam apenas IP para propriedade. Nenhum segredo ou token clínico em logs. HTTPS, no-store, noindex/nofollow, Referrer-Policy no-referrer; sem terceiros na página. CORS não é autenticação e aceita somente origins configurados quando chamadas entre origins forem necessárias.

## Compatibility and rollout

Save schema 8 inclui publicationKey nullable até provisionamento; normalizar schemas 4–7 sem gerar credencial no import puro. Gerar/persistir somente quando necessário, e preservar chave em save/load. Não limpar saves antigos nem alterar ordens/valores clínicos. Não fazer fallback silencioso de chave já registrada. Sem chave/configuração/rede, explicar erro e manter outras exportações funcionais.

Remote DATABASE_URL somente servidor; NEXT_PUBLIC_DIET_PUBLICATION_ORIGIN apenas origin sem segredo; env obrigatória verificada. Provisionar banco/migração e Vercel Preview com dados fictícios para QA; produção e dados reais não são publicados pelo fluxo SDD. Deployment de produção é etapa operacional posterior explicitamente autorizada. Validação inclui acesso por browser limpo ao Preview. Sem PostgreSQL provisionado, reportar gate operacional pendente; não declarar integração online comprovada.


## Files to change

| Responsabilidade | Arquivos |
| --- | --- |
| Chave/save compatível | `src/lib/domain/account.ts`, `src/lib/application/profile-session.ts`, `src/lib/infrastructure/local-db/{schema,migrations,account-context,logical-export-schema,backup-repository}.ts`, `src/lib/application/backup-application.ts` |
| DTO/validação/projeção | `src/lib/application/diets/diet-published-view.ts` (novo; reusa `diet-pdf-view.ts`) |
| Publicação | `src/hooks/useDietBuilderPage.ts`, `src/lib/infrastructure/published-diets/server.ts`, `migrations/001-publications.sql`, `src/app/api/diet-publications/route.ts`, `status/route.ts`, `.env.example`, package/lock |
| Modal/entrada | `src/components/organisms/diets/PublishDietModal.tsx`, `src/components/templates/DietBuilderTemplate.tsx`, `dietBuilderTemplateTypes.ts`, `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` |
| Paciente/checks | `src/components/templates/DietPublishedTemplate.tsx`, `src/app/dieta-publicada/[token]/{page.tsx,DietPublishedPageClient.tsx}`, `src/app/SessionAwareAppShell.tsx`, `src/lib/persistence/diet-checks.ts` |
| Catálogo/evidência | registry/perfis/decisões de `design-system/components/`, testes sob tests/, validation-report nesta pasta |

Não criar `publish-diet.ts`, `published-diets/client.ts` ou `domain/diets/diet-publication.ts`: as capacidades ficam no fluxo existente ou no único contrato puro, sem trabalho manual/futuro adicional.

## Constitution check and verification

Atomic Design: organismo/template e client da rota compõem níveis inferiores; primitivos sem domínio. Design System prevalece sobre HTML; categorias/perfis consultados, sem novas escalas. T011 audita consumidores e corrige apenas desvios necessários, incluindo Tabs/Dialog, sem migração ampla nem supressão. Test-first: T001 define falhas antes de validadores/implementação; testes isolados sob tests/. Execução futura por `/speckit-implement` após validação humana.

T001–T002: geração única e roundtrip de chave/save; T001/T004/T005: autenticação cruzada, CAS/replay, limite e respostas; T003: snapshots e projeção existente; T006–T008: modal/flush/retry/link; T009–T010: browser sem perfil, abas/checks/revisão; T011–T012: catálogo/a11y/regressões, auditorias e Preview. Todos os riscos e cenários de `quickstart.md` mantidos. Estado documental aprovado não certifica código inexistente.

## Delivery

12 tarefas completas, com skills e verificações observáveis. Implementação incremental, mas só considerar primeira entrega completa com modal + publicação + página + checks + save/autorização e QA. Um gate remoto indisponível é pendência, nunca prova online. Sem deploy de produção neste SDD.
