import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  // Apply to all JS/TS files
  ...compat.extends("next/core-web-vitals", "prettier"),
  
  {
    plugins: {
      prettier: await import("eslint-plugin-prettier").then(m => m.default),
    },
    
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "error"
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/node_modules/",
      "**/.next/",
      "**/out/",
      "**/public/",
      "**/coverage/",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/__tests__/**",
      "**/dist/",
      "**/build/"
    ]
  }
];