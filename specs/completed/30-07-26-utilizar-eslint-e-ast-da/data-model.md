# Data Model & Contracts: Atomic Design Auditor

## Audit Report Data Model (JSON Schema Output)

```json
{
  "timestamp": "ISO-8601 string",
  "summary": {
    "totalFilesScanned": 45,
    "compliantFiles": 40,
    "nonCompliantFiles": 5,
    "totalViolations": 12,
    "complianceScorePercentage": 88.89
  },
  "violations": [
    {
      "file": "src/app/pacientes/page.tsx",
      "line": 42,
      "column": 15,
      "type": "RESTRICTED_HTML_TAG",
      "element": "button",
      "suggestedReplacement": "Button (from '@/components/ui/button')",
      "snippet": "<button className=\"px-4 py-2\">Salvar</button>"
    },
    {
      "file": "src/components/organisms/Header.tsx",
      "line": 88,
      "column": 10,
      "type": "INLINE_STYLE",
      "element": "div",
      "suggestedReplacement": "Use Tailwind classes or design system spacing tokens",
      "snippet": "<div style={{ marginTop: '20px' }}>"
    }
  ]
}
```

## ESLint AST Rule Selector Mapping

| Violation Type | AST Selector / Pattern | Action |
| --- | --- | --- |
| Restricted Tag: `<button>` | `JSXOpeningElement > JSXIdentifier[name="button"]` | Error: "Use Atomic Design <Button> from @/components/ui/button" |
| Restricted Tag: `<input>` | `JSXOpeningElement > JSXIdentifier[name="input"]` | Error: "Use Atomic Design <Input> from @/components/ui/input" |
| Restricted Tag: `<select>` | `JSXOpeningElement > JSXIdentifier[name="select"]` | Error: "Use Atomic Design <Select> from @/components/ui/select" |
| Restricted Tag: `<textarea>` | `JSXOpeningElement > JSXIdentifier[name="textarea"]` | Error: "Use Atomic Design <Textarea> from @/components/ui/textarea" |
| Inline Style: `style={...}` | `JSXAttribute[name.name="style"]` | Warning/Error: "Inline styles break Design System token standards." |
