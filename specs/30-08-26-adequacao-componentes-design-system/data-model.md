# Data model: inventário e evidência

Não há tabela, migração, formato .diet, entidade clínica ou persistência nova.

## ComponentRecord

Usa o schema vigente de design-system/components/registry.json: id, name,
nature, lifecycle, currentLayer, targetLayer, primaryCategory, traits,
sourceFiles, publicExports, profile, consumers, primitiveBase, specStatus,
exceptions. IDs existentes são preservados; IDs novos representam componentes
já existentes sem cobertura, não funções novas.

Regras: categoria única, traits existentes/compatíveis, source real e layer
real, exports completos e fontes compartilhadas com papel correto. Declaração
de homologação documental depende de perfil completo; código conforme depende
de testes/revisão separadamente.

## SourceRecord e PublicExport

SourceRecord: path, role (implementation, reexport ou compound-family) e
discoveredLayer. PublicExport: name, kind e documentedBy conforme schema atual.
Um caminho não pode fingir ser alias quando contém lógica distinta.
Exports auxiliares de tipos também precisam de cobertura.

## ComponentProfile

As doze seções são as do contrato vigente. Referenciar categoria/fundamentos;
não duplicar matrizes, escalas ou valores. Composição não é herança múltipla.
Exceções: nenhuma nova admitida por esta feature.

## FindingRecord (artefato de execução)

Campos documentais: code, target, source/line, baseline, cause, resolution,
tests, currentStatus, scope, concurrentChange. Status: observed → reproduced →
addressed → verified; outside-scope fica separado e nunca conta como resolvido.

## ValidationEvidence (artefato de execução)

Comando, diretório, data, exit, resumo, fixture/viewport quando aplicável e
requisito coberto. Evidência visual usa apenas dados sintéticos.
ProtectedSnapshot guarda path/hash e diferenças de campos protegidos do registry.

## Proteção dos modelos existentes

DietPlan, HistoricalDiet, PreviousDietSummary, FoodItem, Recipe, BodyAssessment
e PatientListRow permanecem pertencendo ao domínio/aplicação atual. Recebê-los
ou ajustar import de componente não autoriza alterar modelo, valores, snapshots,
arquivamento, drafts ou banco. Diferenças entre contratos legados são preservadas
ou removidas somente após comprovar ausência de consumidores.

