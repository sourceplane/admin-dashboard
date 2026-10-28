import type { MigrationManifest } from "./types.js";

// Every migration the runner applies, in order, with the sha256 of its file.
// `pnpm --filter @saas/db run manifest:check` verifies the checksums;
// `manifest:fix` rewrites them after a migration file changes (only ever
// before that migration has been applied anywhere — an applied migration's
// checksum is immutable).
export const manifest: MigrationManifest = {
  version: 1,
  migrations: [
    {
      id: "000_control_baseline",
      context: "control",
      path: "000_control/up.sql",
      checksum:
        "2a5d7f30684c99e3ff441ca8a2c38038dedd1bab4db4a40e92cd36bb22be297f",
      description:
        "Baseline control migration — creates the migration tracking schema",
    },
    {
      id: "010_products",
      context: "app",
      path: "010_products/up.sql",
      checksum:
        "4ea82a1c0a09bcd0722b8730240289ef86231a64c668148a15b8cb605131042c",
      description:
        "The template's products table and its status enum, as lib/schema.ts declares them (drizzle-kit's output, made idempotent) — applied before the Worker serves instead of created by hand in a dashboard; lib/migrations/0000_products.sql is the same SQL for drizzle-kit",
    },
    {
      id: "020_row_level_security",
      context: "app",
      path: "020_row_level_security/up.sql",
      checksum:
        "9d7a97c80f60c407f98dd32d385127cded8a199b07c600f609fdc30048eddda8",
      description:
        "Row-level security, with no policies, on every table in public — closed to Supabase's Data API (anon, authenticated), open to the app, which owns them; refuses to run if the app's role would be locked out. lib/migrations/0001_row_level_security.sql is the same SQL for drizzle-kit",
    },
    {
      id: "030_seed_products",
      context: "app",
      path: "030_seed_products/up.sql",
      checksum:
        "e8a5df3a4609e34befa7624170f06689714aa6def9f29028559bc93228253d7d",
      description:
        "The template's ten products, from its /api/seed route, written once per environment before the Worker deploys (the route is gone); the id sequence moved past them. lib/migrations/0002_seed_products.sql is the same SQL for drizzle-kit",
    },
    {
      id: "040_app_secrets",
      context: "app",
      path: "040_app_secrets/up.sql",
      checksum:
        "49fcb09dccfd4679a63a94fe9c975ee03167880ea2e9d6231e4195b59751ff02",
      description:
        "app_private.secrets, and the session key a fresh environment starts with (apps/web/lib/auth-secret.ts); lib/migrations/0003_app_secrets.sql is the same SQL for drizzle-kit",
    },
  ],
};
