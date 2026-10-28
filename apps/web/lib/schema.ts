import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';

// The template's schema, as its lib/db.ts declared it. drizzle-kit reads this
// file (drizzle.config.ts), so it imports nothing but drizzle.
//
// The table lives in `public`, which Supabase's Data API (PostgREST) serves to
// anyone holding the project's anon key. It has row-level security ENABLED and
// no policy, so `anon` and `authenticated` read and write nothing through that
// API, while the app — which connects through Hyperdrive as the table's owner —
// is not subject to it. `.enableRLS()` is how drizzle-kit writes that into the
// migration; a new table declares it too, and tests/db fails on a table in
// `public` without it.
//
// The table is created and seeded by the migrations (packages/db, applied by
// db-migrate before the Worker deploys; `pnpm db:migrate` locally), never by a
// request: the template's /api/seed route is gone.
export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
}).enableRLS();

export type SelectProduct = typeof products.$inferSelect;
