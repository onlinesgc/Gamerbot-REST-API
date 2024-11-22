import eslint from "@eslint/js";
// import prettier from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { ignores: ["**/dist/*"] },
  { languageOptions: { globals: globals.node } },
  { plugins: { tseslint } },
  {
    rules: {
      "@typescript-eslint/naming-convention": "warn",
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
];
