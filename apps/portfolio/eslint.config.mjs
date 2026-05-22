import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: "readonly",
        JSX: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "error",
      "no-useless-catch": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      // react-hooks 7 added a batch of strict rules that catch real patterns
      // but flipping every offender at once is out of scope. Re-enable
      // incrementally as we refactor.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
      "react-hooks/unsupported-syntax": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react/display-name": "off",
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never" },
      ],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/exports": "warn",
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            ["^@?\\w", "^\\u0000"],
            ["^.+\\.s?css$"],
            ["^@/lib", "^@/hooks"],
            ["^@/data"],
            ["^@/components", "^@/container"],
            ["^@/store"],
            ["^@/"],
            [
              "^\\./?$",
              "^\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\.\\.(?!/?$)",
              "^\\.\\./\\.\\./?$",
              "^\\.\\./\\.\\.(?!/?$)",
              "^\\.\\./\\.\\./\\.\\./?$",
              "^\\.\\./\\.\\./\\.\\.(?!/?$)",
            ],
            ["^@/types"],
            ["^"],
          ],
        },
      ],
    },
  },
  prettierConfig,
];
