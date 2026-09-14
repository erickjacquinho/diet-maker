# Quickstart — Validar o backup manual simples

Este guia valida a Fase 6 depois que o plano for implementado. Ele não
substitui a suíte completa do repositório.

## Pré-requisitos

- Node/npm instalados conforme o workspace.
- Chromium/Playwright disponível para a jornada browser.
- Aplicação iniciada localmente em uma porta limpa.
- Uma Conta local sem segunda aba ativa.

## Validação unitária e de integração

```powershell
npm test -- --reporter=dot tests/lib/backup.test.ts tests/application/backup-application.test.ts tests/infrastructure/backup-repository.integration.test.ts tests/infrastructure/backup-drafts.integration.test.ts
```

Esperado:

- envelope com todas as tabelas canônicas e sem drafts;
- rejeição de app/schema incompatível, tipos inválidos, IDs duplicados,
  relações órfãs, Conta divergente e dieta vigente duplicada;
- exportação consistente;
- restauração atômica com rollback em falha;
- base anterior preservada em cancelamento e erro.

## Validação da interface

```powershell
npm test -- --reporter=dot tests/components/molecules/sidebar-quick-actions.test.tsx tests/components/molecules/sidebar-user-profile.test.tsx tests/components/organisms/sidebar-nav.test.tsx tests/app/backup-actions.test.tsx
```

Esperado:

- ações exibem `Exportar backup` e `Restaurar backup`;
- input de arquivo aceita `.nutridiet`;
- confirmação informa substituição, ausência de mesclagem, drafts e limites de
  privacidade;
- estados de carregamento, erro, cancelamento e foco são acessíveis.

## Jornada browser/offline

```powershell
$env:PLAYWRIGHT_PORT='3104'
npm run test:browser -- tests/browser/backup-persistence.spec.ts --workers=1
```

Esperado:

1. Criar dados representativos de Conta, biblioteca, paciente, clínica, dieta
   vigente e histórico.
2. Exportar o `.nutridiet` e inspecionar que drafts não aparecem no conteúdo.
3. Alterar ou arquivar dados locais, selecionar o arquivo e confirmar a
   substituição total.
4. Recarregar e verificar que todos os dados confirmados retornaram, inclusive
   arquivados, snapshots e registros clínicos.
5. Tentar arquivo inválido e restauração com draft pendente; ambos devem ser
   rejeitados sem alterar a base.
6. Repetir sem rede e verificar que nenhum request de exportação/restauração é
   enviado.

## Gates finais

```powershell
npm run type-check
npm run lint
npm test -- --reporter=dot
npm run verify:links
npm run audit:atomic-design
npm run audit:z-index -- --strict
npm run verify:table -- --strict
npm run verify:design-system -- --strict
npm run verify:design-system-legacy -- --strict
npm run build
```

Todos os comandos devem terminar com código zero. A validação da feature deve
ser registrada no `validation-report.md` do SDD antes de marcar as tarefas
como concluídas.
