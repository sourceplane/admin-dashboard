import { beforeEach, describe, expect, it, vi } from "vitest";

// /api/health is what the deploy's smoke and the bootstrap's probes read: 200
// only when the database answers through the binding and the migrations have
// run — the products table exists with row-level security on, and the session
// key the migrations generate is in app_private.secrets.
let answers: Array<() => Promise<unknown[]>>;
vi.mock("@/lib/sql", () => ({
  getSql: async () => () => {
    const next = answers.shift();
    if (!next) throw new Error("health asked the database more than the test expected");
    return next();
  },
}));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

async function health() {
  const { GET } = await import("@/app/api/health/route");
  const res = await GET();
  const body = (await res.json()) as { ok: boolean; database: string; schema?: string };
  return { status: res.status, body, cache: res.headers.get("cache-control") };
}

const migrated = async () => [{ products: "products", rls: true, secrets: true }];

describe("GET /api/health (app/api/health/route.ts)", () => {
  it("is ok when the table exists with row-level security and the session key is there", async () => {
    answers = [migrated, async () => [{ present: true }]];
    expect(await health()).toEqual({
      status: 200,
      body: { ok: true, database: "reachable", schema: "migrated" },
      cache: "no-store",
    });
  });

  it("is 503 when the migrations have not run", async () => {
    answers = [async () => [{ products: null, rls: false, secrets: false }]];
    const r = await health();
    expect(r.status).toBe(503);
    expect(r.body).toEqual({ ok: false, database: "reachable", schema: "missing" });
  });

  it("is 503 when the table is there without row-level security", async () => {
    answers = [async () => [{ products: "products", rls: false, secrets: true }]];
    const r = await health();
    expect(r.status).toBe(503);
    expect(r.body.schema).toBe("missing");
  });

  it("is 503 when the session key was never generated", async () => {
    answers = [migrated, async () => [{ present: false }]];
    const r = await health();
    expect(r.status).toBe(503);
    expect(r.body.schema).toBe("missing");
  });

  it("is 503 when the database is unreachable", async () => {
    answers = [
      async () => {
        throw new Error("connection refused");
      },
    ];
    const r = await health();
    expect(r.status).toBe(503);
    expect(r.body).toEqual({ ok: false, database: "unreachable" });
  });
});
