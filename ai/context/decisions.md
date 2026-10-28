# admin-dashboard — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | A Postgres client per request (`getSql()`/`getDb()`), Hyperdrive's connection string first, `POSTGRES_URL` as the fallback without a Cloudflare context | The Workers runtime refuses to share a socket across requests; Hyperdrive pools on Cloudflare's side | `specs/epics/admin-dashboard/design.md`, postgres-drizzle-starter's decision 1 |
| 2 | Drizzle over a socket to Supabase Postgres through Hyperdrive, not Supabase's PostgREST client | The template's queries are Drizzle's; PostgREST would replace them | design.md |
| 3 | The `products` table, the template's ten products and the session key are `db-migrate`'s (`packages/db`), applied before the Worker deploys; `/api/seed` is gone | A seed route is a request anybody can make; a migration runs once, before anyone can | IMPLEMENTATION-STATUS (departure 4) |
| 4 | Row-level security on every table in `public`, with no policy; the session key in `app_private` | Supabase's Data API serves `public` to the public anon key; the app connects as the tables' owner | risk AD-H |
| 5 | The session key is `AUTH_SECRET` if set, else the one `040_app_secrets` generated | A bootstrap cannot set a Worker secret; each environment gets its own key, typed by nobody (ai-chatbot's AC5) | `apps/web/lib/auth-secret.ts`, risk AD-H |
| 6 | GitHub sign-in is optional and the owner's: `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` as optional Orun secrets inlined at build; unset, no provider and a login page that says how to connect one | Only the owner can create an OAuth App, and the product must deploy before they do | `apps/web/lib/github.ts`, `apps/web/component.yaml`, risk AD-D |
| 7 | Next.js 16.3.8 with `proxy.ts`, not the template's 15 with edge middleware; `next-auth` kept at the template's beta.25 | The proxy must read the session key from Postgres, which only the Node.js runtime can | design.md (Alternatives), risks AD-B, AD-C |
| 8 | The build takes no origin | Nothing the dashboard renders is absolute; Auth.js reads the origin from each request (`trustHost`) | IMPLEMENTATION-STATUS (reference departure 1) |
| 9 | `wrangler.jsonc` committed as the fixture render; stage and prod re-render it from their wiring document | The composition checks for it before the build | `apps/web/component.yaml` |
| 10 | One landing (`01-product`) then the record (`02-docs`); every edge `mode: enforced` on main, advisory on a pull request | One convergence runs supabase → cloudflare-hyperdrive → db-migrate → web per environment | `repo-blueprint.yaml`, `testing/placement.test.sh` |
| 11 | The migrations package is named `@saas/db` | stack-tectonic's db-migrate composition builds `--filter=@saas/db` | `packages/db/package.json` |
| 12 | `ci.yml` plans nothing while `intent.yaml` names `ws_CHANGE_ME` (the `linked` step) | A bootstrap cannot set a repository variable | `.github/workflows/ci.yml` |
| 13 | stack-tectonic 0.19.0, not 0.20.0 | 0.20.0's lane-scoped install is refused by Turbopack | `intent.yaml`, risk AD-I |
| 14 | orun is pinned only where it runs (the `orun-action` `version:` in each workflow); no kiox | One pin per place orun runs | the workflows |
| 15 | Component docs are generated from the manifests and checked in CI | A hand-written copy of the dependency graph, bindings and migrations drifts silently | `tooling/catalog/gen-component-docs.py` |
| 16 | The console card reads `subdomain` from the Cloudflare connection; only a hand-run build passes it | It belongs to the account and has one right answer | `blueprint.yaml` |
| 17 | The console asks for no domain; an empty `productdomain` brands the placeholder `<reponame>.example.com` | The app goes live on workers.dev and nothing in the build needs a domain | `repo-blueprint.yaml`, `tooling/rebrand/rebrand.mjs` |
| 18 | The turso-starter v8 shape on orun v2.88.0: no `checks.yml`; the brokered keys in one `secrets` reconcile; every component's generated pages attached; the task set-up in the background, each landing checked in the box (`checks: local`), the watch at 5 s | A bootstrap waits on nothing that does not need waiting for | `repo-blueprint.yaml`, `testing/phases.test.sh`, `testing/coverage.test.sh` |
| 19 | The rename engine masks Vercel's page for the template | `vercel.com/templates/next.js/admin-dashboard…` spells this baseline's slug | `tooling/rebrand/rebrand.mjs` (`UPSTREAM`) |
