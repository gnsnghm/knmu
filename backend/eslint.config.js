import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1) 推奨ルール
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
  },
  // 2) Jest グローバル
  {
    files: ["**/__tests__/**/*.{js,mjs,cjs}", "**/*.test.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
