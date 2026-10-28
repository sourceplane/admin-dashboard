-- The same SQL as packages/db/src/migrations/040_app_secrets/up.sql (which
-- says why), for drizzle-kit (`pnpm db:migrate`) against a local database.
-- A custom migration (`drizzle-kit generate --custom`): app_private is not a
-- schema lib/schema.ts declares.
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE TABLE IF NOT EXISTS app_private.secrets (
  name       TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The session-signing key a fresh environment starts with: 64 hex characters
-- from two v4 UUIDs, which gen_random_uuid() draws from pg_strong_random. An
-- AUTH_SECRET Worker secret, once an owner sets one, takes precedence.
INSERT INTO app_private.secrets (name, value)
VALUES ('auth_secret', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
ON CONFLICT (name) DO NOTHING;
