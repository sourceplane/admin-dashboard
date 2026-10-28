import { defineConfig } from "vitest/config";
import * as path from "node:path";

const web = path.resolve(__dirname, "../../apps/web");

export default defineConfig({
  resolve: {
    alias: {
      // The modules under test import @opennextjs/cloudflare and next/server
      // through apps/web's own copies; pointing the tests at those same copies
      // is what makes `vi.mock("@opennextjs/cloudflare")` apply to them, and
      // the request a test builds the class Auth.js itself reads.
      "@opennextjs/cloudflare": path.resolve(web, "node_modules/@opennextjs/cloudflare"),
      "next/server": path.resolve(web, "node_modules/next/server.js"),
      // `import 'server-only'` throws outside React's server bundle; these
      // tests ARE the server.
      "server-only": path.resolve(__dirname, "src/server-only.ts"),
      "@": web,
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
    server: {
      deps: {
        // next-auth imports `next/server` with no extension, which Node's own
        // ESM loader cannot resolve in a package without an exports map (a
        // bundler — Next's, here vite's — can). Inlined, its imports go
        // through the aliases above.
        inline: [/next-auth/],
      },
    },
  },
});
