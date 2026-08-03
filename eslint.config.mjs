import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    // Atomic Design Compliance rules for pages, organisms, molecules, templates
    files: ["src/**/*.{jsx,tsx}"],
    ignores: ["src/components/ui/**", "src/components/atoms/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXOpeningElement[name.name='button']",
          message: "🚫 Atomic Design Violation: Evite usar <button> bruto fora dos átomos. Use o componente <Button> de '@/components/ui/button'.",
        },
        {
          selector: "JSXOpeningElement[name.name='input']",
          message: "🚫 Atomic Design Violation: Evite usar <input> bruto fora dos átomos. Use o componente <Input> de '@/components/ui/input'.",
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: "🚫 Atomic Design Violation: Evite usar <select> bruto fora dos átomos. Use o componente <Select> de '@/components/ui/select'.",
        },
        {
          selector: "JSXAttribute[name.name='style']",
          message: "⚠️ Design Token Warning: Evite o uso de 'style={{ ... }}' inline. Utilize classes Tailwind CSS ou tokens de design.",
        },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "**/*.min.js",
    ],
  },
];
