# 07. Segurança, Privacidade LGPD e Validação

**Status:** Aprovado  
**Documento Anterior:** [06. Lastro Online, Fila Outbox e Migração Supabase](./06-lastro-online-outbox-e-supabase.md)  
**Próximo Documento:** [08. Testes, Desempenho e Homologação](./08-testes-performance-e-homologacao.md)

---

## 1. Privacidade Médica e Conformidade com a LGPD

Dados de saúde (peso, medidas corporais, histórico dietético, observações clínicas) são classificados como **dados pessoais sensíveis** pela Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

### Garantias do Modelo Local:
1. **Soberania Total do Usuário**: Nenhum dado do paciente é transmitido a servidores remotos ou analytics de terceiros.
2. **Custódia Física**: O nutricionista é o único detentor do banco de dados e dos arquivos `.nutridiet`.
3. **Direito ao Esquecimento / Exclusão**: A exclusão de um paciente no software remove imediatamente e permanentemente todos os registros, avaliações e dietas vinculadas do banco local.

---

## 2. Validação Rigorosa de Esquemas (Zod)

Todas as entradas do usuário e cargas de arquivos passam por validação estrita com esquemas Zod antes de ingressar no motor de banco de dados.

```typescript
// Exemplo de Schema Zod para Paciente
export const PatientSchema = z.object({
  id: z.string().min(1),
  code: z.string().optional(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.number().int().min(1).max(120),
  gender: z.string().min(1),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  targetKcal: z.number().int().positive(),
  targetProtein: z.number().nonnegative(),
  targetCarbs: z.number().nonnegative(),
  targetFats: z.number().nonnegative(),
  objective: z.string().min(1),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  initials: z.string().min(1).max(4)
});
```

---

## 3. Integridade Criptográfica do Arquivo `.nutridiet`

Para evitar corrupção acidental ou adulteração indevida do arquivo de perfil:
- Ao exportar, o sistema calcula o hash **SHA-256** de todo o payload do banco e o insere no cabeçalho do manifesto.
- Ao importar, o hash é recalculado e comparado. Se houver divergência de bytes, o sistema bloqueia a importação e alerta o usuário sobre integridade comprometida.

---

## 4. Auditoria e Rastreabilidade Clínica

O sistema mantém carimbos temporais auditáveis em todas as operações:
- `created_at` e `updated_at` em todas as tabelas.
- `lastActivity` no paciente (`type: 'diet' | 'assessment'`, `at: ISO_DATE`), permitindo ordenar a lista de pacientes pela última interação clínica realizada no consultório.

---

## Próximos Passos
Consulte os critérios de testes e homologação em [08. Testes, Desempenho e Homologação](./08-testes-performance-e-homologacao.md).
