# Pesquisa: página inteligente da dieta simples

Data: 2026-09-30. Pesquisa de código e fontes primárias; nenhum serviço provisionado.

## R1 — Referência e componentes

**Decision**: Implementar a composição na estrutura `src/`, reaproveitando DataTable, MacroSummary, Tabs, Dialog, Button e ActionDropdown. Criar somente composições de domínio com responsabilidade nova: template de página publicada e organismo de modal.
**Rationale**: O HTML foi autorizado somente para validação visual. APIs de seleção multi/selectOnRowClick e MacroSummary já cobrem checks e nutrientes. A composição tem consumidores reais e é registrada como experimental até QA.
**Alternatives considered**: copiar o bundle HTML; criar controles equivalentes; modificar os primitivos apenas para esta tela. Rejeitadas por regras de criação/preservação.
**Evidence**: `refs/UI/dieta-exportada/reference.tsx`, `src/components/molecules/DataTable.tsx`, `MacroSummary.tsx`, `design-system/09-component-decision-model.md` e perfis das famílias.

## R2 — Autenticação por posse da chave da conta

**Decision**: Credencial aleatória privada de 32 bytes, distinta de Account.id, sincronizada no save. Servidor deriva/verifica hash e autoriza publicação pelo titular dessa chave, sem login. Na primeira publicação registra o namespace da credencial; não afirma autenticação de identidade civil.
**Rationale**: Usuário definiu chave da conta, não login. Account atual não possui credencial; o ID inclusive pode ser `local-account` em compatibilidade e não é segredo. O servidor nunca autoriza pelo accountId declarado no body.
**Alternatives considered**: login online; accountId como senha; token público com escrita. Rejeitadas por escopo e isolamento de permissões.
**Evidence**: `src/lib/domain/account.ts`, `profile-session.ts`, `local-db/account-context.ts`, `logical-export-schema.ts` (schema 7), `backup-application.ts`, `backup-repository.ts`.
**Limite conhecido**: quem possuir o save não criptografado e a chave pode publicar em nome desse namespace. Login, revogação/rotação da chave e identidade verificada são futuros, não alegar que já existem.

## R3 — Persistência remota mínima

**Decision**: Postgres Neon conectado à Vercel pelo Marketplace; driver oficial `@neondatabase/serverless` somente no servidor. Não mover o banco clínico PGlite para a nuvem. Armazenar snapshot de publicação e operações de idempotência.
**Rationale**: Constraints e transação asseguram link estável por titular/dieta, revisão e repetição segura. Blob exigiria coordenação adicional para escritas concorrentes. É a única nova dependência runtime planejada, justificada pela persistência remota inexistente.
**Alternatives considered**: Vercel Blob privado; save completo remoto; banco em memória de function. Blob não resolve sozinho a transação; os demais violam privacidade/durabilidade.
**Jev**: escolha Neon com probabilidade 0,62 e confiança 0,23; resultado insuficiente como mandato. A decisão do plano é sustentada pelos requisitos explícitos de unicidade/transação e documentação primária, submetida à validação humana.
**Sources**: [Postgres na Vercel](https://vercel.com/docs/postgres) informa integração via Marketplace; [driver oficial Neon](https://github.com/neondatabase/serverless) documenta HTTPS, consultas parametrizadas e transações. Fontes consultadas em 2026-09-30; não presumir instalação do serviço.

## R4 — Página pública sem runtime clínico

**Decision**: `/dieta-publicada/[token]` obtém apenas snapshot publicado. SessionAwareAppShell deve selecionar um caminho público antes de montar o componente com hooks de sessão local; nenhuma abertura PGlite/sidebar/onboarding para o paciente. Preservar shell clínico para demais rotas.
**Rationale**: `src/app/layout.tsx` envolve todas as rotas no shell que restaura perfil e redireciona sem conta. Um bypass após esses hooks não resolve a dependência.
**Alternatives considered**: rota `/pacientes/...` dependente da base do profissional; mover todas as páginas para route groups nesta entrega. O primeiro é incorreto; o segundo amplia migração desnecessariamente.

## R5 — Dados e save

**Decision**: DTO público e validação em um módulo puro; sua projeção seleciona campos de `buildDietPdfViewModel`, que já usa snapshots, formatNutrition e formatDateOnly. Não alterar o comportamento ou espalhar tipos PDF pela API. Preserve IDs, unidades, energia da fonte e ordem. Account ganha `publicationKey`; save compatível ganha schema 8 sem descartar 4–7. Se save legado já pertencer a um namespace publicado, nunca gerar outra chave silenciosamente para substituí-lo.
**Rationale**: A projeção PDF já resolve alimentos, quantidades, opções e totais. Reutilizar a função internamente e manter whitelist/DTO público próprios evita repetir lógica sem acoplar o contrato remoto aos tipos PDF.
**Alternatives considered**: recalcular a partir de catálogo atual; exportar metas como total de alimentos; salvar credencial só no browser. Rejeitadas por snapshots e portabilidade.

## R6 — Estado e exclusões

**Decision**: Checks em localStorage do paciente, namespace token+revisão e IDs de refeição/opção/item; nova revisão inicia vazio. Publicação só por modal, sem polling automático, sincronização geral, expiração ou gestão de links. Recarga abre a revisão vigente; conteúdo já aberto só muda ao recarregar.
**Rationale**: Respostas explícitas do usuário e configurações futuras fora desta primeira UI. Armazenamento indisponível degrada para sessão com aviso.

## R7 — Minimize aplicado

**Decision**: 20 tarefas consolidadas em 12 entregas; retirar três módulos repassadores planejados (`publish-diet.ts`, `published-diets/client.ts`, `domain/diets/diet-publication.ts`). Fluxo no useDietBuilderPage existente, contrato puro único e servidor próprio restrito. Composição client local da rota mantém I/O fora do template, sem componente público especulativo.
**Rationale**: Mesmo resultado com menos fronteiras/duplicação; autenticação, save legado, endpoints, transação/idempotência, recuperação, limites e QA continuam nas tarefas/contratos. Minimize reduz complexidade, não segurança nem escopo.
**Alternatives considered**: manter wrappers; eliminar armazenamento/idempotência; omitir testes ou separar homologação para depois. As últimas enfraqueceriam o resultado e foram rejeitadas.
**Jev**: consolidar capacidades indicado com confiança 0,92; confirmado pela capacidade existente do hook e da projeção PDF.
