# @app/web — the admin dashboard on Cloudflare Workers

Vercel's [Admin Dashboard](https://vercel.com/templates/next.js/admin-dashboard)
template, https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template ([demo](https://next-admin-dash.vercel.app/)):
a products table with search and paging read through
[Drizzle](https://github.com/drizzle-team/drizzle-orm), a customers page,
and [Auth.js](https://authjs.dev) with GitHub sign-in, in shadcn/ui and
Tailwind CSS. Here it is built by
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) into one
Worker plus Static Assets, and its Postgres is reached through the Worker's
`HYPERDRIVE` binding.

| File | What it does |
|---|---|
| `lib/site.ts` | The product's name: the page `<title>` and the dashboard's home link |
| `lib/sql.ts` | `getSql()`: a `postgres` client per call — the `HYPERDRIVE` binding's connection string on the Worker, `POSTGRES_URL` without a Cloudflare context |
| `lib/schema.ts` | The `products` table and its `status` enum (with `.enableRLS()`), as upstream declared them |
| `lib/db.ts` | `getDb()` and upstream's queries: five products a page, the total, a search by name |
| `lib/auth.ts` | Upstream's Auth.js config (GitHub, JWT sessions), resolved per request |
| `lib/auth-secret.ts` | The session key: `AUTH_SECRET` when set, else the one the database generated (`app_private.secrets`) |
| `lib/github.ts` | GitHub sign-in, once its OAuth App's id and secret are both set (inlined at build) |
| `proxy.ts` | Upstream's middleware — Auth.js on every page — as Next.js 16's proxy |
| `app/(dashboard)`, `app/login` | Upstream's pages; `/login` says how to connect GitHub until it is |
| `app/api/health/route.ts` | 200 only when the database answers through the binding, the table exists with row-level security and the session key is there |
| `lib/migrations`, `drizzle.config.ts` | drizzle-kit, for a local database (`pnpm db:migrate`, `pnpm db:generate`); the deployed databases are migrated by db-migrate from `packages/db` — the same SQL |
| `wrangler.template.jsonc` → `wrangler.jsonc` | The Worker's config; the render is committed (`pnpm run wire:fixture`) |

The table, the template's ten products and the session key all come from
the migrations: upstream had its owner create the table by hand and request
a seed route, and set `AUTH_SECRET` themselves.

```bash
pnpm db:migrate     # the schema, the products and the session key, into POSTGRES_URL (default: the Supabase CLI's localhost:54322)
pnpm dev            # next dev, with the Worker's bindings through wrangler's platform proxy
pnpm build && pnpm preview   # the built Worker under wrangler dev
```
