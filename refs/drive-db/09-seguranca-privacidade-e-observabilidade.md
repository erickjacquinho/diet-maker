# 09 — Segurança, Privacidade e Observabilidade

## Classificação

Dados de pacientes e prescrições são dados de saúde e devem ser tratados como dados pessoais sensíveis. Este PRD não substitui revisão jurídica, mas impõe controles técnicos mínimos.

## Fluxo de dados

```text
Dados clínicos:
React → Application → IndexedDB → Google Drive

Autorização:
Google Identity → access token em memória → Drive REST

Proibido:
Dados clínicos → Vercel Function/analytics/log externo
```

## Tokens e credenciais

- Access token somente em memória.
- Nunca usar localStorage, IndexedDB, cookie legível por JS, arquivo ou log.
- Client ID pode ser público.
- Client secret nunca no browser.
- Token nunca em query string.
- Revogação pausa remoto sem apagar local.
- CSP limita origens necessárias.

## Princípio de menor privilégio

- `drive.file` no MVP.
- App acessa apenas arquivos usados/criados por ele.
- Escopo amplo exige novo ADR.
- Não criar permissão de compartilhamento.
- Não modificar permissão automaticamente.

## Compartilhamento

- Verificar quando possível se pasta/documento foi compartilhado.
- Alertar compartilhamento externo/público.
- Não listar dados clínicos no alerta.
- Usuário corrige no Drive.
- Filhos podem herdar permissão do parent; o alerta deve explicar.

## Minimização

- Persistir apenas campos necessários ao produto.
- TACO não é duplicada.
- Índices/caches não são exportados.
- Não usar e-mail como ID.
- Não colocar nome do paciente em filename/path.
- Assets profissionais separados.

## Exclusão e recuperação

- Delete começa como tombstone.
- Drive usa trash.
- Hard delete automático proibido.
- Logout/revogação não deleta.
- Exportação e restauração permanecem disponíveis.
- Retenção definitiva precisa de política futura.

## Integridade

- Runtime schema.
- SHA-256 do payload canônico.
- Migrations controladas.
- Quarentena para inválidos.
- Revisão-base para concorrência.
- Backup antes de operação destrutiva.

## Criptografia

- Transporte usa HTTPS.
- Drive aplica proteções da plataforma do usuário.
- Criptografia client-side não faz parte do MVP.
- Adicioná-la exige gestão de chave, recuperação, rotação, multi-dispositivo e impacto em busca.
- Nunca derivar chave de access token.

## Logs permitidos

- module ID;
- tipo de operação;
- duração;
- status/código seguro;
- tamanho aproximado;
- retries;
- schema version;
- HTTP status.

## Logs proibidos

- nome/e-mail/ID externo de paciente;
- payload de dieta/avaliação/receita;
- observações clínicas;
- access token;
- conteúdo bruto da quarentena;
- URL que contenha credencial.

## Telemetria

MVP pode manter diagnóstico local. Telemetria remota exige:

- consentimento/finalidade;
- minimização;
- endpoint e retenção documentados;
- teste que prove ausência de PII;
- atualização deste documento e do aviso de privacidade.

## Erros

UI recebe código sanitizado. Detalhe técnico pode permanecer em memória/dev mode sem payload. Mensagens precisam indicar ação:

- reconectar;
- tentar depois;
- exportar backup;
- corrigir permissão;
- atualizar app;
- revisar conflito.

## Google Cloud/Vercel

- Consent screen com identidade, suporte e privacidade.
- Authorized origins explícitas.
- Variável pública somente para client ID.
- HTTPS obrigatório.
- Preview não recebe credencial de produção indiscriminadamente.
- Headers CSP/COOP testados.

## Incidente

Runbook mínimo deve cobrir:

1. revogar OAuth client/token;
2. pausar sync sem apagar IndexedDB;
3. orientar exportação;
4. identificar versões afetadas sem coletar payload;
5. corrigir e publicar;
6. restaurar por backup/revisão;
7. registrar incidente conforme obrigações aplicáveis.

## Testes obrigatórios

- busca automatizada por token em storages;
- inspeção de rede comprovando ausência de payload na Vercel;
- logs sem PII;
- scope exato;
- pasta compartilhada;
- token expirado/revogado;
- conta Google errada;
- arquivo adulterado/checksum inválido;
- CSP/popup em produção.

## Critérios

- Nenhum token persistido.
- Nenhum documento clínico chega à Vercel.
- Nenhum filename contém PII.
- Scope mínimo validado.
- Erro/log não expõe payload.
- Compartilhamento externo é sinalizado.
- Aviso de privacidade atualizado antes do lançamento.

## Referência legal

- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
