# SavesDashboard

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-saves-dashboard` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/SavesDashboard.tsx` |
| Public exports | `SaveCatalogItem`, `SaveLocationState`, `SavesDashboardProps` (types), `SavesDashboard` (component) |

## Purpose

Apresentar saves da conta e permitir criar, importar, abrir ou localizar o arquivo local correspondente.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Compõe ações, surfaces, feedback e a molécula `DataTable` canônica; não redefine os estados ou tokens dessas categorias.

## Specific anatomy

Seção de Configurações → Saves com ações Criar/Importar e backups, total do catálogo, tabela paginada com rótulo/data/disponibilidade local/ações e área condicional para proteger uma cópia importada.

## Allowed variants

Não possui variantes. O consumidor controla a página, linhas, estado de localização e operações assíncronas.

## Particular states

Tabela anuncia loading, erro e vazio. Disponibilidade local diferencia verificação, arquivo reconhecido, arquivo não localizado, permissão necessária, referência perdida e arquivo incompatível. “Sincronizado” exige permissão, leitura e cabeçalho correspondente à associação; “Desincronizado” informa o motivo. Nenhum desses estados concede grant, afirma checkpoint atual ou cópia clínica na nuvem. Erros das ações são anunciados inline.

## Composition

Usa `DataTable`, `Badge`, `Button` e `Card`. O adaptador `src/app/navigation/useSaveManagement.tsx` consulta catálogo/associações e injeta as ações; o organismo não acessa rede, Auth, filesystem ou banco.

O backend fornece `canCreate`: criar fica desabilitado quando a conta já possui um save, durante carregamento ou em erro do catálogo. Sair permanece apenas no menu da sidebar.

A ação `onCreateRequest` solicita o diálogo de criação ao consumidor, que pausa Configurações antes de abri-lo.

## Content rules

Rótulo e data vêm do catálogo; cada ação usa rótulo e ID curto para diferenciar saves de mesmo nome. Não exibe caminho, Conta clínica, paciente, dieta ou progresso remoto. Nunca comunica “sincronizado” apenas porque existe uma referência local.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica é o campo `consumers` de `design-system/components/registry.json`.

## Acceptance criteria

- identidade, fonte, exports, consumidor e categoria coincidem com o registro;
- paginação remota usa `totalRows` e páginas de 50 sem reordenar registros;
- empty, loading, error, verificação, permissão, referência perdida e handle encontrado têm texto acessível;
- ações ficam identificadas por save, preservam erro e não atribuem grant pela localização;
- tabela segue o contrato da molécula `DataTable` e usa tokens do projeto.

## Implementation status

Implementado e homologado em `organism`: testes de componente, execução no Chrome em 1024/1280/1600 px e auditoria do contrato DS passaram. A auditoria global ainda identifica quatro exceções de perfil expiradas/incompletas e quatro perfis clínicos anteriores sem homologação documental, fora deste organismo.
