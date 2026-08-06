# 08 — Migração, Importação, Exportação e Backup

## Inventário legado

| Chave | Módulo destino | Regra |
|---|---|---|
| `nutridiet_patients` | `patients` | Separar array por paciente |
| `nutridiet_assessments_<patientId>` | `assessments` | Um documento por avaliação |
| `nutridiet_diets_<patientId>` | `diets` | Um por dieta; normalizar datas e preservar snapshot |
| `nutridiet_recipes` | `recipes` | Um por receita |
| `nutridiet_presets` | `presets` | Um por preset |
| `nutridiet_ready_meals` | `ready-meals` | Um por bloco |
| `nutridiet_custom_foods` | `custom-foods` | Um por alimento |
| `nutridiet_favorite_foods` | `favorites` | Conjunto validado de IDs |
| `nutridiet_custom_objectives` | `custom-objectives` | Conjunto normalizado |

## Princípios

- Migração é idempotente, versionada e retomável.
- Dados brutos são preservados antes da conversão.
- Nenhuma chave é removida no mesmo passo que migra.
- Contagem e relações devem reconciliar origem/destino.
- Item inválido não bloqueia itens válidos.
- Migração não envia remoto antes de commit local.

## Sequência

1. Detectar versão local/chaves.
2. Copiar valor bruto para backup/quarentena.
3. Criar migration record `pending`.
4. Converter por módulo em lotes.
5. Validar referências paciente/dieta/avaliação.
6. Gravar envelopes e outbox transacionalmente.
7. Registrar contagens, erros e checksum.
8. Marcar migration `locally-complete`.
9. Exportar backup ou confirmar primeiro sync.
10. Marcar `safe-to-retire-legacy`.
11. Remoção futura ocorre em tarefa separada e recuperável.

## Interrupção

- Cada lote tem checkpoint.
- Reabrir retoma a partir do último commit.
- Operação repetida reconhece entity ID já migrado.
- Falha antes de commit não avança checkpoint.
- Falha de um módulo não apaga backup bruto.
- Usuário recebe relatório, não stack trace/payload.

## Normalizações

- Datas localizadas são convertidas para ISO quando semanticamente possível.
- IDs legados válidos são preservados.
- IDs ausentes recebem UUID e mapping registrado.
- Campos opcionais recebem default explícito pelo schema.
- Valores históricos calculados são preservados quando representam prescrição emitida.
- JSON `any` é validado antes de virar domínio.

## Quarentena

Registro contém:

- chave de origem;
- módulo pretendido;
- código seguro do erro;
- timestamp;
- hash do conteúdo;
- conteúdo bruto apenas local;
- status de revisão.

Conteúdo clínico bruto não entra em logs/telemetria.

## Pacote de paciente

- Extensão `.diet`.
- Inclui paciente, dietas, avaliações e referências necessárias.
- Exclui outros pacientes e perfil profissional.
- Possui manifest, format/schema versions e checksums.
- Compatibilidade de leitura usa migrations.
- Importação pode criar novo paciente ou mesclar explicitamente.

## Backup integral

Formato técnico recomendado: ZIP.

```text
nutridiet-backup-YYYY-MM-DDTHH-mm-ssZ.zip
├── manifest.json
├── checksums.json
├── profile/
├── patients/
├── library/
├── assets/
└── conflicts/
```

Exclui:

- access token;
- device ID;
- leases;
- caches/índices reconstruíveis;
- telemetria.

Inclui conflitos não resolvidos em área própria.

## Exportação

1. Abrir snapshot consistente do IndexedDB.
2. Enumerar módulos registrados.
3. Validar/serializar.
4. Incluir assets.
5. Produzir checksums.
6. Produzir manifest.
7. Gerar arquivo.
8. Verificar arquivo gerado antes de oferecer download.

Exportação não depende do Drive.

## Restauração

1. Ler arquivo sem alterar workspace.
2. Validar ZIP/manifest/checksums.
3. Verificar versão futura.
4. Validar todos os módulos conhecidos.
5. Produzir relatório/preview.
6. Escolher `novo workspace`, `mesclar` ou `substituir`.
7. Antes de substituir, gerar backup atual.
8. Aplicar em transações/checkpoints.
9. Gerar outbox conforme destino remoto.
10. Homologar contagens e referências.

## Modos

### Novo workspace

Gera novo `workspaceId` e não toca o atual.

### Mesclar

- IDs distintos coexistem.
- Mesmo ID e mesmo checksum é idempotente.
- Mesmo ID e conteúdo diferente segue política de conflito.

### Substituir

- Exige confirmação reforçada.
- Exige backup atual verificado.
- Usa tombstones/novo workspace; não hard delete invisível.

## Backup remoto

- Revisões Drive ajudam na recuperação, mas não substituem backup integral.
- Antes de migration remota ou restauração, criar snapshot em `backups`.
- Não apagar backups automaticamente no MVP.

## Rollback da migração

- Adapter legado permanece somente leitura inicialmente.
- Chaves antigas continuam presentes.
- Falha Drive retorna modo local com outbox pausada.
- Código antigo diante de schema futuro deve recusar edição e orientar atualização.

## Critérios

- Todas as chaves inventariadas têm fixture.
- Contagens origem/destino reconciliam.
- Reexecutar migration não duplica.
- Backup integral restaura workspace vazio.
- Pacote inválido não altera estado.
- Legado não é removido prematuramente.

## Dependências

- [03-modelo-do-perfil-e-dados.md](./03-modelo-do-perfil-e-dados.md)
- [05-persistencia-local-e-save.md](./05-persistencia-local-e-save.md)
- [10-testes-desempenho-e-homologacao.md](./10-testes-desempenho-e-homologacao.md)
