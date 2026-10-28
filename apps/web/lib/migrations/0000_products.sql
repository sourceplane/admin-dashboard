-- The same SQL as packages/db/src/migrations/010_products/up.sql (which says
-- why), for drizzle-kit (`pnpm db:migrate`) against a local database.
-- drizzle-kit's own output for lib/schema.ts, made idempotent (IF NOT EXISTS,
-- the enum in a block that ignores the duplicate).
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
