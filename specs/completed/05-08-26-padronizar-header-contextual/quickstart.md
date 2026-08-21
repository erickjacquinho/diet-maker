# Quickstart: Validação do header contextual

## Prerequisites

- Node.js e dependências já instaladas no repositório.
- Worktree sem necessidade de limpar ou reverter alterações pré-existentes.
- Implementação executada previamente por `/speckit-implement`.

## Targeted Checks

```powershell
npm run type-check
npm test -- tests/components/molecules/page-context-header.test.tsx tests/app/pacientes/page-context-navigation.test.tsx
```

Expected: type-check succeeds and all targeted component/route tests pass.

## Full Checks

```powershell
npm test
npm run verify:design-system
npm run verify:design-system-legacy
npm run audit:atomic-design
```

Expected: no new failures attributable to the header, Breadcrumb, registry or route consumers.

## Manual Scenarios

### Route adoption map

| Route | Header context | Explicit return | Scope |
| --- | --- | --- | --- |
| `/pacientes/[id]` | `Pacientes > <nome>` / `Perfil do paciente` | `/pacientes` | included |
| `/pacientes/[id]/dieta/[dietaId]` | `Pacientes > <nome> > Dieta` / `Elaboração de Dieta` | `/pacientes/[id]` | included |
| `/pacientes/[id]/consulta/[date]` | `Pacientes > <nome> > Consulta` / `Registro de Consulta` | `/pacientes/[id]` | included |
| food search modal | permanece na dieta | fecha o modal | excluded: no new route |
| global sidebar destinations | header global | no contextual parent | excluded: no sequential parent |

1. Abrir `/pacientes`, selecionar um paciente e confirmar `Pacientes > <nome>` e retorno para `/pacientes`.
2. No perfil, abrir uma dieta nova e confirmar `Pacientes > <nome> > Dieta`, sem exibir `nova`, e retorno para o perfil.
3. No perfil, abrir uma consulta e confirmar `Pacientes > <nome> > Consulta` e retorno para o perfil.
4. Na consulta, abrir a dieta vinculada e confirmar o breadcrumb de dieta e a continuidade das ações existentes.
5. Na dieta, abrir a busca de alimento e confirmar que o modal não cria um segundo header nem altera a rota.
6. Abrir uma página sem `actions` e confirmar que não existe espaço reservado vazio no header.
7. Testar foco por Tab, ativação por Enter e foco visível no link de retorno e nos ancestors do breadcrumb.
8. Repetir em 1024px, 1280px e 1440px com um nome de paciente longo para validar overflow e ausência de sobreposição.
