# admin-dashboard

Vercel's [Admin Dashboard](https://vercel.com/templates/next.js/admin-dashboard)
template ([vercel/nextjs-postgres-nextauth-tailwindcss-template](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template))
— a products table with search and paging read through Drizzle, a
customers page, and Auth.js with GitHub sign-in, in shadcn/ui and Tailwind —
running on **Cloudflare Workers + Static Assets** through
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), with the
database a **Supabase Postgres** project reached through **Cloudflare
Hyperdrive**, both provisioned by Terraform through
[Orun](https://github.com/sourceplane/orun) and the schema applied by Orun's
`db-migrate`, deployed by
[Orun](https://github.com/sourceplane/orun) to stage and prod on every merge.
Packaging it as an Orun baseline is the next milestone (AD2).

The template's code is the code. What the port changes is what the Workers
runtime and a fresh, unattended deployment force: the Postgres client is
built per request over the Hyperdrive binding (`lib/sql.ts`); the table, the
template's ten products and the key Auth.js signs sessions with are
migrations applied before the app serves, where upstream had its owner
create the table by hand, request a seed route and set `AUTH_SECRET`; and
GitHub sign-in is connected by the owner after the build, the dashboard
serving signed-out until then. Next.js moves from 15 to 16.3.8 so the
template's middleware, now the proxy, can read the session key from
Postgres. Every table in `public` has row-level security, so Supabase's Data
API serves none of it.
See [`specs/epics/admin-dashboard`](specs/epics/admin-dashboard/README.md)
for the design, the milestones and the as-built status, including every
departure.

## What is here (the product)

| Surface | Where |
|---|---|
| The product's name (the page title and the dashboard's home link) | `apps/web/lib/site.ts` |
| The dashboard: products, customers, search, the user menu; the login page | `apps/web/app/(dashboard)`, `apps/web/app/login` |
| Auth.js: its config, the session key, GitHub sign-in, the proxy | `apps/web/lib/auth.ts`, `apps/web/lib/auth-secret.ts`, `apps/web/lib/github.ts`, `apps/web/proxy.ts` |
| The client (Hyperdrive first, `POSTGRES_URL` fallback), the schema, the queries | `apps/web/lib/sql.ts`, `apps/web/lib/schema.ts`, `apps/web/lib/db.ts` |
| The database check the deploy smoke-tests | `apps/web/app/api/health/route.ts` |
| Workers build, bindings and deploy contract | `apps/web/next.config.mjs`, `open-next.config.ts`, `wrangler.template.jsonc` → `wrangler.jsonc` (committed), `component.yaml` |
| The schema, the seed and the session key as migrations, and Lumen's runner | `packages/db` (`@saas/db` — the name the db-migrate composition builds); `apps/web/lib/migrations` is the same SQL for drizzle-kit |
| The Supabase project, the Hyperdrive config, the migration step | `infra/terraform/supabase`, `infra/terraform/cloudflare-hyperdrive`, `infra/db-migrate` |
| Tests | `tests/web`, `tests/db` (vitest; `tests/db` runs the migrations in PGlite) |

## Getting started

```bash
pnpm install
pnpm run wire:fixture   # re-render apps/web/wrangler.jsonc from its template (committed; this changes nothing)
pnpm typecheck
pnpm lint
pnpm test
pnpm build              # next build + opennextjs-cloudflare build → apps/web/.open-next
```

The build needs no database. Running it locally — a Postgres on
`localhost:54322` (`supabase start`), `pnpm --filter @app/web db:migrate`,
then `next dev` or `wrangler dev` — is in the product's README
(`.baseline/product/README.md`), which is what a product built from here
carries.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Next.js 15 hosting | One Cloudflare Worker (`.open-next/worker.js`) + Static Assets, on Next.js 16.3.8 |
| Vercel Postgres (`POSTGRES_URL`), a module-level client | The Supabase project's Postgres through Hyperdrive: `getSql()` builds a `postgres` client per request from `env.HYPERDRIVE.connectionString`; `POSTGRES_URL` is for local work without wrangler |
| A table created by hand in the dashboard, then `/api/seed` | `infra/db-migrate` applies `packages/db/src/migrations` per environment — the table, row-level security, the template's ten products, the session key — after the project and the Hyperdrive config exist, before the Worker deploys; there is no seed route |
| `AUTH_SECRET`, set by the owner | Generated once per database into `app_private.secrets`; an `AUTH_SECRET` Worker secret overrides it |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Optional Orun secrets per environment, read at build; unset, no sign-in and a login page that says how to connect GitHub |
| `middleware.ts` (edge) | `proxy.ts` (Node.js), so it can read the session key from Postgres |
| A database created in the dashboard | `infra/terraform/supabase` (one project per environment) + `infra/terraform/cloudflare-hyperdrive` (one config per environment), ids and credentials as orun secrets |
| Vercel Analytics | Removed |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, provisioned, migrated, deployed |

## CI

| Workflow | What it runs | Ships to a product |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow a product carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the app built and dry-deployed per environment, both Terraform roots checked and planned, the migrations planned), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone runs and nothing waits for it — the landing was checked in the build box; a merge applies, migrates and deploys stage → prod. The lanes do not typecheck, lint or run the tests: `baseline.yml`'s e2e tier does, on the landing, before each tag. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
