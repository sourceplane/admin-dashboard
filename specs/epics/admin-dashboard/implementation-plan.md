# admin-dashboard — implementation plan

Three milestones, each one reviewed pull request (AD0 is the repository's
first commit and its spec), each green before it merges.

## AD0 — the spec (AD-1)

The repository is born: `intent.yaml` with the placeholder workspace
`ws_CHANGE_ME`, `ci.yml` (byte for byte turso-starter's, with the comment
lines postgres-drizzle-starter's own copy changes), the shared TypeScript
and ESLint configuration, the wiring renderer and migration helpers, the
spec index, this doc set and the task contracts.

## AD1 — the dashboard on Workers and Supabase (AD-2)

- The template in `apps/web` on Next.js 16.3.8: `lib/db.ts`'s queries over
  `getDb()` (`lib/sql.ts`, a client per request through `HYPERDRIVE`), the
  schema in `lib/schema.ts` with `.enableRLS()`, `middleware.ts` as
  `proxy.ts`, Vercel Analytics removed, `images.unoptimized`, ESLint in
  eslint-config-next 16's flat form.
- Auth.js resolved per request (`lib/auth.ts`): the session key from
  `lib/auth-secret.ts`, GitHub from `lib/github.ts` only when its OAuth App
  is set; `/login` says how to connect it until then.
- `lib/site.ts` (the name seam), `app/api/health/route.ts`.
- `wrangler.template.jsonc` + `wiring.fixture.json`, `component.yaml`
  (the GitHub keys as optional secrets, the smoke).
- `packages/db`: `010_products`, `020_row_level_security`,
  `030_seed_products`, `040_app_secrets`, and their drizzle-kit twins; the
  Supabase and Hyperdrive roots; `infra/db-migrate`.
- `tests/web` (the client, the queries, the session key, Auth.js's sessions
  and providers, the login page, the health check, the wrangler config) and
  `tests/db` (the manifest, the twins, the seed and the key, row-level
  security, on PGlite).

## AD2 — a baseline (AD-3)

postgres-drizzle-starter's machinery on this tree: `blueprint.yaml`,
`repo-blueprint.yaml` (five brokered keys), `.baseline/` (identity, the
product's README with "Connecting GitHub sign-in", task contracts), the
rename engine (the template's Vercel page masked), the bootstrap helpers,
the record renderer (probing `/`, `/api/health` and `/api/auth/providers`),
`docs/phases/`, the context pack, and `testing/` — the leak and placement
gates (the GitHub refs optional in the product's own plan), and the e2e tier
that migrates the stage database through a stand-in Supabase API, then
serves the built Worker over it: the seeded products, both pages and the
search, the login page with GitHub not connected, a session under the
database's key, and the Data API's roles refused.
