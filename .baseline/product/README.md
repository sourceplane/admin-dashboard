# admin-dashboard

Vercel's [Admin Dashboard](https://vercel.com/templates/next.js/admin-dashboard)
template ([vercel/nextjs-postgres-nextauth-tailwindcss-template](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template))
— a products table with search and paging, read through Drizzle, behind
Auth.js with GitHub sign-in, in shadcn/ui and Tailwind — on **Cloudflare
Workers + Static Assets** through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
with its Postgres a **Supabase** project's database reached through
**Cloudflare Hyperdrive**. Terraform provisions both per environment and
Orun's `db-migrate` applies the schema, the template's products and the
session key, all on every merge to `main`.

## Live deployment

<!-- 02-docs:begin -->
Not recorded yet. The bootstrap's last phase writes the live URLs, the
workspace, what the database check reports, whether GitHub sign-in is
connected and the secrets the product uses into
[ai/context/deployment.md](ai/context/deployment.md); how the product deploys
and how to operate it is in
[ai/context/operations.md](ai/context/operations.md).
<!-- 02-docs:end -->

## What is here

| Surface | Where |
|---|---|
| The product's name (the page title and the dashboard's home link) | `apps/web/lib/site.ts` |
| The dashboard: products, customers, search, the user menu | `apps/web/app/(dashboard)` |
| The login page | `apps/web/app/login/page.tsx` |
| Auth.js: its config, the session key, GitHub sign-in, the proxy | `apps/web/lib/auth.ts`, `apps/web/lib/auth-secret.ts`, `apps/web/lib/github.ts`, `apps/web/proxy.ts` |
| The schema, the queries, the per-request client (Hyperdrive first, `POSTGRES_URL` fallback) | `apps/web/lib/schema.ts`, `apps/web/lib/db.ts`, `apps/web/lib/sql.ts` |
| The database check the deploy smoke-tests | `apps/web/app/api/health/route.ts` |
| Workers build and deploy contract | `apps/web/next.config.mjs`, `open-next.config.ts`, `wrangler.template.jsonc` → `wrangler.jsonc`, `component.yaml` |
| The schema, the seed and the session key as migrations, and their runner | `packages/db` (`@saas/db`); `apps/web/lib/migrations` is the same SQL for drizzle-kit |
| The Supabase project, the Hyperdrive config, the migration step | `infra/terraform/supabase`, `infra/terraform/cloudflare-hyperdrive`, `infra/db-migrate` |
| Tests | `tests/web`, `tests/db` (vitest) |

## Getting started

```bash
pnpm install
pnpm run wire:fixture   # re-render apps/web/wrangler.jsonc from its template (it is committed)
pnpm typecheck
pnpm lint
pnpm test
pnpm build              # next build + opennextjs-cloudflare build → apps/web/.open-next
```

The build needs no database: the dashboard renders per request.

## Running it locally

You need a Postgres on `localhost:54322` — the Supabase CLI's default
(`supabase start`) — or any Postgres whose URL you put in `POSTGRES_URL`.

1. **Schema, products and session key.** drizzle-kit applies the
   migrations to `POSTGRES_URL` (default
   `postgres://postgres:postgres@localhost:54322/postgres`):

   ```bash
   pnpm --filter @app/web db:migrate
   ```

   The same SQL lives in `packages/db/src/migrations`, which is what CI
   applies to the real databases: the products table, the template's ten
   products, and a session key the database generates for itself
   (`app_private.secrets`). Until the migrations have run, the dashboard
   says so.

2. **Run.** Either Next's dev server, which gets the Worker's bindings
   through `getCloudflareContext()` (the `HYPERDRIVE` binding points at
   `localhost:54322` through `wrangler.jsonc`'s `localConnectionString`):

   ```bash
   pnpm --filter @app/web dev          # http://localhost:3000
   ```

   or the built Worker under `wrangler dev`:

   ```bash
   pnpm build
   pnpm --filter @app/web preview      # http://localhost:8787
   ```

   `/api/health` says whether the database is reachable and migrated. For
   GitHub sign-in locally, put an OAuth App's id and secret in
   `apps/web/.env.local` (`.env.example` lists them; its callback URL is
   `http://localhost:3000/api/auth/callback/github`).

## Connecting GitHub sign-in

The dashboard deploys and serves before it has any sign-in: until its build
is given a GitHub OAuth App, Auth.js has no provider, every visitor is
signed out, and `/login` says how to connect one. To turn it on, per
deployed environment:

1. **Create a GitHub OAuth App** (GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App). Its homepage URL is the environment's URL,
   and its **authorization callback URL** is that URL plus
   `/api/auth/callback/github` — for stage,
   `https://admin-dashboard-web-stage.your-workers-subdomain.workers.dev/api/auth/callback/github`.
   Generate a client secret.
2. **Give the build the app**, as this repository's Orun secrets for that
   environment. `next build` bakes both into the server bundle (never into
   the browser's), and stage and prod each name their own:

   ```bash
   orun secrets set AUTH_GITHUB_ID      --env stage   # prompts for the value
   orun secrets set AUTH_GITHUB_SECRET  --env stage
   orun secrets set AUTH_GITHUB_ID      --env prod
   orun secrets set AUTH_GITHUB_SECRET  --env prod
   ```

3. **Redeploy the dashboard**: a secret is read when the dashboard builds,
   and setting one builds nothing. Use **Deploy by hand** below, or change
   the stamp on the last line of `apps/web/component.yaml`
   (`# orun: redeploy …`) and merge. From that deploy on, `/login` offers
   **Sign in with GitHub**.

Sessions are JWTs in a cookie, signed with a key each environment's database
generated for itself when the migrations first ran (`app_private.secrets`),
so there is no `AUTH_SECRET` to set. To rotate it, set one as a Worker
secret — it wins over the generated key, and every session ends:
`pnpm --filter @app/web exec wrangler secret put AUTH_SECRET --name admin-dashboard-web-<env>`
(32 or more random bytes).

## How it deploys

Merges to `main` converge through [Orun](https://github.com/sourceplane/orun):
`.github/workflows/ci.yml` plans the changed components and runs each lane
against the workspace in `intent.yaml`. Per environment the order is
enforced — **the Supabase project, then the Hyperdrive config over its
database, then the migrations, then the Worker** — because each reads what
the one before it published: the project's ref and password, the Hyperdrive
id the Worker binds, the table and the session key the dashboard reads.
`stage` deploys first and `prod` once stage has converged on the same
commit; `dev` only verifies. Every deploy is smoke-tested over HTTP: the
dashboard's products card, and `/api/health`, which answers only when the
Worker reaches a migrated database.

The pipeline holds one credential, GitHub's own `GITHUB_TOKEN`. The
Cloudflare tokens and account id and the Supabase access token and org id
are brokered per run from the workspace's connections; the Supabase
project's credentials and the Hyperdrive id are published by the Terraform
applies as orun secrets. Nothing provider-shaped is stored in the repository
or in GitHub. The only secrets the dashboard itself takes are GitHub
sign-in's, and those are yours to add.

Every table in `public` has row-level security and no policy, so Supabase's
Data API (which serves `public` to the project's anon key) returns none of
it, and the session key is in `app_private`, a schema the Data API does not
expose; the app connects as the table's owner and is not affected.

**Deploy by hand.** Orunbase's **Deploy** button on a component, or **Run
workflow** on the CI workflow in GitHub's Actions tab (on `main`), runs
`ci.yml` for the environment and components you pick, and each one deploys
exactly as a merge would deploy it. Leave the component blank to redeploy
every component in that environment, with nothing changed: after rotating a
secret, say. A component with nothing to run in that environment (a test
suite in `prod`) is left out with a notice.

## Custom domain

The app answers on workers.dev from its first deploy. To serve it on your
own domain, attach the domain to the Worker in Cloudflare (Workers & Pages →
`admin-dashboard-web-prod` → Settings → Domains & Routes). Nothing in the
build names the origin — Auth.js reads it from each request — so the
dashboard follows the domain at once. If GitHub sign-in is connected, change
the OAuth App's callback URL to the domain's `/api/auth/callback/github`.

The repository also names the domain in one place, `BASE_DOMAIN` under each
environment's `env:` in `intent.yaml`, which the product was born with as the
reserved placeholder `admin-dashboard.example.com`. Nothing builds a URL
from it, so replacing it moves nothing by itself; it records the domain.

## CI

| Workflow | What it runs |
|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes — the app built and dry-deployed for each environment, both Terraform roots checked and planned, the migrations planned and their checksums verified — with nothing applied or deployed. They do not typecheck, lint or run the tests: run `pnpm typecheck`, `pnpm lint` and `pnpm test` before you push (Getting started, above). A merge applies, migrates and deploys stage → prod |

## Credits

The dashboard is Vercel's Admin Dashboard template
([vercel/nextjs-postgres-nextauth-tailwindcss-template](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template),
MIT — `apps/web/LICENSE.md`).
