import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1) JS/TS 共通推奨
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2023,
      },
    },
  },
  // 2) TypeScript 追加ルール
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: tseslint.configs.recommended.rules,
  },
]);
