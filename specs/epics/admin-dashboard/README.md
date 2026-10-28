# admin-dashboard — Vercel's Admin Dashboard on Cloudflare

**The template's dashboard as it is — the products table, search and paging,
the customers page, Auth.js with GitHub, shadcn/ui — on one Cloudflare
Worker, its Postgres a Supabase project behind Hyperdrive, the schema, the
seed and the session key applied before the Worker deploys; and the
baseline that makes a copy of it somebody else's product in one landing.**

| | |
|---|---|
| Status | In progress — AD1 on main: the site runs on Workers |
| Upstream | [vercel/nextjs-postgres-nextauth-tailwindcss-template](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template) (MIT), Vercel's [Admin Dashboard](https://vercel.com/templates/next.js/admin-dashboard), at `fe02671` |
| Reference | [postgres-drizzle-starter](https://github.com/sourceplane/postgres-drizzle-starter) — Supabase through Hyperdrive, migrations, db-migrate, row-level security; [ai-chatbot](https://github.com/sourceplane/ai-chatbot) — Auth.js on Workers, the session key generated in the database |
| Key | `AD` |

## Read in this order

1. [design.md](design.md) — the template, how each Vercel piece maps to
   Cloudflare and Supabase, the repository and the build, and the
   alternatives rejected.
2. [implementation-plan.md](implementation-plan.md) — the milestones.
3. [risks-and-open-questions.md](risks-and-open-questions.md) — what is not
   proven, and what was accepted.
4. [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) — what shipped, and
   every departure from the upstream template.

## Milestones

| Milestone | What it lands | Task |
|---|---|---|
| AD0 — the spec | the repository, its intent, CI, tooling and spec index; this doc set | AD-1 |
| AD1 — the dashboard on Workers and Supabase | the template in `apps/web`, its schema, products and session key as migrations, the Supabase and Hyperdrive roots, the tests | AD-2 |
| AD2 — a baseline | the console card, the build document, the context pack and the baseline's tests | AD-3 |
