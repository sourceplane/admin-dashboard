# admin-dashboard — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/admin-dashboard/risks-and-open-questions.md`; this page
lists only what is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| AD-A | No live bootstrap yet: the repository created and linked, the five keys minted, real Terraform applies of the Supabase projects and Hyperdrive configs, a `db-migrate` apply against a real Supabase project, a real `wrangler deploy`, the Node.js proxy on a deployed Worker, GitHub sign-in against a real OAuth App and the probes are all unproven | OPEN | One bootstrap from a tag against a workspace with Cloudflare and Supabase connections, then a GitHub OAuth App connected on stage |

Accepted, and worth knowing before you change them: AD-B (the Node.js proxy
on OpenNext is experimental), AD-C (`next-auth` beta.25 under Next.js 16),
AD-D (the GitHub OAuth App's secret is inlined into the server bundle), AD-E
(two Supabase projects per product — an owner prerequisite on the free
plan), AD-H (the session key lives in the database).
