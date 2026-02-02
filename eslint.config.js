import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import hooksOrder from "eslint-plugin-hooks";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
      "hooks": hooksOrder,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",

            "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "hooks/sort": [
        "error",
        {
    groups: [
      // 1. Paquetes: react primero, luego otros
      ["^react", "^@?\\w"],
      // 2. Alias: componentes, hooks, etc.
      ["^@(/.*|$)"],
      // 3. Relativos: archivos arriba (../) y locales (./)
      ["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
      // 4. Estilos
      ["^.+\\.s?css$"]
    ]
        }
      ],
    },
  },
);
