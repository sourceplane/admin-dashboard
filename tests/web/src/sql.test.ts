import { beforeEach, describe, expect, it, vi } from "vitest";

// The connection string comes from the HYPERDRIVE binding on the Worker and
// from POSTGRES_URL elsewhere — a new client per call, never one at module
// scope (the template's `drizzle(neon(process.env.POSTGRES_URL!))`).
const ctx = { env: {} as { HYPERDRIVE?: { connectionString: string } } };
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: async () => ctx,
}));
const postgresMock = vi.fn((cs: string) => ({ connectionString: cs }));
vi.mock("postgres", () => ({ default: postgresMock }));

beforeEach(() => {
  postgresMock.mockClear();
  ctx.env = {};
  delete process.env.POSTGRES_URL;
});

describe("getSql (lib/sql.ts)", () => {
  it("uses the Hyperdrive binding on the Worker", async () => {
    ctx.env = { HYPERDRIVE: { connectionString: "postgres://hyperdrive/db" } };
    const { getSql } = await import("@/lib/sql");
    await getSql();
    expect(postgresMock).toHaveBeenCalledWith("postgres://hyperdrive/db", expect.objectContaining({ prepare: false }));
  });

  it("falls back to POSTGRES_URL without a binding", async () => {
    process.env.POSTGRES_URL = "postgres://local/db";
    const { getSql } = await import("@/lib/sql");
    await getSql();
    expect(postgresMock).toHaveBeenCalledWith("postgres://local/db", { ssl: "require" });
  });

  it("builds a new client on every call", async () => {
    ctx.env = { HYPERDRIVE: { connectionString: "postgres://hyperdrive/db" } };
    const { getSql } = await import("@/lib/sql");
    await getSql();
    await getSql();
    expect(postgresMock).toHaveBeenCalledTimes(2);
  });
});
