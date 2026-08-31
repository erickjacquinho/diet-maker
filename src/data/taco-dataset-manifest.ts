export const TACO_DATASET_MANIFEST = {
  sourceType: 'SYSTEM_TACO',
  name: 'Tabela Brasileira de Composição de Alimentos',
  version: 'TACO-4.0',
  recordCount: 597,
  bundledFile: 'src/data/taco_database.json',
} as const;

export type TacoDatasetManifest = typeof TACO_DATASET_MANIFEST;
