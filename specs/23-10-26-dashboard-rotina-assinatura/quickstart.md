# Quickstart: validação futura

**Estado atual**: documentação apenas; estes passos ainda não foram executados como prova da feature.

## Pré-condições

- Validar spec/plan/tasks e executar /speckit-implement com feature_directory desta pasta.
- Preservar o trabalho local já existente; não restaurar arquivos ou encerrar processos para preparar testes.
- Instalação/dependências atuais do projeto; usar servidor local existente quando disponível, ou iniciar npm run dev sem reiniciar outro processo.
- Fixtures de teste sem dados pessoais: acompanhamentos em datas distintas, tipos iguais/diferentes e viradas de mês/ano.

## Checks focados após implementação

Executar na raiz:

```powershell
npm run type-check
npx vitest run tests/lib/agenda-summary.test.ts tests/components/app/dashboard.test.tsx tests/components/organisms/settings-dialog.test.tsx tests/components/app/sidebar-navigation-adapter.test.tsx tests/app/session-aware-app-shell.test.tsx tests/components/app/save-management.test.tsx tests/components/app/backup-actions.test.tsx tests/components/molecules/next-event-modal.test.tsx tests/app/agenda-reminder-scheduler.test.tsx
npm run verify:design-system
npm run audit:atomic-design
npx eslint src/app/dashboard src/app/agenda/page.tsx src/lib/agenda-summary.ts src/components/organisms/SettingsDialog.tsx src/app/navigation/SidebarNavigationAdapter.tsx
npx playwright test tests/browser/settings-saves.spec.ts --config=playwright.config.ts
git diff --check
```

Resultados: casos focados passam, sem findings novos atribuíveis ao diff. Executar o conjunto uma vez após o diff final, repetindo apenas se nova alteração ou falha justificar. Falhas preexistentes devem ter evidência própria, sem correção ampla nesta feature. A suíte completa só é ampliada quando uma falha ou impacto adicional justificar.

## Cenários de aceite

1. Conta autenticada sem save: Início abre, não tenta ler acompanhamentos; CTA Saves e atalho de assinatura funcionam.
2. Abrir save autorizado: sete dias corretos, hoje destacado; contagens/lista coincidem com a Agenda. Dois tipos em datas diferentes continuam separados.
3. Fixture fixa em domingo, sábado e virada de mês/ano: semana, inclusão de limites e ordem corretas; datas inválidas ignoradas.
4. Semana com itens passados mas sem futuros: calendário mantém contagens, lista informa ausência de próximas ações.
5. Loading/error/retry: textos distintos, nenhum resultado antigo exibido, retry recupera.
6. Trocar/reabrir arquivo (inclusive mesma conta/arquivo com runtime novo), bloquear ou fechar: a rotina limpa a coleção anterior; resposta atrasada não a repõe.
7. Recuperar foco após mudar a data: hoje e projeção atualizam sem polling nem nova escrita.
8. Assinatura: acesso direto e pelo tab mostram mesmo texto neutro; nada simula pagamento ou salvamento.
9. Perfil com draft → Assinatura → Perfil: campos preservados; fechar aplica guarda de descarte. Operações busy/suspended não são interrompidas.
10. Em 1024/1280/1600px e zoom 200%: registrar screenshots, ausência de overflow, foco/teclado e altura constante entre as três abas; sem tabelas/catálogo de saves no Início.
11. Conferir logout na sidebar e os fluxos existentes de perfil/saves.

## Evidências separadas

- Fixtures/Vitest provam projeção e contratos isolados, não integração real.
- Playwright com APIs mockadas prova interação/layout controlado; registrar que há mocks.
- Sessão local autenticada com save de teste autorizado prova leitura pela integração existente e paridade com a Agenda; não alterar pacientes reais para fabricar evidência. Usar dados de teste previamente autorizados.
- Se acesso real estiver indisponível, registrar exatamente o bloqueio e manter essa verificação pendente. Não marcar o fluxo completo por inferência.

Registrar comandos, resultados e evidências em implementation-log.md dentro desta pasta quando a execução ocorrer. Não criar esse log antecipando sucesso.
