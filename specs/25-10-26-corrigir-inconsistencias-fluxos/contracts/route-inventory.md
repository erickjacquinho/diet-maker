# Inventário de páginas e referências de evidência

Censo estático de 2026-10-25: 24 arquivos `src/app/**/page.tsx`. A tabela enumera caminhos de rota; cada um corresponde a `src/app` + caminho + `/page.tsx`, sendo `/` → `src/app/page.tsx`. O teste futuro compara os caminhos de arquivos, não só a quantidade. Query strings e valores como `nova` não geram arquivos adicionais. APIs/callbacks `route.ts` têm cobertura especializada separada.

Referências abaixo são pontos existentes a revisar, não afirmações de cobertura integral ou execução nesta data. O implementador deve registrar estados realmente cobertos, lacunas e nomes de casos específicos; se uma referência não exercer a rota, classificá-la como evidência indireta, sem inventar cobertura.

| Rota | Natureza / parâmetros ou destino | Referências existentes e estados a classificar |
| --- | --- | --- |
| `/` | Pública | `tests/browser/online-layout.spec.ts`; entrada pública e navegação. |
| `/login` | Pública/guarda | `tests/browser/online-auth.spec.ts`; formulário, falha e sessão válida. |
| `/criar-conta` | Pública/guardada por modo | `online-auth.spec.ts`; cadastro, confirmar=1, completar=1 e validação. |
| `/recuperar-senha` | Pública | `online-auth.spec.ts`; envio e resultado genérico. |
| `/redefinir-senha` | Pública com recovery | `online-auth.spec.ts`; token válido/inválido e reset. |
| `/dashboard` | Conta completa | `tests/components/app/dashboard.test.tsx`, `tests/browser/settings-saves.spec.ts`; sem save, loading/erro/vazio/dados. |
| `/home` | Alias `/dashboard` | `tests/app/session-aware-app-shell.test.tsx`, navegação de auth; destino e query são contrato a verificar diretamente. |
| `/saves` | Alias `/dashboard` | `tests/browser/online-auth.spec.ts`, `settings-saves.spec.ts`; alias e destino de gestão; não atribuir teste de DataTable antiga a esta página. |
| `/calendario` | Alias `/agenda` | Fontes do alias e `tests/routes/navigation.test.tsx`; referência atual é estática, explicitar lacuna funcional se não coberta. |
| `/agenda` | Clínica autorizada | `settings-saves.spec.ts`, `tests/app/pacientes/patient-follow-up.test.tsx`; evidência parcial; T008 compara rotina. |
| `/pacientes` | Clínica autorizada | `tests/browser/clinical-persistence.spec.ts`; lista, criação/edição, vazio/falha conforme casos existentes. |
| `/pacientes/[id]` | Paciente | `tests/app/pacientes/patient-profile-read.test.tsx`, `patient-profile-history.test.tsx`, `clinical-persistence.spec.ts`; carregamento/ausente e contexto. |
| `/pacientes/[id]/dietas` | Histórico de dietas | `tests/app/pacientes/patient-history-pages.test.tsx`; leitura/vazio/erro conforme testes. |
| `/pacientes/[id]/dieta/[dietaId]` | Dieta existente ou `nova` | `tests/app/pacientes/diet-editor-persistence.test.tsx`, `diet-editor-load-errors.test.tsx`, `tests/browser/diet-offline-persistence.spec.ts`; edição/draft/commit/locked. |
| `/pacientes/[id]/dieta/[dietaId]/ciclo` | Ciclagem | `tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx`; integração indireta, revisar cobertura de página. |
| `/pacientes/[id]/dieta/[dietaId]/pdf` | Exportação PDF | `tests/components/app/diet-pdf-settings.test.tsx`; configuração indireta, nomear lacuna de rota se houver. |
| `/pacientes/[id]/dieta/[dietaId]/pagina` | Página/exportação | Inspeção da página e testes de exportação localizados na implementação; não há prova funcional atribuída neste levantamento. |
| `/pacientes/[id]/consulta/[date]` | Consulta/histórico por data | `tests/routes/route-acceptance-matrix.ts` e testes de histórico; separar inspeção de comportamento executado. |
| `/pacientes/[id]/avaliacoes` | Histórico de avaliações | `tests/app/pacientes/patient-history-pages.test.tsx`; vazio/leitura/erro conforme casos. |
| `/pacientes/[id]/avaliacao/[assessmentId]` | Avaliação existente ou nova | `assessment-workspace.test.tsx`, `assessment-persistence.test.tsx` em `tests/app/pacientes`; validação/edição/leitura. |
| `/presets` | Biblioteca | `tests/browser/component-adequation.spec.ts`, testes especializados a localizar; evidência do componente não equivale à rota. |
| `/refeicoes` | Biblioteca | `tests/browser/library.spec.ts`; superfície; detalhar casos especializados sem prometer CRUD completo. |
| `/receitas` | Biblioteca | `tests/browser/library.spec.ts`; superfície; detalhar casos especializados sem prometer CRUD completo. |
| `/alimentos` | Biblioteca | `tests/browser/library.spec.ts`; criação, checkpoint e recuperação são o delta F2. |

## Contrato do verificador

- Comparar conjunto de arquivos reais normalizados com conjunto da matriz; rejeitar duplicatas e ausentes/extras.
- Vincular arquivo à rota derivada dos segmentos App Router atuais, excluindo grupos de rota da URL.
- Validar destino/parâmetros para alias e dinâmica; páginas que só redirecionam não exigem default/loading/empty visuais.
- Cobertura pode ser direta, indireta, estática ou lacuna nomeada. Lacuna de evidência não é defeito de produto confirmado nem autorização para reescrever esse fluxo.
- Nomes de testes dizem “inventário”, “inspeção estática” ou jornada efetivamente exercitada; nunca “todas as páginas funcionam” só por comparação de arquivos.
