import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Large number of pre-existing `any` usages in legacy files — warn, don't block
      "@typescript-eslint/no-explicit-any": "warn",
      // Unescaped entities (&apos; etc.) are cosmetic — warn, don't block
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
