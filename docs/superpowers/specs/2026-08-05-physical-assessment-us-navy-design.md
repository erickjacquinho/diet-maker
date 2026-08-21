# Avaliação física com método US Navy — Design

## Contexto

O diálogo `Nova Avaliação Física` da página de perfil reutiliza o mesmo estado e formulário do fluxo de edição. Atualmente ele registra somente peso, BF manual, massa magra manual e cintura. A mudança precisa registrar as medidas corporais solicitadas, calcular automaticamente a composição corporal e deixar o cálculo disponível para outros consumidores da aplicação.

## Objetivo

Adicionar um cálculo reutilizável do percentual de gordura pelo método de circunferências US Navy, usando as medidas persistidas na avaliação física, e substituir os campos manuais de BF, massa gorda e massa magra por valores derivados.

## Decisões

### 1. Cálculo de domínio isolado

O cálculo viverá em `src/lib/bodyFat.ts`, sem lógica de fórmula em páginas ou componentes. A API será composta por funções puras e tipos explícitos:

```ts
export type BodyFatSex = 'male' | 'female';

export interface NavyBodyFatInput {
  sex: BodyFatSex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  abdomenCm: number;
  hipCm: number;
  weightKg: number;
}

export interface BodyCompositionResult {
  bodyFatPercent: number | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
  isValid: boolean;
  error?: string;
}

export function calculateBodyComposition(input: NavyBodyFatInput): BodyCompositionResult;
```

O método converterá centímetros para polegadas internamente. Para homens, a circunferência usada será `abdomen - neck`; para mulheres, `waist + hip - neck`. As equações são as fórmulas logarítmicas US Navy/Hodgdon-Beckett:

```text
male = 86.010 × log10(abdomenIn - neckIn)
       - 70.041 × log10(heightIn) + 36.76

female = 163.205 × log10(waistIn + hipIn - neckIn)
         - 97.684 × log10(heightIn) - 78.387
```

O resultado será arredondado a duas casas decimais. A massa gorda será `weightKg × bodyFatPercent / 100`; a massa magra será `weightKg - fatMassKg`.

Valores ausentes, não finitos, não positivos ou com circunferência composta inválida não produzirão cálculo. A função retornará `isValid: false` e uma mensagem estável para a camada de interface.

### 2. Modelo compatível com dados existentes

`BodyAssessment` receberá os campos de circunferência e `fatMassKg`. O campo atual `muscleMassKg` será mantido por compatibilidade com os registros e consumidores existentes, mas passará a armazenar a massa magra calculada. Os novos campos de medida serão opcionais no tipo para que avaliações antigas continuem podendo ser lidas; uma avaliação nova exigirá todos os campos do formulário.

Campos adicionados:

```ts
neckCm?: number;
scapulaCm?: number;
bustCm?: number;
leftArmCm?: number;
rightArmCm?: number;
abdomenCm?: number;
hipCm?: number;
leftProximalThighCm?: number;
rightProximalThighCm?: number;
leftDistalThighCm?: number;
rightDistalThighCm?: number;
leftCalfCm?: number;
rightCalfCm?: number;
fatMassKg?: number;
```

`waistCm` permanece como campo existente e representa Cintura. `abdomenCm` representa Barriga e é a medida usada pelo ramo masculino do método US Navy.

### 3. Formulário compartilhado

O diálogo de perfil continuará servindo para criar e editar. O formulário exibirá, nesta ordem:

1. Peso atual;
2. Body fat, Massa gorda e Massa magra, todos somente leitura e calculados;
3. Pescoço, Escápula, Busto, Braço esquerdo, Braço direito, Cintura, Barriga, Quadril;
4. Coxa proximal esquerda/direita, Coxa distal esquerda/direita e Panturrilha esquerda/direita.

As medidas serão informadas em centímetros. O gênero do paciente será convertido para `male` ou `female` pelo consumidor; somente esses dois valores são aceitos. Para pacientes masculinos, quadril ainda será registrado no formulário, embora não entre na equação; para pacientes femininos, a fórmula usará Cintura e Quadril.

O diálogo exibirá erro inline enquanto os dados necessários estiverem incompletos ou inválidos e bloqueará o salvamento até que a composição possa ser calculada. Valores derivados não terão controles editáveis.

### 4. Composição e compartilhamento

O componente de formulário especializado ficará em `src/components/molecules/EditAssessmentModal.tsx`, seguindo a pendência de extração já registrada no projeto. A página será responsável somente por abrir o modal, fornecer paciente/avaliação e persistir o resultado. O primitivo Shadcn em `src/components/ui` não receberá regra de negócio.

O modal será usado no perfil e o cálculo poderá ser importado diretamente por outras telas, seletores e exportadores sem duplicação da equação.

## Validação e testes

- Testes unitários cobrirão os ramos masculino e feminino, conversão cm/polegadas, arredondamento, massa gorda, massa magra e entradas inválidas.
- Teste de interação cobrirá os campos na ordem definida, valores derivados somente leitura, mensagem de erro e persistência do registro.
- Avaliações antigas sem os novos campos continuarão carregando; a edição delas exigirá completar as medidas antes de salvar.
- A validação final executará os testes direcionados, `npm run lint` e `npm run build`.

## Referência

O guia oficial de Body Composition Assessment da U.S. Navy documenta os valores de circunferência usados para homens (`abdômen - pescoço`) e mulheres (`cintura natural + quadril - pescoço`): <https://www.netc.navy.mil/Portals/46/NSTC/NROTC/docs/Guide%204-Body%20Composition%20Assessment%20%28BCA%29%20%28MAR%202021%29.pdf>.
