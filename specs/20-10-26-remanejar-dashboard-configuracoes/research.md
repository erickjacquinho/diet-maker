# Pesquisa e decisões de implementação

## Evidências locais

- `src/app/saves/page.tsx`: catálogo/associações e redirect de runtime aberto para Pacientes.
- `src/app/SessionAwareAppShell.tsx`: saves é exceção sem runtime; conta/cadastro têm validação independente.
- `src/app/navigation/SidebarNavigationAdapter.tsx`: backup, checkpoint e Dialog; a entrega parcial já integrou a abertura padrão de Configurações por `onOpenAccount`.
- `src/components/molecules/SidebarUserProfile.tsx`: menu expanded/collapsed com Configurações e demais ações.
- `src/components/ui/dialog.tsx`: portal, título, close e foco existentes. Overlays exige título e permite descrição opcional.
- `src/lib/application/profile-session.ts`: conta online, arquivo, runtime e checkpoints têm identidades e autorizações próprias; trocar rota não substitui essas garantias.

## Decisões

1. Dashboard recebe saves locais, conforme clarificação do usuário; dashboard totalmente vazio e migração online imediata estão excluídos desta etapa.
2. Modal vazio no adapter atual: composição existente, sem wrapper público, rota de configuração ou dependência nova.
3. Conta permite o shell; arquivo autorizado permite operações clínicas. Nenhuma autorização é concedida pela UI.
4. Backup vai diretamente à composição de `dashboard/page.tsx`, conservando implementação e validação; não reescrever serviços nem criar componente intermediário. `tests/components/app/backup-actions.test.tsx` já cobre download, validação, confirmação, estados desabilitados e bloqueios por rascunhos/checkpoint: adaptar seus pontos de entrada e completar cenários, sem suíte paralela para o mesmo fluxo.
5. Sem impor unicidade ou remover arquivos existentes neste remanejamento.

## Fontes

- AGENTS.md, constituição, design-system/README.md, documentos normativos 02–08 e 10–13; categorias navigation/overlays e perfis SidebarNav/SidebarUserProfile/Dialog.
- ADR-007, ADR-009 e contratos vigentes de persistência em refs/dieta-db.
- [Dialog Shadcn](https://ui.shadcn.com/docs/components/radix/dialog) e [Dropdown Menu Radix](https://www.radix-ui.com/primitives/docs/components/dropdown-menu), consultados em 2026-10-20. A API instalada é confirmada no código local.

Sem tecnologia nova ou pesquisa pendente. Decisões de produto vieram da conversa. No minimize, consulta substantiva ao Jev comparou composição direta e componente separado: composição direta teve probabilidade 0,90 e confiança 0,85. A decisão mantém os contratos e a cobertura; não comprova comportamento nem autoriza implementação.
