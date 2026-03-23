import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // console.log 커밋 금지 (error/warn은 허용)
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },
  {
    // seed 스크립트는 CLI 실행용이므로 console.log 허용
    files: ["src/db/seed/**", "scripts/**"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
