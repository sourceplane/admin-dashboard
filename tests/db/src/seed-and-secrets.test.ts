import { beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { manifest } from "@saas/db/manifest";

// What a fresh environment's database holds once db-migrate has run, before
// the Worker serves its first request: the template's ten products (030), the
// id sequence past them, and a session key of its own (040) — each migration
// idempotent, so a second apply changes none of it. Every migration, in the
// manifest's order, on a real Postgres in process (PGlite).
const migrationsDir = path.resolve(__dirname, "../../../packages/db/src/migrations");
const sqlOf = (rel: string) => readFileSync(path.join(migrationsDir, rel), "utf8");

async function migrate(db: PGlite) {
  for (const entry of manifest.migrations) {
    await db.exec(sqlOf(entry.path));
  }
}

describe("a freshly migrated database", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = new PGlite();
    await migrate(db);
  }, 60_000);

  it("holds the template's ten products, every one active", async () => {
    const { rows } = await db.query<{ id: number; name: string; status: string; price: string }>(
      "select id, name, status, price::text as price from products order by id",
    );
    expect(rows.map((r) => r.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(rows[0]).toEqual({ id: 1, name: "Smartphone X Pro", status: "active", price: "999.00" });
    expect(rows[9]).toMatchObject({ name: "Smart Thermostat Pro" });
    expect(new Set(rows.map((r) => r.status))).toEqual(new Set(["active"]));
  });

  it("gives the next product an id past the seeded ones", async () => {
    const { rows } = await db.query<{ id: number }>(
      "insert into products (image_url, name, status, price, stock, available_at) values ('x', 'Next', 'inactive', 1, 1, now()) returning id",
    );
    expect(rows[0]!.id).toBe(11);
    await db.exec("delete from products where id = 11");
  });

  it("holds a 64-hex session key in app_private, outside the Data API's public", async () => {
    const { rows } = await db.query<{ value: string }>("select value from app_private.secrets where name = 'auth_secret'");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.value).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes nothing on a second apply: the same products, the same key", async () => {
    const before = await db.query<{ value: string }>("select value from app_private.secrets where name = 'auth_secret'");
    await migrate(db);
    const after = await db.query<{ value: string }>("select value from app_private.secrets where name = 'auth_secret'");
    expect(after.rows).toEqual(before.rows);
    const count = await db.query<{ n: number }>("select count(*)::int as n from products");
    expect(count.rows[0]!.n).toBe(10);
  });

  it("generates a different key in every database", async () => {
    const other = new PGlite();
    await migrate(other);
    const a = await db.query<{ value: string }>("select value from app_private.secrets");
    const b = await other.query<{ value: string }>("select value from app_private.secrets");
    expect(b.rows[0]!.value).not.toBe(a.rows[0]!.value);
  }, 60_000);
});
