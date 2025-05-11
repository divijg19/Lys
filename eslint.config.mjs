import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compat adapter to use old-style config extensions
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Base and plugin configs
  ...compat.extends(
    "next/core-web-vitals",              // Next.js performance rules
    "plugin:react/recommended",          // React best practices
    "plugin:react-hooks/recommended",    // React hooks linting
    "plugin:jsx-a11y/recommended",       // Accessibility rules
    "plugin:prettier/recommended"        // Prettier formatting as ESLint rules
  ),

  // TypeScript-specific settings
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  },

  // Global language & React config
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly", // Needed for JSX without imports
        JSX: "readonly",   // For new JSX transform
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },
];
