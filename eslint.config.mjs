import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next",
      "coverage",
      "node_modules",
      "next-env.d.ts",
      "playwright-report",
      "test-results",
    ],
  },
  ...nextVitals,
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    settings: { react: { version: "19.3" } },
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["*.mjs", ".dependency-cruiser.cjs"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      curly: ["error", "multi-line"],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs", globals: { module: "writable" } },
  },
  {
    files: ["test/**/*.ts", "src/**/*.tsx"],
    rules: { "@typescript-eslint/explicit-module-boundary-types": "off" },
  },
);
