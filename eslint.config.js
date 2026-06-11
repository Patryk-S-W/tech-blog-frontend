// eslint.config.js
// @ts-check

const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "package-lock.json",
      "documentation/**",
      "e2e/**",
      "dist/**",
      "coverage/**",
      ".angular/**",
    ],
  },

  {
    files: ["**/*.js"],
    extends: [eslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "script",
    },
  },

  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-class-suffix": [
        "error",
        {
          suffixes: ["Component", "Page"],
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },

  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended, prettier],
    rules: {},
  }
);
