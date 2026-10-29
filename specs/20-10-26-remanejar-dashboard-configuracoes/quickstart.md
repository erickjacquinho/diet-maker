# Validação por incremento

## Modal autorizado agora

Na raiz, sem reiniciar servidor em uso:

```powershell
npx.cmd vitest run tests/components/app/sidebar-navigation-adapter.test.tsx tests/components/molecules/sidebar-user-profile.test.tsx --pool=forks --maxWorkers=1
npm.cmd run type-check
npx.cmd eslint src/app/navigation/SidebarNavigationAdapter.tsx tests/components/app/sidebar-navigation-adapter.test.tsx
```

Neste ambiente, se o worker forks não iniciar, usar `node.exe node_modules/vitest/vitest.mjs run tests/components/app/sidebar-navigation-adapter.test.tsx tests/components/molecules/sidebar-user-profile.test.tsx tests/components/organisms/sidebar-nav.test.tsx --pool=threads --maxWorkers=1`, comando aprovado nesta entrega parcial.

Validar menu -> Dialog vazio, expanded/collapsed, Escape/Fechar, retorno de foco e preservação do callback do consumidor. Renderização de integração local não comprova sessão autenticada.

Se uma sessão de teste estiver disponível no navegador, abrir Configurações em um módulo e conferir visual/foco. Não declarar observado se o navegador não for usado.

## Após validação humana do remanejamento

1. Executar regressões de dashboard, shell, auth, sidebar e backup; adaptar `tests/components/app/backup-actions.test.tsx` à composição do dashboard e os cenários `tests/browser/online-saves.spec.ts` e `tests/browser/backup-persistence.spec.ts`, preservando a cobertura anterior. Conferir tipos, lint, design system afetado e build.
2. Em conta/arquivos de teste, conferir login -> dashboard, cadastro incompleto, links antigos, ausência de arquivo, runtime ativo sem redirect, erro de catálogo diferente de vazio.
3. Criar/importar/abrir/localizar, recuperar permissão e proteger legado em cópia; preservar original e identidade.
4. Exportar/restaurar backup protegido; cancelar, provocar falha controlada e tratar rascunho/checkpoint pendentes sem dados reais.
5. Conferir sete destinos nas duas apresentações, modal vazio e menu Configurações/Sair; backups no dashboard.
6. Provar gates sem arquivo e com expiração/revogação, preservando rascunhos.

Registrar resultados em validation-report.md separando testes, build, visual e persistência autenticada. O teste do modal não entrega as novas rotas ou a migração online.
