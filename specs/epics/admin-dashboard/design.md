# admin-dashboard — design

## The template

Vercel's Admin Dashboard ([vercel/nextjs-postgres-nextauth-tailwindcss-template](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template))
is a Next.js 15 App Router app: a dashboard layout (a sidebar, a mobile
sheet, breadcrumbs, a search box and a user menu) around a products page — a
`products` table with a `status` enum read through Drizzle, five rows a page
with the total, and a search by name over the whole table — and an empty
customers page, all in shadcn/ui and Tailwind CSS. Auth.js (`next-auth`
5.0.0-beta.25) signs visitors in with GitHub (JWT sessions, no database
adapter) and runs as the middleware on every page; the dashboard itself is
visible signed-out, the user menu offering Sign In or Sign Out. On Vercel it
uses Vercel Postgres through `@neondatabase/serverless`, a module-level
client; its owner creates the table by hand in the Postgres dashboard, then
uncomments `/api/seed` and requests it once for ten demo products, and sets
`AUTH_SECRET`, `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`. Vercel Analytics is
in both layouts.

## How it maps to Cloudflare and Supabase

| Vercel | Here | Why |
|---|---|---|
| Next.js hosting | One Worker (`.open-next/worker.js`) + Static Assets, built by `@opennextjs/cloudflare` | The reference's shape |
| Vercel Postgres, `drizzle(neon(POSTGRES_URL))` at module scope | A Supabase project's Postgres through the `HYPERDRIVE` binding: `getSql()` builds a `postgres` client per call, `getDb()` wraps it in Drizzle | The Workers runtime refuses to reuse a socket across requests (the reference's decision 1) |
| The table created by hand | `packages/db`'s `010_products` (drizzle-kit's output, idempotent), applied by `infra/db-migrate` before the Worker deploys, and `020_row_level_security` | One schema, applied in order, recorded in a ledger |
| `/api/seed`, uncommented and requested once | `030_seed_products`: the same ten rows, keyed on their ids, the `serial` sequence moved past them | Nobody has to request a route, and no route is left for anybody else to request |
| `AUTH_SECRET`, set by the owner | `040_app_secrets` generates 64 hex characters into `app_private.secrets` once per database; `lib/auth-secret.ts` reads it (once per isolate) unless `AUTH_SECRET` is a Worker secret | A product comes up with nothing typed; ai-chatbot's AC5 |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Optional Orun secrets per environment, inlined into the server bundle at build (`next.config.mjs` `env`); unset, Auth.js has no provider and `/login` says how to connect GitHub | Only the owner can create an OAuth App, and the product must deploy before they do |
| `middleware.ts` (Auth.js on every page, edge runtime) | `proxy.ts`, on Next.js 16's Node.js runtime | The proxy must read the session key from Postgres, which the edge runtime cannot reach |
| Next.js 15 | Next.js 16.3.8 | The reference's pin and the one OpenNext proxies run on (ai-chatbot); see Alternatives |
| Vercel's image optimiser | `images.unoptimized`: the product photos (still on Vercel Blob, as the template hosts them) and GitHub avatars load from their hosts | No optimiser on Workers |
| Vercel Analytics | Removed | Vercel's |
| "Deploy with Vercel" | `orun new --blueprint repo-blueprint.yaml` | One landing to live |

Every table in `public` has row-level security and no policy, and the
session key is in `app_private`, so Supabase's Data API — which serves
`public` to the project's public anon key — reads nothing; the app connects
as the tables' owner and is not subject to it.

## The repository

postgres-drizzle-starter's shape: `infra/terraform/supabase` (one project
per deployed environment, its credentials lease-published),
`infra/terraform/cloudflare-hyperdrive` (one config over it, its id
published as `WIRING_CLOUDFLARE_HYPERDRIVE`), `packages/db` (`@saas/db`: the
migrations and Lumen's runner, through Supabase's Management API),
`infra/db-migrate`, `apps/web` (type `cloudflare-workers-assets-turbo`,
depending on Hyperdrive and db-migrate, enforced on main), `tests/web` and
`tests/db`. The product's name is one seam, `SITE_NAME` in
`apps/web/lib/site.ts`: the page title and the dashboard's home link (the
template's `Acme Inc` and `Vercel` labels). Vercel's page for the template
is `…/templates/next.js/admin-dashboard…`, this baseline's slug, so the
rename engine masks it (`UPSTREAM` in `tooling/rebrand/rebrand.mjs`).

## The build

`next build` (Turbopack), `opennextjs-cloudflare build`, then the
static-assets cache populated. `/login` is pre-rendered (the GitHub keys are
build-time values); every other page renders per request. The build takes
no origin: nothing the dashboard renders is an absolute URL, and Auth.js
reads the origin from each request (`trustHost`). The Worker is about
2.0 MiB gzipped — Workers Free.

`repo-blueprint.yaml` is postgres-drizzle-starter's: one landing
(`01-product`), one convergence that applies the Supabase project, the
Hyperdrive config and the migrations, and deploys stage and prod side by
side, then `02-docs`, the record, which also probes whether GitHub sign-in
is connected. The smoke checks the dashboard's products card and
`/api/health`.

## Alternatives rejected

- **Keep Next.js 15 and its edge middleware.** The middleware needs the
  session key, which lives in Postgres; the edge runtime has no TCP socket
  for `postgres`. Next.js 15.5's Node.js middleware on OpenNext is no better
  proven than 16's proxy, and 16.3.8 is what the reference and ai-chatbot
  already run.
- **A seed route kept for the owner.** Anyone could request it; a migration
  runs once, before the Worker serves.
- **GitHub keys as Worker secrets.** The workers-assets composition does not
  push runtime secrets, and a key set with `wrangler secret put` is outside
  the repository's secrets; inlining at build is how the other SaaS-key
  starters do it (cms-contentful).
- **Drop the proxy.** It only refreshes the session cookie, but it is the
  template's, and keeping it costs one cached read per isolate.

## Out of scope

- Real product actions. Upstream's delete action is commented out and its
  Add Product and Export buttons do nothing; they are kept as they are.
- A users table or an Auth.js database adapter: upstream has none.
