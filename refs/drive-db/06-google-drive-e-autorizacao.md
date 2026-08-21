# 06 — Google Drive, Autorização e Layout Remoto

## Modelo de autorização

- Google Identity Services OAuth token model no navegador.
- Access token permite chamadas REST/CORS ao Drive.
- Não existe login interno.
- Não existe refresh token por usuário no backend.
- Access token é curto e fica apenas em memória.
- Renovação usa `requestAccessToken()` acionado pelo usuário.
- OAuth Client ID é público; client secret é proibido no browser.

## Escopo

MVP usa:

```text
https://www.googleapis.com/auth/drive.file
```

Escopos `drive`, `drive.readonly` e metadata amplos são proibidos sem novo ADR, revisão de privacidade e avaliação de verificação Google.

## Ciclo da autorização

1. Usuário aciona `Conectar Google Drive`.
2. Google exibe account chooser/consent.
3. App recebe access token em memória.
4. App descobre/provisiona workspace.
5. Sync é habilitado.
6. Token expirado pausa chamadas e mantém outbox.
7. Nova ação do usuário renova acesso.
8. Revogação desconecta remoto sem apagar local.

## Descoberta do workspace

- Buscar apenas arquivos acessíveis ao app.
- Identificar pasta/manifest por `appProperties` e formato válido.
- Não depender do nome `NutriDiet` para identidade.
- Nenhum encontrado: oferecer criação.
- Um encontrado: validar e conectar.
- Vários encontrados: mostrar seletor.
- Manifest inválido: quarentena/recuperação, sem criação silenciosa.
- Conta errada: manter workspace local isolado e pedir correção.

## Provisionamento idempotente

1. Gerar `workspaceId` UUID.
2. Verificar novamente existência para evitar retry duplicado.
3. Criar pasta raiz.
4. Criar subpastas necessárias.
5. Criar manifest.
6. Gravar IDs em `remoteRefs`.
7. Se falhar no meio, retomar usando appProperties; não duplicar.

## Árvore remota

```text
NutriDiet/
├── nutridiet.workspace.json
├── profile/
│   ├── professional-profile.json
│   ├── workspace-settings.json
│   ├── ui-preferences.json
│   └── assets/<assetId>.<ext>
├── patients/<patientId>/
│   ├── patient.json
│   ├── assessments/<assessmentId>.json
│   └── diets/<dietId>.diet.json
├── library/
│   ├── recipes/<recipeId>.json
│   ├── presets/<presetId>.json
│   ├── ready-meals/<readyMealId>.json
│   ├── custom-foods/<foodId>.json
│   ├── favorites.json
│   └── custom-objectives.json
├── backups/
└── conflicts/
```

## Regras de layout

- Nome de paciente nunca aparece no path.
- Um arquivo tem um parent.
- Paths são estratégia do módulo.
- IDs Drive ficam em metadado local, não payload clínico.
- App não cria compartilhamentos.
- Compartilhamento externo detectado gera alerta.
- `conflicts` preserva versões concorrentes.
- `backups` recebe snapshot antes de migration destrutiva/restauração.
- Retenção automática de backups está fora do MVP.

## appProperties

Cada recurso criado deve declarar, quando aplicável:

- `nutridietWorkspaceId`
- `nutridietDocumentType`
- `nutridietModuleId`
- `nutridietEntityId`
- `nutridietSchemaVersion`

São metadados de descoberta; conteúdo validado continua no envelope.

## Manifest

```json
{
  "app": "nutridiet",
  "documentType": "workspace-manifest",
  "formatVersion": 1,
  "workspaceId": "018f0000-0000-7000-8000-000000000000",
  "createdAt": "2026-08-04T12:00:00.000Z",
  "updatedAt": "2026-08-04T12:00:00.000Z",
  "modules": {
    "professional-profile": 1,
    "patients": 1,
    "assessments": 1,
    "diets": 1,
    "recipes": 1,
    "presets": 1,
    "ready-meals": 1,
    "custom-foods": 1,
    "favorites": 1,
    "custom-objectives": 1
  }
}
```

Manifest não contém token, e-mail obrigatório, lista completa de entidades ou dados clínicos. Índice global mutável seria hotspot; listagens são reconstruíveis.

## Operações Drive

Adapter deve suportar:

- `files.list` para descoberta;
- `files.get` para metadado/conteúdo;
- `files.create` para pasta/documento;
- `files.update` para conteúdo/metadado;
- mover para trash, sem hard delete;
- `changes.getStartPageToken/list` para incremental;
- revisões/metadados para conflito e recuperação.

Uploads JSON podem usar multipart; assets maiores podem exigir resumable upload no futuro.

## Vercel e Google Cloud

- Projeto Google Cloud exclusivo de produção.
- Habilitar Drive API.
- Configurar consent screen, domínio, privacidade e suporte.
- OAuth Web Client com origens explícitas.
- Client IDs separados por ambiente quando necessário.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` apenas para ID público.
- Localhost e domínio estável autorizados.
- Não liberar previews dinâmicos indiscriminadamente.
- HTTPS obrigatório.
- CSP/COOP compatíveis com popup Google.
- Nenhuma Vercel Function recebe documento clínico no MVP.

## Proibições

- Token em localStorage/IndexedDB/arquivo/log/query string.
- Client secret no bundle.
- Proxy clínico pela Vercel.
- Scope amplo por conveniência.
- Usar nome da pasta como chave.
- Recriar arquivo automaticamente após `404` sem diagnosticar.

## Critérios

- Workspace pode ser localizado em dispositivo novo.
- Provisionamento repetido não duplica.
- Token expirado não perde outbox.
- Conta errada não mistura dados.
- Arquivos são privados por padrão e paths não contêm PII.

## Referências

- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/api/guides/folder
- https://developers.google.com/workspace/drive/api/guides/about-changes
