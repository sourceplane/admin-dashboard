import { getSql } from '@/lib/sql';

// Not upstream's: the deploy's smoke check and the bootstrap's probes read
// this. The home page proves the Worker deployed; this proves what a page
// render cannot say on its own — the HYPERDRIVE binding names a real config,
// Hyperdrive reaches the Supabase database, and db-migrate applied the schema:
// the `products` table exists with row-level security on, and the session key
// the database generates for itself is there (lib/auth-secret.ts). The proxy
// does not run for /api, so this answers even when that key is missing.
export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'cache-control': 'no-store' };
  try {
    const sql = await getSql();
    const [row] = await sql<
      { products: string | null; rls: boolean; secrets: boolean }[]
    >`
      select to_regclass('public.products')::text as products,
             coalesce((select relrowsecurity from pg_class
                        where oid = to_regclass('public.products')), false) as rls,
             to_regclass('app_private.secrets') is not null as secrets`;
    let ok = Boolean(row?.products) && row?.rls === true && row?.secrets === true;
    if (ok) {
      // A second query: the first cannot name app_private.secrets before it
      // knows the table exists.
      const [key] = await sql<{ present: boolean }[]>`
        select exists (select 1 from app_private.secrets
                        where name = 'auth_secret') as present`;
      ok = key?.present === true;
    }
    return Response.json(
      { ok, database: 'reachable', schema: ok ? 'migrated' : 'missing' },
      { status: ok ? 200 : 503, headers }
    );
  } catch (error) {
    console.error('health: database check failed', error);
    return Response.json(
      { ok: false, database: 'unreachable' },
      { status: 503, headers }
    );
  }
}
