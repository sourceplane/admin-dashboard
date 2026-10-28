import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Upstream code as written: `let` for bindings it never reassigns, and
    // shadcn/ui's members-less `interface InputProps extends …` and its
    // Button's `formAction?: any`.
    rules: {
      "prefer-const": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  globalIgnores([".next/**", ".open-next/**", "next-env.d.ts", "cloudflare-env.d.ts"]),
]);
