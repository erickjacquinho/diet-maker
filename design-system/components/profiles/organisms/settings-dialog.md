# SettingsDialog

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-settings-dialog` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/SettingsDialog.tsx` |
| Public exports | `SettingsTab`, `SettingsSaveSyncState`, `SettingsProfileState`, `SettingsSaveState`, `SaveSettingsInput`, `SettingsDialogProps` (types), `SettingsDialog` (component) |

## Purpose

Reunir em um único modal as configurações do perfil profissional (válido para toda a conta) e as configurações do save aberto (válidas apenas para o arquivo atual).

## Category inheritance

Herda [overlays](../../categories/overlays.md). Trait autorizado: `async`.

## Specific anatomy

Dialog com título "Configurações", descrição de escopo e `Tabs` com duas abas:

- **Perfil profissional**: seções Identificação (nome, sobrenome, título, CRN), Atuação (experiência, média de pacientes, modalidade, especialidades, apresentação), Contato e consultório (e-mail de acesso somente leitura, e-mail de contato, telefone, Instagram, site, consultório, cidade, UF) e Documentos (exibição nos PDFs com prévia da assinatura). Rodapé com "Descartar alterações" e "Salvar perfil".
- **Save**: nome do save e telefone do consultório, arquivo e estado de sincronização em lista descritiva, ação "Sincronizar agora" e rodapé com "Descartar alterações" e "Salvar configurações do save".

## Allowed variants

`defaultTab` escolhe a aba inicial (`profile` ou `save`). Não há variantes visuais próprias.

## Particular states

- perfil carregando, com erro recuperável ("Tentar novamente") ou pronto;
- erros de validação por campo com `aria-invalid`, mensagem associada e foco no primeiro campo inválido;
- salvamento em andamento com `aria-busy` e botão em `loading`; retorno de sucesso em `status` e de falha em `alert`;
- aba Save sem save aberto mostra estado vazio com link para Início; save não editável desabilita campos e ações;
- fechar com alterações não salvas abre `ConfirmationAlertDialog` destrutivo antes de descartar.

## Composition

Compõe `ui-dialog`, `ui-tabs`, `ui-input`, `ui-textarea`, `SelectField`, `Checkbox`, `Button` e `ConfirmationAlertDialog`. Validação e normalização vêm de `@/lib/domain/professional-profile`; leitura, gravação e sincronização pertencem ao consumidor via callbacks assíncronos.

## Content rules

Rótulos em português, campos opcionais vazios são gravados como ausentes, Instagram é normalizado para `@usuario`, site recebe `https://` quando omitido e o e-mail de acesso nunca é editável aqui.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`src/app/navigation/SidebarNavigationAdapter.tsx`, acionado pelo item "Configurações" do menu de conta da sidebar.

## Acceptance criteria

- foco, título, Escape e retorno ao gatilho obedecem ao contrato de overlays;
- nenhuma gravação ocorre com campos inválidos;
- alterações não salvas exigem confirmação antes de fechar;
- tokens, tipografia e primitivos permanecem inalterados.

## Implementation status

Implementado em `organism`; substitui o modal vazio de Configurações e está reconciliado no registry.
