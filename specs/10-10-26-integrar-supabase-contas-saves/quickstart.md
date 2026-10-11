# Guia de validação e publicação

Roteiro da execução `$sdd-implement`. O projeto Supabase `diet-maker`, Auth/SMTP e migration estão configurados; o app foi publicado em `https://nutridiet-eight.vercel.app`. T029 foi validada em HTTPS. T026 permanece aberta para Edge e picker nativo do Windows.

## Pré-requisitos e ambiente

1. Registrar status Git/processos e preservar mudanças preexistentes. Usar checkout atual sem reset; não commit/push/restart sem autorização.
2. Node/npm do projeto, Supabase CLI verificada e Docker para ambiente local descartável. Se CLI/Docker faltar, identificar limitação antes de instalar/alterar máquina. Dois profissionais e fixtures sintéticas, sem pacientes reais.
3. `.env.local` servidor: APP_ORIGIN=http://localhost:3000, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY (servidor), ONLINE_DATABASE_URL (runtime), ONLINE_DATABASE_SSL_CA_B64 para Postgres remoto, SERVER_MASTER_KEY e identificador de versão. Admin/migração separado. Sem valores reais em docs/Git e sem NEXT_PUBLIC_SUPABASE_*.
4. Supabase local, Auth e-mail confirmado, token OTP15min, templates confirmação/recovery TokenHash e caixa de e-mail local. Gerar KEK de32bytes fora de logs e guardar backup seguro restrito.
5. Alvo remoto autorizado: projeto `diet-maker` na organização `Jacquinho`, São Paulo; conferir o ref antes da migration. Projeto `nutridiet` na Vercel Hobby já está vinculado. Usar o hostname `vercel.app` atribuído pela Vercel; não é necessário comprar domínio. SMTP inicial: Gmail com senha de app armazenada em `.env.smtp.local`, nunca no chat ou Git. Cadastre apenas as origens/redirects efetivamente usadas.

## Comandos após implementação

Os comandos formam o roteiro das provas exigidas, não uma obrigação de repetir todas as suítes ao fim de cada tarefa. Teste de falha precede código no módulo; T026 reúne a jornada integrada e regressões afetadas, T027 revisa segurança, T028 verifica DS/acessibilidade e T029 fecha checks pendentes/build. Reusar a evidência aprovada quando nenhum código relevante mudou; nova falha, correção ou risco aberto justifica nova execução focada.

```powershell
# Na raiz do projeto, ambiente local descartável configurado.
npx supabase start
npx supabase db reset --local
npm run type-check
npx vitest run tests/server tests/application tests/infrastructure tests/lib/application/profile-session.test.ts --pool=forks --maxWorkers=1
npm run audit:atomic-design
npm run audit:z-index
npm run verify:design-system
npm run verify:table
npm run build
```

`db reset --local` só no banco descartável de testes, nunca em remoto ou dados do usuário. Segredos/runtime conectam ao ambiente local. Validar testes componentes/fixtures complementares listados nas tarefas, e executar browser com processo existente/porta verificada; subir npm run dev em outra porta se necessário, sem matar o atual:

```powershell
npm run dev -- --port 3000
```

Com servidor e APP_ORIGIN coerentes, em outro terminal:

```powershell
npm run test:browser -- tests/browser/online-auth.spec.ts tests/browser/online-saves.spec.ts tests/browser/profile-save-load.spec.ts tests/browser/backup-persistence.spec.ts
```

Caminhos de testes novos são propostas de tasks.md, não existem necessariamente antes da implementação. Usar fixtures sintéticas e relógio injetado, sem esperar oito horas reais. Browser precisa verificar File System Access em Chrome/Edge além dos doubles determinísticos.

## Cenários e provas

| Cenário | Evidência esperada |
| --- | --- |
| Landing/cadastro/login | Elementos pedidos; keyboard e estados; faixas meses/anos; zero/fração aceitos; negativa/NaN/faixa inválida e confirmação divergente recusados também por HTTP direto; e-mail não confirmado bloqueado |
| Duplicados/perfil falho | Novo/confirmado/não confirmado/retry; perfil existente não muda, sem acesso pelo signup; perfil faltante após confirmação é completado somente com sessão verificada, sem saves antes da conclusão; respostas genéricas |
| Recovery | OTP válido/expirado/replay/concorrente; scanner GET não consome; recovery não abre catálogo; novo login funciona, DEK igual |
| Backend | Dois owners/dois saves cada; JWT revogado, owner forjado, CSRF/CORS e query direta recusados; rate limit atômico, no-store/cookies HttpOnly e redaction |
| Banco | PUBLIC/anon/authenticated sem acesso, runtime NOBYPASSRLS não owner; ator ausente nega; requests alternando no pool não vazam; Auth sessions só colunas mínimas; dump cifrado não revela perfil/DEK sem KEK |
| Codec/menu | Round-trip coleções/IDs/receitas/lembretes/drafts; IV novo; adulterações recusadas antes de base; principal e export menu cifrados, sem segredo/campos clínicos claros |
| Legado/concorrência/retry | Fixture schema10 e migradores conhecidos; SHA-256 original inalterado; destino igual recusado; claim concorrente dono único; interromper/recarregar tentativa preserva IDs não secretos na associação local e retoma mesma DEK; nenhum estado remoto substitui validação do arquivo; limite do original legível informado |
| Localização/dashboard | Todos os saves por paginação; perda/movimento/permissão/mesmo nome/storage/origem; nenhum falso Sincronizado; relink mantém chave |
| Conservação/offline | Antes8h edição/checkpoint offline; a partir8h locked; suspensão/reload/logout; editor com timer/flush falho e checkpoint em andamento conserva workspace/drafts; outro tuple não vê dados |
| Rede/bundle | Nenhum arquivo/paciente/snapshot/draft no backend/Supabase; material só authorize; nenhuma credencial ou SDK remoto no cliente/storage/arquivo; cookies Auth não acessíveis por JS |
| Aparência/acessibilidade | DS registry/exports/categorias, 1024/1280/1600 e zoom200%, foco/label/error/status/teclado, sem redesenhar área clínica |

## Supabase remoto e Vercel

Validar migration local, conferir projeto/ref, revisar o plano de rollback, aplicar no Supabase dedicado e auditar grants/RLS/advisors. Configurar SMTP Gmail e testar uma confirmação/recovery com conta sintética. Na Vercel, inserir somente variáveis necessárias server-side nos ambientes de produção; gerar uma KEK nova e guardar backup seguro, usar URL Postgres da role `online_runtime` restrita, nunca credencial administrativa. `vercel.json` fixa uma região `gru1` próxima ao Postgres `sa-east-1` e compatível com o limite de uma região do plano Hobby. Configurar `APP_ORIGIN` e callbacks após confirmar o hostname `vercel.app` atribuído ao projeto.

Manter evidência separada: análise documental, testes unitários/integração, build, browser real, banco remoto aplicado e deploy. Falha externa não é teste aprovado. A rota da landing é `/`.

## Resultado da ativação — 2026-10-11

- Deployment Production `READY`; alias `https://nutridiet-eight.vercel.app` respondeu `200` na landing, páginas de Auth e saves. `/api/auth/csrf` respondeu `200` com cookie `Secure`, `HttpOnly`, `SameSite=Strict`; sessão e saves anônimos responderam `401`.
- Smoke sintético autenticado em HTTPS passou: signup, perfil remoto, confirmação, login, recuperação/reset, novo login, registro/listagem/autorização de save. Os callbacks positivos consumiram OTPs gerados pela API administrativa Supabase apenas para as contas de teste; a geração não enviou e-mail. A entrega SMTP Gmail já havia sido confirmada pelo usuário em teste anterior.
- Bundle público de seis rotas e 37 scripts não continha nenhum dos segredos locais examinados; logs do deployment não continham padrões de credencial. Contas, perfil e save sintéticos foram removidos; consulta posterior encontrou zero usuário de teste.
- T026 continua aberta para Edge e o diálogo nativo do Windows; não declarar a execução SDD inteira concluída até essa evidência ou um bloqueio documentado.
