// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "storybook-static"] },
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
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-case-declarations": "off",
      "no-useless-escape": "off",
    },
  },
  // Storybook config
  {
    ...storybook.configs["flat/recommended"][0],
    rules: {
      ...storybook.configs["flat/recommended"][0]?.rules,
      "storybook/no-renderer-packages": "off",
    },
  },
  // Allow hooks in storybook render functions and example functions
  {
    files: ["**/*.stories.{ts,tsx}", "**/use-*.tsx", "**/use-*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  }
);
