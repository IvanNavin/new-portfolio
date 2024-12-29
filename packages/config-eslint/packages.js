const { whitelist } = require("./constants");

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: "18.2",
    },
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "simple-import-sort",
    "unused-imports",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:tailwindcss/recommended",
    "plugin:react/recommended",
  ],
  rules: {
    "tailwindcss/no-custom-classname": [
      "warn",
      {
        whitelist,
        config: "./tailwind.config.ts",
        cssFiles: [
          "**/*.css",
          "**/*.scss",
          "!**/node_modules",
          "!**/.*",
          "!**/dist",
          "!**/build",
        ],
      },
    ],
    "no-unused-vars": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-useless-catch": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "off",

    "react/display-name": "off",
    "react/jsx-curly-brace-presence": [
      "warn",
      { props: "never", children: "never" },
    ],

    //#region  //*=========== Unused Import ===========
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unused-expressions": "off",
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
    //#endregion  //*======== Unused Import ===========

    //#region  //*=========== Import Sort ===========
    "simple-import-sort/exports": "warn",
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // ext library & side effect imports
          ["^@?\\w", "^\\u0000"],
          // {s}css files
          ["^.+\\.s?css$"],
          // Lib and hooks
          ["^@/lib", "^@/hooks"],
          // static data
          ["^@/data"],
          // components
          ["^@/components", "^@/container"],
          // zustand store
          ["^@/store"],
          // Other imports
          ["^@/"],
          // relative paths up until 3 level
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
          // other that didnt fit in
          ["^"],
        ],
      },
    ],
    //#endregion  //*======== Import Sort ===========
  },
  globals: {
    React: true,
    JSX: true,
  },

  overrides: [
    {
      files: ["**/*.config.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
