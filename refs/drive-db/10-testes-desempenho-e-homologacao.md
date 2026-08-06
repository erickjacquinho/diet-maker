# 10 — Testes, Desempenho e Homologação

## Estratégia

Testar invariantes de domínio, contratos de módulos/adapters e cenários distribuídos. Mock unitário isolado não homologa sincronização.

## Unit tests

- schemas válidos/inválidos;
- serializer/deserializer round-trip;
- migrations por versão;
- JSON canônico/checksum;
- conflito por módulo;
- compactação da outbox;
- idempotência;
- classificação de erro/retry;
- normalização UTC/UUID.

## Contract tests de módulo

Todo módulo passa pela mesma suíte:

- create/read/update/list/tombstone;
- rejeitar payload inválido;
- migrar fixture antiga;
- export/import sem perda;
- detectar stale revision;
- retry sem duplicação;
- isolar falha do módulo.

## Contract tests de adapters

### LocalDocumentStore

- transação atômica;
- rollback;
- índices;
- quota/falha;
- upgrade de versão;
- concorrência entre abas.

### RemoteDocumentStore

- discovery/provision idempotente;
- create/update/get/list/trash;
- metadata/revision;
- changes/paginação;
- classificação HTTP;
- conta/permissão incorreta.

## Integration tests

- IndexedDB real ou ambiente compatível.
- Documento + outbox na mesma transação.
- Crash entre commit e push.
- Retomada após token expirado.
- Drive `401/403/404/429/5xx`.
- Arquivo movido/removido manualmente.
- Dois dispositivos simulados.
- Duas abas drenando outbox.
- Migração de todas as chaves.
- Restauração integral.

## End-to-end

1. Conectar conta Google de teste.
2. Provisionar workspace.
3. Criar paciente/dieta offline.
4. Reconectar e verificar Drive.
5. Abrir segundo perfil de navegador.
6. Hidratar os mesmos dados.
7. Provocar conflito no mesmo paciente.
8. Confirmar preservação das versões.
9. Exportar backup.
10. Apagar cache local.
11. Restaurar.
12. Revogar Google sem perder local.

## Matriz de perda de dados

Interromper processo:

- antes do commit;
- entre documento/outbox (deve ser impossível por transação);
- após commit;
- durante upload;
- após upload antes da conclusão local;
- durante pull;
- durante migration;
- durante restauração;
- durante troca de líder multiaba.

Resultado permitido: rollback ou retomada idempotente. Nunca estado confirmado parcialmente.

## Matriz de conflitos

- computadores editam pacientes diferentes;
- mesmo paciente, campos diferentes;
- mesma dieta;
- avaliação com IDs distintos;
- mesmo ID de avaliação;
- delete remoto x update local;
- migration remota x cliente antigo;
- favorites concorrentes;
- UI preferences concorrentes.

## Desempenho

| Métrica | Meta |
|---|---:|
| Read local de entidade p95 | ≤ 50 ms |
| Save local transacional p95 | ≤ 150 ms |
| Listar 1.000 pacientes p95, sem render | ≤ 300 ms |
| Iniciar push após alteração compactável | ≤ 2 s |
| Documento JSON preferencial | < 1 MB |

Bootstrap conhecido deve ser incremental quando cursor válido. Testes registram hardware/browser/rede.

## Compatibilidade

- Browsers desktop oficialmente suportados devem ser definidos no plano.
- IndexedDB, BroadcastChannel, service worker e popup Google devem ser testados.
- Fallback sem Web Locks deve manter idempotência.
- SSR/hydration não pode ler browser APIs no servidor.

## Gates por etapa

### Fundação local

- Nenhuma gravação clínica nova em localStorage.
- Save/outbox atômicos.
- Crash matrix local aprovada.
- Export integral funcional.

### Drive

- Scope/token corretos.
- Provisionamento idempotente.
- Dois dispositivos convergem sem concorrência.
- Erros Google tratados.

### Conflitos

- 100% da matriz detectada conforme policy.
- Nenhuma sobrescrita clínica silenciosa.
- Versões preservadas.

### Lançamento

- Migração reconciliada.
- Restauração limpa aprovada.
- Testes de segurança aprovados.
- ADR/PRD/privacidade atualizados.

## Launch gates completos

- Todas as chaves legadas mapeadas.
- Todos os módulos com contract tests.
- Matriz crash/concorrência aprovada.
- Nenhum token persistido.
- Nenhum clínico enviado à Vercel.
- OAuth produção configurado.
- Export/restauração verificados.
- Rollback documentado.

## Relatório de homologação

Deve registrar:

- commit/build;
- browsers;
- fixtures/volumes;
- métricas p50/p95;
- cenários executados;
- falhas conhecidas;
- evidência de rede/segurança;
- decisão go/no-go.

## Dependências

- [05-persistencia-local-e-save.md](./05-persistencia-local-e-save.md)
- [07-sincronizacao-e-conflitos.md](./07-sincronizacao-e-conflitos.md)
- [09-seguranca-privacidade-e-observabilidade.md](./09-seguranca-privacidade-e-observabilidade.md)
