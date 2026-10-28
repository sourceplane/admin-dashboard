-- The template's one table and its enum, as apps/web/lib/schema.ts declares
-- them (drizzle-kit's output for that schema; apps/web/lib/migrations/
-- 0000_products.sql is the same SQL for drizzle-kit against a local database).
--
-- Upstream had its owner create the table by hand in the Vercel Postgres
-- dashboard (the README's `CREATE TYPE … CREATE TABLE products`), then
-- uncomment and request /api/seed. Here the schema is applied before the
-- Worker deploys and the seed is a migration of its own (030_seed_products),
-- so a fresh environment serves the template's products on its first request
-- and there is no seed route to request.
--
-- Idempotent, as every migration here must be: the Supabase Management API
-- adapter sends each one in autocommit mode. CREATE TYPE has no IF NOT
-- EXISTS, so it is wrapped in a block that ignores the duplicate.
DO $$ BEGIN
  CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"name" text NOT NULL,
	"status" "status" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer NOT NULL,
	"available_at" timestamp NOT NULL
);
