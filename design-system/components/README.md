# Catálogo normativo de componentes

Este diretório transforma os fundamentos globais do NutriDiet em regras reutilizáveis para componentes atuais e futuros.

## Modelo em três níveis

```text
Fundamentos globais (design-system/03–08)
                 ↓
Categorias visuais (components/categories)
                 ↓
Perfis individuais (components/profiles)
```

- **Fundamentos** definem tokens e limites universais.
- **Categorias** definem aparência, estados, interação e composição compartilhados.
- **Perfis** registram apenas identidade, anatomia específica, variantes permitidas, particularidades e exceções.

Nenhum nível inferior pode redefinir o superior. Exceções precisam seguir [category-decisions.md](./category-decisions.md).

O vocabulário fechado de tokens consumíveis está em [token-index.md](./token-index.md). Categorias e perfis não podem inventar um identificador fora desse índice.

## Dois eixos independentes

| Eixo | Responde | Fonte |
| --- | --- | --- |
| Atomic Design | Onde vive, do que depende e qual responsabilidade possui | [10 — Limites arquiteturais](../10-architecture-boundaries.md) |
| Categoria visual | Como se apresenta, reage e se compõe | [Categorias](./categories/) |

Todo componente possui exatamente uma categoria principal. Traits podem acrescentar capacidade compatível, mas nunca sobrescrever a categoria.

## Estrutura

```text
components/
├── README.md
├── category-contract.md
├── component-profile-contract.md
├── audit-contract.md
├── registry.schema.json
├── registry.json
├── token-index.md
├── category-decisions.md
├── categories/
│   ├── actions.md
│   ├── fields.md
│   ├── selection.md
│   ├── navigation.md
│   ├── surfaces.md
│   ├── data-display.md
│   ├── feedback.md
│   ├── overlays.md
│   ├── loading.md
│   ├── nutrition-domain.md
│   └── structure.md
└── profiles/
    ├── ui/
    ├── atoms/
    ├── molecules/
    ├── organisms/
    └── templates/
```

## Ordem de consulta

1. Leia os fundamentos 03–08 aplicáveis.
2. Identifique a categoria principal em [registry.json](./registry.json).
3. Leia a categoria completa.
4. Leia o perfil individual para particularidades.
5. Consulte exceções ou decisões referenciadas.

Se ainda restar uma decisão visual, a documentação está incompleta. Não escolha localmente.

## Estado e verdade implementada

O registro separa:

- `lifecycle`: existência e estágio do componente;
- `specStatus`: estágio da documentação;
- `currentLayer`: localização real;
- `targetLayer`: arquitetura desejada.

`implemented` significa apenas que existe fonte. Somente `homologated` indica contrato documental completo; não certifica que o código já foi migrado visualmente.

## Validação

```powershell
npm run verify:design-system
```

O gate cobre fontes, exports, categorias, traits, perfis, estados, tokens, links, exceções e sincronização normativa. O processo completo está em [audit-contract.md](./audit-contract.md).
