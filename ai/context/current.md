# admin-dashboard — where this repository stands

The entry page for anyone (or any agent) picking this repository up. It is
this repository's own state and does not ship to a product built from it;
the two pages that do are [operations.md](operations.md) and
[deployment.md](deployment.md).

## What it is

Vercel's Admin Dashboard template — a products table with search and paging
read through Drizzle, a customers page, Auth.js with GitHub sign-in — on
Cloudflare Workers + Static Assets, with the database a Supabase Postgres
project reached through Hyperdrive, packaged as an Orun baseline: `orun new
--blueprint repo-blueprint.yaml` builds a new product in its own repository
and takes it to live on stage and prod in one landing (`01-product`:
supabase → cloudflare-hyperdrive → db-migrate → web per environment), then
records what went live (`02-docs`). GitHub sign-in is the owner's to connect
afterwards; until then the dashboard serves signed-out.

## Release

| | |
|---|---|
| Latest tag | `baseline-v1` — AD0 to AD2: the repository, the dashboard on Workers and Supabase, and the baseline (blueprint, phases, tests) |
| Proven live | Not yet: proven offline in Baseline CI only (risk AD-A) |

## Where to read

| Question | Page |
|---|---|
| What shipped, and every departure from upstream | `specs/epics/admin-dashboard/IMPLEMENTATION-STATUS.md` |
| Why it is built this way | [decisions.md](decisions.md), then `specs/epics/admin-dashboard/design.md` |
| What could still go wrong | [open-risks.md](open-risks.md), then `specs/epics/admin-dashboard/risks-and-open-questions.md` |
| How to instantiate it | `BOOTSTRAP.md`, `docs/phases/` |
| What each component is | `<component>/docs/` beside each `component.yaml` — `apps/web`, `packages/db`, `infra/db-migrate`, `infra/terraform/{supabase,cloudflare-hyperdrive}`, `tests/{web,db}` (generated; `python3 tooling/catalog/gen-component-docs.py`) |

## Next

1. Bootstrap one product from `baseline-v1` against a workspace with
   Cloudflare and Supabase connections and room for two Supabase projects
   (AD-E), connect a GitHub OAuth App on stage, sign in, and record the
   timings (closes AD-A).
