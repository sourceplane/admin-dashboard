# admin-dashboard — implementation status

| Milestone | State | Landed |
|---|---|---|
| AD0 — the spec | ✅ | AD-1 |
| AD1 — the dashboard on Workers and Supabase | ✅ | AD-2 |
| AD2 — a baseline | ✅ | AD-3, tagged `baseline-v1` |

## Departures from the upstream template

Everything not listed here is the template as it is at `fe02671`.

| # | What | Why |
|---|---|---|
| 1 | The app lives in `apps/web` of a pnpm workspace; `.env.example` rewritten for the local database and the optional keys; `LICENSE.md` kept beside it | The reference's shape |
| 2 | Next.js 15 → 16.3.8, React 19.0 → 19.2; `middleware.ts` → `proxy.ts` (same matcher) | The proxy reads the session key from Postgres, which needs the Node.js runtime; 16.3.8 is the reference's pin (design, Alternatives) |
| 3 | `lib/db.ts`: the module-level `drizzle(neon(POSTGRES_URL))` → `getDb()` over `lib/sql.ts`'s per-request client (the `HYPERDRIVE` binding, `POSTGRES_URL` without one); the schema moved to `lib/schema.ts` with `.enableRLS()`; the unused `insertProductSchema` (drizzle-zod) dropped; drizzle-orm 0.31 → 0.45 over `postgres` instead of `@neondatabase/serverless` | No socket outlives a request on Workers; drizzle-kit reads the schema without `server-only` |
| 4 | `app/api/seed/route.ts` removed; its ten products are migration `030_seed_products` | A seed route is a request anybody can make |
| 5 | `lib/auth.ts` resolves its config per request: the secret from `lib/auth-secret.ts` (AUTH_SECRET, else `app_private.secrets`), GitHub only when `lib/github.ts` has both keys, `trustHost: true` | Nothing to type at bootstrap; the OAuth App is the owner's to create; Auth.js trusts the host only on Vercel by default |
| 6 | `/login` says how to connect GitHub, its button disabled, until the OAuth App is set | The template assumed the keys |
| 7 | `app/(dashboard)/error.tsx` names the migrations instead of the Vercel Postgres dashboard (and upstream's stale `users` table) | The table is the migrations' |
| 8 | `@vercel/analytics` removed from both layouts | Vercel's |
| 9 | `lib/site.ts` (`SITE_NAME`) for the page title and the dashboard's home-link labels (`Acme Inc`, `Vercel`) | One rename seam |
| 10 | `next.config.mjs`: `images.unoptimized`, `output: 'standalone'`, the trace root at the workspace root, `env` for the GitHub keys; `open-next.config.ts`, `wrangler.template.jsonc`, `cloudflare-env.d.ts` added | OpenNext's build |
| 11 | `tailwind.config.ts` imports `tailwindcss-animate` instead of `require`-ing it | ESLint's `no-require-imports` |
| 12 | `eslint.config.mjs` (none upstream) in eslint-config-next 16's flat form, with `prefer-const`, `no-empty-object-type` and `no-explicit-any` off | Upstream's `let`s and shadcn/ui's `InputProps` and `formAction?: any`, as written |
| 13 | The `prettier` dependency dropped (its config kept in `package.json`) | Nothing runs it |

## Departures from the reference

| # | What | Why |
|---|---|---|
| 1 | The build takes no origin (`NEXT_PUBLIC_SITE_URL` / `SITE_URL` gone) | The template renders no absolute URL; Auth.js reads the origin from each request |
| 2 | The seed is a migration, not a first-request write; the e2e races eight first requests through the proxy's read of the session key instead | No page writes |
| 3 | `apps/web` declares `optionalSecretEnv` (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`); placement checks they are optional in the product's own plan and no other ref is | GitHub sign-in is connected after the build |
| 4 | The record also probes `/api/auth/providers` (GitHub connected or not) | The one thing an owner adds |
| 5 | The rename engine masks Vercel's page for the template (`vercel.com/templates/next.js/admin-dashboard…`) | It spells this baseline's slug |

## Verified

- `pnpm typecheck`, `lint`, `test` (tests/web 31, tests/db 18) and `build`
  green; the Worker is 2.0 MiB gzipped (Workers Free).
- Every contract tier, the leak gate and the placement tier pass locally on
  orun v2.89.0. The e2e tier needs a PostgreSQL server (initdb, pg_ctl,
  psql), which this build's machine did not have: it ran on Baseline CI,
  where every pull request ran it before it merged.
