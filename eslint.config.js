// eslint.config.js
// @ts-check

const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-config-prettier");
const nx = require("@nx/eslint-plugin");

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
      ".nx/**",
    ],
  },

  {
    files: ["**/*.js"],
    extends: [eslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "script",
      globals: {
        module: "readonly",
        require: "readonly",
      },
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
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': ['error', {
        enforceBuildableLibDependency: true,
        allow: [],
        depConstraints: [
          { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util', 'type:entity'] },
          { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:util', 'type:entity'] },
          { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:entity', 'type:util'] },
          { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:entity'] },
          { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
          { sourceTag: 'type:entity', onlyDependOnLibsWithTags: ['type:entity'] },
          { sourceTag: 'scope:auth', onlyDependOnLibsWithTags: ['scope:auth', 'scope:shared'] },
          { sourceTag: 'scope:articles', onlyDependOnLibsWithTags: ['scope:articles', 'scope:shared'] },
          { sourceTag: 'scope:projects', onlyDependOnLibsWithTags: ['scope:projects', 'scope:shared'] },
          { sourceTag: 'scope:shell', onlyDependOnLibsWithTags: ['scope:shell', 'scope:shared', 'scope:auth'] },
          { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
        ],
      }],
      'no-restricted-imports': ['error', { patterns: [{ group: ['@blog/*/*/*'], message: 'Use the library public API.' }] }],
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
