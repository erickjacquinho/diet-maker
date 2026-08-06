# ADR-001: Escopo do Produto e Foco na Agilidade da Consulta

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
O software NutriDiet destina-se a nutricionistas que necessitam criar e adaptar dietas personalizadas para pacientes durante ou logo após a consulta clínica/esportiva. Atualmente, nutricionistas perdem tempo com softwares genéricos lentos ou planilhas de cálculo manual.

## Decisão
Focar 100% o produto em um **Aplicativo Local de Criação e Escala Rápida de Dietas**, priorizando:
1. Tempo de elaboração de dieta < 5 minutos por paciente.
2. Cálculo em tempo real de macronutrientes x metas manuais.
3. Copiar e colar instantâneo para WhatsApp e geração rápida de PDF.
4. Escala percentual em lote de gramaturas.

**Não faz parte do escopo inicial (Non-Goals)**:
- Prontuário eletrônico completo ou anamnese médica estendida.
- Gestão financeira de consultório, emissão de notas ou agendamento de consultas.
- Aplicativo/Login de acesso direto para pacientes.
- Interface mobile ou tablet; o produto será desenvolvido exclusivamente para desktop, a partir de `1024px`.

## Consequências
- A interface é otimizada para velocidade, atalhos visuais e poucos cliques.
- Layouts e componentes serão especificados para desktop; mobile e tablet não terão experiências dedicadas.
- Sem dependência de infraestrutura em nuvem complexa ou mensalidades.
